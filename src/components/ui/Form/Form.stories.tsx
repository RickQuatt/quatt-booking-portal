import type { Meta, StoryObj } from "@storybook/react-vite";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Button } from "../Button";

const meta: Meta = {
  title: "UI/Form",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

const validationSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  name: z.string().min(1, "Name is required"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .optional(),
});

export const BasicForm: Story = {
  render: () => {
    const form = useForm({
      resolver: zodResolver(validationSchema),
      defaultValues: {
        email: "",
        name: "",
        message: "",
      },
    });

    const onSubmit = (data: unknown) => {
      console.log("Form submitted:", data);
    };

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your name" {...field} />
                </FormControl>
                <FormDescription>Enter your full name</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="your@email.com" {...field} />
                </FormControl>
                <FormDescription>
                  We will never share your email
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your message" {...field} />
                </FormControl>
                <FormDescription>
                  Minimum 10 characters required
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit">Submit</Button>
        </form>
      </Form>
    );
  },
};

export const SimpleField: Story = {
  render: () => {
    const form = useForm({
      defaultValues: {
        username: "",
      },
    });

    return (
      <Form {...form}>
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Enter username" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name
              </FormDescription>
            </FormItem>
          )}
        />
      </Form>
    );
  },
};

export const FieldWithError: Story = {
  render: () => {
    const form = useForm({
      resolver: zodResolver(validationSchema),
      defaultValues: {
        email: "",
        name: "",
        message: "",
      },
    });

    return (
      <Form {...form}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="your@email.com" {...field} />
              </FormControl>
              <FormDescription>Enter a valid email address</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </Form>
    );
  },
};
