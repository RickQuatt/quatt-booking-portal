import { Link } from "wouter";
import type { AmPartner } from "@/lib/partner-types";
import { MilestoneBadge } from "@/components/shared/MilestoneBadge";

export function PartnerCard({ partner }: { partner: AmPartner }) {
  const priorityClass =
    partner.priority === "high"
      ? "priority-high"
      : partner.priority === "medium"
        ? "priority-medium"
        : "priority-low";

  return (
    <Link href={`/partners/${partner.id}`}>
      <div
        className={`${priorityClass} bg-white rounded-[14px] p-4 mb-3 border border-quatt-border-light shadow-card hover:shadow-card-hover transition-shadow cursor-pointer`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-sm truncate tracking-[-0.04em]">
                {partner.contact_name || partner.name}
              </h3>
              <MilestoneBadge level={partner.current_milestone} />
            </div>
            <p className="text-xs text-quatt-text-secondary truncate">
              {partner.name}
            </p>
            {partner.last_note && (
              <p className="text-xs text-quatt-text-secondary mt-1.5 line-clamp-2">
                {partner.last_note}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end ml-3 shrink-0">
            {partner.days_since_contact < 999 ? (
              <span
                className={`text-xs font-medium ${partner.days_since_contact > 14 ? "text-quatt-red" : "text-quatt-text-secondary"}`}
              >
                {partner.days_since_contact}d
              </span>
            ) : (
              <span className="text-xs font-medium text-quatt-red">Nieuw</span>
            )}
            <span className="text-[10px] text-quatt-text-secondary mt-0.5">
              {partner.city}
            </span>
          </div>
        </div>
        {partner.priority === "high" && (
          <div className="mt-2 bg-quatt-error-bg rounded-[12px] px-2.5 py-1.5">
            <p className="text-[11px] text-quatt-error-text font-medium">
              {partner.priority_reason}
            </p>
          </div>
        )}
      </div>
    </Link>
  );
}
