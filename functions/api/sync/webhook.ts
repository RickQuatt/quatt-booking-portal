import type { CFContext } from "../../lib/types";
import { json } from "../../lib/types";
import { createServiceClient } from "../../lib/supabase";
import { getOwnerMap } from "../../lib/team";

function timingSafeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  // Constant-time comparison to prevent timing attacks
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export const onRequestPost = async (context: CFContext) => {
  const { request, env } = context;

  // Validate webhook secret with timing-safe comparison
  const secret = request.headers.get("x-webhook-secret");
  const expectedSecret = env.WEBHOOK_SECRET;

  if (!expectedSecret) {
    console.error("[WEBHOOK] WEBHOOK_SECRET not configured");
    return json({ error: "Server misconfigured" }, 500);
  }

  if (!secret || !timingSafeCompare(secret, expectedSecret)) {
    console.error("[WEBHOOK] Invalid secret");
    return json({ error: "Unauthorized" }, 401);
  }

  const body = await request.json();
  const {
    deal_id,
    deal_name,
    deal_stage,
    owner_id,
    agreement_signed,
    training_booked,
    training_completed,
    portal_access,
    has_ordered,
    order_count,
  } = body;

  if (!deal_id) {
    console.error("[WEBHOOK] Missing deal_id in payload");
    return json({ error: "deal_id required" }, 400);
  }

  const supabase = createServiceClient(env);

  // Map HubSpot owner ID to AM name via team config
  const ownerMap = getOwnerMap();
  const assignedAm = ownerMap[String(owner_id)] || null;

  // Upsert by hubspot_deal_id
  const { error } = await supabase
    .from("companies")
    .update({
      hubspot_deal_id: String(deal_id),
      hubspot_owner_id: owner_id ? String(owner_id) : null,
      assigned_am: assignedAm,
      deal_stage: deal_stage || null,
      onboarding_agreement_signed:
        agreement_signed === true || agreement_signed === "true",
      onboarding_training_booked:
        training_booked === true || training_booked === "true",
      onboarding_training_completed:
        training_completed === true || training_completed === "true",
      portal_access:
        portal_access === true || portal_access === "true",
      has_ordered:
        has_ordered === true || has_ordered === "true",
      order_count: parseInt(String(order_count)) || 0,
      last_hubspot_sync: new Date().toISOString(),
    })
    .eq("hubspot_deal_id", String(deal_id));

  if (error) {
    console.error("[WEBHOOK] Failed to upsert:", error);
    return json({ error: "Database error" }, 500);
  }

  // Audit log
  await supabase
    .from("audit_log")
    .insert({
      user_email: "webhook@hubspot",
      action: "hubspot_sync",
      entity_type: "companies",
      entity_id: String(deal_id),
      details: { deal_name, deal_stage, owner_id },
    })
    .then(() => {});

  return json({ ok: true });
};
