import { NextRequest, NextResponse } from 'next/server';
import {
  getSessionsNeedingReminders,
  incrementSessionReminders,
} from '@/lib/services/wizard-session-service';
import { sendRecoveryReminder } from '@/lib/services/email-service';

/**
 * GET /api/cron/send-reminders
 * Send reminder emails to users who paid but didn't submit
 *
 * This endpoint should be called by a cron job (e.g., Vercel Cron)
 * Recommended schedule: Every 30 minutes
 *
 * To set up Vercel Cron:
 * 1. Create vercel.json in project root
 * 2. Add cron configuration (see vercel.json)
 * 3. Schedule runs every 30 minutes automatically
 *
 * For security, you can add an authorization header check
 */
export async function GET(request: NextRequest) {
  try {
    // Optional: Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized',
      }, { status: 401 });
    }

    console.log('🔔 Running reminder email cron job...');

    // Get sessions that need reminders
    const sessions = await getSessionsNeedingReminders();

    if (sessions.length === 0) {
      console.log('✅ No sessions need reminders at this time');
      return NextResponse.json({
        success: true,
        message: 'No sessions need reminders',
        sent: 0,
      });
    }

    console.log(`📧 Found ${sessions.length} sessions needing reminders`);

    const results = {
      sent: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Send reminder email to each session
    for (const session of sessions) {
      try {
        console.log(`📤 Sending reminder ${session.remindersSent + 1} to:`, session.email);

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const resumeUrl = `${baseUrl}/resume/${session.sessionId}`;

        const emailSent = await sendRecoveryReminder(
          session.email,
          session.fullName || 'משתמש',
          resumeUrl,
          session.remindersSent + 1
        );

        if (emailSent) {
          // Increment reminder count
          await incrementSessionReminders(session.sessionId);
          results.sent++;
          console.log(`✅ Reminder sent successfully to ${session.email}`);
        } else {
          results.failed++;
          results.errors.push(`Failed to send to ${session.email}`);
          console.error(`❌ Failed to send reminder to ${session.email}`);
        }
      } catch (error) {
        results.failed++;
        const errorMsg = `Error sending to ${session.email}: ${error instanceof Error ? error.message : 'Unknown'}`;
        results.errors.push(errorMsg);
        console.error('❌', errorMsg);
      }
    }

    console.log(`✅ Reminder cron job complete: ${results.sent} sent, ${results.failed} failed`);

    return NextResponse.json({
      success: true,
      message: 'Reminder emails processed',
      ...results,
      total: sessions.length,
    });

  } catch (error) {
    console.error('❌ Reminder cron job error:', error);

    return NextResponse.json({
      success: false,
      message: 'Error processing reminders',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

/**
 * POST /api/cron/send-reminders
 * Manual trigger for testing
 */
export async function POST(request: NextRequest) {
  // Same logic as GET, just allows manual triggering
  return GET(request);
}
