import { DateRangeFilter } from "../../ui-components/filter/DateRangeFilter";
import { TextFilter } from "../../ui-components/filter/TextFilter";
import { SelectFilter } from "../../ui-components/filter/SelectFilter";
import { InstallationFilters } from "./types";
import {
  getInstallationTypeEmoji,
  getInstallationTypeLabel,
} from "../../utils/installationTypeEmojiMapper";
import type { components } from "../../openapi-client/types/api/v1";

type SetFiltersFunc = (
  setFiltersFunc: (oldFilters: InstallationFilters) => InstallationFilters,
) => void;
type FilterProps = { setFilters: SetFiltersFunc };

export function OrderNumberFilter({ setFilters }: FilterProps) {
  return <TextFilter setFilters={setFilters} filterKey={"orderNumber"} />;
}

export function ZipCodeFilter({ setFilters }: FilterProps) {
  return <TextFilter setFilters={setFilters} filterKey={"zipCode"} />;
}

export function HouseNumberFilter({ setFilters }: FilterProps) {
  return <TextFilter setFilters={setFilters} filterKey={"houseNumber"} />;
}

export function HouseAdditionNumberFilter({ setFilters }: FilterProps) {
  return <TextFilter setFilters={setFilters} filterKey={"houseAddition"} />;
}

export function ActiveCicFilter({ setFilters }: FilterProps) {
  return <TextFilter setFilters={setFilters} filterKey={"cicId"} />;
}

export function CreatedAtFilter({ setFilters }: FilterProps) {
  return (
    <DateRangeFilter
      setFilters={setFilters}
      minFilterKey="minCreatedAt"
      maxFilterKey="maxCreatedAt"
    />
  );
}

export function UpdatedAtFilter({ setFilters }: FilterProps) {
  return (
    <DateRangeFilter
      setFilters={setFilters}
      minFilterKey="minUpdatedAt"
      maxFilterKey="maxUpdatedAt"
    />
  );
}

export function InstallationTypeFilter({ setFilters }: FilterProps) {
  const installationTypes: NonNullable<
    components["schemas"]["DetailedInstallationType"]
  >[] = [
    "HYBRID_SINGLE",
    "HYBRID_DUO",
    "ALL_ELECTRIC_SINGLE",
    "ALL_ELECTRIC_DUO",
    "CHILL_HYBRID_SINGLE",
    "CHILL_HYBRID_DUO",
    "CHILL_ALL_ELECTRIC_SINGLE",
    "CHILL_ALL_ELECTRIC_DUO",
    "HOME_BATTERY",
  ];

  return (
    <SelectFilter setFilters={setFilters} filterKey="installationType">
      <option value="">All Types</option>
      {installationTypes.map((type) => (
        <option key={type} value={type}>
          {getInstallationTypeEmoji(type)} {getInstallationTypeLabel(type)}
        </option>
      ))}
    </SelectFilter>
  );
}
