import type { CFContext } from "../../lib/types";
import { json } from "../../lib/types";
import { requireAuth, isResponse } from "../../lib/auth";
import { createServiceClient } from "../../lib/supabase";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { isoBase64URL } from "@simplewebauthn/server/helpers";

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
  const auth = await requireAuth(request, env);
  if (isResponse(auth)) return auth;

  const rpID = env.WEBAUTHN_RP_ID ?? "localhost";
  const origin = env.APP_URL ?? `https://${rpID}`;

  const body = await request.json();
  const challenge = getCookie(request, "webauthn_challenge");

  if (!challenge) {
    return json({ error: "No challenge found" }, 400);
  }

  const verification = await verifyRegistrationResponse({
    response: body,
    expectedChallenge: challenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
  });

  if (!verification.verified || !verification.registrationInfo) {
    return json({ error: "Verification failed" }, 400);
  }

  const { credential } = verification.registrationInfo;

  // Store credential in Supabase
  const supabase = createServiceClient(env);
  const { error } = await supabase.from("am_webauthn_credentials").insert({
    credential_id: credential.id,
    public_key: isoBase64URL.fromBuffer(credential.publicKey),
    user_email: auth.email,
    counter: credential.counter,
    created_at: new Date().toISOString(),
  });

  if (error) {
    return json({ error: "Failed to store credential" }, 500);
  }

  // Clear challenge cookie
  return new Response(JSON.stringify({ verified: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie":
        "webauthn_challenge=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0",
    },
  });
};
