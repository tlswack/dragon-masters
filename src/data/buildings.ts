import type { AspectId } from "./aspects";
import type { LineageId } from "./lineages";
import type { Problem } from "./skills";
import { randInt } from "../engine/rng";

// Hoard buildings (DESIGN.md ch. 7). Building one costs materials AND solving
// an applied problem at the Architect's Desk. Problems reuse real skill ids so
// they feed the mastery model too.
export interface Building {
  id: string;
  name: string;
  emoji: string;
  description: string;
  cost: Record<string, number>; // materialId -> amount
  benefit: {
    text: string;
    // Passive reward: matching dragons start battles with bonus Aether.
    preload?: { amount: number; lineages?: LineageId[]; aspects?: AspectId[] };
  };
  generateProblem: () => Problem;
}

export const BUILDINGS: Record<string, Building> = {
  ember_forge: {
    id: "ember_forge",
    name: "Ember Forge",
    emoji: "🔥🏠",
    description: "A glowing forge where Inferno dragons molt and rest.",
    cost: { emberwood: 6, brimstone: 4 },
    benefit: {
      text: "Inferno dragons start battles with +2 Aether",
      preload: { amount: 2, aspects: ["inferno"] },
    },
    generateProblem() {
      const w = randInt(4, 9);
      const h = randInt(3, 7);
      return {
        skillId: "area_rectangle",
        prompt: `The forge floor is ${w} tiles long and ${h} tiles wide. How many fire-proof tiles do you need?`,
        answer: String(w * h),
        choices: shuffleNums(w * h, [w + h, 2 * (w + h), w * h + w]),
        hint: "Area = length × width.",
      };
    },
  },
  reinforced_pen: {
    id: "reinforced_pen",
    name: "Reinforced Pen",
    emoji: "🪨🏰",
    description: "A walled pen sturdy enough for the heaviest ground dragons.",
    cost: { adamantine: 15 },
    benefit: {
      text: "Drakes and Terra dragons start battles with +2 Aether",
      preload: { amount: 2, lineages: ["drake"], aspects: ["terra"] },
    },
    generateProblem() {
      const perWall = randInt(3, 5);
      const walls = randInt(4, 7);
      const rem = randInt(1, perWall - 1);
      const total = perWall * walls + rem;
      return {
        skillId: "div_remainder",
        prompt: `You have ${total} Adamantine. Each wall needs ${perWall}. How many whole walls can you build?`,
        answer: String(walls),
        choices: shuffleNums(walls, [walls + 1, walls - 1, perWall]),
        hint: `How many times does ${perWall} fit into ${total}?`,
      };
    },
  },
  high_roost: {
    id: "high_roost",
    name: "High-Altitude Roost",
    emoji: "🔷🗼",
    description: "A glittering perch above the clouds. Celestials require one.",
    cost: { skyglass: 8, adamantine: 6 },
    benefit: {
      text: "Flying dragons (Wyverns, Celestials) start battles with +2 Aether",
      preload: { amount: 2, lineages: ["wyvern", "celestial"] },
    },
    generateProblem() {
      const a = randInt(12, 30);
      const b = randInt(4, 9);
      return {
        skillId: "mult_2x1digit",
        prompt: `The roost tower has ${a} perches on each level, and ${b} levels. How many perches in all?`,
        answer: String(a * b),
        choices: shuffleNums(a * b, [a * b + b, a * b - a, a + b]),
        hint: `Split it: (${Math.floor(a / 10) * 10} × ${b}) + (${a % 10} × ${b}).`,
      };
    },
  },
  leviathan_pool: {
    id: "leviathan_pool",
    name: "Leviathan Pool",
    emoji: "🌊🏊",
    description: "A deep pool for water dragons — dig it big enough!",
    cost: { aqua_glass: 10, adamantine: 8 },
    benefit: {
      text: "Leviathans start battles with +2 Aether",
      preload: { amount: 2, lineages: ["leviathan"] },
    },
    generateProblem() {
      const l = randInt(3, 6);
      const w = randInt(2, 5);
      const d = randInt(2, 4);
      return {
        skillId: "volume_box",
        prompt: `The pool must be ${l} long, ${w} wide and ${d} deep. How many cubes of water fill it?`,
        answer: String(l * w * d),
        choices: shuffleNums(l * w * d, [l * w, l + w + d, l * w * d + l]),
        hint: "Volume = length × width × depth.",
      };
    },
  },
};

function shuffleNums(answer: number, distractors: number[]): string[] {
  const seen = new Set([answer]);
  const clean = distractors.map((d) => {
    let c = Math.max(1, d);
    while (seen.has(c)) c += 1;
    seen.add(c);
    return c;
  });
  const all = [answer, ...clean].map(String);
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  return all;
}
