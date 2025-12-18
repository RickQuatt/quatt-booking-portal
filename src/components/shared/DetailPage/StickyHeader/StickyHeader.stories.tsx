import type { Meta, StoryObj } from "@storybook/react-vite";
import { StickyHeader } from "./StickyHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const meta: Meta<typeof StickyHeader> = {
  title: "Shared/StickyHeader",
  component: StickyHeader,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="relative h-[400px] overflow-auto bg-gray-100 dark:bg-gray-950">
        <Story />
        <div className="p-6 space-y-4">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="p-4 bg-white dark:bg-dark-foreground rounded-lg shadow"
            >
              <p>Scroll content item {i + 1}</p>
              <p className="text-sm text-gray-500">
                Scroll up to see the sticky header in action.
              </p>
            </div>
          ))}
        </div>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof StickyHeader>;

export const Default: Story = {
  args: {
    children: (
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Device Details</h1>
        <Badge>Online</Badge>
      </div>
    ),
  },
};

export const WithActions: Story = {
  args: {
    children: (
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Installation #12345</h1>
          <p className="text-sm text-gray-500">Last updated: 2024-01-15</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Export
          </Button>
          <Button size="sm">Edit</Button>
        </div>
      </div>
    ),
  },
};

export const Minimal: Story = {
  args: {
    children: <h1 className="text-lg font-semibold">Page Title</h1>,
  },
};
