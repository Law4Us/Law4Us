import * as React from "react";
import { cn } from "@/lib/utils";

export interface RadioProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, id, ...props }, ref) => {
    return (
      <div className="flex items-center">
        <input
          type="radio"
          className={cn(
            "h-5 w-5 border-neutral text-primary",
            "focus:ring-2 focus:ring-primary focus:ring-offset-0",
            "cursor-pointer",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={ref}
          id={id}
          {...props}
        />
        <label
          htmlFor={id}
          className="mr-2 text-body-large cursor-pointer select-none"
        >
          {label}
        </label>
      </div>
    );
  }
);

Radio.displayName = "Radio";

export interface RadioGroupProps {
  name: string;
  options: Array<{ label: string; value: string }>;
  value?: string;
  onChange?: (value: string) => void;
  orientation?: "horizontal" | "vertical";
  error?: boolean;
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    {
      name,
      options,
      value,
      onChange,
      orientation = "horizontal",
      error,
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex gap-4",
          orientation === "vertical" ? "flex-col" : "flex-row flex-wrap",
          error && "text-red-500"
        )}
        role="radiogroup"
      >
        {options.map((option) => (
          <Radio
            key={option.value}
            id={`${name}-${option.value}`}
            name={name}
            value={option.value}
            label={option.label}
            checked={value === option.value}
            onChange={(e) => onChange?.(e.target.value)}
          />
        ))}
      </div>
    );
  }
);

RadioGroup.displayName = "RadioGroup";

export { Radio, RadioGroup };
