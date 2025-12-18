import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface DataRowProps {
  label: string;
  value: ReactNode;
  className?: string;
}

/**
 * Horizontal label-value display for detail pages
 * Used across CIC and Installation pages for consistent property display
 *
 * @example
 * ```tsx
 * <DataRow label="CIC ID" value={cicData.id} />
 * <DataRow label="Status" value={<Badge>Active</Badge>} />
 * ```
 */
export function DataRow({ label, value, className }: DataRowProps) {
  const displayValue =
    value !== null && value !== undefined ? (
      value
    ) : (
      <span className="text-gray-400 dark:text-gray-500">N/A</span>
    );

  return (
    <div
      className={cn(
        "flex justify-between border-b border-gray-200 py-2 dark:border-gray-700",
        className,
      )}
    >
      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
        {label}
      </span>
      <span className="text-sm text-gray-900 dark:text-gray-100">
        {displayValue}
      </span>
    </div>
  );
}
