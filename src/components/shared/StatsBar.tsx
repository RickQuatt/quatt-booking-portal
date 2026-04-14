import type { AmStats, MilestoneLevel } from "@/lib/partner-types";
import { MILESTONE_SHORT } from "@/lib/partner-types";

export function StatsBar({ stats }: { stats: AmStats }) {
  return (
    <div className="bg-white rounded-[14px] border border-quatt-border-light shadow-card p-4 mt-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-quatt-ink">
          {stats.total_partners} partners
        </span>
        <div className="flex gap-3 text-xs">
          <span className="text-quatt-green font-medium">
            {stats.contacted_this_week} gebeld
          </span>
          <span className="text-quatt-green font-medium">
            {stats.progressed_this_week} vooruit
          </span>
          {stats.stuck_partners > 0 && (
            <span className="text-quatt-red font-medium">
              {stats.stuck_partners} vast
            </span>
          )}
        </div>
      </div>
      <div className="flex gap-1">
        {([0, 1, 2, 3, 4, 5] as MilestoneLevel[]).map((level) => {
          const count = stats.milestone_distribution[level];
          const total = stats.total_partners;
          const pct = total > 0 ? (count / total) * 100 : 0;
          if (count === 0) return null;
          return (
            <div
              key={level}
              className="flex flex-col items-center"
              style={{ width: `${Math.max(pct, 12)}%` }}
            >
              <div className={`milestone-${level} w-full h-1.5 rounded-full`} />
              <span className="text-[10px] mt-0.5 text-quatt-text-secondary">
                {MILESTONE_SHORT[level]}: {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
