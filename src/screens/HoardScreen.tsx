import { useState } from "react";
import { BUILDINGS, type Building } from "../data/buildings";
import { DRAGONS } from "../data/dragons";
import { MATERIALS } from "../data/materials";
import type { Problem } from "../data/skills";
import { canAfford, moltBlocker } from "../engine/hoard";
import { useGame } from "../state/store";

function CostLine({ cost }: { cost: Record<string, number> }) {
  return (
    <span>
      {Object.entries(cost)
        .map(([id, n]) => `${MATERIALS[id].emoji} ${n} ${MATERIALS[id].name}`)
        .join(" + ")}
    </span>
  );
}

// The Architect's Desk build flow: to raise a building you must have the
// materials AND solve one applied problem (DESIGN.md ch. 7).
function BuildDesk({ building, onDone }: { building: Building; onDone: (built: boolean) => void }) {
  const [problem, setProblem] = useState<Problem>(() => building.generateProblem());
  const [wrong, setWrong] = useState(false);
  const startedAt = useState(() => Date.now())[0];

  function answer(choice: string) {
    const correct = choice === problem.answer;
    useGame.getState().recordAnswer(problem.skillId, correct, Date.now() - startedAt);
    if (correct) {
      useGame.getState().buildBuilding(building.id, building.cost);
      onDone(true);
    } else {
      setWrong(true);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md rounded-3xl bg-amber-950 border-2 border-amber-500 p-5 flex flex-col gap-4">
        <div className="text-center">
          <div className="text-lg font-extrabold text-amber-200">📐 The Architect's Desk</div>
          <div className="text-sm text-amber-400">Solve the building plan for the {building.name}!</div>
        </div>
        {wrong ? (
          <div className="rounded-2xl bg-amber-900 p-4 text-center flex flex-col gap-3">
            <div className="text-lg font-bold">Almost! 💡 {problem.hint}</div>
            <button
              onClick={() => {
                setProblem(building.generateProblem());
                setWrong(false);
              }}
              className="rounded-2xl bg-amber-600 px-4 py-3 font-bold"
            >
              Try a new plan ➜
            </button>
            <button onClick={() => onDone(false)} className="rounded-2xl bg-amber-950 border border-amber-700 px-4 py-3 font-bold">
              Come back later
            </button>
          </div>
        ) : (
          <>
            <div className="rounded-2xl bg-amber-900 p-4 text-center">
              <div className="text-xl font-extrabold leading-snug">{problem.prompt}</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {problem.choices.map((choice) => (
                <button
                  key={choice}
                  onClick={() => answer(choice)}
                  className="rounded-2xl bg-amber-700 active:bg-amber-500 px-4 py-4 text-xl font-bold shadow-lg"
                >
                  {choice}
                </button>
              ))}
            </div>
            <button onClick={() => onDone(false)} className="text-amber-400 underline text-sm">
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function HoardScreen() {
  const { materials, buildings, roster, setScreen, moltDragon } = useGame();
  const [desk, setDesk] = useState<Building | null>(null);
  const [justBuilt, setJustBuilt] = useState<string | null>(null);
  const [justMolted, setJustMolted] = useState<string | null>(null);

  return (
    <div className="min-h-dvh bg-slate-950 text-white flex flex-col p-4 max-w-md mx-auto">
      <header className="flex items-center justify-between py-3">
        <button onClick={() => setScreen("home")} className="rounded-xl bg-slate-800 px-3 py-2 font-bold">
          🏠
        </button>
        <h1 className="text-2xl font-extrabold">🏰 The Hoard</h1>
        <div className="w-10" />
      </header>

      {justBuilt && (
        <div className="rounded-2xl bg-emerald-900/80 p-4 mb-3 text-center font-bold">
          🎉 {BUILDINGS[justBuilt].name} built! {BUILDINGS[justBuilt].benefit.text}.
        </div>
      )}
      {justMolted && <div className="rounded-2xl bg-violet-900/80 p-4 mb-3 text-center font-bold">🌟 {justMolted}</div>}

      {/* Materials inventory */}
      <section className="rounded-2xl bg-slate-900 p-4 mb-4">
        <h2 className="font-bold mb-2 text-slate-300">Materials</h2>
        <div className="flex flex-wrap gap-2">
          {Object.values(MATERIALS).map((m) => (
            <span key={m.id} className="rounded-full bg-slate-800 px-3 py-1.5 text-sm font-bold">
              {m.emoji} {materials[m.id] ?? 0} {m.name}
            </span>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-2">Win battles to gather more — capturing doubles the loot!</p>
      </section>

      {/* Architect's Desk */}
      <section className="rounded-2xl bg-slate-900 p-4 mb-4">
        <h2 className="font-bold mb-2 text-slate-300">📐 Architect's Desk</h2>
        <div className="flex flex-col gap-3">
          {Object.values(BUILDINGS).map((b) => {
            const built = buildings.includes(b.id);
            const affordable = canAfford(materials, b.cost);
            return (
              <div key={b.id} className={`rounded-xl p-3 ${built ? "bg-emerald-950/60" : "bg-slate-800"}`}>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="font-bold">
                      {b.emoji} {b.name} {built && "✅"}
                    </div>
                    <div className="text-xs text-slate-400">{b.description}</div>
                    <div className="text-xs text-slate-300 mt-1">
                      {built ? b.benefit.text : <CostLine cost={b.cost} />}
                    </div>
                  </div>
                  {!built && (
                    <button
                      disabled={!affordable}
                      onClick={() => setDesk(b)}
                      className="rounded-xl bg-amber-700 active:bg-amber-500 disabled:bg-slate-700 disabled:text-slate-500 px-4 py-3 font-bold shrink-0"
                    >
                      {affordable ? "Build!" : "Need more"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Molting */}
      <section className="rounded-2xl bg-slate-900 p-4">
        <h2 className="font-bold mb-2 text-slate-300">🌟 Molting</h2>
        <div className="flex flex-col gap-3">
          {roster.map((d) => {
            const species = DRAGONS[d.speciesId];
            if (!species.moltInto) {
              return (
                <div key={d.id} className="rounded-xl bg-slate-800 p-3 text-sm text-slate-400">
                  {species.emoji} {species.name} — content as it is for now.
                </div>
              );
            }
            const target = DRAGONS[species.moltInto];
            const blocker = moltBlocker(d, materials, buildings);
            const needed = species.moltBattlesNeeded ?? 3;
            const reason =
              blocker === "battles"
                ? `Win ${needed - d.battlesWon} more battle${needed - d.battlesWon === 1 ? "" : "s"} (${d.battlesWon}/${needed})`
                : blocker === "building"
                  ? `Build the ${BUILDINGS[species.moltBuilding!].name} first`
                  : blocker === "catalysts"
                    ? "Gather catalysts: "
                    : null;
            return (
              <div key={d.id} className="rounded-xl bg-slate-800 p-3">
                <div className="font-bold">
                  {species.emoji} {species.name} → {target.emoji} {target.name}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Catalysts: <CostLine cost={species.moltCatalysts ?? {}} />
                </div>
                {blocker === null ? (
                  <button
                    onClick={() => {
                      moltDragon(d.id);
                      setJustMolted(`${species.name} molted into ${target.name}! ${target.emoji}`);
                    }}
                    className="mt-2 w-full rounded-xl bg-violet-700 active:bg-violet-500 px-4 py-3 font-bold"
                  >
                    🌟 Begin the Molt!
                  </button>
                ) : (
                  <div className="text-sm text-amber-300 mt-1">
                    ⏳ {reason}
                    {blocker === "catalysts" && <CostLine cost={species.moltCatalysts ?? {}} />}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {desk && (
        <BuildDesk
          building={desk}
          onDone={(built) => {
            if (built) setJustBuilt(desk.id);
            setDesk(null);
          }}
        />
      )}
    </div>
  );
}
