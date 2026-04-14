import type { CFContext } from "../../../lib/types";
import { json } from "../../../lib/types";
import { requireAuth, isResponse } from "../../../lib/auth";
import { createServiceClient } from "../../../lib/supabase";

export const onRequestGet = async (context: CFContext) => {
  const { request, env, params } = context;
  const auth = await requireAuth(request, env);
  if (isResponse(auth)) return auth;

  const id = params.id;
  const supabase = createServiceClient(env);

  // Ownership check
  if (auth.scopeFilter) {
    const { data: company } = await supabase
      .from("companies")
      .select("assigned_am")
      .eq("id", id)
      .single();
    if (!company || company.assigned_am !== auth.scopeFilter) {
      return json({ error: "Access denied" }, 403);
    }
  }

  const { data: notes, error } = await supabase
    .from("am_partner_notes")
    .select("*")
    .eq("company_id", id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("[AM] Failed to fetch notes:", error);
    return json({ error: "Database error" }, 500);
  }

  const mapped = (notes || []).map((n) => ({
    id: n.id,
    company_id: n.company_id,
    date: n.created_at,
    type: n.note_type,
    summary: n.content || "",
    details: n.outcome,
    author_email: n.author_email,
  }));

  return json({ notes: mapped });
};

export const onRequestPost = async (context: CFContext) => {
  const { request, env, params } = context;
  const auth = await requireAuth(request, env);
  if (isResponse(auth)) return auth;

  const id = params.id;
  const supabase = createServiceClient(env);

  // Ownership check
  if (auth.scopeFilter) {
    const { data: company } = await supabase
      .from("companies")
      .select("assigned_am")
      .eq("id", id)
      .single();
    if (!company || company.assigned_am !== auth.scopeFilter) {
      return json({ error: "Access denied" }, 403);
    }
  }

  const body = await request.json();
  const { content, note_type, outcome } = body;

  const VALID_NOTE_TYPES = ["call", "email", "meeting", "note", "milestone", "order", "aircall_call"];
  if (!content || !note_type) {
    return json({ error: "content and note_type required" }, 400);
  }
  if (!VALID_NOTE_TYPES.includes(note_type)) {
    return json({ error: "Invalid note_type" }, 400);
  }

  const authorEmail = auth.email;

  const { data: note, error } = await supabase
    .from("am_partner_notes")
    .insert({
      company_id: id,
      author_email: authorEmail,
      note_type,
      content,
      outcome: outcome || null,
    })
    .select()
    .single();

  if (error) {
    console.error("[AM] Failed to create note:", error);
    return json({ error: "Database error" }, 500);
  }

  // Update last_contact_date on the company
  if (["call", "meeting"].includes(note_type)) {
    await supabase
      .from("companies")
      .update({ last_contact_date: new Date().toISOString() })
      .eq("id", id);
  }

  // Log to audit
  await supabase
    .from("audit_log")
    .insert({
      user_email: authorEmail,
      action: "am_note_created",
      entity_type: "am_partner_notes",
      entity_id: note.id,
      details: { company_id: id, note_type },
    })
    .then(() => {});

  return json({
    note: {
      id: note.id,
      company_id: note.company_id,
      date: note.created_at,
      type: note.note_type,
      summary: note.content,
      details: note.outcome,
      author_email: note.author_email,
    },
  });
};
