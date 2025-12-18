import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./Select";

describe("Select", () => {
  it("renders select trigger", () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
        </SelectContent>
      </Select>,
    );
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("displays placeholder text", () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
        </SelectContent>
      </Select>,
    );
    expect(screen.getByText("Select an option")).toBeInTheDocument();
  });

  it("can be disabled", () => {
    render(
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
        </SelectContent>
      </Select>,
    );
    expect(screen.getByRole("combobox")).toBeDisabled();
  });
});
