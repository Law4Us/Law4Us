import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Loading spinner component
 */
export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
  };

  return (
    <div
      className={cn(
        "inline-block rounded-full border-primary border-t-transparent animate-spin",
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="טוען..."
    >
      <span className="sr-only">טוען...</span>
    </div>
  );
}

/**
 * Full page loading state
 */
export function PageLoading() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mb-4" />
        <p className="text-body text-neutral-700">טוען...</p>
      </div>
    </div>
  );
}
