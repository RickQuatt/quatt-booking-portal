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
