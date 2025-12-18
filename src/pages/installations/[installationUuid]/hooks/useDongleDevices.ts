import { useMemo } from "react";
import type { components } from "@/openapi-client/types/api/v1";

type AdminInstallationDetail = components["schemas"]["AdminInstallationDetail"];
type Device = components["schemas"]["Device"];
type DongleDevice = components["schemas"]["DongleDevice"];

/**
 * Type guard to check if a device is a DongleDevice
 */
function isDongleDevice(device: Device): device is DongleDevice {
  return device.type === "DONGLE";
}

/**
 * Custom hook to extract and memoize Dongle devices from installation
 * @param installation - The installation details containing devices array
 * @returns Object containing array of Dongle devices
 */
export function useDongleDevices(installation: AdminInstallationDetail) {
  const dongleDevices = useMemo(() => {
    const devices = installation.devices?.filter(isDongleDevice) || [];
    return devices;
  }, [installation.devices]);

  return { dongleDevices };
}
