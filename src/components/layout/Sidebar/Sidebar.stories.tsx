import type { Meta, StoryObj } from "@storybook/react-vite";
import { Sidebar } from "./Sidebar";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";

// Create a memory location hook for Storybook (no real browser navigation)
const { hook } = memoryLocation({ path: "/dashboard" });

const meta: Meta<typeof Sidebar> = {
  title: "Layout/Sidebar",
  component: Sidebar,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <Router hook={hook}>
        <div className="flex h-screen bg-gray-100 dark:bg-gray-950">
          <Story />
          <main className="flex-1 p-6">
            <div className="rounded-lg bg-white dark:bg-dark-foreground p-6 shadow">
              <h1 className="text-xl font-bold">Main Content Area</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                This is where the page content would appear.
              </p>
            </div>
          </main>
        </div>
      </Router>
    ),
  ],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

export const Default: Story = {
  args: {},
};

export const OnCICsPage: Story = {
  decorators: [
    (Story) => {
      const { hook: cicsHook } = memoryLocation({ path: "/cics" });
      return (
        <Router hook={cicsHook}>
          <div className="flex h-screen bg-gray-100 dark:bg-gray-950">
            <Story />
            <main className="flex-1 p-6">
              <div className="rounded-lg bg-white dark:bg-dark-foreground p-6 shadow">
                <h1 className="text-xl font-bold">CIC List</h1>
              </div>
            </main>
          </div>
        </Router>
      );
    },
  ],
};

export const OnInstallationsPage: Story = {
  decorators: [
    (Story) => {
      const { hook: installationsHook } = memoryLocation({
        path: "/installations",
      });
      return (
        <Router hook={installationsHook}>
          <div className="flex h-screen bg-gray-100 dark:bg-gray-950">
            <Story />
            <main className="flex-1 p-6">
              <div className="rounded-lg bg-white dark:bg-dark-foreground p-6 shadow">
                <h1 className="text-xl font-bold">Installations</h1>
              </div>
            </main>
          </div>
        </Router>
      );
    },
  ],
};
