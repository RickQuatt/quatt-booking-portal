import { useState } from "react";
import { ThemedJsonView } from "@/components/shared/ThemedJsonView";
import type { components } from "@/openapi-client/types/api/v1";
import { $api } from "@/openapi-client/context";

type AdminInstallationDetail = components["schemas"]["AdminInstallationDetail"];
import { formatDateTime } from "@/utils/formatDate";
import { ErrorText } from "@/components/shared/ErrorText";
import { ChevronDown, ChevronRight } from "lucide-react";

export interface InstallationSidebarCommissioningProps {
  installation: AdminInstallationDetail;
}

/**
 * Commissioning sidebar - displays all commissioning history with expandable JSON
 * No modal or accordion, just clean expandable cards
 */
export function InstallationSidebarCommissioning({
  installation,
}: InstallationSidebarCommissioningProps) {
  const sortedCommissionings = [...installation.cicCommissioning].sort(
    (a, b) => {
      const aDate = a.createdAt || "";
      const bDate = b.createdAt || "";
      if (aDate > bDate) return -1;
      if (aDate < bDate) return 1;
      return 0;
    },
  );

  return (
    <div className="space-y-4">
      {sortedCommissionings.length > 0 ? (
        sortedCommissionings.map((commissioning) => (
          <CommissioningItem
            key={commissioning.id}
            externalId={installation.externalId}
            commissioningId={commissioning.id}
            createdAt={commissioning.createdAt}
            isForced={commissioning.isForced}
          />
        ))
      ) : (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          No commissioning history
        </div>
      )}
    </div>
  );
}

interface CommissioningItemProps {
  createdAt: string;
  isForced: boolean;
  externalId: string | null;
  commissioningId: number;
}

function CommissioningItem({
  isForced,
  createdAt,
  externalId,
  commissioningId,
}: CommissioningItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const installationId = externalId || "";

  const {
    data,
    isLoading,
    error: isError,
    refetch,
  } = $api.useQuery(
    "get",
    "/admin/installation/{installationId}/commissioning/{commissioningId}",
    {
      params: {
        path: { installationId, commissioningId },
      },
    },
    {
      enabled: isOpen && !!installationId && !!commissioningId,
    },
  );

  const title = `${formatDateTime(new Date(createdAt))}${isForced ? " ⛔️ (Forced)" : ""}`;

  return (
    <div className="rounded-md border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-dark-foreground">
      <div
        className="flex items-center justify-between cursor-pointer hover:opacity-80"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {title}
        </span>
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-500" />
        )}
      </div>

      {isOpen && (
        <div className="mt-3">
          {isLoading ? (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Loading commissioning data...
            </div>
          ) : isError ? (
            <ErrorText
              text={`Failed to fetch commissioning ${commissioningId}`}
              retry={() => refetch() as any}
            />
          ) : (
            <div className="rounded-md border border-gray-300 bg-white p-3 dark:border-gray-600 dark:bg-dark-foreground overflow-x-auto max-w-full">
              <ThemedJsonView
                value={data?.result}
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
        </div>
      )}
    </div>
  );
}
