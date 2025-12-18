import { ThemedJsonView } from "@/components/shared/ThemedJsonView";
import type { components } from "@/openapi-client/types/api/v1";
import {
  CardContainer,
  DataRow,
  HybridAccordion,
  HybridAccordionItem,
} from "@/components/shared/DetailPage";
import { formatDateTime } from "@/utils/formatDate";
import type { ReactNode } from "react";

type AdminCic = components["schemas"]["AdminCic"];
type AdminCicSettingsUpdate = components["schemas"]["AdminCicSettingsUpdate"];

export interface CICSettingsCardProps {
  cicData: AdminCic;
}

/** Formats primitive values for display in DataRow */
function formatValue(value: unknown): ReactNode {
  if (value === null || value === undefined) return null;
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return String(value);
  return value as ReactNode;
}

/**
 * Settings & Configuration card
 * Shows current settings and update history
 */
export function CICSettingsCard({ cicData }: CICSettingsCardProps) {
  return (
    <CardContainer title="Settings & Configuration">
      {/* Current Settings - Always visible */}
      <div className="space-y-1 mb-4">
        <DataRow
          label="Supervisory Control Mode"
          value={cicData.supervisoryControlMode}
        />
        <DataRow label="Flow Rate" value={cicData.flowRate} />
        <DataRow
          label="Temperature Sensor Connected"
          value={formatValue(cicData.isTemperatureSensorConnected)}
        />
        <DataRow
          label="Controller Alive"
          value={formatValue(cicData.isControllerAlive)}
        />
      </div>

      {/* Nested Accordions */}
      <HybridAccordion type="multiple" defaultValue={[]}>
        {/* Settings Update History */}
        {cicData.settingsUpdates && cicData.settingsUpdates.length > 0 && (
          <HybridAccordionItem
            value="history"
            title={`Settings Update History (${cicData.settingsUpdates.length})`}
            level={2}
          >
            <div className="space-y-3">
              {cicData.settingsUpdates.map((setting, index) => (
                <SettingUpdateItem
                  key={setting.createdAt || index}
                  settingsUpdate={setting}
                />
              ))}
            </div>
          </HybridAccordionItem>
        )}
      </HybridAccordion>
    </CardContainer>
  );
}

function SettingUpdateItem({
  settingsUpdate,
}: {
  settingsUpdate: AdminCicSettingsUpdate;
}) {
  const title = settingsUpdate.createdAt
    ? formatDateTime(new Date(settingsUpdate.createdAt))
    : "No date";
  const isConfirmed = !settingsUpdate.isUnconfirmed;

  return (
    <div className="rounded-md border-2 border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-dark-foreground">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {title}
        </span>
        <span
          className={`text-xs font-semibold ${isConfirmed ? "text-green-600" : "text-red-600"}`}
        >
          {isConfirmed ? "✅ Confirmed" : "❌ Unconfirmed"}
        </span>
      </div>
      <div className="mb-2 text-xs text-gray-600 dark:text-gray-400">
        Updated by: {settingsUpdate.updatedBy ?? "Unknown"}
      </div>
      <div className="rounded-md border border-gray-300 bg-white p-3 dark:border-gray-600 dark:bg-gray-900">
        <ThemedJsonView
          value={settingsUpdate}
          collapsed={2}
          displayDataTypes={false}
          displayObjectSize={false}
          enableClipboard={true}
          style={{
            fontSize: "12px",
            lineHeight: "1.4",
            fontFamily: "monospace",
          }}
        />
      </div>
    </div>
  );
}
