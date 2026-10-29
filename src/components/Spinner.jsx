import React, { useState, useEffect, useRef } from 'react';
import './Spinner.css';
import { spookyAudio } from '../utils/spookyAudio';
import { Skull } from 'lucide-react';

const Spinner = ({ 
  availableNames, 
  onSelectWinner, 
  isSpinning, 
  setIsSpinning,
  lastWinner,
  spinTriggerRef
}) => {
  const [spinnerList, setSpinnerList] = useState([]);
  const [winner, setWinner] = useState(null);
  const containerRef = useRef(null);
  const tickTimerRef = useRef(null);
  const ITEM_HEIGHT = 80; // Height of each name item

  // Initialize spinner list on mount or if empty
  useEffect(() => {
    if (spinnerList.length === 0 && availableNames && availableNames.length > 0) {
      setSpinnerList(availableNames);
    }
  }, [availableNames]);

  const spin = () => {
    if (!availableNames || availableNames.length === 0 || isSpinning) return;

    setIsSpinning(true);
    setWinner(null);

    // Pick a winner from available names
    const winnerIndex = Math.floor(Math.random() * availableNames.length);
    const selectedWinner = availableNames[winnerIndex];

    // Create a 45-item list for the reel animation
    const spinCount = 45;
    const newSpinnerList = [];
    
    for (let i = 0; i < spinCount; i++) {
      const randomIndex = Math.floor(Math.random() * availableNames.length);
      newSpinnerList.push(availableNames[randomIndex]);
    }
    
    // Set the winner near the end
    const winningPosition = spinCount - 5;
    newSpinnerList[winningPosition] = selectedWinner;

    setSpinnerList(newSpinnerList);

    // Decelerating mechanical tick audio effect
    if (tickTimerRef.current) clearTimeout(tickTimerRef.current);
    let delay = 65;
    let ticks = 0;
    const runTicks = () => {
      spookyAudio.playTick();
      ticks++;
      if (ticks < 20) {
        delay += 9;
      } else if (ticks < 32) {
        delay += 28;
      } else {
        delay += 65;
      }
      if (ticks < 38) {
        tickTimerRef.current = setTimeout(runTicks, delay);
      }
    };
    runTicks();

    // Reset translation to top instantly without transition
    if (containerRef.current) {
      containerRef.current.style.transition = 'none';
      containerRef.current.style.transform = `translateY(0px)`;
      void containerRef.current.offsetHeight; // Force reflow

      // Viewport is 320px high (4 items). Middle is 160px.
      const viewportHeight = 320;
      const finalTranslateY = -(winningPosition * ITEM_HEIGHT) + (viewportHeight / 2) - (ITEM_HEIGHT / 2);

      containerRef.current.style.transition = 'transform 4.2s cubic-bezier(0.12, 0.88, 0.15, 1)';
      containerRef.current.style.transform = `translateY(${finalTranslateY}px)`;
    }

    // Wait for animation to finish, keep winner centered and notify parent
    setTimeout(() => {
      setWinner(selectedWinner);
      onSelectWinner(selectedWinner);
      setIsSpinning(false);
    }, 4400);
  };

  // Allow external triggering via ref
  useEffect(() => {
    if (spinTriggerRef) {
      spinTriggerRef.current = spin;
    }
  });

  return (
    <div className="spinner-wrapper glass-panel">
      <div className="spinner-header">
        <div className="header-title-group">
          <span className="header-icon">🎃</span>
          <div>
            <h2>Who's Next?</h2>
            <span className="sub-caption-orange">Victim Selection</span>
          </div>
        </div>
        {/* Count badge removed as requested */}
      </div>
      
      <div className="spinner-viewport">
        <div className="spinner-selector-line">
          <span className="selector-arrow left">▶</span>
          <span className="selector-arrow right">◀</span>
        </div>
        
        <div className="spinner-container" ref={containerRef}>
          {spinnerList.map((name, index) => (
            <div 
              key={index} 
              className={`spinner-item ${winner === name && !isSpinning ? 'winner-highlight' : ''}`}
              style={{ height: `${ITEM_HEIGHT}px` }}
            >
              <span className="spinner-item-name">{name}</span>
            </div>
          ))}
          {spinnerList.length === 0 && (
            <div className="spinner-item empty" style={{ height: `${ITEM_HEIGHT}px` }}>
              No more souls!
            </div>
          )}
        </div>
      </div>



      {lastWinner && !isSpinning && (
        <div className="last-winner-banner">
          <span className="banner-tag">CHOSEN SOUL:</span>
          <div className="banner-content">
            <span className="banner-icon">💀</span>
            <strong>{lastWinner}</strong>
          </div>
        </div>
      )}
    </div>
  );
};

export default Spinner;
