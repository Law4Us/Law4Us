"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Claim } from "@/lib/types";
import { formatCurrency } from "@/lib/utils/format";

interface ClaimCardProps {
  claim: Claim;
  isSelected: boolean;
  onToggle: () => void;
}

/**
 * ClaimCard - Professional claim selection card
 *
 * Displays claim information with title, description, and price
 * Uses design tokens for professional, trustworthy appearance
 */
export function ClaimCard({ claim, isSelected, onToggle }: ClaimCardProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "group relative w-full text-right rounded-xl p-6 transition-all duration-300",
        "border-2 bg-white",
        "hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-primary/20",
        isSelected
          ? "border-primary shadow-md"
          : "border-neutral-light hover:border-neutral"
      )}
      aria-pressed={isSelected}
    >
      {/* Selection indicator */}
      <div
        className={cn(
          "absolute top-6 left-6 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300",
          isSelected
            ? "bg-primary border-primary"
            : "border-neutral group-hover:border-primary/40"
        )}
      >
        {isSelected && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
      </div>

      {/* Content */}
      <div className="pr-0">
        {/* Title & Price */}
        <div className="flex justify-between items-start mb-3">
          <h3
            className={cn(
              "text-h3 font-semibold transition-colors",
              isSelected ? "text-primary" : "text-neutral-darkest"
            )}
          >
            {claim.label}
          </h3>
          <span
            className={cn(
              "text-body font-bold mr-10 transition-colors",
              isSelected ? "text-primary" : "text-neutral-dark"
            )}
          >
            {formatCurrency(claim.price)}
          </span>
        </div>

        {/* Description */}
        {claim.description && (
          <p className="text-body text-neutral-dark leading-relaxed">
            {claim.description}
          </p>
        )}
      </div>

      {/* Bottom accent line when selected */}
      {isSelected && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-b-xl" />
      )}
    </button>
  );
}
