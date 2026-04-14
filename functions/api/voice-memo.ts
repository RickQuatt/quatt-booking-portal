import type { CFContext } from "../lib/types";
import { json } from "../lib/types";
import { requireAuth, isResponse } from "../lib/auth";
import { createServiceClient } from "../lib/supabase";

export const onRequestPost = async (context: CFContext) => {
  const { request, env } = context;
  const auth = await requireAuth(request, env);
  if (isResponse(auth)) return auth;

  const formData = await request.formData();
  const audio = formData.get("audio") as File | null;
  const companyId = formData.get("companyId") as string | null;

  if (!audio || !companyId) {
    return json({ error: "audio and companyId required" }, 400);
  }

  // Validate file type and size
  if (!audio.type.startsWith("audio/")) {
    return json({ error: "Only audio files allowed" }, 400);
  }
  if (audio.size > 10 * 1024 * 1024) {
    return json({ error: "File too large (max 10MB)" }, 400);
  }

  // Validate companyId format (UUID)
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(companyId)) {
    return json({ error: "Invalid companyId" }, 400);
  }

  const supabase = createServiceClient(env);

  // Ownership check
  if (auth.scopeFilter) {
    const { data: company } = await supabase
      .from("companies")
      .select("assigned_am")
      .eq("id", companyId)
      .single();
    if (!company || company.assigned_am !== auth.scopeFilter) {
      return json({ error: "Access denied" }, 403);
    }
  }

  const authorEmail = auth.email;

  // Upload audio to Supabase storage
  const fileName = `voice-memos/${companyId}/${Date.now()}.webm`;
  const { error: uploadError } = await supabase.storage
    .from("am-assets")
    .upload(fileName, audio, { contentType: "audio/webm" });

  let audioUrl = null;
  if (!uploadError) {
    const { data: urlData } = supabase.storage
      .from("am-assets")
      .getPublicUrl(fileName);
    audioUrl = urlData.publicUrl;
  }

  // Create memo record
  const { data: memo, error } = await supabase
    .from("am_voice_memos")
    .insert({
      company_id: companyId,
      author_email: authorEmail,
      audio_url: audioUrl || fileName,
      duration_seconds: 0,
      processed: false,
    })
    .select()
    .single();

  if (error) {
    console.error("[AM] Failed to create voice memo:", error);
    return json({ error: "Database error" }, 500);
  }

  return json({ memo });
};
