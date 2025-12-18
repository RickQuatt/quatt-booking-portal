import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./Card";

describe("Card", () => {
  it("renders card with content", () => {
    render(
      <Card>
        <CardContent>Content</CardContent>
      </Card>,
    );
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("renders card header with title", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
        </CardHeader>
      </Card>,
    );
    expect(screen.getByText("Card Title")).toBeInTheDocument();
  });

  it("renders card with description", () => {
    render(
      <Card>
        <CardHeader>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
      </Card>,
    );
    expect(screen.getByText("Card Description")).toBeInTheDocument();
  });

  it("renders card with footer", () => {
    render(
      <Card>
        <CardFooter>Footer Content</CardFooter>
      </Card>,
    );
    expect(screen.getByText("Footer Content")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(<Card className="custom-class">Content</Card>);
    expect(container.firstChild).toHaveClass("custom-class");
  });
});
