import { SKILLS, SKILLS_BY_ID, type Skill } from "../data/skills";
import type { FocusTierId } from "../data/focusTiers";
import { pick } from "./rng";

// Mastery model (DESIGN.md ch. 2.2): every skill has a 0..1 score.
// Correct answers nudge it up (a bit more when fast), wrong answers nudge it
// down gently, and unused skills fade very slowly so review comes back around.

export type MasteryMap = Record<string, number>;
export type DifficultyBias = "easier" | "level" | "harder";

export const MASTERED_AT = 0.85;
export const MASTERING_AT = 0.5;
const PREREQ_READY_AT = 0.65;
const FAST_ANSWER_MS = 8000;

export function masteryOf(mastery: MasteryMap, skillId: string): number {
  return mastery[skillId] ?? 0;
}

// Returns a whole new map: the answered skill moves, everything else decays a hair.
export function applyAnswer(mastery: MasteryMap, skillId: string, correct: boolean, elapsedMs: number): MasteryMap {
  const next: MasteryMap = {};
  for (const skill of SKILLS) {
    const m = masteryOf(mastery, skill.id);
    next[skill.id] = skill.id === skillId ? m : Math.max(0, m * 0.999);
  }
  const m = masteryOf(mastery, skillId);
  if (correct) {
    const speedBonus = elapsedMs < FAST_ANSWER_MS ? 0.05 : 0;
    next[skillId] = Math.min(1, m + (0.12 + speedBonus) * (1 - m));
  } else {
    // Gentle: one miss can never crash a score (DESIGN.md ch. 2.5).
    next[skillId] = Math.max(0, m - 0.06 * Math.max(m, 0.3));
  }
  return next;
}

export function isUnlocked(mastery: MasteryMap, skill: Skill): boolean {
  return skill.prereqs.every((p) => masteryOf(mastery, p) >= PREREQ_READY_AT);
}

export function unlockedSkills(mastery: MasteryMap): Skill[] {
  return SKILLS.filter((s) => isUnlocked(mastery, s));
}

export type SkillZone = "fresh" | "mastering" | "mastered";

export function zoneOf(mastery: MasteryMap, skillId: string): SkillZone {
  const m = masteryOf(mastery, skillId);
  if (m >= MASTERED_AT) return "mastered";
  if (m >= MASTERING_AT) return "mastering";
  return "fresh";
}

function byZone(mastery: MasteryMap): Record<SkillZone, Skill[]> {
  const groups: Record<SkillZone, Skill[]> = { fresh: [], mastering: [], mastered: [] };
  for (const s of unlockedSkills(mastery)) groups[zoneOf(mastery, s.id)].push(s);
  return groups;
}

// The parent nudge shifts which pool each tier draws from (DESIGN.md ch. 9).
function shiftTier(tier: FocusTierId, bias: DifficultyBias): FocusTierId {
  if (bias === "easier") return tier === "heavy" ? "medium" : "quick";
  if (bias === "harder") return tier === "quick" ? "medium" : "heavy";
  return tier;
}

// Reward scaling (DESIGN.md ch. 2.4): each tier pulls from the child's own
// frontier, so "the hard one" is always genuinely hard for THIS child.
export function selectSkillForTier(mastery: MasteryMap, tier: FocusTierId, bias: DifficultyBias): Skill {
  const zones = byZone(mastery);
  const effective = shiftTier(tier, bias);

  if (effective === "quick") {
    // Easiest confident skill: mastered review, else the strongest thing they have.
    if (zones.mastered.length) return pick(zones.mastered);
    const all = unlockedSkills(mastery);
    return all.reduce((best, s) => (masteryOf(mastery, s.id) > masteryOf(mastery, best.id) ? s : best), all[0]);
  }

  if (effective === "medium") {
    if (zones.mastering.length) return pick(zones.mastering);
    if (zones.fresh.length) return lowestBand(zones.fresh);
    return pick(zones.mastered);
  }

  // Heavy: the frontier — a just-unlocked skill, else the shakiest mastering skill.
  if (zones.fresh.length) return highestBand(zones.fresh);
  if (zones.mastering.length) {
    return zones.mastering.reduce((worst, s) => (masteryOf(mastery, s.id) < masteryOf(mastery, worst.id) ? s : worst), zones.mastering[0]);
  }
  return highestBand(zones.mastered);
}

function lowestBand(skills: Skill[]): Skill {
  const min = Math.min(...skills.map((s) => s.band));
  return pick(skills.filter((s) => s.band === min));
}

function highestBand(skills: Skill[]): Skill {
  const max = Math.max(...skills.map((s) => s.band));
  return pick(skills.filter((s) => s.band === max));
}

// The 70/20/10 zone-of-proximal-development mix (DESIGN.md ch. 2.3) — used when
// the GAME picks difficulty (e.g. the tethering ritual), not the child.
export function pickZpdSkill(mastery: MasteryMap, bias: DifficultyBias): Skill {
  const zones = byZone(mastery);
  const roll = Math.random();
  const wantStretch = bias === "harder" ? 0.2 : bias === "easier" ? 0.05 : 0.1;
  const wantReview = bias === "easier" ? 0.35 : 0.2;
  if (roll < wantStretch && zones.fresh.length) return pick(zones.fresh);
  if (roll < wantStretch + wantReview && zones.mastered.length) return pick(zones.mastered);
  if (zones.mastering.length) return pick(zones.mastering);
  if (zones.mastered.length) return pick(zones.mastered);
  return pick(unlockedSkills(mastery));
}

export function skillName(skillId: string): string {
  return SKILLS_BY_ID[skillId]?.name ?? skillId;
}
