import { useEffect, useMemo, useState } from "react";
import { getRandomQuestions } from "../data/questions";
import { getRandomZombieFromPool } from "../data/zombies";
import { getLevelById } from "../data/levels";
import survivorImage from "../assets/characters/survivor.png";

const PLAYER_MAX_HEALTH = 100;
const BASE_ATTACK_DAMAGE = 25;
const POWER_PER_CORRECT = 20;
const ULTIMATE_DAMAGE = 60;

function createBattle(levelId = 1) {
  const level = getLevelById(levelId);

  const questions = getRandomQuestions(
    level.questionDifficulty,
    level.rounds
  );

  const zombie = getRandomZombieFromPool(level.zombiePool);

  return {
    level,
    questions,
    zombie,
  };
}

export default function BattleScreen({ levelId = 1 }) {
  const battle = useMemo(() => createBattle(levelId), [levelId]);

  const [round, setRound] = useState(1);
  const [playerHealth, setPlayerHealth] = useState(PLAYER_MAX_HEALTH);
  const [zombieHealth, setZombieHealth] = useState(battle.zombie.health);

  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [power, setPower] = useState(0);

  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [message, setMessage] = useState("Choose your answer!");

  const [battleState, setBattleState] = useState("ready");
  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState(false);

  const currentQuestion = battle.questions[round - 1];

  // Safety check if a level has fewer questions than rounds.
  useEffect(() => {
    if (!currentQuestion && !victory && !gameOver) {
      setVictory(true);
      setBattleState("victory");
    }
  }, [currentQuestion, victory, gameOver]);

  function handleAnswer(answerIndex) {
    if (answered || gameOver || victory) return;

    setAnswered(true);
    setSelectedAnswer(answerIndex);

    const isCorrect = answerIndex === currentQuestion.correctAnswer;

    if (isCorrect) {
      const newCombo = combo + 1;

      const comboBonus = Math.max(0, (newCombo - 1) * 5);
      const damage = BASE_ATTACK_DAMAGE + comboBonus;

      const newZombieHealth = Math.max(0, zombieHealth - damage);

      setZombieHealth(newZombieHealth);
      setCombo(newCombo);
      setScore((prev) => prev + 10 + comboBonus);
      setPower((prev) => Math.min(100, prev + POWER_PER_CORRECT));

      setBattleState("player-attack");

      if (newZombieHealth <= 0) {
        setMessage(
          newCombo >= 3
            ? `🔥 COMBO x${newCombo}! ZOMBIE DESTROYED!`
            : "💥 ZOMBIE DEFEATED!"
        );

        setTimeout(() => {
          finishRound();
        }, 1200);
      } else {
        setMessage(
          newCombo >= 3
            ? `🔥 COMBO x${newCombo}! -${damage} HP`
            : `⚡ HIT! -${damage} HP`
        );

        setTimeout(() => {
          startNextRound();
        }, 1000);
      }
    } else {
      const damageTaken = battle.zombie.damage;

      const newPlayerHealth = Math.max(
        0,
        playerHealth - damageTaken
      );

      setPlayerHealth(newPlayerHealth);
      setCombo(0);
      setBattleState("zombie-attack");

      if (newPlayerHealth <= 0) {
        setMessage("💀 YOU WERE OVERRUN!");
        setGameOver(true);
        setBattleState("game-over");
      } else {
        setMessage(`🧟 ${battle.zombie.name} ATTACKS! -${damageTaken} HP`);

        setTimeout(() => {
          startNextRound();
        }, 1200);
      }
    }
  }

  function useUltimate() {
    if (power < 100 || answered || gameOver || victory) return;

    setAnswered(true);

    const newZombieHealth = Math.max(
      0,
      zombieHealth - ULTIMATE_DAMAGE
    );

    setZombieHealth(newZombieHealth);
    setPower(0);
    setScore((prev) => prev + 50);
    setCombo((prev) => prev + 1);
    setBattleState("ultimate");

    if (newZombieHealth <= 0) {
      setMessage("☄️ ULTIMATE ATTACK! ZOMBIE DESTROYED!");

      setTimeout(() => {
        finishRound();
      }, 1400);
    } else {
      setMessage(`☄️ ULTIMATE! -${ULTIMATE_DAMAGE} HP`);

      setTimeout(() => {
        startNextRound();
      }, 1200);
    }
  }

  function startNextRound() {
    const nextRound = round + 1;

    if (nextRound > battle.level.rounds) {
      setVictory(true);
      setBattleState("victory");
      setMessage("🏆 LEVEL COMPLETE!");
      return;
    }

    setRound(nextRound);
    setAnswered(false);
    setSelectedAnswer(null);
    setBattleState("ready");
    setMessage("Choose your answer!");
  }

  function finishRound() {
    const nextRound = round + 1;

    if (nextRound > battle.level.rounds) {
      setVictory(true);
      setBattleState("victory");
      setMessage("🏆 LEVEL COMPLETE!");
      return;
    }

    setRound(nextRound);

    const nextZombie = getRandomZombieFromPool(battle.level.zombiePool);

    setZombieHealth(nextZombie.health);

    // We keep the current zombie data simple for now.
    // The next step will make zombie data change properly per round.
    setAnswered(false);
    setSelectedAnswer(null);
    setBattleState("ready");
    setMessage("A NEW ZOMBIE APPROACHES...");
  }

  function restartBattle() {
    window.location.reload();
  }

  const healthPercent = Math.max(
    0,
    (playerHealth / PLAYER_MAX_HEALTH) * 100
  );

  const zombieHealthPercent = Math.max(
    0,
    (zombieHealth / battle.zombie.health) * 100
  );

  return (
    <main className="battle-screen">
      <header className="battle-header">
        <div>
          <p className="eyebrow">SURVIVOR PROTOCOL</p>
          <h1>{battle.level.name}</h1>
        </div>

        <div className="score-box">
          <span>SCORE</span>
          <strong>{score}</strong>
        </div>
      </header>

      <section className="battle-arena">
        <div className="arena-background">
          <div className="smoke smoke-one"></div>
          <div className="smoke smoke-two"></div>
          <div className="fire fire-one">🔥</div>
          <div className="fire fire-two">🔥</div>
        </div>

        <div className="combatants">
          <div className="fighter player">
            <img
  src={survivorImage}
  alt="Survivor"
  className="character-image"
/>
            <h2>SURVIVOR</h2>

            <div className="health-container">
              <div className="health-label">
                <span>HP</span>
                <span>
                  {playerHealth}/{PLAYER_MAX_HEALTH}
                </span>
              </div>

              <div className="health-bar">
                <div
                  className="health-fill player-health"
                  style={{ width: `${healthPercent}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="versus">
            <span>VS</span>
          </div>

          <div className="fighter zombie">
            <div className="character-emoji zombie-emoji">🧟</div>
            <h2>{battle.zombie.name.toUpperCase()}</h2>

            <div className="health-container">
              <div className="health-label">
                <span>HP</span>
                <span>
                  {zombieHealth}/{battle.zombie.health}
                </span>
              </div>

              <div className="health-bar">
                <div
                  className="health-fill zombie-health"
                  style={{ width: `${zombieHealthPercent}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="battle-message">
          {message}
        </div>
      </section>

      <section className="battle-panel">
        <div className="round-info">
          <span>
            ROUND {round}/{battle.level.rounds}
          </span>

          <span>COMBO x{combo}</span>

          <span>POWER {power}%</span>
        </div>

        <div className="power-bar">
          <div
            className="power-fill"
            style={{ width: `${power}%` }}
          ></div>
        </div>

        <div className="question-card">
          {currentQuestion ? (
            <>
              <p className="subject">
                {currentQuestion.subject}
              </p>

              <h2>{currentQuestion.question}</h2>

              <div className="answer-grid">
                {currentQuestion.options.map((option, index) => {
                  const isCorrect =
                    index === currentQuestion.correctAnswer;

                  const isSelected =
                    index === selectedAnswer;

                  let className = "answer-button";

                  if (answered && isCorrect) {
                    className += " correct";
                  }

                  if (answered && isSelected && !isCorrect) {
                    className += " wrong";
                  }

                  return (
                    <button
                      key={option}
                      type="button"
                      className={className}
                      disabled={answered}
                      onClick={() => handleAnswer(index)}
                    >
                      <span className="answer-number">
                        {String.fromCharCode(65 + index)}
                      </span>

                      {option}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                className="ultimate-button"
                disabled={power < 100 || answered}
                onClick={useUltimate}
              >
                ☄️ ULTIMATE ATTACK
              </button>
            </>
          ) : (
            <h2>Preparing the next challenge...</h2>
          )}
        </div>
      </section>

      {(gameOver || victory) && (
        <div className="result-overlay">
          <div className="result-card">
            <div className="result-icon">
              {victory ? "🏆" : "💀"}
            </div>

            <h2>
              {victory ? "LEVEL COMPLETE" : "GAME OVER"}
            </h2>

            <p>
              {victory
                ? "The city survives another day."
                : "The zombies have overrun your position."}
            </p>

            <div className="final-score">
              SCORE <strong>{score}</strong>
            </div>

            <button
              type="button"
              onClick={restartBattle}
              className="restart-button"
            >
              PLAY AGAIN
            </button>
          </div>
        </div>
      )}
    </main>
  );
}