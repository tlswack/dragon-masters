import { ASPECTS } from "../data/aspects";
import { DRAGONS } from "../data/dragons";
import { LINEAGES } from "../data/lineages";
import { useGame } from "../state/store";

// The Hoard's dragon roster: see your dragons and choose who battles next.
export default function RosterScreen() {
  const { roster, activeDragonId, setActiveDragon, setScreen } = useGame();

  return (
    <div className="min-h-dvh bg-indigo-950 text-white flex flex-col p-4 max-w-md mx-auto">
      <header className="flex items-center justify-between py-3">
        <button onClick={() => setScreen("home")} className="rounded-xl bg-indigo-800 px-3 py-2 font-bold">
          🏠
        </button>
        <h1 className="text-2xl font-extrabold">🐲 My Dragons</h1>
        <div className="w-10" />
      </header>
      <p className="text-indigo-300 text-sm mb-4">Tap a dragon to make it your battle partner.</p>

      <div className="flex flex-col gap-3">
        {roster.map((d) => {
          const species = DRAGONS[d.speciesId];
          const aspect = ASPECTS[species.aspect];
          const active = d.id === activeDragonId;
          return (
            <button
              key={d.id}
              onClick={() => setActiveDragon(d.id)}
              className={`rounded-2xl p-4 text-left shadow-lg border-2 ${
                active ? "border-amber-400 bg-indigo-800" : "border-transparent bg-indigo-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-4xl">{species.emoji}</span>
                <div className="flex-1">
                  <div className="font-extrabold text-lg">
                    {species.name} {active && <span className="text-amber-300 text-sm">★ partner</span>}
                  </div>
                  <div className="text-sm text-indigo-300 capitalize">
                    {species.stage} · {LINEAGES[species.lineage].name} ·{" "}
                    <span className={`${aspect.badgeClass} rounded-full px-1.5 py-0.5 text-white text-xs`}>
                      {aspect.emoji} {aspect.name}
                    </span>
                  </div>
                  <div className="text-xs text-indigo-400 mt-1">
                    ❤️ {species.baseStats.hp} HP · 🏆 {d.battlesWon} battles won
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
