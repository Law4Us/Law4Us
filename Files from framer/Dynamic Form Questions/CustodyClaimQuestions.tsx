import { sharedFields } from "../Input_Types/SharedFields.tsx"

export const custodyClaimQuestions = [
    { type: "shared", sharedKey: "children", label: "ילדים" },
    {
        label: "האם המשמורת צריכה להיות אצלך / אצלו ולמה?",
        type: "textarea",
        name: "whoShouldHaveCustody",
        maxRows: 5,
    },
]
