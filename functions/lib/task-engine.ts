import type { AmPartner } from "./partner-types";

export interface ComputedTask {
  type: string;
  label: string;
  partner_id: string;
  partner_name: string;
  contact_phone: string | null;
  priority: "high" | "normal";
  due_context: string;
  assigned_am: string | null;
}

/**
 * Compute pending tasks for a partner based on their current state.
 * This is the SINGLE SOURCE OF TRUTH for AM tasks. HubSpot handles emails
 * and stage automation only -- all task intelligence lives here.
 *
 * Every non-Lost partner should have a next action. If a partner has no
 * computed task, either they're healthy (Active with recent contact) or
 * there's a gap in this engine.
 */
export function computeTasks(
  partner: AmPartner,
  hasRecentContact: boolean,
): ComputedTask[] {
  const tasks: ComputedTask[] = [];
  const base = {
    partner_id: partner.id,
    partner_name: partner.name,
    contact_phone: partner.contact_phone,
    assigned_am: partner.assigned_am,
  };

  // W7: Eerste contact -- new lead without recent call
  if (partner.current_milestone === 0 && !hasRecentContact) {
    tasks.push({
      ...base,
      type: "eerste_contact",
      label: "Eerste contact",
      priority: partner.days_since_contact > 3 ? "high" : "normal",
      due_context: partner.days_since_contact >= 999
        ? "Nog geen contact gehad"
        : `${partner.days_since_contact}d geen contact`,
    });
  }

  // W1: Training inplannen -- agreement signed, training not booked
  if (partner.agreement_signed && !partner.training_booked) {
    tasks.push({
      ...base,
      type: "training_inplannen",
      label: "Training inplannen",
      priority: "normal",
      due_context: "Overeenkomst getekend, training nog niet ingepland",
    });
  }

  // W2: Overeenkomst check -- training done, agreement not signed
  if (partner.training_completed && !partner.agreement_signed) {
    tasks.push({
      ...base,
      type: "overeenkomst_check",
      label: "Overeenkomst check",
      priority: "normal",
      due_context: "Training afgerond, overeenkomst nog niet getekend",
    });
  }

  // W4: Eerste bestelling -- just ordered (milestone 3, within first few days)
  if (partner.has_ordered && partner.current_milestone === 3 && partner.days_at_milestone <= 3) {
    tasks.push({
      ...base,
      type: "eerste_bestelling",
      label: "Eerste bestelling! Check partner",
      priority: "high",
      due_context: "Partner heeft eerste bestelling geplaatst",
    });
  }

  // Gap 1: Opvolgen lead -- contacted but no milestone progress in 7+ days
  if (
    partner.deal_stage === "Lead" &&
    partner.current_milestone === 0 &&
    hasRecentContact === false &&
    partner.days_since_contact > 0 &&
    partner.days_since_contact < 999 &&
    partner.days_at_milestone > 7
  ) {
    tasks.push({
      ...base,
      type: "opvolgen_lead",
      label: "Opvolgen lead",
      priority: partner.days_at_milestone > 14 ? "high" : "normal",
      due_context: `${partner.days_at_milestone}d geen voortgang na eerste contact`,
    });
  }

  // Gap 2: Eerste bestelling opvolgen -- fully onboarded but no order yet
  if (
    partner.agreement_signed &&
    partner.training_completed &&
    partner.portal_access &&
    !partner.has_ordered &&
    partner.days_at_milestone > 7
  ) {
    tasks.push({
      ...base,
      type: "eerste_bestelling_opvolgen",
      label: "Eerste bestelling opvolgen",
      priority: partner.days_at_milestone > 14 ? "high" : "normal",
      due_context: `Volledig onboarded, ${partner.days_at_milestone}d geen bestelling`,
    });
  }

  // W6: Partner opvolgen -- inactive stage
  if (partner.deal_stage === "Inactive") {
    tasks.push({
      ...base,
      type: "partner_opvolgen",
      label: "Partner opvolgen of afsluiten",
      priority: "high",
      due_context: partner.days_since_contact > 30
        ? `Inactief, ${partner.days_since_contact}d geen contact -- ESCALATIE`
        : partner.days_since_contact > 0 && partner.days_since_contact < 999
          ? `Inactief, ${partner.days_since_contact}d geen contact`
          : "Partner is inactief",
    });
  }

  // Portal toegang -- training done but no portal access
  if (partner.training_completed && !partner.portal_access) {
    tasks.push({
      ...base,
      type: "portal_toegang",
      label: "Portaal toegang verlenen",
      priority: "normal",
      due_context: "Training afgerond, nog geen portaal toegang",
    });
  }

  // General follow-up -- active partner with no recent contact (14+ days)
  if (
    partner.current_milestone >= 3 &&
    partner.deal_stage !== "Inactive" &&
    partner.deal_stage !== "Lost" &&
    partner.days_since_contact > 14 &&
    !hasRecentContact
  ) {
    tasks.push({
      ...base,
      type: "follow_up",
      label: "Follow-up gesprek",
      priority: partner.days_since_contact > 28 ? "high" : "normal",
      due_context: `${partner.days_since_contact}d geen contact`,
    });
  }

  return tasks;
}
