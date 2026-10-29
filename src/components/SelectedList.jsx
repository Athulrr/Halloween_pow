import React, { useState } from 'react';
import './SelectedList.css';
import { RotateCcw, Skull, Sparkles, XCircle } from 'lucide-react';

const SelectedList = ({ 
  selectedNames, 
  onRemovePlayer,
  onRerollTaskForPlayer,
  onClearSelected
}) => {
  const [expandedTaskId, setExpandedTaskId] = useState(null);

  const toggleTaskDetail = (id) => {
    setExpandedTaskId(prev => prev === id ? null : id);
  };

  return (
    <div className="selected-wrapper glass-panel">
      <div className="selected-header">
        <div className="selected-title-group">
          <span className="selected-icon">🪦</span>
          <div>
            <h3>Crypt of Souls</h3>
            <span className="sub-caption-purple">Summoned Victims</span>
          </div>
        </div>
        <div className="selected-actions">
          <span className="count-badge crypt-badge">
            <Skull size={13} /> {selectedNames.length} Summoned
          </span>
          {selectedNames.length > 0 && onClearSelected && (
            <button 
              className="clear-crypt-btn" 
              onClick={onClearSelected} 
              title="Clear Crypt"
            >
              <RotateCcw size={12} />
            </button>
          )}
        </div>
      </div>

      <div className="selected-list">
        {selectedNames.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">👻</span>
            <p className="empty-title">The Crypt is Silent...</p>
            <p className="empty-sub">Spin the wheel to summon a victim & dare!</p>
          </div>
        ) : (
          <ul>
            {selectedNames.map((player, index) => {
              const hasTask = !!player.task;
              const isExpanded = expandedTaskId === player.id;

              return (
                <li key={player.id} className="crypt-item">
                  <div className="item-main-row">
                    <div className="player-info">
                      <span className="name-index">#{index + 1}</span>
                      <div className="player-details">
                        <span className="name-text">
                          {player.name}
                        </span>

                        {/* Assigned Dare Badge */}
                        {hasTask && (
                          <div 
                            className="player-dare-tag"
                            onClick={() => toggleTaskDetail(player.id)}
                            title="Click to view dare instructions"
                          >
                            <span className="dare-emoji">{player.task.icon}</span>
                            <span className="dare-title">{player.task.title}</span>
                          </div>
                        )}
                        {!hasTask && onRerollTaskForPlayer && (
                          <button 
                            className="assign-dare-btn" 
                            onClick={() => onRerollTaskForPlayer(player.id)}
                            title="Assign a Halloween dare"
                          >
                            + Assign Dare
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="player-actions">
                      {onRemovePlayer && (
                        <button 
                          className="remove-player-btn" 
                          onClick={() => onRemovePlayer(player.id)} 
                          title="Remove from Crypt"
                        >
                          <XCircle size={16} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded Dare description dropdown */}
                  {hasTask && (
                    <div className={`dare-description-box ${isExpanded ? 'open' : ''}`}>
                      <p>{player.task.description}</p>
                      {onRerollTaskForPlayer && (
                        <button 
                          className="reroll-mini-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRerollTaskForPlayer(player.id);
                          }}
                        >
                          <Sparkles size={11} /> Re-roll Dare
                        </button>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SelectedList;
