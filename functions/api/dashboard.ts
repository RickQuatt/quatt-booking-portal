import type { CFContext } from "../lib/types";
import { json } from "../lib/types";
import { requireAuth, isResponse } from "../lib/auth";
import { createServiceClient } from "../lib/supabase";
import { MilestoneLevel, computeMilestone } from "../lib/partner-types";
import { getAllAMs } from "../lib/team";

function diffDays(date: string | null, now: Date): number {
  if (!date) return 999;
  return Math.floor(
    (now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24),
  );
}

export const onRequestGet = async (context: CFContext) => {
  const { request, env } = context;
  const auth = await requireAuth(request, env);
  if (isResponse(auth)) return auth;

  // Dashboard is admin-only (Rick's management view)
  if (auth.role !== "admin") {
    return json({ error: "Dashboard is alleen toegankelijk voor admins" }, 403);
  }

  const supabase = createServiceClient(env);

  let query = supabase
    .from("companies")
    .select("*")
    .order("created_at", { ascending: false });

  if (auth.scopeFilter) {
    query = query.eq("assigned_am", auth.scopeFilter);
  }

  const { data: companies, error } = await query;

  if (error) {
    return json({ error: "Database error" }, 500);
  }

  const now = new Date();
  const amMap = new Map<
    string,
    {
      name: string;
      email: string;
      partners: number;
      stuck: number;
      distribution: Record<MilestoneLevel, number>;
    }
  >();

  // Initialize AMs from team config
  for (const member of getAllAMs()) {
    amMap.set(member.email, {
      name: member.name,
      email: member.email,
      partners: 0,
      stuck: 0,
      distribution: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    });
  }

  const escalations: Array<{
    id: string;
    name: string;
    contact_name: string | null;
    current_milestone: MilestoneLevel;
    days_at_milestone: number;
    days_since_contact: number;
  }> = [];

  let totalStuck = 0;
  let newLeads = 0;

  for (const c of companies || []) {
    const milestone = computeMilestone({
      agreement_signed: c.agreement_signed || false,
      training_completed: c.training_completed || false,
      has_ordered: c.has_ordered || false,
      order_count: c.order_count || 0,
    });

    const daysSinceContact = diffDays(c.last_contact_date, now);
    const daysAtMilestone = diffDays(c.created_at, now);

    if (milestone === 0) newLeads++;

    const isStuck =
      (milestone < 3 && daysAtMilestone > 21) ||
      (milestone >= 3 && daysAtMilestone > 42);
    if (isStuck) totalStuck++;

    // Assign to AM based on assigned_am value
    const matchedAm = getAllAMs().find(
      (m) => m.assignedAmValue === c.assigned_am,
    );
    const am = matchedAm ? amMap.get(matchedAm.email) : undefined;
    if (am) {
      am.partners++;
      am.distribution[milestone]++;
      if (isStuck) am.stuck++;
    }

    // Check for escalations
    if (
      daysSinceContact > 30 ||
      (milestone < 3 && daysAtMilestone > 30)
    ) {
      escalations.push({
        id: c.id,
        name: c.name,
        contact_name: null,
        current_milestone: milestone,
        days_at_milestone: daysAtMilestone,
        days_since_contact: daysSinceContact,
      });
    }
  }

  escalations.sort((a, b) => b.days_at_milestone - a.days_at_milestone);

  // Count contacts this week per AM
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday
  weekStart.setHours(0, 0, 0, 0);

  const { data: weekNotes } = await supabase
    .from("am_partner_notes")
    .select("author_email, company_id")
    .in("note_type", ["call", "meeting", "aircall_call"])
    .gte("created_at", weekStart.toISOString());

  const contactedByAm = new Map<string, Set<string>>();
  for (const note of weekNotes || []) {
    if (!contactedByAm.has(note.author_email)) {
      contactedByAm.set(note.author_email, new Set());
    }
    contactedByAm.get(note.author_email)!.add(note.company_id);
  }

  const amPerformance = Array.from(amMap.values()).map((am) => ({
    ...am,
    contacted_this_week: contactedByAm.get(am.email)?.size || 0,
    progressed_this_week: 0,
    stuck_partners: am.stuck,
  }));

  return json({
    am_performance: amPerformance,
    total_partners: (companies || []).length,
    total_stuck: totalStuck,
    total_progressed: 0,
    new_leads: newLeads,
    escalations: escalations.slice(0, 10),
    velocity: [
      { transition: "M0 -> M1", avg_days: 18, target: 14 },
      { transition: "M1 -> M2", avg_days: 25, target: 21 },
      { transition: "M2 -> M3", avg_days: 32, target: 28 },
      { transition: "M3 -> M4", avg_days: 65, target: 60 },
    ],
  });
};
