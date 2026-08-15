// src/data/levels.js
// Defines the 5 levels: location, round count, question difficulty,
// which zombies can appear, and the short story shown before the level starts.
// Person 2's story/UI screens should read `storyIntro` to render slides/video.

export const LEVELS = [
  {
    id: 1,
    name: "The Abandoned House",
    location: "Abandoned House",
    rounds: 5,
    questionDifficulty: "easy", // maps to questions.js keys
    zombiePool: ["walker"],
    isBossLevel: false,
    storyIntro: {
      type: "images", // "images" | "video"
      media: [
        { src: "/assets/story/level1_1.png", caption: "The outbreak started here." },
        { src: "/assets/story/level1_2.png", caption: "Something moved upstairs..." },
      ],
    },
  },
  {
    id: 2,
    name: "The Hospital",
    location: "Hospital",
    rounds: 6,
    questionDifficulty: "medium",
    zombiePool: ["walker", "screamer"],
    isBossLevel: false,
    storyIntro: {
      type: "images",
      media: [
        { src: "/assets/story/level2_1.png", caption: "Survivors were last seen here." },
        { src: "/assets/story/level2_2.png", caption: "The infection spread fast." },
      ],
    },
  },
  {
    id: 3,
    name: "The Apartments",
    location: "Apartments",
    rounds: 6,
    questionDifficulty: "medium-hard",
    zombiePool: ["screamer", "brute"],
    isBossLevel: false,
    storyIntro: {
      type: "images",
      media: [
        { src: "/assets/story/level3_1.png", caption: "Every door hides something." },
        { src: "/assets/story/level3_2.png", caption: "Keep your wits sharp." },
      ],
    },
  },
  {
    id: 4,
    name: "The Metro",
    location: "Metro",
    rounds: 7,
    questionDifficulty: "hard",
    zombiePool: ["brute"],
    isBossLevel: false,
    storyIntro: {
      type: "images",
      media: [
        { src: "/assets/story/level4_1.png", caption: "The tunnels never end." },
        { src: "/assets/story/level4_2.png", caption: "This is the last stretch." },
      ],
    },
  },
  {
    id: 5,
    name: "The Laboratory",
    location: "Laboratory",
    rounds: 7,
    questionDifficulty: "boss",
    zombiePool: ["brute", "professor"],
    isBossLevel: true,
    storyIntro: {
      type: "video",
      media: [{ src: "/assets/story/level5_intro.mp4", caption: "This is where it all began." }],
    },
  },
];

export function getLevelById(id) {
  return LEVELS.find((l) => l.id === Number(id)) || null;
}

export function getNextLevel(currentId) {
  return LEVELS.find((l) => l.id === Number(currentId) + 1) || null;
}

export function isLastLevel(id) {
  return Number(id) === LEVELS[LEVELS.length - 1].id;
}

export function getAllLevels() {
  return LEVELS;
}
