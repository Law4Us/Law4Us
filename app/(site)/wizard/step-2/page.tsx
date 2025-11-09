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

// Helper to get value by path from nested object
function getValueByPath<T = unknown>(source: unknown, path: string): T | undefined {
  if (!path) return undefined;

  return path
    .split(".")
    .reduce<unknown>((current, key) => {
      if (current && typeof current === "object") {
        return (current as Record<string, unknown>)[key];
      }
      return undefined;
    }, source) as T | undefined;
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

  // Group questions by sections
  const sections = React.useMemo(() => {
    const result: { title: string; questions: Question[] }[] = [];
    let currentSection: { title: string; questions: Question[] } | null = null;

    processedQuestions.forEach((question) => {
      if (question.type === "heading") {
        // Start a new section
        if (currentSection) {
          result.push(currentSection);
        }
        currentSection = { title: question.label, questions: [] };
      } else {
        // Add question to current section
        if (!currentSection) {
          // If no heading yet, create a default section
          currentSection = { title: "", questions: [] };
        }
        currentSection.questions.push(question);
      }
    });

    // Push the last section
    if (currentSection) {
      result.push(currentSection);
    }

    return result;
  }, [processedQuestions]);

  // Track current visible section (for mobile/sidebar navigation)
  const [currentSectionIndex, setCurrentSectionIndex] = React.useState(0);

  // Auto-save on change (debounced)
  React.useEffect(() => {
    const timer = setTimeout(() => {
      updateFormData(watchedValues);
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [watchedValues, updateFormData]);

  // Auto-highlight sidebar section based on focused input
  React.useEffect(() => {
    // Create a map of question IDs to section indices
    const questionToSectionMap = new Map<string, number>();

    sections.forEach((section, sectionIndex) => {
      section.questions.forEach((question) => {
        questionToSectionMap.set(question.id, sectionIndex);
      });
    });

    // Handle focus events
    const handleFocus = (event: FocusEvent) => {
      const target = event.target as HTMLElement;

      // Get the field name from the input element
      const fieldName =
        target.getAttribute('name') ||
        target.getAttribute('data-field-name') ||
        target.closest('[data-field-name]')?.getAttribute('data-field-name');

      if (fieldName) {
        // Find which section this field belongs to
        const sectionIndex = questionToSectionMap.get(fieldName);

        if (sectionIndex !== undefined && sectionIndex !== currentSectionIndex) {
          setCurrentSectionIndex(sectionIndex);
        }
      }
    };

    // Add event listener to the form
    document.addEventListener('focusin', handleFocus, true);

    return () => {
      document.removeEventListener('focusin', handleFocus, true);
    };
  }, [sections, currentSectionIndex]);

  // Check if section is complete (all required fields filled and no errors)
  const isSectionComplete = React.useCallback(
    (section: { title: string; questions: Question[] }): boolean => {
      // Get all questions that are currently visible (conditionals met)
      const visibleQuestions = section.questions.filter((q) => {
        // Check if question should be shown based on conditionals
        if (q.conditional) {
          const { dependsOn, showWhen } = q.conditional;
          const dependentValue = getValueByPath<string | undefined>(watchedValues, dependsOn);

          if (Array.isArray(showWhen)) {
            if (!dependentValue || !showWhen.includes(dependentValue)) return false;
          } else {
            if (dependentValue !== showWhen) return false;
          }
        }

        return true;
      });

      // Get required questions from visible questions
      const requiredQuestions = visibleQuestions.filter((q) => q.required);

      // If there are no required questions, check if at least one optional field is filled
      if (requiredQuestions.length === 0) {
        return visibleQuestions.some((q) => {
          const value = getValueByPath<unknown>(watchedValues, q.id);
          return value !== undefined && value !== "" && value !== null;
        });
      }

      // If there are required questions, all must be filled without errors
      return requiredQuestions.every((q) => {
        const value = getValueByPath<unknown>(watchedValues, q.id);
        const hasError = getValueByPath<unknown>(errors, q.id);

        // Field must have a value and no errors
        return value !== undefined && value !== "" && value !== null && !hasError;
      });
    },
    [watchedValues, errors]
  );

  // Check if all required sections are complete
  const allRequiredSectionsComplete = React.useMemo(() => {
    // Get all sections with at least one required field
    const sectionsWithRequired = sections.filter((section) => {
      const visibleQuestions = section.questions.filter((q) => {
        if (q.conditional) {
          const { dependsOn, showWhen } = q.conditional;
          const dependentValue = getValueByPath<string | undefined>(watchedValues, dependsOn);
          if (Array.isArray(showWhen)) {
            if (!dependentValue || !showWhen.includes(dependentValue)) return false;
          } else {
            if (dependentValue !== showWhen) return false;
          }
        }
        return true;
      });
      return visibleQuestions.some((q) => q.required);
    });

    // All sections with required fields must be complete
    return sectionsWithRequired.every((section) => isSectionComplete(section));
  }, [sections, isSectionComplete, watchedValues]);

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

  // Calculate section completion data
  const sectionData = React.useMemo(() => {
    return sections.map((section) => ({
      title: section.title,
      isComplete: isSectionComplete(section),
    }));
  }, [sections, isSectionComplete]);

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
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 lg:items-start mb-8">
          {/* Sidebar Navigation (Desktop only) */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24">
              <div className="bg-white rounded-xl border-2 border-neutral-light p-4 shadow-sm">
                <SectionsNav
                  sections={sectionData}
                  currentIndex={currentSectionIndex}
                  onNavigate={handleSectionNavigate}
                />
              </div>
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
                disabled={!isValid || !allRequiredSectionsComplete}
                className="text-white"
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
