import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  showCount?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, showCount, maxLength, value, onChange, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState(String(value || ""));

    // Update internal value when controlled value changes
    React.useEffect(() => {
      if (value !== undefined) {
        setInternalValue(String(value));
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInternalValue(e.target.value);
      onChange?.(e);
    };

    const currentLength = internalValue.length;

    return (
      <div className="relative w-full">
        <textarea
          className={cn(
            // Base styles using design tokens
            "flex min-h-[120px] w-full rounded-input bg-neutral-100 px-4 py-3",
            "text-body-sm font-medium text-neutral-900",
            "shadow-input transition-smooth",
            "placeholder:text-neutral-900/40 placeholder:font-normal",
            // Focus state using design token shadows
            "focus-visible:outline-none focus-visible:shadow-input-focus",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "resize-y",
            // Error state using design token shadows
            error && "shadow-input-error focus-visible:shadow-input-error",
            // Extra padding if showing count
            showCount && maxLength && "pb-8",
            className
          )}
          ref={ref}
          maxLength={maxLength}
          value={value}
          onChange={handleChange}
          {...props}
        />
        {showCount && maxLength && (
          <div className="absolute left-3 bottom-2 text-caption text-text-secondary">
            {currentLength} / {maxLength}
          </div>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };
