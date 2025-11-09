import * as React from "react";
import { cn } from "@/lib/utils";
import { animations } from "@/lib/utils/animations";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        className={cn(
          // Base styles
          "inline-flex items-center justify-center rounded font-medium touch-target",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",

          // Variants with animations
          variant === "primary" &&
            cn(
              "bg-primary text-white border border-primary-dark hover:bg-primary-dark",
              animations.buttonVariants.primary
            ),
          variant === "secondary" &&
            cn(
              "bg-neutral-200 text-neutral-900 border border-neutral-300 hover:bg-neutral-300",
              animations.buttonVariants.secondary
            ),
          variant === "ghost" &&
            cn(
              "bg-transparent text-neutral-900",
              animations.buttonVariants.ghost
            ),
          variant === "outline" &&
            cn(
              "bg-transparent text-primary border border-primary",
              animations.buttonVariants.outline
            ),

          // Sizes
          size === "sm" && "text-button-sm px-4 py-2",
          size === "md" && "text-button px-8 py-4",
          size === "lg" && "text-button px-10 py-5",

          className
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin ml-2 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
