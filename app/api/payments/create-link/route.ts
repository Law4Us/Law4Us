import { NextRequest, NextResponse } from 'next/server';
import { calculateTotal, getClaimLabel } from '@/lib/constants/claims';
import {
  getWizardSession,
  updateSessionGrowPaymentReference,
} from '@/lib/services/wizard-session-service';
import type { ClaimType } from '@/lib/types';

type CreatePaymentLinkRequest = {
  sessionId?: string;
  fullName?: string;
  phone?: string;
  email?: string;
  amount?: number;
  claimNames?: string[];
};

function normalizeIsraeliPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');

  if (digits.startsWith('972')) {
    return `0${digits.slice(3)}`;
  }

  return digits;
}

function findPaymentUrl(value: unknown): string | null {
  if (typeof value === 'string') {
    return value.match(/https?:\/\/[^\s"'}]+/)?.[0] || null;
  }

  if (!value || typeof value !== 'object') {
    return null;
  }

  const record = value as Record<string, unknown>;
  const directKeys = [
    'paymentUrl',
    'paymentURL',
    'payment_link',
    'paymentLink',
    'link',
    'url',
    'href',
  ];

  for (const key of directKeys) {
    const directValue = record[key];

    if (typeof directValue === 'string' && directValue.startsWith('http')) {
      return directValue;
    }
  }

  for (const nestedValue of Object.values(record)) {
    const nestedUrl = findPaymentUrl(nestedValue);

    if (nestedUrl) {
      return nestedUrl;
    }
  }

  return null;
}

function normalizeLookupKey(key: string): string {
  return key.replace(/[\s_-]/g, '').toLowerCase();
}

function readString(value: unknown): string {
  return typeof value === 'string' || typeof value === 'number' ? String(value).trim() : '';
}

function findStringByAliases(value: unknown, aliases: string[]): string {
  const normalizedAliases = new Set(aliases.map(normalizeLookupKey));

  const find = (currentValue: unknown): string => {
    if (!currentValue || typeof currentValue !== 'object') {
      return '';
    }

    if (Array.isArray(currentValue)) {
      for (const item of currentValue) {
        const nestedValue = find(item);

        if (nestedValue) {
          return nestedValue;
        }
      }

      return '';
    }

    const record = currentValue as Record<string, unknown>;

    for (const [key, nestedValue] of Object.entries(record)) {
      if (normalizedAliases.has(normalizeLookupKey(key))) {
        const stringValue = readString(nestedValue);

        if (stringValue) {
          return stringValue;
        }
      }
    }

    for (const nestedValue of Object.values(record)) {
      const stringValue = find(nestedValue);

      if (stringValue) {
        return stringValue;
      }
    }

    return '';
  };

  return find(value);
}

function getGrowPaymentProcessId(value: unknown): string {
  return findStringByAliases(value, [
    'paymentLinkProcessId',
    'payment_link_process_id',
    'paymentLinkProcessID',
    'Payment Link Process ID',
    'processId',
    'process_id',
    'Process ID',
  ]);
}

function getGrowPaymentProcessToken(value: unknown): string {
  return findStringByAliases(value, [
    'paymentLinkProcessToken',
    'payment_link_process_token',
    'Payment Link Process Token',
    'processToken',
    'process_token',
    'Process Token',
  ]);
}

export async function POST(request: NextRequest) {
  try {
    const webhookUrl = process.env.MAKE_PAYMENT_LINK_WEBHOOK_URL;

    if (!webhookUrl) {
      return NextResponse.json(
        { success: false, message: 'Payment webhook is not configured' },
        { status: 500 }
      );
    }

    const body = (await request.json()) as CreatePaymentLinkRequest;
    const sessionId = body.sessionId?.trim();

    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: 'Missing required payment link fields' },
        { status: 400 }
      );
    }

    const session = await getWizardSession(sessionId);

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Payment session was not found' },
        { status: 404 }
      );
    }

    if (session.paymentStatus === 'paid') {
      return NextResponse.json(
        { success: false, message: 'Payment session is already paid' },
        { status: 409 }
      );
    }

    const basicInfo = session.wizardData.basicInfo || {};
    const selectedClaims = (session.wizardData.selectedClaims || []) as ClaimType[];
    const savedAmount = Number(session.totalAmount);
    const fallbackAmount = calculateTotal(selectedClaims);
    const amount =
      Number.isFinite(savedAmount) && savedAmount > 0 ? savedAmount : fallbackAmount;
    const fullName = (session.fullName || basicInfo.fullName || body.fullName || '').trim();
    const email = (session.email || basicInfo.email || body.email || '').trim();
    const rawPhone = session.phone || basicInfo.phone || body.phone || '';
    const phone = rawPhone ? normalizeIsraeliPhone(rawPhone) : '';
    const claimNames =
      Array.isArray(body.claimNames) && body.claimNames.length > 0
        ? body.claimNames
        : selectedClaims.map((claim) => getClaimLabel(claim));

    if (!fullName || !email || !phone || !Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { success: false, message: 'Missing required payment link fields' },
        { status: 400 }
      );
    }

    const makeResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        fullName,
        phone,
        email,
        amount,
        claimNames,
        description: `Law4Us - ${claimNames.join(', ') || 'תשלום עבור שירות משפטי'}`,
        successUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.law-4-us.co.il'}/payment/success?sessionId=${encodeURIComponent(sessionId)}`,
        cancelUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.law-4-us.co.il'}/wizard/step-4`,
      }),
    });

    const responseText = await makeResponse.text();
    let responseBody: unknown = responseText;

    try {
      responseBody = responseText ? JSON.parse(responseText) : {};
    } catch {
      responseBody = { raw: responseText };
    }

    if (!makeResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to create payment link',
          makeStatus: makeResponse.status,
          makeResponse: responseBody,
        },
        { status: 502 }
      );
    }

    const paymentUrl = findPaymentUrl(responseBody);
    const growPaymentProcessId = getGrowPaymentProcessId(responseBody);
    const growPaymentProcessToken = getGrowPaymentProcessToken(responseBody);

    if (!paymentUrl) {
      return NextResponse.json(
        {
          success: false,
          message: 'Make did not return a payment URL',
          makeResponse: responseBody,
        },
        { status: 502 }
      );
    }

    if (!growPaymentProcessId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Make did not return the Grow payment process ID',
          makeResponse: responseBody,
        },
        { status: 502 }
      );
    }

    await updateSessionGrowPaymentReference(
      sessionId,
      growPaymentProcessId,
      growPaymentProcessToken || undefined
    );

    return NextResponse.json({
      success: true,
      paymentUrl,
      growPaymentProcessId,
      growPaymentProcessToken,
      makeResponse: responseBody,
    });
  } catch (error) {
    console.error('Error creating payment link:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Error creating payment link',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
