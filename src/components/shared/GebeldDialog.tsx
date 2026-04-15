import { useState } from "react";
import { PhoneOutgoing } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/Dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import { Label } from "@/components/ui/Label";
import { toast } from "@/lib/toast";
import { apiFetch } from "@/hooks/useAuth";
import type { AmActivity } from "@/lib/partner-types";

type CallOutcome = "gesprek_gehad" | "niet_opgenomen" | "voicemail";

interface GebeldDialogProps {
  partnerId: string;
  onSuccess: (activity: AmActivity) => void;
}

const OUTCOME_OPTIONS: { value: CallOutcome; label: string }[] = [
  { value: "gesprek_gehad", label: "Gesprek gehad" },
  { value: "niet_opgenomen", label: "Niet opgenomen" },
  { value: "voicemail", label: "Voicemail" },
];

const OUTCOME_DISPLAY: Record<CallOutcome, string> = {
  gesprek_gehad: "Gesprek gehad",
  niet_opgenomen: "Niet opgenomen",
  voicemail: "Voicemail",
};

export function GebeldDialog({ partnerId, onSuccess }: GebeldDialogProps) {
  const [open, setOpen] = useState(false);
  const [outcome, setOutcome] = useState<CallOutcome>("gesprek_gehad");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  function resetForm() {
    setOutcome("gesprek_gehad");
    setNotes("");
  }

  async function handleSubmit() {
    setSaving(true);
    try {
      const content = notes.trim()
        ? `${OUTCOME_DISPLAY[outcome]} - ${notes.trim()}`
        : OUTCOME_DISPLAY[outcome];

      const res = await apiFetch(`/api/partners/${partnerId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          note_type: "call",
          outcome,
          content,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Opslaan mislukt");
      }

      const data = await res.json();
      onSuccess(data.note);
      toast.success("Gesprek gelogd");
      setOpen(false);
      resetForm();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Opslaan mislukt";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) resetForm();
      }}
    >
      {/* Trigger button - matches existing action button styling */}
      <button
        onClick={() => setOpen(true)}
        className="bg-white border border-quatt-border-light text-quatt-black rounded-full py-3 px-4 text-sm font-semibold flex items-center justify-center gap-2 hover:border-quatt-orange hover:text-quatt-orange transition-colors"
      >
        <PhoneOutgoing className="w-4 h-4" />
        Gebeld
      </button>

      <DialogContent className="sm:max-w-[400px] rounded-[14px]">
        <DialogHeader>
          <DialogTitle className="text-base font-bold tracking-[-0.04em]">
            Gesprek loggen
          </DialogTitle>
          <DialogDescription className="text-xs text-quatt-text-secondary">
            Registreer een handmatig gesprek met deze partner.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Outcome radio group */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-quatt-text-secondary uppercase tracking-wide">
              Resultaat
            </Label>
            <RadioGroup
              value={outcome}
              onValueChange={(val) => setOutcome(val as CallOutcome)}
              className="grid gap-2"
            >
              {OUTCOME_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-3 cursor-pointer rounded-lg border border-quatt-border-light px-3 py-2.5 hover:border-quatt-orange transition-colors has-[:checked]:border-quatt-orange has-[:checked]:bg-quatt-orange/5"
                >
                  <RadioGroupItem value={opt.value} />
                  <span className="text-sm">{opt.label}</span>
                </label>
              ))}
            </RadioGroup>
          </div>

          {/* Notes textarea */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-quatt-text-secondary uppercase tracking-wide">
              Notities
            </Label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notities over het gesprek..."
              className="w-full bg-white rounded-[12px] px-4 py-3 text-[14px] border-[1.5px] border-quatt-border-mid focus:border-quatt-orange focus:outline-none transition-colors duration-150 resize-none placeholder:text-quatt-text-disabled"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="flex-row gap-2 sm:gap-2">
          <button
            onClick={() => {
              setOpen(false);
              resetForm();
            }}
            className="text-quatt-text-secondary text-sm font-medium hover:text-quatt-black transition-colors"
          >
            Annuleren
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-quatt-orange text-white rounded-full px-5 py-2 text-sm font-semibold disabled:opacity-50 hover:bg-quatt-orange/90 transition-colors"
          >
            {saving ? "Opslaan..." : "Opslaan"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
