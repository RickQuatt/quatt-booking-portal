import { useState, useEffect } from "react";
import { Link } from "wouter";
import type { MilestoneLevel } from "@/lib/partner-types";
import { MILESTONE_SHORT } from "@/lib/partner-types";

interface AmPerformance {
  name: string;
  email: string;
  partners: number;
  contacted_this_week: number;
  progressed_this_week: number;
  stuck_partners: number;
  distribution: Record<MilestoneLevel, number>;
}

interface DashboardData {
  am_performance: AmPerformance[];
  total_partners: number;
  total_stuck: number;
  total_progressed: number;
  new_leads: number;
  escalations: Array<{
    id: string;
    name: string;
    contact_name: string | null;
    current_milestone: MilestoneLevel;
    days_at_milestone: number;
    days_since_contact: number;
  }>;
  velocity: Array<{
    transition: string;
    avg_days: number;
    target: number;
  }>;
}

export function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/dashboard");
        if (!res.ok) throw new Error("Failed to fetch");
        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error("Failed to load dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-quatt-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <h1 className="text-xl font-bold tracking-[-0.04em] text-quatt-ink">
        Team Dashboard
      </h1>
      <p className="text-sm text-quatt-text-secondary mt-0.5">
        {new Date().toLocaleDateString("nl-NL", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>

      <div>
        {/* Top-level KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <div className="bg-white rounded-[14px] p-5 border border-quatt-border-light shadow-card">
            <p className="text-[10px] text-quatt-text-secondary uppercase tracking-wide">
              Totaal partners
            </p>
            <p className="text-2xl font-bold mt-1">{data.total_partners}</p>
          </div>
          <div className="bg-white rounded-[14px] p-5 border border-quatt-border-light shadow-card">
            <p className="text-[10px] text-quatt-text-secondary uppercase tracking-wide">
              Vooruit deze week
            </p>
            <p className="text-2xl font-bold text-quatt-green mt-1">
              {data.total_progressed}
            </p>
          </div>
          <div className="bg-white rounded-[14px] p-5 border border-quatt-border-light shadow-card">
            <p className="text-[10px] text-quatt-text-secondary uppercase tracking-wide">
              Partners vast
            </p>
            <p
              className={`text-2xl font-bold mt-1 ${data.total_stuck > 5 ? "text-quatt-red" : ""}`}
            >
              {data.total_stuck}
            </p>
          </div>
          <div className="bg-white rounded-[14px] p-5 border border-quatt-border-light shadow-card">
            <p className="text-[10px] text-quatt-text-secondary uppercase tracking-wide">
              Nieuwe leads
            </p>
            <p
              className={`text-2xl font-bold mt-1 ${data.new_leads > 3 ? "text-quatt-orange" : ""}`}
            >
              {data.new_leads}
            </p>
          </div>
        </div>

        {/* AM Performance comparison */}
        <div className="bg-white rounded-[14px] p-5 border border-quatt-border-light shadow-card mt-4">
          <h3 className="font-semibold text-sm mb-3 tracking-[-0.04em]">
            AM Performance
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-quatt-text-secondary border-b border-quatt-grey">
                  <th className="text-left pb-2 font-medium">AM</th>
                  <th className="text-right pb-2 font-medium">Partners</th>
                  <th className="text-right pb-2 font-medium">Gebeld</th>
                  <th className="text-right pb-2 font-medium">Vooruit</th>
                  <th className="text-right pb-2 font-medium">Vast</th>
                  {([0, 1, 2, 3, 4, 5] as MilestoneLevel[]).map((m) => (
                    <th key={m} className="text-right pb-2 font-medium">
                      {MILESTONE_SHORT[m]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.am_performance.map((am) => (
                  <tr
                    key={am.email}
                    className="border-b border-quatt-grey last:border-0"
                  >
                    <td className="py-2 font-semibold">{am.name}</td>
                    <td className="py-2 text-right">{am.partners}</td>
                    <td className="py-2 text-right">
                      {am.contacted_this_week}
                    </td>
                    <td className="py-2 text-right text-quatt-green font-semibold">
                      {am.progressed_this_week}
                    </td>
                    <td
                      className={`py-2 text-right font-semibold ${am.stuck_partners > 4 ? "text-quatt-red" : ""}`}
                    >
                      {am.stuck_partners}
                    </td>
                    {([0, 1, 2, 3, 4, 5] as MilestoneLevel[]).map((m) => (
                      <td
                        key={m}
                        className="py-2 text-right text-quatt-text-secondary"
                      >
                        {am.distribution[m] || 0}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pipeline velocity */}
        {data.velocity.length > 0 && (
          <div className="bg-white rounded-[14px] p-5 border border-quatt-border-light shadow-card mt-4">
            <h3 className="font-semibold text-sm mb-3 tracking-[-0.04em]">
              Pipeline Snelheid (gem. dagen per transitie)
            </h3>
            <div className="space-y-2">
              {data.velocity.map((v) => {
                const overTarget = v.avg_days > v.target;
                return (
                  <div key={v.transition} className="flex items-center gap-3">
                    <span className="text-xs font-medium w-20">
                      {v.transition}
                    </span>
                    <div className="flex-1 bg-quatt-grey rounded-full h-3 relative">
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-quatt-black opacity-30"
                        style={{
                          left: `${Math.min((v.target / 90) * 100, 100)}%`,
                        }}
                      />
                      <div
                        className={`h-3 rounded-full ${overTarget ? "bg-quatt-orange" : "bg-quatt-green"}`}
                        style={{
                          width: `${Math.min((v.avg_days / 90) * 100, 100)}%`,
                        }}
                      />
                    </div>
                    <span
                      className={`text-xs font-semibold w-16 text-right ${overTarget ? "text-quatt-orange" : "text-quatt-green"}`}
                    >
                      {v.avg_days}d / {v.target}d
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Escalations */}
        {data.escalations.length > 0 && (
          <div className="bg-white rounded-[14px] p-5 border border-quatt-border-light shadow-card mt-4">
            <h3 className="font-semibold text-sm mb-3 text-quatt-red">
              Aandacht nodig ({data.escalations.length})
            </h3>
            <div className="space-y-2">
              {data.escalations.map((p) => (
                <Link
                  key={p.id}
                  href={`/partners/${p.id}`}
                  className="flex items-center justify-between bg-quatt-error-bg rounded-[12px] px-3 py-2 hover:bg-quatt-error-bg/80 transition-colors"
                >
                  <div>
                    <span className="text-xs font-semibold">
                      {p.contact_name || p.name}
                    </span>
                    <span className="text-[10px] text-quatt-text-secondary ml-2">
                      {p.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-quatt-error-text font-medium block">
                      {p.days_at_milestone}d at{" "}
                      {MILESTONE_SHORT[p.current_milestone]}
                    </span>
                    <span className="text-[10px] text-quatt-text-secondary">
                      {p.days_since_contact < 999
                        ? `${p.days_since_contact}d no contact`
                        : "Never contacted"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Quick nav */}
        <div className="mt-4 flex gap-2 mb-4">
          <Link
            href="/partners"
            className="flex-1 bg-quatt-forest text-white rounded-full py-3 text-center text-sm font-semibold"
          >
            Partner Overzicht
          </Link>
          <Link
            href="/calls"
            className="flex-1 bg-quatt-orange text-white rounded-full py-3 text-center text-sm font-semibold"
          >
            Bellijst
          </Link>
        </div>
      </div>
    </div>
  );
}
