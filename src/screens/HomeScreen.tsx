import { DRAGONS } from "../data/dragons";
import { useGame } from "../state/store";

export default function HomeScreen() {
  const setScreen = useGame((s) => s.setScreen);
  const roster = useGame((s) => s.roster);
  const activeDragonId = useGame((s) => s.activeDragonId);
  const active = roster.find((d) => d.id === activeDragonId) ?? roster[0];
  const activeSpecies = DRAGONS[active.speciesId];

  return (
    <div className="min-h-dvh bg-indigo-950 text-white flex flex-col items-center justify-center gap-6 p-6 max-w-md mx-auto">
      <div className="text-7xl">{activeSpecies.emoji}</div>
      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight">Dragon Masters</h1>
        <p className="text-indigo-300 mt-1">
          Partner: <span className="font-bold text-white">{activeSpecies.name}</span>
        </p>
      </div>
      <div className="flex flex-col gap-3 w-full">
        <button
          onClick={() => setScreen("map")}
          className="rounded-2xl bg-rose-700 active:bg-rose-600 px-5 py-5 text-xl font-bold shadow-lg"
        >
          🗺️ Adventure!
        </button>
        <button
          onClick={() => setScreen("hoard")}
          className="rounded-2xl bg-amber-700 active:bg-amber-600 px-5 py-5 text-xl font-bold shadow-lg"
        >
          🏰 The Hoard (build & molt)
        </button>
        <button
          onClick={() => setScreen("roster")}
          className="rounded-2xl bg-violet-700 active:bg-violet-600 px-5 py-5 text-xl font-bold shadow-lg"
        >
          🐲 My dragons ({roster.length})
        </button>
        <button
          onClick={() => setScreen("practice")}
          className="rounded-2xl bg-indigo-700 active:bg-indigo-600 px-5 py-5 text-xl font-bold shadow-lg"
        >
          🧠 Focus Board practice
        </button>
      </div>
      <button onClick={() => setScreen("parent")} className="text-indigo-400 underline text-sm mt-4">
        For grown-ups
      </button>
    </div>
  );
}
