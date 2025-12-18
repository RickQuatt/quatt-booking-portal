import type { Meta, StoryObj } from "@storybook/react-vite";
import { Toaster } from "./Sonner";
import { Button } from "../Button";
import { toast } from "sonner";

const meta: Meta<typeof Toaster> = {
  title: "UI/Toaster",
  component: Toaster,
  tags: ["autodocs"],
  argTypes: {
    theme: {
      control: "select",
      options: ["light", "dark", "system"],
    },
    position: {
      control: "select",
      options: [
        "top-left",
        "top-center",
        "top-right",
        "bottom-left",
        "bottom-center",
        "bottom-right",
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Toaster>;

export const Default: Story = {
  render: () => (
    <div>
      <Toaster />
      <Button onClick={() => toast("Default toast message")}>Show Toast</Button>
    </div>
  ),
};

export const Success: Story = {
  render: () => (
    <div>
      <Toaster />
      <Button
        onClick={() => toast.success("Operation completed successfully!")}
      >
        Show Success
      </Button>
    </div>
  ),
};

export const Error: Story = {
  render: () => (
    <div>
      <Toaster />
      <Button onClick={() => toast.error("An error occurred!")}>
        Show Error
      </Button>
    </div>
  ),
};

export const Warning: Story = {
  render: () => (
    <div>
      <Toaster />
      <Button onClick={() => toast.warning("Warning message")}>
        Show Warning
      </Button>
    </div>
  ),
};

export const Info: Story = {
  render: () => (
    <div>
      <Toaster />
      <Button onClick={() => toast.info("Informational message")}>
        Show Info
      </Button>
    </div>
  ),
};

export const Loading: Story = {
  render: () => (
    <div>
      <Toaster />
      <Button
        onClick={() =>
          toast.loading("Processing...", {
            description: "Please wait while we process your request",
          })
        }
      >
        Show Loading
      </Button>
    </div>
  ),
};

export const WithDescription: Story = {
  render: () => (
    <div>
      <Toaster />
      <Button
        onClick={() =>
          toast("Notification", {
            description: "This is a detailed description of the notification",
          })
        }
      >
        Show with Description
      </Button>
    </div>
  ),
};

export const AllTypes: Story = {
  render: () => (
    <div>
      <Toaster />
      <div className="flex flex-wrap gap-4">
        <Button onClick={() => toast("Default")}>Default</Button>
        <Button onClick={() => toast.success("Success")} variant="secondary">
          Success
        </Button>
        <Button onClick={() => toast.error("Error")} variant="destructive">
          Error
        </Button>
        <Button onClick={() => toast.warning("Warning")}>Warning</Button>
        <Button onClick={() => toast.info("Info")} variant="outline">
          Info
        </Button>
      </div>
    </div>
  ),
};

export const TopCenter: Story = {
  render: () => (
    <div>
      <Toaster position="top-center" />
      <Button onClick={() => toast("Toast at top center")}>Show Toast</Button>
    </div>
  ),
};

export const BottomRight: Story = {
  render: () => (
    <div>
      <Toaster position="bottom-right" />
      <Button onClick={() => toast("Toast at bottom right")}>Show Toast</Button>
    </div>
  ),
};

export const DarkTheme: Story = {
  render: () => (
    <div>
      <Toaster theme="dark" />
      <Button onClick={() => toast("Dark theme toast")}>Show Toast</Button>
    </div>
  ),
};
