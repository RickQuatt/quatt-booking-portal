import type { AmPartner, MilestoneLevel } from "@/lib/partner-types";

export function MilestoneProgress({ partner }: { partner: AmPartner }) {
  const milestoneData = [
    {
      level: 1 as MilestoneLevel,
      date: partner.milestone_dates.m1_contract_signed,
      label: "Contract",
    },
    {
      level: 2 as MilestoneLevel,
      date: partner.milestone_dates.m2_training_completed,
      label: "Training",
    },
    {
      level: 3 as MilestoneLevel,
      date: partner.milestone_dates.m3_first_order,
      label: "1e Bestelling",
    },
    {
      level: 4 as MilestoneLevel,
      date: partner.milestone_dates.m4_proven,
      label: "3x Besteld",
    },
    {
      level: 5 as MilestoneLevel,
      date: partner.milestone_dates.m5_certified,
      label: "Gecertificeerd",
    },
  ];

  return (
    <div className="bg-white rounded-[14px] p-4 border border-quatt-border-light shadow-card">
      <h3 className="font-semibold text-sm mb-3 tracking-[-0.04em]">
        Voortgang
      </h3>
      <div className="flex items-center gap-1">
        {milestoneData.map((m, i) => {
          const achieved = m.date !== null;
          const isCurrent = m.level === partner.current_milestone;
          return (
            <div key={m.level} className="flex-1 flex flex-col items-center">
              <div className="flex items-center w-full">
                {i > 0 && (
                  <div
                    className={`flex-1 h-0.5 ${achieved ? "bg-quatt-green" : "bg-quatt-grey"}`}
                  />
                )}
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                    achieved
                      ? "bg-quatt-green text-white"
                      : isCurrent
                        ? "bg-quatt-orange text-white"
                        : "bg-quatt-grey text-quatt-text-secondary"
                  }`}
                >
                  {m.level}
                </div>
                {i < milestoneData.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 ${achieved && milestoneData[i + 1]?.date ? "bg-quatt-green" : "bg-quatt-grey"}`}
                  />
                )}
              </div>
              <span className="text-[9px] mt-1 text-center text-quatt-text-secondary leading-tight">
                {m.label}
              </span>
              {m.date && (
                <span className="text-[8px] text-quatt-green font-medium">
                  {new Date(m.date).toLocaleDateString("nl-NL", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
