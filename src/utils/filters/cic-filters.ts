import qs from "qs";
import type { components } from "@/openapi-client/types/api/v1";
import { getEntries } from "@/utils/object";

// Types from OpenAPI schema
type AdminCic = components["schemas"]["AdminCic"];
type CicHealthCheckCategory = components["schemas"]["CicHealthCheckCategory"];
type CicHealthCheckStatus = components["schemas"]["CicHealthCheckStatus"];
type CicHealthChecksByKpi = components["schemas"]["CicHealthChecksByKpi"];

// Filter type definitions
type CICCategoryFilters = Partial<{
  [K in CicHealthCheckCategory]: CicHealthCheckStatus;
}>;

type CICKPIFilters = Partial<{
  [K in keyof CicHealthChecksByKpi]: CicHealthCheckStatus;
}>;

export type CICFilters = Partial<Omit<AdminCic, "createdAt">> & {
  minCreatedAt?: AdminCic["createdAt"];
  maxCreatedAt?: AdminCic["createdAt"];
  minLastConnectionStatusUpdatedAt?: AdminCic["lastConnectionStatusUpdatedAt"];
  maxLastConnectionStatusUpdatedAt?: AdminCic["lastConnectionStatusUpdatedAt"];
  categoryFilters?: CICCategoryFilters;
  kpiFilters?: CICKPIFilters;
};

// URL serialization utilities
export const stringifyCICFilters = (filters: CICFilters) => {
  return qs.stringify(filters);
};

export const parseCICFiltersString = (filterString: string): CICFilters => {
  return qs.parse(filterString) as unknown as CICFilters;
};

// Field matching utility (supports exact match with quotes or fuzzy match)
const matchField = (field: string | null, search: string) => {
  if (field === null) return false;

  const exactMatchRegex = /^"(.*)"$/;
  const exactMatch = search.match(exactMatchRegex);

  if (exactMatch) {
    const exactSearch = exactMatch[1];
    return field.toLowerCase() === exactSearch.toLowerCase();
  } else {
    return field.toLowerCase().includes(search.toLowerCase());
  }
};

// Client-side filter function
// Uses generic type to support both legacy api-client and modern openapi-client AdminCic types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function filterCICList<T extends Record<string, any>>(
  list: T[],
  filters: CICFilters,
): T[] {
  return list.filter((cicEntry) => {
    return getEntries(filters).every(([filterKey, filterValue]) => {
      if (filters.minCreatedAt && filterKey === "minCreatedAt") {
        const createdDate = cicEntry.createdAt;
        return filters.minCreatedAt < createdDate;
      }
      if (filters.maxCreatedAt && filterKey === "maxCreatedAt") {
        const createdDate = cicEntry.createdAt;
        return filters.maxCreatedAt > createdDate;
      }

      if (
        filters.minLastConnectionStatusUpdatedAt &&
        filterKey === "minLastConnectionStatusUpdatedAt"
      ) {
        if (!cicEntry.lastConnectionStatusUpdatedAt) return false;
        return (
          filters.minLastConnectionStatusUpdatedAt <
          cicEntry.lastConnectionStatusUpdatedAt
        );
      }
      if (
        filters.maxLastConnectionStatusUpdatedAt &&
        filterKey === "maxLastConnectionStatusUpdatedAt"
      ) {
        if (!cicEntry.lastConnectionStatusUpdatedAt) return false;
        return (
          filters.maxLastConnectionStatusUpdatedAt >
          cicEntry.lastConnectionStatusUpdatedAt
        );
      }

      if (filters.id && filterKey === "id") {
        return matchField(cicEntry.id, filters.id);
      }

      if (filters.orderNumber && filterKey === "orderNumber") {
        return matchField(cicEntry.orderNumber ?? null, filters.orderNumber);
      }

      if (filters.categoryFilters && filterKey === "categoryFilters") {
        return getEntries(filters.categoryFilters).every(
          ([category, healthCheckStatus]) => {
            const categoryData = cicEntry.healthChecksByCategory;
            return categoryData?.[category] === healthCheckStatus;
          },
        );
      }

      if (filters.kpiFilters && filterKey === "kpiFilters") {
        return getEntries(filters.kpiFilters).every(
          ([kpi, healthCheckStatus]) => {
            const kpiData = cicEntry.healthChecksByKpi;
            return kpiData?.[kpi]?.status === healthCheckStatus;
          },
        );
      }

      return filterValue === cicEntry[filterKey as keyof T];
    });
  });
}
