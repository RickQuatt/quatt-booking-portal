import { useState, useEffect } from "react";

export type LayoutMode = "mobile" | "tablet" | "desktop";

/**
 * Hook to detect responsive layout breakpoints
 * Returns current layout mode based on window width
 *
 * Breakpoints:
 * - mobile: < 768px
 * - tablet: 768px - 1023px
 * - desktop: >= 1024px
 */
export function useResponsiveLayout(): LayoutMode {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(() => {
    if (typeof window === "undefined") return "desktop";

    const width = window.innerWidth;
    if (width < 768) return "mobile";
    if (width < 1024) return "tablet";
    return "desktop";
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setLayoutMode("mobile");
      } else if (width < 1024) {
        setLayoutMode("tablet");
      } else {
        setLayoutMode("desktop");
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return layoutMode;
}
