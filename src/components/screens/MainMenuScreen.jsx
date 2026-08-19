import { useState } from "react";
import { useGameFlow } from "../../integration/useGameFlow";
import { resetProgress } from "../../services/storageService";
import { sound } from "../../services/soundService";
import { Play, UserCheck, RefreshCw, Volume2, VolumeX, ShieldAlert } from "lucide-react";
import survivorImg from "../../assets/characters/survivor.png";

export default function MainMenuScreen() {
  const { chooseCharacter, selectLevel, progress } = useGameFlow();
  const [isMuted, setIsMuted] = useState(() => sound.getMuted());

  const handleStartGame = () => {
    sound.playGunshot();
    // If character selected, go to level map; otherwise go to character select
    if (progress.selectedCharacterId) {
      selectLevel(progress.lastPlayedLevel || 1);
    } else {
      chooseCharacter("hero_girl");
    }
  };

  const handleReset = () => {
    if (window.confirm("Reset all campaign progress and scores?")) {
      resetProgress();
      window.location.reload();
    }
  };

  const toggleAudio = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="main-menu-container">
      {/* Dark apocalyptic overlay */}
      <div className="menu-backdrop-glow" />

      {/* Top Bar */}
      <header className="menu-header">
        <div className="protocol-tag">
          <ShieldAlert size={16} className="text-amber-500 mr-2 inline" />
          BIO-HAZARD PROTOCOL ACTIVE
        </div>
        <button type="button" className="audio-toggle-btn" onClick={toggleAudio}>
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      </header>

      {/* Hero Showcase Content */}
      <div className="menu-content-grid">
        {/* Left Branding & Actions */}
        <div className="menu-brand-card">
          <div className="game-badge">3D TACTICAL TRIVIA SURVIVAL</div>
          <h1 className="game-title">
            PUZZLE MASTERS
            <span className="subtitle-glow">DEAD HORIZON</span>
          </h1>
          <p className="game-tagline">
            The city has fallen to the infected. Only your intellect, reflexes, and tactical knowledge stand between humanity and total extinction.
          </p>

          <div className="menu-actions-stack">
            <button type="button" className="menu-btn primary-action-btn" onClick={handleStartGame}>
              <Play size={22} className="mr-3" />
              DEPLOY TO CAMPAIGN
            </button>

            <button
              type="button"
              className="menu-btn secondary-action-btn"
              onClick={() => chooseCharacter("hero_girl")}
            >
              <UserCheck size={20} className="mr-3 text-cyan-400" />
              OPERATIVE ROSTER
            </button>

            <button
              type="button"
              className="menu-btn tertiary-action-btn"
              onClick={handleReset}
            >
              <RefreshCw size={18} className="mr-3 text-red-400" />
              RESET SYSTEM SAVE
            </button>
          </div>

          <div className="save-status-info">
            <span>SECTORS SECURED: <strong>{progress.completedLevels?.length || 0} / 5</strong></span>
            <span>HIGHEST CLEAR: <strong>LEVEL {Math.max(...(progress.unlockedLevels || [1]))}</strong></span>
          </div>
        </div>

        {/* Right Hero Cinematic Card */}
        <div className="menu-hero-showcase">
          <div className="hero-portrait-frame">
            <img src={survivorImg} alt="Survivor Operative" className="hero-menu-render" />
            <div className="hero-spec-tag">
              <span className="spec-name">OPERATIVE STATUS: ARMED</span>
              <span className="spec-weapon">RIFLE / ULTIMATE CANNON</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
