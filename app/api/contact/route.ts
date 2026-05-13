import { NextRequest, NextResponse } from 'next/server';
import { sendContactFormNotification, sendContactFormAutoReply } from '@/lib/services/email-service';

export interface ContactFormData {
  name: string;
  phone: string;
  email: string;
  message: string;
  legalConsent?: boolean;
}

/**
 * POST /api/contact
 * Handle contact form submission and send emails
 */
export async function POST(request: NextRequest) {
  try {
    const data: ContactFormData = await request.json();

    // Validate required fields
    if (!data.name || !data.email || !data.message) {
      return NextResponse.json({
        success: false,
        message: 'נא למלא את כל השדות הנדרשים',
      }, { status: 400 });
    }

    if (!data.legalConsent) {
      return NextResponse.json({
        success: false,
        message: 'יש לאשר את מדיניות הפרטיות ותנאי השימוש',
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return NextResponse.json({
        success: false,
        message: 'כתובת האימייל אינה תקינה',
      }, { status: 400 });
    }

    console.log('📬 Processing contact form from:', data.name);

    // Send notification email to office
    const notificationSent = await sendContactFormNotification(
      data.name,
      data.email,
      data.phone || 'לא צוין',
      'פנייה מטופס יצירת קשר', // Default subject
      data.message
    );

    if (!notificationSent) {
      console.error('Failed to send notification email to office');
      return NextResponse.json({
        success: false,
        message: 'אירעה שגיאה בשליחת ההודעה. נסה שוב.',
      }, { status: 500 });
    }

    console.log('✅ Notification email sent to office');

    // Send auto-reply to user
    const autoReplySent = await sendContactFormAutoReply(
      data.email,
      data.name,
      'פנייה מטופס יצירת קשר'
    );

    if (autoReplySent) {
      console.log('✅ Auto-reply sent to user');
    } else {
      console.warn('⚠️  Failed to send auto-reply to user');
    }

    return NextResponse.json({
      success: true,
      message: 'ההודעה נשלחה בהצלחה! נחזור אליך בהקדם.',
    });

  } catch (error) {
    console.error('❌ Contact form error:', error);

    return NextResponse.json({
      success: false,
      message: 'אירעה שגיאה בשליחת הטופס. נסה שוב בעוד רגע.',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
