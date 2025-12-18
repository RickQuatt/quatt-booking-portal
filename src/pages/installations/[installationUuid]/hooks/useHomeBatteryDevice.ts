import { useMemo } from "react";
import type { components } from "@/openapi-client/types/api/v1";

type AdminInstallationDetail = components["schemas"]["AdminInstallationDetail"];
type Device = components["schemas"]["Device"];
type HomeBatteryDevice = components["schemas"]["HomeBatteryDevice"];

/**
 * Type guard to check if a device is a HomeBatteryDevice
 */
function isHomeBatteryDevice(device: Device): device is HomeBatteryDevice {
  return device.type === "HOME_BATTERY";
}

/**
 * Custom hook to extract and memoize home battery device from installation
 * @param installation - The installation details containing devices array
 * @returns Object containing the home battery device and its serial number
 */
export function useHomeBatteryDevice(installation: AdminInstallationDetail) {
  const homeBatteryDevice = useMemo(() => {
    const device = installation.devices?.find(isHomeBatteryDevice);
    return device;
  }, [installation.devices]);

  const batterySn = homeBatteryDevice?.serialNumber;

  return { homeBatteryDevice, batterySn };
}
