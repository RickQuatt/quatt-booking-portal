import type { CFContext } from "../../lib/types";
import { json } from "../../lib/types";
import { requireAuth, isResponse } from "../../lib/auth";
import { createAircallClient } from "../../lib/aircall";

export const onRequestGet = async (context: CFContext) => {
  const { request, env, params } = context;
  const auth = await requireAuth(request, env);
  if (isResponse(auth)) return auth;

  const callId = parseInt(params.id);
  if (isNaN(callId)) {
    return json({ error: "Invalid call ID" }, 400);
  }

  const aircall = createAircallClient(env);

  try {
    const call = await aircall.getCall(callId);

    // Scope check: AMs can only view their own calls
    if (auth.role === "am" && call.user?.email !== auth.email) {
      return json({ error: "Forbidden" }, 403);
    }

    // Fetch transcription and summary in parallel
    const [transcription, summary] = await Promise.all([
      aircall.getTranscription(callId),
      aircall.getCallSummary(callId),
    ]);

    return json({
      call,
      transcription: transcription?.content ?? null,
      summary: summary?.content ?? null,
    });
  } catch (err) {
    console.error("Aircall call detail error:", err);
    return json({ error: "Failed to fetch call details" }, 502);
  }
};
