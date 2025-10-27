export const form3Template = `
טופס טופס 3
(תקנה 12)
הרצאת פרטים בתובענה בין בני זוג (למעט תביעת מזונות)

מהות התובענה: {{claimType}}
מעמדו של ממלא הטופס: {{applicantRole}}

 פרטים אישיים*:
המבקש/ת:
שם פרטי ושם משפחה: {{fullName}}
מספר זהות: {{idNumber}}
תאריך לידה: {{birthDate}}
כתובת: {{address}}
טלפון בבית: {{phone}}
נייד: {{phone}}

2. בן/בת הזוג:
שם פרטי ושם משפחה: {{fullName2}}
מספר זהות: {{idNumber2}}
תאריך לידה: {{birthDate2}}
כתובת: {{address2}}
טלפון בבית: {{phone2}}
נייד: {{phone2}}

4. פרטים לגבי המצב האישי:
המבקש/ת:
תאריך הנישואים הנוכחיים: {{weddingDay}}
נישואין קודמים: {{marriedBefore}}
ילדים מנישואים קודמים: {{hadChildrenFromPrevious}}

5. בן/בת הזוג:
תאריך הנישואים הנוכחיים: {{weddingDay}}
נישואין קודמים: {{marriedBefore2}}
ילדים מנישואים קודמים: {{hadChildrenFromPrevious2}}
(בסעיף זה – נישואין לרבות ברית זוגיות.)

6. ילדים:
{{childrenBlock}}

7. פרטים לגבי דירת המגורים:
הדירה שבה גר/ה המבקש/ת היא: {{applicantHomeType}}
הדירה שבה גר/ה בן/בת הזוג היא: {{partnerHomeType}}

8. נתונים על אלימות במשפחה:
הוגשה בעבר בקשה לבית המשפט או לבית דין דתי למתן צו הגנה לפי החוק למניעת אלימות במשפחה, התשנ"א-1991: {{protectionOrderRequested}}
אם כן – מתי: {{protectionOrderDate}}
כנגד מי: {{protectionOrderAgainst}}
מספר התיק: {{protectionOrderCaseNumber}}
בפני מי נדון התיק: {{protectionOrderJudge}}
האם ניתן צו הגנה: {{protectionOrderGiven}}
ניתן צו הגנה ביום: {{protectionOrderGivenDate}}
תוכן הצו: {{protectionOrderContent}}

האם היו בעבר אירועי אלימות שהוגשה בגללם תלונה למשטרה ולא הוגשה בקשה לצו הגנה? {{pastViolenceReported}}
אם כן – פרט/י: {{pastViolenceReportedDetails}}

9. נתונים על תיקים אחרים בענייני המשפחה בין בני הזוג (פרט לגבי כל תיק בנפרד):
{{otherFamilyCasesBlock}}

10. קשר עם גורמים טיפוליים:
האם היית/ם בקשר עם מחלקת הרווחה? {{contactedWelfare}}
האם היית/ם בקשר עם ייעוץ נישואין או ייעוץ זוגי? {{contactedMarriageCounseling}}
האם את/ה מוכנ/ה לקחת חלק בייעוץ משפחתי? {{willingToJoinFamilyCounseling}}
האם את/ה מוכנ/ה לקחת חלק בגישור? {{willingToJoinMediation}}

הצהרה
אני מצהיר כי לפי מיטב ידיעתי הפרטים שמילאתי בטופס נכונים.
{{date}}
{{signature}}
{{fullName}}
`
