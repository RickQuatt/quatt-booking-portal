import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/utils/formatDate";
import { Pencil, Trash2 } from "lucide-react";
import type { components } from "@/openapi-client/types/api/v1";

type Installer = components["schemas"]["Installer"];

interface InstallerColumnMeta {
  onEdit: (installer: Installer) => void;
  onDelete: (installerId: string) => void;
}

export const createInstallerColumns = (
  meta: InstallerColumnMeta,
): ColumnDef<Installer>[] => [
  {
    accessorKey: "code",
    header: "Code",
    cell: ({ row }) => {
      const code = row.getValue("code") as string;
      return <span className="font-mono text-sm font-medium">{code}</span>;
    },
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      return <span className="text-sm font-medium">{name}</span>;
    },
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => {
      const phone = row.getValue("phone") as string;
      return (
        <a
          href={`tel:${phone}`}
          className="text-sm text-blue-600 hover:underline"
        >
          {phone}
        </a>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Is Active",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean;
      return (
        <Badge variant={isActive ? "success" : "secondary"} className="text-xs">
          {isActive ? "Yes" : "No"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const dateStr = row.getValue("createdAt") as string;
      return <span className="text-sm">{formatDate(new Date(dateStr))}</span>;
    },
  },
  {
    accessorKey: "updatedAt",
    header: "Updated At",
    cell: ({ row }) => {
      const dateStr = row.getValue("updatedAt") as string;
      return <span className="text-sm">{formatDate(new Date(dateStr))}</span>;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const installer = row.original;
      return (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => meta.onEdit(installer)}
            className="h-8"
          >
            <Pencil className="h-3 w-3" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => meta.onDelete(installer.id)}
            className="h-8"
          >
            <Trash2 className="h-3 w-3" />
            Delete
          </Button>
        </div>
      );
    },
  },
];
