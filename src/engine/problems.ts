import { SKILLS, type Problem, type Skill } from "../data/skills";
import type { FocusTierId } from "../data/focusTiers";
import { pick } from "./rng";

// Phase-1 problem selection: pick a skill by curriculum band per tier.
// Phase 3 replaces this with mastery-based zone-of-proximal-development
// selection (see DESIGN.md ch. 2.3) — the function signature stays the same.
const TIER_BANDS: Record<FocusTierId, number[]> = {
  quick: [1],
  medium: [1, 2],
  heavy: [2, 3],
};

export function generateProblem(tier: FocusTierId): Problem {
  const bands = TIER_BANDS[tier];
  const candidates: Skill[] = SKILLS.filter((s) => bands.includes(s.band));
  return pick(candidates).generate();
}
