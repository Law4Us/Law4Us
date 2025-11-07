"use client";

import * as React from "react";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressiveSectionProps {
  /**
   * Section number (for display)
   */
  number: number;
  /**
   * Section title
   */
  title: string;
  /**
   * Whether section is currently expanded
   */
  isExpanded: boolean;
  /**
   * Whether section is completed
   */
  isCompleted: boolean;
  /**
   * Whether section can be expanded
   */
  canExpand: boolean;
  /**
   * Handler for expand/collapse
   */
  onToggle: () => void;
  /**
   * Section content
   */
  children: React.ReactNode;
  /**
   * Optional description text
   */
  description?: string;
}

/**
 * ProgressiveSection - Expandable form section with completion tracking
 *
 * Professional, clear design for multi-step forms
 * Shows progress with visual indicators and smooth animations
 */
export function ProgressiveSection({
  number,
  title,
  isExpanded,
  isCompleted,
  canExpand,
  onToggle,
  children,
  description,
}: ProgressiveSectionProps) {
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [height, setHeight] = React.useState<number | undefined>(undefined);

  // Auto-scroll to section when expanded
  const sectionRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (isExpanded && sectionRef.current) {
      // Small delay to allow animation to start
      setTimeout(() => {
        sectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }, 150);
    }
  }, [isExpanded]);

  // Measure content height for smooth animation
  React.useEffect(() => {
    if (isExpanded && contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    } else {
      setHeight(0);
    }
  }, [isExpanded]);

  return (
    <div
      ref={sectionRef}
      className={cn(
        "border-2 rounded-xl bg-white transition-all duration-300",
        isExpanded && "shadow-lg",
        isCompleted && !isExpanded && "border-green-200 bg-green-50/30",
        !isCompleted && isExpanded && "border-primary",
        !isCompleted && !isExpanded && "border-neutral-light hover:border-neutral"
      )}
    >
      {/* Header */}
      <button
        type="button"
        onClick={canExpand ? onToggle : undefined}
        disabled={!canExpand}
        className={cn(
          "w-full px-6 py-5 flex items-center gap-4 text-right transition-colors",
          canExpand && "hover:bg-neutral-lightest cursor-pointer",
          !canExpand && "cursor-not-allowed opacity-60"
        )}
        aria-expanded={isExpanded}
        aria-controls={`section-${number}-content`}
      >
        {/* Number/Status Icon */}
        <div
          className={cn(
            "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-body-large transition-all duration-300",
            isCompleted && "bg-green-500 text-white",
            !isCompleted && isExpanded && "bg-primary text-white ring-4 ring-primary/20",
            !isCompleted && !isExpanded && "bg-neutral-light text-neutral-dark"
          )}
        >
          {isCompleted ? <Check className="w-6 h-6" /> : number}
        </div>

        {/* Title & Description */}
        <div className="flex-1 min-w-0">
          <h3
            className={cn(
              "text-h3 font-semibold text-right transition-colors",
              isExpanded && "text-primary",
              isCompleted && !isExpanded && "text-green-700",
              !isCompleted && !isExpanded && "text-neutral-darkest"
            )}
          >
            {title}
          </h3>
          {description && !isExpanded && (
            <p className="text-body-small text-neutral-dark mt-1">{description}</p>
          )}
          {isCompleted && !isExpanded && (
            <p className="text-body-small text-green-600 mt-1 font-medium">
              ✓ הושלם
            </p>
          )}
        </div>

        {/* Expand/Collapse Icon */}
        {canExpand && (
          <div className="flex-shrink-0">
            {isExpanded ? (
              <ChevronUp className="w-6 h-6 text-neutral-dark" />
            ) : (
              <ChevronDown className="w-6 h-6 text-neutral-dark" />
            )}
          </div>
        )}
      </button>

      {/* Content */}
      <div
        id={`section-${number}-content`}
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ height: isExpanded ? height : 0 }}
      >
        <div ref={contentRef} className="px-6 pb-6">
          {/* Description (shown when expanded) */}
          {description && isExpanded && (
            <p className="text-body text-neutral-dark mb-6 pb-6 border-b border-neutral-light">
              {description}
            </p>
          )}

          {/* Section content */}
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * ProgressiveSections - Container for multiple progressive sections
 *
 * Manages expand/collapse logic to show one section at a time
 */
interface ProgressiveSectionsProps {
  children: React.ReactNode;
  className?: string;
}

export function ProgressiveSections({
  children,
  className,
}: ProgressiveSectionsProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {children}
    </div>
  );
}
