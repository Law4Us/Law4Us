# Template Placeholder Guide

This guide shows exactly what placeholders to use in your Word templates, based on your actual property claim document example.

## Document Structure

Your document has these main sections:
1. **Header** - Court, parties, attorney info
2. **Main Claim** (כתב תביעה) - Remedies, facts, jurisdiction
3. **Part C** (חלק ג) - Detailed facts about relationship, property, debts
4. **Form 3** (טופס 3) - Personal details, housing, violence, welfare
5. **Power of Attorney** (יפוי כוח) - Attorney authorization

## Available Placeholders

### Basic Information (Both Parties)

```
{fullName}              - שם המבקש/ת (e.g., "ליאן אלמו")
{idNumber}              - ת.ז. המבקש/ת (e.g., "203957873")
{birthDate}             - תאריך לידה (e.g., "22-04-1992")
{address}               - כתובת (e.g., "יצחק שדה 11/3 אזור")
{phone}                 - טלפון (e.g., "0536290858")
{email}                 - דוא"ל

{fullName2}             - שם הנתבע/ת (e.g., "דניאל גמבר")
{idNumber2}             - ת.ז. הנתבע/ת
{birthDate2}            - תאריך לידה
{address2}              - כתובת
{phone2}                - טלפון
{email2}                - דוא"ל

{weddingDay}            - תאריך נישואין או "לא נישאו"
{relationshipType}      - married / commonLaw / separated / notMarried
```

### Dates

```
{currentDate}           - תאריך נוכחי (e.g., "2025-09-01")
{date}                  - תאריך נוכחי (same as above)
{separationDate}        - תאריך פרידה (e.g., "2023-08-01")
```

### Children Information

**Simple list** (for property claims):
```
{childrenList}
```
Output:
```
• שם: להב ליאו גמבר ת״ז: 235138419 ת״ל: 2021-08-05
• שם: ליאל ליאו גמבר ת״ז: 235138427 ת״ל: 2021-08-05
```

**Detailed list** (for custody claims):
```
{childrenListDetailed}
```
Output:
```
• שם: להב ליאו גמבר ת״ז: 235138419 ת״ל: 2021-08-05 כתובת: יצחק שדה 11/3 אזור
שם ההורה שלא התובע: דניאל גמבר
מערכת היחסים עם הילד: {AI-transformed text}

• שם: ליאל ליאו גמבר ת״ז: 235138427 ת״ל: 2021-08-05 כתובת: יצחק שדה 11/3 אזור
שם ההורה שלא התובע: דניאל גמבר
מערכת היחסים עם הילד: {AI-transformed text}
```

**Count**:
```
{numberOfChildren}      - מספר ילדים (e.g., "2")
```

### Property & Assets

**Apartments**:
```
{apartmentsList}
```
Output:
```
נרכש ב: 2015-01-10 בעלים: משותף
נרכש ב: 2018-06-20 בעלים: ליאן אלמו
```

**Vehicles**:
```
{vehiclesList}
```
Output:
```
נרכש ב: 2019-03-15 בעלים: דניאל גמבר
```

**Savings**:
```
{savingsList}
```
Output:
```
על סך: 150000 בעלים: ליאן אלמו
על סך: 80000 בעלים: דניאל גמבר
```

**Benefits** (pensions, severance pay):
```
{benefitsList}
```
Output:
```
על סך: 200000 בעלים: ליאן אלמו
```

### Debts (WITH ATTACHMENT REFERENCES) ⭐

```
{debtsList}
```
Output:
```
על סך: 87819 בעלים: ליאן אלמו נלקח בתאריך 15/07/21 בשביל: מקס - לצורך קניית רכבים לעסק של דניאל גמבר
מצ״ב מסמך המשקף החוב כנספח א

על סך: 80000 בעלים: ליאן אלמו נלקח בתאריך 29/07/21 בשביל: בנק יהב - לתשלום חובות/מזונות
מצ״ב מסמך המשקף החוב כנספח ב

על סך: 100000 בעלים: ליאן אלמו נלקח בתאריך 10/06/22 בשביל: בנק ירושלים - חובות בשוק האפור
מצ״ב מסמך המשקף החוב כנספח ג
```

### Financial Totals

```
{totalDebts}            - סכום כולל חובות (number: 787703)
{totalDebtsFormatted}   - סכום כולל חובות (formatted: "787,703")
{totalSavings}          - סכום כולל חיסכונות
{totalSavingsFormatted} - סכום כולל חיסכונות (formatted)
{totalBenefits}         - סכום כולל זכויות
{totalBenefitsFormatted} - סכום כולל זכויות (formatted)
```

### Employment & Income

```
{employmentStatus}           - employed / selfEmployed / unemployed
{occupation}                 - מקצוע (e.g., "משלוחים")
{grossSalary}                - שכר ברוטו (e.g., "13839")
{husbandJobType}             - "שכיר" או "עצמאי"
{establishedDate}            - תאריך הקמת עסק
{registeredOwner}            - בעלים רשום
```

### AI-Transformed Fields ✨

These fields are automatically transformed from first-person to legal third-person:

```
{relationship}               - תיאור מערכת היחסים
{relationshipDescription}    - תיאור מערכת היחסים (same)
{remedies}                   - סעדים מבוקשים
{childRelationship}          - מערכת היחסים עם הילד
```

**Example transformation:**

**User input (first person):**
> "אני ודניאל גרנו ביחד 3 שנים ונולדו לנו 2 ילדים. היחסים היו טובים בהתחלה אבל הוא התחיל להיות אלים."

**AI output (third person legal):**
> "הצדדים לא נישאו, התקיימה ביניהם זוגיות שנמשכה כ־3 שנים, במהלך הקשר נולדו להם 2 ילדים. מיום 2023-08-01 הצדדים חיים בנפרד."

### Form 3 Specific Fields

**Marital Status**:
```
{relationshipType}       - married / commonLaw / separated / notMarried
{marriedBefore}          - כן / לא
{marriedBefore2}         - כן / לא
{hadChildrenFromPrevious} - כן / לא / ילד ללא נישואים
{hadChildrenFromPrevious2} - כן / לא / {number} ילדים
```

**Housing**:
```
{applicantHomeType}      - בשכירות / עמידר / בבעלות / אחר
{partnerHomeType}        - בשכירות / עמידר / בבעלות / אחר
```

**Protection Orders** (detailed):
```
{protectionOrderRequested}      - כן / לא
{protectionOrderDate}            - תאריך בקשה
{protectionOrderAgainst}         - כנגד מי (e.g., "הנתבע")
{protectionOrderCaseNumber}      - מספר תיק (e.g., "39188-05-25")
{protectionOrderJudge}           - שם שופט/ת
{protectionOrderGiven}           - כן / לא
{protectionOrderGivenDate}       - תאריך מתן צו
{protectionOrderContent}         - תוכן הצו
```

**Violence**:
```
{pastViolenceReported}           - כן / לא
{pastViolenceReportedDetails}    - פירוט
```

**Welfare & Counseling**:
```
{contactedWelfare}               - כן / לא / פירוט
{contactedMarriageCounseling}    - כן / לא
{willingToJoinFamilyCounseling}  - כן / לא
{willingToJoinMediation}         - כן / לא
```

**Living Situation**:
```
{livingTogether}         - כן / לא
{courtProceedings}       - כן / לא
```

## Example Template Sections

### Header Section

```
תאריך ההגשה לבית המשפט: {currentDate}

בבית המשפט לענייני משפחה                                                    תלה"מ
בתל אביב
בפני כב' השו'

התובעת:                    {fullName} מ"ז {idNumber}
                           מרח' {address}
                           באמצעות ב"כ עוה"ד אריאל דרור (מ"ר 31892)
                           מרח' אבא שאול 15, רמת גן
                           טל: 03-6951408   פקס: 03-6951683

נגד

הנתבע:                     {fullName2} מ"ז {idNumber2}
                           טל: {phone2}
                           דוא"ל: {email2}
```

### Children Section

```
במהלך הקשר נולדו להם {numberOfChildren} ילדים.

{childrenList}
```

### Debts Section

```
חובות

סך החובות עולים כדי סך של {totalDebtsFormatted}

פרוט החובות:

{debtsList}
```

### Employment Section

```
השתכרות הצדדים

{fullName} (שכירה): שכר חודשי ברוטו: {grossSalary} ש״ח
נמ"ב תלושי משכרות של האם כנספח

{fullName2} ({husbandJobType}): הכנסה מוצהרת כ־20000 עוסק ב{occupation}
```

### Relationship Description (AI-Transformed)

```
מערכת היחסים

{relationship}
```

### Power of Attorney

```
אני החתום מטה תז {idNumber} ממנה בזה את עוה"ד אריאל דרור להיות ב"כ כתב תביעה {claimType}...

ולראיה באתי על החתום, היום יום {currentDate}

                            ___
                            {fullName}
                            ____________________
```

## Template Preparation Checklist

When preparing your Word template:

- [ ] Replace all specific names with `{fullName}` and `{fullName2}`
- [ ] Replace all ID numbers with `{idNumber}` and `{idNumber2}`
- [ ] Replace children lists with `{childrenList}` or `{childrenListDetailed}`
- [ ] Replace debt sections with `{debtsList}`
- [ ] Replace relationship descriptions with `{relationship}` (will be AI-transformed)
- [ ] Replace totals with `{totalDebtsFormatted}`, `{totalSavingsFormatted}`, etc.
- [ ] Replace dates with `{currentDate}`, `{separationDate}`, `{weddingDay}`
- [ ] Replace yes/no fields with appropriate placeholders
- [ ] Keep all legal text and structure as-is
- [ ] Keep Hebrew text and RTL formatting
- [ ] Save as .docx in `/templates` directory

## Testing Your Template

After creating the template:

1. **Update test script** with real data
2. **Run**: `npm run test:document-gen`
3. **Check generated document** in `/tmp` directory
4. **Verify**:
   - All placeholders replaced
   - Lists formatted correctly
   - AI-transformed text is professional
   - Hebrew displays correctly (RTL)
   - No missing fields
   - Attachment references correct (נספח א, ב, ג, etc.)

## Next Steps

1. Download your Google Docs templates as .docx
2. Replace dynamic content with placeholders from this guide
3. Save to `/templates` directory
4. Test with `npm run test:document-gen`
5. Adjust as needed
6. Integrate with wizard (Step 5)

---

**Questions?** Check [DOCUMENT_GENERATION.md](DOCUMENT_GENERATION.md) for detailed setup instructions.
