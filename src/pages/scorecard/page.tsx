import { useState, useEffect } from "react";
import type { AmStats, MilestoneLevel } from "@/lib/partner-types";
import { MILESTONE_LABELS } from "@/lib/partner-types";

interface CallStats {
  calls_this_week: number;
  calls_this_month: number;
  avg_duration: number;
  missed_calls: number;
}

export function ScorecardPage() {
  const [stats, setStats] = useState<AmStats | null>(null);
  const [callStats, setCallStats] = useState<CallStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, callsRes] = await Promise.all([
          fetch("/api/stats"),
          fetch("/api/aircall?page=1"),
        ]);
        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats(data.stats);
        }
        if (callsRes.ok) {
          const data = await callsRes.json();
          const calls = data.calls || [];
          const now = new Date();
          const weekStart = new Date(now);
          weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
          weekStart.setHours(0, 0, 0, 0);
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

          const thisWeek = calls.filter(
            (c: { started_at: number }) =>
              new Date(c.started_at * 1000) >= weekStart,
          );
          const thisMonth = calls.filter(
            (c: { started_at: number }) =>
              new Date(c.started_at * 1000) >= monthStart,
          );
          const answered = calls.filter(
            (c: { duration: number; missed_call_reason: string | null }) =>
              c.duration > 0 && !c.missed_call_reason,
          );
          const avgDur =
            answered.length > 0
              ? Math.round(
                  answered.reduce(
                    (sum: number, c: { duration: number }) => sum + c.duration,
                    0,
                  ) / answered.length,
                )
              : 0;
          const missed = calls.filter(
            (c: { missed_call_reason: string | null }) => c.missed_call_reason,
          ).length;

          setCallStats({
            calls_this_week: thisWeek.length,
            calls_this_month: thisMonth.length,
            avg_duration: avgDur,
            missed_calls: missed,
          });
        }
      } catch (err) {
        console.error("Failed to load stats:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-quatt-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const progressBar = (actual: number, target: number) => {
    const pct = Math.min((actual / target) * 100, 100);
    const color =
      pct >= 100
        ? "bg-quatt-green"
        : pct >= 60
          ? "bg-quatt-yellow"
          : "bg-quatt-red";
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-quatt-grey rounded-full h-2">
          <div
            className={`${color} h-2 rounded-full transition-colors duration-150`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-xs font-semibold w-12 text-right">
          {actual}/{target}
        </span>
      </div>
    );
  };

  const weekNumber = Math.ceil(
    (new Date().getTime() -
      new Date(new Date().getFullYear(), 0, 1).getTime()) /
      (7 * 24 * 60 * 60 * 1000),
  );

  return (
    <div>
      {/* Header */}
      <h1 className="text-xl font-bold tracking-[-0.04em] text-quatt-ink">
        Mijn Scorecard
      </h1>
      <p className="text-sm text-quatt-text-secondary mt-0.5">
        Week {weekNumber}, {new Date().getFullYear()}
      </p>

      <div>
        {/* Weekly targets */}
        <div className="mt-4">
          <div className="bg-white rounded-[14px] p-5 border border-quatt-border-light shadow-card">
            <h3 className="font-semibold text-sm mb-3 tracking-[-0.04em]">
              Weekdoelen
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-quatt-text-secondary mb-1">
                  Partners gebeld
                </p>
                {progressBar(stats.contacted_this_week, 30)}
              </div>
              <div>
                <p className="text-xs text-quatt-text-secondary mb-1">
                  Milestones vooruit
                </p>
                {progressBar(stats.progressed_this_week, 6)}
              </div>
            </div>
          </div>
        </div>

        {/* Milestone distribution */}
        <div className="mt-3">
          <div className="bg-white rounded-[14px] p-5 border border-quatt-border-light shadow-card">
            <h3 className="font-semibold text-sm mb-3 tracking-[-0.04em]">
              Partner Verdeling
            </h3>
            <div className="space-y-2">
              {([0, 1, 2, 3, 4, 5] as MilestoneLevel[]).map((level) => {
                const count = stats.milestone_distribution[level];
                const pct =
                  stats.total_partners > 0
                    ? (count / stats.total_partners) * 100
                    : 0;
                return (
                  <div key={level} className="flex items-center gap-3">
                    <span className="text-xs font-medium w-24 text-quatt-text-secondary">
                      {MILESTONE_LABELS[level]}
                    </span>
                    <div className="flex-1 bg-quatt-grey rounded-full h-3">
                      <div
                        className={`milestone-${level} h-3 rounded-full transition-colors duration-150`}
                        style={{ width: `${Math.max(pct, 2)}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold w-6 text-right">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Aircall stats */}
        {callStats && (
          <div className="mt-3">
            <div className="bg-white rounded-[14px] p-5 border border-quatt-border-light shadow-card">
              <h3 className="font-semibold text-sm mb-3 tracking-[-0.04em]">
                Aircall Gesprekken
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-2xl font-bold text-quatt-orange">
                    {callStats.calls_this_week}
                  </p>
                  <p className="text-xs text-quatt-text-secondary">
                    Deze week
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-quatt-ink">
                    {callStats.calls_this_month}
                  </p>
                  <p className="text-xs text-quatt-text-secondary">
                    Deze maand
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-quatt-green">
                    {Math.floor(callStats.avg_duration / 60)}m{" "}
                    {callStats.avg_duration % 60}s
                  </p>
                  <p className="text-xs text-quatt-text-secondary">Gem. duur</p>
                </div>
                <div>
                  <p
                    className={`text-2xl font-bold ${callStats.missed_calls > 5 ? "text-quatt-red" : "text-quatt-text-secondary"}`}
                  >
                    {callStats.missed_calls}
                  </p>
                  <p className="text-xs text-quatt-text-secondary">Gemist</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Key metrics */}
        <div className="mt-3 grid grid-cols-2 gap-2 mb-4">
          <div className="bg-white rounded-[14px] p-5 border border-quatt-border-light shadow-card text-center">
            <p className="text-2xl font-bold text-quatt-orange">
              {stats.total_partners}
            </p>
            <p className="text-xs text-quatt-text-secondary mt-0.5">
              Totaal partners
            </p>
          </div>
          <div className="bg-white rounded-[14px] p-5 border border-quatt-border-light shadow-card text-center">
            <p className="text-2xl font-bold text-quatt-green">
              {stats.contacted_this_week}
            </p>
            <p className="text-xs text-quatt-text-secondary mt-0.5">
              Gebeld deze week
            </p>
          </div>
          <div className="bg-white rounded-[14px] p-5 border border-quatt-border-light shadow-card text-center">
            <p className="text-2xl font-bold text-quatt-forest">
              {stats.progressed_this_week}
            </p>
            <p className="text-xs text-quatt-text-secondary mt-0.5">
              Vooruit deze week
            </p>
          </div>
          <div className="bg-white rounded-[14px] p-5 border border-quatt-border-light shadow-card text-center">
            <p
              className={`text-2xl font-bold ${stats.stuck_partners > 3 ? "text-quatt-red" : "text-quatt-text-secondary"}`}
            >
              {stats.stuck_partners}
            </p>
            <p className="text-xs text-quatt-text-secondary mt-0.5">
              Partners vast
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
