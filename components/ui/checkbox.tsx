import * as React from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    return (
      <div className="flex items-center">
        <input
          type="checkbox"
          className={cn(
            "h-5 w-5 rounded border-neutral text-primary",
            "focus:ring-2 focus:ring-primary focus:ring-offset-0",
            "cursor-pointer",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={ref}
          id={id}
          {...props}
        />
        {label && (
          <label
            htmlFor={id}
            className="mr-2 text-body cursor-pointer select-none"
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
