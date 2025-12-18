import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Switch } from "./Switch";

describe("Switch", () => {
  it("renders switch", () => {
    render(<Switch />);
    expect(screen.getByRole("switch")).toBeInTheDocument();
  });

  it("is unchecked by default", () => {
    render(<Switch />);
    const switchElement = screen.getByRole("switch");
    expect(switchElement).toHaveAttribute("data-state", "unchecked");
  });

  it("can be checked", () => {
    const { rerender } = render(<Switch defaultChecked={false} />);
    let switchElement = screen.getByRole("switch");
    expect(switchElement).toHaveAttribute("data-state", "unchecked");

    rerender(<Switch defaultChecked={true} />);
    switchElement = screen.getByRole("switch");
    expect(switchElement).toHaveAttribute("data-state", "checked");
  });

  it("can be disabled", () => {
    render(<Switch disabled />);
    const switchElement = screen.getByRole("switch");
    expect(switchElement).toBeDisabled();
  });

  it("has correct styling classes", () => {
    render(<Switch />);
    const switchElement = screen.getByRole("switch");
    expect(switchElement).toHaveClass("h-6", "w-11");
  });

  it("applies custom className", () => {
    render(<Switch className="custom-class" />);
    const switchElement = screen.getByRole("switch");
    expect(switchElement).toHaveClass("custom-class");
  });

  it("triggers onCheckedChange callback", () => {
    const handleChange = vi.fn();
    render(<Switch onCheckedChange={handleChange} />);
    const switchElement = screen.getByRole("switch");

    fireEvent.click(switchElement);
    expect(handleChange).toHaveBeenCalled();
  });

  it("toggles state when clicked", () => {
    const handleChange = vi.fn();
    render(<Switch onCheckedChange={handleChange} defaultChecked={false} />);
    const switchElement = screen.getByRole("switch");

    expect(switchElement).toHaveAttribute("data-state", "unchecked");

    fireEvent.click(switchElement);
    expect(handleChange).toHaveBeenCalledWith(true);
  });
});
