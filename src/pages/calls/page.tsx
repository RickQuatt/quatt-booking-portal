import { useState, useEffect } from "react";
import type { AircallCall } from "@/lib/aircall-types";
import { useAuth, apiFetch } from "@/hooks/useAuth";

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function formatTime(unix: number): string {
  return new Date(unix * 1000).toLocaleString("nl-NL", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function CallStatusBadge({ call }: { call: AircallCall }) {
  if (call.missed_call_reason) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-50 text-red-700">
        Gemist
      </span>
    );
  }
  if (call.voicemail) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-50 text-purple-700">
        Voicemail
      </span>
    );
  }
  if (call.direction === "inbound") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700">
        Inkomend
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-50 text-green-700">
      Uitgaand
    </span>
  );
}

export function CallsPage() {
  const [calls, setCalls] = useState<AircallCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [dialing, setDialing] = useState<string | null>(null);
  const { user } = useAuth();

  const hasAircall = user?.hasAircall ?? false;

  useEffect(() => {
    loadCalls(1);
  }, []);

  async function loadCalls(p: number) {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/aircall?page=${p}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setCalls(data.calls || []);
      setHasMore(!!data.meta?.next_page_url);
      setPage(p);
    } catch (err) {
      console.error("Failed to load calls:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDial(phoneNumber: string) {
    setDialing(phoneNumber);
    try {
      const res = await apiFetch("/api/aircall/dial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Bellen mislukt");
      }
    } catch {
      alert("Bellen mislukt");
    } finally {
      setDialing(null);
    }
  }

  if (loading && calls.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-quatt-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-bold tracking-[-0.04em] text-quatt-ink">
        Gesprekken
      </h1>
      <p className="text-sm text-quatt-text-secondary mt-0.5">
        Recente Aircall gesprekken (laatste 30 dagen)
      </p>

      <div className="mt-4 space-y-2">
        {calls.map((call) => {
          const contactName = call.contact
            ? `${call.contact.first_name} ${call.contact.last_name}`.trim()
            : null;
          const phoneDisplay = call.raw_digits || "Onbekend nummer";

          return (
            <div
              key={call.id}
              className="bg-white rounded-[14px] p-4 border border-quatt-border-light shadow-card"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      call.direction === "inbound" ? "bg-blue-50" : "bg-green-50"
                    }`}
                  >
                    <svg
                      className={`w-4 h-4 ${
                        call.direction === "inbound"
                          ? "text-blue-600 rotate-[135deg]"
                          : "text-green-600 -rotate-45"
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
                      />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {contactName || phoneDisplay}
                    </p>
                    {contactName && (
                      <p className="text-xs text-quatt-text-secondary">
                        {phoneDisplay}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <CallStatusBadge call={call} />
                      <span className="text-[10px] text-quatt-text-secondary">
                        {formatTime(call.started_at)}
                      </span>
                      {call.duration > 0 && (
                        <span className="text-[10px] text-quatt-text-secondary">
                          {formatDuration(call.duration)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-2 shrink-0">
                  {call.user && (
                    <span className="text-[10px] text-quatt-text-secondary">
                      {call.user.name.split(" ")[0]}
                    </span>
                  )}
                  {call.raw_digits && hasAircall && (
                    <button
                      onClick={() => handleDial(call.raw_digits)}
                      disabled={dialing === call.raw_digits}
                      className="bg-quatt-orange text-white rounded-full p-2 hover:bg-quatt-orange/90 disabled:opacity-50 transition-colors"
                      title="Terugbellen via Aircall"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
                        />
                      </svg>
                    </button>
                  )}
                  {call.raw_digits && !hasAircall && (
                    <a
                      href={`tel:${call.raw_digits}`}
                      className="bg-quatt-orange text-white rounded-full p-2 hover:bg-quatt-orange/90 transition-colors"
                      title="Bellen"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
                        />
                      </svg>
                    </a>
                  )}
                </div>
              </div>

              {/* Tags */}
              {call.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2 ml-11">
                  {call.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-quatt-bg text-quatt-text-secondary"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Comments */}
              {call.comments.length > 0 && (
                <div className="mt-2 ml-11 bg-quatt-bg rounded-lg px-3 py-2">
                  <p className="text-xs text-quatt-text-secondary">
                    {call.comments[0].body}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {(page > 1 || hasMore) && (
        <div className="flex justify-center gap-3 mt-4 mb-8">
          {page > 1 && (
            <button
              onClick={() => loadCalls(page - 1)}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-quatt-text-secondary bg-white border border-quatt-border-light rounded-full hover:border-quatt-orange transition-colors disabled:opacity-50"
            >
              Vorige
            </button>
          )}
          <span className="px-3 py-2 text-sm text-quatt-text-secondary">
            Pagina {page}
          </span>
          {hasMore && (
            <button
              onClick={() => loadCalls(page + 1)}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-quatt-text-secondary bg-white border border-quatt-border-light rounded-full hover:border-quatt-orange transition-colors disabled:opacity-50"
            >
              Volgende
            </button>
          )}
        </div>
      )}

      {calls.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-quatt-text-secondary text-sm">
            Geen gesprekken gevonden
          </p>
        </div>
      )}
    </div>
  );
}
