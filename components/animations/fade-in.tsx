"use client";

import * as React from "react";
import { animate, spring } from "motion";

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

/**
 * Fade in animation wrapper using Motion One
 * Animates opacity and slight upward movement on mount
 */
export function FadeIn({
  children,
  delay = 0,
  duration = 0.5,
  className,
}: FadeInProps) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!ref.current) return;

    const element = ref.current;

    // Set initial state
    element.style.opacity = "0";
    element.style.transform = "translateY(20px)";

    // Animate in
    const controls = animate(
      element,
      { opacity: 1, transform: "translateY(0px)" },
      { duration, delay, easing: spring({ stiffness: 300, damping: 30 }) }
    );

    return () => controls.stop();
  }, [delay, duration]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
