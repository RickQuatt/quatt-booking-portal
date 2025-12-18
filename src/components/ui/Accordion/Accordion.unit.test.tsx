import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "./Accordion";

describe("Accordion", () => {
  it("renders accordion trigger", () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Section 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    expect(
      screen.getByRole("button", { name: /Section 1/i }),
    ).toBeInTheDocument();
  });

  it("renders accordion content", () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Section 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    expect(screen.getByText("Content 1")).toBeInTheDocument();
  });

  it("renders multiple accordion items", () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Section 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Section 2</AccordionTrigger>
          <AccordionContent>Content 2</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>Section 3</AccordionTrigger>
          <AccordionContent>Content 3</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    expect(screen.getByText("Section 1")).toBeInTheDocument();
    expect(screen.getByText("Section 2")).toBeInTheDocument();
    expect(screen.getByText("Section 3")).toBeInTheDocument();
  });

  it("opens accordion item when trigger is clicked", () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Section 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    const trigger = screen.getByRole("button", { name: /Section 1/i });
    fireEvent.click(trigger);
    expect(trigger.parentElement).toHaveAttribute("data-state", "open");
  });

  it("applies custom className to accordion items", () => {
    const { container } = render(
      <Accordion type="single" collapsible className="custom-accordion">
        <AccordionItem value="item-1" className="custom-item">
          <AccordionTrigger className="custom-trigger">
            Section 1
          </AccordionTrigger>
          <AccordionContent className="custom-content">
            Content 1
          </AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    expect(container.querySelector(".custom-item")).toBeInTheDocument();
  });

  it("supports collapsible mode", () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Section 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    const trigger = screen.getByRole("button", { name: /Section 1/i });
    // Click to open
    fireEvent.click(trigger);
    expect(trigger.parentElement).toHaveAttribute("data-state", "open");
    // Click to close
    fireEvent.click(trigger);
    expect(trigger.parentElement).toHaveAttribute("data-state", "closed");
  });

  it("displays chevron icon in trigger", () => {
    const { container } = render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Section 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });
});
