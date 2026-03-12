import QRCode from "react-qr-code";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import type { components } from "@/openapi-client/types/api/v1";

type DeviceType = components["schemas"]["DeviceType"];

/**
 * Returns the QR code content for a device, matching mobile app parsing expectations.
 *
 * - CHILL/DONGLE: `https://app.quatt.io/{TYPE}/{serialNumber}`
 * - HEAT_BATTERY/HEAT_CHARGER: plain `{serialNumber}`
 * - HOME_BATTERY: requires accessKeyUuid + checkCode (not available on device list)
 */
function getDeviceQrContent(
  type: DeviceType,
  serialNumber: string | null | undefined,
): string | null {
  if (!serialNumber) return null;

  switch (type) {
    case "CHILL":
    case "DONGLE":
      return `https://app.quatt.io/${type}/${serialNumber}`;
    case "HEAT_BATTERY":
    case "HEAT_CHARGER":
      return serialNumber;
    default:
      return null;
  }
}

export interface DeviceQRCodeProps {
  type: DeviceType;
  serialNumber: string | null | undefined;
}

/**
 * Inline QR code (48px) that opens a popover with a larger scannable QR (150px) on click.
 */
export function DeviceQRCode({ type, serialNumber }: DeviceQRCodeProps) {
  const content = getDeviceQrContent(type, serialNumber);
  if (!content) return <span className="text-sm text-gray-400">—</span>;

  return <QRCodeCell value={content} />;
}

/**
 * Reusable QR code cell: inline 48px QR that opens a popover with 150px scannable QR + value text.
 */
export function QRCodeCell({ value }: { value: string }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="cursor-pointer rounded border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-dark-foreground"
          aria-label="Show QR code"
        >
          <QRCode
            size={48}
            value={value}
            viewBox="0 0 256 256"
            className="h-12 w-12"
          />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto bg-white dark:bg-dark-foreground">
        <div className="flex flex-col items-center gap-2">
          <div className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-dark-foreground">
            <QRCode
              size={150}
              value={value}
              viewBox="0 0 256 256"
              className="h-auto w-full max-w-[150px]"
            />
          </div>
          <span className="max-w-[200px] break-all text-center font-mono text-xs text-muted-foreground">
            {value}
          </span>
        </div>
      </PopoverContent>
    </Popover>
  );
}
