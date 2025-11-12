// Utility functions for filter processing

/**
 * Formats a Date object to YYYY-MM-DD string format for API
 */
export function formatDateToYYYYMMDD(
  date: Date | null | undefined,
): string | undefined {
  if (!date) return undefined;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Applies minimum character requirements and auto-prefixes to filter values
 * Returns undefined if the value doesn't meet requirements
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

  // If value doesn't start with prefix, add it
  if (!trimmed.startsWith(prefix)) {
    return prefix + trimmed;
  }

  return trimmed;
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
