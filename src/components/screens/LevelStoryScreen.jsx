import { useGameFlow } from "../../integration/useGameFlow";
import { sound } from "../../services/soundService";
import { Play, ShieldAlert, ArrowLeft } from "lucide-react";

export default function LevelStoryScreen() {
  const { activeLevel, startGameplay, backToLevelMap } = useGameFlow();

  if (!activeLevel) {
    return null;
  }

  const handleStart = () => {
    sound.playGunshot();
    startGameplay();
  };

  const storyItems = activeLevel.storyIntro?.media || [
    { caption: "Surveillance reports heavy undead activity in this sector." },
    { caption: "Prepare tactical weapons and proceed with caution." },
  ];

  return (
    <div className="level-story-container">
      <div className="briefing-card">
        <header className="briefing-header">
          <button type="button" className="back-nav-btn" onClick={backToLevelMap}>
            <ArrowLeft size={20} className="mr-2" /> SECTORS
          </button>
          <div className="mission-tag">MISSION BRIEFING • SECTOR 0{activeLevel.id}</div>
        </header>

        <div className="briefing-body">
          <div className="location-banner">
            <h2>{activeLevel.name.toUpperCase()}</h2>
            <p className="coords">LOCATION: {activeLevel.location.toUpperCase()} // STATUS: COMPROMISED</p>
          </div>

          <div className="intel-section">
            <h3><ShieldAlert size={18} className="inline mr-2 text-amber-400" /> TACTICAL RECONNAISSANCE</h3>
            <div className="story-logs-list">
              {storyItems.map((item, idx) => (
                <div key={idx} className="intel-log-item">
                  <span className="log-index">LOG_0{idx + 1}</span>
                  <p>{item.caption}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="threat-summary-row">
            <div className="threat-box">
              <span className="threat-label">COMBAT WAVES</span>
              <strong>{activeLevel.rounds} ROUNDS</strong>
            </div>
            <div className="threat-box">
              <span className="threat-label">THREAT POOL</span>
              <strong className="text-amber-400">{activeLevel.zombiePool.join(" • ").toUpperCase()}</strong>
            </div>
            <div className="threat-box">
              <span className="threat-label">DIFFICULTY</span>
              <strong className="text-red-400">{activeLevel.questionDifficulty.toUpperCase()}</strong>
            </div>
          </div>

          <button type="button" className="commence-mission-btn" onClick={handleStart}>
            <Play size={22} className="mr-3" /> COMMENCE 3D ENGAGEMENT
          </button>
        </div>
      </div>
    </div>
  );
}
