"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SuccessAnimationProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  onComplete?: () => void;
}

/**
 * SuccessAnimation - Animated checkmark with circle draw-in effect
 *
 * Professional success animation for completion states
 * Respects prefers-reduced-motion
 */
export function SuccessAnimation({
  className,
  size = "lg",
  onComplete,
}: SuccessAnimationProps) {
  const [isAnimating, setIsAnimating] = React.useState(false);

  React.useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      onComplete?.();
      return;
    }

    // Start animation after mount
    const timer = setTimeout(() => {
      setIsAnimating(true);
    }, 100);

    // Call onComplete after animation
    const completeTimer = setTimeout(() => {
      onComplete?.();
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-24 h-24",
    xl: "w-32 h-32",
  };

  const iconSizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  return (
    <div className={cn("inline-flex items-center justify-center", className)}>
      <div className="relative">
        {/* Background circle with scale animation */}
        <div
          className={cn(
            "rounded-full bg-green-100 flex items-center justify-center transition-all duration-500",
            sizeClasses[size],
            isAnimating ? "scale-100 opacity-100" : "scale-50 opacity-0"
          )}
        >
          {/* Inner green circle */}
          <div
            className={cn(
              "rounded-full bg-green-500 flex items-center justify-center transition-all duration-500 delay-200",
              size === "sm" ? "w-10 h-10" : "",
              size === "md" ? "w-13 h-13" : "",
              size === "lg" ? "w-20 h-20" : "",
              size === "xl" ? "w-26 h-26" : "",
              isAnimating ? "scale-100 opacity-100" : "scale-0 opacity-0"
            )}
          >
            {/* Checkmark with draw-in animation */}
            <Check
              className={cn(
                "text-white transition-all duration-500 delay-400",
                iconSizeClasses[size],
                isAnimating ? "scale-100 opacity-100" : "scale-0 opacity-0 rotate-90"
              )}
              strokeWidth={3}
            />
          </div>
        </div>

        {/* Ripple effect */}
        <div
          className={cn(
            "absolute inset-0 rounded-full border-4 border-green-400 transition-all duration-700 delay-300",
            sizeClasses[size],
            isAnimating ? "scale-150 opacity-0" : "scale-100 opacity-100"
          )}
        />
      </div>
    </div>
  );
}

/**
 * SuccessAnimationSimple - Simple fade-in success checkmark
 *
 * Lighter animation for smaller contexts or when reduced motion is preferred
 */
export function SuccessAnimationSimple({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-20 h-20",
  };

  const iconSizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-green-100 transition-all duration-500",
        sizeClasses[size],
        isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95",
        className
      )}
    >
      <div
        className={cn(
          "rounded-full bg-green-500 flex items-center justify-center transition-all duration-500 delay-200",
          size === "sm" ? "w-10 h-10" : "",
          size === "md" ? "w-13 h-13" : "",
          size === "lg" ? "w-16 h-16" : "",
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-0"
        )}
      >
        <Check
          className={cn(
            "text-white",
            iconSizeClasses[size]
          )}
          strokeWidth={3}
        />
      </div>
    </div>
  );
}
