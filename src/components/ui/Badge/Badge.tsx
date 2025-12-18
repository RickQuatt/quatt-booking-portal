import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700",
        secondary:
          "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200 dark:bg-dark-foreground dark:text-gray-400 dark:border-gray-700 dark:hover:bg-gray-700",
        destructive:
          "bg-red-50 text-red-600 border-red-200 hover:bg-red-100 dark:bg-red-950 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900",
        success:
          "bg-green-50 text-green-600 border-green-200 hover:bg-green-100 dark:bg-green-950 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-900",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
