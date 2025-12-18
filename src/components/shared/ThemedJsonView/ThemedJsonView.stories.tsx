import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemedJsonView } from "./ThemedJsonView";

const sampleData = {
  device: {
    id: "CIC-12345",
    name: "Living Room Heat Pump",
    status: "online",
    firmware: "v2.1.0",
  },
  metrics: {
    temperature: 21.5,
    humidity: 45,
    powerConsumption: 1250,
  },
  settings: {
    mode: "heating",
    targetTemperature: 22,
    schedule: {
      enabled: true,
      weekday: { start: "07:00", end: "22:00" },
      weekend: { start: "08:00", end: "23:00" },
    },
  },
  history: [
    { timestamp: "2024-01-15T14:30:00Z", event: "temperature_change" },
    { timestamp: "2024-01-15T14:00:00Z", event: "mode_switch" },
  ],
};

const meta: Meta<typeof ThemedJsonView> = {
  title: "Shared/ThemedJsonView",
  component: ThemedJsonView,
  tags: ["autodocs"],
  argTypes: {
    collapsed: {
      control: { type: "number", min: 0, max: 10 },
    },
    displayDataTypes: {
      control: "boolean",
    },
    displayObjectSize: {
      control: "boolean",
    },
    enableClipboard: {
      control: "boolean",
    },
    showFullscreenButton: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof ThemedJsonView>;

export const Default: Story = {
  args: {
    value: sampleData,
    title: "Device Configuration",
  },
};

export const CollapsedDeep: Story = {
  args: {
    value: sampleData,
    collapsed: 1,
    title: "Collapsed View",
  },
};

export const FullyExpanded: Story = {
  args: {
    value: sampleData,
    collapsed: 10,
    title: "Expanded View",
  },
};

export const WithDataTypes: Story = {
  args: {
    value: sampleData,
    displayDataTypes: true,
    displayObjectSize: true,
    title: "With Data Types",
  },
};

export const WithoutFullscreen: Story = {
  args: {
    value: sampleData,
    showFullscreenButton: false,
    title: "No Fullscreen Button",
  },
};

export const WithCopyCallback: Story = {
  args: {
    value: sampleData,
    onCopied: (text: string) => console.log("Copied:", text),
    title: "With Copy Callback",
  },
};

export const SimpleObject: Story = {
  args: {
    value: {
      name: "Test",
      value: 123,
      enabled: true,
    },
    title: "Simple Object",
  },
};

export const ArrayData: Story = {
  args: {
    value: [
      { id: 1, name: "Item 1" },
      { id: 2, name: "Item 2" },
      { id: 3, name: "Item 3" },
    ],
    title: "Array Data",
  },
};

export const UndefinedValue: Story = {
  args: {
    value: undefined,
    title: "Undefined Value",
  },
};
