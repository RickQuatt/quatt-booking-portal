import type { Meta, StoryObj } from "@storybook/react-vite";
import { DataRow } from "./DataRow";
import { Badge } from "@/components/ui/Badge";

const meta: Meta<typeof DataRow> = {
  title: "Shared/DataRow",
  component: DataRow,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof DataRow>;

export const Default: Story = {
  args: {
    label: "CIC ID",
    value: "CIC-12345-ABCD",
  },
};

export const WithBadge: Story = {
  args: {
    label: "Status",
    value: <Badge variant="default">Active</Badge>,
  },
};

export const NullValue: Story = {
  args: {
    label: "Optional Field",
    value: null,
  },
};

export const UndefinedValue: Story = {
  args: {
    label: "Missing Data",
    value: undefined,
  },
};

export const LongValue: Story = {
  args: {
    label: "Firmware Version",
    value: "v2.1.0-beta.3+build.12345.abcdef1234567890",
  },
};

export const MultipleRows: Story = {
  render: () => (
    <div className="space-y-0">
      <DataRow label="Device ID" value="DEV-001" />
      <DataRow label="Status" value={<Badge>Online</Badge>} />
      <DataRow label="Last Updated" value="2024-01-15 14:30:00" />
      <DataRow label="Firmware" value="v2.1.0" />
      <DataRow label="Location" value={null} />
    </div>
  ),
};
