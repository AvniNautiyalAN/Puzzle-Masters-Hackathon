// src/components/BattleScreen.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { getRandomQuestions } from "../data/questions";
import { getRandomZombieFromPool } from "../data/zombies";
import { getLevelById } from "../data/levels";
import { getRandomDialogue } from "../data/dialogues";
import { sound } from "../services/soundService";
import BattleCanvas from "./3d/BattleCanvas";
import { useGameFlow } from "../integration/useGameFlow";
import confetti from "canvas-confetti";
import { Volume2, VolumeX, Flame, Zap, Skull, Crosshair } from "lucide-react";

const PLAYER_MAX_HEALTH = 100;
const BASE_ATTACK_DAMAGE = 30;
const POWER_PER_CORRECT = 25;
const ULTIMATE_DAMAGE = 80;

export default function BattleScreen({ levelId = 1, onGameOver, onVictory }) {
  const gameFlow = useGameFlow();

  const effectiveLevelId = gameFlow?.activeLevel?.id || levelId || 1;
  const level = useMemo(() => getLevelById(effectiveLevelId) || getLevelById(1), [effectiveLevelId]);

  const questions = useMemo(() => {
    return getRandomQuestions(level.questionDifficulty, level.rounds);
  }, [level]);

  const [round, setRound] = useState(1);
  const [currentZombie, setCurrentZombie] = useState(() => {
    return getRandomZombieFromPool(level.zombiePool);
  });

  const [playerHealth, setPlayerHealth] = useState(PLAYER_MAX_HEALTH);
  const [zombieHealth, setZombieHealth] = useState(() => currentZombie.health);
  const [zombieMaxHealth, setZombieMaxHealth] = useState(() => currentZombie.health);

  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [power, setPower] = useState(0);

  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [message, setMessage] = useState("Target locked. Answer to strike!");
  const [dialogue, setDialogue] = useState({ speaker: "SURVIVOR", text: "Zombies spotted. Ready weapons!" });

  const [battleState, setBattleState] = useState("ready");
  const [isMuted, setIsMuted] = useState(() => sound.getMuted());
  const [damageEvents, setDamageEvents] = useState([]);

  const currentQuestion = questions[round - 1] || questions[0];

  // Start background ambience on mount
  useEffect(() => {
    sound.startAmbience();
    sound.playZombieGroan(currentZombie.id);
    return () => {
      sound.stopAmbience();
    };
  }, [currentZombie.id]);

  // Damage event helper for 3D world space
  const addDamageEvent = useCallback((text, pos, isCritical = false, isPlayer = false) => {
    const id = Date.now() + Math.random();
    setDamageEvents((prev) => [...prev, { id, text, pos, isCritical, isPlayer }]);
  }, []);

  const removeDamageEvent = useCallback((id) => {
    setDamageEvents((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // Trigger Victory
  const triggerVictory = useCallback(() => {
    setBattleState("victory");
    setMessage("🏆 MISSION ACCOMPLISHED! SECTOR SECURED!");
    sound.playVictoryFanfare();

    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }

    if (gameFlow?.reportLevelVictory) {
      gameFlow.reportLevelVictory(score);
    } else if (onVictory) {
      onVictory(score);
    }
  }, [score, gameFlow, onVictory]);

  // Advance question without spawning new zombie if still alive
  const advanceQuestionOrRound = useCallback(() => {
    const nextRound = round + 1;
    if (nextRound > level.rounds) {
      triggerVictory();
      return;
    }
    setRound(nextRound);
    setAnswered(false);
    setSelectedAnswer(null);
    setBattleState("ready");
    setMessage("Next question ready. Aim true!");
  }, [round, level.rounds, triggerVictory]);

  // Handle Zombie Death & Next Round Spawn
  const handleZombieDefeated = useCallback(() => {
    const nextRound = round + 1;

    if (nextRound > level.rounds) {
      triggerVictory();
      return;
    }

    setRound(nextRound);
    const nextZombie = getRandomZombieFromPool(level.zombiePool);
    setCurrentZombie(nextZombie);
    setZombieHealth(nextZombie.health);
    setZombieMaxHealth(nextZombie.health);
    sound.playZombieGroan(nextZombie.id);

    setAnswered(false);
    setSelectedAnswer(null);
    setBattleState("ready");
    setMessage(`🚨 ROUND ${nextRound}: ${nextZombie.name.toUpperCase()} APPROACHING!`);

    if (nextZombie.isBoss) {
      setDialogue({
        speaker: "THE PROFESSOR",
        text: getRandomDialogue("boss.intro") || "Class is in session, survivor. Let's see your knowledge!",
      });
    } else {
      setDialogue({
        speaker: nextZombie.name.toUpperCase(),
        text: "GRRRRR... FRESH BRAAAAINS!",
      });
    }
  }, [round, level.rounds, level.zombiePool, triggerVictory]);

  // Handle Player Answer
  const handleAnswer = useCallback(
    (answerIndex) => {
      if (answered || battleState !== "ready") return;

      setAnswered(true);
      setSelectedAnswer(answerIndex);

      const isCorrect = answerIndex === currentQuestion.correctAnswer;

      if (isCorrect) {
        sound.playCorrect();
        const newCombo = combo + 1;
        const comboBonus = (newCombo - 1) * 8;
        const damage = BASE_ATTACK_DAMAGE + comboBonus;
        const newZombieHealth = Math.max(0, zombieHealth - damage);

        setCombo(newCombo);
        setScore((prev) => prev + 20 + comboBonus * 2);
        setPower((prev) => Math.min(100, prev + POWER_PER_CORRECT));
        setBattleState("player-attack");

        // Sound & Floating 3D VFX
        setTimeout(() => {
          sound.playGunshot();
          sound.playHitZombie();
          addDamageEvent(
            newCombo >= 3 ? `🔥 COMBO x${newCombo}! -${damage}` : `💥 -${damage} HP`,
            [3.2, 1.8, 0],
            newCombo >= 2,
            false
          );
        }, 150);

        setZombieHealth(newZombieHealth);

        if (currentZombie.isBoss) {
          setDialogue({
            speaker: "THE PROFESSOR",
            text: getRandomDialogue("boss.correct") || "Impossible! How did you solve that?!",
          });
        } else {
          setDialogue({
            speaker: currentZombie.name.toUpperCase(),
            text: getRandomDialogue("correctAnswer") || "ARGHHH! MY BRAIN!",
          });
        }

        if (newZombieHealth <= 0) {
          setMessage(
            newCombo >= 3
              ? `🔥 COMBO x${newCombo}! ${currentZombie.name.toUpperCase()} DESTROYED!`
              : `💥 ${currentZombie.name.toUpperCase()} DEFEATED!`
          );

          setTimeout(() => {
            handleZombieDefeated();
          }, 1400);
        } else {
          setMessage(`⚡ DIRECT HIT! -${damage} HP`);
          setTimeout(() => {
            advanceQuestionOrRound();
          }, 1200);
        }
      } else {
        // Wrong Answer: Zombie attacks survivor
        sound.playWrong();
        const damageTaken = currentZombie.damage || 15;
        const newPlayerHealth = Math.max(0, playerHealth - damageTaken);

        setCombo(0);
        setBattleState("zombie-attack");

        setTimeout(() => {
          sound.playZombieGroan(currentZombie.id);
          sound.playHitPlayer();
          addDamageEvent(`-${damageTaken} HP`, [-3.2, 1.8, 0], false, true);
        }, 250);

        setPlayerHealth(newPlayerHealth);

        if (currentZombie.isBoss) {
          setDialogue({
            speaker: "THE PROFESSOR",
            text: getRandomDialogue("boss.wrong") || "Incorrect! Detention permanently!",
          });
        } else {
          setDialogue({
            speaker: currentZombie.name.toUpperCase(),
            text: getRandomDialogue("wrongAnswer") || "Wrong! Brains aren't the only thing you're losing!",
          });
        }

        if (newPlayerHealth <= 0) {
          setMessage("💀 DEFENSE COMPROMISED! YOU WERE OVERRUN!");
          sound.playGameOver();
          setTimeout(() => {
            setBattleState("game-over");
            if (gameFlow?.reportGameOver) {
              gameFlow.reportGameOver();
            } else if (onGameOver) {
              onGameOver();
            }
          }, 1200);
        } else {
          setMessage(`🧟 ${currentZombie.name.toUpperCase()} ATTACKED! -${damageTaken} HP`);
          setTimeout(() => {
            advanceQuestionOrRound();
          }, 1300);
        }
      }
    },
    [
      answered,
      battleState,
      currentQuestion,
      combo,
      zombieHealth,
      currentZombie,
      playerHealth,
      gameFlow,
      onGameOver,
      addDamageEvent,
      advanceQuestionOrRound,
      handleZombieDefeated,
    ]
  );

  // Ultimate Attack Trigger
  const handleUltimate = useCallback(() => {
    if (power < 100 || answered || battleState !== "ready") return;

    setAnswered(true);
    setBattleState("ultimate");
    sound.playUltimateCharge();

    setTimeout(() => {
      sound.playUltimateBlast();
      const newZombieHealth = Math.max(0, zombieHealth - ULTIMATE_DAMAGE);
      setZombieHealth(newZombieHealth);
      setPower(0);
      setCombo((prev) => prev + 2);
      setScore((prev) => prev + 100);

      addDamageEvent(`☄️ ULTIMATE! -${ULTIMATE_DAMAGE} HP`, [3.2, 2.0, 0], true, false);

      if (newZombieHealth <= 0) {
        setMessage("☄️ OBLITERATION! ZOMBIE VAPORIZED!");
        setTimeout(() => {
          handleZombieDefeated();
        }, 1500);
      } else {
        setMessage(`☄️ MASSIVE DAMAGE! -${ULTIMATE_DAMAGE} HP`);
        setTimeout(() => {
          advanceQuestionOrRound();
        }, 1300);
      }
    }, 600);
  }, [power, answered, battleState, zombieHealth, addDamageEvent, advanceQuestionOrRound, handleZombieDefeated]);

  // Keyboard Shortcuts (1-4, A-D, Space for Ultimate, M for Mute)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (battleState === "ready" && !answered && currentQuestion) {
        const key = e.key.toUpperCase();
        if (key === "1" || key === "A") handleAnswer(0);
        if (key === "2" || key === "B") handleAnswer(1);
        if (key === "3" || key === "C") handleAnswer(2);
        if (key === "4" || key === "D") handleAnswer(3);
      }
      if (e.key === " " && power >= 100 && !answered && battleState === "ready") {
        e.preventDefault();
        handleUltimate();
      }
      if (e.key === "m" || e.key === "M") {
        const muted = sound.toggleMute();
        setIsMuted(muted);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [battleState, answered, currentQuestion, power, handleAnswer, handleUltimate]);

  const toggleAudio = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const restartBattle = () => {
    window.location.reload();
  };

  const playerHealthPct = Math.max(0, (playerHealth / PLAYER_MAX_HEALTH) * 100);
  const zombieHealthPct = Math.max(0, (zombieHealth / zombieMaxHealth) * 100);

  return (
    <main className="battle-screen-3d">
      {/* --- 3D BATTLE VIEWPORT --- */}
      <BattleCanvas
        battleState={battleState}
        zombieType={currentZombie.id}
        isZombieHit={battleState === "player-attack" || battleState === "ultimate"}
        isPlayerHit={battleState === "zombie-attack"}
        isZombieDead={zombieHealth <= 0}
        damageEvents={damageEvents}
        onRemoveDamageEvent={removeDamageEvent}
      />

      {/* --- TOP HUD BAR --- */}
      <header className="hud-header">
        <div className="hud-level-info">
          <span className="hud-badge">LEVEL {level.id} • {level.location.toUpperCase()}</span>
          <h1>{level.name}</h1>
        </div>

        <div className="hud-stats-group">
          {combo > 1 && (
            <div className="hud-combo-badge animate-pulse">
              <Flame size={18} className="text-orange-500" />
              <span>COMBO x{combo}</span>
            </div>
          )}

          <div className="hud-stat-box">
            <span className="label">SCORE</span>
            <span className="value text-amber-400">{score}</span>
          </div>

          <div className="hud-stat-box">
            <span className="label">ROUND</span>
            <span className="value">
              {round}/{level.rounds}
            </span>
          </div>

          <button
            type="button"
            className="hud-audio-btn"
            onClick={toggleAudio}
            title={isMuted ? "Unmute Sound" : "Mute Sound"}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>
      </header>

      {/* --- COMBAT HEALTH BARS OVERLAY --- */}
      <div className="hud-combatants">
        {/* Survivor Card */}
        <div className={`fighter-card player-card ${playerHealth < 30 ? "critical-hp" : ""}`}>
          <div className="fighter-header">
            <div className="avatar-frame">
              <Crosshair size={18} className="text-emerald-400" />
            </div>
            <div>
              <h3>SURVIVOR</h3>
              <p className="status-tag">ACTIVE COMBATANT</p>
            </div>
          </div>

          <div className="hud-bar-container">
            <div className="hud-bar-labels">
              <span>HEALTH</span>
              <strong>{playerHealth} / {PLAYER_MAX_HEALTH}</strong>
            </div>
            <div className="hud-bar-track">
              <div
                className="hud-bar-fill player-fill"
                style={{ width: `${playerHealthPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Dynamic Center Battle Status Banner */}
        <div className="hud-center-banner">
          <div className="versus-pill">VS</div>
          <div className="battle-status-msg">{message}</div>
        </div>

        {/* Zombie / Boss Card */}
        <div className={`fighter-card zombie-card ${currentZombie.isBoss ? "boss-frame" : ""}`}>
          <div className="fighter-header">
            <div>
              <h3 className={currentZombie.isBoss ? "text-purple-400 font-black" : "text-amber-400"}>
                {currentZombie.isBoss ? "👑 " : ""}{currentZombie.name.toUpperCase()}
              </h3>
              <p className="status-tag danger-tag">
                {currentZombie.isBoss ? "SECTOR BOSS" : `${currentZombie.difficulty.toUpperCase()} THREAT`}
              </p>
            </div>
            <div className="avatar-frame zombie-avatar">
              <Skull size={18} className={currentZombie.isBoss ? "text-purple-400" : "text-red-400"} />
            </div>
          </div>

          <div className="hud-bar-container">
            <div className="hud-bar-labels">
              <span>HP</span>
              <strong>{zombieHealth} / {zombieMaxHealth}</strong>
            </div>
            <div className="hud-bar-track">
              <div
                className={`hud-bar-fill ${currentZombie.isBoss ? "boss-fill" : "zombie-fill"}`}
                style={{ width: `${zombieHealthPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* --- SAVAGE DIALOGUE CHAT BAR --- */}
      <div className="hud-dialogue-bar">
        <span className="speaker-tag">{dialogue.speaker}:</span>
        <span className="dialogue-quote">"{dialogue.text}"</span>
      </div>

      {/* --- QUESTION & TACTICAL CONTROL PANEL --- */}
      <footer className="hud-question-panel">
        {/* Power / Ultimate Meter Bar */}
        <div className="ultimate-meter-wrapper">
          <div className="meter-label">
            <span><Zap size={14} className="inline mr-1 text-cyan-400" /> ULTIMATE CHARGE</span>
            <strong>{power}%</strong>
          </div>
          <div className="meter-track">
            <div
              className={`meter-fill ${power >= 100 ? "meter-ready" : ""}`}
              style={{ width: `${power}%` }}
            />
          </div>
        </div>

        {currentQuestion && (
          <div className="question-console">
            <div className="console-meta">
              <span className="subject-pill">{currentQuestion.subject || "TACTICAL"}</span>
              <span className="hint-text">Press keys [A, B, C, D] or [1, 2, 3, 4] to answer</span>
            </div>

            <h2 className="question-title">{currentQuestion.question}</h2>

            <div className="tactical-options-grid">
              {currentQuestion.options.map((option, idx) => {
                const isCorrect = idx === currentQuestion.correctAnswer;
                const isSelected = idx === selectedAnswer;

                let stateClass = "";
                if (answered) {
                  if (isCorrect) stateClass = "correct-choice";
                  else if (isSelected) stateClass = "wrong-choice";
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    className={`tactical-choice-btn ${stateClass}`}
                    disabled={answered || battleState !== "ready"}
                    onClick={() => handleAnswer(idx)}
                  >
                    <span className="choice-key">{String.fromCharCode(65 + idx)}</span>
                    <span className="choice-text">{option}</span>
                  </button>
                );
              })}
            </div>

            <div className="tactical-actions-row">
              <button
                type="button"
                className={`ultimate-strike-btn ${power >= 100 ? "ready-to-fire" : ""}`}
                disabled={power < 100 || answered || battleState !== "ready"}
                onClick={handleUltimate}
              >
                <Zap size={20} className="mr-2" />
                {power >= 100 ? "FIRE ULTIMATE CANNON [SPACE]" : `CHARGING ULTIMATE (${power}%)`}
              </button>
            </div>
          </div>
        )}
      </footer>

      {/* --- STANDALONE VICTORY / GAME OVER MODAL (Fallback if no GameFlowContext) --- */}
      {!gameFlow && (battleState === "victory" || battleState === "game-over") && (
        <div className="result-modal-backdrop">
          <div className="result-modal-card">
            <div className="modal-icon">{battleState === "victory" ? "🏆" : "💀"}</div>
            <h2>{battleState === "victory" ? "VICTORY ACHIEVED" : "MISSION FAILED"}</h2>
            <p>
              {battleState === "victory"
                ? "You survived the apocalypse and secured the sector!"
                : "The undead overran your defenses. Regroup and try again."}
            </p>
            <div className="modal-score">
              FINAL SCORE: <strong>{score}</strong>
            </div>
            <button type="button" className="restart-btn" onClick={restartBattle}>
              RESTART MISSION
            </button>
          </div>
        </div>
      )}
    </main>
  );
}