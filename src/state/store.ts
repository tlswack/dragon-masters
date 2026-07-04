import { create } from "zustand";
import { persist } from "zustand/middleware";
import { applyAnswer, type DifficultyBias, type MasteryMap } from "../engine/mastery";

export type Screen = "home" | "practice" | "battle" | "parent" | "roster";

// A dragon the player owns. Species data stays in src/data/dragons.ts;
// this is only the per-dragon save info.
export interface DragonInstance {
  id: string;
  speciesId: string;
  battlesWon: number;
}

export interface BattleConfig {
  playerInstanceId: string;
  playerSpeciesId: string;
  enemySpeciesId: string;
}

let nextInstance = 0;
export function makeInstance(speciesId: string): DragonInstance {
  // Timestamp + counter is unique enough for a single-device save.
  return { id: `${speciesId}-${Date.now()}-${nextInstance++}`, speciesId, battlesWon: 0 };
}

interface GameState {
  // --- UI state (NOT saved) ---
  screen: Screen;
  battleConfig: BattleConfig | null;
  setScreen: (screen: Screen) => void;
  startBattle: (enemySpeciesId: string) => void;

  // --- Save state (persisted to localStorage) ---
  practiceAether: number;
  totalSolved: number;
  totalCorrect: number;
  mastery: MasteryMap;
  difficultyBias: DifficultyBias;
  roster: DragonInstance[];
  activeDragonId: string;
  earnPracticeAether: (amount: number) => void;
  recordAnswer: (skillId: string, correct: boolean, elapsedMs: number) => void;
  setDifficultyBias: (bias: DifficultyBias) => void;
  setActiveDragon: (instanceId: string) => void;
  addToRoster: (speciesId: string) => void;
  recordBattleWon: (instanceId: string) => void;
}

const starterDragon = makeInstance("cinderling");

export const useGame = create<GameState>()(
  persist(
    (set, get) => ({
      screen: "home",
      battleConfig: null,
      setScreen: (screen) => set({ screen }),
      startBattle: (enemySpeciesId) => {
        const s = get();
        const active = s.roster.find((d) => d.id === s.activeDragonId) ?? s.roster[0];
        set({
          battleConfig: { playerInstanceId: active.id, playerSpeciesId: active.speciesId, enemySpeciesId },
          screen: "battle",
        });
      },

      practiceAether: 0,
      totalSolved: 0,
      totalCorrect: 0,
      mastery: {},
      difficultyBias: "level",
      roster: [starterDragon],
      activeDragonId: starterDragon.id,
      earnPracticeAether: (amount) => set((s) => ({ practiceAether: s.practiceAether + amount })),
      recordAnswer: (skillId, correct, elapsedMs) =>
        set((s) => ({
          totalSolved: s.totalSolved + 1,
          totalCorrect: s.totalCorrect + (correct ? 1 : 0),
          mastery: applyAnswer(s.mastery, skillId, correct, elapsedMs),
        })),
      setDifficultyBias: (difficultyBias) => set({ difficultyBias }),
      setActiveDragon: (activeDragonId) => set({ activeDragonId }),
      addToRoster: (speciesId) => set((s) => ({ roster: [...s.roster, makeInstance(speciesId)] })),
      recordBattleWon: (instanceId) =>
        set((s) => ({
          roster: s.roster.map((d) => (d.id === instanceId ? { ...d, battlesWon: d.battlesWon + 1 } : d)),
        })),
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
        roster: s.roster,
        activeDragonId: s.activeDragonId,
      }),
    },
  ),
);
