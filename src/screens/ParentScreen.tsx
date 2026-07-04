import { SKILLS } from "../data/skills";
import { isUnlocked, masteryOf, MASTERED_AT, MASTERING_AT, type DifficultyBias } from "../engine/mastery";
import { useGame } from "../state/store";

const BIASES: { id: DifficultyBias; label: string; blurb: string }[] = [
  { id: "easier", label: "Bias easier", blurb: "More review, gentler stretch" },
  { id: "level", label: "On level", blurb: "The standard adaptive mix" },
  { id: "harder", label: "Bias harder", blurb: "More stretch problems" },
];

// The parent/teacher dashboard (DESIGN.md ch. 9): the mastery model already
// produces all this data — this screen just shows it.
export default function ParentScreen() {
  const { mastery, difficultyBias, setDifficultyBias, totalSolved, totalCorrect, setScreen } = useGame();

  return (
    <div className="min-h-dvh bg-slate-100 text-slate-900 flex flex-col p-4 max-w-md mx-auto">
      <header className="flex items-center justify-between py-3">
        <button onClick={() => setScreen("home")} className="rounded-xl bg-slate-300 px-3 py-2 font-bold">
          🏠 Back
        </button>
        <h1 className="text-xl font-extrabold">For grown-ups</h1>
      </header>

      <section className="rounded-2xl bg-white p-4 shadow mb-4">
        <h2 className="font-bold mb-1">Answers so far</h2>
        <p className="text-3xl font-extrabold">
          {totalCorrect} <span className="text-base font-semibold text-slate-500">correct of {totalSolved}</span>
        </p>
      </section>

      <section className="rounded-2xl bg-white p-4 shadow mb-4">
        <h2 className="font-bold mb-2">Difficulty nudge</h2>
        <div className="flex gap-2">
          {BIASES.map((b) => (
            <button
              key={b.id}
              onClick={() => setDifficultyBias(b.id)}
              className={`flex-1 rounded-xl px-2 py-3 text-sm font-bold border-2 ${
                difficultyBias === b.id ? "border-indigo-600 bg-indigo-50 text-indigo-800" : "border-slate-200 bg-white"
              }`}
            >
              {b.label}
              <div className="text-xs font-normal text-slate-500 mt-1">{b.blurb}</div>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-white p-4 shadow">
        <h2 className="font-bold mb-3">Skills</h2>
        <div className="flex flex-col gap-2.5">
          {SKILLS.map((skill) => {
            const m = masteryOf(mastery, skill.id);
            const unlocked = isUnlocked(mastery, skill);
            const status = !unlocked ? "🔒 locked" : m >= MASTERED_AT ? "⭐ mastered" : m >= MASTERING_AT ? "📈 practicing" : "🌱 new";
            return (
              <div key={skill.id} className={unlocked ? "" : "opacity-40"}>
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">{skill.name}</span>
                  <span className="text-slate-500">{status}</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className={`h-full ${m >= MASTERED_AT ? "bg-emerald-500" : m >= MASTERING_AT ? "bg-amber-500" : "bg-slate-400"}`}
                    style={{ width: `${Math.round(m * 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
