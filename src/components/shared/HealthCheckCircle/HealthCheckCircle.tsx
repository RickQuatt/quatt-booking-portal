import type { components } from "@/openapi-client/types/api/v1";
import { cn } from "@/lib/utils";

type CicHealthCheckStatus = components["schemas"]["CicHealthCheckStatus"];

const statusStyles: Record<CicHealthCheckStatus, string> = {
  correct: "bg-green-500",
  warning: "bg-yellow-500",
  error: "bg-red-500",
  notApplicable: "bg-gray-400",
};

export function HealthCheckCircle({
  status,
  className,
}: {
  status: CicHealthCheckStatus;
  className?: string;
}) {
  return (
    <div
      className={cn("h-5 w-5 rounded-full", statusStyles[status], className)}
    />
  );
}
