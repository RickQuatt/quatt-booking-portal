import type { Meta, StoryObj } from "@storybook/react-vite";
import { Brand } from "./Brand";

const meta: Meta<typeof Brand> = {
  title: "Shared/Brand",
  component: Brand,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    type: {
      control: "radio",
      options: ["text", "logo"],
      description: '"text" displays full wordmark, "logo" displays only the Q',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Brand>;

export const Default: Story = {
  args: {
    className: "h-8 w-auto",
  },
};

export const Logo: Story = {
  args: {
    type: "logo",
    className: "h-8 w-8",
  },
};

export const Small: Story = {
  args: {
    className: "h-4 w-auto",
  },
};

export const Large: Story = {
  args: {
    className: "h-16 w-auto",
  },
};

export const LargeLogo: Story = {
  args: {
    type: "logo",
    className: "h-16 w-16",
  },
};

export const OnDarkBackground: Story = {
  args: {
    className: "h-8 w-auto",
  },
  decorators: [
    (Story) => (
      <div className="bg-gray-900 p-8 rounded-lg">
        <Story />
      </div>
    ),
  ],
};

export const LogoOnDarkBackground: Story = {
  args: {
    type: "logo",
    className: "h-8 w-8",
  },
  decorators: [
    (Story) => (
      <div className="bg-gray-900 p-8 rounded-lg">
        <Story />
      </div>
    ),
  ],
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-4">
      <Brand className="h-4 w-auto" />
      <Brand className="h-8 w-auto" />
      <Brand className="h-12 w-auto" />
      <Brand className="h-16 w-auto" />
    </div>
  ),
};

export const AllLogoSizes: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-4">
      <Brand type="logo" className="h-4 w-4" />
      <Brand type="logo" className="h-8 w-8" />
      <Brand type="logo" className="h-12 w-12" />
      <Brand type="logo" className="h-16 w-16" />
    </div>
  ),
};

export const Comparison: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500 w-16">Text:</span>
        <Brand type="text" className="h-8 w-auto" />
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500 w-16">Logo:</span>
        <Brand type="logo" className="h-8 w-8" />
      </div>
    </div>
  ),
};
