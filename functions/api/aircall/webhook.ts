import type { CFContext } from "../../lib/types";
import { json } from "../../lib/types";
import { createServiceClient } from "../../lib/supabase";
import {
  getTeamMemberByAircallId,
  IC_AIRCALL_NUMBER_IDS,
} from "../../lib/team";

interface AircallWebhookPayload {
  event: string;
  timestamp: number;
  token: string;
  data: {
    id: number;
    direction: "inbound" | "outbound";
    status: string;
    missed_call_reason: string | null;
    started_at: number;
    answered_at: number | null;
    ended_at: number | null;
    duration: number;
    raw_digits: string;
    user: { id: number; name: string; email: string } | null;
    contact: {
      id: number;
      first_name: string;
      last_name: string;
      phone_numbers: { value: string }[];
    } | null;
    recording: string | null;
    number: { id: number; digits: string; name: string } | null;
  };
}

function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-()]/g, "");
}

function timingSafeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const encoder = new TextEncoder();
  const bufA = encoder.encode(a);
  const bufB = encoder.encode(b);
  let result = 0;
  for (let i = 0; i < bufA.length; i++) {
    result |= bufA[i] ^ bufB[i];
  }
  return result === 0;
}

export const onRequestPost = async (context: CFContext) => {
  const { request, env } = context;
  const body: AircallWebhookPayload = await request.json();

  // Validate webhook token -- fail closed if not configured
  const webhookToken = env.AIRCALL_WEBHOOK_TOKEN;
  if (!webhookToken) {
    console.error("AIRCALL_WEBHOOK_TOKEN not configured");
    return json({ error: "Server misconfigured" }, 500);
  }
  if (!body.token || !timingSafeCompare(body.token, webhookToken)) {
    console.error("Aircall webhook: invalid token");
    return json({ error: "Invalid token" }, 401);
  }

  if (body.event !== "call.ended") {
    return json({ ok: true, skipped: true });
  }

  const call = body.data;

  // Only process calls on IC phone lines -- ignore CS, sales, planning, etc.
  if (
    !call.number?.id ||
    !IC_AIRCALL_NUMBER_IDS.includes(call.number.id)
  ) {
    return json({
      ok: true,
      skipped: true,
      reason: "not an IC number",
    });
  }

  const supabase = createServiceClient(env);

  // Normalize the phone number for matching
  const phoneNumber = normalizePhone(call.raw_digits);
  if (!phoneNumber) {
    console.log("Aircall webhook: no phone number on call", call.id);
    return json({ ok: true, matched: false });
  }

  // Try to match to a partner by contact_phone
  // Check multiple formats: raw, with +31, without leading 0
  const phoneVariants = [phoneNumber];
  if (phoneNumber.startsWith("+31")) {
    phoneVariants.push("0" + phoneNumber.slice(3));
  } else if (phoneNumber.startsWith("0")) {
    phoneVariants.push("+31" + phoneNumber.slice(1));
  }

  let matchedCompany: {
    id: string;
    name: string;
    assigned_am: string | null;
  } | null = null;

  for (const variant of phoneVariants) {
    const { data } = await supabase
      .from("companies")
      .select("id, name, assigned_am")
      .eq("contact_phone", variant)
      .limit(1)
      .single();

    if (data) {
      matchedCompany = data;
      break;
    }
  }

  // Determine the AM who handled this call
  const amInfo = call.user
    ? getTeamMemberByAircallId(call.user.id)
    : null;

  // Build a summary
  const directionLabel =
    call.direction === "inbound" ? "Inkomend" : "Uitgaand";
  const durationMin = Math.floor(call.duration / 60);
  const durationSec = call.duration % 60;
  const durationStr =
    call.duration > 0
      ? `${durationMin}m ${durationSec}s`
      : "niet opgenomen";
  const missedStr = call.missed_call_reason ? " (gemist)" : "";
  const amName = call.user?.name?.split(" ")[0] || "Onbekend";
  const summary = `${directionLabel} gesprek${missedStr} - ${durationStr} - ${amName}`;

  if (matchedCompany) {
    // Create timeline entry
    const authorEmail =
      amInfo?.email || call.user?.email || "aircall@system";
    await supabase.from("am_partner_notes").insert({
      company_id: matchedCompany.id,
      author_email: authorEmail,
      note_type: "call",
      content: summary,
      outcome: call.missed_call_reason ? "missed" : "completed",
    });

    // Update last_contact_date if call was answered
    if (!call.missed_call_reason && call.duration > 0) {
      await supabase
        .from("companies")
        .update({
          last_contact_date: new Date(
            call.started_at * 1000,
          ).toISOString(),
        })
        .eq("id", matchedCompany.id);
    }

    console.log(
      `Aircall webhook: call ${call.id} matched to ${matchedCompany.name} (${matchedCompany.id})`,
    );
  } else {
    // Log unmatched call for debugging
    const contactName = call.contact
      ? `${call.contact.first_name} ${call.contact.last_name}`.trim()
      : "unknown";
    console.log(
      `Aircall webhook: call ${call.id} unmatched - phone: ${phoneNumber}, contact: ${contactName}, AM: ${amName}`,
    );
  }

  return json({
    ok: true,
    matched: !!matchedCompany,
    company: matchedCompany?.name || null,
  });
};
