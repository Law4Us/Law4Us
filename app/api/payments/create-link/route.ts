import { NextRequest, NextResponse } from 'next/server';

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
    const fullName = body.fullName?.trim();
    const email = body.email?.trim();
    const phone = body.phone ? normalizeIsraeliPhone(body.phone) : '';
    const amount = Number(body.amount);
    const claimNames = Array.isArray(body.claimNames) ? body.claimNames : [];
    const sessionId = body.sessionId?.trim();

    if (!sessionId || !fullName || !email || !phone || !Number.isFinite(amount) || amount <= 0) {
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

    return NextResponse.json({
      success: true,
      paymentUrl,
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
