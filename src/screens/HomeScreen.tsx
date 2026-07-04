import { useGame } from "../state/store";

export default function HomeScreen() {
  const setScreen = useGame((s) => s.setScreen);
  const startBattle = useGame((s) => s.startBattle);

  return (
    <div className="min-h-dvh bg-indigo-950 text-white flex flex-col items-center justify-center gap-6 p-6 max-w-md mx-auto">
      <div className="text-7xl">🐉</div>
      <h1 className="text-4xl font-extrabold tracking-tight text-center">Dragon Masters</h1>
      <div className="flex flex-col gap-3 w-full">
        <button
          onClick={() => startBattle({ playerSpeciesId: "cinderling", enemySpeciesId: "boulderback" })}
          className="rounded-2xl bg-rose-700 active:bg-rose-600 px-5 py-5 text-xl font-bold shadow-lg"
        >
          ⚔️ Battle: Cinderling vs Boulderback
        </button>
        <button
          onClick={() => setScreen("practice")}
          className="rounded-2xl bg-indigo-700 active:bg-indigo-600 px-5 py-5 text-xl font-bold shadow-lg"
        >
          🧠 Focus Board practice
        </button>
      </div>
    </div>
  );
}
