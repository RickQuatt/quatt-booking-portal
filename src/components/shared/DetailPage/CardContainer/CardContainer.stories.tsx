import type { Meta, StoryObj } from "@storybook/react-vite";
import { CardContainer } from "./CardContainer";
import { Button } from "@/components/ui/Button";

const meta: Meta<typeof CardContainer> = {
  title: "Shared/CardContainer",
  component: CardContainer,
  tags: ["autodocs"],
  argTypes: {
    collapsible: {
      control: "boolean",
    },
    defaultExpanded: {
      control: "boolean",
    },
    noPadding: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof CardContainer>;

export const Default: Story = {
  args: {
    title: "Device Information",
    children: (
      <div className="space-y-2">
        <p>This is some content inside the card container.</p>
        <p>It supports any React children.</p>
      </div>
    ),
  },
};

export const WithHeaderAction: Story = {
  args: {
    title: "Installation Details",
    headerAction: <Button size="sm">Edit</Button>,
    children: (
      <div className="space-y-2">
        <p>Card with an action button in the header.</p>
      </div>
    ),
  },
};

export const NonCollapsible: Story = {
  args: {
    title: "Always Visible Section",
    collapsible: false,
    children: (
      <div className="space-y-2">
        <p>This card cannot be collapsed.</p>
      </div>
    ),
  },
};

export const CollapsedByDefault: Story = {
  args: {
    title: "Hidden Content",
    defaultExpanded: false,
    children: (
      <div className="space-y-2">
        <p>This content is hidden by default. Click the header to expand.</p>
      </div>
    ),
  },
};

export const NoPadding: Story = {
  args: {
    title: "Table Container",
    noPadding: true,
    children: (
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-dark-foreground">
          <tr>
            <th className="px-4 py-2 text-left">Name</th>
            <th className="px-4 py-2 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t">
            <td className="px-4 py-2">Device 1</td>
            <td className="px-4 py-2">Active</td>
          </tr>
          <tr className="border-t">
            <td className="px-4 py-2">Device 2</td>
            <td className="px-4 py-2">Inactive</td>
          </tr>
        </tbody>
      </table>
    ),
  },
};

export const WithoutTitle: Story = {
  args: {
    children: (
      <div className="space-y-2">
        <p>Card without a title - just content.</p>
      </div>
    ),
  },
};
