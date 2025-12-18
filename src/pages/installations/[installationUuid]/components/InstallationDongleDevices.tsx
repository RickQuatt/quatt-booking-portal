import type { components } from "@/openapi-client/types/api/v1";
import { CardContainer, DataRow } from "@/components/shared/DetailPage";
import { useDongleDevices } from "../hooks/useDongleDevices";
import { formatDeviceStatus } from "../utils/chillDeviceFormatters";
import { formatDongleRole } from "../utils/dongleDeviceFormatters";

type AdminInstallationDetail = components["schemas"]["AdminInstallationDetail"];
type DongleDevice = components["schemas"]["DongleDevice"];

export interface InstallationDongleDevicesProps {
  installation: AdminInstallationDetail;
}

interface DongleDeviceCardProps {
  device: DongleDevice;
  index: number;
}

function DongleDeviceCard({ device, index }: DongleDeviceCardProps) {
  const deviceName = device.name || device.serialNumber;
  const title = `Dongle Device${index > 0 ? ` #${index + 1}` : ""} - ${deviceName}`;

  return (
    <CardContainer title={title}>
      <div className="space-y-1">
        <DataRow label="Serial Number" value={device.serialNumber} />
        <DataRow label="Name" value={device.name as string | null} />
        <DataRow
          label="Device Status"
          value={formatDeviceStatus(device.status)}
        />
        <DataRow label="PCB Hardware Version" value={device.pcbHwVersion} />
        <DataRow label="EUI-64 (Thread Network ID)" value={device.eui64} />
        <DataRow label="Role" value={formatDongleRole(device.role)} />
      </div>
    </CardContainer>
  );
}

/**
 * Installation Dongle Devices Component
 * Displays dongle device information in a simple card layout
 */
export function InstallationDongleDevices({
  installation,
}: InstallationDongleDevicesProps) {
  const { dongleDevices } = useDongleDevices(installation);

  if (!dongleDevices || dongleDevices.length === 0) {
    return null;
  }

  return (
    <>
      {dongleDevices.map((device, index) => (
        <DongleDeviceCard key={device.uuid} device={device} index={index} />
      ))}
    </>
  );
}
