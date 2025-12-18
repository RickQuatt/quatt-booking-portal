import { Button } from "@/components/ui/Button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface PaginationControlsProps {
  /** Current page number (1-indexed) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Total number of items across all pages */
  total: number;
  /** Number of items per page */
  pageSize: number;
  /** Callback when previous button is clicked */
  onPreviousPage: () => void;
  /** Callback when next button is clicked */
  onNextPage: () => void;
  /** Callback when a specific page is clicked */
  onPageChange?: (page: number) => void;
  /** Whether to show the pagination when there are no results. Defaults to false */
  showIfEmpty?: boolean;
}

/**
 * Generates an array of page numbers to display with smart ellipsis logic.
 * For ≤7 pages: shows all pages
 * For >7 pages: shows first, last, and pages around current with ellipsis
 */
function getPageNumbers(
  currentPage: number,
  totalPages: number,
): (number | "...")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [];
  const siblings = 1; // Number of pages to show on each side of current

  // Always include first page
  pages.push(1);

  // Calculate the range around current page
  const rangeStart = Math.max(2, currentPage - siblings);
  const rangeEnd = Math.min(totalPages - 1, currentPage + siblings);

  // Add ellipsis after first page if needed
  if (rangeStart > 2) {
    pages.push("...");
  }

  // Add pages in the range
  for (let i = rangeStart; i <= rangeEnd; i++) {
    pages.push(i);
  }

  // Add ellipsis before last page if needed
  if (rangeEnd < totalPages - 1) {
    pages.push("...");
  }

  // Always include last page
  if (totalPages > 1) {
    pages.push(totalPages);
  }

  return pages;
}

/**
 * A standardized pagination control for list pages.
 * Shows page numbers with smart ellipsis and circular navigation buttons.
 *
 * @example
 * ```tsx
 * <PaginationControls
 *   currentPage={1}
 *   totalPages={10}
 *   total={100}
 *   pageSize={10}
 *   onPreviousPage={() => setPage(page - 1)}
 *   onNextPage={() => setPage(page + 1)}
 *   onPageChange={(page) => setPage(page)}
 * />
 * ```
 */
export function PaginationControls({
  currentPage,
  totalPages,
  total,
  onPreviousPage,
  onNextPage,
  onPageChange,
  showIfEmpty = false,
}: PaginationControlsProps) {
  // Don't render if there are no results and showIfEmpty is false
  if (total === 0 && !showIfEmpty) {
    return null;
  }

  const pageNumbers = getPageNumbers(currentPage, totalPages || 1);

  const handlePageClick = (page: number) => {
    if (onPageChange) {
      onPageChange(page);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Navigation row */}
      <div className="flex items-center gap-1">
        {/* Previous button */}
        <Button
          variant="outline"
          size="icon-sm"
          onClick={onPreviousPage}
          disabled={currentPage <= 1}
          aria-label="Go to previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Page numbers */}
        {pageNumbers.map((page, index) =>
          page === "..." ? (
            <span
              key={`ellipsis-${index}`}
              className="flex h-8 w-8 items-center justify-center text-sm text-gray-500 dark:text-gray-400"
              aria-hidden="true"
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => handlePageClick(page)}
              disabled={!onPageChange}
              aria-label={`Go to page ${page}`}
              aria-current={page === currentPage ? "page" : undefined}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-quatt-primary ${
                page === currentPage
                  ? "bg-quatt-primary text-quatt-dark"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              } ${!onPageChange ? "cursor-default" : "cursor-pointer"}`}
            >
              {page}
            </button>
          ),
        )}

        {/* Next button */}
        <Button
          variant="outline"
          size="icon-sm"
          onClick={onNextPage}
          disabled={currentPage >= totalPages}
          aria-label="Go to next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Summary text */}
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Page {currentPage} of {totalPages || 1} ({total} total)
      </div>
    </div>
  );
}
