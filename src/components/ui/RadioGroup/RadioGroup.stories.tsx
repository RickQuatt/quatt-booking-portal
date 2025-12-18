import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "./RadioGroup";

const meta: Meta<typeof RadioGroup> = {
  title: "UI/RadioGroup",
  component: RadioGroup,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof RadioGroup>;

export const Default: Story = {
  render: () => (
    <RadioGroup>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option1" id="option1" />
        <label htmlFor="option1" className="text-sm font-medium">
          Option 1
        </label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option2" id="option2" />
        <label htmlFor="option2" className="text-sm font-medium">
          Option 2
        </label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option3" id="option3" />
        <label htmlFor="option3" className="text-sm font-medium">
          Option 3
        </label>
      </div>
    </RadioGroup>
  ),
};

export const WithDefaultValue: Story = {
  render: () => (
    <RadioGroup defaultValue="option2">
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option1" id="option1" />
        <label htmlFor="option1" className="text-sm font-medium">
          Option 1
        </label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option2" id="option2" />
        <label htmlFor="option2" className="text-sm font-medium">
          Option 2 (selected)
        </label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option3" id="option3" />
        <label htmlFor="option3" className="text-sm font-medium">
          Option 3
        </label>
      </div>
    </RadioGroup>
  ),
};

export const WithDisabledItem: Story = {
  render: () => (
    <RadioGroup>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option1" id="option1" />
        <label htmlFor="option1" className="text-sm font-medium">
          Option 1
        </label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option2" id="option2" disabled />
        <label htmlFor="option2" className="text-sm font-medium opacity-50">
          Option 2 (disabled)
        </label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option3" id="option3" />
        <label htmlFor="option3" className="text-sm font-medium">
          Option 3
        </label>
      </div>
    </RadioGroup>
  ),
};

export const VerticalLayout: Story = {
  render: () => (
    <RadioGroup defaultValue="small">
      <div className="flex items-center gap-2">
        <RadioGroupItem value="small" id="small" />
        <label htmlFor="small" className="text-sm font-medium">
          Small
        </label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="medium" id="medium" />
        <label htmlFor="medium" className="text-sm font-medium">
          Medium
        </label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="large" id="large" />
        <label htmlFor="large" className="text-sm font-medium">
          Large
        </label>
      </div>
    </RadioGroup>
  ),
};

export const HorizontalLayout: Story = {
  render: () => (
    <RadioGroup defaultValue="light" className="flex gap-6">
      <div className="flex items-center gap-2">
        <RadioGroupItem value="light" id="light" />
        <label htmlFor="light" className="text-sm font-medium">
          Light
        </label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="dark" id="dark" />
        <label htmlFor="dark" className="text-sm font-medium">
          Dark
        </label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="auto" id="auto" />
        <label htmlFor="auto" className="text-sm font-medium">
          Auto
        </label>
      </div>
    </RadioGroup>
  ),
};

export const Interactive: Story = {
  render: () => {
    const [selected, setSelected] = useState("option1");
    return (
      <div className="space-y-4">
        <RadioGroup value={selected} onValueChange={setSelected}>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="option1" id="option1" />
            <label htmlFor="option1" className="text-sm font-medium">
              Option 1
            </label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="option2" id="option2" />
            <label htmlFor="option2" className="text-sm font-medium">
              Option 2
            </label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="option3" id="option3" />
            <label htmlFor="option3" className="text-sm font-medium">
              Option 3
            </label>
          </div>
        </RadioGroup>
        <p className="text-xs text-muted-foreground">Selected: {selected}</p>
      </div>
    );
  },
};
