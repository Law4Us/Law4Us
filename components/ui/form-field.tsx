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
      <div ref={ref} className={cn("flex flex-col gap-2", className)}>
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
          <p className="text-caption text-red-500 font-medium animate-slide-up">
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = "FormField";

export { FormField };
