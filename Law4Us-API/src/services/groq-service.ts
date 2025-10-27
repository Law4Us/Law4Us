/**
 * Groq AI Service for Legal Document Generation
 * Transforms user input (first-person) to professional legal language (third-person)
 */

import Groq from "groq-sdk";

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

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

  const systemPrompt = `אתה עורך דין מומחה בדיני משפחה בישראל. תפקידך להמיר טקסט שכתב לקוח (גוף ראשון) לשפה משפטית מקצועית (גוף שלישי) שתופיע בכתב תביעה.

כללים חשובים:
1. המר מגוף ראשון לגוף שלישי - השתמש ב"המבקש/ת טוען/ת כי..." או "לטענת המבקש/ת..."
2. שמור על העובדות והמידע המדויק מהטקסט המקורי
3. השתמש בשפה משפטית מקצועית אך ברורה
4. שמור על סדר כרונולוגי ועל הקשר לוגי
5. אל תוסיף עובדות או טענות שלא היו בטקסט המקורי
6. הקפד על דקדוק ותחביר תקינים בעברית
7. השתמש במונחים משפטיים מקובלים בדיני משפחה בישראל`;

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
    divorceAgreement: "הסכם גירושין",
    divorce: "תביעת גירושין",
    property: "תביעה רכושית",
    custody: "תביעת משמורת",
    alimony: "תביעת מזונות",
  };

  return claimTypes[claimType] || claimType;
}
