import { AdminInstallationDetail, ChillDevice } from "../api-client/models";
import {
  FormField,
  FormFieldTitle,
  FormFieldValue,
  FormSection,
} from "../ui-components/form/Form";
import classes from "./InstallationDetail.module.css";
import {
  DetailSectionHeader,
  DetailSubSectionHeader,
} from "../cic-detail/CICDetailSectionHeader";
import { useChillDevices } from "./hooks/useChillDevices";
import {
  formatRunningMode,
  formatFourWayValveReversed,
  formatTemperature,
  formatRPM,
  formatPercentage,
  formatBooleanStatus,
  formatWaterFlowStatus,
  formatDeviceStatus,
  formatOnOffStatus,
  formatSystemFailures,
  formatSystemProtections,
  formatSystemFailuresList,
  formatSystemProtectionsList,
} from "./utils/chillDeviceFormatters";

interface ChillDeviceCardProps {
  device: ChillDevice;
  index: number;
}

function ChillDeviceCard({ device, index }: ChillDeviceCardProps) {
  const { metrics } = device;
  const deviceName = device.name || device.serialNumber;
  const title = `🌡️ Chill Device ${index > 0 ? `#${index + 1}` : ""} - ${deviceName}`;

  return (
    <div className={classes["detail-section"]}>
      <DetailSectionHeader title={title} />
      <FormSection>
        {/* Device Information */}
        <DetailSubSectionHeader title="Device Information" />

        <FormField>
          <FormFieldTitle>Serial Number</FormFieldTitle>
          <FormFieldValue value={device.serialNumber} />
        </FormField>

        <FormField>
          <FormFieldTitle>EUI-64 (Thread Network ID)</FormFieldTitle>
          <FormFieldValue value={device.eui64} />
        </FormField>

        <FormField>
          <FormFieldTitle>PCB Hardware Version</FormFieldTitle>
          <FormFieldValue value={device.pcbHwVersion} />
        </FormField>

        <FormField>
          <FormFieldTitle>Device Status</FormFieldTitle>
          <FormFieldValue value={formatDeviceStatus(device.status)} />
        </FormField>

        {/* Metrics Data Section */}
        {metrics ? (
          <>
            {/* System State */}
            <DetailSubSectionHeader title="System State" />

            <FormField>
              <FormFieldTitle>Running Mode</FormFieldTitle>
              <FormFieldValue value={formatRunningMode(metrics.runningMode)} />
            </FormField>

            <FormField>
              <FormFieldTitle>Compressor Status</FormFieldTitle>
              <FormFieldValue
                value={formatOnOffStatus(metrics.compressorEnabled)}
              />
            </FormField>

            <FormField>
              <FormFieldTitle>Operating Mode (4-Way Valve)</FormFieldTitle>
              <FormFieldValue
                value={formatFourWayValveReversed(metrics.fourWayValveReversed)}
              />
            </FormField>

            <FormField>
              <FormFieldTitle>Solenoid Valve Status</FormFieldTitle>
              <FormFieldValue
                value={formatOnOffStatus(metrics.solenoidValveEnabled)}
              />
            </FormField>

            {/* Temperature Readings */}
            <DetailSubSectionHeader title="Temperature & Environmental" />

            <FormField>
              <FormFieldTitle>Inlet Water Temperature</FormFieldTitle>
              <FormFieldValue
                value={formatTemperature(metrics.inletChTemperature)}
              />
            </FormField>

            <FormField>
              <FormFieldTitle>Outlet Water Temperature</FormFieldTitle>
              <FormFieldValue
                value={formatTemperature(metrics.outletChTemperature)}
              />
            </FormField>

            <FormField>
              <FormFieldTitle>Ambient Air Temperature</FormFieldTitle>
              <FormFieldValue
                value={formatTemperature(metrics.ambientTemperature)}
              />
            </FormField>

            <FormField>
              <FormFieldTitle>Humidity</FormFieldTitle>
              <FormFieldValue
                value={formatPercentage(metrics.humidityPercentage)}
              />
            </FormField>

            {/* Fan & Pump Control */}
            <DetailSubSectionHeader title="Fan & Pump Control" />

            <FormField>
              <FormFieldTitle>Fan Speed</FormFieldTitle>
              <FormFieldValue value={formatRPM(metrics.fanActualSpeedRPM)} />
            </FormField>

            <FormField>
              <FormFieldTitle>Pump Speed</FormFieldTitle>
              <FormFieldValue value={formatRPM(metrics.pumpFeedbackSpeedRPM)} />
            </FormField>

            {/* System Status */}
            <DetailSubSectionHeader title="System Status" />

            <FormField>
              <FormFieldTitle>Water Flow Status</FormFieldTitle>
              <FormFieldValue
                value={formatWaterFlowStatus(metrics.waterFlowSwitchClosed)}
              />
            </FormField>

            <FormField>
              <FormFieldTitle>Condensation Tank</FormFieldTitle>
              <FormFieldValue
                value={formatBooleanStatus(metrics.condensationTankPresent, {
                  trueLabel: "Present",
                  falseLabel: "Not Present",
                })}
              />
            </FormField>

            <FormField>
              <FormFieldTitle>System Failures</FormFieldTitle>
              <FormFieldValue
                value={formatSystemFailures(metrics.systemFailures)}
              />
            </FormField>

            {metrics.systemFailures && metrics.systemFailures.length > 0 && (
              <FormField>
                <pre
                  style={{
                    margin: 0,
                    fontFamily: "inherit",
                    whiteSpace: "pre-wrap",
                    paddingLeft: "20px",
                  }}
                >
                  {formatSystemFailuresList(metrics.systemFailures)}
                </pre>
              </FormField>
            )}

            <FormField>
              <FormFieldTitle>System Protections</FormFieldTitle>
              <FormFieldValue
                value={formatSystemProtections(metrics.systemProtections)}
              />
            </FormField>

            {metrics.systemProtections &&
              metrics.systemProtections.length > 0 && (
                <FormField>
                  <pre
                    style={{
                      margin: 0,
                      fontFamily: "inherit",
                      whiteSpace: "pre-wrap",
                      paddingLeft: "20px",
                    }}
                  >
                    {formatSystemProtectionsList(metrics.systemProtections)}
                  </pre>
                </FormField>
              )}
          </>
        ) : (
          <FormField>
            <FormFieldValue value="Metrics data not available for this device." />
          </FormField>
        )}
      </FormSection>
    </div>
  );
}

export function InstallationDetailChillDevices({
  installation,
}: {
  installation: AdminInstallationDetail;
}) {
  const { chillDevices } = useChillDevices(installation);

  if (!chillDevices || chillDevices.length === 0) {
    return null;
  }

  return (
    <>
      {chillDevices.map((device, index) => (
        <ChillDeviceCard key={device.uuid} device={device} index={index} />
      ))}
    </>
  );
}
