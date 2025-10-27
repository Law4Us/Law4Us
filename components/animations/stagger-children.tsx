"use client";

import * as React from "react";
import { animate, stagger } from "motion";

interface StaggerChildrenProps {
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
}

/**
 * Stagger animation for child elements
 * Each child fades in sequentially with a delay
 */
export function StaggerChildren({
  children,
  staggerDelay = 0.1,
  className,
}: StaggerChildrenProps) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!ref.current) return;

    const childElements = Array.from(ref.current.children) as HTMLElement[];

    // Set initial state for all children
    childElements.forEach((child) => {
      child.style.opacity = "0";
      child.style.transform = "translateY(10px)";
    });

    // Animate children with stagger
    const controls = animate(
      childElements,
      { opacity: 1, transform: "translateY(0px)" },
      { delay: stagger(staggerDelay), duration: 0.4 }
    );

    return () => controls.stop();
  }, [staggerDelay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
