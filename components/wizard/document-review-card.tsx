"use client";

import * as React from "react";
import { Check, ScrollText } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentReviewCardProps {
  title: string;
  content: string;
  isReviewed: boolean;
  onReviewChange: (reviewed: boolean) => void;
  documentNumber: number;
  renderAsHTML?: boolean; // Optional flag to render content as HTML
}

/**
 * DocumentReviewCard - Professional document review component for legal forms
 *
 * Features:
 * - Scrollable document preview
 * - Scroll-to-bottom detection
 * - "I have read" checkbox (only enabled after scrolling)
 * - Visual feedback for completion
 */
export function DocumentReviewCard({
  title,
  content,
  isReviewed,
  onReviewChange,
  documentNumber,
  renderAsHTML = false,
}: DocumentReviewCardProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [hasScrolledToBottom, setHasScrolledToBottom] = React.useState(false);

  // Check if user has scrolled to bottom
  const handleScroll = () => {
    if (!scrollRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50; // 50px threshold

    if (isAtBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
    }
  };

  React.useEffect(() => {
    // Check if content is short enough to not need scrolling
    if (scrollRef.current) {
      const { scrollHeight, clientHeight } = scrollRef.current;
      if (scrollHeight <= clientHeight + 10) {
        setHasScrolledToBottom(true);
      }
    }
  }, [content]);

  return (
    <div
      className={cn(
        "bg-white rounded-xl border-2 transition-all duration-300",
        isReviewed && "border-green-300 shadow-md",
        !isReviewed && "border-neutral-light"
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "px-6 py-4 border-b-2 flex items-center justify-between transition-colors",
          isReviewed && "bg-green-50 border-green-200",
          !isReviewed && "bg-neutral-lightest border-neutral-light"
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center font-bold text-body-large transition-colors",
              isReviewed && "bg-green-500 text-white",
              !isReviewed && "bg-primary text-white"
            )}
          >
            {isReviewed ? <Check className="w-6 h-6" /> : documentNumber}
          </div>
          <h3 className="text-h3 font-semibold">{title}</h3>
        </div>
        {isReviewed && (
          <span className="text-body-small text-green-600 font-medium">
            ✓ נקרא ואושר
          </span>
        )}
      </div>

      {/* Document Content */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="p-6 max-h-[400px] overflow-y-auto relative"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#019FB7 #f1f1f1",
        }}
      >
        {renderAsHTML ? (
          <div
            className="whitespace-pre-wrap font-assistant text-body leading-relaxed text-neutral-darkest"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        ) : (
          <pre className="whitespace-pre-wrap font-assistant text-body leading-relaxed text-neutral-darkest">
            {content}
          </pre>
        )}

        {/* Scroll indicator if not at bottom */}
        {!hasScrolledToBottom && (
          <div className="sticky bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none flex items-end justify-center pb-4">
            <div className="bg-primary text-white px-4 py-2 rounded-full text-body-small font-medium shadow-lg flex items-center gap-2 animate-bounce">
              <ScrollText className="w-4 h-4" />
              גללו למטה לסיום
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Checkbox */}
      <div className="px-6 py-4 border-t-2 border-neutral-light bg-neutral-lightest">
        <label
          className={cn(
            "flex items-center gap-3 cursor-pointer transition-opacity",
            !hasScrolledToBottom && "opacity-50 cursor-not-allowed"
          )}
        >
          <input
            type="checkbox"
            checked={isReviewed}
            onChange={(e) => onReviewChange(e.target.checked)}
            disabled={!hasScrolledToBottom}
            className="w-5 h-5 rounded border-2 border-neutral checked:bg-primary checked:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
          <span
            className={cn(
              "text-body font-medium transition-colors",
              isReviewed && "text-green-700",
              !isReviewed && hasScrolledToBottom && "text-neutral-darkest",
              !hasScrolledToBottom && "text-neutral-dark"
            )}
          >
            קראתי והבנתי את המסמך
          </span>
        </label>
        {!hasScrolledToBottom && (
          <p className="text-caption text-neutral-dark mt-2 mr-8">
            יש לגלול לתחתית המסמך לפני אישור
          </p>
        )}
      </div>
    </div>
  );
}
