import { sharedFields } from "../Input_Types/SharedFields.tsx"

export const divorceClaimQuestions = [
    {
        type: "shared",
        sharedKey: "relationshipDescription",
    },
    { type: "shared", sharedKey: "children", label: "ילדים" },
    {
        label: "מי רוצה להתגרש ולמה?",
        type: "textarea",
        name: "whoWantsDivorceAndWhy",
        maxRows: 5,
    },
    {
        label: "אם יש הוכחות לסיבת הגירושין, צרפו כאן",
        type: "repeater",
        name: "divorceProofs",
        fields: [
            {
                label: "קובץ הוכחה",
                type: "file",
                name: "proofFile",
            },
            {
                label: "הסבר קצר (לא חובה)",
                type: "text",
                name: "proofDescription",
            },
        ],
    },
]
