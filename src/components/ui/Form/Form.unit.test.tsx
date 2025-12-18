import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useForm } from "react-hook-form";
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
} from "./Form";
import { Input } from "../Input";

const TestFormComponent = () => {
  const form = useForm({
    defaultValues: {
      testField: "",
    },
  });

  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name="testField"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Test Field</FormLabel>
            <FormControl>
              <Input placeholder="Enter text" {...field} />
            </FormControl>
            <FormDescription>This is a test field</FormDescription>
          </FormItem>
        )}
      />
    </Form>
  );
};

describe("Form Components", () => {
  it("renders FormItem with content", () => {
    render(
      <FormItem>
        <FormLabel>Test Label</FormLabel>
      </FormItem>,
    );
    expect(screen.getByText("Test Label")).toBeInTheDocument();
  });

  it("renders FormLabel", () => {
    render(<FormLabel>Label Text</FormLabel>);
    expect(screen.getByText("Label Text")).toBeInTheDocument();
  });

  it("renders FormDescription", () => {
    render(<FormDescription>Description text</FormDescription>);
    expect(screen.getByText("Description text")).toBeInTheDocument();
  });

  it("renders form with field", () => {
    render(<TestFormComponent />);
    expect(screen.getByText("Test Field")).toBeInTheDocument();
    expect(screen.getByText("This is a test field")).toBeInTheDocument();
  });

  it("renders input in FormControl", () => {
    render(<TestFormComponent />);
    expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
  });
});
