import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/30 hover:border-gray-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100 transition-colors md:text-sm dark:bg-dark-foreground dark:text-gray-100 dark:border-gray-600 dark:placeholder:text-gray-500 dark:focus-visible:border-primary dark:focus-visible:ring-primary/20 dark:hover:border-gray-500",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
