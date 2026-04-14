import { useState, useMemo, useEffect } from "react";
import type { AmPartner, AmStats, MilestoneLevel } from "@/lib/partner-types";
import { MILESTONE_SHORT } from "@/lib/partner-types";
import { PartnerCard } from "@/components/shared/PartnerCard";
import { StatsBar } from "@/components/shared/StatsBar";

type SortBy = "priority" | "milestone" | "newest" | "name";
type FilterBy = "all" | "stuck" | "new" | "high" | MilestoneLevel;

export function PartnersPage() {
  const [partners, setPartners] = useState<AmPartner[]>([]);
  const [stats, setStats] = useState<AmStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortBy>("priority");
  const [filterBy, setFilterBy] = useState<FilterBy>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/partners");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setPartners(data.partners);
        setStats(data.stats);
      } catch (err) {
        console.error("Failed to load partners:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    let result = [...partners];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          (p.contact_name || "").toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          (p.city || "").toLowerCase().includes(q),
      );
    }

    if (filterBy === "stuck") {
      result = result.filter(
        (p) =>
          (p.current_milestone < 3 && p.days_at_milestone > 21) ||
          (p.current_milestone >= 3 && p.days_at_milestone > 42),
      );
    } else if (filterBy === "new") {
      result = result.filter((p) => p.current_milestone === 0);
    } else if (filterBy === "high") {
      result = result.filter((p) => p.priority === "high");
    } else if (typeof filterBy === "number") {
      result = result.filter((p) => p.current_milestone === filterBy);
    }

    switch (sortBy) {
      case "priority":
        result.sort((a, b) => b.priority_score - a.priority_score);
        break;
      case "milestone":
        result.sort((a, b) => a.current_milestone - b.current_milestone);
        break;
      case "newest":
        result.sort((a, b) => a.days_at_milestone - b.days_at_milestone);
        break;
      case "name":
        result.sort((a, b) =>
          (a.contact_name || a.name).localeCompare(b.contact_name || b.name),
        );
        break;
    }

    return result;
  }, [partners, sortBy, filterBy, search]);

  if (loading) {
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
        Mijn Partners
      </h1>

      {stats && <StatsBar stats={stats} />}

      {/* Search + Filters */}
      <div className="py-3">
        <input
          type="search"
          placeholder="Zoek partner..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white rounded-[12px] px-4 py-3 text-[16px] border-[1.5px] border-quatt-border-mid focus:border-quatt-orange focus:outline-none transition-colors duration-150 placeholder:text-quatt-text-disabled"
        />

        <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
          {(
            [
              { key: "all" as FilterBy, label: "Alle" },
              { key: "high" as FilterBy, label: "Urgent" },
              { key: "stuck" as FilterBy, label: "Vast" },
              { key: "new" as FilterBy, label: "Nieuw" },
            ] as const
          ).map(({ key, label }) => (
            <button
              key={String(key)}
              onClick={() => setFilterBy(key)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                filterBy === key
                  ? "bg-quatt-orange text-white"
                  : "bg-white text-quatt-text-secondary border border-quatt-grey"
              }`}
            >
              {label}
            </button>
          ))}
          {([0, 1, 2, 3, 4, 5] as MilestoneLevel[]).map((level) => (
            <button
              key={level}
              onClick={() => setFilterBy(level)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                filterBy === level
                  ? "bg-quatt-orange text-white"
                  : "bg-white text-quatt-text-secondary border border-quatt-grey"
              }`}
            >
              {MILESTONE_SHORT[level]}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-quatt-text-secondary">Sorteer:</span>
          {(["priority", "milestone", "newest", "name"] as SortBy[]).map(
            (s) => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={`text-xs font-medium ${
                  sortBy === s
                    ? "text-quatt-orange"
                    : "text-quatt-text-secondary"
                }`}
              >
                {s === "priority"
                  ? "Prioriteit"
                  : s === "milestone"
                    ? "Milestone"
                    : s === "newest"
                      ? "Nieuwste"
                      : "Naam"}
              </button>
            ),
          )}
        </div>
      </div>

      {/* Partner list */}
      <div>
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-quatt-text-secondary text-sm">
            Geen partners gevonden
          </div>
        ) : (
          filtered.map((partner) => (
            <PartnerCard key={partner.id} partner={partner} />
          ))
        )}
      </div>
    </div>
  );
}
