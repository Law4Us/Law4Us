export const sharedFields = {
    // Children repeater fields (with textarea)
    children: [
        {
            label: "אנא רשום עד חמש שורות על מערכת היחסים עם הילד",
            type: "textarea",
            name: "childRelationship",
            maxRows: 5,
        },
        { label: "שם פרטי", type: "text", name: "firstName" },
        { label: "שם משפחה", type: "text", name: "lastName" },
        { label: "תעודת זהות", type: "text", name: "idNumber" },
        { label: "תאריך לידה", type: "date", name: "birthDate" },
        { label: "כתובת", type: "text", name: "address" },
        { label: "שם ההורה שאינו המבקש", type: "text", name: "nameOfParent" },
    ],

    // Children simple (without textarea)
    childrenSimple: [
        { label: "שם פרטי", type: "text", name: "firstName" },
        { label: "שם משפחה", type: "text", name: "lastName" },
        { label: "תעודת זהות", type: "text", name: "idNumber" },
        { label: "תאריך לידה", type: "date", name: "birthDate" },
        { label: "כתובת", type: "text", name: "address" },
        { label: "שם ההורה שאינו המבקש", type: "text", name: "nameOfParent" },
    ],

    // Relationship description field (not a repeater, just a single textarea)
    relationshipDescription: {
        label: "אנא רשום עד 5 שורות על מערכת היחסים שלכם",
        type: "textarea",
        name: "relationshipDescription",
        maxRows: 5,
    },

    // Employment status for applicant
    applicantEmployment: {
        label: "סטטוס תעסוקתי של המבקש/ת",
        type: "radio",
        name: "applicantEmploymentStatus",
        options: [
            {
                label: "שכיר/ה",
                value: "employee",
                fields: [
                    {
                        label: "כמה המבקש/ת מרוויח/ה ברוטו",
                        type: "number",
                        name: "applicantGrossSalary",
                    },
                    {
                        label: "תלושים אחרונים",
                        type: "file",
                        name: "applicantPaySlips",
                        multiple: true,
                    },
                ],
            },
            {
                label: "עצמאי/ת",
                value: "selfEmployed",
                fields: [
                    {
                        label: "מהות העיסוק",
                        type: "text",
                        name: "applicantOccupation",
                    },
                    {
                        label: "מתי הוקם העסק",
                        type: "date",
                        name: "applicantEstablishedDate",
                    },
                    {
                        label: "על שם מי רשום",
                        type: "text",
                        name: "applicantRegisteredOwner",
                    },
                    {
                        label: "כמה המבקש/ת מרוויח/ה ברוטו",
                        type: "number",
                        name: "applicantGrossIncome",
                    },
                    {
                        label: 'אישור רו"ח על השתכרות חודשית',
                        type: "file",
                        name: "applicantIncomeProof",
                    },
                ],
            },
        ],
    },

    // Employment status for respondent
    respondentEmployment: {
        label: "סטטוס תעסוקתי של הנתבע/ת",
        type: "radio",
        name: "respondentEmploymentStatus",
        options: [
            {
                label: "שכיר/ה",
                value: "employee",
                fields: [
                    {
                        label: "כמה הנתבע/ת מרוויח/ה ברוטו (במידה ולא ידוע - אומדן)",
                        type: "number",
                        name: "respondentGrossSalary",
                        placeholder: "הקלד סכום או אומדן",
                    },
                    {
                        label: "תלושים אחרונים (אם יש)",
                        type: "file",
                        name: "respondentPaySlips",
                        multiple: true,
                    },
                ],
            },
            {
                label: "עצמאי/ת",
                value: "selfEmployed",
                fields: [
                    {
                        label: "מהות העיסוק (אם ידוע)",
                        type: "text",
                        name: "respondentOccupation",
                    },
                    {
                        label: "מתי הוקם העסק (אם ידוע)",
                        type: "date",
                        name: "respondentEstablishedDate",
                    },
                    {
                        label: "על שם מי רשום (אם ידוע)",
                        type: "text",
                        name: "respondentRegisteredOwner",
                    },
                    {
                        label: "כמה הנתבע/ת מרוויח/ה ברוטו (במידה ולא ידוע - אומדן)",
                        type: "number",
                        name: "respondentGrossIncome",
                        placeholder: "הקלד סכום או אומדן",
                    },
                    {
                        label: 'אישור רו"ח על השתכרות חודשית (אם יש)',
                        type: "file",
                        name: "respondentIncomeProof",
                    },
                ],
            },
        ],
    },
}
