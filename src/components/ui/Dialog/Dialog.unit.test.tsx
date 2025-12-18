import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "./Dialog";
import { Button } from "../Button";

describe("Dialog", () => {
  it("renders dialog trigger", () => {
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
        </DialogContent>
      </Dialog>,
    );
    expect(
      screen.getByRole("button", { name: "Open Dialog" }),
    ).toBeInTheDocument();
  });

  it("opens dialog when trigger is clicked", async () => {
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogTitle>Dialog Title</DialogTitle>
          <p>Dialog Content</p>
        </DialogContent>
      </Dialog>,
    );

    const trigger = screen.getByRole("button", { name: "Open Dialog" });
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByText("Dialog Title")).toBeInTheDocument();
      expect(screen.getByText("Dialog Content")).toBeInTheDocument();
    });
  });

  it("renders dialog with title", async () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Title</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open" }));

    await waitFor(() => {
      expect(screen.getByText("Test Title")).toBeInTheDocument();
    });
  });

  it("renders dialog with description", async () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription>Test Description</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open" }));

    await waitFor(() => {
      expect(screen.getByText("Test Description")).toBeInTheDocument();
    });
  });

  it("renders dialog header", async () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Header Title</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open" }));

    await waitFor(() => {
      expect(screen.getByText("Header Title")).toBeInTheDocument();
    });
  });

  it("renders dialog footer", async () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogFooter>
            <p>Footer Content</p>
          </DialogFooter>
        </DialogContent>
      </Dialog>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open" }));

    await waitFor(() => {
      expect(screen.getByText("Footer Content")).toBeInTheDocument();
    });
  });

  it("closes dialog when close button is clicked", async () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <p>Content</p>
        </DialogContent>
      </Dialog>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open" }));

    await waitFor(() => {
      expect(screen.getByText("Title")).toBeInTheDocument();
    });

    const closeButton = screen.getByRole("button", { name: "Close" });
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText("Title")).not.toBeInTheDocument();
    });
  });

  it("renders full dialog structure with all components", async () => {
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Dialog</DialogTitle>
            <DialogDescription>This is a complete dialog</DialogDescription>
          </DialogHeader>
          <p>Main Content</p>
          <DialogFooter>
            <Button variant="outline">Cancel</Button>
            <Button>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open Dialog" }));

    await waitFor(() => {
      expect(screen.getByText("Complete Dialog")).toBeInTheDocument();
      expect(screen.getByText("This is a complete dialog")).toBeInTheDocument();
      expect(screen.getByText("Main Content")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Cancel" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Confirm" }),
      ).toBeInTheDocument();
    });
  });

  it("applies custom className to dialog header", async () => {
    const { container } = render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogHeader className="custom-header-class">
            <DialogTitle>Title</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open" }));

    await waitFor(() => {
      const header = container.querySelector(".custom-header-class");
      expect(header).toBeInTheDocument();
    });
  });
});
