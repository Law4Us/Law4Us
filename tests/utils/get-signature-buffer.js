const fs = require('fs');
const path = require('path');

const DRIVE_SIGNATURE_ID = '1vCDmhti8cMpdTm76bVN3bhrXMJMO6bf5';

const candidatePaths = [
  path.join(process.cwd(), 'Signature.png'),
  path.join(__dirname, '..', 'Signature.png'),
  path.join(process.cwd(), 'public', 'images', 'archive', 'Signature.png'),
];

function findSignaturePath() {
  for (const candidate of candidatePaths) {
    if (candidate && fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return null;
}

function getSignatureBuffer() {
  const signaturePath = findSignaturePath();

  if (!signaturePath) {
    throw new Error(
      [
        'Signature image not found. Please download the lawyer signature (Ariel Dror) and place it at the repo root as Signature.png.',
        `Drive file ID: ${DRIVE_SIGNATURE_ID}`,
        'You can run scripts/add-signature-to-env.sh or download manually from Google Drive.',
      ].join(' ')
    );
  }

  const buffer = fs.readFileSync(signaturePath);
  return buffer;
}

function getSignatureBase64() {
  const buffer = getSignatureBuffer();
  return `data:image/png;base64,${buffer.toString('base64')}`;
}

module.exports = {
  getSignatureBuffer,
  getSignatureBase64,
};
