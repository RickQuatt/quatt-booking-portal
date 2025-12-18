import { useState } from "react";
import { ThemedJsonView } from "@/components/shared/ThemedJsonView";
import type { components } from "@/openapi-client/types/api/v1";
import { $api } from "@/openapi-client/context";
import { formatDateTime } from "@/utils/formatDate";
import { ErrorText } from "@/components/shared/ErrorText";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";

type AdminInstallationDetail = components["schemas"]["AdminInstallationDetail"];
type SettingsHeader = components["schemas"]["SettingsHeader"];

export interface InstallationSettingsHistoryProps {
  installation: AdminInstallationDetail;
}

/**
 * Installation Settings History Component
 * Displays historical settings updates with JSON viewer
 */
export function InstallationSettingsHistory({
  installation,
}: InstallationSettingsHistoryProps) {
  const { settingsUpdates } = installation;

  return (
    <div className="space-y-4">
      {settingsUpdates.length > 0 ? (
        <Accordion type="single" collapsible className="space-y-2">
          {settingsUpdates.map((setting, index) => (
            <SettingsHistoryItem
              key={setting.settingsId || index}
              installationId={installation.externalId}
              settingHeader={setting}
            />
          ))}
        </Accordion>
      ) : (
        <div className="py-8 text-center text-gray-500 dark:text-gray-400">
          No settings updates 👍
        </div>
      )}
    </div>
  );
}

interface SettingsHistoryItemProps {
  installationId: string | null;
  settingHeader: SettingsHeader;
}

function SettingsHistoryItem({
  installationId,
  settingHeader,
}: SettingsHistoryItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  const {
    data,
    isPending,
    error: isError,
    refetch,
  } = $api.useQuery(
    "get",
    "/admin/installation/{installationId}/settingsUpdate/{settingsId}",
    {
      params: {
        path: {
          installationId: installationId || "",
          settingsId: settingHeader.settingsId || "",
        },
      },
    },
    {
      enabled: isOpen && !!installationId && !!settingHeader.settingsId,
    },
  );

  const settingsData = data?.result;

  if (isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
        <ErrorText
          text={`Failed to fetch settings update with ID ${settingHeader.settingsId}.`}
          retry={() => refetch()}
        />
      </div>
    );
  }
  if (settingsData?.settings && typeof settingsData?.settings === "string") {
    try {
      settingsData.settings = JSON.parse(settingsData.settings as string);
    } catch (e) {
      console.log("Failed to parse settings JSON", e);
    }
  }

  return (
    <AccordionItem
      value={settingHeader.settingsId}
      className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-dark-foreground"
    >
      <AccordionTrigger
        className="px-4 hover:no-underline"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex w-full items-start justify-between pr-4 text-left">
          <div className="flex-1">
            <div className="font-semibold text-gray-900 dark:text-gray-100">
              {formatDateTime(new Date(settingHeader.createdAt))}
            </div>
            <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Updated by: {settingHeader.updatedBy ?? "System"}
            </div>
          </div>
          <div className="text-sm">
            {settingHeader.isUnconfirmed ? "❌ Unconfirmed" : "✅ Confirmed"}
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        {isPending ? (
          <div className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
            Loading settings details...
          </div>
        ) : (
          <div className="rounded-md border border-gray-300 bg-white p-3 dark:border-gray-600 dark:bg-dark-foreground overflow-x-auto">
            <ThemedJsonView
              value={settingsData}
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
        )}
      </AccordionContent>
    </AccordionItem>
  );
}
