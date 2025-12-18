import * as React from "react";
import { cn } from "@/lib/utils";

export interface ScrollIndicatorWrapperProps {
  children: React.ReactNode;
  className?: string;
  /** Which axis to show scroll indicators for. Default: 'x' */
  axis?: "x" | "y" | "both";
  /** Max height for the scroll container (applies when axis includes 'y') */
  maxHeight?: string;
}

/**
 * Wrapper component that adds gradient shadow indicators to show
 * when content can be scrolled.
 *
 * Shows shadows on the edges when there's more content to scroll in that direction.
 *
 * @example
 * ```tsx
 * // Horizontal scrolling (default)
 * <ScrollIndicatorWrapper className="rounded-lg border">
 *   <Table>...</Table>
 * </ScrollIndicatorWrapper>
 *
 * // Vertical scrolling with max height
 * <ScrollIndicatorWrapper axis="y" maxHeight="500px">
 *   <div>Long content...</div>
 * </ScrollIndicatorWrapper>
 * ```
 */
export function ScrollIndicatorWrapper({
  children,
  className,
  axis = "x",
  maxHeight,
}: ScrollIndicatorWrapperProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);
  const [canScrollTop, setCanScrollTop] = React.useState(false);
  const [canScrollBottom, setCanScrollBottom] = React.useState(false);

  const showHorizontal = axis === "x" || axis === "both";
  const showVertical = axis === "y" || axis === "both";

  const checkScrollPosition = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    // Horizontal scroll detection
    if (showHorizontal) {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }

    // Vertical scroll detection
    if (showVertical) {
      const { scrollTop, scrollHeight, clientHeight } = el;
      setCanScrollTop(scrollTop > 0);
      setCanScrollBottom(scrollTop < scrollHeight - clientHeight - 1);
    }
  }, [showHorizontal, showVertical]);

  React.useEffect(() => {
    checkScrollPosition();

    // Check on resize as well
    const resizeObserver = new ResizeObserver(checkScrollPosition);
    if (scrollRef.current) {
      resizeObserver.observe(scrollRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [checkScrollPosition]);

  const overflowClass =
    axis === "x"
      ? "overflow-x-auto"
      : axis === "y"
        ? "overflow-y-auto"
        : "overflow-auto";

  return (
    <div className="relative">
      {/* Top shadow indicator */}
      {showVertical && (
        <div
          className={cn(
            "pointer-events-none absolute left-0 right-0 top-0 z-10 h-10 w-full",
            "bg-gradient-to-b from-white to-transparent dark:from-gray-800",
            "transition-opacity duration-200",
            canScrollTop ? "opacity-100" : "opacity-0",
          )}
          aria-hidden="true"
        />
      )}

      {/* Left shadow indicator */}
      {showHorizontal && (
        <div
          className={cn(
            "pointer-events-none absolute left-0 top-0 z-10 h-full w-10",
            "bg-gradient-to-r from-white to-transparent dark:from-gray-800",
            "transition-opacity duration-200",
            canScrollLeft ? "opacity-100" : "opacity-0",
          )}
          aria-hidden="true"
        />
      )}

      {/* Scrollable content */}
      <div
        ref={scrollRef}
        onScroll={checkScrollPosition}
        className={cn(overflowClass, className)}
        style={showVertical && maxHeight ? { maxHeight } : undefined}
      >
        {children}
      </div>

      {/* Right shadow indicator */}
      {showHorizontal && (
        <div
          className={cn(
            "pointer-events-none absolute right-0 top-0 z-10 h-full w-10",
            "bg-gradient-to-l from-white to-transparent dark:from-gray-800",
            "transition-opacity duration-200",
            canScrollRight ? "opacity-100" : "opacity-0",
          )}
          aria-hidden="true"
        />
      )}

      {/* Bottom shadow indicator */}
      {showVertical && (
        <div
          className={cn(
            "pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-10 w-full",
            "bg-gradient-to-t from-white to-transparent dark:from-gray-800",
            "transition-opacity duration-200",
            canScrollBottom ? "opacity-100" : "opacity-0",
          )}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
