/**
 * Groq AI Service for Legal Document Generation
 * Transforms user input (first-person) to professional legal language (third-person)
 */

import Groq from "groq-sdk";

// Lazy-load Groq client to ensure env vars are loaded
let groq: Groq;
function getGroqClient() {
  if (!groq) {
    groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }
  return groq;
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

  // Build system prompt based on claim type
  let systemPrompt = `אתה עורך דין מומחה בדיני משפחה בישראל. תפקידך להמיר טקסט שכתב לקוח (גוף ראשון) לשפה משפטית מקצועית (גוף שלישי) שתופיע בכתב תביעה.

כללים חשובים:
1. המר מגוף ראשון לגוף שלישי - השתמש ב"המבקש/ת טוען/ת כי..." או "לטענת המבקש/ת..."
2. שמור על העובדות והמידע המדויק מהטקסט המקורי
3. השתמש בשפה משפטית מקצועית אך ברורה
4. שמור על סדר כרונולוגי ועל הקשר לוגי
5. אל תוסיף עובדות או טענות שלא היו בטקסט המקורי
6. הקפד על דקדוק ותחביר תקינים בעברית
7. השתמש במונחים משפטיים מקובלים בדיני משפחה בישראל`;

  // Add custody-specific instructions
  if (context.claimType === 'תביעת משמורת') {
    systemPrompt += `

כללים ספציפיים לתביעות משמורת:
8. התמקד ב"טובת הילד" כעיקרון מנחה - זה "עיקרון העל" בדיני משמורת
9. הדגש את יכולת המבקש/ת לספק סביבה יציבה ומטפחת לקטינים
10. תאר את מערכת היחסים בין ההורה לילדים באופן מקצועי ואמפתי
11. הימנע משפה שלילית או מאשימה כלפי ההורה השני - התמקד בעובדות ובטובת הילדים
12. השתמש במונחים משפטיים רלוונטיים: "הקטינים", "טובת הילד", "הסדרי ראיה", "יציבות", "המשכיות", "קשר הורי-ילד"
13. שמור על טון מקצועי ועובדתי, תוך הדגשת האינטרסים של הילדים
14. אם מדובר בתיאור מערכת יחסים עם ילד ספציפי - כתוב בגוף שלישי: "המבקש/ת מתאר/ת את מערכת היחסים עם הקטין/ה..."`;
  }

  // Add alimony-specific instructions
  if (context.claimType === 'תביעת מזונות') {
    systemPrompt += `

כללים ספציפיים לתביעות מזונות:
8. התמקד בצורכי הקטינים והנסיבות הכלכליות של שני הצדדים
9. הדגש את המצב הכלכלי של המבקש/ת והנתבע/ת באופן עובדתי ומקצועי
10. תאר את מערכת היחסים והרקע המשפחתי בקצרה, תוך שמירה על רלוונטיות לנושא המזונות
11. הימנע משפה רגשית או שיפוטית - התמקד בעובדות כלכליות ובצרכים הממשיים
12. השתמש במונחים משפטיים רלוונטיים: "מזונות", "הקטינים", "צורכי המדור", "הכנסות", "הוצאות חודשיות", "יכולת כלכלית"
13. שמור על טון עובדתי ומקצועי, תוך התמקדות בנתונים הכלכליים והצרכים
14. אם מתאר את מערכת היחסים - כתוב בגוף שלישי: "המבקש/ת מציין/ה כי..." או "לדברי המבקש/ת..."
15. הקפד לציין את הקשר בין מערכת היחסים ובין הצורך במזונות (למשל: מי מטפל בילדים, מה השפעת זה על יכולת ההשתכרות)`;
  }

  const userPrompt = `
סוג התביעה: ${context.claimType}
שם המבקש/ת: ${context.applicantName}
שם הנתבע/ת: ${context.respondentName}
נושא השדה: ${context.fieldLabel}
${context.additionalContext ? `הקשר נוסף: ${context.additionalContext}` : ""}

טקסט מקורי מהלקוח:
"""
${userText}
"""

המר את הטקסט לשפה משפטית מקצועית בגוף שלישי, כפי שתופיע בכתב תביעה. החזר רק את הטקסט המומר, ללא הסברים נוספים.`;

  try {
    const response = await getGroqClient().chat.completions.create({
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
    divorceAgreement: "הסכם גירושין",
    divorce: "תביעת גירושין",
    property: "תביעה רכושית",
    custody: "תביעת משמורת",
    alimony: "תביעת מזונות",
  };

  return claimTypes[claimType] || claimType;
}

/**
 * Simplified transform function for specific field types
 * Used by claim generators for quick transformations
 *
 * @param userText - The original text from user
 * @param fieldType - Type of field being transformed (e.g., 'custody-relationship', 'alimony-relationship')
 * @returns Transformed legal text
 */
export async function transformWithGroq(
  userText: string,
  fieldType: string
): Promise<string> {
  if (!userText || userText.trim().length === 0) {
    return "";
  }

  // Build system prompt based on field type
  let systemPrompt = `אתה עורך דין מומחה בדיני משפחה בישראל. המר את הטקסט המקורי לשפה משפטית מקצועית.

כללים:
1. המר מגוף ראשון לגוף שלישי
2. שמור על כל העובדות המקוריות
3. השתמש בשפה משפטית ברורה ומקצועית
4. שמור על סדר כרונולוגי
5. אל תוסיף מידע חדש`;

  // Add field-specific instructions
  if (fieldType === 'custody-relationship') {
    systemPrompt += `
6. התמקד ב"טובת הילד"
7. תאר מערכת יחסים הורה-ילד באופן מקצועי ואמפתי
8. השתמש במונחים: "הקטין/ה", "המבקש/ת", "קשר הורי-ילד"`;
  } else if (fieldType === 'alimony-relationship') {
    systemPrompt += `
6. התמקד בהיבטים הרלוונטיים למזונות
7. תאר את מערכת היחסים בקצרה ועניינית
8. השתמש במונחים: "המבקש/ת", "הנתבע/ת", "הקטינים"
9. שמור על טון עובדתי ומקצועי`;
  }

  try {
    const response = await getGroqClient().chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `המר את הטקסט הבא לשפה משפטית:\n\n${userText}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const transformedText = response.choices[0]?.message?.content?.trim();

    if (!transformedText) {
      console.error("Groq returned empty response");
      return userText;
    }

    return transformedText;
  } catch (error) {
    console.error("Error calling Groq API:", error);
    return userText;
  }
}
