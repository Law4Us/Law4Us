const { Document, Paragraph, Table, TableRow, TableCell, Packer, WidthType, AlignmentType } = require('docx');
const fs = require('fs');

// Create a simple document with a table
const doc = new Document({
  sections: [{
    children: [
      new Paragraph({ text: 'Before table' }),
      new Table({
        rows: [
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ text: 'Cell 1' })] }),
              new TableCell({ children: [new Paragraph({ text: 'Cell 2' })] }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ text: 'Cell 3' })] }),
              new TableCell({ children: [new Paragraph({ text: 'Cell 4' })] }),
            ],
          }),
        ],
        width: { size: 100, type: WidthType.PERCENTAGE },
      }),
      new Paragraph({ text: 'After table' }),
    ],
  }],
});

// Save the document
Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync('test-table.docx', buffer);
  const sizeKB = (buffer.length / 1024).toFixed(2);
  console.log(`✅ Test document created: ${sizeKB} KB`);
  console.log(`   File: test-table.docx`);
});
