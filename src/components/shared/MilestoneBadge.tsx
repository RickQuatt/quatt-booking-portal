import type { MilestoneLevel } from "@/lib/partner-types";
import { MILESTONE_SHORT, MILESTONE_LABELS } from "@/lib/partner-types";

export function MilestoneBadge({
  level,
  size = "sm",
}: {
  level: MilestoneLevel;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  };

  return (
    <span
      className={`milestone-${level} inline-flex items-center rounded-full font-semibold ${sizeClasses[size]}`}
    >
      {size === "sm" ? MILESTONE_SHORT[level] : MILESTONE_LABELS[level]}
    </span>
  );
}
