import { useRef, useState } from "react";
import { FOCUS_TIERS, type FocusTier, type FocusTierId } from "../data/focusTiers";
import type { Problem } from "../data/skills";
import { generateProblem } from "../engine/problems";
import { sfx } from "../engine/sfx";
import { useGame } from "../state/store";

export interface AnswerResult {
  correct: boolean;
  tier: FocusTier;
  skillId: string;
  elapsedMs: number;
}

interface FocusBoardProps {
  onAnswer: (result: AnswerResult) => void;
  // Battles need to react after the child has SEEN the feedback (e.g. run the
  // enemy turn) — so the "continue" tap is surfaced to the parent.
  onContinue?: (lastCorrect: boolean) => void;
  continueLabel?: string;
  // Battles can swap in the adaptive selector later; practice mode uses the default.
  problemFor?: (tier: FocusTierId) => Problem;
}

type Stage = { kind: "choosing" } | { kind: "solving"; tier: FocusTier; problem: Problem } | { kind: "feedback"; tier: FocusTier; problem: Problem; correct: boolean };

const TIER_STYLES: Record<FocusTierId, string> = {
  quick: "bg-emerald-600 active:bg-emerald-500",
  medium: "bg-amber-600 active:bg-amber-500",
  heavy: "bg-rose-600 active:bg-rose-500",
};

// Default selection is adaptive: it reads the child's live mastery map.
function adaptiveProblem(tier: FocusTierId): Problem {
  const { mastery, difficultyBias } = useGame.getState();
  return generateProblem(tier, mastery, difficultyBias);
}

export default function FocusBoard({ onAnswer, onContinue, continueLabel = "Keep going ➜", problemFor = adaptiveProblem }: FocusBoardProps) {
  const [stage, setStage] = useState<Stage>({ kind: "choosing" });
  const startedAt = useRef(0);

  function chooseTier(tier: FocusTier) {
    startedAt.current = Date.now();
    setStage({ kind: "solving", tier, problem: problemFor(tier.id) });
  }

  function answer(choice: string) {
    if (stage.kind !== "solving") return;
    const correct = choice === stage.problem.answer;
    const elapsedMs = Date.now() - startedAt.current;
    if (correct) sfx.correct();
    else sfx.wrong();
    // Every answer anywhere in the game feeds the mastery model.
    useGame.getState().recordAnswer(stage.problem.skillId, correct, elapsedMs);
    onAnswer({ correct, tier: stage.tier, skillId: stage.problem.skillId, elapsedMs });
    setStage({ kind: "feedback", tier: stage.tier, problem: stage.problem, correct });
  }

  if (stage.kind === "choosing") {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-center text-indigo-200 font-semibold">Choose your Focus</p>
        {FOCUS_TIERS.map((tier) => (
          <button
            key={tier.id}
            onClick={() => chooseTier(tier)}
            className={`${TIER_STYLES[tier.id]} rounded-2xl px-5 py-4 text-left shadow-lg transition-transform active:scale-95`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold">
                {tier.emoji} {tier.name}
              </span>
              <span className="text-lg font-extrabold bg-black/25 rounded-full px-3 py-1">+{tier.aether} ✨</span>
            </div>
            <div className="text-sm opacity-80">{tier.tagline}</div>
          </button>
        ))}
      </div>
    );
  }

  if (stage.kind === "solving") {
    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-2xl bg-indigo-900 p-5 text-center shadow-inner">
          <div className="text-sm text-indigo-300 mb-1">
            {stage.tier.emoji} {stage.tier.name} · +{stage.tier.aether} ✨
          </div>
          <div className="text-2xl font-extrabold leading-snug">{stage.problem.prompt}</div>
        </div>
        <div className={`grid gap-3 ${stage.problem.choices.length <= 2 ? "grid-cols-1" : "grid-cols-2"}`}>
          {stage.problem.choices.map((choice) => (
            <button
              key={choice}
              onClick={() => answer(choice)}
              className="rounded-2xl bg-indigo-700 active:bg-indigo-500 px-4 py-5 text-2xl font-bold shadow-lg transition-transform active:scale-95"
            >
              {choice}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Feedback stage — gentle either way (DESIGN.md ch. 2.5).
  return (
    <div className="flex flex-col gap-4 text-center animate-pop">
      {stage.correct ? (
        <div className="rounded-2xl bg-emerald-800/70 p-6">
          <div className="text-4xl mb-2">🎉</div>
          <div className="text-2xl font-extrabold">Correct!</div>
          <div className="text-lg text-emerald-200">+{stage.tier.aether} Aether flows to you ✨</div>
        </div>
      ) : (
        <div className="rounded-2xl bg-slate-800/80 p-6">
          <div className="text-4xl mb-2">💨</div>
          <div className="text-xl font-bold">Not this time — the answer was {stage.problem.answer}</div>
          <div className="text-base text-slate-300 mt-2">💡 {stage.problem.hint}</div>
        </div>
      )}
      <button
        onClick={() => {
          const wasCorrect = stage.correct;
          setStage({ kind: "choosing" });
          onContinue?.(wasCorrect);
        }}
        className="rounded-2xl bg-indigo-600 active:bg-indigo-500 px-5 py-4 text-xl font-bold shadow-lg"
      >
        {continueLabel}
      </button>
    </div>
  );
}
