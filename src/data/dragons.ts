import type { AspectId } from "./aspects";
import type { LineageId } from "./lineages";

export type LifeStage = "hatchling" | "fledgling" | "apex" | "elder";

// A species definition — content only, no logic (DESIGN.md ch. 10-11).
export interface DragonSpecies {
  id: string;
  name: string;
  emoji: string;
  lineage: LineageId;
  aspect: AspectId;
  stage: LifeStage;
  baseStats: { hp: number };
  moves: string[]; // ids into MOVES
  // Molting (DESIGN.md ch. 5): what this species becomes, what it costs,
  // and which Hoard building must exist first. Filled in from Phase 5 on.
  moltInto?: string;
  moltCatalysts?: Record<string, number>; // materialId -> amount
  moltBuilding?: string; // building id required in the Hoard
  moltBattlesNeeded?: number; // combat threshold before a molt can start
  description: string;
}

export const DRAGONS: Record<string, DragonSpecies> = {
  cinderling: {
    id: "cinderling",
    name: "Cinderling",
    emoji: "🐉",
    lineage: "wyvern",
    aspect: "inferno",
    stage: "hatchling",
    baseStats: { hp: 30 },
    moves: ["ember_bite", "cinder_breath"],
    moltInto: "pyrewing",
    moltCatalysts: { emberwood: 6, brimstone: 4 },
    moltBuilding: "ember_forge",
    moltBattlesNeeded: 3,
    description: "A spark-hearted Inferno Wyvern hatchling. Quick and eager.",
  },
  boulderback: {
    id: "boulderback",
    name: "Boulderback",
    emoji: "🦕",
    lineage: "drake",
    aspect: "terra",
    stage: "hatchling",
    baseStats: { hp: 34 },
    moves: ["rock_slam", "stone_spray"],
    moltBattlesNeeded: 3,
    description: "A stony Terra Drake. Slow, tough, and stubborn.",
  },
  zephyrix: {
    id: "zephyrix",
    name: "Zephyrix",
    emoji: "🦅",
    lineage: "celestial",
    aspect: "tempest",
    stage: "fledgling",
    baseStats: { hp: 34 },
    moves: ["gale_slash", "storm_surge", "fogbank"],
    description: "A storm-born Tempest Celestial that dances between the clouds.",
  },
  pyrewing: {
    id: "pyrewing",
    name: "Pyrewing",
    emoji: "🐲",
    lineage: "wyvern",
    aspect: "inferno",
    stage: "fledgling",
    baseStats: { hp: 44 },
    moves: ["pyre_talons", "cinder_breath", "inferno_wave"],
    description: "Cinderling grown into a blazing Fledgling — wings of live flame.",
  },
};
