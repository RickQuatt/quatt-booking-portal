import type { CFContext } from "../../../lib/types";
import { json } from "../../../lib/types";
import { requireAuth, isResponse } from "../../../lib/auth";
import { createServiceClient } from "../../../lib/supabase";
import { computeMilestone, computePriority } from "../../../lib/partner-types";

function diffDays(date: string | null, now: Date): number {
  if (!date) return 999;
  return Math.floor(
    (now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24),
  );
}

export const onRequestGet = async (context: CFContext) => {
  const { request, env, params } = context;
  const auth = await requireAuth(request, env);
  if (isResponse(auth)) return auth;

  const id = params.id;
  const supabase = createServiceClient(env);

  const { data: company, error } = await supabase
    .from("companies")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !company) {
    return json({ error: "Partner not found" }, 404);
  }

  // Ownership check: AMs can only see their own partners
  if (auth.scopeFilter && company.assigned_am !== auth.scopeFilter) {
    return json({ error: "Access denied" }, 403);
  }

  const now = new Date();
  const daysSinceContact = diffDays(company.last_contact_date, now);
  const daysAtMilestone = diffDays(company.created_at, now);

  const milestone = computeMilestone({
    agreement_signed: company.agreement_signed || false,
    training_completed: company.training_completed || false,
    has_ordered: company.has_ordered || false,
    order_count: company.order_count || 0,
  });

  const priority = computePriority({
    days_since_contact: daysSinceContact,
    days_at_milestone: daysAtMilestone,
    current_milestone: milestone,
  });

  // Get latest note
  const { data: latestNote } = await supabase
    .from("am_partner_notes")
    .select("content")
    .eq("company_id", id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const partner = {
    id: company.id,
    hubspot_deal_id: company.hubspot_deal_id,
    name: company.name,
    contact_name: company.contact_name || null,
    contact_email: null,
    contact_phone: company.contact_phone || null,
    city: company.business_address?.city || null,
    postcode: company.business_address?.postal_code || null,
    region: null,
    current_milestone: milestone,
    agreement_signed: company.agreement_signed || false,
    training_booked: company.training_booked || false,
    training_completed: company.training_completed || false,
    portal_access: company.portal_access || false,
    has_ordered: company.has_ordered || false,
    milestone_dates: {
      m1_contract_signed: null,
      m2_training_completed: null,
      m3_first_order: null,
      m4_proven: null,
      m5_certified: null,
    },
    last_contact_date: company.last_contact_date,
    last_contact_method: null,
    last_note: latestNote?.content || null,
    days_since_contact: daysSinceContact,
    days_at_milestone: daysAtMilestone,
    deal_stage: company.deal_stage,
    assigned_am: company.assigned_am,
    hubspot_owner_id: company.hubspot_owner_id,
    priority: priority.level,
    priority_reason: priority.reason,
    priority_score: priority.score,
    order_count: company.order_count || 0,
    total_revenue: company.total_revenue || 0,
    quality_check_status: null,
    customer_calls_made: 0,
    created_at: company.created_at,
  };

  return json({ partner });
};

export const onRequestPatch = async (context: CFContext) => {
  const { request, env, params } = context;
  const auth = await requireAuth(request, env);
  if (isResponse(auth)) return auth;

  const id = params.id;
  const supabase = createServiceClient(env);

  // Fetch company for ownership check
  const { data: company, error } = await supabase
    .from("companies")
    .select("id, assigned_am")
    .eq("id", id)
    .single();

  if (error || !company) {
    return json({ error: "Partner not found" }, 404);
  }

  if (auth.scopeFilter && company.assigned_am !== auth.scopeFilter) {
    return json({ error: "Access denied" }, 403);
  }

  const body = await request.json();
  const allowedFields = ["contact_phone", "contact_name"];
  const updates: Record<string, string | null> = {};

  for (const field of allowedFields) {
    if (field in body) {
      const val = body[field];
      updates[field] =
        typeof val === "string" && val.trim() ? val.trim() : null;
    }
  }

  if (Object.keys(updates).length === 0) {
    return json({ error: "No valid fields to update" }, 400);
  }

  const { error: updateError } = await supabase
    .from("companies")
    .update(updates)
    .eq("id", id);

  if (updateError) {
    console.error("Failed to update partner:", updateError);
    return json({ error: "Failed to update" }, 500);
  }

  return json({ ok: true, updated: updates });
};
