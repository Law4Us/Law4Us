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
          // Base styles
          "flex w-full rounded bg-neutral-lightest px-4 py-3",
          "text-body-small font-medium text-neutral-darkest",
          "border border-neutral transition-smooth",
          "placeholder:text-neutral-darkest/40 placeholder:font-normal",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:border-primary",
          "disabled:cursor-not-allowed disabled:opacity-50",
          // Error state
          error && "border-red-500 focus-visible:ring-red-500",
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
