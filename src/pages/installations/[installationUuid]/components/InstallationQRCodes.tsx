import QRCode from "react-qr-code";
import { CardContainer, DataRow } from "@/components/shared/DetailPage";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";
import type { components } from "@/openapi-client/types/api/v1";

type AdminInstallationDetail = components["schemas"]["AdminInstallationDetail"];
type HeatBatteryDevice = components["schemas"]["HeatBatteryDevice"];
type HeatChargerDevice = components["schemas"]["HeatChargerDevice"];
type HomeBatteryDevice = components["schemas"]["HomeBatteryDevice"];

export interface InstallationQRCodesProps {
  installation: AdminInstallationDetail;
}

/**
 * QR Code Section - Reusable sub-component for displaying a QR code with label
 */
function QRCodeSection({
  id,
  title,
  label,
  value,
  qrContent,
}: {
  id: string;
  title: string;
  label?: string;
  value?: string;
  qrContent: string;
}) {
  return (
    <AccordionItem value={id}>
      <AccordionTrigger className="text-sm font-medium hover:no-underline">
        {title}
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-3">
          {label && value && <DataRow label={label} value={value} />}
          <div className="flex justify-center py-2">
            <div className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-dark-foreground">
              <QRCode
                size={150}
                value={qrContent}
                viewBox="0 0 256 256"
                className="h-auto w-full max-w-[150px]"
              />
            </div>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

/**
 * Installation QR Codes Component
 * Displays QR codes for CIC, Heat Battery, Heat Charger, and Home Battery devices
 * Each section is collapsible accordion-style
 */
export function InstallationQRCodes({
  installation,
}: InstallationQRCodesProps) {
  const devices = installation.devices || [];

  // Filter devices by type
  const heatBatteries = devices.filter(
    (d): d is HeatBatteryDevice =>
      d.type === "HEAT_BATTERY" && !!d.serialNumber,
  );
  const heatChargers = devices.filter(
    (d): d is HeatChargerDevice =>
      d.type === "HEAT_CHARGER" && !!d.serialNumber,
  );
  const homeBatteries = devices.filter(
    (d): d is HomeBatteryDevice =>
      d.type === "HOME_BATTERY" &&
      !!d.serialNumber &&
      !!d.checkCode &&
      !!d.accessKeyUuid,
  );

  // Check if we have any QR codes to display
  const hasAnyQRCodes =
    installation.activeCic ||
    heatBatteries.length > 0 ||
    heatChargers.length > 0 ||
    homeBatteries.length > 0;

  if (!hasAnyQRCodes) {
    return null;
  }

  return (
    <CardContainer title="QR Codes">
      <Accordion type="multiple" className="w-full">
        {/* CIC QR Code */}
        {installation.activeCic && (
          <QRCodeSection
            id="cic"
            title="CIC"
            label="Active CIC"
            value={installation.activeCic}
            qrContent={`https://app.quatt.io/cic/${installation.activeCic}`}
          />
        )}

        {/* Heat Battery QR Codes */}
        {heatBatteries.map((device, index) => {
          if (!device.serialNumber) return null;
          return (
            <QRCodeSection
              key={device.uuid}
              id={`heat-battery-${device.uuid}`}
              title={
                heatBatteries.length > 1
                  ? `Heat Battery ${index + 1}`
                  : "Heat Battery"
              }
              label="Serial Number"
              value={device.serialNumber}
              qrContent={device.serialNumber}
            />
          );
        })}

        {/* Heat Charger QR Codes */}
        {heatChargers.map((device, index) => {
          if (!device.serialNumber) return null;
          return (
            <QRCodeSection
              key={device.uuid}
              id={`heat-charger-${device.uuid}`}
              title={
                heatChargers.length > 1
                  ? `Heat Charger ${index + 1}`
                  : "Heat Charger"
              }
              label="Serial Number"
              value={device.serialNumber}
              qrContent={device.serialNumber}
            />
          );
        })}

        {/* Home Battery QR Codes */}
        {homeBatteries.map((device, index) => (
          <QRCodeSection
            key={device.uuid}
            id={`home-battery-${device.uuid}`}
            title={
              homeBatteries.length > 1
                ? `Home Battery ${index + 1}`
                : "Home Battery"
            }
            label="Serial Number"
            value={device.serialNumber}
            qrContent={`https://app.quatt.io/battery/${device.accessKeyUuid}/${device.serialNumber}/${device.checkCode}/BC-97-40-03-92-84`}
          />
        ))}
      </Accordion>
    </CardContainer>
  );
}
