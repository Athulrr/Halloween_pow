import React, { useState, useEffect, useRef } from 'react';
import './TaskSpinner.css';
import { spookyAudio } from '../utils/spookyAudio';
import { Flame } from 'lucide-react';

const TaskSpinner = ({ 
  allTasks, 
  onPickNextDare,
  onSelectTask, 
  isSpinning, 
  setIsSpinning,
  lastSelectedTask,
  spinTriggerRef
}) => {
  const [spinnerList, setSpinnerList] = useState([]);
  const [currentWinner, setCurrentWinner] = useState(null);
  const containerRef = useRef(null);
  const tickTimerRef = useRef(null);
  const ITEM_HEIGHT = 92; // Height of each task card

  // Initialize spinner list on mount or if empty
  useEffect(() => {
    if (spinnerList.length === 0 && allTasks && allTasks.length > 0) {
      setSpinnerList(allTasks);
    }
  }, [allTasks]);

  const spin = () => {
    if (!allTasks || allTasks.length === 0 || isSpinning) return;

    setIsSpinning(true);
    setCurrentWinner(null);

    // Pick the non-repeating dare from the parent round pool
    const selectedTask = onPickNextDare 
      ? onPickNextDare() 
      : allTasks[Math.floor(Math.random() * allTasks.length)];

    // Create a 45-item list for the spin reel animation
    const spinCount = 45;
    const newSpinnerList = [];

    for (let i = 0; i < spinCount; i++) {
      const randomIndex = Math.floor(Math.random() * allTasks.length);
      newSpinnerList.push(allTasks[randomIndex]);
    }

    // Place the chosen dare at the winning slot (5 slots from the end)
    const winningPosition = spinCount - 5;
    newSpinnerList[winningPosition] = selectedTask;

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

    // Reset container transform instantly to top without transition
    if (containerRef.current) {
      containerRef.current.style.transition = 'none';
      containerRef.current.style.transform = `translateY(0px)`;
      void containerRef.current.offsetHeight; // Force DOM reflow

      // Viewport is 320px high. Middle is 160px.
      const viewportHeight = 320;
      const finalTranslateY = -(winningPosition * ITEM_HEIGHT) + (viewportHeight / 2) - (ITEM_HEIGHT / 2);

      // Smooth spin easing
      containerRef.current.style.transition = 'transform 4.2s cubic-bezier(0.12, 0.88, 0.15, 1)';
      containerRef.current.style.transform = `translateY(${finalTranslateY}px)`;
    }

    // On completion, set winner and notify parent without resetting the list/transform
    setTimeout(() => {
      setCurrentWinner(selectedTask);
      if (onSelectTask) {
        onSelectTask(selectedTask);
      }
      setIsSpinning(false);
    }, 4400);
  };

  // Expose spin method to parent (e.g. for "Spin Both")
  useEffect(() => {
    if (spinTriggerRef) {
      spinTriggerRef.current = spin;
    }
  });

  return (
    <div className="task-spinner-wrapper glass-panel">
      <div className="task-spinner-header">
        <div className="header-title-group">
          <span className="header-icon">🧪</span>
          <div>
            <h3>Halloween Dares</h3>
            <span className="sub-caption">Spooky Challenges</span>
          </div>
        </div>
        {/* Count badge removed as requested */}
      </div>

      <div className="task-viewport">
        {/* Glow indicator line with eerie slime green border */}
        <div className="task-selector-line">
          <span className="selector-arrow left">▶</span>
          <span className="selector-arrow right">◀</span>
        </div>

        <div className="task-container" ref={containerRef}>
          {spinnerList.map((task, index) => {
            const isWinnerHighlight = currentWinner && currentWinner.id === task.id && !isSpinning;
            return (
              <div 
                key={index} 
                className={`task-item ${isWinnerHighlight ? 'winner-highlight' : ''}`}
                style={{ height: `${ITEM_HEIGHT}px` }}
              >
                <div className="task-icon-box">{task.icon}</div>
                <div className="task-info">
                  <span className="task-title">{task.title}</span>
                  <span className="task-desc">{task.description}</span>
                </div>
              </div>
            );
          })}
          {spinnerList.length === 0 && (
            <div className="task-item empty" style={{ height: `${ITEM_HEIGHT}px` }}>
              No tasks left!
            </div>
          )}
        </div>
      </div>



      {lastSelectedTask && !isSpinning && (
        <div className="last-task-banner">
          <span className="banner-tag">ACTIVE DARE:</span>
          <div className="banner-content">
            <span className="banner-icon">{lastSelectedTask.icon}</span>
            <strong>{lastSelectedTask.title}</strong>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskSpinner;
