import { ReactNode } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";

export interface HybridAccordionItemProps {
  value: string;
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  level?: number;
}

export interface HybridAccordionProps {
  children: ReactNode;
  type?: "single" | "multiple";
  defaultValue?: string | string[];
  className?: string;
}

/**
 * Individual accordion item with support for nesting
 */
export function HybridAccordionItem({
  value,
  title,
  children,
  level = 1,
}: HybridAccordionItemProps) {
  const indent = level > 1 ? `pl-${level * 4}` : "";

  return (
    <AccordionItem value={value} className={indent}>
      <AccordionTrigger className="text-base font-semibold hover:no-underline hover:bg-gray-50 dark:hover:bg-gray-700/50 data-[state=open]:bg-gray-50 dark:data-[state=open]:bg-gray-700/30 px-4 -mx-4 rounded-md transition-colors">
        {title}
      </AccordionTrigger>
      <AccordionContent className="pt-4">{children}</AccordionContent>
    </AccordionItem>
  );
}

/**
 * Hybrid accordion component supporting nested accordions
 * Can have top-level categories with nested sub-accordions
 *
 * @example
 * ```tsx
 * <HybridAccordion type="single" defaultValue="device-info">
 *   <HybridAccordionItem value="device-info" title="Device Information">
 *     <div>Basic device data always visible</div>
 *     <HybridAccordion type="multiple">
 *       <HybridAccordionItem value="updates" title="Update Info" level={2}>
 *         Nested content here
 *       </HybridAccordionItem>
 *     </HybridAccordion>
 *   </HybridAccordionItem>
 * </HybridAccordion>
 * ```
 */
export function HybridAccordion({
  children,
  type = "single",
  defaultValue,
  className = "",
}: HybridAccordionProps) {
  if (type === "single") {
    return (
      <Accordion
        type="single"
        defaultValue={defaultValue as string}
        collapsible
        className={className}
      >
        {children}
      </Accordion>
    );
  }

  return (
    <Accordion
      type="multiple"
      defaultValue={defaultValue as string[]}
      className={className}
    >
      {children}
    </Accordion>
  );
}
