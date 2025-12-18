import type { Meta, StoryObj } from "@storybook/react-vite";
import { Loader } from "./Loader";

const meta: Meta<typeof Loader> = {
  title: "Shared/Loader",
  component: Loader,
  tags: ["autodocs"],
  parameters: {
    // Loader has a 500ms delay before showing, so we need to wait
    chromatic: { delay: 600 },
  },
};

export default meta;
type Story = StoryObj<typeof Loader>;

export const Default: Story = {
  decorators: [
    (Story) => (
      <div className="h-48 w-full">
        <Story />
      </div>
    ),
  ],
};

export const InCard: Story = {
  decorators: [
    (Story) => (
      <div className="h-48 w-full rounded-lg border bg-white dark:bg-dark-foreground shadow">
        <Story />
      </div>
    ),
  ],
};

export const FullPage: Story = {
  decorators: [
    (Story) => (
      <div className="h-96 w-full bg-gray-100 dark:bg-gray-900">
        <Story />
      </div>
    ),
  ],
};
