import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "./label";

export interface FormFieldProps {
  label?: string;
  htmlFor?: string;
  error?: string;
  helper?: string;
  required?: boolean;
  optional?: boolean;
  children: React.ReactNode;
  className?: string;
}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  (
    {
      label,
      htmlFor,
      error,
      helper,
      required,
      optional,
      children,
      className,
    },
    ref
  ) => {
    return (
      <div ref={ref} className={cn("flex min-w-0 flex-col gap-2", className)}>
        {label && (
          <Label htmlFor={htmlFor} required={required} optional={optional}>
            {label}
          </Label>
        )}
        {children}
        {helper && !error && (
          <p className="text-caption text-text-secondary">{helper}</p>
        )}
        {error && (
          <p className="text-caption text-red-500 font-medium animate-slide-up flex items-center gap-1">
            <svg
              className="w-4 h-4 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = "FormField";

export { FormField };
