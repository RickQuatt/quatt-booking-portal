import {
  AdminCic,
  CicHealthCheckCategory,
  CicHealthCheckStatus,
  CicHealthChecksByKpi,
} from "../../api-client/models";

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
