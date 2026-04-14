import type { CFContext } from "../lib/types";
import { json } from "../lib/types";
import { requireAuth, isResponse } from "../lib/auth";

export const onRequestGet = async (context: CFContext) => {
  const { request, env } = context;
  const auth = await requireAuth(request, env);
  if (isResponse(auth)) return auth;

  return json({
    email: auth.email,
    name: auth.name,
    role: auth.role,
    assignedAmValue: auth.assignedAmValue,
    hasAircall: auth.hasAircall,
  });
};
