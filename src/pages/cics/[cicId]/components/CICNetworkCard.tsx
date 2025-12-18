import type { components } from "@/openapi-client/types/api/v1";
import {
  CardContainer,
  DataRow,
  HybridAccordion,
  HybridAccordionItem,
} from "@/components/shared/DetailPage";
import { formatDateDistance } from "@/utils/formatDate";

type AdminCic = components["schemas"]["AdminCic"];
type AvailableWifiNetwork = NonNullable<
  AdminCic["availableWifiNetworks"]
>[number];

export interface CICNetworkCardProps {
  cicData: AdminCic;
}

/**
 * Network & Connectivity card
 * Shows connection status, WiFi info, and available networks
 */
export function CICNetworkCard({ cicData }: CICNetworkCardProps) {
  return (
    <CardContainer title="Network & Connectivity">
      {/* Connection Status - Always visible */}
      <div className="space-y-1 mb-4">
        <DataRow
          label="Last Updated"
          value={
            cicData.lastConnectionStatusUpdatedAt
              ? formatDateDistance(
                  new Date(cicData.lastConnectionStatusUpdatedAt),
                )
              : null
          }
        />
        <DataRow
          label="Ethernet Cable Status"
          value={cicData.cableConnectionStatus}
        />
        <DataRow label="LTE Status" value={cicData.lteConnectionStatus} />
        <DataRow
          label="WiFi Enabled"
          value={
            cicData.wifiEnabled !== null && cicData.wifiEnabled !== undefined
              ? String(cicData.wifiEnabled)
              : null
          }
        />
        <DataRow label="WiFi Status" value={cicData.wifiConnectionStatus} />
      </div>

      {/* Nested Accordions */}
      <HybridAccordion type="multiple" defaultValue={[]}>
        {/* WiFi Information */}
        <HybridAccordionItem
          value="wifi-info"
          title="WiFi Information"
          level={2}
        >
          <div className="space-y-1">
            <DataRow label="Connected SSID" value={cicData.wifiSSID} />
            <DataRow
              label="Scanning for WiFi"
              value={
                cicData.isScanningForWifi !== null &&
                cicData.isScanningForWifi !== undefined
                  ? String(cicData.isScanningForWifi)
                  : null
              }
            />
            <DataRow
              label="Last Scanned"
              value={
                cicData.lastScannedForWifi
                  ? formatDateDistance(new Date(cicData.lastScannedForWifi))
                  : null
              }
            />
          </div>
        </HybridAccordionItem>

        {/* Available Networks */}
        {cicData.availableWifiNetworks &&
          cicData.availableWifiNetworks.length > 0 && (
            <HybridAccordionItem
              value="available-networks"
              title={`Available Networks (${cicData.availableWifiNetworks.length})`}
              level={2}
            >
              <div className="space-y-3">
                {cicData.availableWifiNetworks.map((network, index) => (
                  <AvailableNetworkItem
                    key={index}
                    network={network}
                    index={index + 1}
                  />
                ))}
              </div>
            </HybridAccordionItem>
          )}
      </HybridAccordion>
    </CardContainer>
  );
}

function AvailableNetworkItem({
  network,
  index,
}: {
  network: AvailableWifiNetwork;
  index: number;
}) {
  const getSignalColor = (bars: number | undefined) => {
    if (!bars) return "text-gray-400";
    if (bars >= 4) return "text-green-600";
    if (bars >= 3) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="rounded-md border-2 border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-dark-foreground">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {network.SSID}
        </span>
        <span
          className={`text-sm font-semibold ${getSignalColor(network.barsOutOf5)}`}
        >
          {network.barsOutOf5 ? `${network.barsOutOf5}/5 bars` : "N/A"}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-gray-500 dark:text-gray-400">Signal: </span>
          <span className="text-gray-700 dark:text-gray-300">
            {network.signal ?? "N/A"}
          </span>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">Security: </span>
          <span className="text-gray-700 dark:text-gray-300">
            {network.security ?? "N/A"}
          </span>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">Encrypted: </span>
          <span className="text-gray-700 dark:text-gray-300">
            {network.encrypted !== null && network.encrypted !== undefined
              ? String(network.encrypted)
              : "N/A"}
          </span>
        </div>
      </div>
    </div>
  );
}
