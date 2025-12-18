import { ThemedJsonView } from "@/components/shared/ThemedJsonView";
import type { components } from "@/openapi-client/types/api/v1";
import { CardContainer } from "@/components/shared/DetailPage";
import { formatDateTime } from "@/utils/formatDate";

type AdminCic = components["schemas"]["AdminCic"];
type HybridCommissioning = components["schemas"]["HybridCommissioning"];

export interface CICCommissioningCardProps {
  cicData: AdminCic;
}

/**
 * Commissioning card - displays all commissioning history expanded by default
 */
export function CICCommissioningCard({ cicData }: CICCommissioningCardProps) {
  const sortedCommissionings = [...cicData.commissioningHistory].sort(
    (a, b) => {
      const aDate = a.createdAt || "";
      const bDate = b.createdAt || "";
      if (aDate > bDate) return -1;
      if (aDate < bDate) return 1;
      return 0;
    },
  );

  return (
    <CardContainer
      title={`Commissioning History (${sortedCommissionings.length})`}
    >
      <div className="space-y-4">
        {sortedCommissionings.length > 0 ? (
          sortedCommissionings.map((commissioning, index) => (
            <CommissioningItem key={index} commissioning={commissioning} />
          ))
        ) : (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            No commissioning history
          </div>
        )}
      </div>
    </CardContainer>
  );
}

function CommissioningItem({
  commissioning,
}: {
  commissioning: HybridCommissioning;
}) {
  const title = `${commissioning.createdAt ? formatDateTime(new Date(commissioning.createdAt)) : "Unknown"}${commissioning.isForced ? " ⛔️ (Forced)" : ""}`;

  return (
    <div className="rounded-md border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-dark-foreground">
      <div className="mb-2 font-medium text-gray-900 dark:text-gray-100">
        {title}
      </div>
      <div className="rounded-md border border-gray-300 bg-white p-3 dark:border-gray-600 dark:bg-dark-foreground overflow-x-auto max-w-full">
        <ThemedJsonView
          value={commissioning}
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
