import type { CFContext } from "../../../lib/types";
import { json } from "../../../lib/types";
import { requireAuth, isResponse } from "../../../lib/auth";
import { createServiceClient } from "../../../lib/supabase";
import { computeMilestone, computePriority, DEAL_STAGES } from "../../../lib/partner-types";

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
  const daysAtMilestone = diffDays(company.milestone_changed_at || company.created_at, now);

  const agreementSigned = company.onboarding_agreement_signed || false;
  const trainingBooked = company.onboarding_training_booked || false;
  const trainingCompleted = company.onboarding_training_completed || false;
  const portalAccess = company.portal_access || false;
  const hasOrdered = company.has_ordered || false;

  const milestone = computeMilestone({
    agreement_signed: agreementSigned,
    training_completed: trainingCompleted,
    has_ordered: hasOrdered,
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

const MILESTONE_FIELD_LABELS: Record<string, string> = {
  onboarding_agreement_signed: "Overeenkomst getekend",
  onboarding_training_booked: "Training ingepland",
  onboarding_training_completed: "Training afgerond",
  portal_access: "Portaal toegang verleend",
  has_ordered: "Eerste bestelling geplaatst",
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
    .select("id, assigned_am, deal_stage, onboarding_agreement_signed, onboarding_training_booked, onboarding_training_completed, portal_access, has_ordered")
    .eq("id", id)
    .single();

  if (error || !company) {
    return json({ error: "Partner not found" }, 404);
  }

  if (auth.scopeFilter && company.assigned_am !== auth.scopeFilter) {
    return json({ error: "Access denied" }, 403);
  }

  const body = await request.json();
  const updates: Record<string, unknown> = {};
  const timelineEntries: { content: string; note_type: string }[] = [];

  // String fields
  const stringFields = ["contact_phone", "contact_name"];
  for (const field of stringFields) {
    if (field in body) {
      const val = body[field];
      updates[field] =
        typeof val === "string" && val.trim() ? val.trim() : null;
    }
  }

  // Boolean milestone fields
  const booleanFields = [
    "onboarding_agreement_signed",
    "onboarding_training_booked",
    "onboarding_training_completed",
    "portal_access",
    "has_ordered",
  ];
  let milestoneChanged = false;
  for (const field of booleanFields) {
    if (field in body) {
      const newVal = body[field] === true || body[field] === "true";
      const oldVal = (company as Record<string, unknown>)[field] || false;
      updates[field] = newVal;
      if (newVal !== oldVal) {
        milestoneChanged = true;
        const label = MILESTONE_FIELD_LABELS[field] || field;
        timelineEntries.push({
          content: newVal ? label : `${label} (teruggedraaid)`,
          note_type: "milestone",
        });
      }
    }
  }

  // Deal stage
  if ("deal_stage" in body) {
    const newStage = body.deal_stage;
    if (!DEAL_STAGES.includes(newStage)) {
      return json({ error: `Invalid deal_stage. Must be one of: ${DEAL_STAGES.join(", ")}` }, 400);
    }
    if (newStage !== company.deal_stage) {
      updates.deal_stage = newStage;
      timelineEntries.push({
        content: `Stage gewijzigd naar ${newStage}`,
        note_type: "milestone",
      });
    }
  }

  if (Object.keys(updates).length === 0) {
    return json({ error: "No valid fields to update" }, 400);
  }

  // Update milestone_changed_at if any milestone boolean changed
  if (milestoneChanged) {
    updates.milestone_changed_at = new Date().toISOString();
  }

  const { error: updateError } = await supabase
    .from("companies")
    .update(updates)
    .eq("id", id);

  if (updateError) {
    console.error("Failed to update partner:", updateError);
    return json({ error: "Failed to update" }, 500);
  }

  // Create timeline entries for milestone/stage changes
  for (const entry of timelineEntries) {
    await supabase
      .from("am_partner_notes")
      .insert({
        company_id: id,
        author_email: auth.email,
        note_type: entry.note_type,
        content: entry.content,
      });
  }

  // Audit log
  if (timelineEntries.length > 0) {
    await supabase
      .from("audit_log")
      .insert({
        user_email: auth.email,
        action: "partner_updated",
        entity_type: "companies",
        entity_id: id,
        details: { updates: Object.keys(updates), changes: timelineEntries.map((e) => e.content) },
      })
      .then(() => {});
  }

  return json({ ok: true, updated: updates });
};
