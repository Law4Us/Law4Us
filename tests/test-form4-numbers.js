const fs = require('fs');
const path = require('path');

// Test Form 4 generation with numbers
async function testForm4Numbers() {
  console.log('Testing Form 4 PNG generation with numbers...\n');

  try {
    // Import the PNG overlay service
    const { generateForm4PngWithOverlay } = require('../lib/api/services/form4-png-overlay');

    // Create test data with LOTS of numbers
    const testData = {
      // Header
      applicantName: 'שרה כהן',
      respondentName: 'דוד לוי',

      // Personal details with numbers
      applicantId: '123456789',
      respondentId: '987654321',
      applicantAddress: 'רחוב הרצל 25, תל אביב',
      respondentAddress: 'שד רוטשילד 100, תל אביב',
      applicantBirthDate: '1980-05-15',
      respondentBirthDate: '1978-03-20',

      // Relationship
      relationshipType: 'married',
      marriageDate: '2005-06-10',
      separationDate: '2023-01-15',
      livingTogether: false,

      // Children
      children: [
        {
          name: 'ילד 1',
          birthDate: '2010-08-12',
          residingWith: 'applicant'
        }
      ],

      // Previous proceedings
      hasPreviousProceedings: false,

      // Last alimony - WITH NUMBERS!
      lastAlimonyAmount: '5000',
      lastAlimonyDate: '2023-12-01',

      // Employment with LOTS of numbers
      applicantEmployment: {
        status: 'מועסק/ת',
        employer: 'חברת הייטק בע"מ',
        monthlyIncome: 15000,  // ₪15,000
        annualIncome: 180000,   // ₪180,000
        additionalIncome: 'הכנסות נוספות 2000 ש"ח'
      },

      respondentEmployment: {
        status: 'מועסק/ת',
        employer: 'בנק לאומי',
        estimatedIncome: 25000,  // ₪25,000
        additionalIncome: 'הכנסות נוספות 3000 ש"ח'
      },

      // Property
      applicantProperty: {
        realEstate: 'דירה בשווי 2,500,000 ש"ח',
        movableProperty: 'רכב בשווי 150,000 ש"ח',
        investments: 'חשבונות בנק 500,000 ש"ח'
      },

      respondentProperty: {
        realEstate: '',
        movableProperty: '',
        investments: ''
      },

      // Debts
      applicantDebts: 'הלוואות 300,000 ש"ח',
      respondentDebts: 'אין',

      // Housing
      applicantHousing: {
        type: 'owner',
        monthlyExpense: 8000  // ₪8,000
      },

      respondentHousing: {
        type: 'renter',
        monthlyExpense: 6000  // ₪6,000
      },

      // Bank accounts with numbers
      bankAccounts: [
        { bankName: 'בנק לאומי', accountNumber: '123-456-789' },
        { bankName: 'בנק הפועלים', accountNumber: '987-654-321' }
      ],

      // Vehicle
      hasVehicle: true,
      vehicleDetails: 'טויוטה קורולה 2020',

      // Children needs with numbers
      childrenNeeds: [
        { category: 'חינוך', description: 'שכר לימוד', monthlyAmount: 2000 },
        { category: 'בריאות', description: 'ביטוח בריאות', monthlyAmount: 500 },
        { category: 'ביגוד', description: 'ביגוד ונעליים', monthlyAmount: 800 }
      ],

      // Household needs with numbers
      householdNeeds: [
        { category: 'דיור', description: 'שכר דירה', monthlyAmount: 6000 },
        { category: 'מזון', description: 'קניות שבועיות', monthlyAmount: 3000 },
        { category: 'חשמל', description: 'חשבון חשמל', monthlyAmount: 400 }
      ]
    };

    console.log('📋 Generating Form 4 with test data...');
    console.log('   Expected numbers to see:');
    console.log('   - IDs: 123456789, 987654321');
    console.log('   - Addresses: רחוב הרצל 25, שד רוטשילד 100');
    console.log('   - Monthly incomes: ₪15,000, ₪25,000');
    console.log('   - Housing expenses: ₪8,000, ₪6,000');
    console.log('   - Child needs: ₪2,000, ₪500, ₪800');
    console.log('   - Household needs: ₪6,000, ₪3,000, ₪400\n');

    // Generate the Form 4 PNGs
    const images = await generateForm4PngWithOverlay(testData, 150);

    console.log(`\n✅ Generated ${images.length} PNG pages`);

    // Save to tmp folder for inspection
    const outputDir = path.join(__dirname, '..', 'tmp', 'form4-test');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    for (let i = 0; i < images.length; i++) {
      const outputPath = path.join(outputDir, `form4-page-${i + 1}.png`);
      fs.writeFileSync(outputPath, images[i]);
      const sizeKB = (images[i].length / 1024).toFixed(2);
      console.log(`   Saved page ${i + 1} to: ${outputPath} (${sizeKB} KB)`);
    }

    console.log('\n' + '='.repeat(70));
    console.log('INSPECTION INSTRUCTIONS:');
    console.log('='.repeat(70));
    console.log('Open the PNG files in the tmp/form4-test/ folder and check:');
    console.log('  ✓ Do Hebrew letters appear? (שרה, דוד, רחוב, etc.)');
    console.log('  ? Do numbers appear? (123456789, 15,000, 25,000, etc.)');
    console.log('  ? Do addresses with numbers appear? (רחוב הרצל 25)');
    console.log('\nIf numbers are MISSING, this confirms the rendering issue.');
    console.log('If numbers ARE visible, the issue is elsewhere in the pipeline.');
    console.log('='.repeat(70));

  } catch (error) {
    console.error('\n❌ Error generating Form 4:');
    console.error(error);
    console.error('\nStack trace:');
    console.error(error.stack);
  }
}

// Run the test
testForm4Numbers().then(() => {
  console.log('\n✅ Test complete');
}).catch((error) => {
  console.error('\n❌ Test failed:', error);
  process.exit(1);
});
