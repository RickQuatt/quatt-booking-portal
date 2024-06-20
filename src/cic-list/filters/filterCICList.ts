import { AdminCic } from "../../api-client/models";
import { matchField } from "../../ui-components/filter/utils";
import { getEntries } from "../../utils/object";
import { CICFilters } from "./types";

export function filterCICList(list: AdminCic[], filters: CICFilters) {
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
        return matchField(cicEntry.orderNumber, filters.orderNumber);
      }

      if (filters.categoryFilters && filterKey === "categoryFilters") {
        return getEntries(filters.categoryFilters).every(
          ([category, healthCheckStatus]) => {
            return (
              cicEntry.healthChecksByCategory[category] === healthCheckStatus
            );
          },
        );
      }

      if (filters.kpiFilters && filterKey === "kpiFilters") {
        return getEntries(filters.kpiFilters).every(
          ([kpi, healthCheckStatus]) => {
            return cicEntry.healthChecksByKpi[kpi].status === healthCheckStatus;
          },
        );
      }

      return filterValue === cicEntry[filterKey as keyof AdminCic];
    });
  });
}
