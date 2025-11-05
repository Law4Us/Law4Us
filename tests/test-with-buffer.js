/**
 * Test with Buffer and Readable stream like the actual code
 */

const { google } = require('googleapis');
const { Readable } = require('stream');
require('dotenv').config();

async function testWithBuffer() {
  console.log('🧪 Testing with Buffer and Readable Stream\n');

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/drive'],
  });

  const drive = google.drive({ version: 'v3', auth });

  try {
    // Create a test JSON buffer
    const testData = { message: 'This is a test', timestamp: Date.now() };
    const jsonBuffer = Buffer.from(JSON.stringify(testData, null, 2));

    console.log(`1️⃣ Created buffer: ${jsonBuffer.length} bytes`);

    // Convert buffer to stream (exactly like our code)
    const bufferStream = new Readable();
    bufferStream.push(jsonBuffer);
    bufferStream.push(null);

    // Create folder first
    console.log('2️⃣ Creating folder...');
    const folderMetadata = {
      name: `test-buffer-${Date.now()}`,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
    };

    const folder = await drive.files.create({
      requestBody: folderMetadata,
      fields: 'id, name',
      supportsAllDrives: true,
    });

    console.log(`   ✅ Folder created: ${folder.data.id}`);

    // Upload to folder with buffer stream
    console.log('3️⃣ Uploading with buffer stream...');
    const fileMetadata = {
      name: 'test-data.json',
      parents: [folder.data.id],
    };

    const media = {
      mimeType: 'application/json',
      body: bufferStream,
    };

    const file = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, name, webViewLink',
      supportsAllDrives: true,
    });

    console.log(`   ✅ File uploaded: ${file.data.name}`);
    console.log(`   ID: ${file.data.id}`);
    console.log(`   Link: ${file.data.webViewLink}`);

    // Clean up
    console.log('4️⃣ Cleaning up...');
    await drive.files.delete({ fileId: file.data.id, supportsAllDrives: true });
    await drive.files.delete({ fileId: folder.data.id, supportsAllDrives: true });
    console.log('   ✅ Cleaned up');

    console.log('\n🎉 TEST PASSED! Buffer stream upload works!');

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

testWithBuffer();
