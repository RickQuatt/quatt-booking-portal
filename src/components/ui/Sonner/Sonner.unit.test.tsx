import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Toaster } from "./Sonner";

describe("Toaster", () => {
  it("renders toaster component", () => {
    const { container } = render(<Toaster />);
    expect(container.querySelector(".toaster")).toBeInTheDocument();
  });

  it("applies toaster class", () => {
    const { container } = render(<Toaster />);
    const toaster = container.querySelector(".toaster");
    expect(toaster).toHaveClass("toaster");
    expect(toaster).toHaveClass("group");
  });

  it("renders with custom theme prop", () => {
    const { container } = render(<Toaster theme="dark" />);
    const toaster = container.querySelector(".toaster");
    expect(toaster).toBeInTheDocument();
  });

  it("renders with custom position prop", () => {
    const { container } = render(<Toaster position="top-center" />);
    const toaster = container.querySelector(".toaster");
    expect(toaster).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(<Toaster className="custom-class" />);
    const toaster = container.querySelector(".toaster");
    expect(toaster).toHaveClass("custom-class");
  });
});
