export const alimonyClaimQuestions = [
    { type: "shared", sharedKey: "children", label: "ילדים" },

    {
        label: "האם הילדים גרים כרגע?",
        type: "radio",
        name: "childrenLivingWith",
        options: [
            { label: "אצל המבקש/ת", value: "with_applicant" },
            { label: "אצל הנתבע/ת", value: "with_respondent" },
            { label: "עדיין גרים תחת קורת גג משותפת", value: "still_together" },
        ],
    },

    // Employment - using shared fields (same as property claim)
    { type: "shared", sharedKey: "applicantEmployment" },
    { type: "shared", sharedKey: "respondentEmployment" },

    {
        type: "needsTable",
        name: "needsTable",
        label: "צרכי הקטין",
        dependsOn: "children",
    },

    {
        label: "העלאת קבלות/אישורים",
        type: "fileList",
        name: "receipts",
        multiple: true,
        description:
            "העלו כאן קבלות או אישורים (ניתן לגרור ולשחרר קבצים או להעלות קבצים אחד אחרי השני)",
    },

    {
        label: "נא לפרט בקצרה רכיבי רכוש",
        type: "textarea",
        name: "propertyDetails",
        placeholder: "כתבו כאן פירוט קצר של רכיבי הרכוש",
        maxRows: 4,
    },
]
