import { useState } from "react";

export interface AccordionStateConfig {
  /** IDs of accordions that should be open by default */
  defaultOpen?: string[];
  /** Type of accordion (single or multiple items can be open) */
  type?: "single" | "multiple";
}

/**
 * Hook to manage accordion open/close state
 * Useful for controlling which accordions are expanded by default
 *
 * @example
 * ```tsx
 * const { openItems, setOpenItems } = useAccordionState({
 *   defaultOpen: ['device-info', 'health'],
 *   type: 'multiple'
 * });
 * ```
 */
export function useAccordionState({
  defaultOpen = [],
  type = "multiple",
}: AccordionStateConfig = {}) {
  const [openItems, setOpenItems] = useState<string | string[]>(() => {
    if (type === "single") {
      return defaultOpen[0] || "";
    }
    return defaultOpen;
  });

  const isOpen = (itemId: string): boolean => {
    if (type === "single") {
      return openItems === itemId;
    }
    return (openItems as string[]).includes(itemId);
  };

  const toggle = (itemId: string) => {
    if (type === "single") {
      setOpenItems((current) => (current === itemId ? "" : itemId));
    } else {
      setOpenItems((current) => {
        const items = current as string[];
        if (items.includes(itemId)) {
          return items.filter((id) => id !== itemId);
        }
        return [...items, itemId];
      });
    }
  };

  return {
    openItems,
    setOpenItems,
    isOpen,
    toggle,
  };
}
