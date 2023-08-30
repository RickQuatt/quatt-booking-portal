import React from "react";
import classes from "./CicDashboard.module.css";
import { CicDashboardAggregate } from "../api-client/models";
import { CicHealthAggregateChart } from "./CicHealthChart";
import { CicHealthByCategoryChart } from "./CicHealthByCategoryChart";
import { CicVersions } from "./CicVersions";
import classNames from "classnames";
import { CicHealthByKpiChart } from "./CicHealthByKpiChart";

type Props = {
  data: CicDashboardAggregate;
};

export function CicDashboard({ data }: Props) {
  return (
    <div className={classes.grid}>
      <div
        className={classNames(
          classes["grid-item"],
          classes["section-health-overall"],
        )}
      >
        <CicHealthAggregateChart data={data.aggregate} />
      </div>
      <div
        className={classNames(
          classes["grid-item"],
          classes["section-health-by-category"],
        )}
      >
        <CicHealthByCategoryChart data={data.aggregateByCategory} />
      </div>
      <div
        className={classNames(
          classes["grid-item"],
          classes["section-cic-versions"],
        )}
      >
        <CicVersions data={data.aggregateByVersion} />
      </div>
      <div
        className={classNames(
          classes["grid-item"],
          classes["section-health-by-kpi"],
        )}
      >
        <CicHealthByKpiChart data={data.aggregateByKpi} />
      </div>
    </div>
  );
}
