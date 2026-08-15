// src/data/questions.js
// Question bank grouped by difficulty tier. Tier keys match `questionDifficulty`
// in levels.js: easy | medium | medium-hard | hard | boss.
// Each question: { id, question, options: [4], correctAnswer (index 0-3), subject }

let _id = 1;
const q = (question, options, correctAnswer, subject) => ({
  id: `q${_id++}`,
  question,
  options,
  correctAnswer,
  subject,
});

export const QUESTIONS = {
  easy: [
    q("What is the capital of India?", ["Mumbai", "Delhi", "Chennai", "Kolkata"], 1, "Geography"),
    q("How many days are there in a week?", ["5", "6", "7", "8"], 2, "General"),
    q("What color do you get by mixing blue and yellow?", ["Purple", "Green", "Orange", "Pink"], 1, "General"),
    q("Which planet is known as the Red Planet?", ["Venus", "Mars", "Jupiter", "Saturn"], 1, "Science"),
    q("What is 5 + 7?", ["10", "11", "12", "13"], 2, "Math"),
    q("Which animal is known as man's best friend?", ["Cat", "Dog", "Horse", "Cow"], 1, "General"),
    q("What is the largest ocean on Earth?", ["Atlantic", "Indian", "Arctic", "Pacific"], 3, "Geography"),
    q("How many legs does a spider have?", ["6", "8", "10", "12"], 1, "Science"),
    q("What is the freezing point of water in Celsius?", ["0", "10", "32", "100"], 0, "Science"),
    q("Which shape has three sides?", ["Square", "Triangle", "Circle", "Pentagon"], 1, "Math"),
  ],
  medium: [
    q("Who wrote the play 'Romeo and Juliet'?", ["Charles Dickens", "William Shakespeare", "Mark Twain", "Leo Tolstoy"], 1, "Literature"),
    q("What is the chemical symbol for Gold?", ["Ag", "Au", "Gd", "Go"], 1, "Science"),
    q("Which country hosted the 2016 Summer Olympics?", ["China", "UK", "Brazil", "Japan"], 2, "General"),
    q("What is the square root of 144?", ["10", "11", "12", "14"], 2, "Math"),
    q("Which organ pumps blood through the human body?", ["Lungs", "Liver", "Heart", "Kidney"], 2, "Science"),
    q("The Great Wall is located in which country?", ["India", "China", "Japan", "Mongolia"], 1, "Geography"),
    q("Which language has the most native speakers worldwide?", ["English", "Spanish", "Mandarin Chinese", "Hindi"], 2, "General"),
    q("What is the powerhouse of the cell?", ["Nucleus", "Ribosome", "Mitochondria", "Cytoplasm"], 2, "Science"),
    q("Who painted the Mona Lisa?", ["Van Gogh", "Picasso", "Leonardo da Vinci", "Michelangelo"], 2, "Art"),
    q("Which continent is the Sahara Desert located in?", ["Asia", "Africa", "Australia", "South America"], 1, "Geography"),
  ],
  "medium-hard": [
    q("What is the SI unit of electric current?", ["Volt", "Watt", "Ampere", "Ohm"], 2, "Science"),
    q("Which gas do plants primarily absorb for photosynthesis?", ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"], 2, "Science"),
    q("Who was the first President of the United States?", ["Abraham Lincoln", "George Washington", "Thomas Jefferson", "John Adams"], 1, "History"),
    q("What is the value of Pi (approx)?", ["3.12", "3.14", "3.16", "3.18"], 1, "Math"),
    q("Which planet has the most moons in our solar system?", ["Jupiter", "Saturn", "Uranus", "Neptune"], 1, "Science"),
    q("The theory of relativity was developed by whom?", ["Isaac Newton", "Niels Bohr", "Albert Einstein", "Galileo Galilei"], 2, "Science"),
    q("Which river is the longest in the world?", ["Amazon", "Nile", "Yangtze", "Mississippi"], 1, "Geography"),
    q("What does 'HTTP' stand for?", [
      "HyperText Transfer Protocol",
      "High Transfer Text Protocol",
      "HyperText Type Protocol",
      "Home Tool Transfer Protocol",
    ], 0, "Technology"),
    q("Which element has the atomic number 1?", ["Helium", "Hydrogen", "Oxygen", "Carbon"], 1, "Science"),
    q("In which year did World War II end?", ["1943", "1945", "1947", "1950"], 1, "History"),
  ],
  hard: [
    q("What is the time complexity of binary search?", ["O(n)", "O(n log n)", "O(log n)", "O(1)"], 2, "Technology"),
    q("Who proposed the laws of planetary motion?", ["Isaac Newton", "Johannes Kepler", "Nicolaus Copernicus", "Galileo Galilei"], 1, "Science"),
    q("Which country has the most time zones?", ["Russia", "USA", "France", "China"], 2, "Geography"),
    q("What is the derivative of x^2?", ["x", "2x", "x^2", "2x^2"], 1, "Math"),
    q("Which vitamin is produced when skin is exposed to sunlight?", ["Vitamin A", "Vitamin C", "Vitamin D", "Vitamin K"], 2, "Science"),
    q("Who wrote 'The Republic'?", ["Aristotle", "Socrates", "Plato", "Homer"], 2, "Literature"),
    q("What is the smallest prime number?", ["0", "1", "2", "3"], 2, "Math"),
    q("Which battle marked Napoleon's final defeat?", ["Trafalgar", "Austerlitz", "Waterloo", "Leipzig"], 2, "History"),
    q("What does 'CPU' stand for?", ["Central Processing Unit", "Computer Personal Unit", "Central Program Utility", "Core Processing Unit"], 0, "Technology"),
    q("Which layer of Earth is mostly liquid iron and nickel?", ["Crust", "Mantle", "Outer Core", "Inner Core"], 2, "Science"),
  ],
  boss: [
    q("What is the only mammal capable of true flight?", ["Flying Squirrel", "Bat", "Sugar Glider", "Colugo"], 1, "Science"),
    q("Which programming paradigm treats computation as evaluating math functions?", ["Object-Oriented", "Procedural", "Functional", "Imperative"], 2, "Technology"),
    q("Who formulated the uncertainty principle in quantum mechanics?", ["Niels Bohr", "Werner Heisenberg", "Max Planck", "Erwin Schrödinger"], 1, "Science"),
    q("Which ancient wonder was located in Alexandria?", ["Hanging Gardens", "Colossus of Rhodes", "Lighthouse of Alexandria", "Great Pyramid"], 2, "History"),
    q("What is the term for a group of crows called?", ["A Flock", "A Murder", "A Pack", "A Colony"], 1, "General"),
    q("Which data structure uses FIFO (First In First Out)?", ["Stack", "Queue", "Tree", "Graph"], 1, "Technology"),
    q("What is the rarest blood type in humans?", ["O negative", "AB negative", "B negative", "A negative"], 1, "Science"),
    q("Who is known as the father of modern computing?", ["Charles Babbage", "Alan Turing", "John von Neumann", "Ada Lovelace"], 1, "Technology"),
  ],
};

// Returns `count` unique random questions from a difficulty tier,
// optionally excluding ids already used this level (avoids repeats across rounds).
export function getRandomQuestions(difficulty, count, excludeIds = []) {
  const pool = (QUESTIONS[difficulty] || []).filter((qn) => !excludeIds.includes(qn.id));
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function getQuestionsForDifficulty(difficulty) {
  return QUESTIONS[difficulty] || [];
}
