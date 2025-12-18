import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
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

describe("Table", () => {
  it("renders table element", () => {
    const { container } = render(<Table />);
    expect(container.querySelector("table")).toBeInTheDocument();
  });

  it("renders table with caption", () => {
    render(
      <Table>
        <TableCaption>Table Caption</TableCaption>
      </Table>,
    );
    expect(screen.getByText("Table Caption")).toBeInTheDocument();
  });

  it("renders table header", () => {
    const { container } = render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Header</TableHead>
          </TableRow>
        </TableHeader>
      </Table>,
    );
    expect(container.querySelector("thead")).toBeInTheDocument();
  });

  it("renders table body", () => {
    const { container } = render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Body Content</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(container.querySelector("tbody")).toBeInTheDocument();
    expect(screen.getByText("Body Content")).toBeInTheDocument();
  });

  it("renders table footer", () => {
    const { container } = render(
      <Table>
        <TableFooter>
          <TableRow>
            <TableCell>Footer Content</TableCell>
          </TableRow>
        </TableFooter>
      </Table>,
    );
    expect(container.querySelector("tfoot")).toBeInTheDocument();
    expect(screen.getByText("Footer Content")).toBeInTheDocument();
  });

  it("renders table row", () => {
    const { container } = render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(container.querySelector("tr")).toBeInTheDocument();
  });

  it("renders table head cell", () => {
    const { container } = render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Column Name</TableHead>
          </TableRow>
        </TableHeader>
      </Table>,
    );
    expect(container.querySelector("th")).toBeInTheDocument();
    expect(screen.getByText("Column Name")).toBeInTheDocument();
  });

  it("renders table data cell", () => {
    const { container } = render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Cell Data</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(container.querySelector("td")).toBeInTheDocument();
    expect(screen.getByText("Cell Data")).toBeInTheDocument();
  });

  it("renders complete table structure", () => {
    render(
      <Table>
        <TableCaption>Sample Table</TableCaption>
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
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>Total</TableCell>
            <TableCell colSpan={2}>2 users</TableCell>
          </TableRow>
        </TableFooter>
      </Table>,
    );

    expect(screen.getByText("Sample Table")).toBeInTheDocument();
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
    expect(screen.getByText("2 users")).toBeInTheDocument();
  });

  it("applies custom className to table", () => {
    const { container } = render(
      <Table className="custom-table-class">
        <TableBody>
          <TableRow>
            <TableCell>Content</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const table = container.querySelector("table");
    expect(table).toHaveClass("custom-table-class");
  });

  it("applies custom className to table row", () => {
    const { container } = render(
      <Table>
        <TableBody>
          <TableRow className="selected-row">
            <TableCell>Content</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const row = container.querySelector("tr");
    expect(row).toHaveClass("selected-row");
  });

  it("applies custom className to table cell", () => {
    const { container } = render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell className="custom-cell">Content</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const cell = container.querySelector("td");
    expect(cell).toHaveClass("custom-cell");
  });
});
