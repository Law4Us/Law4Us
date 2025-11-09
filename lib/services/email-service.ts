import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

// Email configuration from environment variables
const EMAIL_CONFIG = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASSWORD || '',
  },
};

const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@law-4-us.co.il';
const EMAIL_TO = process.env.EMAIL_TO || 'info@law-4-us.co.il';

// Create reusable transporter
let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport(EMAIL_CONFIG);
  }
  return transporter;
}

// Email sending interface
export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content?: Buffer | string;
    path?: string;
  }>;
}

/**
 * Send an email using Google Workspace SMTP
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // Validate email configuration
    if (!EMAIL_CONFIG.auth.user || !EMAIL_CONFIG.auth.pass) {
      console.error('Email configuration missing. Please set EMAIL_USER and EMAIL_PASSWORD in .env.local');
      return false;
    }

    const transporter = getTransporter();

    // Send email
    const info = await transporter.sendMail({
      from: `Law4Us <${EMAIL_FROM}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments,
    });

    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

/**
 * Send submission confirmation email to user
 */
export async function sendSubmissionConfirmation(
  email: string,
  name: string,
  sessionId: string,
  claimLabels: string[],
  attachments?: Array<{ filename: string; path: string }>
): Promise<boolean> {
  const subject = 'התביעה שלך נשלחה בהצלחה! 📄';

  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="he">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body dir="rtl" style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; direction: rtl;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 10px; direction: rtl;">
        <div style="text-align: center; color: #2563eb; margin-bottom: 30px;">
          <h1 style="direction: rtl;">✅ התביעה נשלחה בהצלחה!</h1>
        </div>

        <div style="color: #333; line-height: 1.8; direction: rtl; text-align: right;">
          <p style="direction: rtl; text-align: right;">שלום ${name},</p>

          <p style="direction: rtl; text-align: right;"><strong>מעולה! התביעה שלך נשלחה בהצלחה.</strong></p>

          <div style="background-color: #dbeafe; padding: 15px; border-radius: 5px; margin: 20px 0; direction: rtl; text-align: right;">
            <p style="direction: rtl; text-align: right;"><strong>התביעות שנשלחו:</strong></p>
            <ul style="list-style-type: none; padding: 0; direction: rtl; text-align: right;">
              ${claimLabels.map(label => `<li style="padding: 8px; margin: 5px 0; background-color: #f9fafb; border-right: 4px solid #2563eb; direction: rtl; text-align: right;">📋 ${label}</li>`).join('')}
            </ul>
          </div>

          <p style="direction: rtl; text-align: right;"><strong>מספר אסמכתא:</strong> <span style="font-family: monospace; background-color: #f3f4f6; padding: 5px 10px; border-radius: 3px;">${sessionId}</span></p>

          <p style="direction: rtl; text-align: right;"><strong>המסמכים המשפטיים מצורפים למייל זה.</strong></p>

          <h3 style="direction: rtl; text-align: right;">השלבים הבאים:</h3>
          <ol style="direction: rtl; text-align: right;">
            <li style="direction: rtl; text-align: right;">עבור על המסמכים המצורפים ווודא שכל הפרטים נכונים</li>
            <li style="direction: rtl; text-align: right;">נציג מטעמנו ייצור איתך קשר תוך 24 שעות עבודה</li>
            <li style="direction: rtl; text-align: right;">נדריך אותך לגבי המשך התהליך המשפטי</li>
          </ol>

          <p style="direction: rtl; text-align: right;">יש שאלות? פשוט תשיב למייל הזה ונשמח לעזור!</p>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 14px; direction: rtl; text-align: right;">
          <p style="direction: rtl; text-align: right;"><strong>בהצלחה!</strong><br>
          צוות Law4Us</p>
          <p style="direction: rtl; text-align: right;">📞 טלפון: <a href="tel:+97236951408">03-6951408</a><br>
          📱 נייד: <a href="tel:+972507529938">050-7529938</a><br>
          📧 ${EMAIL_TO}<br>
          🌐 <a href="https://law-4-us.co.il">law-4-us.co.il</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
שלום ${name},

מעולה! התביעה שלך נשלחה בהצלחה.

התביעות שנשלחו:
${claimLabels.map(label => `- ${label}`).join('\n')}

מספר אסמכתא: ${sessionId}

המסמכים המשפטיים מצורפים למייל זה.

השלבים הבאים:
1. עבור על המסמכים המצורפים ווודא שכל הפרטים נכונים
2. נציג מטעמנו ייצור איתך קשר תוך 24 שעות עבודה
3. נדריך אותך לגבי המשך התהליך המשפטי

יש שאלות? פשוט תשיב למייל הזה ונשמח לעזור!

בהצלחה!
צוות Law4Us
${EMAIL_TO}
  `;

  return sendEmail({
    to: email,
    subject,
    html,
    text,
    attachments,
  });
}

/**
 * Send session saved email with recovery link
 */
export async function sendSessionSavedEmail(
  email: string,
  name: string,
  sessionId: string,
  recoveryUrl: string
): Promise<boolean> {
  const subject = 'הבקשה שלך ל-Law4Us נשמרה בהצלחה ✓';

  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="he">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body dir="rtl" style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; direction: rtl;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 10px; direction: rtl;">
        <div style="text-align: center; color: #2563eb; margin-bottom: 30px;">
          <h1 style="direction: rtl;">✅ הבקשה שלך נשמרה!</h1>
        </div>

        <div style="color: #333; line-height: 1.8; direction: rtl; text-align: right;">
          <p style="direction: rtl; text-align: right;">שלום ${name},</p>

          <p style="direction: rtl; text-align: right;">הבקשה שלך לטיפול בתביעה נשמרה אצלנו בהצלחה.</p>

          <p style="direction: rtl; text-align: right;"><strong>תוכל לחזור ולהשלים את התהליך בכל רגע דרך הקישור הזה:</strong></p>

          <center>
            <a href="${recoveryUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold;">המשך לתהליך</a>
          </center>

          <div style="background-color: #dbeafe; padding: 15px; border-radius: 5px; margin: 20px 0; direction: rtl; text-align: right;">
            <p style="direction: rtl; text-align: right;"><strong>💡 חשוב לדעת:</strong></p>
            <ul style="direction: rtl; text-align: right;">
              <li style="direction: rtl; text-align: right;">הקישור תקף ל-30 יום</li>
              <li style="direction: rtl; text-align: right;">כל המידע שהזנת נשמר בצורה מאובטחת</li>
              <li style="direction: rtl; text-align: right;">תוכל להמשיך מכל מכשיר</li>
            </ul>
          </div>

          <p style="direction: rtl; text-align: right;">אל תדאג - לא תצטרך להזין את הפרטים מחדש!</p>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 14px; direction: rtl; text-align: right;">
          <p style="direction: rtl; text-align: right;"><strong>בברכה,</strong><br>
          צוות Law4Us</p>
          <p style="direction: rtl; text-align: right;">📞 טלפון: <a href="tel:+97236951408">03-6951408</a><br>
          📱 נייד: <a href="tel:+972507529938">050-7529938</a><br>
          📧 ${EMAIL_TO}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
שלום ${name},

הבקשה שלך לטיפול בתביעה נשמרה אצלנו בהצלחה.

תוכל לחזור ולהשלים את התהליך בכל רגע דרך הקישור הזה:
${recoveryUrl}

חשוב לדעת:
- הקישור תקף ל-30 יום
- כל המידע שהזנת נשמר בצורה מאובטחת
- תוכל להמשיך מכל מכשיר

אל תדאג - לא תצטרך להזין את הפרטים מחדש!

בברכה,
צוות Law4Us
${EMAIL_TO}
  `;

  return sendEmail({
    to: email,
    subject,
    html,
    text,
  });
}

/**
 * Send payment confirmation email
 */
export async function sendPaymentConfirmation(
  email: string,
  name: string,
  amount: number,
  transactionId: string,
  resumeUrl: string
): Promise<boolean> {
  const subject = 'התשלום התקבל בהצלחה! ✓';

  const formattedAmount = amount.toLocaleString('he-IL');
  const formattedDate = new Date().toLocaleString('he-IL', {
    dateStyle: 'long',
    timeStyle: 'short'
  });

  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="he">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body dir="rtl" style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; direction: rtl;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 10px; direction: rtl;">
        <div style="text-align: center; color: #10b981; margin-bottom: 30px;">
          <h1 style="direction: rtl;">🎉 התשלום התקבל בהצלחה!</h1>
        </div>

        <div style="color: #333; line-height: 1.8; direction: rtl; text-align: right;">
          <p style="direction: rtl; text-align: right;">שלום ${name},</p>

          <p style="direction: rtl; text-align: right;"><strong>התשלום שלך התקבל בהצלחה!</strong></p>

          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 5px; margin: 20px 0; border-right: 4px solid #10b981; direction: rtl; text-align: right;">
            <h3 style="direction: rtl; text-align: right;">פרטי התשלום:</h3>
            <ul style="list-style-type: none; padding: 0; direction: rtl; text-align: right;">
              <li style="direction: rtl; text-align: right;">💰 <strong>סכום:</strong> ₪${formattedAmount}</li>
              <li style="direction: rtl; text-align: right;">📅 <strong>תאריך:</strong> ${formattedDate}</li>
              <li style="direction: rtl; text-align: right;">🔖 <strong>אסמכתא:</strong> ${transactionId}</li>
            </ul>
          </div>

          <p style="direction: rtl; text-align: right;"><strong>נשאר לך רק צעד אחד להשלמת התהליך:</strong></p>

          <center>
            <a href="${resumeUrl}" style="display: inline-block; background-color: #10b981; color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; font-size: 18px;">להשלמת השליחה - קליק אחד!</a>
          </center>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 14px; direction: rtl; text-align: right;">
          <p style="direction: rtl; text-align: right;"><strong>בברכה,</strong><br>
          צוות Law4Us</p>
          <p style="direction: rtl; text-align: right;">📞 טלפון: <a href="tel:+97236951408">03-6951408</a><br>
          📱 נייד: <a href="tel:+972507529938">050-7529938</a><br>
          📧 ${EMAIL_TO}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
שלום ${name},

התשלום שלך התקבל בהצלחה! 🎉

פרטי התשלום:
- סכום: ₪${formattedAmount}
- תאריך: ${formattedDate}
- אסמכתא: ${transactionId}

נשאר לך רק צעד אחד להשלמת התהליך:
${resumeUrl}

בברכה,
צוות Law4Us
${EMAIL_TO}
  `;

  return sendEmail({
    to: email,
    subject,
    html,
    text,
  });
}

/**
 * Send recovery reminder email
 */
export async function sendRecoveryReminder(
  email: string,
  name: string,
  resumeUrl: string,
  reminderNumber: number = 1
): Promise<boolean> {
  const subject = 'רגע! נשאר לך רק צעד אחד 👈';

  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="he">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body dir="rtl" style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; direction: rtl;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 10px; direction: rtl;">
        <div style="text-align: center; color: #f59e0b; margin-bottom: 30px;">
          <h1 style="direction: rtl;">⏰ רגע! נשאר לך רק צעד אחד</h1>
        </div>

        <div style="color: #333; line-height: 1.8; direction: rtl; text-align: right;">
          <p style="direction: rtl; text-align: right;">שלום ${name},</p>

          <p style="direction: rtl; text-align: right;">שמנו לב שהתשלום שלך התקבל בהצלחה, אבל התהליך עדיין לא הושלם.</p>

          <div style="background-color: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0; direction: rtl; text-align: right;">
            <p style="direction: rtl; text-align: right;"><strong>כדי שנוכל להתחיל לטפל בתיק שלך, נשאר רק לסיים את השליחה:</strong></p>
          </div>

          <center>
            <a href="${resumeUrl}" style="display: inline-block; background-color: #f59e0b; color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; font-size: 18px;">לחץ כאן לסיום התהליך - 30 שניות</a>
          </center>

          <p style="direction: rtl; text-align: right;">יש בעיה? פשוט תשיב למייל הזה ונעזור!</p>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 14px; direction: rtl; text-align: right;">
          <p style="direction: rtl; text-align: right;"><strong>בברכה,</strong><br>
          צוות Law4Us</p>
          <p style="direction: rtl; text-align: right;">📞 טלפון: <a href="tel:+97236951408">03-6951408</a><br>
          📱 נייד: <a href="tel:+972507529938">050-7529938</a><br>
          📧 ${EMAIL_TO}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
שלום ${name},

שמנו לב שהתשלום שלך התקבל בהצלחה, אבל התהליך עדיין לא הושלם.

כדי שנוכל להתחיל לטפל בתיק שלך, נשאר רק לסיים את השליחה:
${resumeUrl}

זה ייקח רק 30 שניות!

יש בעיה? פשוט תשיב למייל הזה ונעזור!

בברכה,
צוות Law4Us
${EMAIL_TO}
  `;

  return sendEmail({
    to: email,
    subject,
    html,
    text,
  });
}

/**
 * Send contact form notification to office
 */
export async function sendContactFormNotification(
  name: string,
  email: string,
  phone: string,
  subject: string,
  message: string
): Promise<boolean> {
  const emailSubject = `[Contact Form] פנייה חדשה מ-${name}`;

  const timestamp = new Date().toLocaleString('he-IL', {
    dateStyle: 'long',
    timeStyle: 'long'
  });

  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="he">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body dir="rtl" style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; direction: rtl;">
      <div style="max-width: 700px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 10px; direction: rtl;">
        <div style="background-color: #2563eb; color: white; padding: 20px; border-radius: 5px; margin-bottom: 20px; direction: rtl; text-align: right;">
          <h2 style="direction: rtl; text-align: right;">📬 פנייה חדשה מטופס יצירת קשר</h2>
        </div>

        <div style="color: #333; line-height: 1.8; direction: rtl; text-align: right;">
          <div style="margin: 15px 0; padding: 10px; background-color: #f9fafb; border-right: 3px solid #2563eb; direction: rtl; text-align: right;">
            <span style="font-weight: bold; color: #2563eb;">👤 שם:</span> ${name}
          </div>

          <div style="margin: 15px 0; padding: 10px; background-color: #f9fafb; border-right: 3px solid #2563eb; direction: rtl; text-align: right;">
            <span style="font-weight: bold; color: #2563eb;">📧 אימייל:</span> <a href="mailto:${email}">${email}</a>
          </div>

          <div style="margin: 15px 0; padding: 10px; background-color: #f9fafb; border-right: 3px solid #2563eb; direction: rtl; text-align: right;">
            <span style="font-weight: bold; color: #2563eb;">📞 טלפון:</span> <a href="tel:${phone}">${phone}</a>
          </div>

          <div style="margin: 15px 0; padding: 10px; background-color: #f9fafb; border-right: 3px solid #2563eb; direction: rtl; text-align: right;">
            <span style="font-weight: bold; color: #2563eb;">📋 נושא:</span> ${subject}
          </div>

          <h3 style="direction: rtl; text-align: right;">הודעה:</h3>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 5px; margin: 20px 0; white-space: pre-wrap; direction: rtl; text-align: right;">${message}</div>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 14px; direction: rtl; text-align: right;">
          <p style="direction: rtl; text-align: right;">📅 <strong>תאריך:</strong> ${timestamp}</p>
          <p style="color: #999; font-size: 12px; direction: rtl; text-align: right;">מייל אוטומטי מאתר Law4Us</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
פנייה חדשה התקבלה דרך טופס יצירת הקשר:

שם: ${name}
אימייל: ${email}
טלפון: ${phone}
נושא: ${subject}

הודעה:
${message}

---
תאריך: ${timestamp}
  `;

  return sendEmail({
    to: EMAIL_TO,
    subject: emailSubject,
    html,
    text,
  });
}

/**
 * Send auto-reply to contact form submitter
 */
export async function sendContactFormAutoReply(
  email: string,
  name: string,
  subject: string
): Promise<boolean> {
  const emailSubject = 'קיבלנו את הפנייה שלך ✓';

  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="he">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body dir="rtl" style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; direction: rtl;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 10px; direction: rtl;">
        <div style="text-align: center; color: #2563eb; margin-bottom: 30px;">
          <h1 style="direction: rtl;">✅ קיבלנו את הפנייה שלך!</h1>
        </div>

        <div style="color: #333; line-height: 1.8; direction: rtl; text-align: right;">
          <p style="direction: rtl; text-align: right;">שלום ${name},</p>

          <p style="direction: rtl; text-align: right;"><strong>תודה שפנית אלינו!</strong></p>

          <div style="background-color: #dbeafe; padding: 15px; border-radius: 5px; margin: 20px 0; direction: rtl; text-align: right;">
            <p style="direction: rtl; text-align: right;"><strong>נושא הפנייה:</strong> ${subject}</p>
          </div>

          <p style="direction: rtl; text-align: right;">קיבלנו את ההודעה שלך ונחזור אליך בהקדם האפשרי (בדרך כלל תוך 24 שעות עבודה).</p>

          <p style="direction: rtl; text-align: right;">אם הנושא דחוף, אתה מוזמן ליצור איתנו קשר טלפוני.</p>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 14px; direction: rtl; text-align: right;">
          <p style="direction: rtl; text-align: right;"><strong>בברכה,</strong><br>
          צוות Law4Us</p>
          <p style="direction: rtl; text-align: right;">📞 טלפון: <a href="tel:+97236951408">03-6951408</a><br>
          📱 נייד: <a href="tel:+972507529938">050-7529938</a><br>
          📧 <a href="mailto:${EMAIL_TO}">${EMAIL_TO}</a><br>
          🌐 <a href="https://law-4-us.co.il">law-4-us.co.il</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
שלום ${name},

תודה שפנית אלינו!

נושא הפנייה: ${subject}

קיבלנו את ההודעה שלך ונחזור אליך בהקדם האפשרי (בדרך כלל תוך 24 שעות עבודה).

אם הנושא דחוף, אתה מוזמן ליצור איתנו קשר טלפוני.

בברכה,
צוות Law4Us

📞 טלפון: 03-6951408
📱 נייד: 050-7529938
📧 ${EMAIL_TO}
🌐 law-4-us.co.il
  `;

  return sendEmail({
    to: email,
    subject: emailSubject,
    html,
    text,
  });
}

// Export constants for use in other files
export { EMAIL_FROM, EMAIL_TO };
