import { NextRequest, NextResponse } from 'next/server';
import {
  getWizardSession,
  getWizardSessionByGrowPaymentProcess,
  updateSessionPaymentStatus,
  type WizardSession,
} from '@/lib/services/wizard-session-service';

type PaymentConfirmationBody = {
  sessionId?: string;
  transactionId?: string;
  transactionToken?: string;
  transactionCode?: string;
  asmachta?: string;
  paymentLinkProcessId?: string | number;
  paymentLinkProcessToken?: string | number;
  processId?: string | number;
  processToken?: string | number;
  status?: string;
  statusCode?: string | number;
  amount?: number;
  paymentSum?: number | string;
  sum?: number;
  data?: unknown;
  customFields?: unknown;
  purchaseCustomField?: unknown;
};

type GrowPaymentReference = {
  processId: string;
  processToken: string;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function readString(value: unknown): string {
  return typeof value === 'string' || typeof value === 'number' ? String(value).trim() : '';
}

function pickString(record: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = readString(record[key]);

    if (value) {
      return value;
    }
  }

  return '';
}

function normalizeLookupKey(key: string): string {
  return key.replace(/[\s_-]/g, '').toLowerCase();
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

function getCustomField1(body: PaymentConfirmationBody): string {
  const data = asRecord(body.data);
  const directCustomFields = asRecord(body.customFields);
  const dataCustomFields = asRecord(data.customFields);
  const directPurchaseFields = asRecord(body.purchaseCustomField);
  const dataPurchaseFields = asRecord(data.purchaseCustomField);

  return pickString(body as Record<string, unknown>, ['customField1', 'cField1', 'c_field_1', 'field1', 'C field 1'])
    || pickString(data, ['customField1', 'cField1', 'c_field_1', 'field1', 'C field 1'])
    || pickString(directCustomFields, ['cField1', 'c_field_1', 'field1', 'C field 1'])
    || pickString(dataCustomFields, ['cField1', 'c_field_1', 'field1', 'C field 1'])
    || pickString(directPurchaseFields, ['field1', 'cField1', 'c_field_1'])
    || pickString(dataPurchaseFields, ['field1', 'cField1', 'c_field_1']);
}

function getSessionId(body: PaymentConfirmationBody): string {
  const data = asRecord(body.data);

  return pickString(body as Record<string, unknown>, ['sessionId'])
    || pickString(data, ['sessionId'])
    || getCustomField1(body);
}

function getGrowPaymentReference(body: PaymentConfirmationBody): GrowPaymentReference {
  const processId = findStringByAliases(body, [
    'paymentLinkProcessId',
    'payment_link_process_id',
    'paymentLinkProcessID',
    'Payment Link Process ID',
    'processId',
    'process_id',
    'Process ID',
  ]);
  const processToken = findStringByAliases(body, [
    'paymentLinkProcessToken',
    'payment_link_process_token',
    'Payment Link Process Token',
    'processToken',
    'process_token',
    'Process Token',
  ]);

  return { processId, processToken };
}

function isPaidStatus(body: PaymentConfirmationBody): boolean {
  const data = asRecord(body.data);
  const statuses = [
    readString(body.status),
    readString(data.status),
    readString(body.statusCode),
    readString(data.statusCode),
  ].map((value) => value.toLowerCase()).filter(Boolean);

  if (statuses.length > 0) {
    return statuses.some((status) =>
      ['paid', 'success', 'successful', 'approved', 'completed', 'שולם', '1', '2'].includes(status)
    );
  }

  return Boolean(getTransactionId(body)) && getPaidAmount(body) !== null;
}

function getTransactionId(body: PaymentConfirmationBody): string | undefined {
  const data = asRecord(body.data);

  return pickString(body as Record<string, unknown>, ['transactionId', 'transactionToken', 'transactionCode', 'asmachta'])
    || pickString(data, ['transactionId', 'transactionToken', 'transactionCode', 'asmachta'])
    || undefined;
}

function getPaidAmount(body: PaymentConfirmationBody): number | null {
  const data = asRecord(body.data);
  const rawAmount =
    readString(body.amount)
    || readString(body.sum)
    || readString(body.paymentSum)
    || readString(data.amount)
    || readString(data.sum)
    || readString(data.paymentSum);
  const amount = Number(rawAmount.replace(/[^\d.]/g, ''));

  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

async function resolvePaymentSession(
  body: PaymentConfirmationBody
): Promise<{ session: WizardSession; processReference: GrowPaymentReference | null } | null> {
  const processReference = getGrowPaymentReference(body);

  if (processReference.processId) {
    const session = await getWizardSessionByGrowPaymentProcess(
      processReference.processId,
      processReference.processToken || undefined
    );

    if (session) {
      return { session, processReference };
    }
  }

  const sessionId = getSessionId(body);

  if (sessionId) {
    const session = await getWizardSession(sessionId);

    if (session) {
      return { session, processReference: processReference.processId ? processReference : null };
    }
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const expectedSecret = process.env.PAYMENT_WEBHOOK_SECRET;

    if (expectedSecret) {
      const receivedSecret = request.headers.get('x-law4us-payment-secret');

      if (receivedSecret !== expectedSecret) {
        return NextResponse.json(
          { success: false, message: 'Unauthorized payment webhook' },
          { status: 401 }
        );
      }
    }

    const body = (await request.json()) as PaymentConfirmationBody;
    const resolvedSession = await resolvePaymentSession(body);

    if (!resolvedSession) {
      const processReference = getGrowPaymentReference(body);

      return NextResponse.json(
        {
          success: false,
          message: 'Missing session id or Grow payment process reference',
          received: {
            hasSessionId: Boolean(getSessionId(body)),
            hasGrowPaymentProcessId: Boolean(processReference.processId),
            hasGrowPaymentProcessToken: Boolean(processReference.processToken),
          },
        },
        { status: 400 }
      );
    }

    if (!isPaidStatus(body)) {
      return NextResponse.json({
        success: true,
        ignored: true,
        message: 'Payment status is not paid',
      });
    }

    const { session, processReference } = resolvedSession;
    const paidAmount = getPaidAmount(body);
    const expectedAmount = Number(session.totalAmount);

    if (
      paidAmount !== null &&
      Number.isFinite(expectedAmount) &&
      expectedAmount > 0 &&
      paidAmount < expectedAmount
    ) {
      return NextResponse.json(
        {
          success: false,
          message: 'Paid amount is lower than the session amount',
          paidAmount,
          expectedAmount,
        },
        { status: 400 }
      );
    }

    const transactionId = getTransactionId(body);

    await updateSessionPaymentStatus(
      session.sessionId,
      'paid',
      processReference?.processId ? `grow:${processReference.processId}` : session.paymentIntentId,
      transactionId
    );

    return NextResponse.json({
      success: true,
      sessionId: session.sessionId,
      paymentStatus: 'paid',
    });
  } catch (error) {
    console.error('Error confirming Grow payment:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Error confirming payment',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
