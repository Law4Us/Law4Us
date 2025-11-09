/**
 * Debug test for Form 4 PNG generation
 * Saves PNGs to disk for visual inspection
 */

const fs = require('fs');
const path = require('path');

async function testForm4PngGeneration() {
  console.log('\n🧪 Testing Form 4 PNG Generation (Debug)...\n');

  try {
    // Import the form4-png-overlay service
    const { generateForm4PngWithOverlay } = require('./dist/services/form4-png-overlay');
    const { mapFormDataToForm4Data } = require('./dist/services/form4-filler');

    // Minimal test data
    const basicInfo = {
      fullName: "שרה לוי",
      idNumber: "345678901",
      address: "רחוב ירושלים 24, רעננה",
      birthDate: "1985-05-10",
      fullName2: "יוסי לוי",
      idNumber2: "456789012",
      address2: "רחוב הרצל 56, כפר סבא",
      birthDate2: "1983-11-25",
    };

    const formData = {
      property: {
        children: [
          {
            name: "נועם לוי",
            birthDate: "2012-03-14",
            residingWith: "applicant",
          },
        ],
        marriageDate: "2010-06-15",
        separationDate: "2024-02-01",
        applicantEmploymentStatus: "employed",
        applicantEmployer: "חברת הייטק",
        applicantGrossSalary: 12500,
        respondentEmploymentStatus: "employed",
        respondentEstimatedIncome: 22000,
      },
      alimony: {
        childrenNeeds: [],
        householdNeeds: [],
        bankAccounts: [],
        hasVehicle: "no",
      },
    };

    // Map to Form4Data structure
    const form4Data = mapFormDataToForm4Data(basicInfo, formData);

    console.log('📋 Form 4 Data:');
    console.log(`   Applicant: ${form4Data.applicantName}`);
    console.log(`   Respondent: ${form4Data.respondentName}`);
    console.log('');

    // Generate PNGs
    console.log('🖼️  Generating Form 4 PNGs...');
    const pngImages = await generateForm4PngWithOverlay(form4Data, 150);

    console.log(`\n✅ Generated ${pngImages.length} PNG images`);
    console.log('');

    // Save PNGs to disk for inspection
    const outputDir = path.join(__dirname, 'debug-output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    pngImages.forEach((imageBuffer, index) => {
      const filename = `form4-page-${index + 1}.png`;
      const filepath = path.join(outputDir, filename);
      fs.writeFileSync(filepath, imageBuffer);
      console.log(`💾 Saved: ${filepath} (${(imageBuffer.length / 1024).toFixed(2)} KB)`);
    });

    console.log('');
    console.log('🎉 Debug output saved to: debug-output/');
    console.log('   Open these PNG files to inspect the generated Form 4 pages');

  } catch (error) {
    console.error('\n❌ Error:', error);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
  }
}

testForm4PngGeneration();
