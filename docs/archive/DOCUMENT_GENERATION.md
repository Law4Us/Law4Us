# Document Generation with AI

This document explains how the document generation system works in Law4Us, including AI-powered text transformation using Groq.

## Overview

The document generation system takes user input from the wizard and:
1. **Fills Word document templates** with user data
2. **Transforms user text** (first-person) to professional legal language (third-person) using Groq AI
3. **Generates filled documents** ready for submission

## Architecture

```
┌─────────────────┐
│  User Input     │
│  (Wizard Form)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  API Route      │
│  /api/generate- │
│  document       │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Document Service               │
│  ├─ Load template               │
│  ├─ Identify fields for AI      │
│  └─ Fill template                │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│  Groq Service   │────▶│  Groq AI API    │
│  (Transform     │     │  (llama-3.3)    │
│   text to legal)│◀────│                 │
└─────────────────┘     └─────────────────┘
         │
         ▼
┌─────────────────┐
│  Generated      │
│  Document       │
│  (.docx)        │
└─────────────────┘
```

## Setup

### 1. Get Groq API Key

1. Visit [https://console.groq.com/keys](https://console.groq.com/keys)
2. Sign up / Log in
3. Create a new API key
4. Copy the key

### 2. Configure Environment Variables

Create or update `.env.local`:

```bash
# Groq API Key for AI text transformation
GROQ_API_KEY=gsk_your_actual_key_here

# Existing Make.com webhook (keep this)
NEXT_PUBLIC_MAKE_WEBHOOK_URL=https://hook.eu1.make.com/your-webhook-id
```

### 3. Prepare Document Templates

Templates should be placed in the `/templates` directory:

```
templates/
  ├── תביעת רכושית.docx      (Property claim)
  ├── תביעת משמורת.docx      (Custody claim)
  ├── תביעת מזונות.docx      (Alimony claim)
  ├── תביעת גירושין.docx     (Divorce claim)
  └── הסכם גירושין.docx      (Divorce agreement)
```

#### Template Placeholders

Templates should use the following placeholder format:

**Basic Info:**
- `{applicantFullName}` - שם המבקש/ת
- `{applicantId}` - ת.ז. המבקש/ת
- `{applicantAddress}` - כתובת המבקש/ת
- `{applicantPhone}` - טלפון המבקש/ת
- `{applicantEmail}` - אימייל המבקש/ת
- `{respondentFullName}` - שם הנתבע/ת
- `{respondentId}` - ת.ז. הנתבע/ת
- `{respondentAddress}` - כתובת הנתבע/ת
- `{weddingDate}` - תאריך הנישואין
- `{currentDate}` - תאריך נוכחי

**AI-Transformed Fields** (these will be automatically converted to legal language):
- `{relationshipDescription}` - תיאור מערכת היחסים
- `{separationReason}` - סיבת הפרידה
- `{childRelationship}` - מערכת היחסים עם הילדים
- `{propertyDescription}` - תיאור הרכוש
- `{additionalInfo}` - מידע נוסף

**Form Data Fields:**
Any field from the wizard form can be used, for example:
- `{property.apartmentValue}` - שווי הדירה
- `{property.apartmentMortgage}` - יתרת משכנתא
- `{custody.custodyArrangement}` - סידור משמורת מבוקש

## Testing

### Option 1: Test Script

Run the automated test script:

```bash
npm run test:document-gen
```

This will:
1. Load test data
2. Call the document generation service
3. Transform text using Groq AI
4. Generate a test document
5. Save it to `/tmp` directory

### Option 2: Manual API Testing

Using curl or Postman:

```bash
curl -X POST http://localhost:3000/api/generate-document \
  -H "Content-Type: application/json" \
  -d '{
    "claimType": "property",
    "basicInfo": {
      "fullName": "יוסי כהן",
      "idNumber": "123456789",
      "fullName2": "שרה לוי",
      "idNumber2": "987654321",
      ...
    },
    "formData": {
      "propertyDescription": "אני ובעלי רכשנו דירה...",
      ...
    },
    "selectedClaims": ["property"]
  }'
```

### Option 3: Check Available Templates

```bash
curl http://localhost:3000/api/generate-document
```

Response:
```json
{
  "status": "ok",
  "endpoint": "/api/generate-document",
  "methods": ["POST", "GET"],
  "availableTemplates": {
    "property": true,
    "custody": false,
    "alimony": false,
    "divorce": false,
    "divorceAgreement": false
  },
  "groqConfigured": true
}
```

## AI Text Transformation

### How It Works

The system automatically identifies fields that benefit from AI transformation:
- Long text fields (> 50 characters)
- Textarea responses
- User descriptions and explanations

### Transformation Example

**User Input (First Person):**
```
אני ובעלי רכשנו דירה משותפת בשנת 2010. הדירה נמצאת ברחוב הרצל 10
בתל אביב. שילמנו על הדירה ביחד מהחיסכון המשותף שלנו.
```

**AI Output (Third Person Legal Language):**
```
המבקש/ת טוען/ת כי בשנת 2010 רכש/ה יחד עם הנתבע/ת דירה משותפת הממוקמת
ברחוב הרצל 10, תל אביב. המבקש/ת מציין/ה כי מימון הרכישה בוצע מחיסכון
משותף של הצדדים.
```

### Customizing AI Behavior

Edit `/lib/services/groq-service.ts` to customize:
- System prompt (legal style, tone)
- Temperature (consistency vs creativity)
- Model (speed vs quality)

## API Reference

### POST /api/generate-document

Generate a document for a specific claim type or all selected claims.

**Request Body:**

```typescript
{
  claimType?: ClaimType;           // Optional: specific claim to generate
  generateAll?: boolean;           // Optional: generate all selected claims
  basicInfo: {
    fullName: string;
    idNumber: string;
    // ... other basic info fields
  };
  formData: {
    [key: string]: any;            // All form answers
  };
  selectedClaims: ClaimType[];     // Array of selected claim types
}
```

**Response (Single Document):**

Binary `.docx` file with headers:
```
Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document
Content-Disposition: attachment; filename="property_1234567890.docx"
```

**Response (Multiple Documents):**

```json
{
  "success": true,
  "message": "3 מסמכים נוצרו בהצלחה",
  "documents": {
    "property": "/tmp/property_1234567890.docx",
    "custody": "/tmp/custody_1234567890.docx",
    "divorce": "/tmp/divorce_1234567890.docx"
  },
  "count": 3
}
```

### GET /api/generate-document

Check API status and available templates.

## Integration with Wizard

To integrate document generation into the wizard flow:

### Step 5 (Submission Page)

```typescript
// In wizard step-5 component
async function handleGenerateDocuments() {
  const response = await fetch('/api/generate-document', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      generateAll: true,
      basicInfo: wizardStore.basicInfo,
      formData: wizardStore.formData,
      selectedClaims: wizardStore.selectedClaims,
    }),
  });

  const result = await response.json();

  if (result.success) {
    // Documents generated successfully
    console.log('Generated documents:', result.documents);
    // Continue with submission...
  }
}
```

## Error Handling

### Common Errors

1. **"Template not found"**
   - Ensure template file exists in `/templates` directory
   - Check filename matches the claim type mapping

2. **"Groq API key not configured"**
   - Add `GROQ_API_KEY` to `.env.local`
   - Restart the dev server

3. **"Groq API error"**
   - Check API key is valid
   - Verify internet connection
   - Check Groq API status

### Fallback Behavior

If AI transformation fails:
- System automatically falls back to original user text
- Document generation continues without AI enhancement
- Error is logged but doesn't block document creation

## Performance

- **Single document**: ~3-5 seconds
  - Template loading: ~100ms
  - AI transformation: ~2-4 seconds
  - Document generation: ~200ms

- **Multiple documents**: ~5-10 seconds
  - Processes in parallel where possible

## Next Steps

1. ✅ Basic document generation working
2. ✅ AI text transformation integrated
3. 🔲 Add more document templates (custody, alimony, divorce)
4. 🔲 Preview documents before generation
5. 🔲 Optional: Convert to PDF
6. 🔲 Optional: Email documents to clients
7. 🔲 Optional: Store documents in cloud storage

## Support

For issues or questions:
1. Check error logs in console
2. Verify environment variables
3. Test with the test script
4. Review template placeholders

---

**Last Updated**: October 2024
**Version**: 1.0.0
