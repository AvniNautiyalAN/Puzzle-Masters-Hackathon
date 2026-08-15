// src/data/zombies.js
// Zombie type stats. Person 1 (gameplay/battle logic) reads health/damage
// from here to run combat; the "deathAnim" key tells Person 1's game logic
// which effect to trigger when a zombie is defeated (fire / lightning / sword).

export const ZOMBIE_TYPES = {
  walker: {
    id: "walker",
    name: "Walker",
    health: 50,
    damage: 10,
    difficulty: "easy",
    sprite: "/assets/zombies/walker.png",
    deathAnim: "fire",
  },
  screamer: {
    id: "screamer",
    name: "Screamer",
    health: 75,
    damage: 15,
    difficulty: "medium",
    sprite: "/assets/zombies/screamer.png",
    deathAnim: "lightning",
  },
  brute: {
    id: "brute",
    name: "Brute",
    health: 100,
    damage: 25,
    difficulty: "hard",
    sprite: "/assets/zombies/brute.png",
    deathAnim: "sword",
  },
  professor: {
    id: "professor",
    name: "The Professor",
    health: 200,
    damage: 30,
    difficulty: "boss",
    sprite: "/assets/zombies/professor.png",
    deathAnim: "explosion",
    isBoss: true,
  },
};

// Which zombie types are allowed to appear at each difficulty tier.
// Levels reference this indirectly via levels.js -> zombiePool.
export const DIFFICULTY_TO_ZOMBIES = {
  easy: ["walker"],
  medium: ["walker", "screamer"],
  "medium-hard": ["screamer", "brute"],
  hard: ["brute"],
  boss: ["professor"],
};

export function getZombieType(id) {
  return ZOMBIE_TYPES[id] || null;
}

// Pick a random zombie type object from a pool of ids, e.g. ["walker","screamer"]
export function getRandomZombieFromPool(pool) {
  const id = pool[Math.floor(Math.random() * pool.length)];
  return ZOMBIE_TYPES[id];
}
