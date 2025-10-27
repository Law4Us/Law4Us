"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { number: 1, label: "פרטים בסיסיים" },
  { number: 2, label: "שאלון" },
  { number: 3, label: "חתימה" },
  { number: 4, label: "תשלום" },
  { number: 5, label: "סיום" },
];

interface WizardHeaderProps {
  currentStep: number; // 0-indexed
  maxReachedStep: number; // 0-indexed
  onStepClick: (step: number) => void;
}

export function WizardHeader({
  currentStep,
  maxReachedStep,
  onStepClick,
}: WizardHeaderProps) {
  return (
    <div className="bg-white border-b border-neutral">
      <div className="container-custom py-6">
        {/* Desktop: Horizontal stepper */}
        <div className="hidden md:flex items-center justify-between">
          {steps.map((step, index) => {
            const stepIndex = index; // 0-indexed
            const isCurrent = stepIndex === currentStep;
            const isCompleted = stepIndex < currentStep;
            const isClickable = stepIndex <= maxReachedStep;

            return (
              <React.Fragment key={step.number}>
                {/* Step Circle */}
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => isClickable && onStepClick(stepIndex)}
                    disabled={!isClickable}
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center font-bold text-body-large transition-smooth",
                      isCurrent &&
                        "bg-primary text-white ring-4 ring-primary/20",
                      isCompleted && "bg-primary text-white",
                      !isCurrent && !isCompleted && "bg-neutral-light text-neutral-dark",
                      isClickable && !isCurrent && "hover:bg-neutral cursor-pointer",
                      !isClickable && "cursor-not-allowed opacity-50"
                    )}
                    aria-label={`שלב ${step.number}: ${step.label}`}
                    aria-current={isCurrent ? "step" : undefined}
                  >
                    {isCompleted ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      step.number
                    )}
                  </button>
                  <span
                    className={cn(
                      "mt-2 text-body-small font-medium",
                      isCurrent ? "text-primary" : "text-neutral-dark"
                    )}
                  >
                    {step.label}
                  </span>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="flex-1 h-0.5 mx-4 relative">
                    <div className="absolute inset-0 bg-neutral-light" />
                    <div
                      className={cn(
                        "absolute inset-0 bg-primary transition-all duration-500",
                        isCompleted ? "w-full" : "w-0"
                      )}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Mobile: Simplified stepper */}
        <div className="md:hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-h3 font-semibold">
              {steps[currentStep].label}
            </span>
            <span className="text-body text-neutral-dark">
              {currentStep + 1} / {steps.length}
            </span>
          </div>
          {/* Progress bar */}
          <div className="h-2 bg-neutral-light rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
