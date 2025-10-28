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
    const dependentValue = dependsOn.split('.').reduce((obj, key) => obj?.[key], watchFields);

    // If conditional not met, don't render
    if (Array.isArray(showWhen)) {
      if (!showWhen.includes(dependentValue)) return null;
    } else {
      if (dependentValue !== showWhen) return null;
    }
  }

  // Get the field name (with prefix if nested)
  const fieldName = namePrefix ? `${namePrefix}.${question.id}` : question.id;

  // Get nested error if exists
  const getNestedError = (errors: any, path: string): string | undefined => {
    const keys = path.split(".");
    let current = errors;
    for (const key of keys) {
      if (!current || !current[key]) return undefined;
      current = current[key];
    }
    return current?.message;
  };

  const errorMessage = getNestedError(errors, fieldName);

  // Render heading
  if (question.type === "heading") {
    return (
      <div className="col-span-2 mt-6 mb-4 border-b border-neutral pb-2">
        <h3 className="text-h3 font-semibold text-neutral-darkest">
          {question.label}
        </h3>
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
              {watchFields[fieldName]?.length || 0} / {question.maxLength}
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
                fields={question.repeaterConfig.fields}
                value={field.value || []}
                onChange={field.onChange}
                addButtonLabel={question.repeaterConfig.addButtonLabel}
                minRows={question.repeaterConfig.minRows}
                maxRows={question.repeaterConfig.maxRows}
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
        const dependentValue = dependsOn.split('.').reduce((obj, key) => obj?.[key], watchFields);

        if (Array.isArray(showWhen)) {
          if (!showWhen.includes(dependentValue)) return false;
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
        const value = fieldName.split('.').reduce((obj, key) => obj?.[key], watchFields);
        return value !== undefined && value !== "" && value !== null;
      });
    }

    // If there are required questions, all must be filled without errors
    return requiredQuestions.every((q) => {
      const fieldName = namePrefix ? `${namePrefix}.${q.id}` : q.id;
      const value = fieldName.split('.').reduce((obj, key) => obj?.[key], watchFields);
      const hasError = fieldName.split('.').reduce((obj, key) => obj?.[key], errors);

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
    <div className="space-y-6">
      {sections.map((section, index) => {
        const isOpen = openSections.has(index);
        const isComplete = isSectionComplete(section);

        return (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-neutral-light overflow-hidden"
          >
            {/* Section header */}
            {section.title && (
              <button
                type="button"
                onClick={() => toggleSection(index)}
                className="w-full bg-gradient-to-r from-primary/5 to-primary/10 px-8 py-5 border-b border-neutral-light hover:from-primary/10 hover:to-primary/15 transition-colors"
              >
                <h3 className="text-h3 font-bold text-neutral-darkest flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full text-body-small font-bold transition-colors",
                      isComplete
                        ? "bg-green-500 text-white"
                        : "bg-primary text-white"
                    )}>
                      {isComplete ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        index + 1
                      )}
                    </span>
                    {section.title}
                  </div>
                  <svg
                    className={cn(
                      "w-5 h-5 transition-transform text-neutral-dark",
                      isOpen ? "transform rotate-180" : ""
                    )}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </h3>
              </button>
            )}

            {/* Section content */}
            {isOpen && (
              <div className="p-8">
                <div className="space-y-6">
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
            )}
          </div>
        );
      })}
    </div>
  );
}
