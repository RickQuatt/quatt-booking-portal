import { format } from "date-fns";
import { ChillRunningMode } from "../../api-client/models";

/**
 * Format running mode enum to readable text
 * ChillRunningMode string enum (STANDBY, COOLING, HEATING, etc.)
 */
export function formatRunningMode(
  mode: ChillRunningMode | null | undefined,
): string | null {
  if (mode === null || mode === undefined) return null;

  // Convert snake_case to Title Case
  const formatted = mode
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");

  return formatted;
}

/**
 * Format fan mode enum to readable text
 * ChillFanMode: 0=auto, 1=low, 2=high
 */
export function formatFanMode(mode: number): string {
  const fanModes: Record<number, string> = {
    0: "Auto",
    1: "Low",
    2: "High",
  };
  return fanModes[mode] || `Mode ${mode}`;
}

/**
 * Format four-way valve state to operating mode
 * false = cooling mode, true = heating mode
 */
export function formatFourWayValve(enabled: boolean): string {
  return enabled ? "🟥 Heating Mode" : "🟦 Cooling Mode";
}

/**
 * Format temperature with °C suffix
 */
export function formatTemperature(
  temp: number | null | undefined,
): string | null {
  if (temp === null || temp === undefined) return null;
  return `${temp.toFixed(1)}°C`;
}

/**
 * Format RPM value with suffix
 */
export function formatRPM(rpm: number | null | undefined): string | null {
  if (rpm === null || rpm === undefined) return null;
  return `${rpm} RPM`;
}

/**
 * Format percentage value with % suffix
 */
export function formatPercentage(
  value: number | null | undefined,
): string | null {
  if (value === null || value === undefined) return null;
  return `${value}%`;
}

/**
 * Format Unix timestamp (milliseconds) to readable date/time
 */
export function formatTimestamp(timestamp: number | null): string {
  if (timestamp === null) return "N/A";
  try {
    const date = new Date(timestamp);
    return format(date, "PPpp");
  } catch (error) {
    return "Invalid timestamp";
  }
}

/**
 * Format boolean status with visual indicators
 */
export function formatBooleanStatus(
  status: boolean | null | undefined,
  labels?: {
    trueLabel?: string;
    falseLabel?: string;
  },
): string | null {
  if (status === null || status === undefined) return null;
  const trueLabel = labels?.trueLabel || "Yes";
  const falseLabel = labels?.falseLabel || "No";
  return status ? `✅ ${trueLabel}` : `❌ ${falseLabel}`;
}

/**
 * Format water flow status
 * Note: waterFlowSwitchClosed - true means switch is closed (flow OK), false means open (issue)
 */
export function formatWaterFlowStatus(
  switchClosed: boolean | null | undefined,
): string | null {
  if (switchClosed === null || switchClosed === undefined) return null;
  return switchClosed ? "🟢 OK" : "🔴 Issue Detected";
}

/**
 * Format device status with color indicator
 */
export function formatDeviceStatus(status: string): string {
  const statusMap: Record<string, string> = {
    FACTORY: "🟡 Factory",
    UNINSTALLED: "⚪ Uninstalled",
    ACTIVE: "🟢 Active",
    PENDING_COMMISSIONING: "🟡 Pending Commissioning",
    IN_ERROR: "🔴 In Error",
  };
  return statusMap[status] || status;
}

/**
 * Format on/off status
 */
export function formatOnOffStatus(
  isOn: boolean | null | undefined,
): string | null {
  if (isOn === null || isOn === undefined) return null;
  return isOn ? "🟢 On" : "⚪ Off";
}

/**
 * Format four-way valve reversed state to operating mode
 * true = reversed (heating mode), false = normal (cooling mode)
 */
export function formatFourWayValveReversed(
  reversed: boolean | null | undefined,
): string | null {
  if (reversed === null || reversed === undefined) return null;
  return reversed ? "🟥 Heating Mode" : "🟦 Cooling Mode";
}

/**
 * Format system failures array
 */
export function formatSystemFailures(
  failures: Array<string> | null | undefined,
): string {
  if (!failures || failures.length === 0) {
    return "✅ None";
  }
  return `🔴 Active (${failures.length})`;
}

/**
 * Format system protections array
 */
export function formatSystemProtections(
  protections: Array<string> | null | undefined,
): string {
  if (!protections || protections.length === 0) {
    return "✅ None";
  }
  return `🟡 Active (${protections.length})`;
}

/**
 * Format system failures list as string
 */
export function formatSystemFailuresList(
  failures: Array<string> | null | undefined,
): string | null {
  if (!failures || failures.length === 0) {
    return null;
  }
  return failures.map((f, i) => `${i + 1}. ${f}`).join("\n");
}

/**
 * Format system protections list as string
 */
export function formatSystemProtectionsList(
  protections: Array<string> | null | undefined,
): string | null {
  if (!protections || protections.length === 0) {
    return null;
  }
  return protections.map((p, i) => `${i + 1}. ${p}`).join("\n");
}
