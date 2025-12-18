import React from "react";
import { CardContainer } from "@/components/shared/DetailPage/CardContainer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";

interface VersionsTableProps {
  data: { [version: string]: number };
}

/**
 * CIC Versions Table
 * Displays software version distribution sorted by count
 */
export function VersionsTable({ data }: VersionsTableProps) {
  const rows = React.useMemo(() => {
    return Object.entries(data)
      .map((entry) => ({
        version: entry[0],
        count: entry[1],
      }))
      .sort((a, b) => b.count - a.count);
  }, [data]);

  return (
    <CardContainer title="CIC Versions" className="h-full" noPadding>
      <div className="max-h-[400px] overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Version</TableHead>
              <TableHead className="text-right">Number of CICs</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.version}>
                <TableCell className="font-mono">{row.version}</TableCell>
                <TableCell className="text-right font-medium">
                  {row.count}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </CardContainer>
  );
}
