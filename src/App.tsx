import BattleScreen from "./screens/BattleScreen";
import HomeScreen from "./screens/HomeScreen";
import ParentScreen from "./screens/ParentScreen";
import PracticeScreen from "./screens/PracticeScreen";
import { useGame } from "./state/store";

export default function App() {
  const screen = useGame((s) => s.screen);
  const battleConfig = useGame((s) => s.battleConfig);

  if (screen === "practice") return <PracticeScreen />;
  if (screen === "parent") return <ParentScreen />;
  if (screen === "battle" && battleConfig) {
    // key remounts the battle when a new one starts
    return <BattleScreen key={`${battleConfig.playerSpeciesId}-${battleConfig.enemySpeciesId}`} config={battleConfig} />;
  }
  return <HomeScreen />;
}
