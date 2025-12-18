import { ColumnDef } from "@tanstack/react-table";
import { Link } from "wouter";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/utils/formatDate";
import {
  getInstallationTypeIcons,
  getInstallationTypeLabel,
} from "@/utils/installationTypeEmojiMapper";
import { Flame } from "lucide-react";
import type { components } from "@/openapi-client/types/api/v1";

type AdminInstallation =
  components["schemas"]["PaginatedInstallationList"]["installations"][number];

export const installationColumns: ColumnDef<AdminInstallation>[] = [
  {
    accessorKey: "installationType",
    header: () => (
      <span title="Installation Type" className="text-lg">
        🏷️
      </span>
    ),
    cell: ({ row }) => {
      const type = row.getValue("installationType") as
        | components["schemas"]["DetailedInstallationType"]
        | undefined;
      const icons = getInstallationTypeIcons(type);
      const label = getInstallationTypeLabel(type);

      if (!icons) {
        return (
          <span title="Unknown" className="text-gray-400">
            ❓
          </span>
        );
      }

      const {
        showFire,
        systemIcon: SystemIcon,
        chillIcon: ChillIcon,
        heatPumpCount,
        heatPumpIcon: HeatPumpIcon,
      } = icons;

      return (
        <div title={label} className="flex items-center gap-1">
          {ChillIcon && (
            <ChillIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          )}
          {showFire && <Flame className="h-4 w-4 text-orange-500" />}
          {SystemIcon && (
            <SystemIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          )}
          {HeatPumpIcon &&
            Array.from({ length: heatPumpCount }).map((_, i) => (
              <HeatPumpIcon
                key={i}
                className="h-5 w-5 text-gray-700 dark:text-gray-300"
              />
            ))}
        </div>
      );
    },
  },
  {
    accessorKey: "installationUuid",
    header: "Installation UUID",
    cell: ({ row }) => {
      const uuid = row.getValue("installationUuid") as string;
      return (
        <Link
          href={`/installations/${uuid}`}
          className="text-blue-600 hover:underline"
        >
          {uuid}
        </Link>
      );
    },
  },
  {
    accessorKey: "orderNumber",
    header: "Order Number",
    cell: ({ row }) => {
      const orderNumber = row.getValue("orderNumber") as string | null;
      const uuid = row.original.installationUuid;
      return orderNumber ? (
        <Link
          href={`/installations/${uuid}`}
          className="text-blue-600 hover:underline"
        >
          {orderNumber}
        </Link>
      ) : (
        <span className="text-sm text-gray-400">N/A</span>
      );
    },
  },
  {
    accessorKey: "zipCode",
    header: "Zip Code",
    cell: ({ row }) => {
      const zipCode = row.getValue("zipCode") as string;
      return <span className="text-sm">{zipCode}</span>;
    },
  },
  {
    accessorKey: "houseNumber",
    header: "House Number",
    cell: ({ row }) => {
      const houseNumber = row.getValue("houseNumber") as string;
      return <span className="text-sm">{houseNumber}</span>;
    },
  },
  {
    accessorKey: "houseAddition",
    header: "House Addition",
    cell: ({ row }) => {
      const addition = row.getValue("houseAddition") as string;
      return addition ? (
        <span className="text-sm">{addition}</span>
      ) : (
        <span className="text-sm text-gray-400">-</span>
      );
    },
  },
  {
    accessorKey: "houseId",
    header: "House ID",
    cell: ({ row }) => {
      const houseId = row.getValue("houseId") as string;
      return <span className="text-sm">{houseId}</span>;
    },
  },
  {
    accessorKey: "cicId",
    header: "Active CIC",
    cell: ({ row }) => {
      const cicId = row.getValue("cicId") as string | undefined;
      return cicId ? (
        <Link href={`/cics/${cicId}`} className="text-blue-600 hover:underline">
          {cicId}
        </Link>
      ) : (
        <span className="text-sm text-gray-400">N/A</span>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as string | undefined;
      return date ? (
        <span className="text-sm">{formatDate(new Date(date))}</span>
      ) : (
        <span className="text-sm text-gray-400">N/A</span>
      );
    },
  },
  {
    accessorKey: "updatedAt",
    header: "Updated At",
    cell: ({ row }) => {
      const date = row.getValue("updatedAt") as string | undefined;
      return date ? (
        <span className="text-sm">{formatDate(new Date(date))}</span>
      ) : (
        <span className="text-sm text-gray-400">N/A</span>
      );
    },
  },
  {
    id: "details",
    header: "Details",
    cell: ({ row }) => {
      const uuid = row.original.installationUuid;
      return (
        <Button variant="default" size="sm" className="h-8 w-full">
          <Link href={`/installations/${uuid}`}>View</Link>
        </Button>
      );
    },
  },
];
