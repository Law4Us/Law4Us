"use client";

import * as React from "react";
import { Check, Lock } from "lucide-react";
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
  canNavigateToStep?: (step: number) => boolean; // Optional validation function
}

export function WizardHeader({
  currentStep,
  maxReachedStep,
  onStepClick,
  canNavigateToStep,
}: WizardHeaderProps) {
  return (
    <div className="bg-gradient-to-b from-white via-neutral-lightest to-transparent shadow-sm relative z-40">
      <div className="container-custom py-8">
        {/* Desktop: Horizontal stepper */}
        <div className="hidden md:flex items-center justify-between max-w-5xl mx-auto">
          {steps.map((step, index) => {
            const stepIndex = index; // 0-indexed
            const isCurrent = stepIndex === currentStep;
            const isCompleted = stepIndex < currentStep;
            const isFuture = stepIndex > currentStep;
            const isClickable = canNavigateToStep
              ? canNavigateToStep(stepIndex)
              : stepIndex <= maxReachedStep;

            return (
              <React.Fragment key={step.number}>
                {/* Step Circle */}
                <div className="flex flex-col items-center gap-3">
                  <button
                    onClick={() => isClickable && onStepClick(stepIndex)}
                    disabled={!isClickable}
                    className={cn(
                      "w-14 h-14 rounded-full flex items-center justify-center font-bold text-h4 transition-all duration-300 relative",
                      isCurrent &&
                        "bg-primary text-white ring-4 ring-primary/20 shadow-lg scale-110",
                      isCompleted && "bg-green-500 text-white hover:shadow-md hover:scale-105",
                      isFuture && !isClickable && "bg-white border-2 border-neutral-light text-neutral-dark",
                      isClickable && !isCurrent && "bg-white border-2 border-primary/30 text-primary hover:shadow-md hover:scale-105 cursor-pointer",
                      !isClickable && "cursor-not-allowed opacity-40"
                    )}
                    aria-label={`שלב ${step.number}: ${step.label}`}
                    aria-current={isCurrent ? "step" : undefined}
                    aria-disabled={!isClickable}
                  >
                    {isCompleted ? (
                      <Check className="w-7 h-7" strokeWidth={3} />
                    ) : isFuture && !isClickable ? (
                      <Lock className="w-6 h-6" />
                    ) : (
                      step.number
                    )}
                  </button>
                  <span
                    className={cn(
                      "text-body font-medium transition-all duration-300 text-center",
                      isCurrent && "text-primary font-bold text-body-large",
                      isCompleted && "text-green-700 font-semibold",
                      isFuture && !isClickable && "text-neutral-dark opacity-60"
                    )}
                  >
                    {step.label}
                  </span>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="flex-1 h-1 mx-6 relative rounded-full overflow-hidden">
                    <div className="absolute inset-0 bg-neutral-light" />
                    <div
                      className={cn(
                        "absolute inset-0 transition-all duration-700 ease-out",
                        isCompleted ? "bg-green-500 w-full" : "bg-primary/30 w-0"
                      )}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Mobile: Enhanced stepper */}
        <div className="md:hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-body-small text-neutral-dark font-medium mb-1">
                שלב {currentStep + 1} מתוך {steps.length}
              </div>
              <div className="text-h3 font-bold text-primary">
                {steps[currentStep].label}
              </div>
            </div>
            <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center font-bold text-h3 shadow-md">
              {currentStep + 1}
            </div>
          </div>
          {/* Progress bar */}
          <div className="h-3 bg-neutral-light rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-700 ease-out rounded-full"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
          {/* Step indicators */}
          <div className="flex justify-between mt-3 px-1">
            {steps.map((step, index) => {
              const isPast = index < currentStep;
              const isCurrent = index === currentStep;
              return (
                <div
                  key={index}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    isPast && "bg-green-500",
                    isCurrent && "bg-primary scale-150",
                    !isPast && !isCurrent && "bg-neutral-light"
                  )}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
