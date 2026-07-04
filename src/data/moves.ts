import type { AspectId } from "./aspects";
import type { ZoneId } from "./lineages";

// Every move in the game (DESIGN.md ch. 3.4 for the cost table).
export interface Move {
  id: string;
  name: string;
  emoji: string;
  kind: "physical" | "aspect" | "utility";
  aetherCost: number;
  power: number; // damage before aspect multipliers; 0 for pure utility
  aspect?: AspectId;
  // Some moves only work while the attacker is in certain zones (e.g. air-only).
  attackerZones?: ZoneId[];
  effect?: "fog"; // fogbank: halves the next hit taken
  description: string;
}

export const MOVES: Record<string, Move> = {
  ember_bite: {
    id: "ember_bite",
    name: "Ember Bite",
    emoji: "🦷",
    kind: "physical",
    aetherCost: 1,
    power: 6,
    description: "A quick fiery bite. Target must be in reach.",
  },
  cinder_breath: {
    id: "cinder_breath",
    name: "Cinder Breath",
    emoji: "🔥",
    kind: "aspect",
    aetherCost: 3,
    power: 12,
    aspect: "inferno",
    description: "A blast of burning cinders. Hits any zone.",
  },
  rock_slam: {
    id: "rock_slam",
    name: "Rock Slam",
    emoji: "🪨",
    kind: "physical",
    aetherCost: 1,
    power: 7,
    description: "A heavy body slam. Target must be in reach.",
  },
  stone_spray: {
    id: "stone_spray",
    name: "Stone Spray",
    emoji: "⛰️",
    kind: "aspect",
    aetherCost: 3,
    power: 10,
    aspect: "terra",
    description: "A shower of sharp stones. Hits any zone.",
  },
  gale_slash: {
    id: "gale_slash",
    name: "Gale Slash",
    emoji: "🌀",
    kind: "physical",
    aetherCost: 1,
    power: 6,
    attackerZones: ["lowAir", "highAir"],
    description: "A slicing wind strike — only while flying.",
  },
  storm_surge: {
    id: "storm_surge",
    name: "Storm Surge",
    emoji: "⛈️",
    kind: "aspect",
    aetherCost: 5,
    power: 18,
    aspect: "tempest",
    description: "A crashing storm. Hits any zone, very strong.",
  },
  fogbank: {
    id: "fogbank",
    name: "Fogbank",
    emoji: "🌫️",
    kind: "utility",
    aetherCost: 2,
    power: 0,
    attackerZones: ["highAir"],
    effect: "fog",
    description: "Hide in the clouds — the next hit you take is halved.",
  },
  // Pyrewing (Cinderling's molted form) upgrades.
  pyre_talons: {
    id: "pyre_talons",
    name: "Pyre Talons",
    emoji: "🔪",
    kind: "physical",
    aetherCost: 1,
    power: 9,
    description: "Blazing talon strike. Target must be in reach.",
  },
  inferno_wave: {
    id: "inferno_wave",
    name: "Inferno Wave",
    emoji: "🌋",
    kind: "aspect",
    aetherCost: 5,
    power: 20,
    aspect: "inferno",
    description: "A rolling wave of fire. Hits any zone.",
  },
};

// Battlefield actions that every dragon can take (not moves, so they live here
// as shared constants): shifting elevation and forcing an enemy down.
export const ELEVATION_SHIFT_COST = 3;
export const FORCE_DOWN_COST = 3;
