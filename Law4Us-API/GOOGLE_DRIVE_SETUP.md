# Google Drive Setup Guide

This guide will help you set up Google Drive integration for storing submission documents.

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Name it something like "Law4Us Documents"

## Step 2: Enable Google Drive API

1. In the Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for "Google Drive API"
3. Click on it and press **Enable**

## Step 3: Create a Service Account

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **Service Account**
3. Fill in the details:
   - **Service account name**: `law4us-backend`
   - **Service account ID**: (auto-generated)
   - **Description**: "Backend service for document storage"
4. Click **Create and Continue**
5. **Grant this service account access to project**:
   - Role: **Editor** (or just "Drive API")
6. Click **Done**

## Step 4: Generate Private Key

1. Find your newly created service account in the list
2. Click on it to open details
3. Go to the **Keys** tab
4. Click **Add Key** > **Create new key**
5. Choose **JSON** format
6. Click **Create**
7. A JSON file will be downloaded to your computer
8. **Keep this file safe!** It contains your credentials

## Step 5: Create a Google Drive Folder

1. Open [Google Drive](https://drive.google.com/)
2. Create a new folder called "Law4Us Submissions"
3. Copy the folder ID from the URL:
   - The URL will look like: `https://drive.google.com/drive/folders/FOLDER_ID_HERE`
   - Copy the `FOLDER_ID_HERE` part
4. Share this folder with your service account email:
   - Right-click the folder > **Share**
   - Add the service account email (from the JSON file: `client_email` field)
   - Give it **Editor** permissions

## Step 6: Configure Environment Variables

Open the downloaded JSON file and extract these values:

```json
{
  "client_email": "law4us-backend@your-project.iam.gserviceaccount.com",
  "private_key": "-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
}
```

### For Railway (Production):

Add these environment variables in Railway dashboard:

```
GOOGLE_SERVICE_ACCOUNT_EMAIL=law4us-backend@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
GOOGLE_DRIVE_FOLDER_ID=your_folder_id_from_step_5
FRONTEND_URL=https://your-vercel-app.vercel.app
```

**Important for Railway:**
- The `GOOGLE_PRIVATE_KEY` must be in quotes
- Keep the `\n` newlines in the private key
- Don't remove any dashes or formatting

### For Local Development:

Create `.env` file in `Law4Us-API` folder:

```env
# Google Drive Configuration
GOOGLE_SERVICE_ACCOUNT_EMAIL=law4us-backend@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
GOOGLE_DRIVE_FOLDER_ID=your_folder_id_from_step_5

# Other settings
PORT=3001
GROQ_API_KEY=your_groq_api_key
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

## Step 7: Test the Integration

Once configured, test by:

1. Running the backend: `npm run dev`
2. Submitting a test form through the wizard
3. Checking your Google Drive folder for the generated documents

## Troubleshooting

### Error: "Unable to authenticate"
- Check that the service account email is correct
- Verify the private key has proper formatting (including `\n` newlines)

### Error: "Insufficient Permission"
- Make sure you shared the folder with the service account email
- Give the service account "Editor" permissions

### Error: "File not found"
- Verify the `GOOGLE_DRIVE_FOLDER_ID` is correct
- Check the folder still exists and hasn't been moved

## File Structure in Google Drive

Each submission creates a folder structure like:

```
Law4Us Submissions/
├── Yossi_Cohen_123456789_2025-01-15/
│   ├── submission-data.json
│   ├── ייפוי-כוח.docx
│   ├── טופס-3.docx
│   └── attachments/
│       └── ...
└── Sarah_Levi_987654321_2025-01-16/
    └── ...
```
