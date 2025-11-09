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
      <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 10px; }
        .header { text-align: center; color: #2563eb; margin-bottom: 30px; }
        .content { color: #333; line-height: 1.8; }
        .highlight { background-color: #dbeafe; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .claim-list { list-style-type: none; padding: 0; }
        .claim-item { padding: 8px; margin: 5px 0; background-color: #f9fafb; border-right: 4px solid #2563eb; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 14px; }
        .reference { font-family: monospace; background-color: #f3f4f6; padding: 5px 10px; border-radius: 3px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ התביעה נשלחה בהצלחה!</h1>
        </div>

        <div class="content">
          <p>שלום ${name},</p>

          <p><strong>מעולה! התביעה שלך נשלחה בהצלחה.</strong></p>

          <div class="highlight">
            <p><strong>התביעות שנשלחו:</strong></p>
            <ul class="claim-list">
              ${claimLabels.map(label => `<li class="claim-item">📋 ${label}</li>`).join('')}
            </ul>
          </div>

          <p><strong>מספר אסמכתא:</strong> <span class="reference">${sessionId}</span></p>

          <p><strong>המסמכים המשפטיים מצורפים למייל זה.</strong></p>

          <h3>השלבים הבאים:</h3>
          <ol>
            <li>עבור על המסמכים המצורפים ווודא שכל הפרטים נכונים</li>
            <li>נציג מטעמנו ייצור איתך קשר תוך 24 שעות עבודה</li>
            <li>נדריך אותך לגבי המשך התהליך המשפטי</li>
          </ol>

          <p>יש שאלות? פשוט תשיב למייל הזה ונשמח לעזור!</p>
        </div>

        <div class="footer">
          <p><strong>בהצלחה!</strong><br>
          צוות Law4Us</p>
          <p>📧 ${EMAIL_TO}<br>
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
      <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 10px; }
        .header { text-align: center; color: #2563eb; margin-bottom: 30px; }
        .content { color: #333; line-height: 1.8; }
        .button { display: inline-block; background-color: #2563eb; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
        .highlight { background-color: #dbeafe; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ הבקשה שלך נשמרה!</h1>
        </div>

        <div class="content">
          <p>שלום ${name},</p>

          <p>הבקשה שלך לטיפול בתביעה נשמרה אצלנו בהצלחה.</p>

          <p><strong>תוכל לחזור ולהשלים את התהליך בכל רגע דרך הקישור הזה:</strong></p>

          <center>
            <a href="${recoveryUrl}" class="button">המשך לתהליך</a>
          </center>

          <div class="highlight">
            <p><strong>💡 חשוב לדעת:</strong></p>
            <ul>
              <li>הקישור תקף ל-30 יום</li>
              <li>כל המידע שהזנת נשמר בצורה מאובטחת</li>
              <li>תוכל להמשיך מכל מכשיר</li>
            </ul>
          </div>

          <p>אל תדאג - לא תצטרך להזין את הפרטים מחדש!</p>
        </div>

        <div class="footer">
          <p><strong>בברכה,</strong><br>
          צוות Law4Us</p>
          <p>📧 ${EMAIL_TO}</p>
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
      <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 10px; }
        .header { text-align: center; color: #10b981; margin-bottom: 30px; }
        .content { color: #333; line-height: 1.8; }
        .button { display: inline-block; background-color: #10b981; color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; font-size: 18px; }
        .payment-details { background-color: #f0fdf4; padding: 20px; border-radius: 5px; margin: 20px 0; border-right: 4px solid #10b981; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 התשלום התקבל בהצלחה!</h1>
        </div>

        <div class="content">
          <p>שלום ${name},</p>

          <p><strong>התשלום שלך התקבל בהצלחה!</strong></p>

          <div class="payment-details">
            <h3>פרטי התשלום:</h3>
            <ul style="list-style-type: none; padding: 0;">
              <li>💰 <strong>סכום:</strong> ₪${formattedAmount}</li>
              <li>📅 <strong>תאריך:</strong> ${formattedDate}</li>
              <li>🔖 <strong>אסמכתא:</strong> ${transactionId}</li>
            </ul>
          </div>

          <p><strong>נשאר לך רק צעד אחד להשלמת התהליך:</strong></p>

          <center>
            <a href="${resumeUrl}" class="button">להשלמת השליחה - קליק אחד!</a>
          </center>
        </div>

        <div class="footer">
          <p><strong>בברכה,</strong><br>
          צוות Law4Us</p>
          <p>📧 ${EMAIL_TO}</p>
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
      <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 10px; }
        .header { text-align: center; color: #f59e0b; margin-bottom: 30px; }
        .content { color: #333; line-height: 1.8; }
        .button { display: inline-block; background-color: #f59e0b; color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; font-size: 18px; }
        .highlight { background-color: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⏰ רגע! נשאר לך רק צעד אחד</h1>
        </div>

        <div class="content">
          <p>שלום ${name},</p>

          <p>שמנו לב שהתשלום שלך התקבל בהצלחה, אבל התהליך עדיין לא הושלם.</p>

          <div class="highlight">
            <p><strong>כדי שנוכל להתחיל לטפל בתיק שלך, נשאר רק לסיים את השליחה:</strong></p>
          </div>

          <center>
            <a href="${resumeUrl}" class="button">לחץ כאן לסיום התהליך - 30 שניות</a>
          </center>

          <p>יש בעיה? פשוט תשיב למייל הזה ונעזור!</p>
        </div>

        <div class="footer">
          <p><strong>בברכה,</strong><br>
          צוות Law4Us</p>
          <p>📧 ${EMAIL_TO}</p>
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
      <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
        .container { max-width: 700px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 10px; }
        .header { background-color: #2563eb; color: white; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .content { color: #333; line-height: 1.8; }
        .field { margin: 15px 0; padding: 10px; background-color: #f9fafb; border-right: 3px solid #2563eb; }
        .field-label { font-weight: bold; color: #2563eb; }
        .message-box { background-color: #f3f4f6; padding: 20px; border-radius: 5px; margin: 20px 0; white-space: pre-wrap; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>📬 פנייה חדשה מטופס יצירת קשר</h2>
        </div>

        <div class="content">
          <div class="field">
            <span class="field-label">👤 שם:</span> ${name}
          </div>

          <div class="field">
            <span class="field-label">📧 אימייל:</span> <a href="mailto:${email}">${email}</a>
          </div>

          <div class="field">
            <span class="field-label">📞 טלפון:</span> <a href="tel:${phone}">${phone}</a>
          </div>

          <div class="field">
            <span class="field-label">📋 נושא:</span> ${subject}
          </div>

          <h3>הודעה:</h3>
          <div class="message-box">${message}</div>
        </div>

        <div class="footer">
          <p>📅 <strong>תאריך:</strong> ${timestamp}</p>
          <p style="color: #999; font-size: 12px;">מייל אוטומטי מאתר Law4Us</p>
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
      <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 10px; }
        .header { text-align: center; color: #2563eb; margin-bottom: 30px; }
        .content { color: #333; line-height: 1.8; }
        .highlight { background-color: #dbeafe; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ קיבלנו את הפנייה שלך!</h1>
        </div>

        <div class="content">
          <p>שלום ${name},</p>

          <p><strong>תודה שפנית אלינו!</strong></p>

          <div class="highlight">
            <p><strong>נושא הפנייה:</strong> ${subject}</p>
          </div>

          <p>קיבלנו את ההודעה שלך ונחזור אליך בהקדם האפשרי (בדרך כלל תוך 24 שעות עבודה).</p>

          <p>אם הנושא דחוף, אתה מוזמן ליצור איתנו קשר טלפוני.</p>
        </div>

        <div class="footer">
          <p><strong>בברכה,</strong><br>
          צוות Law4Us</p>
          <p>📞 <a href="tel:+972-XX-XXX-XXXX">+972-XX-XXX-XXXX</a><br>
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

📞 +972-XX-XXX-XXXX
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
