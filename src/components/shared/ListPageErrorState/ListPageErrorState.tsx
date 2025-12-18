import { Button } from "@/components/ui/Button";

export interface ListPageErrorStateProps {
  /** The entity name to display in the error title (e.g., "CICs", "Devices") */
  entityName: string;
  /** The error object or message */
  error?: Error | { message?: string } | unknown;
  /** Callback function when retry button is clicked */
  onRetry?: () => void;
  /** Minimum height for the error container. Defaults to 400px */
  minHeight?: string;
}

/**
 * A standardized error state for list pages with an error message and retry button.
 *
 * @example
 * ```tsx
 * <ListPageErrorState
 *   entityName="CICs"
 *   error={error}
 *   onRetry={() => refetch()}
 * />
 * ```
 */
export function ListPageErrorState({
  entityName,
  error,
  onRetry,
  minHeight = "400px",
}: ListPageErrorStateProps) {
  const getErrorMessage = (): string => {
    if (!error) return "An unexpected error occurred";
    if (error instanceof Error) return error.message;
    if (typeof error === "object" && error !== null && "message" in error) {
      return String((error as { message: unknown }).message);
    }
    return "An unexpected error occurred";
  };

  return (
    <div className="flex items-center justify-center" style={{ minHeight }}>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">
          Error Loading {entityName}
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {getErrorMessage()}
        </p>
        {onRetry && (
          <Button onClick={onRetry} className="mt-4">
            Retry
          </Button>
        )}
      </div>
    </div>
  );
}
