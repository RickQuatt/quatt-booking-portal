import { ReactNode } from "react";

export interface StickyHeaderProps {
  children: ReactNode;
  className?: string;
}

/**
 * Sticky header component for detail pages
 * Remains visible at the top while scrolling
 */
export function StickyHeader({ children, className = "" }: StickyHeaderProps) {
  return (
    <div
      className={`sticky top-0 z-40 bg-white dark:bg-dark-foreground shadow-md dark:shadow-gray-950/50 border-b border-gray-200 dark:border-gray-700 ${className}`}
    >
      <div className="px-6 py-4">{children}</div>
    </div>
  );
}
