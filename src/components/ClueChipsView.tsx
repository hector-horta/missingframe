import React, { useState } from 'react';
import { Trash2, Plus, Sparkles } from 'lucide-react';
import type { Clue } from '../services/reconstruct';

interface ClueChipsViewProps {
  clues: Clue[];
  onReconstruct: (finalClues: Clue[]) => void;
  isLoading?: boolean;
}

export const ClueChipsView: React.FC<ClueChipsViewProps> = ({ clues, onReconstruct, isLoading = false }) => {
  const [chips, setChips] = useState<Clue[]>([...clues]);
  const [newClueText, setNewClueText] = useState('');
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');

  const handleAddClue = (e: React.FormEvent) => {
    e.preventDefault();
    if (newClueText.trim()) {
      setChips([...chips, { text: newClueText.trim(), status: 'valid' }]);
      setNewClueText('');
    }
  };

  const handleRemoveClue = (idxToRemove: number) => {
    setChips(chips.filter((_, idx) => idx !== idxToRemove));
  };

  const handleStartEdit = (idx: number, currentText: string) => {
    setEditingIdx(idx);
    setEditingText(currentText);
  };

  const handleSaveEdit = (idx: number) => {
    if (editingText.trim()) {
      const updated = [...chips];
      updated[idx] = { ...updated[idx], text: editingText.trim() };
      setChips(updated);
    } else {
      handleRemoveClue(idx);
    }
    setEditingIdx(null);
  };

  const handleToggleStatus = (idx: number) => {
    const updated = [...chips];
    updated[idx] = { 
      ...updated[idx], 
      status: updated[idx].status === 'valid' ? 'doubtful' : 'valid' 
    };
    setChips(updated);
  };

  return (
    <div className="glass-panel fade-in-reveal clue-chips-wrapper" style={{ width: '100%', maxWidth: '780px', margin: '0 auto', padding: '2.5rem' }}>
      <div className="clue-refine-header">
        <span 
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--accent-gold)',
            textTransform: 'uppercase',
            letterSpacing: '0.15em'
          }}
        >
          Step 2 — Clue Refinement
        </span>
        <h2 className="font-display text-glow-gold" style={{ fontSize: '1.75rem', marginTop: '0.25rem', color: 'var(--text-primary)' }}>
          Review Clues
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
          The AI extracted these elements. Toggle status (✅ / ⚠), click text to edit, or remove inaccurate fragments.
        </p>
      </div>

      {/* Clues Box container */}
      <div className="clue-refine-list">
        {chips.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.9rem' }}>
            No clues remaining. Add some below to reconstruct.
          </div>
        ) : (
          chips.map((chip, idx) => (
            <div 
              key={idx}
              className={`clue-chip-item ${chip.status}`}
            >
              {/* Status Toggle Button */}
              <button 
                type="button"
                onClick={() => handleToggleStatus(idx)}
                title={`Mark as ${chip.status === 'valid' ? 'doubtful' : 'valid'}`}
                style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center' }}
              >
                {chip.status === 'valid' ? '✅' : '⚠'}
              </button>

              {/* Editable Text Area */}
              {editingIdx === idx ? (
                <input
                  type="text"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  onBlur={() => handleSaveEdit(idx)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveEdit(idx);
                    if (e.key === 'Escape') setEditingIdx(null);
                  }}
                  autoFocus
                  className="clue-chip-inline-input"
                  style={{ width: `${Math.max(editingText.length * 8, 60)}px` }}
                />
              ) : (
                <span 
                  onClick={() => handleStartEdit(idx, chip.text)}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  title="Click to edit"
                >
                  {chip.text}
                </span>
              )}

              {/* Remove Button */}
              <button 
                type="button" 
                onClick={() => handleRemoveClue(idx)} 
                aria-label="remove clue"
                className="clue-chip-remove-btn"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add New Clue Inline Input */}
      <form onSubmit={handleAddClue} className="add-clue-form-wrap">
        <input 
          type="text" 
          placeholder="Add another memory detail..." 
          value={newClueText}
          onChange={(e) => setNewClueText(e.target.value)}
          className="add-clue-input-field"
        />
        <button 
          type="submit" 
          className="btn-secondary" 
          style={{ padding: '0 1.25rem', display: 'flex', gap: '0.4rem', textTransform: 'none', letterSpacing: 'normal' }}
        >
          <Plus size={16} /> Add Clue
        </button>
      </form>

      {/* Reconstruct Triggers */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button 
          onClick={() => onReconstruct(chips)} 
          className="btn-gold"
          disabled={chips.length === 0 || isLoading}
          style={{ minWidth: '240px' }}
        >
          <Sparkles size={16} /> {isLoading ? "Analyzing Synapses..." : "Reconstruct Movie"}
        </button>
      </div>
    </div>
  );
};
