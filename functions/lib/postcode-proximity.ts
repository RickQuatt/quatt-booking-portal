/**
 * Dutch postcode proximity scoring.
 *
 * Uses the first digit of a 4-digit Dutch postcode to determine region.
 * Same digit = same region (distance 0), adjacent digits = nearby (distance 1).
 * No external geocoding API -- just prefix matching.
 */

/** Extract the first digit from a Dutch postcode string (e.g., "1017AB" -> "1") */
function extractPrefix(postcode: string | null): string | null {
  if (!postcode) return null;
  const cleaned = postcode.replace(/\s/g, "").trim();
  const match = cleaned.match(/^(\d)/);
  return match ? match[1] : null;
}

/**
 * Score proximity between an AM's home region and a partner's postcode.
 * Returns 0 (same region), 1 (adjacent), or null (no data / too far).
 */
export function getProximityScore(
  amPostcodePrefix: string | null,
  partnerPostcode: string | null,
): number | null {
  if (!amPostcodePrefix || !partnerPostcode) return null;

  const partnerPrefix = extractPrefix(partnerPostcode);
  if (!partnerPrefix) return null;

  const amDigit = parseInt(amPostcodePrefix, 10);
  const partnerDigit = parseInt(partnerPrefix, 10);

  if (isNaN(amDigit) || isNaN(partnerDigit)) return null;

  const distance = Math.abs(amDigit - partnerDigit);
  if (distance === 0) return 0; // same region
  if (distance === 1) return 1; // adjacent region
  return null; // too far
}

/**
 * Check if a partner is "nearby" the AM (same or adjacent postcode region).
 */
export function isNearby(
  amPostcodePrefix: string | null,
  partnerPostcode: string | null,
): boolean {
  const score = getProximityScore(amPostcodePrefix, partnerPostcode);
  return score !== null;
}

/** Region labels for display */
const REGION_NAMES: Record<string, string> = {
  "1": "Amsterdam/Noord-Holland",
  "2": "Den Haag/Zuid-Holland",
  "3": "Utrecht/Rotterdam",
  "4": "Zeeland/West-Brabant",
  "5": "Oost-Brabant/Noord-Limburg",
  "6": "Limburg/Zuid-Gelderland",
  "7": "Overijssel/Noord-Gelderland",
  "8": "Flevoland/Friesland",
  "9": "Groningen/Drenthe",
};

export function getRegionName(postcode: string | null): string | null {
  const prefix = extractPrefix(postcode);
  return prefix ? REGION_NAMES[prefix] ?? null : null;
}
