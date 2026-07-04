import { create } from "zustand";
import { persist } from "zustand/middleware";
import { applyAnswer, type DifficultyBias, type MasteryMap } from "../engine/mastery";

export type Screen = "home" | "practice" | "battle" | "parent";

export interface BattleConfig {
  playerSpeciesId: string;
  enemySpeciesId: string;
}

interface GameState {
  // --- UI state (NOT saved) ---
  screen: Screen;
  battleConfig: BattleConfig | null;
  setScreen: (screen: Screen) => void;
  startBattle: (config: BattleConfig) => void;

  // --- Save state (persisted to localStorage) ---
  practiceAether: number;
  totalSolved: number;
  totalCorrect: number;
  mastery: MasteryMap;
  difficultyBias: DifficultyBias;
  earnPracticeAether: (amount: number) => void;
  recordAnswer: (skillId: string, correct: boolean, elapsedMs: number) => void;
  setDifficultyBias: (bias: DifficultyBias) => void;
}

export const useGame = create<GameState>()(
  persist(
    (set) => ({
      screen: "home",
      battleConfig: null,
      setScreen: (screen) => set({ screen }),
      startBattle: (battleConfig) => set({ battleConfig, screen: "battle" }),

      practiceAether: 0,
      totalSolved: 0,
      totalCorrect: 0,
      mastery: {},
      difficultyBias: "level",
      earnPracticeAether: (amount) => set((s) => ({ practiceAether: s.practiceAether + amount })),
      recordAnswer: (skillId, correct, elapsedMs) =>
        set((s) => ({
          totalSolved: s.totalSolved + 1,
          totalCorrect: s.totalCorrect + (correct ? 1 : 0),
          mastery: applyAnswer(s.mastery, skillId, correct, elapsedMs),
        })),
      setDifficultyBias: (difficultyBias) => set({ difficultyBias }),
    }),
    {
      name: "dragon-masters-save",
      // Only the save data goes to localStorage — never transient UI state.
      partialize: (s) => ({
        practiceAether: s.practiceAether,
        totalSolved: s.totalSolved,
        totalCorrect: s.totalCorrect,
        mastery: s.mastery,
        difficultyBias: s.difficultyBias,
      }),
    },
  ),
);
