import { aspectMultiplier, ASPECTS } from "../data/aspects";
import { DRAGONS } from "../data/dragons";
import { ADJACENT_ZONES, LINEAGES, ZONE_ORDER, type ZoneId } from "../data/lineages";
import { ELEVATION_SHIFT_COST, FORCE_DOWN_COST, MOVES, type Move } from "../data/moves";
import { randInt } from "./rng";

export const AETHER_CAP = 10;

export interface Combatant {
  speciesId: string;
  hp: number;
  maxHp: number;
  zone: ZoneId;
  aether: number;
  fogged: boolean; // fogbank: next hit taken is halved
}

export type BattleSide = "player" | "enemy";

export interface BattleState {
  player: Combatant;
  enemy: Combatant;
  turn: number;
  phase: "focus" | "act" | "won" | "lost";
  log: string[];
}

function startZone(speciesId: string): ZoneId {
  const lineage = LINEAGES[DRAGONS[speciesId].lineage];
  // Celestials start high in the sky; everyone else starts as low as they live.
  return lineage.id === "celestial" ? "highAir" : lineage.zones.includes("ground") ? "ground" : lineage.zones[0];
}

function makeCombatant(speciesId: string): Combatant {
  const species = DRAGONS[speciesId];
  return { speciesId, hp: species.baseStats.hp, maxHp: species.baseStats.hp, zone: startZone(speciesId), aether: 0, fogged: false };
}

export function createBattle(playerSpeciesId: string, enemySpeciesId: string, playerStartAether = 0): BattleState {
  const player = makeCombatant(playerSpeciesId);
  player.aether = Math.min(AETHER_CAP, playerStartAether);
  const log = [`A wild ${DRAGONS[enemySpeciesId].name} appears!`];
  if (playerStartAether > 0) log.push(`Your Hoard sends ${player.aether} ✨ Aether with you!`);
  return {
    player,
    enemy: makeCombatant(enemySpeciesId),
    turn: 1,
    phase: "focus",
    log,
  };
}

function name(c: Combatant): string {
  return DRAGONS[c.speciesId].name;
}

function zoneName(zone: ZoneId): string {
  return ZONE_ORDER.find((z) => z.id === zone)!.name;
}

// --- rules queries (used by both the UI and the enemy AI) ---

export function canReachPhysically(from: ZoneId, to: ZoneId): boolean {
  return from === to || ADJACENT_ZONES[from].includes(to);
}

// Returns null if usable, otherwise a short kid-readable reason.
export function moveBlockedReason(state: BattleState, side: BattleSide, move: Move): string | null {
  const self = state[side];
  const target = state[side === "player" ? "enemy" : "player"];
  if (self.aether < move.aetherCost) return `Needs ${move.aetherCost} ✨`;
  if (move.attackerZones && !move.attackerZones.includes(self.zone)) return "Only while flying";
  if (move.kind === "physical" && !canReachPhysically(self.zone, target.zone)) return "Can't reach!";
  return null;
}

export function allowedZonesFor(c: Combatant): ZoneId[] {
  return LINEAGES[DRAGONS[c.speciesId].lineage].zones;
}

export function shiftTargets(c: Combatant): ZoneId[] {
  return ADJACENT_ZONES[c.zone].filter((z) => allowedZonesFor(c).includes(z));
}

export function canForceDown(target: Combatant): ZoneId | null {
  const floor = LINEAGES[DRAGONS[target.speciesId].lineage].forcedFloor;
  if (!floor) return null; // immune (Drakes, Wyrms, Leviathans hug the ground already)
  const below = ADJACENT_ZONES[target.zone].find((z) => zoneIndexBelow(target.zone, z));
  if (!below) return null;
  // Can't be forced past the lineage's floor (Celestials never below Low Air).
  const order: ZoneId[] = ["underground", "ground", "lowAir", "highAir"];
  if (order.indexOf(below) < order.indexOf(floor)) return null;
  return below;
}

function zoneIndexBelow(from: ZoneId, candidate: ZoneId): boolean {
  const order: ZoneId[] = ["underground", "ground", "lowAir", "highAir"];
  return order.indexOf(candidate) === order.indexOf(from) - 1;
}

// --- actions (pure: each returns a new state) ---

function withLog(state: BattleState, line: string): BattleState {
  return { ...state, log: [...state.log, line].slice(-30) };
}

function checkEnd(state: BattleState): BattleState {
  if (state.enemy.hp <= 0) return { ...withLog(state, `${name(state.enemy)} is exhausted and retreats!`), phase: "won" };
  if (state.player.hp <= 0) return { ...withLog(state, `${name(state.player)} is exhausted — you retreat safely.`), phase: "lost" };
  return state;
}

export function gainAether(state: BattleState, amount: number): BattleState {
  const player = { ...state.player, aether: Math.min(AETHER_CAP, state.player.aether + amount) };
  return withLog({ ...state, player, phase: "act" }, `You channel +${amount} ✨ Aether!`);
}

// Wrong answer: no aether this beat, and the enemy gets its turn (DESIGN.md 2.5).
export function missFocus(state: BattleState): BattleState {
  return runEnemyTurn(withLog(state, "The Aether slips away… the enemy strikes!"));
}

export function applyMove(state: BattleState, side: BattleSide, moveId: string): BattleState {
  const move = MOVES[moveId];
  const otherSide: BattleSide = side === "player" ? "enemy" : "player";
  let self = { ...state[side], aether: state[side].aether - move.aetherCost };
  let target = { ...state[otherSide] };
  let next: BattleState = { ...state, [side]: self };

  if (move.effect === "fog") {
    self = { ...self, fogged: true };
    return withLog({ ...next, [side]: self }, `${name(self)} hides in a fogbank 🌫️`);
  }

  let dmg = move.power + randInt(-1, 1);
  let note = "";
  if (move.kind === "aspect" && move.aspect) {
    const mult = aspectMultiplier(move.aspect, DRAGONS[target.speciesId].aspect);
    dmg = Math.round(dmg * mult);
    if (mult > 1) note = " It's super strong!";
    if (mult < 1) note = " It fizzles a bit…";
  }
  if (target.fogged) {
    dmg = Math.ceil(dmg / 2);
    target = { ...target, fogged: false };
    note += " The fog softens the blow.";
  }
  dmg = Math.max(1, dmg);
  target = { ...target, hp: Math.max(0, target.hp - dmg) };
  next = { ...next, [side]: self, [otherSide]: target };
  return checkEnd(withLog(next, `${name(self)} uses ${move.emoji} ${move.name} — ${dmg} damage!${note}`));
}

export function shiftZone(state: BattleState, side: BattleSide, to: ZoneId): BattleState {
  const self = { ...state[side], zone: to, aether: state[side].aether - ELEVATION_SHIFT_COST };
  return withLog({ ...state, [side]: self }, `${name(self)} moves to ${zoneName(to)}.`);
}

export function forceDown(state: BattleState, side: BattleSide): BattleState {
  const otherSide: BattleSide = side === "player" ? "enemy" : "player";
  const below = canForceDown(state[otherSide]);
  if (!below) return state;
  const self = { ...state[side], aether: state[side].aether - FORCE_DOWN_COST };
  const target = { ...state[otherSide], zone: below };
  return withLog({ ...state, [side]: self, [otherSide]: target }, `${name(target)} is forced down to ${zoneName(below)}!`);
}

// --- enemy turn: a simple, readable AI ---

export function runEnemyTurn(state: BattleState): BattleState {
  if (state.phase === "won" || state.phase === "lost") return state;
  // The enemy quietly "solves" its own problem: a small aether income, then ONE
  // action — kept gentle on purpose so a kid answering well stays ahead.
  let next: BattleState = { ...state, enemy: { ...state.enemy, aether: Math.min(AETHER_CAP, state.enemy.aether + randInt(1, 3)) } };
  const moves = DRAGONS[next.enemy.speciesId].moves
    .map((id) => MOVES[id])
    .filter((m) => m.kind !== "utility" && moveBlockedReason(next, "enemy", m) === null)
    .sort((a, b) => b.power - a.power);
  if (moves.length > 0) {
    next = applyMove(next, "enemy", moves[0].id);
  } else if (next.enemy.aether >= FORCE_DOWN_COST && canForceDown(next.player)) {
    next = forceDown(next, "enemy");
  }

  if (next.phase !== "won" && next.phase !== "lost") {
    next = { ...next, turn: next.turn + 1, phase: "focus" };
  }
  return next;
}

export function endPlayerTurn(state: BattleState): BattleState {
  return runEnemyTurn(state);
}

export function aspectBadge(speciesId: string) {
  return ASPECTS[DRAGONS[speciesId].aspect];
}
