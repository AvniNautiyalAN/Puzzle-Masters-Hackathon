// src/utils/progression.js
// Pure logic helpers Person 1's battle screen calls into: how many zombies
// appear in a round, how much health drops on a wrong answer, and whether
// a round/level is complete. Kept framework-agnostic (plain functions).

import { getLevelById } from "../data/levels";
import { getRandomZombieFromPool, DIFFICULTY_TO_ZOMBIES } from "../data/zombies";

export const STARTING_HEALTH = 100;

// Zombies get more numerous as rounds progress within a level.
// Round 1 -> 1 zombie, scaling up to a cap of 4 by the final rounds.
export function getZombieCountForRound(levelId, roundNumber) {
  const level = getLevelById(levelId);
  if (!level) return 1;
  const base = 1 + Math.floor((roundNumber - 1) / 2); // +1 every 2 rounds
  return Math.min(base, 4);
}

// Builds the zombie list for a given round using the level's zombiePool.
export function buildRoundZombies(levelId, roundNumber) {
  const level = getLevelById(levelId);
  if (!level) return [];
  const count = getZombieCountForRound(levelId, roundNumber);
  return Array.from({ length: count }, () => getRandomZombieFromPool(level.zombiePool));
}

// Health lost per wrong answer. Scales slightly with difficulty tier so
// later levels punish mistakes harder.
const DAMAGE_BY_DIFFICULTY = {
  easy: 15,
  medium: 18,
  "medium-hard": 20,
  hard: 22,
  boss: 25,
};

export function getDamageForWrongAnswer(difficulty) {
  return DAMAGE_BY_DIFFICULTY[difficulty] ?? 15;
}

// Applies damage and clamps health between 0 and STARTING_HEALTH.
export function applyDamage(currentHealth, damage) {
  return Math.max(0, Math.min(STARTING_HEALTH, currentHealth - damage));
}

export function isPlayerDefeated(currentHealth) {
  return currentHealth <= 0;
}

export function isRoundComplete(zombiesRemaining) {
  return zombiesRemaining <= 0;
}

export function isLevelComplete(currentRound, totalRounds) {
  return currentRound > totalRounds;
}

// Simple score formula: correct answers weighted by difficulty, minus a
// small penalty for wrong answers. Used for the high-score save.
const SCORE_WEIGHT = { easy: 10, medium: 15, "medium-hard": 20, hard: 25, boss: 40 };

export function calculateScore({ difficulty, correctCount, wrongCount }) {
  const weight = SCORE_WEIGHT[difficulty] ?? 10;
  return Math.max(0, correctCount * weight - wrongCount * (weight / 2));
}
