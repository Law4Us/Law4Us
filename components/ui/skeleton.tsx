import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

/**
 * Skeleton loader component
 * Shows a pulsing placeholder during loading states
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-neutral-light rounded",
        className
      )}
      aria-busy="true"
      aria-live="polite"
    />
  );
}

/**
 * Form skeleton loader
 */
export function FormSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-12 w-full" />
        </div>
      ))}
    </div>
  );
}

/**
 * Card skeleton loader
 */
export function CardSkeleton() {
  return (
    <div className="bg-white rounded-lg p-6 border border-neutral">
      <Skeleton className="h-6 w-48 mb-4" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}

/**
 * Document skeleton loader
 */
export function DocumentSkeleton() {
  return (
    <div className="bg-white rounded-lg p-6 border border-neutral">
      <Skeleton className="h-7 w-56 mb-4" />
      <div className="space-y-3">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}
