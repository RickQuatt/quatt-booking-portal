import type { CFContext } from "../../lib/types";
import { json } from "../../lib/types";
import { requireAuth, isResponse } from "../../lib/auth";
import { createServiceClient } from "../../lib/supabase";
import { generateRegistrationOptions } from "@simplewebauthn/server";

export const onRequestPost = async (context: CFContext) => {
  const { request, env } = context;
  const auth = await requireAuth(request, env);
  if (isResponse(auth)) return auth;

  const rpID = env.WEBAUTHN_RP_ID ?? "localhost";
  const rpName = "Quatt AM Toolkit";

  const supabase = createServiceClient(env);

  // Fetch existing credentials to exclude
  const { data: existing } = await supabase
    .from("am_webauthn_credentials")
    .select("credential_id")
    .eq("user_email", auth.email);

  const excludeCredentials = (existing ?? []).map((cred) => ({
    id: cred.credential_id,
  }));

  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userName: auth.email,
    userDisplayName: auth.name,
    excludeCredentials,
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "preferred",
    },
  });

  // Store challenge in a short-lived cookie (5 min)
  const body = JSON.stringify(options);
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": `webauthn_challenge=${options.challenge}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=300`,
    },
  });
};
