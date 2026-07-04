import type { Problem } from "../data/skills";
import type { FocusTierId } from "../data/focusTiers";
import { selectSkillForTier, type DifficultyBias, type MasteryMap } from "./mastery";

// Adaptive problem selection (DESIGN.md ch. 2.3-2.4): the tier decides WHICH of
// the child's own skills to draw from; the skill's generator makes the problem.
export function generateProblem(tier: FocusTierId, mastery: MasteryMap, bias: DifficultyBias): Problem {
  return selectSkillForTier(mastery, tier, bias).generate();
}
