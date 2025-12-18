import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Skeleton } from "./Skeleton";

describe("Skeleton", () => {
  it("renders skeleton element", () => {
    const { container } = render(<Skeleton data-testid="skeleton" />);
    const skeleton = container.querySelector('[data-testid="skeleton"]');
    expect(skeleton).toBeInTheDocument();
  });

  it("applies animate-pulse class", () => {
    const { container } = render(<Skeleton data-testid="skeleton" />);
    const skeleton = container.querySelector('[data-testid="skeleton"]');
    expect(skeleton).toHaveClass("animate-pulse");
  });

  it("applies custom className", () => {
    const { container } = render(
      <Skeleton className="h-10 w-full" data-testid="skeleton" />,
    );
    const skeleton = container.querySelector('[data-testid="skeleton"]');
    expect(skeleton).toHaveClass("h-10", "w-full");
  });
});
