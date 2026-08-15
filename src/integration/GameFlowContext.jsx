// src/integration/GameFlowContext.jsx
// THIS IS THE INTEGRATION PIECE — it wires Person 1 (gameplay/battle),
// Person 2 (story/UI screens), and your data/progression/storage together.
//
// Screen flow:
//   intro-story -> character-select -> level-map -> level-story ->
//   gameplay -> (game-over | victory) -> level-map
//
// Usage: wrap your <App /> in <GameFlowProvider>, then any screen component
// calls useGameFlow() to read state and call navigation functions.

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { getLevelById, isLastLevel } from "../data/levels";
import {
  getProgress,
  setSelectedCharacter,
  markIntroStorySeen,
  completeLevel,
  isLevelUnlocked,
} from "../services/storageService";

export const SCREENS = {
  INTRO_STORY: "intro-story",
  CHARACTER_SELECT: "character-select",
  LEVEL_MAP: "level-map",
  LEVEL_STORY: "level-story",
  GAMEPLAY: "gameplay",
  GAME_OVER: "game-over",
  VICTORY: "victory",
};

const GameFlowContext = createContext(null);

export function GameFlowProvider({ children }) {
  const [progress, setProgress] = useState(() => getProgress());
  const [screen, setScreen] = useState(() =>
    progress.hasSeenIntroStory ? SCREENS.CHARACTER_SELECT : SCREENS.INTRO_STORY
  );
  const [activeLevelId, setActiveLevelId] = useState(null);
  const [lastRunScore, setLastRunScore] = useState(0);

  // Re-sync from storage whenever we return to the level map
  // (in case a level was just completed).
  useEffect(() => {
    if (screen === SCREENS.LEVEL_MAP) {
      setProgress(getProgress());
    }
  }, [screen]);

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
    if (!isLevelUnlocked(levelId)) return; // guard: locked levels can't be entered
    setActiveLevelId(levelId);
    setScreen(SCREENS.LEVEL_STORY);
  }, []);

  const startGameplay = useCallback(() => {
    setScreen(SCREENS.GAMEPLAY);
  }, []);

  // Called by Person 1's battle logic when the player's health hits 0.
  const reportGameOver = useCallback(() => {
    setScreen(SCREENS.GAME_OVER);
  }, []);

  // Called by Person 1's battle logic when the final round of a level is cleared.
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
    // navigation actions
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

export function useGameFlow() {
  const ctx = useContext(GameFlowContext);
  if (!ctx) throw new Error("useGameFlow must be used inside <GameFlowProvider>");
  return ctx;
}
