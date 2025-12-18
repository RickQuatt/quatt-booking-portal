export interface ListPageEmptyStateProps {
  /** The entity name to display (e.g., "CICs", "devices", "installers") */
  entityName: string;
  /** Whether any filters are currently active */
  hasFilters: boolean;
  /** Custom message to display when filters are active. Defaults to contextual message. */
  filteredMessage?: string;
  /** Custom message to display when no filters are active. Defaults to contextual message. */
  defaultMessage?: string;
  /** Minimum height for the empty state container. Defaults to 200px */
  minHeight?: string;
}

/**
 * A standardized empty state for list pages with contextual messaging.
 * Shows different messages based on whether filters are active.
 *
 * @example
 * ```tsx
 * <ListPageEmptyState
 *   entityName="devices"
 *   hasFilters={Object.keys(filters).length > 0}
 * />
 * ```
 */
export function ListPageEmptyState({
  entityName,
  hasFilters,
  filteredMessage,
  defaultMessage,
  minHeight = "200px",
}: ListPageEmptyStateProps) {
  const getMessage = (): string => {
    if (hasFilters) {
      return (
        filteredMessage ||
        `No ${entityName} found with the given filters. Try adjusting your search criteria.`
      );
    }
    return (
      defaultMessage || `No ${entityName} found. Use filters above to search.`
    );
  };

  return (
    <div
      className="flex items-center justify-center rounded-lg border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-dark-foreground"
      style={{ minHeight }}
    >
      <p className="text-center text-gray-500 dark:text-gray-400">
        {getMessage()}
      </p>
    </div>
  );
}
