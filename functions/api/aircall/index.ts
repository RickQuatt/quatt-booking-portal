import type { CFContext } from "../../lib/types";
import { json } from "../../lib/types";
import { requireAuth, isResponse } from "../../lib/auth";
import { createAircallClient } from "../../lib/aircall";
import { getTeamMember, IC_AIRCALL_NUMBER_IDS } from "../../lib/team";

export const onRequestGet = async (context: CFContext) => {
  const { request, env } = context;
  const auth = await requireAuth(request, env);
  if (isResponse(auth)) return auth;

  const url = new URL(request.url);
  const phone = url.searchParams.get("phone");
  const page = parseInt(url.searchParams.get("page") || "1");

  // Get the user's Aircall ID for scoping
  const member = getTeamMember(auth.email);
  const myAircallId = member?.aircallUserId ?? null;

  const aircall = createAircallClient(env);

  try {
    // If searching by phone number (partner detail page)
    if (phone) {
      const allCalls = await aircall.searchCallsByPhone(phone);
      // Only show calls on IC phone lines
      const icCalls = allCalls.filter(
        (c) => c.number?.id && IC_AIRCALL_NUMBER_IDS.includes(c.number.id),
      );
      const filtered =
        auth.role === "am" && myAircallId
          ? icCalls.filter((c) => c.user?.id === myAircallId)
          : icCalls;
      return json({ calls: filtered });
    }

    // List recent calls (30 days) -- only IC phone lines
    const thirtyDaysAgo =
      Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60;
    const data = await aircall.listCalls({
      from: thirtyDaysAgo,
      page,
      perPage: 50,
    });

    const icCalls = data.calls.filter(
      (c) => c.number?.id && IC_AIRCALL_NUMBER_IDS.includes(c.number.id),
    );
    const calls =
      auth.role === "am" && myAircallId
        ? icCalls.filter((c) => c.user?.id === myAircallId)
        : icCalls;

    return json({ calls, meta: data.meta });
  } catch (err) {
    console.error("Aircall API error:", err);
    return json({ error: "Failed to fetch Aircall data" }, 502);
  }
};
