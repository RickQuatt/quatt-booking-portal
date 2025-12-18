import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from "./Table";

const meta: Meta<typeof Table> = {
  title: "UI/Table",
  component: Table,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Table>;

export const Default: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>John Doe</TableCell>
          <TableCell>john@example.com</TableCell>
          <TableCell>Active</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Jane Smith</TableCell>
          <TableCell>jane@example.com</TableCell>
          <TableCell>Inactive</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Bob Johnson</TableCell>
          <TableCell>bob@example.com</TableCell>
          <TableCell>Active</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

export const WithCaption: Story = {
  render: () => (
    <Table>
      <TableCaption>User Accounts</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Alice Admin</TableCell>
          <TableCell>alice@example.com</TableCell>
          <TableCell>Administrator</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Bob User</TableCell>
          <TableCell>bob@example.com</TableCell>
          <TableCell>User</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

export const WithFooter: Story = {
  render: () => (
    <Table>
      <TableCaption>Sales Summary</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Product A</TableCell>
          <TableCell>10</TableCell>
          <TableCell>$100</TableCell>
          <TableCell>$1,000</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Product B</TableCell>
          <TableCell>5</TableCell>
          <TableCell>$200</TableCell>
          <TableCell>$1,000</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Product C</TableCell>
          <TableCell>8</TableCell>
          <TableCell>$150</TableCell>
          <TableCell>$1,200</TableCell>
        </TableRow>
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total</TableCell>
          <TableCell>$3,200</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
};

export const Striped: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Department</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow className="bg-white">
          <TableCell>001</TableCell>
          <TableCell>Alice</TableCell>
          <TableCell>Engineering</TableCell>
          <TableCell>Active</TableCell>
        </TableRow>
        <TableRow className="bg-muted/50">
          <TableCell>002</TableCell>
          <TableCell>Bob</TableCell>
          <TableCell>Marketing</TableCell>
          <TableCell>Active</TableCell>
        </TableRow>
        <TableRow className="bg-white">
          <TableCell>003</TableCell>
          <TableCell>Charlie</TableCell>
          <TableCell>Sales</TableCell>
          <TableCell>Inactive</TableCell>
        </TableRow>
        <TableRow className="bg-muted/50">
          <TableCell>004</TableCell>
          <TableCell>Diana</TableCell>
          <TableCell>Engineering</TableCell>
          <TableCell>Active</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

export const Dense: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-xs">Task</TableHead>
          <TableHead className="text-xs">Assignee</TableHead>
          <TableHead className="text-xs">Due Date</TableHead>
          <TableHead className="text-xs">Priority</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="p-2">Fix bug in dashboard</TableCell>
          <TableCell className="p-2">John</TableCell>
          <TableCell className="p-2">2024-11-25</TableCell>
          <TableCell className="p-2">High</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="p-2">Review PR</TableCell>
          <TableCell className="p-2">Jane</TableCell>
          <TableCell className="p-2">2024-11-22</TableCell>
          <TableCell className="p-2">Medium</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="p-2">Update docs</TableCell>
          <TableCell className="p-2">Bob</TableCell>
          <TableCell className="p-2">2024-11-30</TableCell>
          <TableCell className="p-2">Low</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

export const Compact: Story = {
  render: () => (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableCaption>Compact data view with many columns</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>City</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>1001</TableCell>
            <TableCell>Alex Wong</TableCell>
            <TableCell>alex@example.com</TableCell>
            <TableCell>555-0101</TableCell>
            <TableCell>San Francisco</TableCell>
            <TableCell>Active</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>1002</TableCell>
            <TableCell>Emma Davis</TableCell>
            <TableCell>emma@example.com</TableCell>
            <TableCell>555-0102</TableCell>
            <TableCell>New York</TableCell>
            <TableCell>Active</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  ),
};

export const EmptyState: Story = {
  render: () => (
    <Table>
      <TableCaption>No data available</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell
            colSpan={3}
            className="text-center text-muted-foreground py-8"
          >
            No records found
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};
