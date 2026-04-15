import type { ComputedTask } from "./task-engine";

/**
 * Task priority tiers determine which tasks fill the curated "today" view.
 * Tier 1 = must-do-today, Tier 4 = can wait.
 */
export type Tier = 1 | 2 | 3 | 4;

const TASK_TIER_MAP: Record<string, Tier> = {
  eerste_installatie_bezoek: 1,
  kwaliteitscheck_opvolgen: 1,
  training_no_show: 1,
  // partner_opvolgen is dynamic -- resolved in getTier()

  eerste_contact: 2,
  opvolgen_eerste_contact: 2,
  eerste_bestelling_opvolgen: 2,

  overeenkomst_check: 3,
  training_inplannen: 3,
  portal_toegang: 3,
  follow_up: 3,
  groei_check: 3,
  partner_opvolgen: 3, // default, escalatie overrides to 1, urgent to 2

  kwaliteitscheck: 4,
  eerste_installatie_checkin: 4,
};

/**
 * Resolve the effective tier for a task.
 * partner_opvolgen has sub-tiers based on the label text.
 */
export function getTier(task: ComputedTask): Tier {
  if (task.type === "partner_opvolgen") {
    if (task.label.includes("ESCALATIE")) return 1;
    if (task.label.includes("dreigt te verliezen")) return 2;
    return 3;
  }

  // opvolgen_eerste_contact escalates when label says "dreigt af te haken"
  if (task.type === "opvolgen_eerste_contact") {
    if (task.label.includes("dreigt af te haken")) return 1;
    return 2;
  }

  // eerste_bestelling_opvolgen escalates on "Loss risico"
  if (task.type === "eerste_bestelling_opvolgen") {
    if (task.label.includes("Loss risico")) return 1;
    return 2;
  }

  return TASK_TIER_MAP[task.type] ?? 3;
}

/** Task categories for the diversity algorithm slot filling */
export type TaskCategory =
  | "critical"
  | "cold_call"
  | "onboarding"
  | "relationship"
  | "nearby"
  | "wildcard";

const COLD_CALL_TYPES = new Set(["eerste_contact", "opvolgen_eerste_contact"]);
const ONBOARDING_TYPES = new Set([
  "overeenkomst_check",
  "training_inplannen",
  "portal_toegang",
  "eerste_bestelling_opvolgen",
  "training_no_show",
]);
const RELATIONSHIP_TYPES = new Set(["follow_up", "groei_check", "eerste_installatie_checkin"]);

export function getCategory(task: ComputedTask): TaskCategory {
  if (getTier(task) <= 1) return "critical";
  if (COLD_CALL_TYPES.has(task.type)) return "cold_call";
  if (ONBOARDING_TYPES.has(task.type)) return "onboarding";
  if (RELATIONSHIP_TYPES.has(task.type)) return "relationship";
  return "wildcard";
}
