import type { ComputedTask } from "./task-engine";
import { getTier, getCategory } from "./task-tiers";
import { isNearby } from "./postcode-proximity";

export interface CuratedTask extends ComputedTask {
  slot: string;
  is_nearby: boolean;
  postcode: string | null;
}

interface CuratorInput {
  tasks: ComputedTask[];
  amPostcodePrefix: string | null;
  /** Map of partner_id -> postcode for proximity lookups */
  partnerPostcodes: Map<string, string | null>;
}

const MAX_TASKS = 8;
const MAX_SAME_TYPE = 2;

/**
 * Curate a diverse set of max 8 tasks from the full task pool.
 *
 * Fills named "slots" to ensure variety:
 * 1-2: Highest tier tasks (critical/escalation)
 * 3:   Cold call lead
 * 4-5: Onboarding tasks (different types)
 * 6:   Relationship maintenance
 * 7:   Nearby partner
 * 8:   Wildcard (type not yet represented)
 */
export function curateTasks(input: CuratorInput): CuratedTask[] {
  const { tasks, amPostcodePrefix, partnerPostcodes } = input;

  if (tasks.length === 0) return [];

  // Sort all tasks by tier (ascending = most critical first), then by priority
  const sorted = [...tasks].sort((a, b) => {
    const tierDiff = getTier(a) - getTier(b);
    if (tierDiff !== 0) return tierDiff;
    if (a.priority === "high" && b.priority !== "high") return -1;
    if (a.priority !== "high" && b.priority === "high") return 1;
    return 0;
  });

  const result: CuratedTask[] = [];
  const usedPartners = new Set<string>();
  const typeCounts = new Map<string, number>();

  function canUse(task: ComputedTask): boolean {
    if (usedPartners.has(task.partner_id)) return false;
    if ((typeCounts.get(task.type) ?? 0) >= MAX_SAME_TYPE) return false;
    return true;
  }

  function addTask(task: ComputedTask, slot: string): void {
    const postcode = partnerPostcodes.get(task.partner_id) ?? null;
    result.push({
      ...task,
      slot,
      is_nearby: isNearby(amPostcodePrefix, postcode),
      postcode,
    });
    usedPartners.add(task.partner_id);
    typeCounts.set(task.type, (typeCounts.get(task.type) ?? 0) + 1);
  }

  // --- Slot 1-2: Highest tier tasks ---
  for (const task of sorted) {
    if (result.length >= 2) break;
    if (getTier(task) <= 2 && canUse(task)) {
      addTask(task, result.length === 0 ? "priority_1" : "priority_2");
    }
  }

  // --- Slot 3: Cold call lead ---
  if (result.length < MAX_TASKS) {
    const coldCall = sorted.find(
      (t) => getCategory(t) === "cold_call" && canUse(t),
    );
    if (coldCall) {
      addTask(coldCall, "cold_call");
    }
  }

  // --- Slot 4-5: Onboarding tasks (different types) ---
  const onboardingTypes = new Set<string>();
  for (const task of sorted) {
    if (result.length >= MAX_TASKS) break;
    if (onboardingTypes.size >= 2) break;
    if (
      getCategory(task) === "onboarding" &&
      canUse(task) &&
      !onboardingTypes.has(task.type)
    ) {
      onboardingTypes.add(task.type);
      addTask(task, `onboarding_${onboardingTypes.size}`);
    }
  }

  // --- Slot 6: Relationship task ---
  if (result.length < MAX_TASKS) {
    const relationship = sorted.find(
      (t) => getCategory(t) === "relationship" && canUse(t),
    );
    if (relationship) {
      addTask(relationship, "relationship");
    }
  }

  // --- Slot 7: Nearby partner (any task type) ---
  if (result.length < MAX_TASKS && amPostcodePrefix) {
    const nearby = sorted.find((t) => {
      if (!canUse(t)) return false;
      const pc = partnerPostcodes.get(t.partner_id);
      return isNearby(amPostcodePrefix, pc ?? null);
    });
    if (nearby) {
      addTask(nearby, "nearby");
    }
  }

  // --- Slot 8: Wildcard (type not yet represented) ---
  if (result.length < MAX_TASKS) {
    const representedTypes = new Set(result.map((t) => t.type));
    const wildcard = sorted.find(
      (t) => canUse(t) && !representedTypes.has(t.type),
    );
    if (wildcard) {
      addTask(wildcard, "wildcard");
    }
  }

  // If we still have slots and there are more high-priority tasks, fill remaining
  for (const task of sorted) {
    if (result.length >= MAX_TASKS) break;
    if (canUse(task)) {
      addTask(task, "extra");
    }
  }

  return result;
}

/** Group tasks by category for the "all tasks" view */
export interface TaskGroup {
  category: string;
  label: string;
  tasks: ComputedTask[];
}

const GROUP_ORDER: [string, string[]][] = [
  ["Urgent", ["eerste_installatie_bezoek", "kwaliteitscheck_opvolgen", "training_no_show"]],
  ["Leads", ["eerste_contact", "opvolgen_eerste_contact"]],
  [
    "Onboarding",
    [
      "overeenkomst_check",
      "training_inplannen",
      "portal_toegang",
      "eerste_bestelling_opvolgen",
    ],
  ],
  [
    "Actieve partners",
    ["follow_up", "groei_check", "eerste_installatie_checkin", "kwaliteitscheck"],
  ],
  ["Inactief", ["partner_opvolgen"]],
];

export function groupTasks(tasks: ComputedTask[]): TaskGroup[] {
  const groups: TaskGroup[] = [];

  for (const [label, types] of GROUP_ORDER) {
    const typeSet = new Set(types);
    const matching = tasks.filter((t) => typeSet.has(t.type));
    if (matching.length > 0) {
      groups.push({ category: label.toLowerCase().replace(/\s/g, "_"), label, tasks: matching });
    }
  }

  // Catch any uncategorized tasks
  const allKnown = new Set(GROUP_ORDER.flatMap(([, types]) => types));
  const uncategorized = tasks.filter((t) => !allKnown.has(t.type));
  if (uncategorized.length > 0) {
    groups.push({ category: "overig", label: "Overig", tasks: uncategorized });
  }

  return groups;
}
