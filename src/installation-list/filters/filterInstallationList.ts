import { AdminInstallationsList } from "../../api-client/models";
import { matchField } from "../../ui-components/filter/utils";
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

      if (filters.orderNumber && filterKey === "orderNumber") {
        return matchField(installationEntry.orderNumber, filters.orderNumber);
      }

      if (filters.cicId && filterKey === "cicId") {
        return matchField(installationEntry.cicId, filters.cicId);
      }

      return (
        filterValue ===
        installationEntry[filterKey as keyof AdminInstallationsList]
      );
    });
  });
}
