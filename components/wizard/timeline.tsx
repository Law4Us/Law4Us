"use client";

import * as React from "react";
import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineItem {
  title: string;
  description: string;
  status?: "completed" | "current" | "upcoming";
  icon?: React.ReactNode;
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

/**
 * Timeline - Professional vertical timeline component
 *
 * Shows a sequence of events/milestones with status indicators
 * Perfect for showing "what happens next" flows
 */
export function Timeline({ items, className }: TimelineProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const status = item.status || "upcoming";

        return (
          <div key={index} className="relative flex gap-4">
            {/* Connector line */}
            {!isLast && (
              <div
                className={cn(
                  "absolute right-[15px] top-12 bottom-0 w-0.5",
                  status === "completed" && "bg-green-300",
                  status === "current" && "bg-primary/30",
                  status === "upcoming" && "bg-neutral-light"
                )}
                style={{ height: "calc(100% + 1rem)" }}
              />
            )}

            {/* Status icon */}
            <div className="relative flex-shrink-0">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                  status === "completed" && "bg-green-500 text-white shadow-md",
                  status === "current" && "bg-primary text-white ring-4 ring-primary/20 shadow-md",
                  status === "upcoming" && "bg-white border-2 border-neutral-light text-neutral-dark"
                )}
              >
                {item.icon || (
                  <>
                    {status === "completed" && <Check className="w-5 h-5" strokeWidth={3} />}
                    {status === "current" && <Circle className="w-4 h-4 fill-current" />}
                    {status === "upcoming" && <Circle className="w-3 h-3" />}
                  </>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 pb-6">
              <h3
                className={cn(
                  "text-h4 font-semibold mb-1 transition-colors",
                  status === "completed" && "text-green-700",
                  status === "current" && "text-primary",
                  status === "upcoming" && "text-neutral-darkest"
                )}
              >
                {item.title}
              </h3>
              <p
                className={cn(
                  "text-body text-neutral-dark leading-relaxed",
                  status === "upcoming" && "opacity-75"
                )}
              >
                {item.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * TimelineCompact - Horizontal compact timeline for mobile
 */
interface TimelineCompactProps {
  steps: Array<{
    label: string;
    status?: "completed" | "current" | "upcoming";
  }>;
  className?: string;
}

export function TimelineCompact({ steps, className }: TimelineCompactProps) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const status = step.status || "upcoming";

        return (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center">
              {/* Status dot */}
              <div
                className={cn(
                  "w-3 h-3 rounded-full transition-all duration-300",
                  status === "completed" && "bg-green-500",
                  status === "current" && "bg-primary ring-4 ring-primary/20",
                  status === "upcoming" && "bg-neutral-light"
                )}
              />
              {/* Label */}
              <span
                className={cn(
                  "text-caption mt-2 text-center max-w-[80px]",
                  status === "completed" && "text-green-700 font-medium",
                  status === "current" && "text-primary font-semibold",
                  status === "upcoming" && "text-neutral-dark"
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Connector */}
            {!isLast && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-2 transition-all duration-300",
                  status === "completed" && "bg-green-300",
                  status !== "completed" && "bg-neutral-light"
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
