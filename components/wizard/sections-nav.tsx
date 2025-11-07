"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Section {
  title: string;
  isComplete: boolean;
}

interface SectionsNavProps {
  sections: Section[];
  currentIndex: number;
  onNavigate: (index: number) => void;
  className?: string;
}

/**
 * SectionsNav - Sidebar navigation for form sections
 *
 * Professional sidebar showing all sections with completion status
 * Allows easy navigation between sections
 */
export function SectionsNav({
  sections,
  currentIndex,
  onNavigate,
  className,
}: SectionsNavProps) {
  return (
    <nav
      className={cn("space-y-2", className)}
      aria-label="סעיפי השאלון"
    >
      <div className="mb-4">
        <h3 className="text-body-small font-semibold text-neutral-dark uppercase tracking-wide">
          סעיפים
        </h3>
        <div className="mt-2 flex items-center gap-2 text-caption text-neutral-dark">
          <span className="font-medium">
            {sections.filter((s) => s.isComplete).length} / {sections.length}
          </span>
          <span>הושלמו</span>
        </div>
      </div>

      {sections.map((section, index) => {
        const isCurrent = index === currentIndex;
        const isComplete = section.isComplete;

        return (
          <button
            key={index}
            type="button"
            onClick={() => onNavigate(index)}
            className={cn(
              "w-full flex items-start gap-3 px-4 py-3 rounded-lg text-right transition-all duration-200",
              isCurrent && "bg-primary/10 border-r-4 border-primary",
              !isCurrent && "hover:bg-neutral-lightest",
              isComplete && !isCurrent && "bg-green-50/50"
            )}
            aria-current={isCurrent ? "step" : undefined}
          >
            {/* Number/Status Icon */}
            <div
              className={cn(
                "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-body-small font-bold transition-colors",
                isComplete && "bg-green-500 text-white",
                !isComplete && isCurrent && "bg-primary text-white",
                !isComplete && !isCurrent && "bg-neutral-light text-neutral-dark"
              )}
            >
              {isComplete ? <Check className="w-4 h-4" /> : index + 1}
            </div>

            {/* Section title */}
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  "text-body-small font-medium line-clamp-2 transition-colors",
                  isCurrent && "text-primary font-semibold",
                  isComplete && !isCurrent && "text-green-700",
                  !isComplete && !isCurrent && "text-neutral-darkest"
                )}
              >
                {section.title}
              </p>
              {isComplete && (
                <p className="text-caption text-green-600 mt-0.5">הושלם ✓</p>
              )}
            </div>
          </button>
        );
      })}
    </nav>
  );
}

/**
 * SectionsNavMobile - Mobile tab strip for section navigation
 *
 * Horizontal scrollable navigation for mobile devices
 */
export function SectionsNavMobile({
  sections,
  currentIndex,
  onNavigate,
  className,
}: SectionsNavProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to current section
  React.useEffect(() => {
    if (scrollRef.current) {
      const currentButton = scrollRef.current.children[currentIndex] as HTMLElement;
      if (currentButton) {
        currentButton.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest",
        });
      }
    }
  }, [currentIndex]);

  return (
    <nav
      className={cn("relative", className)}
      aria-label="סעיפי השאלון"
    >
      {/* Progress indicator */}
      <div className="mb-3 flex items-center justify-between px-2">
        <span className="text-body-small font-semibold text-neutral-darkest">
          סעיף {currentIndex + 1} מתוך {sections.length}
        </span>
        <span className="text-caption text-neutral-dark">
          {sections.filter((s) => s.isComplete).length} הושלמו
        </span>
      </div>

      {/* Scrollable tabs */}
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar snap-x snap-mandatory"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {sections.map((section, index) => {
          const isCurrent = index === currentIndex;
          const isComplete = section.isComplete;

          return (
            <button
              key={index}
              type="button"
              onClick={() => onNavigate(index)}
              className={cn(
                "flex-shrink-0 snap-center px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 min-w-[140px]",
                isCurrent && "bg-primary text-white shadow-md",
                !isCurrent && isComplete && "bg-green-50 border border-green-200",
                !isCurrent && !isComplete && "bg-white border border-neutral-light"
              )}
              aria-current={isCurrent ? "step" : undefined}
            >
              {/* Number/Status */}
              <div
                className={cn(
                  "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-caption font-bold",
                  isComplete && !isCurrent && "bg-green-500 text-white",
                  !isComplete && isCurrent && "bg-white/20 text-white",
                  !isComplete && !isCurrent && "bg-neutral-light text-neutral-dark"
                )}
              >
                {isComplete && !isCurrent ? <Check className="w-3 h-3" /> : index + 1}
              </div>

              {/* Section number text */}
              <span
                className={cn(
                  "text-body-small font-medium truncate",
                  isCurrent && "text-white",
                  isComplete && !isCurrent && "text-green-700",
                  !isComplete && !isCurrent && "text-neutral-darkest"
                )}
              >
                סעיף {index + 1}
              </span>
            </button>
          );
        })}
      </div>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </nav>
  );
}
