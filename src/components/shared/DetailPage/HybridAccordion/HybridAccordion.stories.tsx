import type { Meta, StoryObj } from "@storybook/react-vite";
import { HybridAccordion, HybridAccordionItem } from "./HybridAccordion";

const meta: Meta<typeof HybridAccordion> = {
  title: "Shared/HybridAccordion",
  component: HybridAccordion,
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["single", "multiple"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof HybridAccordion>;

export const Single: Story = {
  args: {
    type: "single",
    defaultValue: "item-1",
    children: (
      <>
        <HybridAccordionItem value="item-1" title="Device Information">
          <div className="space-y-2">
            <p>Device ID: CIC-12345</p>
            <p>Firmware: v2.1.0</p>
            <p>Last Online: 2024-01-15</p>
          </div>
        </HybridAccordionItem>
        <HybridAccordionItem value="item-2" title="Network Settings">
          <div className="space-y-2">
            <p>IP Address: 192.168.1.100</p>
            <p>Subnet: 255.255.255.0</p>
          </div>
        </HybridAccordionItem>
        <HybridAccordionItem value="item-3" title="Advanced Options">
          <div className="space-y-2">
            <p>Debug Mode: Disabled</p>
            <p>Log Level: Info</p>
          </div>
        </HybridAccordionItem>
      </>
    ),
  },
};

export const Multiple: Story = {
  args: {
    type: "multiple",
    defaultValue: ["item-1", "item-2"],
    children: (
      <>
        <HybridAccordionItem value="item-1" title="Section A">
          <p>Content for section A - can be open with other sections.</p>
        </HybridAccordionItem>
        <HybridAccordionItem value="item-2" title="Section B">
          <p>Content for section B - multiple sections can be open.</p>
        </HybridAccordionItem>
        <HybridAccordionItem value="item-3" title="Section C">
          <p>Content for section C.</p>
        </HybridAccordionItem>
      </>
    ),
  },
};

export const Nested: Story = {
  render: () => (
    <HybridAccordion type="single" defaultValue="device-info">
      <HybridAccordionItem value="device-info" title="Device Information">
        <div className="space-y-4">
          <p>Basic device data always visible in parent.</p>
          <HybridAccordion type="multiple" defaultValue={["updates"]}>
            <HybridAccordionItem value="updates" title="Update Info" level={2}>
              <p>Nested content about updates.</p>
            </HybridAccordionItem>
            <HybridAccordionItem
              value="diagnostics"
              title="Diagnostics"
              level={2}
            >
              <p>Nested diagnostic information.</p>
            </HybridAccordionItem>
          </HybridAccordion>
        </div>
      </HybridAccordionItem>
      <HybridAccordionItem value="settings" title="Settings">
        <p>Settings content here.</p>
      </HybridAccordionItem>
    </HybridAccordion>
  ),
};

export const AllClosed: Story = {
  args: {
    type: "single",
    children: (
      <>
        <HybridAccordionItem value="item-1" title="Click to Open">
          <p>Hidden content revealed on click.</p>
        </HybridAccordionItem>
        <HybridAccordionItem value="item-2" title="Another Section">
          <p>More hidden content.</p>
        </HybridAccordionItem>
      </>
    ),
  },
};
