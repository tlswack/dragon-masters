import { useEffect, useRef, useState } from "react";
import { DRAGONS } from "../data/dragons";
import type { Problem } from "../data/skills";
import { linksNeeded, RITUAL_MISSES_ALLOWED, RITUAL_SECONDS_PER_PROBLEM } from "../engine/capture";
import { pickZpdSkill } from "../engine/mastery";
import { sfx } from "../engine/sfx";
import { useGame } from "../state/store";

interface TetherRitualProps {
  enemySpeciesId: string;
  onSuccess: () => void;
  onFail: () => void;
}

function nextProblem(): Problem {
  const { mastery, difficultyBias } = useGame.getState();
  return pickZpdSkill(mastery, difficultyBias).generate();
}

// The timed capture mini-game: each correct answer tightens one tether link.
export default function TetherRitual({ enemySpeciesId, onSuccess, onFail }: TetherRitualProps) {
  const needed = linksNeeded(enemySpeciesId);
  const [links, setLinks] = useState(0);
  const [misses, setMisses] = useState(0);
  const [problem, setProblem] = useState<Problem>(nextProblem);
  const [msLeft, setMsLeft] = useState(RITUAL_SECONDS_PER_PROBLEM * 1000);
  const deadline = useRef(Date.now() + RITUAL_SECONDS_PER_PROBLEM * 1000);
  const startedAt = useRef(Date.now());
  const species = DRAGONS[enemySpeciesId];

  function advance(gotIt: boolean) {
    if (gotIt) sfx.correct();
    else sfx.wrong();
    useGame.getState().recordAnswer(problem.skillId, gotIt, Date.now() - startedAt.current);
    if (gotIt) {
      const done = links + 1;
      setLinks(done);
      if (done >= needed) {
        onSuccess();
        return;
      }
    } else {
      const missed = misses + 1;
      setMisses(missed);
      if (missed > RITUAL_MISSES_ALLOWED) {
        onFail();
        return;
      }
    }
    deadline.current = Date.now() + RITUAL_SECONDS_PER_PROBLEM * 1000;
    startedAt.current = Date.now();
    setMsLeft(RITUAL_SECONDS_PER_PROBLEM * 1000);
    setProblem(nextProblem());
  }

  // Countdown: running out of time on a problem counts as one miss.
  useEffect(() => {
    const tick = setInterval(() => {
      const left = deadline.current - Date.now();
      setMsLeft(Math.max(0, left));
      if (left <= 0) advance(false);
    }, 200);
    return () => clearInterval(tick);
  });

  const timePct = (msLeft / (RITUAL_SECONDS_PER_PROBLEM * 1000)) * 100;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md rounded-3xl bg-violet-950 border-2 border-violet-500 p-5 flex flex-col gap-4 animate-pop">
        <div className="text-center">
          <div className="text-lg font-extrabold text-violet-200">🪢 Tethering {species.name}</div>
          <div className="text-sm text-violet-400">Answer to tighten each link — quick, before it breaks free!</div>
        </div>

        {/* Tether links + escape attempts */}
        <div className="flex items-center justify-between">
          <div className="text-2xl tracking-wider">
            {Array.from({ length: needed }, (_, i) => (i < links ? "🔗" : "⚪")).join(" ")}
          </div>
          <div className="text-sm font-bold text-rose-300">
            {Array.from({ length: RITUAL_MISSES_ALLOWED + 1 }, (_, i) => (i < misses ? "💢" : "·")).join(" ")}
          </div>
        </div>

        {/* Time bar */}
        <div className="h-3 rounded-full bg-black/50 overflow-hidden">
          <div
            className={`h-full ${timePct > 40 ? "bg-violet-400" : "bg-rose-500"}`}
            style={{ width: `${timePct}%`, transition: "width 200ms linear" }}
          />
        </div>

        <div className="rounded-2xl bg-violet-900 p-4 text-center">
          <div className="text-xl font-extrabold leading-snug">{problem.prompt}</div>
        </div>
        <div className={`grid gap-3 ${problem.choices.length <= 2 ? "grid-cols-1" : "grid-cols-2"}`}>
          {problem.choices.map((choice) => (
            <button
              key={choice}
              onClick={() => advance(choice === problem.answer)}
              className="rounded-2xl bg-violet-700 active:bg-violet-500 px-4 py-4 text-xl font-bold shadow-lg"
            >
              {choice}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
