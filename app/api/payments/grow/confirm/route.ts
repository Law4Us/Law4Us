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
};

function getSessionId(body: PaymentConfirmationBody): string {
  return (body.sessionId || body.externalId || body.orderId || body.reference || '').trim();
}

function isPaidStatus(body: PaymentConfirmationBody): boolean {
  const status = String(body.status || '').toLowerCase();
  const statusCode = String(body.statusCode || '').toLowerCase();

  return ['paid', 'success', 'successful', 'approved', 'completed'].includes(status)
    || ['paid', 'success', 'successful', 'approved', 'completed', '0', '1'].includes(statusCode);
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

    const transactionId = body.transactionId || body.paymentIntentId;

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
