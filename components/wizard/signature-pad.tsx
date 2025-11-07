"use client";

import * as React from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui";
import { Check } from "lucide-react";
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
    <div className={cn("space-y-4", className)}>
      <div
        className={cn(
          "relative border-2 rounded-xl overflow-hidden bg-white shadow-sm transition-all duration-300",
          isSigned && "border-green-400 ring-4 ring-green-100",
          !isSigned && "border-neutral hover:border-primary/50"
        )}
      >
        <SignatureCanvas
          ref={canvasRef}
          canvasProps={{
            className: "w-full h-[250px] md:h-[300px] touch-none",
            style: { touchAction: "none" },
          }}
          backgroundColor="white"
          penColor="#0C1719"
          minWidth={1.5}
          maxWidth={3}
          onBegin={handleBeginStroke}
        />

        {/* Signature line */}
        <div className="absolute bottom-6 left-12 right-12 border-b-2 border-dashed border-neutral-dark/30 pointer-events-none" />

        {/* Placeholder text */}
        {!value && canvasRef.current?.isEmpty() && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-body text-neutral-dark/40 font-medium">
              חתמו כאן
            </p>
          </div>
        )}

        {/* Signed indicator */}
        {isSigned && (
          <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-caption font-bold flex items-center gap-1 shadow-md">
            <Check className="w-4 h-4" />
            נחתם
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          type="button"
          variant="outline"
          onClick={handleClear}
          disabled={canvasRef.current?.isEmpty() && !value}
          className="flex-1 sm:flex-none"
        >
          נקה חתימה
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={handleSign}
          disabled={isSigned}
          size="lg"
          className="flex-1 sm:flex-none min-w-[200px]"
        >
          {isSigned ? (
            <>
              <Check className="w-5 h-5 ml-2" />
              החתימה נשמרה
            </>
          ) : (
            "שמור חתימה"
          )}
        </Button>
      </div>

      <div className="text-center space-y-2">
        <p className="text-body-small text-neutral-dark">
          חתמו באמצעות העכבר, מסך מגע, או עט דיגיטלי
        </p>
        <p className="text-caption text-neutral-dark">
          החתימה תופיע על כל המסמכים המשפטיים
        </p>
      </div>
    </div>
  );
}
