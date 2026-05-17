import { NextRequest, NextResponse } from 'next/server';
import { updateSessionPaymentStatus } from '@/lib/services/wizard-session-service';

type PaymentConfirmationBody = {
  sessionId?: string;
  externalId?: string;
  orderId?: string;
  reference?: string;
  transactionId?: string;
  paymentIntentId?: string;
  status?: string;
  statusCode?: string | number;
  amount?: number;
  sum?: number;
  data?: unknown;
  customFields?: unknown;
  purchaseCustomField?: unknown;
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

function getCustomField1(body: PaymentConfirmationBody): string {
  const data = asRecord(body.data);
  const directCustomFields = asRecord(body.customFields);
  const dataCustomFields = asRecord(data.customFields);
  const directPurchaseFields = asRecord(body.purchaseCustomField);
  const dataPurchaseFields = asRecord(data.purchaseCustomField);

  return pickString(directCustomFields, ['cField1', 'c_field_1', 'field1', 'C field 1'])
    || pickString(dataCustomFields, ['cField1', 'c_field_1', 'field1', 'C field 1'])
    || pickString(directPurchaseFields, ['field1', 'cField1', 'c_field_1'])
    || pickString(dataPurchaseFields, ['field1', 'cField1', 'c_field_1']);
}

function getSessionId(body: PaymentConfirmationBody): string {
  const data = asRecord(body.data);

  return pickString(body as Record<string, unknown>, ['sessionId', 'externalId', 'orderId', 'reference'])
    || pickString(data, ['sessionId', 'externalId', 'orderId', 'reference'])
    || getCustomField1(body);
}

function isPaidStatus(body: PaymentConfirmationBody): boolean {
  const data = asRecord(body.data);
  const status = (readString(body.status) || readString(data.status)).toLowerCase();
  const statusCode = (readString(body.statusCode) || readString(data.statusCode)).toLowerCase();

  return ['paid', 'success', 'successful', 'approved', 'completed', 'שולם'].includes(status)
    || ['paid', 'success', 'successful', 'approved', 'completed', '0', '1', '2'].includes(statusCode);
}

function getTransactionId(body: PaymentConfirmationBody): string | undefined {
  const data = asRecord(body.data);

  return pickString(body as Record<string, unknown>, ['transactionId', 'paymentIntentId', 'transactionCode', 'asmachta'])
    || pickString(data, ['transactionId', 'paymentIntentId', 'transactionCode', 'asmachta'])
    || undefined;
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
    const sessionId = getSessionId(body);

    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: 'Missing session id' },
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

    const transactionId = getTransactionId(body);

    await updateSessionPaymentStatus(sessionId, 'paid', transactionId);

    return NextResponse.json({
      success: true,
      sessionId,
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
