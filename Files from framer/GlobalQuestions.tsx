/* ==========================================================================
   Global questions (with section headings)
   ========================================================================= */

export const globalQuestions = [
    /* ───────────────────────────────────────────────────────
     Previous-marriage section
  ─────────────────────────────────────────────────────── */
    { type: "heading", label: "נישואין קודמים / ילדים" },

    {
        label: "האם המבקש/ת היה/תה נשוי/אה בעבר?",
        type: "radio",
        name: "marriedBefore",
        options: [
            { label: "כן", value: "כן" },
            { label: "לא", value: "לא" },
        ],
    },
    {
        label: "האם יש להמבקש/ת ילדים מנישואין קודמים?",
        type: "radio",
        name: "hadChildrenFromPrevious",
        options: [
            { label: "כן", value: "כן" },
            { label: "לא", value: "לא" },
        ],
    },
    {
        label: "האם הנתבע/ת היה/תה נשוי/אה בעבר?",
        type: "radio",
        name: "marriedBefore2",
        options: [
            { label: "כן", value: "כן" },
            { label: "לא", value: "לא" },
        ],
    },
    {
        label: "האם להנתבע/ת יש ילדים מנישואין קודמים?",
        type: "radio",
        name: "hadChildrenFromPrevious2",
        options: [
            { label: "כן", value: "כן" },
            { label: "לא", value: "לא" },
        ],
    },

    /* ───────────────────────────────────────────────────────
     Housing section
  ─────────────────────────────────────────────────────── */
    { type: "heading", label: "מצב דיור" },

    {
        label: "הדירה שבה גר/ה המבקש/ת היא:",
        type: "radio",
        name: "applicantHomeType",
        options: [
            {
                label: "בבעלות משותפת של בני הזוג",
                value: "jointOwnership",
            },
            { label: "בבעלות המבקש/ת", value: "applicantOwnership" },
            { label: "בבעלות הנתבע/ת", value: "respondentOwnership" },
            { label: "בשכירות", value: "rental" },
            { label: "אחר", value: "other" },
        ],
    },
    {
        label: "הדירה שבה גר/ה הנתבע/ת היא:",
        type: "radio",
        name: "partnerHomeType",
        options: [
            {
                label: "בבעלות משותפת של בני הזוג",
                value: "jointOwnership",
            },
            { label: "בבעלות הנתבע/ת", value: "respondentOwnership" },
            { label: "בבעלות המבקש/ת", value: "applicantOwnership" },
            { label: "בשכירות", value: "rental" },
            { label: "אחר", value: "other" },
        ],
    },

    /* ───────────────────────────────────────────────────────
     Family-violence section
  ─────────────────────────────────────────────────────── */
    { type: "heading", label: "אלימות במשפחה" },

    {
        label: "הוגשה בעבר בקשה לבית המשפט או לבית דין דתי למתן צו הגנה לפי החוק למניעת אלימות במשפחה?",
        type: "radio",
        name: "protectionOrderRequested",
        options: [
            {
                label: "כן",
                value: "כן",
                fields: [
                    { label: "מתי", type: "date", name: "protectionOrderDate" },
                    {
                        label: "כנגד מי",
                        type: "select",
                        name: "protectionOrderAgainst",
                        useDynamicParties: true, // Special flag for applicant/respondent select
                    },
                    {
                        label: "מספר התיק",
                        type: "text",
                        name: "protectionOrderCaseNumber",
                    },
                    {
                        label: "בפני מי נדון התיק",
                        type: "text",
                        name: "protectionOrderJudge",
                    },
                    {
                        label: "האם ניתן צו הגנה?",
                        type: "radio",
                        name: "protectionOrderGiven",
                        options: [
                            {
                                label: "כן",
                                value: "כן",
                                fields: [
                                    {
                                        label: "ניתן צו הגנה ביום",
                                        type: "date",
                                        name: "protectionOrderGivenDate",
                                    },
                                    {
                                        label: "תוכן הצו",
                                        type: "textarea",
                                        name: "protectionOrderContent",
                                    },
                                ],
                            },
                            { label: "לא", value: "לא" },
                        ],
                    },
                ],
            },
            { label: "לא", value: "לא" },
        ],
    },
    {
        label: "האם היו בעבר אירועי אלימות שהוגשה בגללם תלונה למשטרה ולא הוגשה בקשה לצו הגנה?",
        type: "radio",
        name: "pastViolenceReported",
        options: [
            {
                label: "כן",
                value: "כן",
                fields: [
                    {
                        label: "אם כן – פרט/י",
                        type: "textarea",
                        name: "pastViolenceReportedDetails",
                    },
                ],
            },
            { label: "לא", value: "לא" },
        ],
    },

    /* ───────────────────────────────────────────────────────
     Other family-case files
  ─────────────────────────────────────────────────────────────────────────────── */

    {
        label: "נתונים על תיקים אחרים בענייני המשפחה בין בני הזוג: (פרט לגבי כל תיק בנפרד)",
        type: "repeater",
        name: "otherFamilyCases",
        fields: [
            { label: "מספר התיק", type: "text", name: "caseNumber" },
            { label: "בפני מי נדון התיק", type: "text", name: "court" },
            { label: "מהות התיק", type: "text", name: "caseType" },
            {
                label: "מתי הסתיים הדיון בתיק",
                type: "text",
                name: "status",
            },
        ],
    },

    /* ───────────────────────────────────────────────────────
     Welfare / counselling section
  ─────────────────────────────────────────────────────────────────────────────── */
    { type: "heading", label: "רווחה וייעוץ" },

    {
        label: "האם היית/ם בקשר עם מחלקת הרווחה?",
        type: "radio",
        name: "contactedWelfare",
        options: [
            { label: "כן", value: "כן" },
            { label: "לא", value: "לא" },
        ],
    },
    {
        label: "האם היית/ם בקשר עם ייעוץ נישואין או ייעוץ זוגי?",
        type: "radio",
        name: "contactedMarriageCounseling",
        options: [
            { label: "כן", value: "כן" },
            { label: "לא", value: "לא" },
        ],
    },
    {
        label: "האם היית/ם בקשר עם ייעוץ משפחתי?",
        type: "radio",
        name: "contactedFamilyCounseling",
        options: [
            { label: "כן", value: "כן" },
            { label: "לא", value: "לא" },
        ],
    },
    {
        label: "האם היית/ם בקשר עם גישור?",
        type: "radio",
        name: "contactedMediation",
        options: [
            { label: "כן", value: "כן" },
            { label: "לא", value: "לא" },
        ],
    },
    {
        label: "האם המבקש/ת מוכנ/ה לקחת חלק בייעוץ משפחתי?",
        type: "radio",
        name: "willingToJoinFamilyCounseling",
        options: [
            { label: "כן", value: "כן" },
            { label: "לא", value: "לא" },
        ],
    },
    {
        label: "האם המבקש/ת מוכנ/ה לקחת חלק בגישור?",
        type: "radio",
        name: "willingToJoinMediation",
        options: [
            { label: "כן", value: "כן" },
            { label: "לא", value: "לא" },
        ],
    },
]
