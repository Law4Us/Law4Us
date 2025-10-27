"use client";

import * as React from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

export interface SignaturePadProps {
  value?: string; // Base64 PNG data URL
  onChange?: (signature: string) => void;
  className?: string;
}

/**
 * Signature pad component using canvas
 * Outputs base64 PNG data URL
 */
export function SignaturePad({
  value,
  onChange,
  className,
}: SignaturePadProps) {
  const canvasRef = React.useRef<SignatureCanvas>(null);
  const [isSigned, setIsSigned] = React.useState(false);

  // Load existing signature if provided
  React.useEffect(() => {
    if (value && canvasRef.current && !isSigned) {
      canvasRef.current.fromDataURL(value);
      setIsSigned(true);
    }
  }, [value]);

  const handleClear = () => {
    canvasRef.current?.clear();
    setIsSigned(false);
    onChange?.("");
  };

  const handleSign = () => {
    if (canvasRef.current?.isEmpty()) {
      alert("אנא חתמו על הטופס לפני השמירה");
      return;
    }

    const dataURL = canvasRef.current?.toDataURL("image/png");
    if (dataURL) {
      setIsSigned(true);
      onChange?.(dataURL);
    }
  };

  const handleBeginStroke = () => {
    // User started drawing, mark as unsigned until they click "Sign"
    if (isSigned) {
      setIsSigned(false);
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative border-2 border-neutral rounded-lg overflow-hidden bg-white">
        <SignatureCanvas
          ref={canvasRef}
          canvasProps={{
            className: "w-full h-[200px] touch-none",
            style: { touchAction: "none" },
          }}
          backgroundColor="white"
          penColor="black"
          onBegin={handleBeginStroke}
        />

        {/* Signature line */}
        <div className="absolute bottom-4 left-8 right-8 border-b-2 border-neutral-dark pointer-events-none" />
      </div>

      <div className="flex gap-3 justify-center">
        <Button
          type="button"
          variant="outline"
          onClick={handleClear}
          disabled={canvasRef.current?.isEmpty() && !value}
        >
          נקה חתימה
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={handleSign}
          disabled={isSigned}
        >
          {isSigned ? "✓ נחתם" : "חתום"}
        </Button>
      </div>

      <p className="text-caption text-neutral-dark text-center">
        חתמו באמצעות העכבר, המסך מגע, או העט הדיגיטלי
      </p>
    </div>
  );
}
