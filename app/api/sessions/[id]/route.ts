import { NextRequest, NextResponse } from 'next/server';
import {
  getWizardSession,
  updateSessionPaymentStatus,
  updateSessionSubmissionStatus,
  updateWizardData,
} from '@/lib/services/wizard-session-service';
import { WizardState } from '@/lib/types';

/**
 * GET /api/sessions/[id]
 * Retrieve a wizard session by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'Session ID is required',
      }, { status: 400 });
    }

    console.log('🔍 Fetching session:', id);

    const session = await getWizardSession(id);

    if (!session) {
      return NextResponse.json({
        success: false,
        message: 'Session not found',
      }, { status: 404 });
    }

    // Check if session is expired
    const now = new Date();
    const expiresAt = new Date(session.expiresAt);

    if (now > expiresAt) {
      return NextResponse.json({
        success: false,
        message: 'Session has expired',
        session,
      }, { status: 410 }); // 410 Gone
    }

    return NextResponse.json({
      success: true,
      session,
    });

  } catch (error) {
    console.error('❌ Error fetching session:', error);

    return NextResponse.json({
      success: false,
      message: 'Failed to fetch session',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

/**
 * PATCH /api/sessions/[id]
 * Update a wizard session
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'Session ID is required',
      }, { status: 400 });
    }

    const data = await request.json();

    console.log('📝 Updating session:', id);

    // Update payment status if provided
    if (data.paymentStatus) {
      await updateSessionPaymentStatus(
        id,
        data.paymentStatus,
        data.paymentIntentId
      );
    }

    // Update submission status if provided
    if (data.submissionStatus) {
      await updateSessionSubmissionStatus(
        id,
        data.submissionStatus,
        data.driveSubmissionId
      );
    }

    // Update wizard data if provided
    if (data.wizardData) {
      await updateWizardData(id, data.wizardData as Partial<WizardState>);
    }

    // Fetch updated session
    const updatedSession = await getWizardSession(id);

    return NextResponse.json({
      success: true,
      session: updatedSession,
      message: 'Session updated successfully',
    });

  } catch (error) {
    console.error('❌ Error updating session:', error);

    return NextResponse.json({
      success: false,
      message: 'Failed to update session',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
