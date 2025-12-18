import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Checkbox } from "./Checkbox";

const meta: Meta<typeof Checkbox> = {
  title: "UI/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  argTypes: {
    disabled: {
      control: "boolean",
    },
    defaultChecked: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  args: {},
};

export const Checked: Story = {
  args: {
    defaultChecked: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const DisabledChecked: Story = {
  args: {
    disabled: true,
    defaultChecked: true,
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Checkbox id="terms" />
      <label
        htmlFor="terms"
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        Accept terms and conditions
      </label>
    </div>
  ),
};

export const Multiple: Story = {
  render: () => (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Checkbox id="option1" defaultChecked />
        <label htmlFor="option1" className="text-sm font-medium">
          Option 1
        </label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="option2" />
        <label htmlFor="option2" className="text-sm font-medium">
          Option 2
        </label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="option3" />
        <label htmlFor="option3" className="text-sm font-medium">
          Option 3
        </label>
      </div>
    </div>
  ),
};

export const Interactive: Story = {
  render: () => {
    const [checked, setChecked] = useState<boolean | "indeterminate">(false);
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Checkbox
            id="interactive"
            checked={checked}
            onCheckedChange={setChecked}
          />
          <label htmlFor="interactive" className="text-sm font-medium">
            {checked === true ? "Checked" : "Unchecked"}
          </label>
        </div>
        <p className="text-xs text-muted-foreground">
          Current state: {checked === true ? "checked" : "unchecked"}
        </p>
      </div>
    );
  },
};
