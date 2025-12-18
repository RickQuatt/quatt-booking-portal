import { ReactNode, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

export interface CardContainerProps {
  title?: string;
  children: ReactNode;
  headerAction?: ReactNode;
  className?: string;
  noPadding?: boolean;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

/**
 * Reusable card container for detail page sections
 * Provides consistent styling across all detail cards
 */
export function CardContainer({
  title,
  children,
  headerAction,
  className = "",
  noPadding = false,
  collapsible = true,
  defaultExpanded = true,
}: CardContainerProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <Card
      className={`rounded-t-3xl rounded-b-3xl bg-white dark:bg-dark-foreground border border-gray-200 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-gray-950/70 transition-shadow ${className}`}
    >
      {title && (
        <CardHeader
          className={cn(
            `rounded-t-3xl ${!isExpanded ? "rounded-b-3xl" : ""} flex flex-row items-center justify-between space-y-0 bg-light-header dark:bg-dark-header`,
            collapsible && "cursor-pointer select-none",
          )}
          onClick={collapsible ? () => setIsExpanded(!isExpanded) : undefined}
        >
          <CardTitle className="text-xl font-bold">{title}</CardTitle>
          <div className="flex items-center gap-2">
            {headerAction && <div>{headerAction}</div>}
            {collapsible && (
              <ChevronDown
                className={cn(
                  "h-5 w-5 shrink-0 text-gray-500 transition-transform duration-200",
                  isExpanded && "rotate-180",
                )}
              />
            )}
          </div>
        </CardHeader>
      )}
      {(!collapsible || isExpanded) && (
        <CardContent
          className={
            "bg-white dark:bg-dark-foreground rounded-b-3xl" +
            (noPadding ? " p-0" : " p-4")
          }
        >
          {children}
        </CardContent>
      )}
    </Card>
  );
}
