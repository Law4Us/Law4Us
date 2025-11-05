#!/bin/bash

# Script to add the lawyer signature to .env.local file
# Run this once during setup

SIGNATURE_FILE="/Users/dortagger/Law4Us/Signature.png"
ENV_FILE="/Users/dortagger/Law4Us/.env.local"

if [ ! -f "$SIGNATURE_FILE" ]; then
  echo "Error: Signature.png not found at $SIGNATURE_FILE"
  exit 1
fi

# Convert to base64
echo "Converting Signature.png to base64..."
SIGNATURE_BASE64=$(base64 -i "$SIGNATURE_FILE")

# Check if LAWYER_SIGNATURE_BASE64 already exists in .env.local
if grep -q "LAWYER_SIGNATURE_BASE64=" "$ENV_FILE"; then
  echo "Updating existing LAWYER_SIGNATURE_BASE64 in .env.local..."
  # Use a temporary file for safe editing
  sed "s|^LAWYER_SIGNATURE_BASE64=.*|LAWYER_SIGNATURE_BASE64=$SIGNATURE_BASE64|" "$ENV_FILE" > "$ENV_FILE.tmp"
  mv "$ENV_FILE.tmp" "$ENV_FILE"
else
  echo "Adding LAWYER_SIGNATURE_BASE64 to .env.local..."
  echo "" >> "$ENV_FILE"
  echo "# Lawyer signature (auto-generated)" >> "$ENV_FILE"
  echo "LAWYER_SIGNATURE_BASE64=$SIGNATURE_BASE64" >> "$ENV_FILE"
fi

echo "✅ Signature added to .env.local successfully!"
echo "📏 Signature length: ${#SIGNATURE_BASE64} characters"
