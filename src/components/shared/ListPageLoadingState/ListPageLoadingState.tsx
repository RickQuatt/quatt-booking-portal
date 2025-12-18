import { useState, useEffect } from "react";

const LOADER_SHOW_DELAY = 300;

export interface ListPageLoadingStateProps {
  /** The entity name to display in the loading message (e.g., "CICs", "devices") */
  entityName: string;
  /** Minimum height for the loading container. Defaults to 400px */
  minHeight?: string;
}

/**
 * A standardized loading state for list pages with a spinner and message.
 * Includes a small delay before showing to prevent flicker on fast loads.
 *
 * @example
 * ```tsx
 * <ListPageLoadingState entityName="CICs" />
 * ```
 */
export function ListPageLoadingState({
  entityName,
  minHeight = "400px",
}: ListPageLoadingStateProps) {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldShow(true);
    }, LOADER_SHOW_DELAY);
    return () => clearTimeout(timer);
  }, []);

  if (!shouldShow) {
    return <div style={{ minHeight }} />;
  }

  return (
    <div className="flex items-center justify-center" style={{ minHeight }}>
      <div className="text-center">
        <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
        <p className="text-gray-600 dark:text-gray-400">
          Loading {entityName}...
        </p>
      </div>
    </div>
  );
}
