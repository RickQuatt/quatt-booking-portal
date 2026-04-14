export type Role = "admin" | "am";

export interface TeamMember {
  email: string;
  name: string;
  role: Role;
  hubspotOwnerId: string | null;
  assignedAmValue: string | null;
  aircallUserId: number | null;
}

const TEAM: TeamMember[] = [
  {
    email: "rick@quatt.io",
    name: "Rick Hakkaart",
    role: "admin",
    hubspotOwnerId: null,
    assignedAmValue: null,
    aircallUserId: 1737571,
  },
  {
    email: "daniel.m@quatt.io",
    name: "Daniel Mens",
    role: "am",
    hubspotOwnerId: "1605866474",
    assignedAmValue: "daniel",
    aircallUserId: null, // calls from personal 06, no Aircall needed
  },
  {
    email: "ralph@quatt.io",
    name: "Ralph Mient Peper",
    role: "am",
    hubspotOwnerId: "1157994210",
    assignedAmValue: "ralph",
    aircallUserId: 1749312,
  },
  {
    email: "mitchell.k@quatt.io",
    name: "Mitchell van Kleef",
    role: "am",
    hubspotOwnerId: "2128536513",
    assignedAmValue: "mitchell",
    aircallUserId: 1875284,
  },
];

export function getTeamMember(email: string): TeamMember | undefined {
  return TEAM.find((m) => m.email === email);
}

export function isTeamMember(email: string): boolean {
  return TEAM.some((m) => m.email === email);
}

export function getAllAMs(): TeamMember[] {
  return TEAM.filter((m) => m.role === "am");
}

export function getOwnerMap(): Record<string, string> {
  const map: Record<string, string> = {};
  for (const m of TEAM) {
    if (m.hubspotOwnerId && m.assignedAmValue) {
      map[m.hubspotOwnerId] = m.assignedAmValue;
    }
  }
  return map;
}

export function getTeamMemberByOwner(hubspotOwnerId: string): TeamMember | undefined {
  return TEAM.find((m) => m.hubspotOwnerId === hubspotOwnerId);
}

export function getTeamMemberByAircallId(aircallUserId: number): TeamMember | undefined {
  return TEAM.find((m) => m.aircallUserId === aircallUserId);
}

// Aircall phone lines used by the IC team - only show calls on these numbers
export const IC_AIRCALL_NUMBER_IDS = [
  1109160, // +31 85 888 4626 - Quatt Support Installatiebedrijven (Rick)
  1115338, // +31 20 808 2116 - Installer Channel - General phone line
];

// All Aircall user IDs in the IC team
export function getIcAircallUserIds(): number[] {
  return TEAM.filter((m) => m.aircallUserId).map((m) => m.aircallUserId!);
}
