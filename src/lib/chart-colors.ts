/**
 * Chart.js color constants for CIC health status visualization
 * Using RGBA format with 0.4 opacity for fills, 1.0 for borders
 */

// Fill colors (with opacity)
export const correctColor = "rgba(75, 192, 192, 0.4)"; // Teal/cyan - healthy
export const warningColor = "rgba(255, 159, 64, 0.4)"; // Orange - warnings
export const errorColor = "rgba(255, 99, 132, 0.4)"; // Red/pink - errors
export const notApplicableColor = "rgba(150, 150, 150, 0.4)"; // Gray - N/A

// Border colors (solid, no opacity)
export const correctBorderColor = "rgba(75, 192, 192, 1)";
export const warningBorderColor = "rgba(255, 159, 64, 1)";
export const errorBorderColor = "rgba(255, 99, 132, 1)";
export const notApplicableBorderColor = "rgba(150, 150, 150, 1)";

// Additional system colors (for future use)
export const quattColor = "rgba(230, 126, 34, 1)";
export const boilerColor = "rgba(52, 73, 94, 1)";
export const comboColor = "rgba(149, 165, 166, 1)";
export const antiFreezeProtectionColor = "rgba(46, 204, 113, 1)";
export const idleColor = "rgba(155, 89, 182, 1)";
