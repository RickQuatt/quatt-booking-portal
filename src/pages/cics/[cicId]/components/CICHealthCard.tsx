import { useMemo } from "react";
import { groupBy } from "lodash-es";
import type { components } from "@/openapi-client/types/api/v1";
import { CardContainer } from "@/components/shared/DetailPage";
import { HealthCheckCircle } from "@/components/shared/HealthCheckCircle";
import { categoryToLabel, kpiToLabel } from "@/constants";
import { getEntries } from "@/utils/object";

type AdminCic = components["schemas"]["AdminCic"];
type CicHealthCheckCategory = components["schemas"]["CicHealthCheckCategory"];

export interface CICHealthCardProps {
  cicData: AdminCic;
}

/**
 * Health overview card - always expanded
 * Shows health check status grouped by category
 */
export function CICHealthCard({ cicData }: CICHealthCardProps) {
  const entriesByCategory = useMemo(() => {
    return groupBy(
      getEntries(cicData.healthChecksByKpi),
      ([kpi, value]) => value.category,
    );
  }, [cicData.healthChecksByKpi]);

  const categories = useMemo(() => {
    return getEntries(entriesByCategory).map(([category, entries]) => ({
      category,
      label: categoryToLabel[category as CicHealthCheckCategory],
      checks: entries.map(([kpi, value]) => ({
        kpi,
        label: kpiToLabel[kpi],
        status: value.status,
      })),
    }));
  }, [entriesByCategory]);

  return (
    <CardContainer title="Health Overview">
      <div className="space-y-6">
        {categories.map(({ category, label, checks }) => (
          <div key={category}>
            <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
              {label}
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {checks.map(({ kpi, label, status }) => (
                <div
                  key={kpi}
                  className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-dark-foreground"
                >
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {label}
                  </span>
                  <HealthCheckCircle status={status} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </CardContainer>
  );
}
