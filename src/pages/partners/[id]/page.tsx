import { useParams, useLocation } from "wouter";
import { useState, useEffect } from "react";
import type { AmPartner, AmActivity } from "@/lib/partner-types";
import { MILESTONE_LABELS } from "@/lib/partner-types";
import type { AircallCall } from "@/lib/aircall-types";
import { apiFetch } from "@/hooks/useAuth";
import { MilestoneBadge } from "@/components/shared/MilestoneBadge";
import { MilestoneProgress } from "@/components/shared/MilestoneProgress";
import { VoiceMemo } from "@/components/shared/VoiceMemo";
import { GebeldDialog } from "@/components/shared/GebeldDialog";
import { useAuth } from "@/hooks/useAuth";

export function PartnerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [partner, setPartner] = useState<AmPartner | null>(null);
  const [activities, setActivities] = useState<AmActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNote, setShowNote] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [saving, setSaving] = useState(false);
  const [aircallCalls, setAircallCalls] = useState<AircallCall[]>([]);
  const [dialing, setDialing] = useState(false);
  const [editingPhone, setEditingPhone] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [savingContact, setSavingContact] = useState(false);

  const hasAircall = user?.hasAircall ?? false;

  useEffect(() => {
    async function load() {
      try {
        const [partnerRes, notesRes] = await Promise.all([
          apiFetch(`/api/partners/${id}`),
          apiFetch(`/api/partners/${id}/notes`),
        ]);
        if (partnerRes.ok) {
          const data = await partnerRes.json();
          setPartner(data.partner);
          // Fetch Aircall history if partner has a phone number
          if (data.partner?.contact_phone) {
            const aircallRes = await fetch(
              `/api/aircall?phone=${encodeURIComponent(data.partner.contact_phone)}`,
            );
            if (aircallRes.ok) {
              const aircallData = await aircallRes.json();
              setAircallCalls(aircallData.calls || []);
            }
          }
        }
        if (notesRes.ok) {
          const data = await notesRes.json();
          setActivities(data.notes);
        }
      } catch (err) {
        console.error("Failed to load partner:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function saveContactField(
    field: "contact_phone" | "contact_name",
    value: string,
  ) {
    setSavingContact(true);
    try {
      const res = await fetch(`/api/partners/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      if (res.ok && partner) {
        setPartner({ ...partner, [field]: value || null });
      }
    } catch (err) {
      console.error("Failed to save:", err);
    } finally {
      setSavingContact(false);
      setEditingPhone(false);
      setEditingName(false);
    }
  }

  async function handleDial(phoneNumber: string) {
    setDialing(true);
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
      setDialing(false);
    }
  }

  async function saveNote() {
    if (!noteText.trim() || !partner) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/partners/${id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: noteText, note_type: "note" }),
      });
      if (res.ok) {
        const data = await res.json();
        setActivities((prev) => [data.note, ...prev]);
        setNoteText("");
        setShowNote(false);
      }
    } catch (err) {
      console.error("Failed to save note:", err);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-quatt-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-quatt-text-secondary">Partner niet gevonden</p>
      </div>
    );
  }

  const activityIcon = (type: string) => {
    const iconMap: Record<string, { bg: string; color: string; d: string }> = {
      call: {
        bg: "bg-quatt-selected-bg",
        color: "text-quatt-green",
        d: "M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z",
      },
      email: {
        bg: "bg-quatt-warning-bg",
        color: "text-quatt-warning-text",
        d: "M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75",
      },
      milestone: {
        bg: "bg-quatt-success-bg",
        color: "text-quatt-success-text",
        d: "M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
      },
      order: {
        bg: "bg-quatt-orange/10",
        color: "text-quatt-orange",
        d: "M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z",
      },
    };
    const config = iconMap[type] || {
      bg: "bg-quatt-bg",
      color: "text-quatt-text-secondary",
      d: "M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z",
    };
    return (
      <div
        className={`w-7 h-7 rounded-full ${config.bg} flex items-center justify-center`}
      >
        <svg
          className={`w-3.5 h-3.5 ${config.color}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d={config.d}
          />
        </svg>
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <button
        onClick={() => setLocation("/partners")}
        className="text-quatt-text-secondary text-sm mb-3 flex items-center gap-1 hover:text-quatt-black transition-colors"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 19.5 8.25 12l7.5-7.5"
          />
        </svg>
        Terug
      </button>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-[-0.04em] text-quatt-ink">
            {partner.contact_name || partner.name}
          </h1>
          <p className="text-sm text-quatt-text-secondary">{partner.name}</p>
        </div>
        <MilestoneBadge level={partner.current_milestone} size="md" />
      </div>

      <div>
        {/* Contact info - editable */}
        <div className="mt-3 bg-white rounded-[14px] p-4 border border-quatt-border-light space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-quatt-text-secondary uppercase tracking-wide">
              Contactpersoon
            </p>
          </div>
          {editingName ? (
            <div className="flex gap-2">
              <input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Naam contactpersoon"
                className="flex-1 text-sm border border-quatt-border-mid rounded-lg px-3 py-1.5 focus:border-quatt-orange focus:outline-none"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter")
                    saveContactField("contact_name", nameInput);
                  if (e.key === "Escape") setEditingName(false);
                }}
              />
              <button
                onClick={() => saveContactField("contact_name", nameInput)}
                disabled={savingContact}
                className="text-xs font-medium text-quatt-orange"
              >
                {savingContact ? "..." : "Opslaan"}
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setNameInput(partner.contact_name || "");
                setEditingName(true);
              }}
              className="text-sm text-left w-full hover:text-quatt-orange transition-colors"
            >
              {partner.contact_name || (
                <span className="text-quatt-text-disabled">
                  + Naam toevoegen
                </span>
              )}
            </button>
          )}
          {editingPhone ? (
            <div className="flex gap-2">
              <input
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="+31 6 12345678"
                type="tel"
                className="flex-1 text-sm border border-quatt-border-mid rounded-lg px-3 py-1.5 focus:border-quatt-orange focus:outline-none"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter")
                    saveContactField("contact_phone", phoneInput);
                  if (e.key === "Escape") setEditingPhone(false);
                }}
              />
              <button
                onClick={() => saveContactField("contact_phone", phoneInput)}
                disabled={savingContact}
                className="text-xs font-medium text-quatt-orange"
              >
                {savingContact ? "..." : "Opslaan"}
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setPhoneInput(partner.contact_phone || "");
                setEditingPhone(true);
              }}
              className="text-sm text-left w-full hover:text-quatt-orange transition-colors flex items-center gap-2"
            >
              <svg
                className="w-3.5 h-3.5 text-quatt-text-secondary"
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
              {partner.contact_phone || (
                <span className="text-quatt-text-disabled">
                  + Telefoonnummer toevoegen
                </span>
              )}
            </button>
          )}
        </div>

        {/* Priority alert */}
        {partner.priority === "high" && (
          <div className="mt-3 bg-quatt-error-bg border border-quatt-error-border rounded-xl p-3">
            <p className="text-xs font-semibold text-quatt-error-text mb-1">
              Aandacht nodig
            </p>
            <p className="text-xs text-quatt-error-text">
              {partner.priority_reason}
            </p>
          </div>
        )}

        {/* Quick actions */}
        <div className="mt-3 flex gap-2">
          {partner.contact_phone && hasAircall && (
            <button
              onClick={() => handleDial(partner.contact_phone!)}
              disabled={dialing}
              className="flex-1 bg-quatt-orange text-white rounded-full py-3 text-center text-sm font-semibold flex items-center justify-center gap-2 hover:bg-quatt-orange/90 disabled:opacity-50 transition-colors"
            >
              <svg
                className="w-4 h-4"
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
              {dialing ? "Bellen..." : "Bel via Aircall"}
            </button>
          )}
          {partner.contact_phone && !hasAircall && (
            <a
              href={`tel:${partner.contact_phone}`}
              className="flex-1 bg-quatt-orange text-white rounded-full py-3 text-center text-sm font-semibold flex items-center justify-center gap-2"
            >
              <svg
                className="w-4 h-4"
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
              Bellen
            </a>
          )}
          {partner.contact_phone && (
            <a
              href={`https://wa.me/${partner.contact_phone.replace(/[^0-9+]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-[#25D366] text-white rounded-full py-3 text-center text-sm font-semibold flex items-center justify-center gap-2"
            >
              WhatsApp
            </a>
          )}
          <GebeldDialog
            partnerId={partner.id}
            onSuccess={(activity) => {
              setActivities((prev) => [activity, ...prev]);
              // Update last_contact_date optimistically
              setPartner({
                ...partner,
                last_contact_date: new Date().toISOString(),
                last_contact_method: "call",
                days_since_contact: 0,
              });
            }}
          />
          <button
            onClick={() => setShowNote(!showNote)}
            className="bg-white border border-quatt-border-light text-quatt-black rounded-full py-3 px-4 text-sm font-semibold flex items-center justify-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
              />
            </svg>
            Notitie
          </button>
        </div>

        {/* Note input */}
        {showNote && (
          <div className="mt-2">
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Schrijf een notitie..."
              className="w-full bg-white rounded-[12px] px-4 py-3 text-[16px] border-[1.5px] border-quatt-border-mid focus:border-quatt-orange focus:outline-none transition-colors duration-150 resize-none placeholder:text-quatt-text-disabled"
              rows={3}
              autoFocus
            />
            <div className="flex gap-2 mt-1">
              <button
                onClick={saveNote}
                disabled={saving || !noteText.trim()}
                className="bg-quatt-orange text-white rounded-full px-4 py-1.5 text-xs font-semibold disabled:opacity-50"
              >
                {saving ? "Opslaan..." : "Opslaan"}
              </button>
              <button
                onClick={() => {
                  setShowNote(false);
                  setNoteText("");
                }}
                className="text-quatt-text-secondary text-xs"
              >
                Annuleren
              </button>
            </div>
          </div>
        )}

        {/* Info grid */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="bg-white rounded-[14px] p-4 border border-quatt-border-light">
            <p className="text-[10px] text-quatt-text-secondary uppercase tracking-wide">
              Laatste contact
            </p>
            <p className="text-sm font-semibold mt-0.5">
              {partner.last_contact_date
                ? `${partner.days_since_contact} dagen geleden`
                : "Nooit"}
            </p>
            {partner.last_contact_method && (
              <p className="text-xs text-quatt-text-secondary capitalize">
                {partner.last_contact_method}
              </p>
            )}
          </div>
          <div className="bg-white rounded-[14px] p-4 border border-quatt-border-light">
            <p className="text-[10px] text-quatt-text-secondary uppercase tracking-wide">
              Huidige fase
            </p>
            <p className="text-sm font-semibold mt-0.5">
              {MILESTONE_LABELS[partner.current_milestone]}
            </p>
            <p className="text-xs text-quatt-text-secondary">
              {partner.days_at_milestone} dagen
            </p>
          </div>
          <div className="bg-white rounded-[14px] p-4 border border-quatt-border-light">
            <p className="text-[10px] text-quatt-text-secondary uppercase tracking-wide">
              Bestellingen
            </p>
            <p className="text-sm font-semibold mt-0.5">
              {partner.order_count}
            </p>
            {partner.total_revenue > 0 && (
              <p className="text-xs text-quatt-text-secondary">
                {partner.total_revenue.toLocaleString("nl-NL", {
                  style: "currency",
                  currency: "EUR",
                })}
              </p>
            )}
          </div>
          <div className="bg-white rounded-[14px] p-4 border border-quatt-border-light">
            <p className="text-[10px] text-quatt-text-secondary uppercase tracking-wide">
              Regio
            </p>
            <p className="text-sm font-semibold mt-0.5">
              {partner.city || "-"}
            </p>
            <p className="text-xs text-quatt-text-secondary">
              {partner.region || "-"}
            </p>
          </div>
        </div>

        {/* Deal stage + Milestone editing */}
        <div className="mt-3 bg-white rounded-[14px] p-5 border border-quatt-border-light">
          {/* Deal stage dropdown */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm tracking-[-0.04em]">Stage</h3>
            <select
              value={partner.deal_stage || "Lead"}
              onChange={async (e) => {
                const newStage = e.target.value;
                const oldStage = partner.deal_stage;
                setPartner({ ...partner, deal_stage: newStage });
                try {
                  const res = await apiFetch(`/api/partners/${id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ deal_stage: newStage }),
                  });
                  if (!res.ok) {
                    setPartner({ ...partner, deal_stage: oldStage });
                  }
                } catch {
                  setPartner({ ...partner, deal_stage: oldStage });
                }
              }}
              className="text-sm bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 focus:border-quatt-orange focus:outline-none"
            >
              {["Lead", "Onboarding", "Active", "Inactive", "Lost"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Milestone checkboxes */}
          <h3 className="font-semibold text-sm tracking-[-0.04em] mb-2">Onboarding</h3>
          <div className="space-y-2">
            {([
              { field: "onboarding_agreement_signed", key: "agreement_signed", label: "Overeenkomst getekend" },
              { field: "onboarding_training_booked", key: "training_booked", label: "Training ingepland" },
              { field: "onboarding_training_completed", key: "training_completed", label: "Training afgerond" },
              { field: "portal_access", key: "portal_access", label: "Portaal toegang" },
              { field: "has_ordered", key: "has_ordered", label: "Eerste bestelling" },
            ] as const).map(({ field, key, label }) => (
              <label
                key={field}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={partner[key]}
                  onChange={async (e) => {
                    const newVal = e.target.checked;
                    const oldPartner = { ...partner };
                    setPartner({ ...partner, [key]: newVal });
                    try {
                      const res = await apiFetch(`/api/partners/${id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ [field]: newVal }),
                      });
                      if (!res.ok) {
                        setPartner(oldPartner);
                      }
                    } catch {
                      setPartner(oldPartner);
                    }
                  }}
                  className="w-4 h-4 rounded border-gray-300 text-quatt-orange focus:ring-quatt-orange accent-quatt-orange"
                />
                <span className="text-sm text-quatt-ink group-hover:text-quatt-orange transition-colors">
                  {label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Milestone progress (visual) */}
        <div className="mt-3">
          <MilestoneProgress partner={partner} />
        </div>

        {/* Voice memo */}
        <div className="mt-3">
          <VoiceMemo
            companyId={partner.id}
            partnerName={partner.contact_name || partner.name}
          />
        </div>

        {/* Last note */}
        {partner.last_note && (
          <div className="mt-3">
            <div className="bg-white rounded-[14px] p-5 border border-quatt-border-light">
              <h3 className="font-semibold text-sm tracking-[-0.04em] mb-1">
                Laatste notitie
              </h3>
              <p className="text-xs text-quatt-text-secondary">
                {partner.last_note}
              </p>
            </div>
          </div>
        )}

        {/* Aircall history */}
        {aircallCalls.length > 0 && (
          <div className="mt-3">
            <div className="bg-white rounded-[14px] p-5 border border-quatt-border-light">
              <h3 className="font-semibold text-sm tracking-[-0.04em] mb-3">
                Aircall gesprekken
              </h3>
              <div className="space-y-3">
                {aircallCalls.map((call) => (
                  <div key={call.id} className="flex items-start gap-3">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center ${
                        call.missed_call_reason
                          ? "bg-red-50"
                          : call.direction === "inbound"
                            ? "bg-blue-50"
                            : "bg-green-50"
                      }`}
                    >
                      <svg
                        className={`w-3.5 h-3.5 ${
                          call.missed_call_reason
                            ? "text-red-600"
                            : call.direction === "inbound"
                              ? "text-blue-600"
                              : "text-green-600"
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
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium">
                          {call.missed_call_reason
                            ? "Gemist"
                            : call.direction === "inbound"
                              ? "Inkomend"
                              : "Uitgaand"}
                        </span>
                        {call.duration > 0 && (
                          <span className="text-[10px] text-quatt-text-secondary">
                            {Math.floor(call.duration / 60)}m{" "}
                            {call.duration % 60}s
                          </span>
                        )}
                        {call.user && (
                          <span className="text-[10px] text-quatt-text-secondary">
                            {call.user.name.split(" ")[0]}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-quatt-text-secondary mt-0.5">
                        {new Date(call.started_at * 1000).toLocaleString(
                          "nl-NL",
                          {
                            day: "numeric",
                            month: "long",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </p>
                      {call.comments.length > 0 && (
                        <p className="text-xs text-quatt-text-secondary mt-1 bg-quatt-bg rounded-lg px-2 py-1">
                          {call.comments[0].body}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Activity timeline */}
        <div className="mt-3 mb-4">
          <div className="bg-white rounded-[14px] p-5 border border-quatt-border-light">
            <h3 className="font-semibold text-sm tracking-[-0.04em] mb-3">
              Activiteit
            </h3>
            {activities.length === 0 ? (
              <p className="text-xs text-quatt-text-secondary">
                Geen activiteit gevonden
              </p>
            ) : (
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex gap-3">
                    {activityIcon(activity.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs">{activity.summary}</p>
                      <p className="text-[10px] text-quatt-text-secondary mt-0.5">
                        {new Date(activity.date).toLocaleDateString("nl-NL", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
