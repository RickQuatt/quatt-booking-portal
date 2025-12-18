import type { components } from "@/openapi-client/types/api/v1";
import { CardContainer } from "@/components/shared/DetailPage";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { formatDateTime } from "@/utils/formatDate";

type AdminCic = components["schemas"]["AdminCic"];

export interface CICSidebarHistoryProps {
  cicData: AdminCic;
}

/**
 * Sidebar card showing state history table
 * Historical status transitions for the CIC
 */
export function CICSidebarHistory({ cicData }: CICSidebarHistoryProps) {
  if (!cicData.stateHistory || cicData.stateHistory.length === 0) {
    return (
      <CardContainer title="State History">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No state history available
        </p>
      </CardContainer>
    );
  }

  return (
    <CardContainer title="State History" noPadding>
      <div className="max-h-96 overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Starts At</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cicData.stateHistory.map((state, index) => (
              <TableRow key={index}>
                <TableCell className="text-xs">
                  {state.startAt
                    ? formatDateTime(new Date(state.startAt))
                    : "N/A"}
                </TableCell>
                <TableCell className="text-xs font-medium">
                  {state.status}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </CardContainer>
  );
}
