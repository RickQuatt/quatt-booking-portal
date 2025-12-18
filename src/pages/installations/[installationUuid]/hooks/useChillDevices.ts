import { useMemo } from "react";
import type { components } from "@/openapi-client/types/api/v1";

type AdminInstallationDetail = components["schemas"]["AdminInstallationDetail"];
type Device = components["schemas"]["Device"];
type ChillDevice = components["schemas"]["ChillDevice"];

/**
 * Type guard to check if a device is a ChillDevice
 */
function isChillDevice(device: Device): device is ChillDevice {
  return device.type === "CHILL";
}

/**
 * Custom hook to extract and memoize Chill devices from installation
 * @param installation - The installation details containing devices array
 * @returns Object containing array of Chill devices
 */
export function useChillDevices(installation: AdminInstallationDetail) {
  const chillDevices = useMemo(() => {
    const devices = installation.devices?.filter(isChillDevice) || [];
    return devices;
  }, [installation.devices]);

  return { chillDevices };
}
