import React from "react";
import { CicDashboardAggregate } from "../api-client/models";
import classes from "./CicVersions.module.css";
import {
  TBody,
  THead,
  Table,
  Td,
  TdText,
  Th,
  Tr,
} from "../ui-components/table/Table";

export function CicVersions({
  data,
}: {
  data: CicDashboardAggregate["aggregateByVersion"];
}) {
  const rows = React.useMemo(() => {
    return Object.entries(data)
      .map((entry) => ({
        version: entry[0],
        count: entry[1],
      }))
      .sort((a, b) => b.count - a.count)
      .map((obj) => (
        <Tr key={obj.version}>
          <Td>
            <TdText>{obj.version}</TdText>
          </Td>
          <Td>
            <TdText>{obj.count}</TdText>
          </Td>
        </Tr>
      ));
  }, [data]);

  return (
    <Table gridClass={classes["table-grid"]}>
      <THead>
        <Tr>
          <Th>
            <TdText>Version</TdText>
          </Th>
          <Th>
            <TdText>Number of CICs</TdText>
          </Th>
        </Tr>
      </THead>
      <TBody>{rows}</TBody>
    </Table>
  );
}
