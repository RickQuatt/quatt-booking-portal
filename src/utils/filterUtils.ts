// Utility functions for filter processing

/**
 * Formats a Date object to YYYY-MM-DD string format for API queries
 */
export function formatDateToYYYYMMDD(
  date: Date | undefined,
): string | undefined {
  if (!date) return undefined;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Validates that a filter value meets minimum character requirements
 * Returns undefined if it doesn't meet the requirement
 */
export function validateMinLength(
  value: string | undefined,
  minLength: number,
): string | undefined {
  if (!value) return undefined;

  const trimmed = value.trim();

  if (trimmed.length < minLength) return undefined;

  return trimmed;
}

/**
 * Applies automatic prefixing and validation to a filter value
 * Automatically adds the specified prefix if not present and validates minimum length
 *
 * @param value - The input filter value
 * @param prefix - The prefix to auto-add (e.g., "CIC-", "QUATT")
 * @param minLength - Minimum required length (after prefix)
 * @returns The prefixed and validated value, or undefined if validation fails
 */
export function applyFilterPrefixAndValidation(
  value: string | undefined,
  prefix: string,
  minLength: number,
): string | undefined {
  if (!value) return undefined;

  const trimmed = value.trim();

  // Check minimum length requirement
  if (trimmed.length < minLength) return undefined;

  // Auto-prefix if not already present
  if (!trimmed.startsWith(prefix)) {
    return `${prefix}${trimmed}`;
  }

  return trimmed;
}
