import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/services/email-service';

// This endpoint performs an external side effect and must never run during static generation.
export const dynamic = 'force-dynamic';

/**
 * GET /api/test-email
 * Test endpoint to verify email configuration is working
 */
export async function GET(request: NextRequest) {
  try {
    const testEmail = process.env.EMAIL_TO || 'info@law-4-us.co.il';

    console.log('🧪 Testing email configuration...');
    console.log('📧 Sending test email to:', testEmail);

    const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="he">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; }
          .success { color: #10b981; font-size: 24px; margin-bottom: 20px; }
          .info { background-color: #dbeafe; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="success">✅ הצלחה! מערכת המיילים עובדת!</div>

          <p>זהו מייל בדיקה ממערכת Law4Us.</p>

          <div class="info">
            <p><strong>פרטי הבדיקה:</strong></p>
            <ul>
              <li>שולח: ${process.env.EMAIL_FROM}</li>
              <li>נמען: ${testEmail}</li>
              <li>שעה: ${new Date().toLocaleString('he-IL')}</li>
            </ul>
          </div>

          <p>אם קיבלת את המייל הזה, המערכת מוכנה לשימוש! 🎉</p>

          <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 14px;">
            <strong>בהצלחה!</strong><br>
            צוות Law4Us
          </p>
        </div>
      </body>
      </html>
    `;

    const text = `
✅ הצלחה! מערכת המיילים עובדת!

זהו מייל בדיקה ממערכת Law4Us.

פרטי הבדיקה:
- שולח: ${process.env.EMAIL_FROM}
- נמען: ${testEmail}
- שעה: ${new Date().toLocaleString('he-IL')}

אם קיבלת את המייל הזה, המערכת מוכנה לשימוש! 🎉

בהצלחה!
צוות Law4Us
    `;

    const success = await sendEmail({
      to: testEmail,
      subject: '✅ בדיקת מערכת מיילים - Law4Us',
      html,
      text,
    });

    if (success) {
      console.log('✅ Test email sent successfully!');
      return NextResponse.json({
        success: true,
        message: `Test email sent successfully to ${testEmail}`,
        details: {
          from: process.env.EMAIL_FROM,
          to: testEmail,
          timestamp: new Date().toISOString(),
        },
      });
    } else {
      console.error('❌ Failed to send test email');
      return NextResponse.json({
        success: false,
        message: 'Failed to send test email. Check server logs for details.',
        details: {
          from: process.env.EMAIL_FROM,
          to: testEmail,
        },
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Test email error:', error);

    return NextResponse.json({
      success: false,
      message: 'Error testing email system',
      error: error instanceof Error ? error.message : 'Unknown error',
      hint: 'Check that EMAIL_USER and EMAIL_PASSWORD are set correctly in .env.local',
    }, { status: 500 });
  }
}
