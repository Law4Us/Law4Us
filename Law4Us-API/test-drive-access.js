/**
 * Diagnostic script to test Google Drive Shared Drive access
 */

const { google } = require('googleapis');
require('dotenv').config();

async function testDriveAccess() {
  console.log('🧪 Testing Google Drive Shared Drive Access\n');

  // Test 1: Check environment variables
  console.log('1️⃣ Environment Variables:');
  console.log(`   Email: ${process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL}`);
  console.log(`   Private Key: ${process.env.GOOGLE_PRIVATE_KEY ? '✅ Present' : '❌ Missing'}`);
  console.log(`   Folder ID: ${process.env.GOOGLE_DRIVE_FOLDER_ID}`);
  console.log('');

  // Initialize with full drive scope
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/drive'], // Full drive access
  });

  const drive = google.drive({ version: 'v3', auth });

  try {
    // Test 2: Try to get Shared Drive details
    console.log('2️⃣ Testing Shared Drive Access:');
    const driveInfo = await drive.drives.get({
      driveId: process.env.GOOGLE_DRIVE_FOLDER_ID,
      fields: 'id, name, capabilities',
    });
    console.log(`   ✅ Shared Drive found: "${driveInfo.data.name}"`);
    console.log(`   ID: ${driveInfo.data.id}`);
    console.log(`   Can add children: ${driveInfo.data.capabilities?.canAddChildren}`);
    console.log('');

    // Test 3: Try to list files in Shared Drive
    console.log('3️⃣ Testing File Listing:');
    const files = await drive.files.list({
      corpora: 'drive',
      driveId: process.env.GOOGLE_DRIVE_FOLDER_ID,
      includeItemsFromAllDrives: true,
      supportsAllDrives: true,
      fields: 'files(id, name, mimeType)',
      pageSize: 10,
    });
    console.log(`   ✅ Found ${files.data.files?.length || 0} files/folders`);
    if (files.data.files && files.data.files.length > 0) {
      files.data.files.forEach(file => {
        console.log(`      - ${file.name} (${file.mimeType})`);
      });
    }
    console.log('');

    // Test 4: Try to create a test file
    console.log('4️⃣ Testing File Creation:');
    const testFileName = `test-${Date.now()}.txt`;
    const fileMetadata = {
      name: testFileName,
      mimeType: 'text/plain',
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
    };

    const media = {
      mimeType: 'text/plain',
      body: 'This is a test file created by the diagnostic script',
    };

    const file = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, name, webViewLink',
      supportsAllDrives: true,
    });

    console.log(`   ✅ File created successfully!`);
    console.log(`   Name: ${file.data.name}`);
    console.log(`   ID: ${file.data.id}`);
    console.log(`   Link: ${file.data.webViewLink}`);
    console.log('');

    // Clean up the test file
    console.log('5️⃣ Cleaning up test file...');
    await drive.files.delete({
      fileId: file.data.id,
      supportsAllDrives: true,
    });
    console.log('   ✅ Test file deleted');
    console.log('');

    console.log('🎉 ALL TESTS PASSED! Shared Drive access is working correctly.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code) {
      console.error(`   Code: ${error.code}`);
    }
    if (error.errors && error.errors[0]) {
      console.error(`   Details: ${error.errors[0].message}`);
    }
  }
}

testDriveAccess();
