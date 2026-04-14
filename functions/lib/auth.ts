import { jwtVerify } from "jose";
import { getTeamMember } from "./team";
import type { Env } from "./types";
import { json } from "./types";

export interface AuthorizedUser {
  email: string;
  name: string;
  role: "admin" | "am";
  assignedAmValue: string | null;
  scopeFilter: string | null; // null = see all (admin), string = filter by assigned_am
  hasAircall: boolean;
}

function getSessionCookie(request: Request): string | null {
  const cookieHeader = request.headers.get("Cookie");
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").map((c) => c.trim());
  const sessionCookie = cookies.find((c) => c.startsWith("session="));

  if (!sessionCookie) return null;
  return sessionCookie.split("=")[1];
}

async function verifySessionToken(
  sessionToken: string,
  sessionSecret: string,
): Promise<{ email?: string; name?: string } | null> {
  try {
    const secret = new TextEncoder().encode(sessionSecret);
    const { payload } = await jwtVerify(sessionToken, secret, {
      issuer: "quatt-internal-tool",
      audience: "quatt-internal-tool",
    });
    return payload as { email?: string; name?: string };
  } catch {
    return null;
  }
}

/**
 * Returns the authorized user or null if not authenticated/authorized.
 */
export async function getAuthorizedUser(
  request: Request,
  env: Env,
): Promise<AuthorizedUser | null> {
  const token = getSessionCookie(request);
  if (!token) return null;

  const payload = await verifySessionToken(token, env.SESSION_SECRET);
  if (!payload || !payload.email) return null;

  const member = getTeamMember(payload.email);
  if (!member) return null;

  const scopeFilter = member.role === "admin" ? null : member.assignedAmValue;

  return {
    email: member.email,
    name: member.name,
    role: member.role,
    assignedAmValue: member.assignedAmValue,
    scopeFilter,
    hasAircall: member.aircallUserId !== null,
  };
}

/**
 * Returns the authorized user or a 401/403 Response.
 */
export async function requireAuth(
  request: Request,
  env: Env,
): Promise<AuthorizedUser | Response> {
  const token = getSessionCookie(request);
  if (!token) {
    return json({ error: "Unauthorized" }, 401);
  }

  const payload = await verifySessionToken(token, env.SESSION_SECRET);
  if (!payload || !payload.email) {
    return json({ error: "Unauthorized" }, 401);
  }

  const member = getTeamMember(payload.email);
  if (!member) {
    return json({ error: "Access restricted to AM Toolkit team members" }, 403);
  }

  const scopeFilter = member.role === "admin" ? null : member.assignedAmValue;

  return {
    email: member.email,
    name: member.name,
    role: member.role,
    assignedAmValue: member.assignedAmValue,
    scopeFilter,
    hasAircall: member.aircallUserId !== null,
  };
}

/**
 * Type guard to check if requireAuth returned a Response (error) or AuthorizedUser.
 */
export function isResponse(value: AuthorizedUser | Response): value is Response {
  return value instanceof Response;
}
