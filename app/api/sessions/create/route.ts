import { NextRequest, NextResponse } from 'next/server';
import { createWizardSession } from '@/lib/services/wizard-session-service';
import { sendSessionSavedEmail } from '@/lib/services/email-service';
import { WizardState } from '@/lib/types';

export interface CreateSessionRequest {
  wizardState: WizardState;
  email: string;
  phone?: string;
}

/**
 * POST /api/sessions/create
 * Create a new wizard session and send recovery email
 */
export async function POST(request: NextRequest) {
  try {
    const data: CreateSessionRequest = await request.json();

    // Validate required fields
    if (!data.wizardState || !data.email) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields',
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid email format',
      }, { status: 400 });
    }

    console.log('📝 Creating wizard session for:', data.email);

    // Create session in Sanity
    const session = await createWizardSession(
      data.wizardState,
      data.email,
      data.phone
    );

    // Generate recovery URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const recoveryUrl = `${baseUrl}/resume/${session.sessionId}`;

    // Send session saved email
    const emailSent = await sendSessionSavedEmail(
      data.email,
      data.wizardState.basicInfo?.fullName || 'משתמש',
      session.sessionId,
      recoveryUrl
    );

    if (!emailSent) {
      console.warn('⚠️  Failed to send session saved email');
    }

    return NextResponse.json({
      success: true,
      sessionId: session.sessionId,
      recoveryUrl,
      message: 'Session created successfully',
    });

  } catch (error) {
    console.error('❌ Error creating session:', error);

    return NextResponse.json({
      success: false,
      message: 'Failed to create session',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
