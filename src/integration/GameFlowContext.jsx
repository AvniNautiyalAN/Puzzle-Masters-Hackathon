// src/integration/GameFlowContext.jsx
import { useState, useCallback } from "react";
import { getLevelById, isLastLevel } from "../data/levels";
import {
  getProgress,
  setSelectedCharacter,
  markIntroStorySeen,
  completeLevel,
  isLevelUnlocked,
} from "../services/storageService";
import { SCREENS } from "./screens";
import { GameFlowContext } from "./GameFlowContextInstance";

export function GameFlowProvider({ children }) {
  const [progress, setProgress] = useState(() => getProgress());
  const [screen, setScreen] = useState(() =>
    progress.hasSeenIntroStory ? SCREENS.CHARACTER_SELECT : SCREENS.INTRO_STORY
  );
  const [activeLevelId, setActiveLevelId] = useState(null);
  const [lastRunScore, setLastRunScore] = useState(0);

  const finishIntroStory = useCallback(() => {
    markIntroStorySeen();
    setProgress(getProgress());
    setScreen(SCREENS.CHARACTER_SELECT);
  }, []);

  const chooseCharacter = useCallback((characterId) => {
    setSelectedCharacter(characterId);
    setProgress(getProgress());
    setScreen(SCREENS.LEVEL_MAP);
  }, []);

  const selectLevel = useCallback((levelId) => {
    if (!isLevelUnlocked(levelId)) return;
    setActiveLevelId(levelId);
    setScreen(SCREENS.LEVEL_STORY);
  }, []);

  const startGameplay = useCallback(() => {
    setScreen(SCREENS.GAMEPLAY);
  }, []);

  const reportGameOver = useCallback(() => {
    setScreen(SCREENS.GAME_OVER);
  }, []);

  const reportLevelVictory = useCallback(
    (score = 0) => {
      if (!activeLevelId) return;
      completeLevel(activeLevelId, score);
      setLastRunScore(score);
      setProgress(getProgress());
      setScreen(SCREENS.VICTORY);
    },
    [activeLevelId]
  );

  const backToLevelMap = useCallback(() => {
    setActiveLevelId(null);
    setProgress(getProgress());
    setScreen(SCREENS.LEVEL_MAP);
  }, []);

  const retryLevel = useCallback(() => {
    setScreen(SCREENS.LEVEL_STORY);
  }, []);

  const value = {
    screen,
    progress,
    activeLevel: activeLevelId ? getLevelById(activeLevelId) : null,
    isFinalLevel: activeLevelId ? isLastLevel(activeLevelId) : false,
    lastRunScore,
    finishIntroStory,
    chooseCharacter,
    selectLevel,
    startGameplay,
    reportGameOver,
    reportLevelVictory,
    backToLevelMap,
    retryLevel,
  };

  return <GameFlowContext.Provider value={value}>{children}</GameFlowContext.Provider>;
}
