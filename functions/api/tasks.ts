import type { CFContext, Env } from "../lib/types";
import { json } from "../lib/types";
import { requireAuth, isResponse } from "../lib/auth";
import { createServiceClient } from "../lib/supabase";
import { computeMilestone, computePriority } from "../lib/partner-types";
import type { AmPartner } from "../lib/partner-types";
import { computeTasks } from "../lib/task-engine";

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

  const supabase = createServiceClient(env);

  // Fetch partners (scoped)
  let query = supabase
    .from("companies")
    .select("*")
    .order("created_at", { ascending: false });

  if (auth.scopeFilter) {
    query = query.eq("assigned_am", auth.scopeFilter);
  }

  // Exclude lost partners (use or filter to keep NULL deal_stage partners)
  query = query.or("deal_stage.neq.Lost,deal_stage.is.null");

  const { data: companies, error } = await query;
  if (error) {
    return json({ error: "Database error" }, 500);
  }

  const now = new Date();
  const threeDaysAgo = new Date(now);
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  // Batch query: recent contact notes (last 3 days) for all partners
  const partnerIds = (companies || []).map((c) => (c as Record<string, unknown>).id as string);
  const recentContactMap = new Set<string>();

  if (partnerIds.length > 0) {
    const { data: recentNotes } = await supabase
      .from("am_partner_notes")
      .select("company_id")
      .in("company_id", partnerIds)
      .in("note_type", ["call", "meeting", "aircall_call"])
      .gte("created_at", threeDaysAgo.toISOString());

    if (recentNotes) {
      for (const note of recentNotes) {
        recentContactMap.add(note.company_id);
      }
    }
  }

  // Compute tasks for each partner
  const allTasks = [];
  for (const row of companies || []) {
    const c = row as Record<string, unknown>;
    const daysSinceContact = diffDays(c.last_contact_date as string | null, now);
    const daysAtMilestone = diffDays(
      (c.milestone_changed_at || c.created_at) as string,
      now,
    );

    const milestone = computeMilestone({
      agreement_signed: (c.onboarding_agreement_signed as boolean) || false,
      training_completed: (c.onboarding_training_completed as boolean) || false,
      has_ordered: (c.has_ordered as boolean) || false,
      order_count: (c.order_count as number) || 0,
    });

    const priority = computePriority({
      days_since_contact: daysSinceContact,
      days_at_milestone: daysAtMilestone,
      current_milestone: milestone,
    });

    const partner: AmPartner = {
      id: c.id as string,
      hubspot_deal_id: c.hubspot_deal_id as string | null,
      name: c.name as string,
      contact_name: (c.contact_name as string) || null,
      contact_email: null,
      contact_phone: (c.contact_phone as string) || null,
      city: (c.business_address as Record<string, string>)?.city || null,
      postcode: (c.business_address as Record<string, string>)?.postal_code || null,
      region: null,
      current_milestone: milestone,
      agreement_signed: (c.onboarding_agreement_signed as boolean) || false,
      training_booked: (c.onboarding_training_booked as boolean) || false,
      training_completed: (c.onboarding_training_completed as boolean) || false,
      portal_access: (c.portal_access as boolean) || false,
      has_ordered: (c.has_ordered as boolean) || false,
      milestone_dates: {
        m1_contract_signed: null,
        m2_training_completed: null,
        m3_first_order: null,
        m4_proven: null,
        m5_certified: null,
      },
      last_contact_date: c.last_contact_date as string | null,
      last_contact_method: null,
      last_note: null,
      days_since_contact: daysSinceContact,
      days_at_milestone: daysAtMilestone,
      deal_stage: c.deal_stage as string | null,
      assigned_am: c.assigned_am as string | null,
      hubspot_owner_id: c.hubspot_owner_id as string | null,
      priority: priority.level,
      priority_reason: priority.reason,
      priority_score: priority.score,
      order_count: (c.order_count as number) || 0,
      total_revenue: (c.total_revenue as number) || 0,
      quality_check_status: null,
      customer_calls_made: 0,
      created_at: c.created_at as string,
    };

    const hasRecentContact = recentContactMap.has(partner.id);
    const tasks = computeTasks(partner, hasRecentContact);
    allTasks.push(...tasks);
  }

  // Sort: high priority first, then by partner name
  allTasks.sort((a, b) => {
    if (a.priority === "high" && b.priority !== "high") return -1;
    if (a.priority !== "high" && b.priority === "high") return 1;
    return a.partner_name.localeCompare(b.partner_name);
  });

  return json({ tasks: allTasks });
};
