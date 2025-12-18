import { ReactNode } from "react";

export interface PageHeaderProps {
  /** The main title of the page */
  title: string;
  /** Optional subtitle text (e.g., "10 CICs found" or "Loading...") */
  subtitle?: string;
  /** Whether the page is currently loading data */
  isLoading?: boolean;
  /** Message to show while loading. Defaults to "Loading..." */
  loadingMessage?: string;
  /** Optional action buttons or other elements to display on the right side */
  actions?: ReactNode;
}

/**
 * A standardized page header for list and detail pages.
 * Displays a title, optional subtitle with loading state, and optional action buttons.
 *
 * @example
 * ```tsx
 * <PageHeader
 *   title="CIC List"
 *   subtitle={`${total} CICs found`}
 *   isLoading={isLoading}
 *   actions={<Button>Add New</Button>}
 * />
 * ```
 */
export function PageHeader({
  title,
  subtitle,
  isLoading = false,
  loadingMessage = "Loading...",
  actions,
}: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        {(subtitle || isLoading) && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isLoading ? loadingMessage : subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
