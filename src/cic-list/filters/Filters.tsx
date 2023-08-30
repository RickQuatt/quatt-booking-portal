import React from "react";
import { omit } from "lodash-es";

import { AdminCic } from "../../api-client/models";
import { Select } from "../../ui-components/select/Select";
import { TextFilter } from "../../ui-components/filter/TextFilter";
import { DateRangeFilter } from "../../ui-components/filter/DateRangeFilter";
import { CICFilters } from "./types";

type SetFiltersFunc = (
  setFiltersFunc: (oldFilters: CICFilters) => CICFilters,
) => void;
type FilterProps = { setFilters: SetFiltersFunc };

export function IDFilter({ setFilters }: FilterProps) {
  return <TextFilter setFilters={setFilters} filterKey={"id"} />;
}

export function CableConnectionStatusFilter({
  setFilters,
}: {
  setFilters: SetFiltersFunc;
}) {
  const onChange = React.useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value as AdminCic["cableConnectionStatus"];
      setFilters((filters: CICFilters) => {
        if (!value) {
          return omit(filters, "cableConnectionStatus");
        }
        return { ...filters, cableConnectionStatus: value };
      });
    },
    [setFilters],
  );

  return (
    <Select onChange={onChange}>
      <option value="">Any</option>
      <option value="connected">Connected</option>
      <option value="disconnected">Disconnected</option>
      <option value="not_reachable">Not reachable</option>
    </Select>
  );
}

export function WifiConnectionStatusFilter({
  setFilters,
}: {
  setFilters: SetFiltersFunc;
}) {
  const onChange = React.useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value as AdminCic["wifiConnectionStatus"];
      setFilters((filters: CICFilters) => {
        if (!value) {
          return omit(filters, "wifiConnectionStatus");
        }
        return { ...filters, wifiConnectionStatus: value };
      });
    },
    [setFilters],
  );

  return (
    <Select onChange={onChange}>
      <option value="">Any</option>
      <option value="connected">Connected</option>
      <option value="disconnected">Disconnected</option>
      <option value="not_reachable">Not reachable</option>
    </Select>
  );
}

export function LTEConnectionStatusFilter({
  setFilters,
}: {
  setFilters: SetFiltersFunc;
}) {
  const onChange = React.useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value as AdminCic["lteConnectionStatus"];
      setFilters((filters: CICFilters) => {
        if (!value) {
          return omit(filters, "lteConnectionStatus");
        }
        return { ...filters, lteConnectionStatus: value };
      });
    },
    [setFilters],
  );

  return (
    <Select onChange={onChange}>
      <option value="">Any</option>
      <option value="connected">Connected</option>
      <option value="disconnected">Disconnected</option>
      <option value="not_reachable">Not reachable</option>
    </Select>
  );
}

export function SupervisoryControlModeFilter({ setFilters }: FilterProps) {
  return (
    <TextFilter
      setFilters={setFilters}
      filterKey={"supervisoryControlMode"}
      inputType="number"
    />
  );
}

export function OrderNumberFilter({ setFilters }: FilterProps) {
  return <TextFilter setFilters={setFilters} filterKey={"orderNumber"} />;
}

export function CreatedDateFilter({ setFilters }: FilterProps) {
  return (
    <DateRangeFilter
      setFilters={setFilters}
      minFilterKey="minCreatedAt"
      maxFilterKey="maxCreatedAt"
    />
  );
}

export function LastConnectionStatusFilter({ setFilters }: FilterProps) {
  return (
    <DateRangeFilter
      setFilters={setFilters}
      minFilterKey="minLastConnectionStatusUpdatedAt"
      maxFilterKey="maxLastConnectionStatusUpdatedAt"
    />
  );
}

export function CICHealthCheckFilter({
  setFilters,
}: {
  setFilters: SetFiltersFunc;
}) {
  const onChange = React.useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value as AdminCic["lteConnectionStatus"];
      setFilters((filters: CICFilters) => {
        if (!value) {
          return omit(filters, "lteConnectionStatus");
        }
        return { ...filters, lteConnectionStatus: value };
      });
    },
    [setFilters],
  );

  return (
    <Select onChange={onChange}>
      <option value="">Any</option>
      <option value="connected">Connected</option>
      <option value="disconnected">Disconnected</option>
      <option value="not_reachable">Not reachable</option>
    </Select>
  );
}
