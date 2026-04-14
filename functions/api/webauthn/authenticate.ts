import { SignJWT, jwtVerify } from "jose";
import type { CFContext } from "../../lib/types";
import { json } from "../../lib/types";
import { getAuthorizedUser } from "../../lib/auth";
import { createServiceClient } from "../../lib/supabase";
import { getTeamMember } from "../../lib/team";
import {
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import { isoBase64URL } from "@simplewebauthn/server/helpers";

const SEVEN_DAYS_S = 60 * 60 * 24 * 7;

function getCookie(request: Request, name: string): string | null {
  const cookieHeader = request.headers.get("Cookie");
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(";").map((c) => c.trim());
  const match = cookies.find((c) => c.startsWith(`${name}=`));
  if (!match) return null;
  return match.split("=")[1];
}

export const onRequestPost = async (context: CFContext) => {
  const { request, env } = context;

  const contentLength = request.headers.get("content-length");
  const hasBody = contentLength && parseInt(contentLength) > 0;

  if (!hasBody) {
    // Phase 1: Generate authentication options
    return generateChallenge(request, env);
  }

  // Phase 2: Verify authentication response
  return verifyAuthentication(request, env);
};

async function generateChallenge(
  request: Request,
  env: import("../../lib/types").Env,
) {
  const rpID = env.WEBAUTHN_RP_ID ?? "localhost";
  const supabase = createServiceClient(env);

  // If we have a session, scope to that user's credentials
  const user = await getAuthorizedUser(request, env);
  let allowCredentials: { id: string }[] | undefined;

  if (user) {
    const { data: creds } = await supabase
      .from("am_webauthn_credentials")
      .select("credential_id")
      .eq("user_email", user.email);

    if (creds && creds.length > 0) {
      allowCredentials = creds.map((c) => ({ id: c.credential_id }));
    }
  }

  const options = await generateAuthenticationOptions({
    rpID,
    allowCredentials,
    userVerification: "preferred",
  });

  const body = JSON.stringify(options);
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": `webauthn_auth_challenge=${options.challenge}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=300`,
    },
  });
}

async function verifyAuthentication(
  request: Request,
  env: import("../../lib/types").Env,
) {
  const rpID = env.WEBAUTHN_RP_ID ?? "localhost";
  const origin = env.APP_URL ?? `https://${rpID}`;

  const body = await request.json();
  const challenge = getCookie(request, "webauthn_auth_challenge");

  if (!challenge) {
    return json({ error: "No challenge found" }, 400);
  }

  // Look up the credential
  const supabase = createServiceClient(env);
  const { data: credRow } = await supabase
    .from("am_webauthn_credentials")
    .select("*")
    .eq("credential_id", body.id)
    .single();

  if (!credRow) {
    return json({ error: "Credential not found" }, 400);
  }

  const verification = await verifyAuthenticationResponse({
    response: body,
    expectedChallenge: challenge,
    expectedOrigin: origin,
    expectedRPID: [rpID],
    credential: {
      id: credRow.credential_id,
      publicKey: isoBase64URL.toBuffer(credRow.public_key),
      counter: credRow.counter,
    },
  });

  if (!verification.verified) {
    return json({ error: "Authentication failed" }, 400);
  }

  // Update counter
  await supabase
    .from("am_webauthn_credentials")
    .update({ counter: verification.authenticationInfo.newCounter })
    .eq("credential_id", credRow.credential_id);

  // Refresh session cookie with team info
  const teamMember = getTeamMember(credRow.user_email);
  if (!teamMember) {
    return json(
      { error: "Access restricted to AM Toolkit team members" },
      403,
    );
  }

  // Create a new session JWT
  const secret = new TextEncoder().encode(env.SESSION_SECRET);
  const sessionToken = await new SignJWT({
    sub: credRow.user_email,
    email: credRow.user_email,
    name: credRow.user_email.split("@")[0],
    type: "session",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer("quatt-internal-tool")
    .setAudience("quatt-internal-tool")
    .setExpirationTime("7d")
    .sign(secret);

  const isProduction = request.url.startsWith("https://");
  const cookieOptions = [
    `session=${sessionToken}`,
    "Path=/",
    `Max-Age=${SEVEN_DAYS_S}`,
    ...(isProduction ? ["HttpOnly", "Secure"] : []),
    "SameSite=Lax",
  ].join("; ");

  return new Response(JSON.stringify({ verified: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": [
        cookieOptions,
        "webauthn_auth_challenge=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0",
      ].join(", "),
    },
  });
}
