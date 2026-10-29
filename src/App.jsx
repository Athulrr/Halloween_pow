import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { PREFILLED_NAMES, HALLOWEEN_TASKS } from './constants';
import Spinner from './components/Spinner';
import TaskSpinner from './components/TaskSpinner';
import SelectedList from './components/SelectedList';
import YouTubeBackgroundAudio from './components/YouTubeBackgroundAudio';
import { spookyAudio } from './utils/spookyAudio';
import {
  Volume2,
  VolumeX,
  Zap,
  RotateCcw,
  Ghost,
  Flame,
  CheckCircle2,
  X
} from 'lucide-react';
import './App.css';

function App() {
  const [availableNames, setAvailableNames] = useState(PREFILLED_NAMES);
  const [tasks] = useState(HALLOWEEN_TASKS);
  const [selectedNames, setSelectedNames] = useState([]); // Array of { id, name, task }

  const [isNameSpinning, setIsNameSpinning] = useState(false);
  const [isTaskSpinning, setIsTaskSpinning] = useState(false);

  const [lastWinnerName, setLastWinnerName] = useState(null);
  const [lastSelectedTask, setLastSelectedTask] = useState(null);

  // Big celebration modal for synchronized reveal
  const [celebration, setCelebration] = useState(null); // { name, task }

  const [isMuted, setIsMuted] = useState(spookyAudio.isMuted);

  const nameSpinRef = useRef(null);
  const taskSpinRef = useRef(null);
  const pendingDoubleSpin = useRef(false);
  const currentPairRef = useRef({ name: null, task: null });

  // NON-REPEATING DARE ROUND TRACKER
  // Holds remaining unused dares in the current 15-dare round
  const remainingDaresRef = useRef([...HALLOWEEN_TASKS]);

  const pickNextNonRepeatingDare = () => {
    let pool = [...remainingDaresRef.current];
    // If all 15 dares were used, refill for a new round!
    if (pool.length === 0) {
      pool = [...tasks];
    }

    const randomIndex = Math.floor(Math.random() * pool.length);
    const chosenDare = pool[randomIndex];

    // Remove from remaining pool
    const nextPool = pool.filter(d => d.id !== chosenDare.id);
    remainingDaresRef.current = nextPool;

    return chosenDare;
  };

  // Toggle Sound
  const handleToggleSound = () => {
    const muted = spookyAudio.toggleMute();
    setIsMuted(muted);
  };

  // Trigger Halloween-themed Confetti
  const triggerHalloweenConfetti = () => {
    const duration = 3200;
    const end = Date.now() + duration;
    const halloweenColors = ['#ff7518', '#00ff88', '#a855f7', '#facc15', '#ffffff'];

    const frame = () => {
      confetti({
        particleCount: 6,
        angle: 60,
        spread: 60,
        origin: { x: 0, y: 0.7 },
        colors: halloweenColors
      });
      confetti({
        particleCount: 6,
        angle: 120,
        spread: 60,
        origin: { x: 1, y: 0.7 },
        colors: halloweenColors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  // Callback when Name Spinner picks a victim
  const handleSelectWinnerName = (winner) => {
    setLastWinnerName(winner);
    setAvailableNames(prev => prev.filter(name => name !== winner));

    if (pendingDoubleSpin.current) {
      currentPairRef.current.name = winner;
      checkPairReady();
    }
  };

  // Callback when Task Spinner picks a dare
  const handleSelectTask = (task) => {
    setLastSelectedTask(task);

    if (pendingDoubleSpin.current) {
      currentPairRef.current.task = task;
      checkPairReady();
    }
  };

  // Coordinate Double Spin finish
  const checkPairReady = () => {
    if (currentPairRef.current.name && currentPairRef.current.task) {
      const { name, task } = currentPairRef.current;
      pendingDoubleSpin.current = false;
      currentPairRef.current = { name: null, task: null };

      setSelectedNames(prev => [
        {
          id: Date.now().toString() + Math.random().toString(),
          name,
          task
        },
        ...prev
      ]);

      spookyAudio.playWinnerFanfare();
      triggerHalloweenConfetti();
      setCelebration({ name, task });
    }
  };

  // SPIN THE WHEEL!
  const spinBoth = () => {
    if (isNameSpinning || isTaskSpinning || availableNames.length === 0 || tasks.length === 0) return;
    pendingDoubleSpin.current = true;
    currentPairRef.current = { name: null, task: null };
    setCelebration(null);

    spookyAudio.playSpinStart();

    if (nameSpinRef.current) {
      nameSpinRef.current();
    }
    if (taskSpinRef.current) {
      taskSpinRef.current();
    }
  };

  // Re-roll dare for a specific player in the Crypt using the non-repeating dare pool
  const handleRerollTaskForPlayer = (playerId) => {
    const nextDare = pickNextNonRepeatingDare();
    setSelectedNames(prev => prev.map(p => {
      if (p.id === playerId) {
        return { ...p, task: nextDare };
      }
      return p;
    }));
    spookyAudio.playTick();
  };

  // Remove a player from the Crypt
  const handleRemovePlayer = (id) => {
    setSelectedNames(prev => prev.filter(player => player.id !== id));
  };

  const resetAll = () => {
    if (isNameSpinning || isTaskSpinning) return;
    setAvailableNames(PREFILLED_NAMES);
    remainingDaresRef.current = [...tasks];
    setSelectedNames([]);
    setLastWinnerName(null);
    setLastSelectedTask(null);
    setCelebration(null);
  };

  const isAnySpinning = isNameSpinning || isTaskSpinning;

  return (
    <div className="app-container">
      {/* Decorative Web SVGs in corners */}
      <svg className="web-corner-left" viewBox="0 0 100 100" fill="none" stroke="currentColor">
        <path d="M0,0 L100,0 C100,55 55,100 0,100 Z" stroke="#ff7518" strokeWidth="0.7" opacity="0.4" />
        <path d="M0,0 L70,0 C70,38 38,70 0,70 Z" stroke="#ff7518" strokeWidth="0.7" opacity="0.5" />
        <path d="M0,0 L40,0 C40,22 22,40 0,40 Z" stroke="#ff7518" strokeWidth="0.7" opacity="0.6" />
        <line x1="0" y1="0" x2="100" y2="100" stroke="#ff7518" strokeWidth="0.6" opacity="0.5" />
        <line x1="0" y1="0" x2="80" y2="40" stroke="#ff7518" strokeWidth="0.6" opacity="0.4" />
        <line x1="0" y1="0" x2="40" y2="80" stroke="#ff7518" strokeWidth="0.6" opacity="0.4" />
      </svg>
      <svg className="web-corner-right" viewBox="0 0 100 100" fill="none" stroke="currentColor">
        <path d="M0,0 L100,0 C100,55 55,100 0,100 Z" stroke="#00ff88" strokeWidth="0.7" opacity="0.4" />
        <path d="M0,0 L70,0 C70,38 38,70 0,70 Z" stroke="#00ff88" strokeWidth="0.7" opacity="0.5" />
        <path d="M0,0 L40,0 C40,22 22,40 0,40 Z" stroke="#00ff88" strokeWidth="0.7" opacity="0.6" />
        <line x1="0" y1="0" x2="100" y2="100" stroke="#00ff88" strokeWidth="0.6" opacity="0.5" />
        <line x1="0" y1="0" x2="80" y2="40" stroke="#00ff88" strokeWidth="0.6" opacity="0.4" />
        <line x1="0" y1="0" x2="40" y2="80" stroke="#00ff88" strokeWidth="0.6" opacity="0.4" />
      </svg>

      {/* Floating Animated Bats */}
      <div className="floating-bats-container">
        <div className="bat bat-1">🦇</div>
        <div className="bat bat-2">🦇</div>
        <div className="bat bat-3">🦇</div>
      </div>

      {/* App Header */}
      <header className="app-header">
        <div className="header-badges-row">
          <span className="halloween-badge">
            <Ghost size={14} /> HALLOWEEN SPOOKTACULAR
          </span>
          <div className="header-controls">
            <button
              className={`sound-toggle-btn ${isMuted ? 'muted' : ''}`}
              onClick={handleToggleSound}
              title={isMuted ? 'Unmute Halloween Background Music & Sounds' : 'Mute Background Music & Sounds'}
            >
              {isMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
              <span>{isMuted ? 'Music Muted' : 'Spooky Music ON'}</span>
            </button>
          </div>
        </div>

        {/* YouTube Ambient Background Audio */}
        <YouTubeBackgroundAudio isMuted={isMuted} />

        <h1 className="spooky-title gradient-text-spooky">
          🎃 SPOOKY HALLOWEEN SPINNER 👻
        </h1>
      </header>

      {/* MASTER SPIN BUTTON */}
      <div className="master-spin-container">
        <button
          className={`master-spin-btn ${isAnySpinning ? 'spinning' : ''}`}
          onClick={spinBoth}
          disabled={isAnySpinning || availableNames.length === 0}
        >
          <Zap size={24} className="bolt-icon" />
          <span>{isAnySpinning ? 'SPINNING THE WHEEL...' : '🔥 SPIN THE WHEEL 🎃'}</span>
          <Flame size={24} className="flame-icon" />
        </button>
      </div>

      {/* Main Content: Dual Spinners Side-by-Side + Crypt of Souls */}
      <main className="app-content">
        <section className="spinners-dual-grid">
          {/* Left: Name / Victim Spinner */}
          <div className="spinner-column">
            <Spinner
              availableNames={availableNames}
              onSelectWinner={handleSelectWinnerName}
              isSpinning={isNameSpinning}
              setIsSpinning={setIsNameSpinning}
              lastWinner={lastWinnerName}
              spinTriggerRef={nameSpinRef}
            />
          </div>

          {/* Right: Task / Dare Spinner */}
          <div className="spinner-column">
            <TaskSpinner
              allTasks={tasks}
              onPickNextDare={pickNextNonRepeatingDare}
              onSelectTask={handleSelectTask}
              isSpinning={isTaskSpinning}
              setIsSpinning={setIsTaskSpinning}
              lastSelectedTask={lastSelectedTask}
              spinTriggerRef={taskSpinRef}
            />
          </div>
        </section>

        {/* Sidebar: Crypt of Souls */}
        <aside className="sidebar-section">
          <SelectedList
            selectedNames={selectedNames}
            onRemovePlayer={handleRemovePlayer}
            onRerollTaskForPlayer={handleRerollTaskForPlayer}
            onClearSelected={resetAll}
          />

          <button
            className="reset-btn"
            onClick={resetAll}
            disabled={isAnySpinning || (selectedNames.length === 0 && availableNames.length === PREFILLED_NAMES.length)}
          >
            <RotateCcw size={14} /> Reset Entire Crypt & Souls
          </button>
        </aside>
      </main>

      {/* POPUP REVEAL CELEBRATION MODAL */}
      {celebration && !isAnySpinning && (
        <div className="celebration-overlay" onClick={() => setCelebration(null)}>
          <div className="celebration-modal glass-panel" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setCelebration(null)}>
              <X size={20} />
            </button>
            <div className="celebration-badge">🎃 DARE SUMMONED! 👻</div>
            <div className="celebration-victim">
              <span className="label">CHOSEN SOUL:</span>
              <h2 className="victim-name">{celebration.name}</h2>
            </div>

            <div className="celebration-task-card">
              <div className="celebration-task-emoji">{celebration.task.icon}</div>
              <h3 className="celebration-task-title">{celebration.task.title}</h3>
              <p className="celebration-task-desc">"{celebration.task.description}"</p>
            </div>

            <button
              className="accept-dare-btn"
              onClick={() => setCelebration(null)}
            >
              <CheckCircle2 size={18} /> ACCEPT THE HALLOWEEN DARE!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
