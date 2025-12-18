import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Label } from "./Label";

describe("Label", () => {
  it("renders label with text", () => {
    render(<Label>Username</Label>);
    expect(screen.getByText("Username")).toBeInTheDocument();
  });

  it("renders with htmlFor attribute", () => {
    render(<Label htmlFor="username">Username</Label>);
    const label = screen.getByText("Username");
    expect(label).toHaveAttribute("for", "username");
  });

  it("applies custom className", () => {
    render(<Label className="custom-class">Test</Label>);
    const label = screen.getByText("Test");
    expect(label).toHaveClass("custom-class");
  });

  it("applies default styles", () => {
    render(<Label>Test</Label>);
    const label = screen.getByText("Test");
    expect(label).toHaveClass("text-sm");
    expect(label).toHaveClass("font-medium");
  });
});
