import type { CFContext } from "../../lib/types";
import { json } from "../../lib/types";
import { requireAuth, isResponse } from "../../lib/auth";
import { createServiceClient } from "../../lib/supabase";
import {
  AmPartner,
  AmStats,
  AmCallQueueItem,
  MilestoneLevel,
  computeMilestone,
  computePriority,
} from "../../lib/partner-types";

function diffDays(date: string | null, now: Date): number {
  if (!date) return 999;
  return Math.floor(
    (now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24),
  );
}

function buildPartner(row: Record<string, unknown>, now: Date): AmPartner {
  const daysSinceContact = diffDays(
    row.last_contact_date as string | null,
    now,
  );
  const daysAtMilestone = diffDays(row.created_at as string, now); // TODO: track milestone change date

  // Map existing portal columns (onboarding_*) to AM toolkit fields
  const agreementSigned =
    (row.onboarding_agreement_signed as boolean) || false;
  const trainingBooked = (row.onboarding_training_booked as boolean) || false;
  const trainingCompleted =
    (row.onboarding_training_completed as boolean) || false;
  const portalAccess = (row.portal_access as boolean) || false;
  const hasOrdered = (row.has_ordered as boolean) || false;

  const milestone = computeMilestone({
    agreement_signed: agreementSigned,
    training_completed: trainingCompleted,
    has_ordered: hasOrdered,
    order_count: (row.order_count as number) || 0,
  });

  const priority = computePriority({
    days_since_contact: daysSinceContact,
    days_at_milestone: daysAtMilestone,
    current_milestone: milestone,
  });

  return {
    id: row.id as string,
    hubspot_deal_id: row.hubspot_deal_id as string | null,
    name: row.name as string,
    contact_name: (row.contact_name as string) || null,
    contact_email: null,
    contact_phone: (row.contact_phone as string) || null,
    city:
      (row.business_address as Record<string, string>)?.city || null,
    postcode:
      (row.business_address as Record<string, string>)?.postal_code || null,
    region: null,

    current_milestone: milestone,
    agreement_signed: agreementSigned,
    training_booked: trainingBooked,
    training_completed: trainingCompleted,
    portal_access: portalAccess,
    has_ordered: hasOrdered,

    milestone_dates: {
      m1_contract_signed: null,
      m2_training_completed: null,
      m3_first_order: null,
      m4_proven: null,
      m5_certified: null,
    },

    last_contact_date: row.last_contact_date as string | null,
    last_contact_method: null,
    last_note: null,
    days_since_contact: daysSinceContact,
    days_at_milestone: daysAtMilestone,

    deal_stage: row.deal_stage as string | null,
    assigned_am: row.assigned_am as string | null,
    hubspot_owner_id: row.hubspot_owner_id as string | null,

    priority: priority.level,
    priority_reason: priority.reason,
    priority_score: priority.score,

    order_count: (row.order_count as number) || 0,
    total_revenue: (row.total_revenue as number) || 0,

    quality_check_status: null,
    customer_calls_made: 0,

    created_at: row.created_at as string,
  };
}

function buildCallQueue(partners: AmPartner[]): AmCallQueueItem[] {
  return partners
    .filter((p) => p.priority === "high" || p.priority === "medium")
    .sort((a, b) => b.priority_score - a.priority_score)
    .map((partner) => {
      let suggestedAction = "Bel partner";
      let context = `${partner.days_since_contact}d geen contact`;

      switch (partner.current_milestone) {
        case 0:
          suggestedAction = "Kennismaking plannen";
          context = "Nieuwe lead, nog geen contact gehad";
          break;
        case 1:
          suggestedAction = "Training inplannen";
          context = "Contract getekend, wacht op training";
          break;
        case 2:
          suggestedAction = "Eerste bestelling bespreken";
          context = "Getraind, nog geen bestelling";
          break;
        case 3:
          suggestedAction = "Voortgang checken";
          context = `${partner.order_count} bestelling(en), doorgroeien naar proven`;
          break;
        default:
          suggestedAction = "Check-in gesprek";
          context = `${partner.days_since_contact}d geen contact`;
      }

      return {
        partner,
        reason: partner.priority_reason,
        suggested_action: suggestedAction,
        context,
      };
    });
}

async function buildStats(
  partners: AmPartner[],
  scopeFilter: string | null,
  env: import("../../lib/types").Env,
): Promise<AmStats> {
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

  for (const p of partners) {
    distribution[p.current_milestone]++;
    if (
      (p.current_milestone < 3 && p.days_at_milestone > 21) ||
      (p.current_milestone >= 3 && p.days_at_milestone > 42)
    ) {
      stuck++;
    }
    if (p.current_milestone === 0) newLeads++;
  }

  // Count contacts this week from am_partner_notes
  const supabase = createServiceClient(env);
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday
  weekStart.setHours(0, 0, 0, 0);

  const partnerIds = partners.map((p) => p.id);
  let contactedCount = 0;

  if (partnerIds.length > 0) {
    const { data: notes } = await supabase
      .from("am_partner_notes")
      .select("company_id")
      .in("company_id", partnerIds)
      .in("note_type", ["call", "meeting", "aircall_call"])
      .gte("created_at", weekStart.toISOString());

    if (notes) {
      const uniqueCompanies = new Set(notes.map((n) => n.company_id));
      contactedCount = uniqueCompanies.size;
    }
  }

  return {
    total_partners: partners.length,
    milestone_distribution: distribution,
    contacted_this_week: contactedCount,
    progressed_this_week: 0, // TODO: track milestone change events
    stuck_partners: stuck,
    new_leads: newLeads,
  };
}

export const onRequestGet = async (context: CFContext) => {
  const { request, env } = context;
  const auth = await requireAuth(request, env);
  if (isResponse(auth)) return auth;

  const supabase = createServiceClient(env);
  const url = new URL(request.url);
  const view = url.searchParams.get("view");

  let query = supabase
    .from("companies")
    .select("*")
    .order("created_at", { ascending: false });

  if (auth.scopeFilter) {
    query = query.eq("assigned_am", auth.scopeFilter);
  }

  const { data: companies, error } = await query;

  if (error) {
    console.error("[AM] Failed to fetch companies:", error);
    return json({ error: "Database error" }, 500);
  }

  const now = new Date();
  const partners = (companies || []).map((row) =>
    buildPartner(row as Record<string, unknown>, now),
  );
  const stats = await buildStats(partners, auth.scopeFilter, env);

  if (view === "calls") {
    return json({ call_queue: buildCallQueue(partners) });
  }

  return json({ partners, stats });
};
