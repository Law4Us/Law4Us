import { sharedFields } from "../Input Types/SharedFields"

export const divorceAgreementQuestions = [
    { type: "shared", sharedKey: "childrenSimple", label: "ילדים" },
    {
        label: "אנא רשום עד 5 שורות על מה הסכמתם",
        type: "textarea",
        name: "relationshipAgreement",
        maxRows: 5,
    },
]
