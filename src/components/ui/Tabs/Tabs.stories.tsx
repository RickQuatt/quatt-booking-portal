import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./Tabs";

const meta: Meta<typeof Tabs> = {
  title: "UI/Tabs",
  component: Tabs,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="tab1" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        <TabsTrigger value="tab3">Tab 3</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">Content for Tab 1</TabsContent>
      <TabsContent value="tab2">Content for Tab 2</TabsContent>
      <TabsContent value="tab3">Content for Tab 3</TabsContent>
    </Tabs>
  ),
};

export const WithDescriptions: Story = {
  render: () => (
    <Tabs defaultValue="account" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <div className="space-y-4">
          <h3 className="font-medium">Account Settings</h3>
          <p className="text-sm text-muted-foreground">
            Manage your account details and preferences.
          </p>
        </div>
      </TabsContent>
      <TabsContent value="password">
        <div className="space-y-4">
          <h3 className="font-medium">Change Password</h3>
          <p className="text-sm text-muted-foreground">
            Update your password to keep your account secure.
          </p>
        </div>
      </TabsContent>
      <TabsContent value="notifications">
        <div className="space-y-4">
          <h3 className="font-medium">Notification Preferences</h3>
          <p className="text-sm text-muted-foreground">
            Control how and when you receive notifications.
          </p>
        </div>
      </TabsContent>
    </Tabs>
  ),
};

export const TwoTabs: Story = {
  render: () => (
    <Tabs defaultValue="overview" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="details">Details</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">Overview content goes here</TabsContent>
      <TabsContent value="details">Detailed information goes here</TabsContent>
    </Tabs>
  ),
};

export const DisabledTab: Story = {
  render: () => (
    <Tabs defaultValue="tab1" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="tab1">Available</TabsTrigger>
        <TabsTrigger value="tab2" disabled>
          Disabled
        </TabsTrigger>
        <TabsTrigger value="tab3">Available</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">This tab is available</TabsContent>
      <TabsContent value="tab2">This tab is disabled</TabsContent>
      <TabsContent value="tab3">This tab is also available</TabsContent>
    </Tabs>
  ),
};

export const ManyTabs: Story = {
  render: () => (
    <Tabs defaultValue="tab1">
      <TabsList>
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        <TabsTrigger value="tab3">Tab 3</TabsTrigger>
        <TabsTrigger value="tab4">Tab 4</TabsTrigger>
        <TabsTrigger value="tab5">Tab 5</TabsTrigger>
        <TabsTrigger value="tab6">Tab 6</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">Content 1</TabsContent>
      <TabsContent value="tab2">Content 2</TabsContent>
      <TabsContent value="tab3">Content 3</TabsContent>
      <TabsContent value="tab4">Content 4</TabsContent>
      <TabsContent value="tab5">Content 5</TabsContent>
      <TabsContent value="tab6">Content 6</TabsContent>
    </Tabs>
  ),
};

export const WithCustomContent: Story = {
  render: () => (
    <Tabs defaultValue="tab1" className="w-full">
      <TabsList>
        <TabsTrigger value="tab1">About</TabsTrigger>
        <TabsTrigger value="tab2">Features</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1" className="space-y-4">
        <h2 className="text-xl font-semibold">About Tab 1</h2>
        <p>
          This is a detailed section with custom formatted content. You can add
          any React elements here.
        </p>
        <ul className="list-disc list-inside space-y-2">
          <li>Feature one</li>
          <li>Feature two</li>
          <li>Feature three</li>
        </ul>
      </TabsContent>
      <TabsContent value="tab2" className="space-y-4">
        <h2 className="text-xl font-semibold">Features in Tab 2</h2>
        <p>This tab shows different features with custom styling.</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="border rounded p-3">Feature A</div>
          <div className="border rounded p-3">Feature B</div>
          <div className="border rounded p-3">Feature C</div>
          <div className="border rounded p-3">Feature D</div>
        </div>
      </TabsContent>
    </Tabs>
  ),
};
