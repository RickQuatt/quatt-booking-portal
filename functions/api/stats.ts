import type { CFContext } from "../lib/types";
import { json } from "../lib/types";
import { requireAuth, isResponse } from "../lib/auth";
import { createServiceClient } from "../lib/supabase";
import { MilestoneLevel, computeMilestone } from "../lib/partner-types";

export const onRequestGet = async (context: CFContext) => {
  const { request, env } = context;
  const auth = await requireAuth(request, env);
  if (isResponse(auth)) return auth;

  const supabase = createServiceClient(env);

  let query = supabase
    .from("companies")
    .select(
      "id, assigned_am, agreement_signed, training_completed, has_ordered, order_count, created_at, last_contact_date",
    )
    .order("created_at", { ascending: false });

  if (auth.scopeFilter) {
    query = query.eq("assigned_am", auth.scopeFilter);
  }

  const { data: companies, error } = await query;

  if (error) {
    return json({ error: "Database error" }, 500);
  }

  const now = new Date();
  const distribution = {
    0: 0,
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  } as Record<MilestoneLevel, number>;
  let stuck = 0;
  let newLeads = 0;

  for (const c of companies || []) {
    const milestone = computeMilestone({
      agreement_signed: c.agreement_signed || false,
      training_completed: c.training_completed || false,
      has_ordered: c.has_ordered || false,
      order_count: c.order_count || 0,
    });
    distribution[milestone]++;
    if (milestone === 0) newLeads++;

    const daysAt = c.created_at
      ? Math.floor(
          (now.getTime() - new Date(c.created_at).getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : 0;
    if (
      (milestone < 3 && daysAt > 21) ||
      (milestone >= 3 && daysAt > 42)
    ) {
      stuck++;
    }
  }

  // Count contacts this week -- scoped to the user's partners
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
  weekStart.setHours(0, 0, 0, 0);

  const companyIds = (companies || [])
    .map((c) => (c as Record<string, unknown>).id)
    .filter(Boolean);
  let contactedCount = 0;
  if (companyIds.length > 0) {
    const { count } = await supabase
      .from("am_partner_notes")
      .select("company_id", { count: "exact", head: true })
      .in("note_type", ["call", "meeting"])
      .in("company_id", companyIds as string[])
      .gte("created_at", weekStart.toISOString());
    contactedCount = count || 0;
  }

  // Count milestone progressions this week
  let progressedCount = 0;
  if (companyIds.length > 0) {
    const { count: milestoneCount } = await supabase
      .from("am_partner_notes")
      .select("id", { count: "exact", head: true })
      .in("company_id", companyIds as string[])
      .eq("note_type", "milestone")
      .gte("created_at", weekStart.toISOString());
    progressedCount = milestoneCount || 0;
  }

  return json({
    stats: {
      total_partners: (companies || []).length,
      milestone_distribution: distribution,
      contacted_this_week: contactedCount,
      progressed_this_week: progressedCount,
      stuck_partners: stuck,
      new_leads: newLeads,
    },
  });
};
