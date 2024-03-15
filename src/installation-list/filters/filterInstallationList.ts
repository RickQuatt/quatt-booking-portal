import { AdminInstallationsList } from "../../api-client/models";
import { fuzzyMatch } from "../../ui-components/filter/utils";
import { getEntries } from "../../utils/object";
import { InstallationFilters } from "./types";

export function filterInstallationList(
  list: AdminInstallationsList[],
  filters: InstallationFilters,
) {
  return list.filter((installationEntry) => {
    return getEntries(filters).every(([filterKey, filterValue]) => {
      if (filters.minCreatedAt && filterKey === "minCreatedAt") {
        const createdDate = installationEntry.createdAt;
        return filters.minCreatedAt < createdDate;
      }
      if (filters.maxCreatedAt && filterKey === "maxCreatedAt") {
        const createdDate = installationEntry.createdAt;
        return filters.maxCreatedAt > createdDate;
      }

      if (filters.externalId && filterKey === "externalId") {
        return fuzzyMatch(installationEntry.externalId, filters.externalId);
      }

      if (filters.orderNumber && filterKey === "orderNumber") {
        return fuzzyMatch(installationEntry.orderNumber, filters.orderNumber);
      }

      if (filters.cicId && filterKey === "cicId") {
        return fuzzyMatch(installationEntry.cicId, filters.cicId);
      }

      return (
        filterValue ===
        installationEntry[filterKey as keyof AdminInstallationsList]
      );
    });
  });
}
