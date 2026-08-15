// src/services/storageService.js
// Wraps localStorage so progress survives page refreshes with no backend.
// This is what makes level-unlocking, character choice, and scores persistent.

import { LEVELS } from "../data/levels";

const STORAGE_KEY = "zombieQuizGame_save_v1";

const DEFAULT_PROGRESS = {
  selectedCharacterId: null,
  unlockedLevels: [1], // level 1 always unlocked
  completedLevels: [], // level ids fully cleared
  highScores: {}, // { [levelId]: bestScore }
  lastPlayedLevel: null,
  hasSeenIntroStory: false,
};

function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// Reads saved progress, or returns a fresh default (does NOT write to storage).
export function getProgress() {
  if (typeof window === "undefined" || !window.localStorage) return { ...DEFAULT_PROGRESS };
  const raw = window.localStorage.getItem(STORAGE_KEY);
  const parsed = raw ? safeParse(raw) : null;
  return parsed ? { ...DEFAULT_PROGRESS, ...parsed } : { ...DEFAULT_PROGRESS };
}

// Merges `updates` into saved progress and persists it.
export function saveProgress(updates) {
  const current = getProgress();
  const next = { ...current, ...updates };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function setSelectedCharacter(characterId) {
  return saveProgress({ selectedCharacterId: characterId });
}

export function markIntroStorySeen() {
  return saveProgress({ hasSeenIntroStory: true });
}

export function isLevelUnlocked(levelId) {
  return getProgress().unlockedLevels.includes(Number(levelId));
}

// Call when a level is fully cleared. Unlocks the next level automatically.
export function completeLevel(levelId, score = 0) {
  const progress = getProgress();
  const id = Number(levelId);

  const completedLevels = progress.completedLevels.includes(id)
    ? progress.completedLevels
    : [...progress.completedLevels, id];

  const nextLevel = LEVELS.find((l) => l.id === id + 1);
  const unlockedLevels =
    nextLevel && !progress.unlockedLevels.includes(nextLevel.id)
      ? [...progress.unlockedLevels, nextLevel.id]
      : progress.unlockedLevels;

  const prevBest = progress.highScores[id] || 0;
  const highScores = { ...progress.highScores, [id]: Math.max(prevBest, score) };

  return saveProgress({
    completedLevels,
    unlockedLevels,
    highScores,
    lastPlayedLevel: id,
  });
}

export function resetProgress() {
  window.localStorage.removeItem(STORAGE_KEY);
  return { ...DEFAULT_PROGRESS };
}
