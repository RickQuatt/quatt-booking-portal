/**
 * Image-related constants
 */
export const IMAGE_CONSTANTS = {
  THUMBNAIL_HEIGHT: 120,
  FALLBACK_IMAGE_SIZE: 120,
} as const;

/**
 * Checks if a string is a valid URL (absolute or relative)
 *
 * This function validates URLs that could be image sources:
 * - Absolute URLs: http://, https://
 * - Relative URLs: starting with / followed by alphanumeric characters
 *
 * @param value - String to check
 * @returns true if the string is a valid URL pattern
 *
 * @example
 * ```ts
 * isValidUrl("https://example.com/image.jpg") // true
 * isValidUrl("/assets/image.jpg") // true
 * isValidUrl("/some random text") // false
 * isValidUrl("not a url") // false
 * ```
 */
export function isValidUrl(value: string): boolean {
  if (typeof value !== "string" || value.trim() === "") {
    return false;
  }

  // Check for absolute URLs (http:// or https://)
  if (value.startsWith("http://") || value.startsWith("https://")) {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }

  // Check for relative URLs - must start with / and have valid path characters
  // Matches patterns like: /path, /path/to/file.jpg, /assets/image.png
  // Does NOT match: "/some random text with spaces"
  if (value.startsWith("/")) {
    // Valid relative URL should not contain spaces after the leading slash
    // and should look like a proper path
    const pathPattern = /^\/[^\s]*$/;
    return pathPattern.test(value);
  }

  return false;
}

/**
 * Generates a fallback SVG data URL for broken images
 *
 * @param size - Size of the square SVG in pixels
 * @param message - Message to display in the SVG
 * @returns Data URL string for the SVG
 */
export function getImageFallbackUrl(
  size: number = IMAGE_CONSTANTS.FALLBACK_IMAGE_SIZE,
  message = "Image not found",
) {
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'%3E%3Crect fill='%23f0f0f0' width='${size}' height='${size}'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-size='12'%3E${encodeURIComponent(message)}%3C/text%3E%3C/svg%3E`;
}
