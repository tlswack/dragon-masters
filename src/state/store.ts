import { create } from "zustand";
import { persist } from "zustand/middleware";

// The persistent save — one blob in localStorage, no server (DESIGN.md ch. 11).
interface GameState {
  practiceAether: number;
  totalSolved: number;
  totalCorrect: number;
  earnPracticeAether: (amount: number) => void;
  recordAnswer: (correct: boolean) => void;
}

export const useGame = create<GameState>()(
  persist(
    (set) => ({
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
    { name: "dragon-masters-save" },
  ),
);
