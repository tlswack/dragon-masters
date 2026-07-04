import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Screen = "home" | "practice" | "battle";

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
  earnPracticeAether: (amount: number) => void;
  recordAnswer: (correct: boolean) => void;
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
      earnPracticeAether: (amount) => set((s) => ({ practiceAether: s.practiceAether + amount })),
      recordAnswer: (correct) =>
        set((s) => ({
          totalSolved: s.totalSolved + 1,
          totalCorrect: s.totalCorrect + (correct ? 1 : 0),
        })),
    }),
    {
      name: "dragon-masters-save",
      // Only the save data goes to localStorage — never transient UI state.
      partialize: (s) => ({
        practiceAether: s.practiceAether,
        totalSolved: s.totalSolved,
        totalCorrect: s.totalCorrect,
      }),
    },
  ),
);
