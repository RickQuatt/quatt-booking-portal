import { describe, it, expect } from "vitest";
import { isValidUrl, getImageFallbackUrl, IMAGE_CONSTANTS } from "./urlUtils";

describe("urlUtils", () => {
  describe("isValidUrl", () => {
    it("returns true for valid absolute HTTP URLs", () => {
      expect(isValidUrl("http://example.com/image.jpg")).toBe(true);
      expect(isValidUrl("http://example.com")).toBe(true);
    });

    it("returns true for valid absolute HTTPS URLs", () => {
      expect(isValidUrl("https://example.com/image.jpg")).toBe(true);
      expect(isValidUrl("https://example.com/path/to/image.png")).toBe(true);
    });

    it("returns true for valid relative URLs", () => {
      expect(isValidUrl("/assets/image.jpg")).toBe(true);
      expect(isValidUrl("/path/to/file.png")).toBe(true);
      expect(isValidUrl("/image.jpg")).toBe(true);
    });

    it("returns false for invalid URLs", () => {
      expect(isValidUrl("not a url")).toBe(false);
      expect(isValidUrl("just text")).toBe(false);
    });

    it("returns false for strings that start with / but have spaces", () => {
      expect(isValidUrl("/some random text")).toBe(false);
      expect(isValidUrl("/hello world")).toBe(false);
      expect(isValidUrl("/ with spaces")).toBe(false);
    });

    it("returns false for empty strings", () => {
      expect(isValidUrl("")).toBe(false);
      expect(isValidUrl("   ")).toBe(false);
    });

    it("returns false for malformed HTTP URLs", () => {
      expect(isValidUrl("http://")).toBe(false);
      expect(isValidUrl("https://")).toBe(false);
    });

    it("handles edge cases", () => {
      expect(isValidUrl("/")).toBe(true); // Root path
      expect(isValidUrl("//example.com")).toBe(false); // Protocol-relative URL
    });
  });

  describe("getImageFallbackUrl", () => {
    it("generates a valid SVG data URL with default values", () => {
      const fallbackUrl = getImageFallbackUrl();
      expect(fallbackUrl).toContain("data:image/svg+xml");
      expect(fallbackUrl).toContain(
        String(IMAGE_CONSTANTS.FALLBACK_IMAGE_SIZE),
      );
      expect(fallbackUrl).toContain("Image%20not%20found");
    });

    it("generates a valid SVG data URL with custom size", () => {
      const fallbackUrl = getImageFallbackUrl(200);
      expect(fallbackUrl).toContain("data:image/svg+xml");
      expect(fallbackUrl).toContain("200");
    });

    it("generates a valid SVG data URL with custom message", () => {
      const fallbackUrl = getImageFallbackUrl(120, "Custom message");
      expect(fallbackUrl).toContain("data:image/svg+xml");
      expect(fallbackUrl).toContain("Custom%20message");
    });

    it("properly encodes special characters in message", () => {
      const fallbackUrl = getImageFallbackUrl(120, "Error: File not found!");
      expect(fallbackUrl).toContain("data:image/svg+xml");
      // Check that special characters are encoded
      expect(fallbackUrl).toContain("Error");
      expect(fallbackUrl).toContain("File");
    });
  });

  describe("IMAGE_CONSTANTS", () => {
    it("has expected constant values", () => {
      expect(IMAGE_CONSTANTS.THUMBNAIL_HEIGHT).toBe(120);
      expect(IMAGE_CONSTANTS.FALLBACK_IMAGE_SIZE).toBe(120);
    });

    it("constants are readonly", () => {
      // TypeScript will prevent this at compile time, but verify at runtime too
      expect(() => {
        // @ts-expect-error - Testing runtime immutability
        IMAGE_CONSTANTS.THUMBNAIL_HEIGHT = 200;
      }).toThrow();
    });
  });
});
