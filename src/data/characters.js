// src/data/characters.js
// Character roster for the hero-selection screen.
// Add more entries later — the rest of the game reads from this array,
// so adding a 3rd/4th character is just adding another object here.

export const CHARACTERS = [
  {
    id: "hero_girl",
    name: "Riya",
    gender: "female",
    tagline: "Sharp mind, sharper sword.",
    sprite: "/assets/characters/hero_girl.png",
    portrait: "/assets/characters/hero_girl_portrait.png",
    weapon: "sword",
    attackAnim: "slash",
    idleAnim: "idle_girl",
  },
  {
    id: "hero_boy",
    name: "Arjun",
    gender: "male",
    tagline: "Brains over brawn.",
    sprite: "/assets/characters/hero_boy.png",
    portrait: "/assets/characters/hero_boy_portrait.png",
    weapon: "sword",
    attackAnim: "slash",
    idleAnim: "idle_boy",
  },
];

export const DEFAULT_CHARACTER_ID = CHARACTERS[0].id;

export function getCharacterById(id) {
  return CHARACTERS.find((c) => c.id === id) || null;
}

export function getAllCharacters() {
  return CHARACTERS;
}
