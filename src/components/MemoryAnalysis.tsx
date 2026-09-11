import React from 'react';
import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import type { MovieRecoveryResult } from '../hooks/useMovieRecovery';
import { TopMatchCard } from './TopMatchCard';
import { MemoryDeductionsPanel } from './MemoryDeductionsPanel';

interface MemoryAnalysisProps {
  result: MovieRecoveryResult;
  onReset: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring' as const, stiffness: 100, damping: 15 }
  }
};

const scanRevealVariants = {
  hidden: { clipPath: 'inset(0% 100% 0% 0%)', opacity: 0 },
  visible: { 
    clipPath: 'inset(0% 0% 0% 0%)', 
    opacity: 1,
    transition: { duration: 1.2, ease: [0.25, 1, 0.5, 1] as const }
  }
};

export const MemoryAnalysis: React.FC<MemoryAnalysisProps> = ({ result, onReset }) => {
  const { ruido_vs_anclas, analysis, confidence, candidates } = result;
  const topCandidate = candidates?.[0];

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="w-full max-w-4xl mx-auto px-4 text-[#e6e6df]"
    >
      {/* Top Header */}
      <motion.div variants={itemVariants} className="mb-8 border-b border-[#e6e6df]/10 pb-6">
        <span className="text-xs font-semibold text-[#90908b] uppercase tracking-[0.2em]">
          Deducción Completada
        </span>
        <h2 className="font-display text-3xl md:text-4xl mt-1 uppercase tracking-wide font-extrabold text-[#e6e6df] text-glow-blue">
          Análisis de Memoria
        </h2>
      </motion.div>

      {/* Main Grid: Result + Deductions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TopMatchCard candidate={topCandidate} itemVariants={itemVariants} />
        <MemoryDeductionsPanel 
          analysis={analysis}
          confidence={confidence}
          ruido_vs_anclas={ruido_vs_anclas}
          scanRevealVariants={scanRevealVariants}
        />
      </div>

      {/* Action Dig Again */}
      <motion.div variants={itemVariants} className="flex justify-center mt-12 mb-8">
        <button 
          onClick={onReset} 
          className="min-w-[180px] py-3 border border-[#e6e6df]/15 text-xs uppercase tracking-widest text-[#90908b] hover:text-[#e6e6df] hover:border-[#e6e6df] flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4b6b94] focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080a]"
          aria-label="Volver a investigar"
        >
          <RotateCcw size={12} /> Nueva Investigación
        </button>
      </motion.div>
    </motion.div>
  );
};
