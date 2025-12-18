import { $api } from "@/openapi-client/context";

/**
 * Hook to fetch CIC dashboard data
 * Returns aggregated health metrics, versions, and KPI breakdowns
 */
export function useDashboardData() {
  return $api.useQuery("get", "/admin/cic/dashboard", {
    refetchOnWindowFocus: false,
  });
}
