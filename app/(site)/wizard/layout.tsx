"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { WizardHeader } from "@/components/wizard/wizard-header";
import { useWizardStore } from "@/lib/stores/wizard-store";

export default function WizardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { currentStep, maxReachedStep, goToStep } = useWizardStore();
  const [showExitDialog, setShowExitDialog] = React.useState(false);

  // Handle step navigation
  const handleStepClick = (step: number) => {
    if (step === 0) {
      router.push("/wizard");
    } else {
      router.push(`/wizard/step-${step + 1}`);
    }
    goToStep(step);
  };

  // Prevent accidental navigation away
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Only show warning if user has entered data
      if (currentStep > 0 || maxReachedStep > 0) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [currentStep, maxReachedStep]);

  return (
    <div className="min-h-screen bg-neutral-lightest">
      {/* Wizard Header */}
      <WizardHeader
        currentStep={currentStep}
        maxReachedStep={maxReachedStep}
        onStepClick={handleStepClick}
      />

      {/* Content */}
      <div className="container-custom py-12">
        {children}
      </div>

      {/* Auto-save indicator could go here */}
      {/* Exit confirmation dialog could go here */}
    </div>
  );
}
