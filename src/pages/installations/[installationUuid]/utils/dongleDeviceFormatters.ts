import type { components } from "@/openapi-client/types/api/v1";

type DongleDevice = components["schemas"]["DongleDevice"];

/**
 * Format dongle role to readable text with emoji indicator
 */
export function formatDongleRole(role: DongleDevice["role"]): string | null {
  if (!role) return null;

  const roleMap: Record<string, string> = {
    EXTENDER: "Extender",
    RCP: "RCP",
  };

  return roleMap[role] || role;
}
