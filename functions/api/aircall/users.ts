import type { CFContext } from "../../lib/types";
import { json } from "../../lib/types";
import { requireAuth, isResponse } from "../../lib/auth";
import { createAircallClient } from "../../lib/aircall";

export const onRequestGet = async (context: CFContext) => {
  const { request, env } = context;
  const auth = await requireAuth(request, env);
  if (isResponse(auth)) return auth;

  const aircall = createAircallClient(env);

  try {
    const users = await aircall.listUsers();
    return json({ users });
  } catch (err) {
    console.error("Aircall users error:", err);
    return json({ error: "Failed to fetch Aircall users" }, 502);
  }
};
