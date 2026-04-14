import type { Env } from "./types";

const BASE_URL = "https://api.aircall.io/v1";

// --- Types ---

export interface AircallUser {
  id: number;
  direct_link: string;
  name: string;
  email: string;
  available: boolean;
  availability_status: string;
  created_at: string;
}

export interface AircallCall {
  id: number;
  direct_link: string;
  direction: "inbound" | "outbound";
  status: string;
  missed_call_reason: string | null;
  started_at: number; // unix timestamp
  answered_at: number | null;
  ended_at: number | null;
  duration: number; // seconds
  raw_digits: string;
  asset: string | null; // recording URL
  recording: string | null; // recording URL
  voicemail: string | null;
  archived: boolean;
  user: { id: number; name: string; email: string } | null;
  contact: {
    id: number;
    direct_link: string;
    first_name: string;
    last_name: string;
    phone_numbers: { value: string }[];
  } | null;
  number: { id: number; digits: string; name: string } | null;
  tags: { id: number; name: string }[];
  comments: { id: number; body: string; posted_at: string }[];
}

export interface AircallTranscription {
  id: number;
  call_id: number;
  content: { role: string; text: string; timestamp: number }[];
  status: string;
}

export interface AircallCallSummary {
  call_id: number;
  content: string;
  status: string;
}

// --- Client factory ---

export interface AircallClient {
  listUsers(): Promise<AircallUser[]>;
  listCalls(opts?: {
    from?: number;
    to?: number;
    userId?: number;
    page?: number;
    perPage?: number;
  }): Promise<{
    calls: AircallCall[];
    meta: {
      total: number;
      per_page: number;
      current_page: number;
      next_page_url: string | null;
    };
  }>;
  getCall(callId: number): Promise<AircallCall>;
  getTranscription(callId: number): Promise<AircallTranscription | null>;
  getCallSummary(callId: number): Promise<AircallCallSummary | null>;
  searchCallsByPhone(phoneNumber: string): Promise<AircallCall[]>;
  dialUser(aircallUserId: number, phoneNumber: string): Promise<Response>;
}

export function createAircallClient(env: Env): AircallClient {
  const authHeader =
    "Basic " + btoa(`${env.AIRCALL_API_ID}:${env.AIRCALL_API_TOKEN}`);

  async function aircallFetch<T>(
    path: string,
    params?: Record<string, string>,
    fetchOpts?: RequestInit,
  ): Promise<T> {
    const url = new URL(`${BASE_URL}${path}`);
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        url.searchParams.set(k, v);
      }
    }

    const res = await fetch(url.toString(), {
      ...fetchOpts,
      headers: {
        Authorization: authHeader,
        ...(fetchOpts?.headers || {}),
      },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Aircall API ${res.status}: ${text}`);
    }

    return res.json() as Promise<T>;
  }

  return {
    async listUsers(): Promise<AircallUser[]> {
      const data = await aircallFetch<{ users: AircallUser[] }>("/users");
      return data.users;
    },

    async listCalls(opts) {
      const params: Record<string, string> = {
        order: "desc",
        per_page: String(opts?.perPage ?? 25),
      };
      if (opts?.from) params.from = String(opts.from);
      if (opts?.to) params.to = String(opts.to);
      if (opts?.page) params.page = String(opts.page);

      const data = await aircallFetch<{
        calls: AircallCall[];
        meta: {
          total: number;
          per_page: number;
          current_page: number;
          next_page_url: string | null;
        };
      }>("/calls", params);

      // Filter by user ID if specified (API doesn't support user filter directly)
      if (opts?.userId) {
        data.calls = data.calls.filter((c) => c.user?.id === opts.userId);
      }

      return data;
    },

    async getCall(callId: number): Promise<AircallCall> {
      const data = await aircallFetch<{ call: AircallCall }>(
        `/calls/${callId}`,
      );
      return data.call;
    },

    async getTranscription(
      callId: number,
    ): Promise<AircallTranscription | null> {
      try {
        const data = await aircallFetch<{
          transcription: AircallTranscription;
        }>(`/calls/${callId}/transcription`);
        return data.transcription;
      } catch {
        return null; // transcription not available
      }
    },

    async getCallSummary(callId: number): Promise<AircallCallSummary | null> {
      try {
        const data = await aircallFetch<{ summary: AircallCallSummary }>(
          `/calls/${callId}/summary`,
        );
        return data.summary;
      } catch {
        return null;
      }
    },

    async searchCallsByPhone(phoneNumber: string): Promise<AircallCall[]> {
      const normalized = phoneNumber.replace(/[^0-9+]/g, "");
      const data = await aircallFetch<{ calls: AircallCall[] }>(
        "/calls/search",
        {
          phone_number: normalized,
          order: "desc",
          per_page: "25",
        },
      );
      return data.calls;
    },

    async dialUser(
      aircallUserId: number,
      phoneNumber: string,
    ): Promise<Response> {
      const url = `${BASE_URL}/users/${aircallUserId}/dial`;
      return fetch(url, {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ to: phoneNumber }),
      });
    },
  };
}
