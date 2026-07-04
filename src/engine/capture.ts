import { DRAGONS } from "../data/dragons";
import type { BattleState } from "./battle";

// The Tethering Ritual (DESIGN.md ch. 4): break the Will through combat, then
// answer a timed chain of problems to tighten the tether link by link.

export const WILL_BREAK_AT = 0.5; // Will breaks at half HP — then tethering opens
export const RITUAL_SECONDS_PER_PROBLEM = 20;
export const RITUAL_MISSES_ALLOWED = 2;

export function willOf(state: BattleState): number {
  return state.enemy.hp / state.enemy.maxHp;
}

export function willBroken(state: BattleState): boolean {
  return willOf(state) <= WILL_BREAK_AT;
}

// Tougher life stages demand longer chains.
const LINKS_BY_STAGE = { hatchling: 3, fledgling: 4, apex: 5, elder: 6 } as const;

export function linksNeeded(speciesId: string): number {
  return LINKS_BY_STAGE[DRAGONS[speciesId].stage];
}
