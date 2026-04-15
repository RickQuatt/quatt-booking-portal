export type MilestoneLevel = 0 | 1 | 2 | 3 | 4 | 5;

export interface AmPartner {
  id: string;
  hubspot_deal_id: string | null;
  name: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  city: string | null;
  postcode: string | null;
  region: string | null;

  // Milestone progress (from HubSpot IC properties)
  current_milestone: MilestoneLevel;
  agreement_signed: boolean;
  training_booked: boolean;
  training_completed: boolean;
  portal_access: boolean;
  has_ordered: boolean;

  // Milestone dates (from HubSpot or computed)
  milestone_dates: {
    m1_contract_signed: string | null;
    m2_training_completed: string | null;
    m3_first_order: string | null;
    m4_proven: string | null;
    m5_certified: string | null;
  };

  // Activity tracking
  last_contact_date: string | null;
  last_contact_method: string | null;
  last_note: string | null;
  days_since_contact: number;
  days_at_milestone: number;

  // Pipeline info
  deal_stage: string | null;
  assigned_am: string | null;
  hubspot_owner_id: string | null;

  // Priority (computed)
  priority: "high" | "medium" | "low";
  priority_reason: string;
  priority_score: number;

  // Orders
  order_count: number;
  total_revenue: number;

  // Quality check (M5)
  quality_check_status: "pending" | "passed" | "failed" | "retraining" | null;
  customer_calls_made: number;

  created_at: string;
}

export interface AmActivity {
  id: string;
  company_id: string;
  date: string;
  type: "call" | "email" | "meeting" | "note" | "milestone" | "order";
  summary: string;
  details?: string;
  author_email: string;
}

export interface AmCallQueueItem {
  partner: AmPartner;
  reason: string;
  suggested_action: string;
  context: string;
}

export interface AmStats {
  total_partners: number;
  milestone_distribution: Record<MilestoneLevel, number>;
  contacted_this_week: number;
  progressed_this_week: number;
  stuck_partners: number;
  new_leads: number;
}

export const DEAL_STAGES = ["Lead", "Onboarding", "Active", "Inactive", "Lost"] as const;
export type DealStage = (typeof DEAL_STAGES)[number];

export const MILESTONE_LABELS: Record<MilestoneLevel, string> = {
  0: "Lead",
  1: "Contract",
  2: "Trained",
  3: "First Order",
  4: "Proven (3x)",
  5: "Certified",
};

export const MILESTONE_SHORT: Record<MilestoneLevel, string> = {
  0: "M0",
  1: "M1",
  2: "M2",
  3: "M3",
  4: "M4",
  5: "M5",
};

export function computeMilestone(partner: {
  agreement_signed: boolean;
  training_completed: boolean;
  has_ordered: boolean;
  order_count?: number;
  quality_check_status?: string | null;
}): MilestoneLevel {
  if (partner.quality_check_status === "passed") return 5;
  if ((partner.order_count ?? 0) >= 3) return 4;
  if (partner.has_ordered) return 3;
  if (partner.training_completed) return 2;
  if (partner.agreement_signed) return 1;
  return 0;
}

export function computePriority(partner: {
  days_since_contact: number;
  days_at_milestone: number;
  current_milestone: MilestoneLevel;
}): { score: number; level: "high" | "medium" | "low"; reason: string } {
  let score = 0;
  const reasons: string[] = [];

  // Days since last contact (max 40 points)
  if (partner.days_since_contact > 14) {
    score += Math.min(partner.days_since_contact, 40);
    reasons.push(`${partner.days_since_contact}d geen contact`);
  }

  // Days stuck at milestone (max 30 points)
  if (partner.days_at_milestone > 14) {
    score += Math.min(partner.days_at_milestone, 30);
    reasons.push(`${partner.days_at_milestone}d bij M${partner.current_milestone}`);
  }

  // Stage urgency (max 20 points)
  if (partner.current_milestone === 0) {
    score += 15;
    reasons.push("Nieuwe lead");
  }
  if (partner.current_milestone === 1) {
    score += 10;
    reasons.push("Wacht op training");
  }

  // No orders after training (max 10 points)
  if (partner.current_milestone === 2 && partner.days_at_milestone > 7) {
    score += 10;
    reasons.push("Getraind, geen bestelling");
  }

  const level = score >= 50 ? "high" : score >= 25 ? "medium" : "low";
  return { score, level, reason: reasons.join(", ") };
}
