import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Phone, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth, apiFetch } from "@/hooks/useAuth";

interface ComputedTask {
  type: string;
  label: string;
  partner_id: string;
  partner_name: string;
  contact_name: string | null;
  contact_phone: string | null;
  priority: "high" | "normal";
  due_context: string;
  suggested_action: string;
  assigned_am: string | null;
}

export function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<ComputedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function load() {
      try {
        const res = await apiFetch("/api/tasks");
        if (!res.ok) {
          setError("Kon taken niet laden");
          return;
        }
        const data = await res.json();
        setTasks(data.tasks || []);
      } catch {
        setError("Kon taken niet laden");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

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

  const highPriority = tasks.filter((t) => t.priority === "high");
  const normalPriority = tasks.filter((t) => t.priority === "normal");

  const toggleExpand = (key: string) => {
    setExpandedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleDial = async (phone: string) => {
    if (!user?.hasAircall) {
      window.location.href = `tel:${phone}`;
      return;
    }
    await apiFetch("/api/aircall/dial", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneNumber: phone }),
    });
  };

  const TaskCard = ({ task }: { task: ComputedTask }) => {
    const taskKey = `${task.partner_id}-${task.type}`;
    const isExpanded = expandedTasks.has(taskKey);

    return (
      <div
        className={`bg-white rounded-[14px] border shadow-card transition-all ${
          task.priority === "high"
            ? "border-quatt-red/30"
            : "border-quatt-border-light"
        }`}
      >
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {task.priority === "high" && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-quatt-red bg-quatt-red/10 px-1.5 py-0.5 rounded">
                    Urgent
                  </span>
                )}
                <span className="text-sm font-semibold text-quatt-ink truncate">
                  {task.label}
                </span>
              </div>
              <Link
                href={`/partners/${task.partner_id}`}
                className="text-sm text-quatt-orange hover:underline"
              >
                {task.partner_name}
                {task.contact_name &&
                  task.contact_name !== task.partner_name && (
                    <span className="text-quatt-text-secondary">
                      {" "}
                      ({task.contact_name})
                    </span>
                  )}
              </Link>
              <p className="text-xs text-quatt-text-secondary mt-1">
                {task.due_context}
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {task.contact_phone && (
                <button
                  onClick={() => handleDial(task.contact_phone!)}
                  className="p-2 rounded-lg bg-quatt-green/10 text-quatt-green hover:bg-quatt-green/20 transition-colors"
                  title={`Bel ${task.contact_phone}`}
                >
                  <Phone className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => toggleExpand(taskKey)}
                className="p-2 rounded-lg hover:bg-quatt-bg-subtle transition-colors text-quatt-text-secondary"
                title={isExpanded ? "Inklappen" : "Wat moet ik doen?"}
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {isExpanded && task.suggested_action && (
          <div className="px-4 pb-4 pt-0">
            <div className="border-t border-quatt-border-light pt-3">
              <p className="text-xs font-semibold text-quatt-ink mb-1.5">
                Wat moet ik doen?
              </p>
              <div className="text-xs text-quatt-text-secondary leading-relaxed whitespace-pre-line">
                {task.suggested_action}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <h1 className="text-xl font-bold tracking-[-0.04em] text-quatt-ink">
        Taken
      </h1>
      <p className="text-sm text-quatt-text-secondary mt-0.5">
        {tasks.length} openstaande {tasks.length === 1 ? "taak" : "taken"}
      </p>

      {tasks.length === 0 && (
        <div className="mt-8 text-center">
          <p className="text-quatt-text-secondary">
            Geen openstaande taken -- alles bijgewerkt!
          </p>
        </div>
      )}

      {highPriority.length > 0 && (
        <div className="mt-4">
          <h2 className="text-sm font-semibold text-quatt-red mb-2">
            Urgent ({highPriority.length})
          </h2>
          <div className="space-y-2">
            {highPriority.map((task, i) => (
              <TaskCard
                key={`${task.partner_id}-${task.type}-${i}`}
                task={task}
              />
            ))}
          </div>
        </div>
      )}

      {normalPriority.length > 0 && (
        <div className="mt-4">
          <h2 className="text-sm font-semibold text-quatt-ink mb-2">
            Normaal ({normalPriority.length})
          </h2>
          <div className="space-y-2">
            {normalPriority.map((task, i) => (
              <TaskCard
                key={`${task.partner_id}-${task.type}-${i}`}
                task={task}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
