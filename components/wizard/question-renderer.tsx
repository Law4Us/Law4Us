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
    const dependentValue = watchFields[dependsOn];

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
