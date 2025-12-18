import type { Meta, StoryObj } from "@storybook/react-vite";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "./DataTable";
import { Badge } from "@/components/ui/Badge";

interface Device {
  id: string;
  name: string;
  status: "online" | "offline" | "maintenance";
  firmware: string;
  lastSeen: string;
}

const columns: ColumnDef<Device>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const variant =
        status === "online"
          ? "default"
          : status === "offline"
            ? "destructive"
            : "secondary";
      return <Badge variant={variant}>{status}</Badge>;
    },
  },
  {
    accessorKey: "firmware",
    header: "Firmware",
  },
  {
    accessorKey: "lastSeen",
    header: "Last Seen",
  },
];

const sampleData: Device[] = [
  {
    id: "CIC-001",
    name: "Living Room",
    status: "online",
    firmware: "v2.1.0",
    lastSeen: "2024-01-15 14:30",
  },
  {
    id: "CIC-002",
    name: "Kitchen",
    status: "online",
    firmware: "v2.1.0",
    lastSeen: "2024-01-15 14:28",
  },
  {
    id: "CIC-003",
    name: "Garage",
    status: "offline",
    firmware: "v2.0.5",
    lastSeen: "2024-01-14 09:15",
  },
  {
    id: "CIC-004",
    name: "Bedroom",
    status: "maintenance",
    firmware: "v2.1.0",
    lastSeen: "2024-01-15 10:00",
  },
];

const meta: Meta<typeof DataTable<Device, unknown>> = {
  title: "Shared/DataTable",
  component: DataTable,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof DataTable<Device, unknown>>;

export const Default: Story = {
  args: {
    columns,
    data: sampleData,
  },
};

export const Empty: Story = {
  args: {
    columns,
    data: [],
  },
};

export const SingleRow: Story = {
  args: {
    columns,
    data: [sampleData[0]],
  },
};

export const ManyRows: Story = {
  args: {
    columns,
    data: [
      ...sampleData,
      ...sampleData.map((d, i) => ({ ...d, id: `CIC-00${i + 5}` })),
      ...sampleData.map((d, i) => ({ ...d, id: `CIC-00${i + 9}` })),
    ],
  },
};
