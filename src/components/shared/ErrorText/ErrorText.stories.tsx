import type { Meta, StoryObj } from "@storybook/react-vite";
import { ErrorText } from "./ErrorText";

const meta: Meta<typeof ErrorText> = {
  title: "Shared/ErrorText",
  component: ErrorText,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    retry: { action: "retry-clicked" },
  },
};

export default meta;
type Story = StoryObj<typeof ErrorText>;

export const Default: Story = {
  args: {
    text: "Something went wrong. Please try again later.",
  },
};

export const WithRetry: Story = {
  args: {
    text: "Failed to load data from server.",
  },
};

export const NetworkError: Story = {
  args: {
    text: "Network error: Unable to connect to the server. Please check your internet connection.",
  },
};

export const ValidationError: Story = {
  args: {
    text: "Invalid input: Please check the form fields and try again.",
  },
};

export const LongErrorMessage: Story = {
  args: {
    text: "An unexpected error occurred while processing your request. The server returned a 500 Internal Server Error. This could be due to a temporary issue with our services. Please wait a few moments and try again. If the problem persists, please contact support.",
  },
};
