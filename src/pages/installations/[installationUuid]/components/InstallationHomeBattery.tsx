import type { components } from "@/openapi-client/types/api/v1";
import { CardContainer, DataRow } from "@/components/shared/DetailPage";
import { useHomeBatteryDevice } from "../hooks/useHomeBatteryDevice";

type AdminInstallationDetail = components["schemas"]["AdminInstallationDetail"];

export interface InstallationHomeBatteryProps {
  installation: AdminInstallationDetail;
}

const formatConnectivityStatus = (status: string) => {
  return status === "connected" ? "🟢 Connected" : "🔴 Disconnected";
};

const formatPowerInKW = (power: number | null | undefined) => {
  if (power === null || power === undefined) return "N/A";
  const direction = power >= 0 ? "Charging" : "Discharging";
  return `${power > 0 ? "+" : ""}${power.toFixed(2)} kW (${direction})`;
};

const formatControlAction = (action: string | null | undefined) => {
  if (!action) return "N/A";
  const actionMap: Record<string, string> = {
    balancingTheGrid: "Grid Balancing",
    chargingCheapEnergy: "Charging Cheap Energy",
    storingSolarEnergy: "Storing Solar Energy",
    sellingHighPrices: "Selling at High Prices",
    usingBatteryEnergy: "Using Battery Energy",
    waitingToCharge: "Waiting to Charge",
    waitingToDischarge: "Waiting to Discharge",
    reducingPowerPeaks: "Reducing Power Peaks",
    undeterminedAction: "Undetermined",
  };
  return actionMap[action] || action;
};

const formatCurrency = (amount: number | null | undefined) => {
  if (amount === null || amount === undefined) return "N/A";
  return `€${amount.toFixed(2)}`;
};

/**
 * Installation Home Battery Component
 * Displays comprehensive home battery information with accordion sections
 */
export function InstallationHomeBattery({
  installation,
}: InstallationHomeBatteryProps) {
  const { homeBatteryDevice, batterySn } = useHomeBatteryDevice(installation);

  // Don't render if no home battery device
  if (!homeBatteryDevice || !batterySn) {
    return null;
  }

  const {
    currentBatteryInsights,
    currentBuildingInsights,
    batterySpecifications,
  } = homeBatteryDevice;

  return (
    <CardContainer title="🔋 Home Battery Information">
      <div className="space-y-4">
        {/* Current Status Section */}
        <div>
          <h4 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            Current Status
          </h4>
          <div className="space-y-1">
            <DataRow
              label="Connectivity Status"
              value={formatConnectivityStatus(
                homeBatteryDevice.connectivityStatus,
              )}
            />
            {currentBatteryInsights && (
              <>
                <DataRow
                  label="Battery Charge"
                  value={
                    currentBatteryInsights.chargeState !== null &&
                    currentBatteryInsights.chargeState !== undefined
                      ? `${currentBatteryInsights.chargeState}%`
                      : "N/A"
                  }
                />
                <DataRow
                  label="Current Power"
                  value={formatPowerInKW(currentBatteryInsights.powerInKW)}
                />
                <DataRow
                  label="Current Action"
                  value={formatControlAction(
                    currentBatteryInsights.controlAction,
                  )}
                />
              </>
            )}
          </div>
        </div>

        {/* Financial Overview Section */}
        {currentBuildingInsights && (
          <div>
            <h4 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              Financial Overview
            </h4>
            <div className="space-y-1">
              <DataRow
                label="Total Savings (Cumulative)"
                value={formatCurrency(
                  currentBuildingInsights.totalSavingsCumulative,
                )}
              />
              <DataRow
                label="Yesterday's Savings"
                value={formatCurrency(
                  currentBuildingInsights.totalSavingsYesterday,
                )}
              />
              <DataRow
                label="Smart Energy Savings"
                value={`${formatCurrency(currentBuildingInsights.savingsSmartEnergyCumulative)} (yesterday: ${formatCurrency(currentBuildingInsights.savingsSmartEnergyYesterday)})`}
              />
              <DataRow
                label="Grid Balancing Income"
                value={`${formatCurrency(currentBuildingInsights.savingsGridBalancingCumulative)} (yesterday: ${formatCurrency(currentBuildingInsights.savingsGridBalancingYesterday)})`}
              />
            </div>
          </div>
        )}

        {/* Technical Specifications Section */}
        <div>
          <h4 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
            Technical Specifications
          </h4>
          <div className="space-y-1">
            <DataRow label="Battery Serial Number" value={batterySn} />
            {batterySpecifications?.powerInKwRange && (
              <DataRow
                label="Power Capacity Range"
                value={`${batterySpecifications.powerInKwRange.minKW} kW - ${batterySpecifications.powerInKwRange.maxKW} kW`}
              />
            )}
          </div>
        </div>
      </div>
    </CardContainer>
  );
}
