"use client";

import * as React from "react";
import { useFormContext, Controller } from "react-hook-form";
import {
  FormField,
  Input,
  Textarea,
  Select,
  RadioGroup,
  FileUpload,
} from "@/components/ui";
import { Repeater } from "@/components/wizard/repeater";
import { Question } from "@/lib/constants/questions";
import { cn } from "@/lib/utils";

interface QuestionRendererProps {
  question: Question;
  watchFields?: Record<string, any>;
  namePrefix?: string; // For nested fields like "divorceAgreement.field"
}

const getValueByPath = <T = unknown>(source: unknown, path: string): T | undefined => {
  if (!path) return undefined;

  return path
    .split(".")
    .reduce<unknown>((current, key) => {
      if (current && typeof current === "object") {
        return (current as Record<string, unknown>)[key];
      }
      return undefined;
    }, source) as T | undefined;
};

export function QuestionRenderer({
  question,
  watchFields = {},
  namePrefix = "",
}: QuestionRendererProps) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext();

  // Check if this question should be shown based on conditionals
  if (question.conditional) {
    const { dependsOn, showWhen } = question.conditional;

    // Get nested value using dot notation
    const dependentValue = getValueByPath<string | undefined>(watchFields, dependsOn);

    // If conditional not met, don't render
    if (Array.isArray(showWhen)) {
      if (!dependentValue || !showWhen.includes(dependentValue)) return null;
    } else {
      if (dependentValue !== showWhen) return null;
    }
  }

  // Get the field name (with prefix if nested)
  const fieldName = namePrefix ? `${namePrefix}.${question.id}` : question.id;

  // Get nested error if exists
  const getNestedError = (path: string): string | undefined => {
    const fieldError = getValueByPath<any>(errors, path);
    return fieldError?.message;
  };

  const errorMessage = getNestedError(fieldName);

  // Render heading
  if (question.type === "heading") {
    return (
      <div className="col-span-2 mt-6 mb-4 border-b border-neutral pb-2">
        <h3 className="text-h3 font-semibold text-neutral-darkest">
          {question.label}
        </h3>
        {question.helper && (
          <p className="text-body-small text-neutral-dark mt-2">
            {question.helper}
          </p>
        )}
      </div>
    );
  }

  // Render text/number/date/email/tel inputs
  if (
    ["text", "number", "date", "email", "tel"].includes(question.type)
  ) {
    return (
      <FormField
        label={question.label}
        htmlFor={fieldName}
        required={question.required}
        error={errorMessage}
        helper={question.helper}
      >
        <Input
          id={fieldName}
          type={question.type}
          placeholder={question.placeholder}
          {...register(fieldName)}
          error={!!errorMessage}
        />
      </FormField>
    );
  }

  // Render textarea
  if (question.type === "textarea") {
    const currentValue = getValueByPath<string | undefined>(watchFields, fieldName) || "";
    return (
      <div className="col-span-2">
        <FormField
          label={question.label}
          htmlFor={fieldName}
          required={question.required}
          error={errorMessage}
          helper={question.helper}
        >
          <Textarea
            id={fieldName}
            placeholder={question.placeholder}
            maxLength={question.maxLength}
            {...register(fieldName)}
            error={!!errorMessage}
          />
          {question.maxLength && (
            <div className="text-caption text-neutral-dark text-left mt-1">
              {currentValue.length} / {question.maxLength}
            </div>
          )}
        </FormField>
      </div>
    );
  }

  // Render select
  if (question.type === "select") {
    return (
      <FormField
        label={question.label}
        htmlFor={fieldName}
        required={question.required}
        error={errorMessage}
        helper={question.helper}
      >
        <Select
          id={fieldName}
          {...register(fieldName)}
          error={!!errorMessage}
        >
          {question.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </FormField>
    );
  }

  // Render radio group
  if (question.type === "radio") {
    return (
      <div className="col-span-2">
        <FormField
          label={question.label}
          required={question.required}
          error={errorMessage}
          helper={question.helper}
        >
          <Controller
            name={fieldName}
            control={control}
            render={({ field }) => (
              <RadioGroup
                name={fieldName}
                value={field.value}
                onChange={field.onChange}
                options={question.options || []}
                orientation="vertical"
                error={!!errorMessage}
              />
            )}
          />
        </FormField>
      </div>
    );
  }

  // Render file upload
  if (question.type === "file" || question.type === "fileList") {
    return (
      <div className="col-span-2">
        <FormField
          label={question.label}
          required={question.required}
          error={errorMessage}
          helper={question.helper}
        >
          <Controller
            name={fieldName}
            control={control}
            render={({ field }) => (
              <FileUpload
                value={field.value}
                onChange={field.onChange}
                accept={question.accept}
                multiple={question.type === "fileList"}
                error={!!errorMessage}
              />
            )}
          />
        </FormField>
      </div>
    );
  }

  // Render repeater
  if (question.type === "repeater" && question.repeaterConfig) {
    const config = question.repeaterConfig;
    return (
      <div className="col-span-2">
        <FormField
          label={question.label}
          required={question.required}
          error={errorMessage}
          helper={question.helper}
        >
          <Controller
            name={fieldName}
            control={control}
            render={({ field }) => (
              <Repeater
                fields={config.fields}
                value={field.value || []}
                onChange={field.onChange}
                addButtonLabel={config.addButtonLabel}
                minRows={config.minRows}
                maxRows={config.maxRows}
              />
            )}
          />
        </FormField>
      </div>
    );
  }

  return null;
}

/**
 * Renders a list of questions in a responsive grid
 */
interface QuestionsListProps {
  questions: Question[];
  watchFields?: Record<string, any>;
  namePrefix?: string;
}

export function QuestionsList({
  questions,
  watchFields = {},
  namePrefix = "",
}: QuestionsListProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {questions.map((question) => (
        <QuestionRenderer
          key={question.id}
          question={question}
          watchFields={watchFields}
          namePrefix={namePrefix}
        />
      ))}
    </div>
  );
}

/**
 * Group questions by sections (headings) and render each section in a card
 */
export function QuestionsSections({
  questions,
  watchFields = {},
  namePrefix = "",
}: QuestionsListProps) {
  const { formState: { errors } } = useFormContext();
  const [openSections, setOpenSections] = React.useState<Set<number>>(new Set([0]));

  // Group questions by headings
  const sections: { title: string; questions: Question[] }[] = [];
  let currentSection: { title: string; questions: Question[] } | null = null;

  questions.forEach((question) => {
    if (question.type === "heading") {
      // Start a new section
      if (currentSection) {
        sections.push(currentSection);
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
    sections.push(currentSection);
  }

  // Check if section is complete (all required fields filled and no errors)
  const isSectionComplete = (section: { title: string; questions: Question[] }): boolean => {
    // Get all questions that are currently visible (conditionals met)
    const visibleQuestions = section.questions.filter((q) => {
      // Check if question should be shown based on conditionals
      if (q.conditional) {
        const { dependsOn, showWhen } = q.conditional;
        const dependentValue = getValueByPath<string | undefined>(watchFields, dependsOn);

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
        const fieldName = namePrefix ? `${namePrefix}.${q.id}` : q.id;
        const value = getValueByPath<unknown>(watchFields, fieldName);
        return value !== undefined && value !== "" && value !== null;
      });
    }

    // If there are required questions, all must be filled without errors
    return requiredQuestions.every((q) => {
      const fieldName = namePrefix ? `${namePrefix}.${q.id}` : q.id;
      const value = getValueByPath<unknown>(watchFields, fieldName);
      const hasError = getValueByPath<unknown>(errors, fieldName);

      // Field must have a value and no errors
      return value !== undefined && value !== "" && value !== null && !hasError;
    });
  };

  const toggleSection = (index: number) => {
    const newOpenSections = new Set(openSections);
    if (newOpenSections.has(index)) {
      newOpenSections.delete(index);
    } else {
      newOpenSections.add(index);
    }
    setOpenSections(newOpenSections);
  };

  return (
    <div className="space-y-4">
      {sections.map((section, index) => {
        const isOpen = openSections.has(index);
        const isComplete = isSectionComplete(section);

        return (
          <div
            key={index}
            className={cn(
              "bg-white rounded-xl border-2 overflow-hidden transition-all duration-300",
              isOpen && "shadow-lg",
              isComplete && !isOpen && "border-green-200 bg-green-50/30",
              !isComplete && isOpen && "border-primary shadow-primary/10",
              !isComplete && !isOpen && "border-neutral-light hover:border-neutral hover:shadow-md"
            )}
          >
            {/* Section header */}
            {section.title && (
              <button
                type="button"
                onClick={() => toggleSection(index)}
                className={cn(
                  "w-full px-6 py-5 flex items-center gap-4 text-right transition-all duration-200",
                  isOpen && "bg-primary/5",
                  !isOpen && "hover:bg-neutral-lightest"
                )}
                aria-expanded={isOpen}
              >
                {/* Number/Status Icon */}
                <div
                  className={cn(
                    "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-body-large transition-all duration-300",
                    isComplete && "bg-green-500 text-white shadow-md",
                    !isComplete && isOpen && "bg-primary text-white ring-4 ring-primary/20 shadow-md",
                    !isComplete && !isOpen && "bg-neutral-light text-neutral-dark"
                  )}
                >
                  {isComplete ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>

                {/* Title & Status */}
                <div className="flex-1 min-w-0">
                  <h3
                    className={cn(
                      "text-h3 font-semibold transition-colors",
                      isOpen && "text-primary",
                      isComplete && !isOpen && "text-green-700",
                      !isComplete && !isOpen && "text-neutral-darkest"
                    )}
                  >
                    {section.title}
                  </h3>
                  {isComplete && !isOpen && (
                    <p className="text-body-small text-green-600 mt-1 font-medium">
                      ✓ הושלם
                    </p>
                  )}
                </div>

                {/* Expand/Collapse Icon */}
                <svg
                  className={cn(
                    "flex-shrink-0 w-6 h-6 transition-all duration-300 text-neutral-dark",
                    isOpen && "transform rotate-180 text-primary"
                  )}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}

            {/* Section content with smooth height transition */}
            <div
              className={cn(
                "transition-all duration-300 ease-in-out overflow-hidden",
                isOpen ? "max-h-[10000px] opacity-100" : "max-h-0 opacity-0"
              )}
            >
              <div className="p-6 pt-2">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {section.questions.map((question) => (
                    <QuestionRenderer
                      key={question.id}
                      question={question}
                      watchFields={watchFields}
                      namePrefix={namePrefix}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
