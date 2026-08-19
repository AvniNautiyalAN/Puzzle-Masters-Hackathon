import { useState } from "react";
import { useGameFlow } from "../../integration/useGameFlow";
import { CHARACTERS } from "../../data/characters";
import { sound } from "../../services/soundService";
import { UserCheck, Shield, Zap, Crosshair, ArrowRight, ArrowLeft } from "lucide-react";
import survivorImg from "../../assets/characters/survivor.png";

export default function CharacterSelectScreen() {
  const { chooseCharacter, progress, finishIntroStory } = useGameFlow();
  const [selectedId, setSelectedId] = useState(() => progress.selectedCharacterId || CHARACTERS[0].id);

  const selectedHero = CHARACTERS.find((c) => c.id === selectedId) || CHARACTERS[0];

  const handleSelect = (id) => {
    setSelectedId(id);
    sound.playGunshot();
  };

  const handleDeploy = () => {
    sound.playGunshot();
    chooseCharacter(selectedId);
  };

  return (
    <div className="character-select-container">
      <header className="screen-header">
        <button type="button" className="back-nav-btn" onClick={finishIntroStory}>
          <ArrowLeft size={20} className="mr-2" /> RETURN
        </button>
        <h2>TACTICAL ROSTER • SELECT OPERATIVE</h2>
      </header>

      <div className="roster-grid">
        {/* Character Card List */}
        <div className="characters-column">
          {CHARACTERS.map((char) => {
            const isSelected = char.id === selectedId;
            return (
              <div
                key={char.id}
                className={`character-card-option ${isSelected ? "selected-card" : ""}`}
                onClick={() => handleSelect(char.id)}
              >
                <div className="char-badge">{char.gender.toUpperCase()}</div>
                <div className="char-info">
                  <h3>{char.name}</h3>
                  <p className="tagline">"{char.tagline}"</p>
                </div>
                <div className="select-radio">
                  {isSelected && <UserCheck size={22} className="text-amber-400" />}
                </div>
              </div>
            );
          })}

          <div className="operative-stats-panel">
            <h4>OPERATIVE ATTRIBUTES</h4>
            <div className="stat-row">
              <span><Crosshair size={16} className="inline mr-2 text-cyan-400" /> TACTICAL ACCURACY</span>
              <div className="stat-meter"><div className="stat-fill" style={{ width: "95%" }} /></div>
            </div>
            <div className="stat-row">
              <span><Zap size={16} className="inline mr-2 text-amber-400" /> ULTIMATE OVERCHARGE</span>
              <div className="stat-meter"><div className="stat-fill" style={{ width: "88%" }} /></div>
            </div>
            <div className="stat-row">
              <span><Shield size={16} className="inline mr-2 text-emerald-400" /> SURVIVAL FORTITUDE</span>
              <div className="stat-meter"><div className="stat-fill" style={{ width: "90%" }} /></div>
            </div>
          </div>
        </div>

        {/* Big Preview & Deploy Action */}
        <div className="character-preview-panel">
          <div className="preview-frame">
            <img src={survivorImg} alt={selectedHero.name} className="character-large-render" />
            <div className="preview-overlay-info">
              <h3>{selectedHero.name.toUpperCase()}</h3>
              <p>{selectedHero.tagline}</p>
            </div>
          </div>

          <button type="button" className="deploy-btn" onClick={handleDeploy}>
            CONFIRM & DEPLOY OPERATIVE <ArrowRight size={22} className="ml-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
