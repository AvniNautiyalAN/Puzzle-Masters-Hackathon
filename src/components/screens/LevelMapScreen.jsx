import { useGameFlow } from "../../integration/useGameFlow";
import { LEVELS } from "../../data/levels";
import { sound } from "../../services/soundService";
import { MapPin, Lock, CheckCircle2, Star, Play, Skull, ArrowLeft } from "lucide-react";

export default function LevelMapScreen() {
  const { selectLevel, progress, finishIntroStory } = useGameFlow();

  const handleSelectLevel = (levelId, isUnlocked) => {
    if (!isUnlocked) return;
    sound.playGunshot();
    selectLevel(levelId);
  };

  const unlockedLevels = progress.unlockedLevels || [1];
  const completedLevels = progress.completedLevels || [];
  const highScores = progress.highScores || {};

  return (
    <div className="level-map-container">
      <header className="screen-header">
        <button type="button" className="back-nav-btn" onClick={finishIntroStory}>
          <ArrowLeft size={20} className="mr-2" /> MAIN BASE
        </button>
        <div>
          <h2>TACTICAL SECTOR MAP</h2>
          <p className="subtitle">SELECT AN ACTIVE INFESTATION ZONE TO COMMENCE CLEARANCE</p>
        </div>
      </header>

      <div className="sectors-grid">
        {LEVELS.map((lvl) => {
          const isUnlocked = unlockedLevels.includes(lvl.id);
          const isCompleted = completedLevels.includes(lvl.id);
          const bestScore = highScores[lvl.id] || 0;

          return (
            <div
              key={lvl.id}
              className={`sector-card ${isUnlocked ? "unlocked" : "locked"} ${lvl.isBossLevel ? "boss-sector" : ""}`}
              onClick={() => handleSelectLevel(lvl.id, isUnlocked)}
            >
              <div className="sector-header-bar">
                <span className="sector-id">SECTOR 0{lvl.id}</span>
                <span className={`diff-badge ${lvl.questionDifficulty}`}>
                  {lvl.questionDifficulty.toUpperCase()}
                </span>
              </div>

              <div className="sector-main">
                <div className="sector-icon-wrap">
                  {lvl.isBossLevel ? (
                    <Skull size={32} className="text-purple-400 animate-pulse" />
                  ) : isCompleted ? (
                    <CheckCircle2 size={32} className="text-emerald-400" />
                  ) : isUnlocked ? (
                    <MapPin size={32} className="text-amber-400" />
                  ) : (
                    <Lock size={32} className="text-zinc-600" />
                  )}
                </div>

                <div className="sector-details">
                  <h3>{lvl.name}</h3>
                  <p className="location-name">{lvl.location}</p>
                </div>
              </div>

              <div className="sector-footer-stats">
                <div className="rounds-tag">{lvl.rounds} COMBAT WAVES</div>
                {bestScore > 0 && (
                  <div className="score-tag">
                    <Star size={14} className="inline mr-1 text-amber-400" /> BEST: {bestScore}
                  </div>
                )}
              </div>

              {isUnlocked && (
                <button type="button" className="enter-sector-btn">
                  <Play size={16} className="mr-2" /> ENGAGE
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
