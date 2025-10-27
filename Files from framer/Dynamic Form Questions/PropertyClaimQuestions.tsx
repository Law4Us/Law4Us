export const propertyClaimQuestions = [
    { type: "shared", sharedKey: "childrenSimple", label: "ילדים" },
    { type: "shared", sharedKey: "relationshipDescription" },

    // Assets and Property Section
    {
        label: "דירות",
        type: "repeater",
        name: "apartments",
        fields: [
            { label: "מתי נרכש", type: "date", name: "purchaseDate" },
            {
                label: "על שם מי",
                type: "select",
                name: "owner",
                useDynamicNames: true,
            },
        ],
    },
    {
        label: "רכבים",
        type: "repeater",
        name: "vehicles",
        fields: [
            { label: "מתי נרכש", type: "date", name: "purchaseDate" },
            {
                label: "על שם מי",
                type: "select",
                name: "owner",
                useDynamicNames: true,
            },
        ],
    },
    {
        label: "תנאים סוציאליים",
        type: "repeater",
        name: "benefits",
        fields: [
            { label: "כמות", type: "number", name: "amount" },
            {
                label: "על שם מי",
                type: "select",
                name: "owner",
                useDynamicNames: true,
            },
        ],
    },
    {
        label: "חסכונות",
        type: "repeater",
        name: "savings",
        fields: [
            { label: "כמות", type: "number", name: "amount" },
            {
                label: "על שם מי",
                type: "select",
                name: "owner",
                useDynamicNames: true,
            },
            { label: "מסמך רלוונטי", type: "file", name: "document" },
        ],
    },
    {
        label: "חובות",
        type: "repeater",
        name: "debts",
        fields: [
            { label: "כמות", type: "number", name: "amount" },
            {
                label: "על שם מי",
                type: "select",
                name: "owner",
                useDynamicNames: true,
            },
            { label: "למה נלקח החוב", type: "text", name: "purpose" },
            { label: "מסמך רלוונטי", type: "file", name: "document" },
        ],
    },

    // Employment - using shared fields
    { type: "shared", sharedKey: "applicantEmployment" },
    { type: "shared", sharedKey: "respondentEmployment" },

    // Legal Status
    {
        label: "האם נפתחו הליכים בבית משפט",
        type: "radio",
        name: "courtProceedings",
        options: [
            {
                label: "כן",
                value: "yes",
                fields: [
                    {
                        label: "נא לצרף מסמך",
                        type: "file",
                        name: "courtDocument",
                    },
                ],
            },
            { label: "לא", value: "no" },
        ],
    },
    {
        label: "האם אתם מתגוררים יחד",
        type: "radio",
        name: "livingTogether",
        options: [
            { label: "כן", value: "yes" },
            {
                label: "לא",
                value: "no",
                fields: [
                    {
                        label: "ממתי לא מתגוררים יחד",
                        type: "date",
                        name: "separationDate",
                    },
                ],
            },
        ],
    },
    {
        label: "סעדים מבוקשים",
        type: "textarea",
        name: "remedies",
    },
]
