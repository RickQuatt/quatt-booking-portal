import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Badge } from "./Badge";

describe("Badge", () => {
  it("renders badge with text", () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("applies default variant styles", () => {
    render(<Badge>Default</Badge>);
    const badge = screen.getByText("Default");
    expect(badge).toHaveClass("bg-primary");
  });

  it("applies secondary variant styles", () => {
    render(<Badge variant="secondary">Secondary</Badge>);
    const badge = screen.getByText("Secondary");
    expect(badge).toHaveClass("bg-secondary");
  });

  it("applies destructive variant styles", () => {
    render(<Badge variant="destructive">Error</Badge>);
    const badge = screen.getByText("Error");
    expect(badge).toHaveClass("bg-destructive");
  });

  it("applies outline variant styles", () => {
    render(<Badge variant="outline">Outline</Badge>);
    const badge = screen.getByText("Outline");
    expect(badge).toHaveClass("text-foreground");
  });

  it("applies custom className", () => {
    render(<Badge className="custom-class">Custom</Badge>);
    expect(screen.getByText("Custom")).toHaveClass("custom-class");
  });
});
