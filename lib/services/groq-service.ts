/**
 * Groq AI Service for Legal Document Generation
 * Transforms user input (first-person) to professional legal language (third-person)
 */

import Groq from "groq-sdk";

let groqClient: Groq | null = null;

function getGroqClient(): Groq {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      throw new Error(
        "GroqError: Missing GROQ_API_KEY. Set it in the environment or load it before calling the Groq service."
      );
    }

    groqClient = new Groq({ apiKey });
  }

  return groqClient;
}

export interface TransformContext {
  claimType: string;
  applicantName: string;
  respondentName: string;
  fieldLabel: string;
  additionalContext?: string;
}

/**
 * Transform user text from first-person to third-person legal language
 *
 * @param userText - The original text written by the user in first person
 * @param context - Context about the document and parties
 * @returns Transformed text in legal Hebrew
 */
export async function transformToLegalLanguage(
  userText: string,
  context: TransformContext
): Promise<string> {
  if (!userText || userText.trim().length === 0) {
    return "";
  }

  let systemPrompt = `אתה עורך דין מומחה בדיני משפחה בישראל. תפקידך להמיר טקסט שכתב לקוח (גוף ראשון) לשפה משפטית מקצועית (גוף שלישי) שתופיע בכתב תביעה.

כללים חשובים:
1. המר מגוף ראשון לגוף שלישי - השתמש ב"התובע/ת תטען כי..." או "התובע/ת יטען כי..." (לא "המבקש/ת")
2. שמור על העובדות והמידע המדויק מהטקסט המקורי
3. השתמש בשפה משפטית מקצועית אך ברורה וטבעית - הימנע מביטויים מלאכותיים או רובוטיים
4. שמור על סדר כרונולוגי ועל הקשר לוגי
5. אל תוסיף עובדות או טענות שלא היו בטקסט המקורי
6. הקפד על דקדוק ותחביר תקינים בעברית
7. השתמש במונחים משפטיים מקובלים בדיני משפחה בישראל
8. כאשר מדובר ברקע מערכת היחסים (כמו סיבת הפרידה), השתמש בניסוחים קצרים וטבעיים:
   - אם מדובר בירושה, השתמש בניסוחים כמו: "הסכסוך בין הצדדים הינו תולדה של מריבה על ירושה" או "הסכסוך בין הצדדים נובע ממחלוקת סביב הירושה"
   - הימנע מביטויים כמו "סכסוך משמעותי בנושא ירושה" - הם נשמעים לא טבעיים`;

  // Add claim-specific instructions
  if (context.claimType === 'תביעת מזונות') {
    systemPrompt += `

כללים ספציפיים לתביעות מזונות:
9. השתמש בניסוח "התובע/ת תטען כי..." או "התובע/ת יטען כי..." בתחילת הפסקה
10. כשמדובר ברקע על חלוקת תפקידים, כתוב בסגנון: "התובעת תטען כי בעוד היא הקדישה את זמנה לגידול הילדים ועבדה משרה חלקית, הנתבע פיתח קריירה שבצידה הכנסות נכבדות"
11. הימנע מהמילים "לטענת" - השתמש ב"תטען כי" או "יטען כי"
12. כתוב בצורה טבעית וזורמת, לא בתבניות קשיחות`;
  } else if (context.claimType === 'תביעת משמורת') {
    systemPrompt += `

כללים ספציפיים לתביעות משמורת:
9. התמקד ב"טובת הילד" כעיקרון מנחה
10. הדגש את יכולת התובע/ת לספק סביבה יציבה ומטפחת לקטינים
11. תאר את מערכת היחסים בין ההורה לילדים באופן מקצועי ואמפתי
12. הימנע משפה שלילית או מאשימה כלפי ההורה השני
13. השתמש ב"התובע/ת" ו"הנתבע/ת" - לא "המבקש/ת" או "המשיב/ה"

כללים חשובים לכתיבה טבעית (לא רובוטית!):
14. כתוב בסגנון זורם וטבעי - לא בתבנית קשיחה
15. אל תציין עובדות מובנות מאליהן (כמו "הקטין הוא הילד המשותף" - זה ברור)
16. אל תשתמש בנוסחאות כמו "באה לידי ביטוי ב:" - זה נשמע רובוטי
17. במקום זאת, כתוב משפטים רגילים כמו: "התובעת מלווה את הקטינה לפעילויותיה, מסייעת לה בשיעורי הבית ודואגת לצרכיה הרגשיים"
18. אם יש תיאור אישיות של הילד - שלב אותו בטבעיות בתחילת הפסקה, למשל: "הקטינה יעל הינה ילדה רגישה וחכמה. התובעת מלווה אותה..."
19. הימנע מחזרות מיותרות על שם התובע/ת או הקטין/ה בכל משפט
20. כתוב כאילו עורך דין מנוסה כותב - מקצועי אבל קריא וטבעי`;
  }

  const userPrompt = `
סוג התביעה: ${context.claimType}
שם התובע/ת: ${context.applicantName}
שם הנתבע/ת: ${context.respondentName}
נושא השדה: ${context.fieldLabel}
${context.additionalContext ? `הקשר נוסף: ${context.additionalContext}` : ""}

טקסט מקורי מהלקוח:
"""
${userText}
"""

המר את הטקסט לשפה משפטית מקצועית בגוף שלישי, כפי שתופיע בכתב תביעה. החזר רק את הטקסט המומר, ללא הסברים נוספים.`;

  try {
    const groq = getGroqClient();

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", // Fast and capable model from Groq
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3, // Lower temperature for more consistent legal language
      max_tokens: 2000,
    });

    const transformedText = response.choices[0]?.message?.content?.trim();

    if (!transformedText) {
      console.error("Groq returned empty response");
      return userText; // Fallback to original text
    }

    return transformedText;
  } catch (error) {
    console.error("Error calling Groq API:", error);
    // Fallback: return original text if AI fails
    return userText;
  }
}

/**
 * Batch transform multiple texts
 * Useful for transforming multiple fields at once
 */
export async function batchTransformToLegalLanguage(
  texts: Array<{ text: string; context: TransformContext }>
): Promise<string[]> {
  const transformPromises = texts.map(({ text, context }) =>
    transformToLegalLanguage(text, context)
  );

  return Promise.all(transformPromises);
}

/**
 * Get claim type in Hebrew for context
 */
export function getClaimTypeInHebrew(claimType: string): string {
  const claimTypes: Record<string, string> = {
    disputeResolution: "בקשה ליישוב סכסוך",
    divorceAgreement: "הסכם גירושין",
    divorce: "תביעת גירושין",
    property: "תביעה רכושית",
    custody: "תביעת משמורת",
    alimony: "תביעת מזונות",
  };

  return claimTypes[claimType] || claimType;
}
