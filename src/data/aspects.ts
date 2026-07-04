// The six-aspect effectiveness ring (DESIGN.md ch. 3.3).
// Each aspect is STRONG against the next one in the ring, WEAK against the previous.
export type AspectId = "inferno" | "frost" | "blight" | "aether" | "tempest" | "terra";

export const ASPECT_RING: AspectId[] = ["inferno", "frost", "blight", "aether", "tempest", "terra"];

export const STRONG_MULTIPLIER = 1.5;
export const WEAK_MULTIPLIER = 0.5;

export interface AspectInfo {
  id: AspectId;
  name: string;
  emoji: string;
  // Tailwind classes so aspect colors stay consistent across screens.
  badgeClass: string;
}

export const ASPECTS: Record<AspectId, AspectInfo> = {
  inferno: { id: "inferno", name: "Inferno", emoji: "🔥", badgeClass: "bg-orange-600" },
  frost: { id: "frost", name: "Frost", emoji: "❄️", badgeClass: "bg-cyan-600" },
  blight: { id: "blight", name: "Blight", emoji: "🍄", badgeClass: "bg-lime-700" },
  aether: { id: "aether", name: "Aether", emoji: "✨", badgeClass: "bg-violet-600" },
  tempest: { id: "tempest", name: "Tempest", emoji: "🌪️", badgeClass: "bg-sky-600" },
  terra: { id: "terra", name: "Terra", emoji: "⛰️", badgeClass: "bg-amber-700" },
};

export function aspectMultiplier(attacker: AspectId, defender: AspectId): number {
  const i = ASPECT_RING.indexOf(attacker);
  const next = ASPECT_RING[(i + 1) % ASPECT_RING.length];
  const prev = ASPECT_RING[(i + ASPECT_RING.length - 1) % ASPECT_RING.length];
  if (defender === next) return STRONG_MULTIPLIER;
  if (defender === prev) return WEAK_MULTIPLIER;
  return 1;
}
