import type { CFContext } from "../lib/types";
import { json } from "../lib/types";
import { requireAuth, isResponse } from "../lib/auth";
import { getAllAMs } from "../lib/team";

export const onRequestGet = async (context: CFContext) => {
  const { request, env } = context;
  const auth = await requireAuth(request, env);
  if (isResponse(auth)) return auth;

  const response: Record<string, unknown> = {
    email: auth.email,
    name: auth.name,
    role: auth.role,
    assignedAmValue: auth.assignedAmValue,
    hasAircall: auth.hasAircall,
  };

  // Admins get the AM list for the "view as" dropdown
  if (auth.role === "admin") {
    response.ams = getAllAMs().map((m) => ({
      name: m.name.split(" ")[0],
      value: m.assignedAmValue,
    }));
  }

  return json(response);
};
