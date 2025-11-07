import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Base styles using design tokens
          "flex w-full rounded-input bg-neutral-100 px-4 py-3",
          "text-body-sm font-medium text-neutral-900",
          "shadow-input transition-smooth",
          "placeholder:text-neutral-900/40 placeholder:font-normal",
          // Focus state using design token shadows
          "focus-visible:outline-none focus-visible:shadow-input-focus",
          "disabled:cursor-not-allowed disabled:opacity-50",
          // Error state using design token shadows
          error && "shadow-input-error focus-visible:shadow-input-error",
          // RTL support for number and tel inputs
          (type === "tel" || type === "number") && "dir-rtl",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };
