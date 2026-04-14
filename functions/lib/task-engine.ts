import type { AmPartner } from "./partner-types";

export interface ComputedTask {
  type: string;
  label: string;
  partner_id: string;
  partner_name: string;
  contact_name: string | null;
  contact_phone: string | null;
  priority: "high" | "normal";
  due_context: string;
  suggested_action: string;
  assigned_am: string | null;
}

/**
 * THE SINGLE SOURCE OF TRUTH FOR AM TASKS.
 *
 * HubSpot handles emails and stage automation only.
 * All task intelligence lives here. AMs never open HubSpot.
 *
 * Design principles:
 * - Every non-Lost partner MUST have a next action (or be healthy/Active with recent contact)
 * - Tasks are persistent: they show as long as the condition is true
 * - Tasks escalate: priority goes from NORMAL to HIGH based on time
 * - Tasks are actionable: suggested_action tells the AM exactly what to do
 * - Tasks are contextual: due_context explains WHY this task exists
 */
export function computeTasks(
  partner: AmPartner,
  hasRecentContact: boolean,
): ComputedTask[] {
  // Lost partners get no tasks -- they're done
  if (partner.deal_stage === "Lost") return [];

  const tasks: ComputedTask[] = [];
  const base = {
    partner_id: partner.id,
    partner_name: partner.name,
    contact_name: partner.contact_name,
    contact_phone: partner.contact_phone,
    assigned_am: partner.assigned_am,
  };

  const contactName = partner.contact_name || partner.name;
  const dsc = partner.days_since_contact;
  const dam = partner.days_at_milestone;

  // ─────────────────────────────────────────────────────────
  // LEAD STAGE (M0) -- Get the partner moving
  // ─────────────────────────────────────────────────────────

  // 1. Eerste contact -- brand new lead, never contacted
  if (partner.current_milestone === 0 && !hasRecentContact && dsc >= 999) {
    tasks.push({
      ...base,
      type: "eerste_contact",
      label: "Eerste contact opnemen",
      priority: dam > 2 ? "high" : "normal",
      due_context: "Nieuwe lead -- nog geen contact gehad",
      suggested_action:
        `Bel ${contactName} om jezelf voor te stellen als accountmanager. ` +
        "Vraag naar hun huidige installatievolume en interesse in Quatt. " +
        "Leg het onboardingproces uit: overeenkomst tekenen, training volgen, portaal toegang, eerste bestelling. " +
        "Plan indien mogelijk direct een vervolggesprek of stuur de overeenkomst.",
    });
  }

  // 2. Eerste contact opvolgen -- contacted once, but no response/progress
  if (
    partner.current_milestone === 0 &&
    !hasRecentContact &&
    dsc > 0 &&
    dsc < 999
  ) {
    const isStale = dsc > 7;
    tasks.push({
      ...base,
      type: "opvolgen_eerste_contact",
      label: isStale ? "Lead dreigt af te haken" : "Opvolgen eerste contact",
      priority: dsc > 7 ? "high" : "normal",
      due_context: `${dsc}d sinds laatste contact -- geen voortgang`,
      suggested_action: isStale
        ? `${contactName} heeft ${dsc} dagen niet gereageerd. ` +
          "Bel nogmaals en vraag direct of er interesse is. " +
          "Zo ja: stuur overeenkomst en plan training in. " +
          "Zo nee: vraag waarom en noteer de reden. Overweeg om naar Inactive te verplaatsen als er geen interesse is."
        : `Bel ${contactName} terug. Vraag of de informatie duidelijk was en of er vragen zijn. ` +
          "Probeer de overeenkomst te laten tekenen of een concrete vervolgdatum te plannen.",
    });
  }

  // ─────────────────────────────────────────────────────────
  // ONBOARDING -- Guide through milestones
  // ─────────────────────────────────────────────────────────

  // 3. Overeenkomst check -- training done but agreement not signed (unusual order)
  if (partner.training_completed && !partner.agreement_signed) {
    tasks.push({
      ...base,
      type: "overeenkomst_check",
      label: "Overeenkomst laten tekenen",
      priority: dam > 7 ? "high" : "normal",
      due_context: "Training afgerond maar overeenkomst nog niet getekend",
      suggested_action:
        `${contactName} heeft de training al gevolgd maar nog niet getekend. ` +
        "Dit is ongebruikelijk -- check of er bezwaren zijn (prijs, voorwaarden, timing). " +
        "Stuur de overeenkomst opnieuw en bied aan om telefonisch door de voorwaarden te lopen.",
    });
  }

  // 4. Training inplannen -- agreement signed, training not yet booked (and not already completed)
  if (partner.agreement_signed && !partner.training_booked && !partner.training_completed) {
    tasks.push({
      ...base,
      type: "training_inplannen",
      label: "Training inplannen",
      priority: dam > 7 ? "high" : "normal",
      due_context: `Overeenkomst getekend${dam > 0 ? `, ${dam}d geleden` : ""} -- training nog niet ingepland`,
      suggested_action:
        `Bel ${contactName} om een trainingsdatum in te plannen. ` +
        "Leg uit wat de training inhoudt: productkennis Quatt, installatieprocedures, gebruik van het portaal. " +
        "Stuur na het plannen een bevestiging met datum, tijd en eventuele voorbereiding.",
    });
  }

  // 5. Training no-show -- training booked but not completed after 14+ days
  if (
    partner.training_booked &&
    !partner.training_completed &&
    dam > 14
  ) {
    tasks.push({
      ...base,
      type: "training_no_show",
      label: "Training niet afgerond -- opvolgen",
      priority: "high",
      due_context: `Training ingepland maar ${dam}d later nog niet afgerond`,
      suggested_action:
        `${contactName} heeft de training ingepland maar nog niet afgerond. Mogelijke no-show. ` +
        "Bel om te vragen wat er gebeurd is en plan direct een nieuwe datum. " +
        "Als de partner meerdere keren niet komt opdagen, bespreek met Rick.",
    });
  }

  // 6. Portaal toegang verlenen -- training done, no portal access yet
  if (partner.training_completed && !partner.portal_access) {
    tasks.push({
      ...base,
      type: "portal_toegang",
      label: "Portaal toegang regelen",
      priority: dam > 5 ? "high" : "normal",
      due_context: "Training afgerond -- partner wacht op portaal toegang",
      suggested_action:
        "Zorg dat de partner toegang krijgt tot het bestelportaal. " +
        "Controleer of het account is aangemaakt en stuur de inloggegevens. " +
        `Bel ${contactName} om te checken of inloggen lukt en loop samen door het eerste bestelproces.`,
    });
  }

  // 7. Eerste bestelling opvolgen -- fully onboarded but hasn't ordered yet
  if (
    partner.agreement_signed &&
    partner.training_completed &&
    partner.portal_access &&
    !partner.has_ordered
  ) {
    const isUrgent = dam > 14;
    tasks.push({
      ...base,
      type: "eerste_bestelling_opvolgen",
      label: isUrgent
        ? "Partner bestelt niet -- Loss risico"
        : "Eerste bestelling stimuleren",
      priority: isUrgent ? "high" : "normal",
      due_context: `Volledig onboarded maar ${dam}d geen bestelling geplaatst`,
      suggested_action: isUrgent
        ? `${contactName} is ${dam} dagen volledig onboarded maar bestelt niet. Dit is een risico. ` +
          "Bel en vraag direct wat hen tegenhoudt: technische vragen, prijs, timing, gebrek aan klanten? " +
          "Bied aan om samen de eerste bestelling te plaatsen via het portaal. " +
          "Als er geen concrete plannen zijn, bespreek met Rick of partner naar Inactive moet."
        : `Bel ${contactName} om te vragen of alles duidelijk is in het portaal. ` +
          "Vraag of er al een installatie gepland staat waar ze Quatt willen inzetten. " +
          "Bied aan om samen de eerste bestelling te doen zodat je het proces kunt begeleiden.",
    });
  }

  // ─────────────────────────────────────────────────────────
  // EERSTE BESTELLING -- The critical moment
  // ─────────────────────────────────────────────────────────

  // 8. Eerste installatie bezoek plannen -- just placed first order (active partners only)
  if (
    partner.has_ordered &&
    partner.current_milestone === 3 &&
    partner.deal_stage !== "Inactive" &&
    partner.deal_stage !== "Lost" &&
    dam <= 7
  ) {
    tasks.push({
      ...base,
      type: "eerste_installatie_bezoek",
      label: "Bezoek bij eerste installatie plannen",
      priority: "high",
      due_context: "Partner heeft eerste bestelling geplaatst!",
      suggested_action:
        `Geweldig -- ${contactName} heeft de eerste bestelling geplaatst! ` +
        "Dit is HET moment om de relatie te versterken. Plan een bezoek bij de eerste installatie:\n" +
        "- Bel de partner en vraag wanneer de installatie gepland staat\n" +
        "- Plan dat je erbij bent op de dag van installatie\n" +
        "- Tijdens het bezoek: loop alles samen door, beantwoord vragen, help waar nodig\n" +
        "- Check of de partner weet hoe garantie en service werken\n" +
        "- Vraag naar feedback: is alles duidelijk? Hoe was het bestelproces?\n" +
        "- Bespreek hun planning: hoeveel installaties verwachten ze de komende maanden?",
    });
  }

  // 9. Eerste installatie check-in -- first order but no visit planned yet (>7 days)
  if (
    partner.has_ordered &&
    partner.current_milestone === 3 &&
    partner.deal_stage !== "Inactive" &&
    partner.deal_stage !== "Lost" &&
    dam > 7 &&
    dam <= 21
  ) {
    tasks.push({
      ...base,
      type: "eerste_installatie_checkin",
      label: "Check-in na eerste bestelling",
      priority: dam > 14 ? "high" : "normal",
      due_context: `${dam}d sinds eerste bestelling`,
      suggested_action:
        `Bel ${contactName} om te vragen hoe de eerste installatie is gegaan. ` +
        "Vraag specifiek: was alles duidelijk? Hoe was de kwaliteit? Zijn er vragen over service/garantie? " +
        "Bespreek of er meer installaties gepland staan en stimuleer de volgende bestelling.",
    });
  }

  // ─────────────────────────────────────────────────────────
  // ACTIVE PARTNERS -- Keep them engaged and growing
  // ─────────────────────────────────────────────────────────

  // 10. Groei stimuleren -- active at M3 for a long time, not growing to M4
  if (
    partner.current_milestone === 3 &&
    partner.deal_stage === "Active" &&
    dam > 30 &&
    partner.order_count < 3
  ) {
    tasks.push({
      ...base,
      type: "groei_check",
      label: "Groei bespreken",
      priority: dam > 60 ? "high" : "normal",
      due_context: `${partner.order_count} bestelling${partner.order_count !== 1 ? "en" : ""} in ${dam} dagen -- groeit niet`,
      suggested_action:
        `${contactName} heeft ${partner.order_count} bestelling${partner.order_count !== 1 ? "en" : ""} in ${dam} dagen. ` +
        "Dat is minder dan verwacht. Bel om te bespreken:\n" +
        "- Hebben ze voldoende klanten die Quatt willen?\n" +
        "- Zijn er technische twijfels of slechte ervaringen geweest?\n" +
        "- Is het bestelproces duidelijk?\n" +
        "- Kunnen we helpen met marketing of lead generatie?",
    });
  }

  // 11. Periodieke follow-up -- active partner with no recent contact
  if (
    partner.current_milestone >= 3 &&
    partner.deal_stage !== "Inactive" &&
    partner.deal_stage !== "Lost" &&
    dsc > 14 &&
    !hasRecentContact
  ) {
    const isOverdue = dsc > 28;
    tasks.push({
      ...base,
      type: "follow_up",
      label: isOverdue ? "Contact dringend nodig" : "Follow-up gesprek",
      priority: isOverdue ? "high" : "normal",
      due_context: `${dsc}d geen contact`,
      suggested_action: isOverdue
        ? `Al ${dsc} dagen geen contact met ${contactName}. ` +
          "Dit is te lang -- er is risico dat de partner afhaakt. Bel vandaag nog. " +
          "Vraag hoe het gaat, of er installaties lopen, en of ze hulp nodig hebben. " +
          "Als partner niet bereikbaar is na 2 pogingen, overweeg Inactive status."
        : `Plan een kort check-in gesprek met ${contactName}. ` +
          "Vraag hoe het gaat met installaties, of er vragen zijn, en of je ergens mee kunt helpen. " +
          "Houd de relatie warm -- actieve partners die zich vergeten voelen bestellen minder.",
    });
  }

  // ─────────────────────────────────────────────────────────
  // INACTIVE -- Re-engage or close
  // ─────────────────────────────────────────────────────────

  // 12. Partner opvolgen -- inactive stage with escalation tiers
  if (partner.deal_stage === "Inactive") {
    const tier =
      dsc > 30 ? "escalatie" : dsc > 14 ? "urgent" : "actie";

    const labels: Record<string, string> = {
      actie: "Inactieve partner opvolgen",
      urgent: "Inactieve partner -- dreigt te verliezen",
      escalatie: "ESCALATIE -- partner al 30+ dagen inactief",
    };

    const actions: Record<string, string> = {
      actie:
        `Bel ${contactName} en vraag direct waarom ze niet meer actief zijn. ` +
        "Luister goed: is het tijdgebrek, technische problemen, concurrentie, of gebrek aan klanten? " +
        "Maak een concreet plan: wanneer gaan ze weer bestellen? Noteer de afspraak.",
      urgent:
        `${contactName} is al ${dsc} dagen inactief en heeft ${dsc > 14 ? `${dsc}d` : "recent"} geen contact gehad. ` +
        "Bel vandaag. Wees direct: 'We zien dat jullie al een tijd niet besteld hebben. " +
        "Klopt het dat jullie nog met Quatt willen werken?' " +
        "Als ja: maak concrete afspraken. Als nee: vraag waarom en noteer voor Rick.",
      escalatie:
        `ESCALATIE: ${contactName} is al ${dsc} dagen niet bereikt en staat op Inactive. ` +
        "Laatste poging: bel en mail dezelfde dag. Als geen reactie binnen 3 dagen, " +
        "bespreek met Rick of deze partner naar Lost moet. " +
        "Noteer alle contactpogingen in de timeline.",
    };

    tasks.push({
      ...base,
      type: "partner_opvolgen",
      label: labels[tier],
      priority: tier === "actie" ? "normal" : "high",
      due_context:
        dsc >= 999
          ? "Partner is inactief -- nooit contact gehad"
          : dsc > 0
            ? `Inactief, ${dsc}d geen contact`
            : "Partner is inactief",
      suggested_action: actions[tier],
    });
  }

  // ─────────────────────────────────────────────────────────
  // QUALITY & CERTIFICATION (M4 -> M5)
  // ─────────────────────────────────────────────────────────

  // 13. Kwaliteitscheck starten -- partner at M4 (3+ orders), not yet checked
  if (
    partner.current_milestone === 4 &&
    partner.deal_stage === "Active" &&
    partner.quality_check_status !== "passed" &&
    partner.quality_check_status !== "failed" &&
    partner.quality_check_status !== "retraining"
  ) {
    tasks.push({
      ...base,
      type: "kwaliteitscheck",
      label: "Kwaliteitscheck starten",
      priority: "normal",
      due_context: `${partner.order_count} bestellingen -- klaar voor kwaliteitscheck`,
      suggested_action:
        `${contactName} heeft ${partner.order_count} bestellingen gedaan en komt in aanmerking voor certificering. ` +
        "Start de kwaliteitscheck:\n" +
        "- Neem contact op met minimaal 2 klanten van deze partner\n" +
        "- Vraag naar installatie-ervaring en kwaliteit\n" +
        "- Controleer of de installaties aan Quatt-standaarden voldoen\n" +
        "- Rapporteer resultaten aan Rick voor certificeringsbesluit",
    });
  }

  // 14. Kwaliteitscheck mislukt -- needs retraining or follow-up
  if (partner.quality_check_status === "failed" || partner.quality_check_status === "retraining") {
    tasks.push({
      ...base,
      type: "kwaliteitscheck_opvolgen",
      label: partner.quality_check_status === "retraining"
        ? "Hertraining bespreken"
        : "Kwaliteitscheck mislukt -- actie nodig",
      priority: "high",
      due_context: `Kwaliteitscheck ${partner.quality_check_status === "retraining" ? "vereist hertraining" : "niet gehaald"}`,
      suggested_action:
        partner.quality_check_status === "retraining"
          ? `${contactName} moet hertraind worden na een onvoldoende kwaliteitscheck. ` +
            "Bel om dit te bespreken -- wees constructief maar duidelijk over wat er beter moet. " +
            "Plan een hertraining en leg uit welke punten extra aandacht nodig hebben."
          : `${contactName} heeft de kwaliteitscheck niet gehaald. ` +
            "Bespreek met Rick wat de vervolgstappen zijn: hertraining, waarschuwing, of beeindiging samenwerking.",
    });
  }

  return tasks;
}
