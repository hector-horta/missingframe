import React, { useState } from 'react';
import { RotateCcw, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import type { CandidateMovie } from '../types';
import { CelebrationCanvas } from './CelebrationCanvas';
import { CandidateCard } from './CandidateCard';

interface ReconstructionScreenProps {
  candidates: CandidateMovie[];
  onReset: () => void;
  onConfirmCandidate?: (candidate: CandidateMovie) => void;
}

export const ReconstructionScreen: React.FC<ReconstructionScreenProps> = ({ 
  candidates, 
  onReset, 
  onConfirmCandidate 
}) => {
  const [selectedMovie, setSelectedMovie] = useState<CandidateMovie | null>(null);
  const [showCelebrationOverlay, setShowCelebrationOverlay] = useState(false);

  const handleThatIsTheMovie = (movie: CandidateMovie) => {
    setSelectedMovie(movie);
    setShowCelebrationOverlay(true);
    if (onConfirmCandidate) {
      onConfirmCandidate(movie);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-5xl mx-auto px-4"
    >
      <CelebrationCanvas 
        active={showCelebrationOverlay} 
        onComplete={() => setShowCelebrationOverlay(false)} 
      />

      {selectedMovie && (
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="border border-[#e6e6df] text-[#e6e6df] p-6 mb-16 flex items-center justify-center gap-3 text-center text-sm font-semibold tracking-[0.15em] uppercase"
        >
          <Flame size={18} className="text-[#4b6b94]" />
          <span>Dossier Complete: "{selectedMovie.title}" has been recovered.</span>
        </motion.div>
      )}

      <div className="mb-10">
        <span className="text-xs font-semibold text-[#90908b] uppercase tracking-[0.2em]">
          Dossier Matches
        </span>
        <h2 className="font-display text-4xl mt-2 uppercase tracking-wide font-extrabold text-[#e6e6df] text-glow-blue">
          Ranked Candidates
        </h2>
      </div>

      {/* Grid of Candidates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {candidates.map((candidate, idx) => (
          <CandidateCard
            key={idx}
            candidate={candidate}
            isSelected={selectedMovie?.title === candidate.title}
            hasSelectedMovie={selectedMovie !== null}
            onSelect={handleThatIsTheMovie}
          />
        ))}
      </div>

      {/* Dig again footer button */}
      <div className="flex justify-center mt-16 mb-8">
        <button 
          onClick={onReset} 
          className="min-w-[180px] py-3 border border-[#e6e6df]/10 text-xs uppercase tracking-widest text-[#90908b] hover:text-[#e6e6df] hover:border-[#e6e6df] flex items-center justify-center gap-2 transition-all duration-300"
        >
          <RotateCcw size={12} /> Dig Again
        </button>
      </div>
    </motion.div>
  );
};
