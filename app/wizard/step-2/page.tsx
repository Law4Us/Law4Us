"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui";
import { useWizardStore } from "@/lib/stores/wizard-store";
import { QuestionsList } from "@/components/wizard/question-renderer";
import {
  GLOBAL_QUESTIONS,
  CLAIM_QUESTIONS_MAP,
  type Question,
} from "@/lib/constants/questions";
import { globalQuestionsSchema } from "@/lib/schemas/global-questions";
import { CLAIMS } from "@/lib/constants/claims";
import { z } from "zod";

export default function Step2DynamicForm() {
  const router = useRouter();
  const {
    basicInfo,
    selectedClaims,
    formData,
    updateFormData,
    nextStep,
    prevStep,
  } = useWizardStore();

  // Build dynamic schema based on selected claims
  const dynamicSchema = React.useMemo(() => {
    let schema = globalQuestionsSchema;

    // Add schemas for each selected claim
    selectedClaims.forEach((claimKey) => {
      const claimSchemaModule = require(`@/lib/schemas/claim-schemas`);
      const claimSchemaName = `${claimKey}Schema`;
      if (claimSchemaModule[claimSchemaName]) {
        schema = schema.merge(
          z.object({
            [claimKey]: claimSchemaModule[claimSchemaName],
          })
        );
      }
    });

    return schema;
  }, [selectedClaims]);

  // Collect all questions (global + claim-specific)
  const allQuestions = React.useMemo(() => {
    const questions: Question[] = [...GLOBAL_QUESTIONS];

    // Add claim-specific questions
    selectedClaims.forEach((claimKey) => {
      const claimQuestions = CLAIM_QUESTIONS_MAP[claimKey];
      if (claimQuestions) {
        questions.push(...claimQuestions);
      }
    });

    return questions;
  }, [selectedClaims]);

  // Replace dynamic names in question labels
  const processedQuestions = React.useMemo(() => {
    const applicantName = basicInfo.fullName || "המבקש/ת";
    const respondentName = basicInfo.fullName2 || "הנתבע/ת";

    return allQuestions.map((q) => ({
      ...q,
      label: q.label
        .replace(/המבקש\/ת/g, applicantName)
        .replace(/הנתבע\/ת/g, respondentName),
    }));
  }, [allQuestions, basicInfo.fullName, basicInfo.fullName2]);

  // Prepare default values
  const defaultValues = React.useMemo(() => {
    return formData || {};
  }, [formData]);

  const methods = useForm({
    resolver: zodResolver(dynamicSchema),
    defaultValues,
    mode: "onChange",
  });

  const {
    handleSubmit,
    watch,
    formState: { isValid, errors },
  } = methods;

  // Watch all fields for conditional rendering and auto-save
  const watchedValues = watch();

  // Auto-save on change (debounced)
  React.useEffect(() => {
    const timer = setTimeout(() => {
      updateFormData(watchedValues);
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [watchedValues, updateFormData]);

  const onSubmit = (data: any) => {
    // Save before navigating
    updateFormData(data);

    nextStep();
    router.push("/wizard/step-3");
  };

  const handleBack = () => {
    prevStep();
    router.push("/wizard");
  };

  // Get selected claim labels for display
  const selectedClaimLabels = selectedClaims
    .map((key) => CLAIMS.find((c) => c.key === key)?.label)
    .filter(Boolean);

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-h1 font-bold mb-2">שאלון מפורט</h1>
          <p className="text-body text-neutral-dark mb-4">
            ענו על השאלות הבאות. השאלות מותאמות לסוגי התביעות שבחרתם:
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedClaimLabels.map((label, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-primary/10 text-primary rounded-full text-body-small font-medium"
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Questions */}
        <div className="bg-white rounded-lg p-8 mb-8">
          <QuestionsList
            questions={processedQuestions}
            watchFields={watchedValues}
          />
        </div>

        {/* Validation errors summary */}
        {Object.keys(errors).length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-body font-semibold text-red-700 mb-2">
              יש לתקן את השגיאות הבאות:
            </p>
            <ul className="list-disc list-inside space-y-1 text-body-small text-red-600">
              {Object.entries(errors).map(([key, error]: [string, any]) => (
                <li key={key}>
                  {error?.message || "שדה לא תקין"}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={handleBack}
          >
            חזור
          </Button>
          <Button
            type="submit"
            size="lg"
            disabled={!isValid}
          >
            המשך לשלב הבא
          </Button>
        </div>

        {/* Auto-save indicator */}
        <div className="mt-4 text-center">
          <p className="text-caption text-neutral-dark">
            השינויים נשמרים אוטומטית
          </p>
        </div>
      </form>
    </FormProvider>
  );
}
