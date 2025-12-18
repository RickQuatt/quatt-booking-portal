import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { RadioGroup, RadioGroupItem } from "./RadioGroup";

describe("RadioGroup", () => {
  it("renders radio group", () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="option1" id="option1" />
      </RadioGroup>,
    );
    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
  });

  it("renders radio group items", () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="option1" id="option1" />
        <RadioGroupItem value="option2" id="option2" />
      </RadioGroup>,
    );
    expect(screen.getAllByRole("radio")).toHaveLength(2);
  });

  it("has correct initial state", () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="option1" id="option1" />
        <RadioGroupItem value="option2" id="option2" />
      </RadioGroup>,
    );
    const radios = screen.getAllByRole("radio");
    expect(radios[0]).not.toBeChecked();
    expect(radios[1]).not.toBeChecked();
  });

  it("can have a default checked value", () => {
    render(
      <RadioGroup defaultValue="option1">
        <RadioGroupItem value="option1" id="option1" />
        <RadioGroupItem value="option2" id="option2" />
      </RadioGroup>,
    );
    const radios = screen.getAllByRole("radio");
    expect(radios[0]).toBeChecked();
    expect(radios[1]).not.toBeChecked();
  });

  it("allows changing selection", () => {
    render(
      <RadioGroup defaultValue="option1">
        <RadioGroupItem value="option1" id="option1" />
        <RadioGroupItem value="option2" id="option2" />
      </RadioGroup>,
    );
    const radios = screen.getAllByRole("radio");

    fireEvent.click(radios[1]);
    expect(radios[0]).not.toBeChecked();
    expect(radios[1]).toBeChecked();
  });

  it("can be disabled", () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="option1" id="option1" disabled />
      </RadioGroup>,
    );
    expect(screen.getByRole("radio")).toBeDisabled();
  });

  it("applies correct styling classes to items", () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="option1" id="option1" />
      </RadioGroup>,
    );
    const radio = screen.getByRole("radio");
    expect(radio).toHaveClass("h-4", "w-4");
  });

  it("applies custom className", () => {
    render(
      <RadioGroup className="custom-group">
        <RadioGroupItem value="option1" id="option1" className="custom-item" />
      </RadioGroup>,
    );
    expect(screen.getByRole("radiogroup")).toHaveClass("custom-group");
    expect(screen.getByRole("radio")).toHaveClass("custom-item");
  });
});
