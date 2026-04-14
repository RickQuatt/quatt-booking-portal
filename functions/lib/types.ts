export interface Env {
  SESSION_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  ALLOWED_EMAIL_DOMAIN?: string;
  APP_NAME?: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  AIRCALL_API_ID: string;
  AIRCALL_API_TOKEN: string;
  AIRCALL_WEBHOOK_TOKEN: string;
  WEBHOOK_SECRET: string;
  WEBAUTHN_RP_ID?: string;
  APP_URL?: string;
}

export interface CFContext {
  request: Request;
  env: Env;
  params: Record<string, string>;
  next: () => Promise<Response>;
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
