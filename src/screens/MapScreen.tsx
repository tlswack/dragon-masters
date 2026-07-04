import { DRAGONS } from "../data/dragons";
import { REGIONS, type Region, type RegionBattle } from "../data/regions";
import { battleUnlocked, bossUnlocked, isBattleDone, regionCleared, regionUnlocked } from "../engine/campaign";
import { MASTERING_AT, masteryOf, skillName } from "../engine/mastery";
import { useGame } from "../state/store";

function BattleRow({
  region,
  battle,
  unlocked,
  done,
  isBoss,
}: {
  region: Region;
  battle: RegionBattle;
  unlocked: boolean;
  done: boolean;
  isBoss: boolean;
}) {
  const startBattle = useGame((s) => s.startBattle);
  const enemy = DRAGONS[battle.enemySpeciesId];
  return (
    <button
      disabled={!unlocked}
      onClick={() => startBattle(battle.enemySpeciesId, { regionId: region.id, battleId: battle.id })}
      className={`rounded-xl p-3 text-left w-full ${
        isBoss ? "bg-rose-950 border border-rose-700" : "bg-slate-800"
      } disabled:opacity-40`}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="font-bold">
            {done ? "✅" : unlocked ? (isBoss ? "👑" : "▶️") : "🔒"} {battle.name}
          </div>
          <div className="text-xs text-slate-400">
            {battle.blurb} ({enemy.emoji} {enemy.name})
          </div>
        </div>
        {unlocked && <span className="text-sm font-bold text-slate-300">{done ? "Again" : "Go!"}</span>}
      </div>
    </button>
  );
}

export default function MapScreen() {
  const { campaignProgress, mastery, setScreen } = useGame();

  return (
    <div className="min-h-dvh bg-slate-950 text-white flex flex-col p-4 max-w-md mx-auto">
      <header className="flex items-center justify-between py-3">
        <button onClick={() => setScreen("home")} className="rounded-xl bg-slate-800 px-3 py-2 font-bold">
          🏠
        </button>
        <h1 className="text-2xl font-extrabold">🗺️ The World</h1>
        <div className="w-10" />
      </header>

      <div className="flex flex-col gap-4">
        {REGIONS.map((region, i) => {
          const open = regionUnlocked(campaignProgress, i);
          const cleared = regionCleared(campaignProgress, region);
          const bossOpen = open && bossUnlocked(campaignProgress, region, mastery);
          const skillsNotReady = region.requiredSkills.filter((s) => masteryOf(mastery, s) < MASTERING_AT);
          return (
            <section key={region.id} className={`rounded-2xl bg-slate-900 p-4 ${open ? "" : "opacity-50"}`}>
              <h2 className="font-extrabold text-lg">
                {region.emoji} {region.name} {cleared && "🏅"}
              </h2>
              <p className="text-sm text-slate-400 mb-3">{region.description}</p>
              {!open ? (
                <p className="text-sm text-amber-300">🔒 Beat the region before this one to enter.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {region.battles.map((battle, bi) => (
                    <BattleRow
                      key={battle.id}
                      region={region}
                      battle={battle}
                      unlocked={battleUnlocked(campaignProgress, region, bi)}
                      done={isBattleDone(campaignProgress, region.id, battle.id)}
                      isBoss={false}
                    />
                  ))}
                  <BattleRow
                    region={region}
                    battle={region.boss}
                    unlocked={bossOpen}
                    done={isBattleDone(campaignProgress, region.id, region.boss.id)}
                    isBoss
                  />
                  {!bossOpen && (
                    <p className="text-xs text-amber-300">
                      👑 Boss opens when every path is cleared
                      {skillsNotReady.length > 0 && <> and you're practicing: {skillsNotReady.map(skillName).join(", ")}</>}
                      . Sharpen skills on the Focus Board!
                    </p>
                  )}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
