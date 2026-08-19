import { GameFlowProvider } from "./integration/GameFlowContext";
import { useGameFlow } from "./integration/useGameFlow";
import { SCREENS } from "./integration/screens";
import MainMenuScreen from "./components/screens/MainMenuScreen";
import CharacterSelectScreen from "./components/screens/CharacterSelectScreen";
import LevelMapScreen from "./components/screens/LevelMapScreen";
import LevelStoryScreen from "./components/screens/LevelStoryScreen";
import BattleScreen from "./components/BattleScreen";
import VictoryGameOverOverlay from "./components/screens/VictoryGameOverOverlay";
import "./App.css";

function GameRouter() {
  const { screen, activeLevel } = useGameFlow();

  switch (screen) {
    case SCREENS.INTRO_STORY:
      return <MainMenuScreen />;
    case SCREENS.CHARACTER_SELECT:
      return <CharacterSelectScreen />;
    case SCREENS.LEVEL_MAP:
      return <LevelMapScreen />;
    case SCREENS.LEVEL_STORY:
      return <LevelStoryScreen />;
    case SCREENS.GAMEPLAY:
      return <BattleScreen levelId={activeLevel?.id || 1} />;
    case SCREENS.VICTORY:
      return <VictoryGameOverOverlay isVictory={true} />;
    case SCREENS.GAME_OVER:
      return <VictoryGameOverOverlay isVictory={false} />;
    default:
      return <MainMenuScreen />;
  }
}

export default function App() {
  return (
    <GameFlowProvider>
      <GameRouter />
    </GameFlowProvider>
  );
}