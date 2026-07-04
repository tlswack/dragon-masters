import FocusBoard from "../components/FocusBoard";
import { useGame } from "../state/store";

// Phase 1 standalone screen: solve problems, watch the Aether counter climb.
export default function PracticeScreen() {
  const { practiceAether, totalSolved, totalCorrect, earnPracticeAether } = useGame();

  return (
    <div className="min-h-dvh bg-indigo-950 text-white flex flex-col p-4 max-w-md mx-auto">
      <header className="flex items-center justify-between py-3">
        <button onClick={() => useGame.getState().setScreen("home")} className="rounded-xl bg-indigo-800 px-3 py-2 font-bold">
          🏠
        </button>
        <h1 className="text-2xl font-extrabold">🐉 Focus Board</h1>
        <div className="rounded-full bg-indigo-800 px-4 py-2 text-lg font-extrabold shadow">✨ {practiceAether}</div>
      </header>
      <p className="text-indigo-300 text-sm mb-4">
        Solve problems to gather Aether — dragon power! Harder problems give more.
      </p>
      <FocusBoard
        onAnswer={({ correct, tier }) => {
          if (correct) earnPracticeAether(tier.aether);
        }}
      />
      <footer className="mt-auto pt-6 text-center text-indigo-400 text-sm">
        Solved {totalCorrect} of {totalSolved} problems
      </footer>
    </div>
  );
}
