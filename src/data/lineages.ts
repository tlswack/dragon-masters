// Elevation zones and dragon lineages (DESIGN.md ch. 3.1–3.2).
export type ZoneId = "highAir" | "lowAir" | "ground" | "underground" | "water";

export interface ZoneInfo {
  id: ZoneId;
  name: string;
  emoji: string;
}

// Listed top-to-bottom, the order the battlefield renders them in.
export const ZONE_ORDER: ZoneInfo[] = [
  { id: "highAir", name: "High Air", emoji: "☁️" },
  { id: "lowAir", name: "Low Air", emoji: "🌤️" },
  { id: "ground", name: "Ground", emoji: "🌿" },
  { id: "underground", name: "Underground", emoji: "🕳️" },
  { id: "water", name: "Water", emoji: "🌊" },
];

// Which zones count as "reachable" for physical attacks: same zone or adjacent.
export const ADJACENT_ZONES: Record<ZoneId, ZoneId[]> = {
  highAir: ["lowAir"],
  lowAir: ["highAir", "ground"],
  ground: ["lowAir", "underground", "water"],
  underground: ["ground"],
  water: ["ground"],
};

export type LineageId = "wyvern" | "drake" | "wyrm" | "leviathan" | "sovereign" | "celestial";

export interface Lineage {
  id: LineageId;
  name: string;
  zones: ZoneId[];
  // The lowest zone this lineage can be forced down to ("wing-clipped").
  // Celestials levitate, so they can never be forced below Low Air.
  forcedFloor: ZoneId | null; // null = immune to being forced down
  identity: string;
}

export const LINEAGES: Record<LineageId, Lineage> = {
  wyvern: {
    id: "wyvern",
    name: "Wyvern",
    zones: ["ground", "lowAir", "highAir"],
    forcedFloor: "ground",
    identity: "Fast aerial skirmisher; fragile when grounded",
  },
  drake: {
    id: "drake",
    name: "Drake",
    zones: ["ground"],
    forcedFloor: null,
    identity: "Heavy tank; immune to being forced to land; can't hit High Air physically",
  },
  wyrm: {
    id: "wyrm",
    name: "Wyrm",
    zones: ["ground", "underground"],
    forcedFloor: null,
    identity: "Stealth and positioning via burrow",
  },
  leviathan: {
    id: "leviathan",
    name: "Leviathan",
    zones: ["ground", "water"],
    forcedFloor: null,
    identity: "Controls water battlefields",
  },
  sovereign: {
    id: "sovereign",
    name: "Sovereign",
    zones: ["ground", "lowAir"],
    forcedFloor: "ground",
    identity: "Armored dreadnought; slow to climb",
  },
  celestial: {
    id: "celestial",
    name: "Celestial",
    zones: ["lowAir", "highAir"],
    forcedFloor: "lowAir",
    identity: "Levitates — can't be wing-clipped; alters the weather",
  },
};
