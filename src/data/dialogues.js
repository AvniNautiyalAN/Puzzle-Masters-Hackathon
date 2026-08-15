// src/data/dialogues.js
// Savage zombie one-liners. Person 1's battle logic should call
// getRandomDialogue(category) after each answer / on game over / on boss events.

export const DIALOGUES = {
  correctAnswer: [
    "NOOO... HOW DID YOU KNOW THAT?!",
    "Impossible! My brain hurts less than yours!",
    "Ugh... you actually studied?!",
    "That's not fair, I skipped class for this!",
  ],
  wrongAnswer: [
    "Brains aren't the only thing you're losing!",
    "Wrong! Did you even go to school?",
    "That answer was almost as dead as me.",
    "Ha! Even I know that one, and I'm undead.",
  ],
  gameOver: [
    "Class dismissed, survivor.",
    "Looks like the test got the best of you.",
    "F for effort. Literally.",
  ],
  boss: {
    intro: [
      "I am The Professor. Let's see if you've done your homework.",
      "Every survivor thinks they're smart. Prove it.",
    ],
    correct: [
      "Your knowledge... it's stronger than expected.",
      "Hmph. Lucky guess. Or was it?",
    ],
    wrong: [
      "Your knowledge ends here.",
      "Detention. Permanently.",
    ],
    defeat: [
      "Class... dismissed.",
      "You actually beat me. Extra credit granted.",
    ],
  },
};

// category: "correctAnswer" | "wrongAnswer" | "gameOver"
//         | "boss.intro" | "boss.correct" | "boss.wrong" | "boss.defeat"
export function getRandomDialogue(category) {
  const parts = category.split(".");
  let pool = DIALOGUES;
  for (const part of parts) {
    pool = pool?.[part];
  }
  if (!Array.isArray(pool) || pool.length === 0) return "";
  return pool[Math.floor(Math.random() * pool.length)];
}
