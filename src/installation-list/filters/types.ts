import { AdminInstallationsList } from "../../api-client/models";

export type InstallationFilters = Partial<
  Omit<AdminInstallationsList, "createdAt">
> & {
  minCreatedAt?: AdminInstallationsList["createdAt"];
  maxCreatedAt?: AdminInstallationsList["createdAt"];
};
