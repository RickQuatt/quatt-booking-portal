import type { Meta, StoryObj } from "@storybook/react-vite";
import { HealthCheckCircle } from "./HealthCheckCircle";

const meta: Meta<typeof HealthCheckCircle> = {
  title: "Shared/HealthCheckCircle",
  component: HealthCheckCircle,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    status: {
      control: "select",
      options: ["correct", "warning", "error", "notApplicable"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof HealthCheckCircle>;

export const Correct: Story = {
  args: {
    status: "correct",
  },
};

export const Warning: Story = {
  args: {
    status: "warning",
  },
};

export const Error: Story = {
  args: {
    status: "error",
  },
};

export const NotApplicable: Story = {
  args: {
    status: "notApplicable",
  },
};

export const AllStatuses: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <div className="flex flex-col items-center gap-2">
        <HealthCheckCircle status="correct" />
        <span className="text-xs">Correct</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <HealthCheckCircle status="warning" />
        <span className="text-xs">Warning</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <HealthCheckCircle status="error" />
        <span className="text-xs">Error</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <HealthCheckCircle status="notApplicable" />
        <span className="text-xs">N/A</span>
      </div>
    </div>
  ),
};

export const CustomSize: Story = {
  args: {
    status: "correct",
    className: "h-8 w-8",
  },
};

export const InlineWithText: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <HealthCheckCircle status="correct" />
      <span>System Health: All checks passed</span>
    </div>
  ),
};
