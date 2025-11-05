import * as React from "react";
import { cn } from "@/lib/utils";

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  optional?: boolean;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, required, optional, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          "text-h3 font-medium text-neutral-900",
          "inline-flex items-center gap-1",
          className
        )}
        {...props}
      >
        {children}
        {required && <span className="text-red-500">*</span>}
        {optional && (
          <span className="text-caption text-neutral-700 font-normal">
            (אופציונלי)
          </span>
        )}
      </label>
    );
  }
);

Label.displayName = "Label";

export { Label };
