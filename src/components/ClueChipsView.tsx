import React, { useState } from 'react';
import { Trash2, Plus, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Clue } from '../types';

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
      setChips([...chips, { label: newClueText.trim(), status: 'confirmed', confidence: 1.0 }]);
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
      updated[idx] = { ...updated[idx], label: editingText.trim() };
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
      status: updated[idx].status === 'confirmed' ? 'uncertain' : 'confirmed' 
    };
    setChips(updated);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-3xl mx-auto p-10 border border-[#e6e6df]/5 bg-[#08080a]/40 backdrop-blur-2xl"
    >
      <div className="mb-8">
        <span className="text-xs font-bold text-[#4b6b94] uppercase tracking-[0.15em]">
          Step 2 — Clue Refinement
        </span>
        <h2 className="font-display text-[1.75rem] mt-1 text-[#e6e6df]">
          Review Clues
        </h2>
        <p className="text-[#90908b] text-sm mt-2">
          The AI extracted these elements. Toggle status (✅ / ⚠), click text to edit, or remove inaccurate fragments.
        </p>
      </div>

      {/* Clues Box container */}
      <div className="flex flex-wrap gap-3 mb-10 min-h-[60px] items-center">
        <AnimatePresence>
          {chips.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full text-center text-[#4e4e4a] italic text-sm py-4"
            >
              No clues remaining. Add some below to reconstruct.
            </motion.div>
          ) : (
            chips.map((chip, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`flex items-center gap-2 px-4 py-2 border transition-all duration-300 ${
                  chip.status === 'confirmed' 
                    ? 'border-emerald-500/20 text-emerald-300 bg-emerald-950/10' 
                    : 'border-amber-500/20 text-amber-300 bg-amber-950/10'
                }`}
              >
                {/* Status Toggle Button */}
                <button 
                  type="button"
                  onClick={() => handleToggleStatus(idx)}
                  title={`Mark as ${chip.status === 'confirmed' ? 'uncertain' : 'confirmed'}`}
                  aria-label={`Toggle status of ${chip.label}`}
                  className="text-xs flex items-center hover:opacity-80 transition-opacity"
                >
                  {chip.status === 'confirmed' ? '✅' : '⚠'}
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
                    className="bg-transparent border-b border-current outline-none px-1 text-sm focus:ring-0"
                    style={{ width: `${Math.max(editingText.length * 8, 60)}px` }}
                  />
                ) : (
                  <span 
                    onClick={() => handleStartEdit(idx, chip.label)}
                    className="cursor-pointer select-none text-sm font-light hover:underline"
                    title="Click to edit"
                  >
                    {chip.label}
                  </span>
                )}

                {/* Remove Button */}
                <button 
                  type="button" 
                  onClick={() => handleRemoveClue(idx)} 
                  aria-label="remove clue"
                  className="text-current opacity-60 hover:opacity-100 transition-opacity ml-1"
                >
                  <Trash2 size={13} />
                </button>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Add New Clue Inline Input */}
      <form onSubmit={handleAddClue} className="flex gap-3 mb-10">
        <input 
          type="text" 
          placeholder="Add another memory detail..." 
          value={newClueText}
          onChange={(e) => setNewClueText(e.target.value)}
          className="flex-grow px-4 py-3 bg-transparent border border-[#e6e6df]/10 text-sm text-[#e6e6df] placeholder-[#4e4e4a] focus:border-[#4b6b94] focus:outline-none transition-colors"
        />
        <button 
          type="submit" 
          className="px-5 py-3 border border-[#e6e6df]/10 text-xs uppercase tracking-wider text-[#e6e6df] hover:border-[#4b6b94] hover:bg-[#e6e6df] hover:text-[#020203] flex items-center gap-2 transition-all duration-300"
        >
          <Plus size={14} /> Add Clue
        </button>
      </form>

      {/* Reconstruct Triggers */}
      <div className="flex justify-center">
        <button 
          onClick={() => onReconstruct(chips)} 
          disabled={chips.length === 0 || isLoading}
          className={`min-w-[240px] px-8 py-3 text-xs tracking-[0.2em] uppercase transition-all duration-500 border flex items-center justify-center gap-2 ${
            chips.length === 0 || isLoading
              ? 'border-[#4e4e4a] text-[#4e4e4a] cursor-not-allowed'
              : 'border-[#e6e6df] hover:border-[#4b6b94] hover:bg-[#e6e6df] hover:text-[#020203] text-[#e6e6df] cursor-pointer'
          }`}
        >
          <Sparkles size={14} /> 
          <span>{isLoading ? "Analyzing Synapses..." : "Reconstruct Movie"}</span>
        </button>
      </div>
    </motion.div>
  );
};
