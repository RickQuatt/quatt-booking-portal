import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Checkbox } from "./Checkbox";

describe("Checkbox", () => {
  it("renders checkbox", () => {
    render(<Checkbox />);
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
  });

  it("is unchecked by default", () => {
    render(<Checkbox />);
    const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
    expect(checkbox).not.toBeChecked();
  });

  it("can be checked", () => {
    const { rerender } = render(<Checkbox defaultChecked={false} />);
    const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
    expect(checkbox).not.toBeChecked();

    rerender(<Checkbox defaultChecked={true} />);
    expect(checkbox).toBeChecked();
  });

  it("can be disabled", () => {
    render(<Checkbox disabled />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeDisabled();
  });

  it("has correct styling classes", () => {
    render(<Checkbox />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveClass("h-4", "w-4");
  });

  it("applies custom className", () => {
    render(<Checkbox className="custom-class" />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveClass("custom-class");
  });

  it("triggers onCheckedChange callback", () => {
    const handleChange = vi.fn();
    render(<Checkbox onCheckedChange={handleChange} />);
    const checkbox = screen.getByRole("checkbox");

    fireEvent.click(checkbox);
    expect(handleChange).toHaveBeenCalled();
  });
});
