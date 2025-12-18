import type { components } from "@/openapi-client/types/api/v1";
import {
  CardContainer,
  DataRow,
  HybridAccordion,
  HybridAccordionItem,
} from "@/components/shared/DetailPage";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/utils/formatDate";
import type { ReactNode } from "react";

type AdminCic = components["schemas"]["AdminCic"];
type AllEStatus = NonNullable<AdminCic["allEStatus"]>;
type AllEStatusHeatBatteryStatus = AllEStatus["heatBatteryStatus"];
type AllEStatusHeatBatterySize = AllEStatus["heatBatterySize"];

export interface CICDeviceInfoCardProps {
  cicData: AdminCic;
}

/** Formats primitive values for display in DataRow */
function formatValue(value: unknown): ReactNode {
  if (value === null || value === undefined) return null;
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return String(value);
  return value as ReactNode;
}

const statusMap: Record<NonNullable<AllEStatusHeatBatteryStatus>, string> = {
  charging: "Charging",
  discharging: "Discharging",
  off: "Off",
};

const batterySizeMap: Record<NonNullable<AllEStatusHeatBatterySize>, string> = {
  extra_large: "Extra Large",
  large: "Large",
  medium: "Medium",
};

/**
 * Renders flag arrays as Badge chips
 * - Empty/null arrays show green "None" badge
 * - Populated arrays show individual red badges for each flag
 */
function renderFlagBadges(
  flags: string | string[] | null | undefined,
): ReactNode {
  // Handle null/undefined
  if (flags === null || flags === undefined) {
    return <Badge variant="success">None</Badge>;
  }

  // Handle empty string
  if (typeof flags === "string" && flags.trim() === "") {
    return <Badge variant="success">None</Badge>;
  }

  // Handle string (comma-separated or single value)
  if (typeof flags === "string") {
    const flagArray = flags
      .split(",")
      .map((f) => f.trim())
      .filter((f) => f);
    if (flagArray.length === 0) {
      return <Badge variant="success">None</Badge>;
    }
    return (
      <div className="flex flex-wrap gap-1">
        {flagArray.map((flag, idx) => (
          <Badge key={idx} variant="destructive">
            {flag}
          </Badge>
        ))}
      </div>
    );
  }

  // Handle array
  if (Array.isArray(flags)) {
    if (flags.length === 0) {
      return <Badge variant="success">None</Badge>;
    }
    return (
      <div className="flex flex-wrap gap-1">
        {flags.map((flag, idx) => (
          <Badge key={idx} variant="destructive">
            {flag}
          </Badge>
        ))}
      </div>
    );
  }

  return <Badge variant="success">None</Badge>;
}

/**
 * Device information card with hybrid accordion structure
 * Contains: Basic details, Update info, Heat pumps, Boiler, Thermostat, All-E devices
 */
export function CICDeviceInfoCard({ cicData }: CICDeviceInfoCardProps) {
  const isAllE = cicData.allEStatus !== null;
  const hp1 = cicData.heatPumps.find((e) => e.modbusSlaveId === 1);
  const hp2 = cicData.heatPumps.find((e) => e.modbusSlaveId === 2);

  return (
    <CardContainer title="Device Information">
      {/* Basic Details - Always visible when parent open */}
      <div className="space-y-1 mb-4">
        <DataRow label="CIC ID" value={cicData.id} />
        <DataRow label="HWID" value={cicData.hwid} />
        <DataRow label="Mender ID" value={cicData.menderId} />
        <DataRow label="Quatt Build" value={cicData.quattBuild} />
        <DataRow label="Order Number" value={cicData.orderNumber} />
        <DataRow
          label="Number of Heat Pumps"
          value={formatValue(cicData.numberOfHeatPumps)}
        />
        <DataRow
          label="Created At"
          value={
            cicData.createdAt ? formatDate(new Date(cicData.createdAt)) : null
          }
        />
        {cicData.hasSoundSlider ? (
          <>
            <DataRow
              label="Day Max Sound Level"
              value={formatValue(cicData.dayMaxSoundLevel)}
            />
            <DataRow
              label="Night Max Sound Level"
              value={formatValue(cicData.nightMaxSoundLevel)}
            />
          </>
        ) : (
          <DataRow
            label="Silent Mode"
            value={formatValue(cicData.silentMode)}
          />
        )}
      </div>

      {/* Nested Accordions */}
      <HybridAccordion type="multiple" defaultValue={[]}>
        {/* Update Information */}
        <HybridAccordionItem
          value="update-info"
          title="Update Information"
          level={2}
        >
          <div className="space-y-1">
            <DataRow
              label="Quatt Build Required"
              value={cicData.quattBuildRequired}
            />
            <DataRow
              label="Needs Update"
              value={formatValue(cicData.needsUpdate)}
            />
            <DataRow
              label="Mender Update State"
              value={cicData.menderUpdateState}
            />
          </div>
        </HybridAccordionItem>

        {/* Heat Pumps */}
        <HybridAccordionItem value="heat-pumps" title="Heat Pumps" level={2}>
          <div className="space-y-1 mb-4">
            <DataRow
              label="HP1 Connected"
              value={formatValue(cicData.isHp1Connected)}
            />
            <DataRow label="HP1 ODU Type" value={hp1?.oduType} />
            <DataRow
              label="HP1 Firmware Version"
              value={hp1?.pcbFirmwareVersion}
            />
            <DataRow
              label="HP2 Connected"
              value={formatValue(cicData.isHp2Connected)}
            />
            <DataRow label="HP2 ODU Type" value={hp2?.oduType} />
            <DataRow
              label="HP2 Firmware Version"
              value={hp2?.pcbFirmwareVersion}
            />
            <DataRow
              label="Use Pricing to Limit HP"
              value={formatValue(cicData.usePricingToLimitHeatPump)}
            />
          </div>

          {/* Heat Pump Telemetry */}
          {cicData.heatPumps.length > 0 && (
            <HybridAccordion type="multiple" defaultValue={[]}>
              {cicData.heatPumps.map((hp, index) => (
                <HybridAccordionItem
                  key={hp.modbusSlaveId}
                  value={`hp-${hp.modbusSlaveId}`}
                  title={`Heat Pump ${index + 1} Telemetry`}
                  level={3}
                >
                  <div className="space-y-1">
                    <DataRow
                      label="Modbus Slave ID"
                      value={formatValue(hp.modbusSlaveId)}
                    />
                    <DataRow label="Power" value={formatValue(hp.power)} />
                    <DataRow label="ODU Type" value={hp.oduType} />
                    <DataRow
                      label="PCB Firmware Version"
                      value={hp.pcbFirmwareVersion}
                    />
                    <DataRow
                      label="Water Out Temperature"
                      value={formatValue(hp.temperatureWaterOut)}
                    />
                    <DataRow
                      label="Outside Temperature"
                      value={formatValue(hp.temperatureOutside)}
                    />
                    <DataRow
                      label="Compressor Frequency"
                      value={formatValue(hp.compressorFrequency)}
                    />
                    <DataRow
                      label="Water Pump Level"
                      value={formatValue(hp.waterPumpLevel)}
                    />
                  </div>
                </HybridAccordionItem>
              ))}
            </HybridAccordion>
          )}
        </HybridAccordionItem>

        {/* Boiler */}
        <HybridAccordionItem value="boiler" title="Boiler" level={2}>
          <div className="space-y-1">
            <DataRow
              label="Connected"
              value={formatValue(cicData.isBoilerConnected)}
            />
            <DataRow label="Boiler On" value={formatValue(cicData.boilerOn)} />
            <DataRow label="Type" value={cicData.boilerType} />
            <DataRow label="Power" value={formatValue(cicData.boilerPower)} />
            <DataRow
              label="Pressure"
              value={formatValue(cicData.boilerPressure)}
            />
            <DataRow
              label="Water Temperature In"
              value={formatValue(cicData.boilerWaterTemperatureIn)}
            />
            <DataRow
              label="Water Temperature Out"
              value={formatValue(cicData.boilerWaterTemperatureOut)}
            />
          </div>
        </HybridAccordionItem>

        {/* Thermostat */}
        <HybridAccordionItem value="thermostat" title="Thermostat" level={2}>
          <div className="space-y-1">
            <DataRow
              label="Connected"
              value={formatValue(cicData.isThermostatConnected)}
            />
            <DataRow label="Type" value={cicData.thermostatType} />
            <DataRow
              label="Flame On"
              value={formatValue(cicData.thermostatFlameOn)}
            />
            <DataRow
              label="Show Temperatures"
              value={formatValue(cicData.showThermostatTemperatures)}
            />
            <DataRow
              label="Room Temperature"
              value={formatValue(cicData.thermostatRoomTemperature)}
            />
            <DataRow
              label="Room Temp Set Point"
              value={formatValue(cicData.thermostatRoomTemperatureSetPoint)}
            />
            <DataRow
              label="Control Temp Set Point"
              value={formatValue(cicData.thermostatControlTemperatureSetPoint)}
            />
          </div>
        </HybridAccordionItem>

        {/* All-Electric Devices */}
        {isAllE && cicData.allEStatus && (
          <HybridAccordionItem
            value="all-e"
            title="All-Electric Devices"
            level={2}
          >
            <div className="space-y-1">
              <div className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Heat Battery
              </div>
              <DataRow
                label="Serial Number"
                value={cicData.allEStatus.heatBatterySerialNumber}
              />
              <DataRow
                label="Status"
                value={
                  cicData.allEStatus.heatBatteryStatus
                    ? statusMap[cicData.allEStatus.heatBatteryStatus]
                    : "N/A"
                }
              />
              <DataRow
                label="Charge Percentage"
                value={
                  cicData.allEStatus.heatBatteryPercentage !== null &&
                  cicData.allEStatus.heatBatteryPercentage !== undefined
                    ? `${cicData.allEStatus.heatBatteryPercentage}%`
                    : "N/A"
                }
              />
              <DataRow
                label="Size"
                value={
                  cicData.allEStatus.heatBatterySize
                    ? batterySizeMap[cicData.allEStatus.heatBatterySize]
                    : "N/A"
                }
              />
              <DataRow
                label="Sensor Failure Flags"
                value={renderFlagBadges(
                  cicData.allEStatus.heatBatterySensorFailureFlags,
                )}
              />

              <div className="mb-3 mt-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Heat Charger
              </div>
              <DataRow
                label="Serial Number"
                value={cicData.allEStatus.heatChargerSerialNumber}
              />
              <DataRow
                label="Compressor Enabled"
                value={formatValue(
                  cicData.allEStatus.heatChargerCompressorEnabled,
                )}
              />
              <DataRow
                label="Degradation Reason Flags"
                value={renderFlagBadges(
                  cicData.allEStatus.heatChargerDegradationReasonFlags,
                )}
              />

              <div className="mb-3 mt-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                System Info
              </div>
              <DataRow
                label="Emergency Backup Heater"
                value={formatValue(
                  cicData.allEStatus.emergencyBackupHeaterEnabled,
                )}
              />
              <DataRow
                label="Domestic Hot Water On"
                value={formatValue(cicData.allEStatus.isDomesticHotWaterOn)}
              />
              <DataRow
                label="Shower Minutes"
                value={formatValue(cicData.allEStatus.showerMinutes)}
              />
              <DataRow
                label="Shower Minutes Degraded"
                value={formatValue(cicData.allEStatus.showerMinutesDegraded)}
              />
              <DataRow
                label="Blocked Control Actions"
                value={renderFlagBadges(
                  cicData.allEStatus.blockedControlActions,
                )}
              />
              <DataRow
                label="Control Degradation Reasons"
                value={renderFlagBadges(
                  cicData.allEStatus.controlDegradationReasons,
                )}
              />
              <DataRow
                label="Degraded All-E Counters"
                value={renderFlagBadges(
                  cicData.allEStatus.degradedAllECounters,
                )}
              />
            </div>
          </HybridAccordionItem>
        )}
      </HybridAccordion>
    </CardContainer>
  );
}
