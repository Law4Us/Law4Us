import { sharedFields } from "../Input Types/SharedFields"

export const custodyClaimQuestions = [
    { type: "shared", sharedKey: "children", label: "ילדים" },
    {
        label: "האם המשמורת צריכה להיות אצלך / אצלו ולמה?",
        type: "textarea",
        name: "whoShouldHaveCustody",
        maxRows: 5,
    },
]
