/**
 * Test creating a folder in Shared Drive and then uploading to it
 */

const { google } = require('googleapis');
require('dotenv').config();

async function testFolderAndUpload() {
  console.log('🧪 Testing Folder Creation + File Upload\n');

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/drive'],
  });

  const drive = google.drive({ version: 'v3', auth });

  try {
    // Step 1: Create a folder in the Shared Drive
    console.log('1️⃣ Creating folder in Shared Drive...');
    const folderName = `test-folder-${Date.now()}`;

    const folderMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
    };

    const folder = await drive.files.create({
      requestBody: folderMetadata,
      fields: 'id, name, parents',
      supportsAllDrives: true,
    });

    console.log(`   ✅ Folder created: "${folder.data.name}"`);
    console.log(`   ID: ${folder.data.id}`);
    console.log(`   Parents: ${folder.data.parents}`);
    console.log('');

    // Step 2: Upload a file to that folder
    console.log('2️⃣ Uploading file to the folder...');

    const fileMetadata = {
      name: 'test-file.txt',
      parents: [folder.data.id], // Use the folder ID as parent
    };

    const media = {
      mimeType: 'text/plain',
      body: 'This is a test file in a subfolder',
    };

    const file = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, name, webViewLink, parents',
      supportsAllDrives: true,
    });

    console.log(`   ✅ File created: "${file.data.name}"`);
    console.log(`   ID: ${file.data.id}`);
    console.log(`   Parents: ${file.data.parents}`);
    console.log(`   Link: ${file.data.webViewLink}`);
    console.log('');

    // Clean up
    console.log('3️⃣ Cleaning up...');
    await drive.files.delete({
      fileId: file.data.id,
      supportsAllDrives: true,
    });
    console.log('   ✅ File deleted');

    await drive.files.delete({
      fileId: folder.data.id,
      supportsAllDrives: true,
    });
    console.log('   ✅ Folder deleted');
    console.log('');

    console.log('🎉 TEST PASSED! Folder creation + file upload works!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code) {
      console.error(`   Code: ${error.code}`);
    }
    if (error.errors && error.errors[0]) {
      console.error(`   Details: ${error.errors[0].message}`);
    }
    console.error('\n   Full error:', JSON.stringify(error, null, 2));
  }
}

testFolderAndUpload();
