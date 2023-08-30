import qs from "qs";
import { CICFilters } from "./types";

export const stringifyCICFilters = (filters: CICFilters) => {
  return qs.stringify(filters);
};

export const parseCICFiltersString = (filterString: string): CICFilters => {
  return qs.parse(filterString) as unknown as CICFilters;
};
