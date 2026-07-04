import { REGIONS, type Region } from "../data/regions";
import { MASTERING_AT, masteryOf, type MasteryMap } from "./mastery";

export type CampaignProgress = Record<string, string[]>; // regionId -> completed battle ids

export function isBattleDone(progress: CampaignProgress, regionId: string, battleId: string): boolean {
  return (progress[regionId] ?? []).includes(battleId);
}

export function regionCleared(progress: CampaignProgress, region: Region): boolean {
  return isBattleDone(progress, region.id, region.boss.id);
}

// Regions open in order: the first is always open, later ones open when the
// previous region's boss is beaten.
export function regionUnlocked(progress: CampaignProgress, regionIndex: number): boolean {
  if (regionIndex === 0) return true;
  return regionCleared(progress, REGIONS[regionIndex - 1]);
}

// Battles inside a region unlock one after another.
export function battleUnlocked(progress: CampaignProgress, region: Region, battleIndex: number): boolean {
  if (battleIndex === 0) return true;
  return isBattleDone(progress, region.id, region.battles[battleIndex - 1].id);
}

// The boss needs every earlier battle done AND the region's skills mastering.
export function bossUnlocked(progress: CampaignProgress, region: Region, mastery: MasteryMap): boolean {
  const battlesDone = region.battles.every((b) => isBattleDone(progress, region.id, b.id));
  const skillsReady = region.requiredSkills.every((s) => masteryOf(mastery, s) >= MASTERING_AT);
  return battlesDone && skillsReady;
}
