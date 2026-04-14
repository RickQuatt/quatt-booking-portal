import type { CFContext } from "../../lib/types";
import { json } from "../../lib/types";
import { requireAuth, isResponse } from "../../lib/auth";
import { createAircallClient } from "../../lib/aircall";
import { getTeamMember } from "../../lib/team";

export const onRequestPost = async (context: CFContext) => {
  const { request, env } = context;
  const auth = await requireAuth(request, env);
  if (isResponse(auth)) return auth;

  const member = getTeamMember(auth.email);
  if (!member?.aircallUserId) {
    return json(
      { error: "No Aircall account linked to your profile" },
      400,
    );
  }

  const body = await request.json();
  const { phoneNumber } = body;

  if (!phoneNumber || typeof phoneNumber !== "string") {
    return json({ error: "phoneNumber is required" }, 400);
  }

  // Normalize: strip spaces/dashes, ensure + prefix
  const normalized = phoneNumber.replace(/[\s\-()]/g, "");

  const aircall = createAircallClient(env);

  try {
    const res = await aircall.dialUser(member.aircallUserId, normalized);

    if (!res.ok) {
      const text = await res.text();
      console.error("Aircall dial error:", res.status, text);
      return json({ error: "Failed to initiate call" }, res.status);
    }

    return json({ ok: true });
  } catch (err) {
    console.error("Aircall dial error:", err);
    return json({ error: "Failed to initiate call" }, 502);
  }
};
