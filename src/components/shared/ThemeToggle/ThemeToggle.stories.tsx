import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeToggle } from "./ThemeToggle";

const meta: Meta<typeof ThemeToggle> = {
  title: "Shared/ThemeToggle",
  component: ThemeToggle,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof ThemeToggle>;

export const Default: Story = {
  args: {},
};

export const WithClassName: Story = {
  args: {
    className: "p-4 bg-gray-100 dark:bg-dark-foreground rounded-lg",
  },
};

export const InHeader: Story = {
  decorators: [
    (Story) => (
      <div className="flex items-center justify-between w-64 p-4 bg-white dark:bg-gray-900 border rounded-lg">
        <span className="font-medium">Settings</span>
        <Story />
      </div>
    ),
  ],
};

export const InSidebar: Story = {
  decorators: [
    (Story) => (
      <div className="w-64 p-4 bg-gray-50 dark:bg-gray-900 border rounded-lg space-y-4">
        <div className="text-sm font-medium text-gray-500">Preferences</div>
        <div className="flex items-center justify-between">
          <span className="text-sm">Theme</span>
          <Story />
        </div>
      </div>
    ),
  ],
};
