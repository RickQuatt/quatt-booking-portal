import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { apiFetch } from "@/hooks/useAuth";
import { TaskCard } from "@/components/shared/TaskCard";
import type { TaskCardData } from "@/components/shared/TaskCard";

interface TaskGroup {
  category: string;
  label: string;
  tasks: TaskCardData[];
}

interface TodayResponse {
  view: "today";
  total: number;
  tasks: TaskCardData[];
}

interface AllResponse {
  view: "all";
  total: number;
  groups: TaskGroup[];
}

export function TasksPage() {
  const [tab, setTab] = useState<"today" | "all">("today");
  const [todayData, setTodayData] = useState<TodayResponse | null>(null);
  const [allData, setAllData] = useState<AllResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load today view on mount
  useEffect(() => {
    async function load() {
      try {
        const res = await apiFetch("/api/tasks?view=today");
        if (!res.ok) {
          setError("Kon taken niet laden");
          return;
        }
        const data = await res.json();
        setTodayData(data);
      } catch {
        setError("Kon taken niet laden");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Lazy-load all tasks when tab switches
  useEffect(() => {
    if (tab !== "all" || allData) return;
    async function loadAll() {
      try {
        const res = await apiFetch("/api/tasks?view=all");
        if (!res.ok) return;
        const data = await res.json();
        setAllData(data);
      } catch {
        // Silently fail -- today view still works
      }
    }
    loadAll();
  }, [tab, allData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-quatt-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-quatt-text-secondary">{error}</p>
      </div>
    );
  }

  const todayCount = todayData?.tasks.length ?? 0;
  const totalCount = todayData?.total ?? 0;

  return (
    <div>
      <h1 className="text-xl font-bold tracking-[-0.04em] text-quatt-ink dark:text-foreground">
        Taken
      </h1>

      {/* Tab bar */}
      <div className="flex gap-1 mt-3 bg-quatt-bg-subtle dark:bg-muted rounded-lg p-1">
        <button
          onClick={() => setTab("today")}
          className={`flex-1 text-sm font-medium px-3 py-1.5 rounded-md transition-all ${
            tab === "today"
              ? "bg-white dark:bg-card text-quatt-ink dark:text-foreground shadow-sm"
              : "text-quatt-text-secondary hover:text-quatt-ink dark:hover:text-foreground"
          }`}
        >
          Vandaag ({todayCount})
        </button>
        <button
          onClick={() => setTab("all")}
          className={`flex-1 text-sm font-medium px-3 py-1.5 rounded-md transition-all ${
            tab === "all"
              ? "bg-white dark:bg-card text-quatt-ink dark:text-foreground shadow-sm"
              : "text-quatt-text-secondary hover:text-quatt-ink dark:hover:text-foreground"
          }`}
        >
          Alle taken ({totalCount})
        </button>
      </div>

      {/* Today tab */}
      {tab === "today" && (
        <TodayView tasks={todayData?.tasks ?? []} total={totalCount} onViewAll={() => setTab("all")} />
      )}

      {/* All tasks tab */}
      {tab === "all" && (
        <AllTasksView groups={allData?.groups ?? []} loading={!allData} />
      )}
    </div>
  );
}

function TodayView({
  tasks,
  total,
  onViewAll,
}: {
  tasks: TaskCardData[];
  total: number;
  onViewAll: () => void;
}) {
  if (tasks.length === 0) {
    return (
      <div className="mt-8 text-center">
        <p className="text-quatt-text-secondary">
          Geen openstaande taken -- alles bijgewerkt!
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-2">
      {tasks.map((task, i) => (
        <TaskCard key={`${task.partner_id}-${task.type}-${i}`} task={task} />
      ))}

      {total > tasks.length && (
        <button
          onClick={onViewAll}
          className="w-full text-center text-sm text-quatt-text-secondary hover:text-quatt-ink dark:hover:text-foreground py-3 transition-colors"
        >
          Nog {total - tasks.length} taken bekijken
        </button>
      )}
    </div>
  );
}

function AllTasksView({ groups, loading }: { groups: TaskGroup[]; loading: boolean }) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  if (loading) {
    return (
      <div className="mt-8 flex justify-center">
        <div className="w-6 h-6 border-2 border-quatt-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="mt-8 text-center">
        <p className="text-quatt-text-secondary">Geen taken gevonden</p>
      </div>
    );
  }

  const toggleGroup = (category: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  // Group tasks within each group by type
  function getSubGroups(tasks: TaskCardData[]): { type: string; label: string; tasks: TaskCardData[] }[] {
    const byType = new Map<string, TaskCardData[]>();
    for (const task of tasks) {
      const existing = byType.get(task.type) ?? [];
      existing.push(task);
      byType.set(task.type, existing);
    }
    return Array.from(byType.entries()).map(([type, typeTasks]) => ({
      type,
      label: typeTasks[0].label,
      tasks: typeTasks,
    }));
  }

  return (
    <div className="mt-4 space-y-3">
      {groups.map((group) => {
        const isExpanded = expandedGroups.has(group.category);
        const subGroups = getSubGroups(group.tasks);

        return (
          <div
            key={group.category}
            className="bg-white dark:bg-card rounded-[14px] border border-quatt-border-light dark:border-border overflow-hidden"
          >
            <button
              onClick={() => toggleGroup(group.category)}
              className="w-full flex items-center justify-between p-4 hover:bg-quatt-bg-subtle/50 dark:hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-quatt-ink dark:text-foreground">
                  {group.label}
                </span>
                <span className="text-xs bg-quatt-bg-subtle dark:bg-muted text-quatt-text-secondary px-2 py-0.5 rounded-full">
                  {group.tasks.length}
                </span>
              </div>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-quatt-text-secondary" />
              ) : (
                <ChevronDown className="h-4 w-4 text-quatt-text-secondary" />
              )}
            </button>

            {isExpanded && (
              <div className="px-4 pb-4 space-y-3">
                {subGroups.map((sub) => (
                  <div key={sub.type}>
                    {subGroups.length > 1 && (
                      <p className="text-xs font-medium text-quatt-text-secondary mb-1.5">
                        {sub.label} ({sub.tasks.length})
                      </p>
                    )}
                    <div className="space-y-2">
                      {sub.tasks.map((task, i) => (
                        <TaskCard
                          key={`${task.partner_id}-${task.type}-${i}`}
                          task={task}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
