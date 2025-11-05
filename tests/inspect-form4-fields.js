const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

async function inspectForm4Fields() {
  console.log('🔍 Inspecting Form 4 PDF fields...\n');

  const pdfPath = './form4-template.pdf';
  const pdfBytes = fs.readFileSync(pdfPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);

  const form = pdfDoc.getForm();
  const fields = form.getFields();

  console.log(`📊 Total fields found: ${fields.length}\n`);

  if (fields.length === 0) {
    console.log('⚠️  No form fields found in PDF!');
    console.log('    This means the PDF is either:');
    console.log('    - A scanned image without form fields');
    console.log('    - A flattened PDF (fields removed)');
    console.log('    - Not a fillable form\n');
    return;
  }

  fields.forEach((field, index) => {
    const name = field.getName();
    const type = field.constructor.name;
    console.log(`${index + 1}. Name: "${name}"`);
    console.log(`   Type: ${type}\n`);
  });
}

inspectForm4Fields().catch(console.error);
