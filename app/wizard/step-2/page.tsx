"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui";
import { useWizardStore } from "@/lib/stores/wizard-store";
import { QuestionsSections } from "@/components/wizard/question-renderer";
import { SectionsNav, SectionsNavMobile } from "@/components/wizard/sections-nav";
import { SlideInView } from "@/components/animations/slide-in-view";
import {
  GLOBAL_QUESTIONS,
  CLAIM_QUESTIONS_MAP,
  type Question,
} from "@/lib/constants/questions";
import { globalQuestionsSchema } from "@/lib/schemas/global-questions";
import { CLAIMS } from "@/lib/constants/claims";
import { processQuestionsNames } from "@/lib/utils/name-replacement";
import { z } from "zod";

// Helper to extract section titles from questions
function extractSections(questions: Question[]): string[] {
  const sections: string[] = [];
  questions.forEach((question) => {
    if (question.type === "heading") {
      sections.push(question.label);
    }
  });
  return sections;
}

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

  // Replace dynamic names in question labels, placeholders, and options
  const processedQuestions = React.useMemo(() => {
    return processQuestionsNames(allQuestions, basicInfo);
  }, [allQuestions, basicInfo]);

  // Extract section titles
  const sectionTitles = React.useMemo(() => {
    return extractSections(processedQuestions);
  }, [processedQuestions]);

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

  // Track current visible section (for mobile/sidebar navigation)
  const [currentSectionIndex, setCurrentSectionIndex] = React.useState(0);

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

  // Mock section completion data (would be calculated from form state)
  const sectionData = sectionTitles.map((title, index) => ({
    title,
    isComplete: false, // TODO: Calculate actual completion
  }));

  const handleSectionNavigate = (index: number) => {
    setCurrentSectionIndex(index);
    // Scroll to section
    const sectionElement = document.querySelectorAll('[class*="rounded-xl border-2"]')[index];
    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Header */}
        <SlideInView direction="up" delay={0}>
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
        </SlideInView>

        {/* Mobile Navigation */}
        <div className="lg:hidden mb-6">
          <SectionsNavMobile
            sections={sectionData}
            currentIndex={currentSectionIndex}
            onNavigate={handleSectionNavigate}
          />
        </div>

        {/* Desktop: Sidebar + Content Layout */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 mb-8">
          {/* Sidebar Navigation (Desktop only) */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24">
              <SlideInView direction="right" delay={100}>
                <div className="bg-white rounded-xl border-2 border-neutral-light p-4">
                  <SectionsNav
                    sections={sectionData}
                    currentIndex={currentSectionIndex}
                    onNavigate={handleSectionNavigate}
                  />
                </div>
              </SlideInView>
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-9">
            <SlideInView direction="up" delay={200}>
              <QuestionsSections
                questions={processedQuestions}
                watchFields={watchedValues}
              />
            </SlideInView>
          </div>
        </div>

        {/* Validation errors summary */}
        {Object.keys(errors).length > 0 && (
          <SlideInView direction="up" delay={300}>
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
          </SlideInView>
        )}

        {/* Navigation */}
        <SlideInView direction="up" delay={400}>
          <div className="flex justify-between items-center">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleBack}
            >
              חזור
            </Button>
            <div className="flex items-center gap-4">
              <p className="text-caption text-neutral-dark hidden sm:block">
                השינויים נשמרים אוטומטית
              </p>
              <Button
                type="submit"
                size="lg"
                disabled={!isValid}
              >
                המשך לשלב הבא
              </Button>
            </div>
          </div>
        </SlideInView>
      </form>
    </FormProvider>
  );
}
