import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Switch } from "./Switch";

const meta: Meta<typeof Switch> = {
  title: "UI/Switch",
  component: Switch,
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
type Story = StoryObj<typeof Switch>;

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
    <div className="flex items-center gap-3">
      <Switch id="notifications" />
      <label
        htmlFor="notifications"
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        Enable notifications
      </label>
    </div>
  ),
};

export const Multiple: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Email notifications</span>
        <Switch defaultChecked id="email" />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Push notifications</span>
        <Switch id="push" />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">SMS notifications</span>
        <Switch defaultChecked id="sms" />
      </div>
    </div>
  ),
};

export const Interactive: Story = {
  render: () => {
    const [enabled, setEnabled] = useState(false);
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Switch checked={enabled} onCheckedChange={setEnabled} />
          <label className="text-sm font-medium">
            {enabled ? "Enabled" : "Disabled"}
          </label>
        </div>
        <p className="text-xs text-muted-foreground">
          Current state: {enabled ? "on" : "off"}
        </p>
      </div>
    );
  },
};

export const SettingsForm: Story = {
  render: () => {
    const [settings, setSettings] = useState({
      darkMode: false,
      notifications: true,
      analytics: false,
    });

    return (
      <div className="space-y-4 rounded-lg border p-4">
        <h3 className="text-base font-semibold">Settings</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Dark Mode</span>
            <Switch
              checked={settings.darkMode}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, darkMode: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Notifications</span>
            <Switch
              checked={settings.notifications}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, notifications: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Analytics</span>
            <Switch
              checked={settings.analytics}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, analytics: checked })
              }
            />
          </div>
        </div>
      </div>
    );
  },
};
