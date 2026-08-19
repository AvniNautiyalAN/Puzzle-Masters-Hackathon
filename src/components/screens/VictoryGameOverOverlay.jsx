import { useGameFlow } from "../../integration/useGameFlow";
import { sound } from "../../services/soundService";
import { Trophy, Skull, RotateCcw, ArrowRight, MapPin, Star } from "lucide-react";

export default function VictoryGameOverOverlay({ isVictory = false }) {
  const {
    activeLevel,
    lastRunScore,
    retryLevel,
    backToLevelMap,
    selectLevel,
    isFinalLevel,
  } = useGameFlow();

  const handleNextLevel = () => {
    sound.playGunshot();
    if (activeLevel) {
      selectLevel(activeLevel.id + 1);
    }
  };

  const handleRetry = () => {
    sound.playGunshot();
    retryLevel();
  };

  const handleMap = () => {
    backToLevelMap();
  };

  return (
    <div className="debrief-overlay-backdrop">
      <div className={`debrief-card ${isVictory ? "victory-theme" : "defeat-theme"}`}>
        <div className="debrief-icon-wrap">
          {isVictory ? (
            <Trophy size={64} className="text-amber-400 animate-bounce" />
          ) : (
            <Skull size={64} className="text-red-500 animate-pulse" />
          )}
        </div>

        <h2 className="debrief-title">
          {isVictory
            ? isFinalLevel
              ? "ALL SECTORS SECURED • HUMANITY SAVED!"
              : "SECTOR CLEARANCE COMPLETE!"
            : "MISSION FAILED • DEFENSE OVERRUN"}
        </h2>

        <p className="debrief-desc">
          {isVictory
            ? `Outstanding combat performance in ${activeLevel?.name || "the sector"}. Sector secured from the undead threat.`
            : "The infected breached your position. Regroup, restock ammunition, and re-engage."}
        </p>

        {isVictory && (
          <div className="star-rating-row">
            <Star size={28} className="text-amber-400 fill-amber-400" />
            <Star size={34} className="text-amber-400 fill-amber-400" />
            <Star size={28} className="text-amber-400 fill-amber-400" />
          </div>
        )}

        <div className="score-debrief-box">
          <span className="score-label">COMBAT SCORE</span>
          <span className="score-val">{lastRunScore || 0}</span>
        </div>

        <div className="debrief-actions-grid">
          {isVictory && !isFinalLevel && (
            <button type="button" className="debrief-btn next-level-btn" onClick={handleNextLevel}>
              NEXT SECTOR <ArrowRight size={20} className="ml-2" />
            </button>
          )}

          <button type="button" className="debrief-btn retry-btn" onClick={handleRetry}>
            <RotateCcw size={18} className="mr-2" /> {isVictory ? "REPLAY SECTOR" : "RETRY MISSION"}
          </button>

          <button type="button" className="debrief-btn map-btn" onClick={handleMap}>
            <MapPin size={18} className="mr-2" /> TACTICAL MAP
          </button>
        </div>
      </div>
    </div>
  );
}
