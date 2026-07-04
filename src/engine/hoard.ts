import { BUILDINGS } from "../data/buildings";
import { DRAGONS } from "../data/dragons";
import type { DragonInstance } from "../state/store";

// Passive benefit (DESIGN.md ch. 7): buildings pre-load Aether for matching
// dragons at the start of every battle.
export function preloadAetherFor(speciesId: string, ownedBuildings: string[]): number {
  const species = DRAGONS[speciesId];
  let total = 0;
  for (const id of ownedBuildings) {
    const preload = BUILDINGS[id]?.benefit.preload;
    if (!preload) continue;
    const lineageMatch = preload.lineages?.includes(species.lineage) ?? false;
    const aspectMatch = preload.aspects?.includes(species.aspect) ?? false;
    if (lineageMatch || aspectMatch) total += preload.amount;
  }
  return total;
}

export function canAfford(materials: Record<string, number>, cost: Record<string, number>): boolean {
  return Object.entries(cost).every(([id, n]) => (materials[id] ?? 0) >= n);
}

export type MoltBlocker = "no-molt" | "battles" | "building" | "catalysts" | null;

// Why can't this dragon molt yet? null = ready (DESIGN.md ch. 5).
export function moltBlocker(
  dragon: DragonInstance,
  materials: Record<string, number>,
  ownedBuildings: string[],
): MoltBlocker {
  const species = DRAGONS[dragon.speciesId];
  if (!species.moltInto) return "no-molt";
  if (dragon.battlesWon < (species.moltBattlesNeeded ?? 3)) return "battles";
  if (species.moltBuilding && !ownedBuildings.includes(species.moltBuilding)) return "building";
  if (species.moltCatalysts && !canAfford(materials, species.moltCatalysts)) return "catalysts";
  return null;
}
