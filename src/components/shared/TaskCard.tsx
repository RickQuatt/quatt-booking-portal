import { useState } from "react";
import { Link } from "wouter";
import { Phone, ChevronDown, ChevronUp, MapPin } from "lucide-react";
import { useAuth, apiFetch } from "@/hooks/useAuth";

export interface TaskCardData {
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
  slot?: string;
  is_nearby?: boolean;
  postcode?: string | null;
}

export function TaskCard({ task }: { task: TaskCardData }) {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);

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

  return (
    <div
      className={`bg-white dark:bg-card rounded-[14px] border shadow-card transition-all ${
        task.priority === "high"
          ? "border-quatt-red/30"
          : "border-quatt-border-light dark:border-border"
      }`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {task.priority === "high" && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-quatt-red bg-quatt-red/10 px-1.5 py-0.5 rounded">
                  Urgent
                </span>
              )}
              {task.is_nearby && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded inline-flex items-center gap-0.5">
                  <MapPin className="h-2.5 w-2.5" />
                  In je buurt
                </span>
              )}
              <span className="text-sm font-semibold text-quatt-ink dark:text-foreground truncate">
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
              {task.is_nearby && task.postcode && (
                <span className="ml-1 text-blue-500">-- Postcode {task.postcode}</span>
              )}
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
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-lg hover:bg-quatt-bg-subtle dark:hover:bg-muted transition-colors text-quatt-text-secondary"
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
          <div className="border-t border-quatt-border-light dark:border-border pt-3">
            <p className="text-xs font-semibold text-quatt-ink dark:text-foreground mb-1.5">
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
}
