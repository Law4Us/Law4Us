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

  // Handle step navigation
  const handleStepClick = (step: number) => {
    if (step === 0) {
      router.push("/wizard");
    } else {
      router.push(`/wizard/step-${step + 1}`);
    }
    goToStep(step);
  };

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
        <div className="max-w-5xl mx-auto w-full">
          {children}
        </div>
      </div>

      {/* Auto-save indicator could go here */}
      {/* Exit confirmation dialog could go here */}
    </div>
  );
}
