import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {
      // deprecated - no-op for testing
    },
    removeListener: () => {
      // deprecated - no-op for testing
    },
    addEventListener: () => {
      // no-op for testing
    },
    removeEventListener: () => {
      // no-op for testing
    },
    dispatchEvent: () => false,
  }),
});
