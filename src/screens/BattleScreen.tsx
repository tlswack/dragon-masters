import { useMemo, useState } from "react";
import FocusBoard from "../components/FocusBoard";
import { ASPECTS } from "../data/aspects";
import { DRAGONS } from "../data/dragons";
import { LINEAGES, ZONE_ORDER, type ZoneId } from "../data/lineages";
import { ELEVATION_SHIFT_COST, FORCE_DOWN_COST, MOVES } from "../data/moves";
import {
  applyMove,
  canForceDown,
  createBattle,
  endPlayerTurn,
  forceDown,
  gainAether,
  missFocus,
  moveBlockedReason,
  shiftZone,
  shiftTargets,
  type BattleState,
  type Combatant,
} from "../engine/battle";
import { useGame, type BattleConfig } from "../state/store";

function HpBar({ c }: { c: Combatant }) {
  const pct = Math.round((c.hp / c.maxHp) * 100);
  const color = pct > 50 ? "bg-emerald-500" : pct > 25 ? "bg-amber-500" : "bg-rose-500";
  return (
    <div className="h-3 w-full rounded-full bg-black/40 overflow-hidden">
      <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function DragonCard({ c, side }: { c: Combatant; side: "player" | "enemy" }) {
  const species = DRAGONS[c.speciesId];
  const aspect = ASPECTS[species.aspect];
  return (
    <div className={`rounded-xl p-2 w-36 ${side === "player" ? "bg-indigo-800/90" : "bg-rose-900/80"}`}>
      <div className="flex items-center gap-1 text-sm font-bold">
        <span className="text-2xl">{species.emoji}</span>
        <span className="truncate">{species.name}</span>
        {c.fogged && <span title="Hidden in fog">🌫️</span>}
      </div>
      <HpBar c={c} />
      <div className="text-xs mt-1 flex items-center justify-between">
        <span className={`${aspect.badgeClass} rounded-full px-1.5 py-0.5`}>
          {aspect.emoji} {aspect.name}
        </span>
        <span>
          {c.hp}/{c.maxHp}
        </span>
      </div>
    </div>
  );
}

export default function BattleScreen({ config }: { config: BattleConfig }) {
  const setScreen = useGame((s) => s.setScreen);
  const recordAnswer = useGame((s) => s.recordAnswer);
  const [battle, setBattle] = useState<BattleState>(() => createBattle(config.playerSpeciesId, config.enemySpeciesId));
  // What the focus answer should do once the child taps "continue" on feedback.
  const [pendingFocus, setPendingFocus] = useState<{ correct: boolean; aether: number } | null>(null);

  const zones = useMemo(() => {
    const used = new Set<ZoneId>();
    for (const c of [battle.player, battle.enemy]) {
      for (const z of LINEAGES[DRAGONS[c.speciesId].lineage].zones) used.add(z);
    }
    used.add("ground");
    return ZONE_ORDER.filter((z) => used.has(z.id));
  }, [battle.player, battle.enemy]);

  function continueAfterFocus() {
    if (!pendingFocus) return;
    setBattle((b) => (pendingFocus.correct ? gainAether(b, pendingFocus.aether) : missFocus(b)));
    setPendingFocus(null);
  }

  const playerMoves = DRAGONS[battle.player.speciesId].moves.map((id) => MOVES[id]);
  const forceTarget = canForceDown(battle.enemy);

  return (
    <div className="min-h-dvh bg-slate-950 text-white flex flex-col p-3 max-w-md mx-auto">
      <header className="flex items-center justify-between py-2">
        <button onClick={() => setScreen("home")} className="rounded-xl bg-slate-800 px-3 py-2 font-bold">
          🏳️ Retreat
        </button>
        <div className="font-bold text-slate-300">Turn {battle.turn}</div>
        <div className="rounded-full bg-indigo-800 px-3 py-1.5 font-extrabold">✨ {battle.player.aether}</div>
      </header>

      {/* Battlefield: elevation zones stacked top to bottom */}
      <div className="flex flex-col gap-1.5 my-2">
        {zones.map((zone) => (
          <div
            key={zone.id}
            className="rounded-xl border border-slate-800 bg-slate-900/70 px-2 py-1.5 min-h-16 flex items-center justify-between gap-2"
          >
            {battle.player.zone === zone.id ? <DragonCard c={battle.player} side="player" /> : <div className="w-36" />}
            <div className="text-xs text-slate-500 font-semibold text-center shrink-0">
              {zone.emoji}
              <br />
              {zone.name}
            </div>
            {battle.enemy.zone === zone.id ? <DragonCard c={battle.enemy} side="enemy" /> : <div className="w-36" />}
          </div>
        ))}
      </div>

      {/* Battle log — last couple of lines */}
      <div className="rounded-xl bg-slate-900 px-3 py-2 text-sm text-slate-300 min-h-12 mb-2">
        {battle.log.slice(-2).map((line, i) => (
          <div key={`${battle.log.length}-${i}`}>{line}</div>
        ))}
      </div>

      {battle.phase === "focus" && (
        <FocusBoard
          onAnswer={({ correct, tier }) => {
            recordAnswer(correct);
            setPendingFocus({ correct, aether: tier.aether });
          }}
          onContinue={continueAfterFocus}
          continueLabel="To battle! ⚔️"
        />
      )}

      {battle.phase === "act" && (
        <div className="flex flex-col gap-2">
          <p className="text-center text-slate-300 font-semibold text-sm">Spend your Aether, then end your turn</p>
          {playerMoves.map((move) => {
            const blocked = moveBlockedReason(battle, "player", move);
            return (
              <button
                key={move.id}
                disabled={blocked !== null}
                onClick={() => setBattle((b) => applyMove(b, "player", move.id))}
                className="rounded-2xl bg-indigo-700 active:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 px-4 py-3 text-left shadow flex items-center justify-between"
              >
                <span className="font-bold">
                  {move.emoji} {move.name}
                </span>
                <span className="text-sm">{blocked ?? `${move.aetherCost} ✨`}</span>
              </button>
            );
          })}
          <div className="flex gap-2">
            {shiftTargets(battle.player).map((zone) => (
              <button
                key={zone}
                disabled={battle.player.aether < ELEVATION_SHIFT_COST}
                onClick={() => setBattle((b) => shiftZone(b, "player", zone))}
                className="flex-1 rounded-2xl bg-sky-800 active:bg-sky-600 disabled:bg-slate-800 disabled:text-slate-500 px-3 py-3 font-bold"
              >
                🪽 Fly to {ZONE_ORDER.find((z) => z.id === zone)!.name} ({ELEVATION_SHIFT_COST} ✨)
              </button>
            ))}
            {forceTarget && (
              <button
                disabled={battle.player.aether < FORCE_DOWN_COST}
                onClick={() => setBattle((b) => forceDown(b, "player"))}
                className="flex-1 rounded-2xl bg-amber-800 active:bg-amber-600 disabled:bg-slate-800 disabled:text-slate-500 px-3 py-3 font-bold"
              >
                ⬇️ Force it down! ({FORCE_DOWN_COST} ✨)
              </button>
            )}
          </div>
          <button
            onClick={() => setBattle((b) => endPlayerTurn(b))}
            className="rounded-2xl bg-slate-700 active:bg-slate-600 px-4 py-3 font-bold"
          >
            ⏭️ End turn
          </button>
        </div>
      )}

      {battle.phase === "won" && (
        <div className="rounded-2xl bg-emerald-900/80 p-6 text-center flex flex-col gap-3">
          <div className="text-5xl">🏆</div>
          <div className="text-2xl font-extrabold">Victory!</div>
          <p className="text-emerald-200">{DRAGONS[battle.enemy.speciesId].name} is exhausted and retreats.</p>
          <button onClick={() => setScreen("home")} className="rounded-2xl bg-emerald-600 px-4 py-3 font-bold text-lg">
            Back home 🏠
          </button>
        </div>
      )}

      {battle.phase === "lost" && (
        <div className="rounded-2xl bg-slate-800 p-6 text-center flex flex-col gap-3">
          <div className="text-5xl">🛡️</div>
          <div className="text-2xl font-extrabold">You retreat — safe and sound</div>
          <p className="text-slate-300">Every dragon master retreats sometimes. Ready to try again?</p>
          <button
            onClick={() => setBattle(createBattle(config.playerSpeciesId, config.enemySpeciesId))}
            className="rounded-2xl bg-indigo-600 px-4 py-3 font-bold text-lg"
          >
            ⚔️ Try again
          </button>
          <button onClick={() => setScreen("home")} className="rounded-2xl bg-slate-700 px-4 py-3 font-bold">
            Back home 🏠
          </button>
        </div>
      )}
    </div>
  );
}
