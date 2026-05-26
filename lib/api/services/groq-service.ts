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
8. התמקד ב"טובת הילד" כעיקרון מנחה
9. הדגש את יכולת התובע/ת לספק סביבה יציבה ומטפחת לקטינים
10. תאר את מערכת היחסים בין ההורה לילדים באופן מקצועי ואמפתי
11. הימנע משפה שלילית או מאשימה כלפי ההורה השני
12. השתמש ב"התובע/ת" ו"הנתבע/ת" - לא "המבקש/ת" או "המשיב/ה"

כללים חשובים לכתיבה טבעית (לא רובוטית!):
13. כתוב בסגנון זורם וטבעי - לא בתבנית קשיחה
14. אל תציין עובדות מובנות מאליהן (כמו "הקטין הוא הילד המשותף" - זה ברור)
15. אל תשתמש בנוסחאות כמו "באה לידי ביטוי ב:" - זה נשמע רובוטי
16. במקום זאת, כתוב משפטים רגילים כמו: "התובעת מלווה את הקטינה לפעילויותיה, מסייעת לה בשיעורי הבית ודואגת לצרכיה הרגשיים"
17. אם יש תיאור אישיות של הילד - שלב אותו בטבעיות בתחילת הפסקה, למשל: "הקטינה יעל הינה ילדה רגישה וחכמה. התובעת מלווה אותה..."
18. הימנע מחזרות מיותרות על שם התובע/ת או הקטין/ה בכל משפט
19. כתוב כאילו עורך דין מנוסה כותב - מקצועי אבל קריא וטבעי`;
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

  // Add divorce-specific instructions
  if (context.claimType === 'תביעת גירושין' || context.claimType === 'גירושין') {
    systemPrompt += `

כללים ספציפיים לתביעות גירושין:
8. כתוב בסגנון סיפורי זורם - אל תתחיל עם "לטענת המבקש/ת"
9. אל תכלול תאריכי נישואין או עובדות שאינך יודע - אלה מופיעים בחלק נפרד של המסמך
10. אל תתחיל עם "הצדדים נישאו..." - המשפט הזה כבר מופיע לפני הטקסט שלך
11. התחל ישירות עם תיאור הבעיות או הנסיבות, למשל: "במהלך הנישואין...", "בשנים האחרונות...", "עם הזמן התגלעו..."
12. תאר את הרקע והסיבות לגירושין באופן עובדתי ומקצועי, ללא שפה רגשית מוגזמת
13. שמור על רציפות הסיפור - כל משפט צריך להמשיך באופן טבעי מהקודם
14. התמקד בעובדות ובנסיבות, לא באשמות
15. אם הטקסט המקורי מזכיר משך הנישואין (כמו "19 שנים") - אתה יכול להשאיר את זה`;
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

  // Models to try in order of preference
  const models = [
    "llama-3.3-70b-versatile",  // Best quality
    "llama-3.1-8b-instant",     // Fallback - faster, separate rate limit
  ];

  for (const model of models) {
    try {
      const response = await getGroqClient().chat.completions.create({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3, // Lower temperature for more consistent legal language
        max_tokens: 2000,
      });

      const transformedText = response.choices[0]?.message?.content?.trim();

      if (!transformedText) {
        console.error(`Groq ${model} returned empty response`);
        continue; // Try next model
      }

      return transformedText;
    } catch (error: any) {
      // If rate limited, try next model
      if (error?.status === 429) {
        console.log(`Groq ${model} rate limited, trying fallback model...`);
        continue;
      }
      console.error(`Error calling Groq API (${model}):`, error);
      // For other errors, try next model
      continue;
    }
  }

  // All models failed - return original text
  console.error("All Groq models failed, returning original text");
  return userText;
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

  // Models to try in order of preference
  const models = [
    "llama-3.3-70b-versatile",  // Best quality
    "llama-3.1-8b-instant",     // Fallback - faster, separate rate limit
  ];

  for (const model of models) {
    try {
      const response = await getGroqClient().chat.completions.create({
        model,
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
        console.error(`Groq ${model} returned empty response`);
        continue;
      }

      return transformedText;
    } catch (error: any) {
      if (error?.status === 429) {
        console.log(`Groq ${model} rate limited, trying fallback model...`);
        continue;
      }
      console.error(`Error calling Groq API (${model}):`, error);
      continue;
    }
  }

  console.error("All Groq models failed, returning original text");
  return userText;
}

/**
 * Halachic Ground Analysis Result
 * Returned by AI when analyzing user text for divorce grounds
 */
export interface HalachicGroundAnalysis {
  moredet?: {
    applicable: boolean;
    confidence: number; // 0-1
    facts: string[];
  };
  mum?: {
    applicable: boolean;
    confidence: number;
    facts: string[];
  };
  motHaNisuin?: {
    applicable: boolean;
    confidence: number;
    facts: string[];
  };
  bgida?: {
    applicable: boolean;
    confidence: number;
    facts: string[];
  };
}

/**
 * Analyze user's divorce story and reasons to detect applicable halachic grounds
 *
 * @param userStory - The user's story (divorce.whoWantsDivorceAndWhy)
 * @param divorceReasons - The user's reasons (divorce.divorceReasons)
 * @returns Analysis of which halachic grounds apply with supporting facts
 */
export async function analyzeForHalachicGrounds(
  userStory: string,
  divorceReasons: string
): Promise<HalachicGroundAnalysis | null> {
  const combinedText = `${userStory}\n\n${divorceReasons}`.trim();

  if (!combinedText || combinedText.length < 20) {
    return null;
  }

  const systemPrompt = `אתה עורך דין מומחה בדיני משפחה יהודיים (הלכה) ובבתי הדין הרבניים בישראל.

נתח את הטקסט שיימסר לך וזהה אילו מהעילות ההלכתיות הבאות לגירושין חלות:

1. **מורדת** (moredet) - סירוב ליחסי אישות, עזיבת הבית ללא הסכמה, הזנחת חובות משק הבית, סירוב לשתף פעולה בחיי המשפחה, נעילת הבית בפני בן הזוג, הסתה של ילדים נגד בן הזוג.

2. **מום** (mum) - מחלת נפש (דיכאון, חרדות, הפרעת אישיות), מצב נפשי או גופני שהוסתר בעת הנישואין, חוסר תפקוד ממושך, נטילת תרופות פסיכיאטריות, התפרצויות זעם ואלימות מילולית.

3. **מות הנישואין** (motHaNisuin) - פירוד ממושך (מעל 18 חודשים), העדר תקשורת, העדר יחסי אישות, מאיסות הדדית, ניסיונות גישור שנכשלו, חיים נפרדים.

4. **בגידה** (bgida) - קיום יחסים מחוץ לנישואין, ניהול רומן, שיחות והודעות אינטימיות עם צד שלישי, פגישות סתר עם מאהב/ת.

עבור כל עילה שזיהית, החזר:
- applicable: true/false - האם העילה חלה
- confidence: 0-1 - רמת הביטחון (1 = וודאי, 0.7 = סביר, 0.5 = אפשרי)
- facts: מערך של עובדות ספציפיות מהטקסט שתומכות בעילה

החזר תשובה בפורמט JSON בלבד, ללא הסברים נוספים.

דוגמת פלט:
{
  "moredet": {
    "applicable": true,
    "confidence": 0.9,
    "facts": ["האישה מסרבת ליחסי אישות מזה שנתיים", "עזבה את הבית למשך שבועיים"]
  },
  "motHaNisuin": {
    "applicable": true,
    "confidence": 0.8,
    "facts": ["הצדדים בפירוד מזה 20 חודשים", "אין תקשורת ביניהם"]
  }
}`;

  const userPrompt = `נתח את הטקסט הבא וזהה את העילות ההלכתיות לגירושין. החזר JSON בלבד:

"""
${combinedText}
"""`;

  const models = [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
  ];

  for (const model of models) {
    try {
      const response = await getGroqClient().chat.completions.create({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.2, // Low temperature for consistent analysis
        max_tokens: 1500,
      });

      const content = response.choices[0]?.message?.content?.trim();

      if (!content) {
        console.error(`Groq ${model} returned empty response for ground analysis`);
        continue;
      }

      // Parse JSON response
      try {
        // Remove markdown code block if present
        let jsonStr = content;
        if (content.startsWith('```')) {
          jsonStr = content.replace(/```json?\n?/g, '').replace(/```$/g, '').trim();
        }

        const analysis = JSON.parse(jsonStr) as HalachicGroundAnalysis;
        return analysis;
      } catch (parseError) {
        console.error(`Failed to parse Groq response as JSON:`, content);
        continue;
      }
    } catch (error: any) {
      if (error?.status === 429) {
        console.log(`Groq ${model} rate limited for ground analysis, trying fallback...`);
        continue;
      }
      console.error(`Error calling Groq API for ground analysis (${model}):`, error);
      continue;
    }
  }

  console.error("All Groq models failed for ground analysis");
  return null;
}

/**
 * Transform specific facts into legal language for a halachic ground
 *
 * @param facts - Array of facts to transform
 * @param groundType - The type of halachic ground
 * @param plaintiffGender - Gender of plaintiff for proper terms
 * @returns Transformed legal paragraph
 */
export async function transformFactsToLegalParagraph(
  facts: string[],
  groundType: string,
  plaintiffGender: 'male' | 'female' = 'male'
): Promise<string> {
  if (!facts || facts.length === 0) {
    return '';
  }

  const factsList = facts.join('\n- ');

  const systemPrompt = `אתה עורך דין המנסח טענות לבית הדין הרבני.

המר את העובדות הבאות לפסקה משפטית מקצועית בעברית.

כללים:
1. כתוב בגוף שלישי
2. השתמש ב"לטענת התובע/ת" או "כפי שיפורט"
3. שמור על כל העובדות
4. כתוב בסגנון משפטי רשמי
5. התאם לנושא: ${groundType}
6. התובע/ת הוא/היא: ${plaintiffGender === 'male' ? 'גבר' : 'אישה'}`;

  const models = [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
  ];

  for (const model of models) {
    try {
      const response = await getGroqClient().chat.completions.create({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `עובדות:\n- ${factsList}\n\nהמר לפסקה משפטית:` },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      });

      const content = response.choices[0]?.message?.content?.trim();
      if (content) {
        return content;
      }
    } catch (error: any) {
      if (error?.status === 429) {
        continue;
      }
      console.error(`Error transforming facts (${model}):`, error);
      continue;
    }
  }

  // Fallback: just join facts
  return `בענייננו, ${facts.join(', ')}.`;
}
