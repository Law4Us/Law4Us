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
          "w-full text-body sm:text-body-large font-semibold leading-relaxed text-neutral-900",
          "block break-words",
          className
        )}
        {...props}
      >
        {required && (
          <span className="ml-1 inline-block text-red-500" aria-hidden="true">
            *
          </span>
        )}
        <span>{children}</span>
        {optional && (
          <span className="mr-1 text-caption text-text-secondary font-normal">
            (אופציונלי)
          </span>
        )}
      </label>
    );
  }
);

Label.displayName = "Label";

export { Label };
