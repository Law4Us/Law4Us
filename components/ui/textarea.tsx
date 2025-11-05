import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  showCount?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, showCount, maxLength, value, ...props }, ref) => {
    const currentLength = String(value || "").length;

    return (
      <div className="relative w-full">
        <textarea
          className={cn(
            // Base styles
            "flex min-h-[120px] w-full rounded bg-neutral-100 px-4 py-3",
            "text-body-small font-medium text-neutral-900",
            "border border-neutral-300 transition-smooth",
            "placeholder:text-neutral-900/40 placeholder:font-normal",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:border-primary",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "resize-y",
            // Error state
            error && "border-red-500 focus-visible:ring-red-500",
            // Extra padding if showing count
            showCount && maxLength && "pb-8",
            className
          )}
          ref={ref}
          maxLength={maxLength}
          value={value}
          {...props}
        />
        {showCount && maxLength && (
          <div className="absolute left-3 bottom-2 text-caption text-neutral-700">
            {currentLength} / {maxLength}
          </div>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };
