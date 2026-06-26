import React from 'react';
import { motion } from 'framer-motion';
import { Anchor, RotateCcw, AlertCircle, HelpCircle, Film, ExternalLink, Play } from 'lucide-react';
import type { MovieRecoveryResult } from '../hooks/useMovieRecovery';

interface MemoryAnalysisProps {
  result: MovieRecoveryResult;
  onReset: () => void;
}

export const MemoryAnalysis: React.FC<MemoryAnalysisProps> = ({ result, onReset }) => {
  const { ruido_vs_anclas, analysis, confidence, candidates } = result;
  const topCandidate = candidates?.[0];
  const matchPercent = topCandidate ? Math.round(topCandidate.match * 100) : 0;

  // Variants for staggered reveals
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
        
        {/* Left Column: Top Match Movie Card */}
        <motion.div variants={itemVariants} className="flex flex-col border border-[#e6e6df]/10 bg-[#08080a]/45 relative overflow-hidden group">
          {/* Scan Line effect */}
          <motion.div 
            className="absolute h-1 w-full bg-[#4b6b94]/40 z-10 top-0 left-0"
            animate={{ top: ['0%', '100%', '0%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          />

          {topCandidate ? (
            <>
              {/* Poster Backdrop */}
              <div className="relative aspect-[2/3] w-full bg-[#0e0e12] flex items-center justify-center overflow-hidden">
                {topCandidate.posterUrl ? (
                  <img 
                    src={topCandidate.posterUrl} 
                    alt={topCandidate.title} 
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="text-center p-6 opacity-40">
                    <Film size={36} className="mb-4 mx-auto" />
                    <span className="text-xs uppercase tracking-widest block">Poster No Disponible</span>
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-[#020203]/90 border border-[#e6e6df]/15 px-3 py-1 text-xs uppercase tracking-widest text-[#e6e6df]">
                  {matchPercent}% Coincidencia
                </div>
              </div>

              {/* Title & Info */}
              <div className="p-6 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="font-display text-2xl uppercase tracking-wide">
                    {topCandidate.title}
                  </h3>
                  <span className="text-serif-italic text-[#90908b] text-sm block mt-1">
                    Estreno: {topCandidate.year}
                  </span>
                  <div className="mt-4 border-t border-[#e6e6df]/10 pt-4">
                    <span className="text-[0.65rem] font-bold text-emerald-400 uppercase tracking-widest block mb-1">
                      Alineación de pistas
                    </span>
                    <p className="text-xs text-[#90908b] leading-relaxed">
                      {topCandidate.why}
                    </p>
                  </div>
                </div>

                {/* External Dossier Links */}
                <div className="flex gap-2 mt-6">
                  <a 
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(topCandidate.title + ' ' + topCandidate.year + ' official trailer')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2.5 border border-[#e6e6df]/10 text-[0.65rem] uppercase tracking-wider text-[#e6e6df] hover:border-[#4b6b94] hover:bg-[#e6e6df] hover:text-[#020203] flex items-center justify-center gap-1.5 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4b6b94] focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080a]"
                    aria-label="Ver Trailer"
                  >
                    <Play size={10} /> Trailer
                  </a>
                  
                  {topCandidate.imdbId && (
                    <a 
                      href={`https://www.imdb.com/title/${topCandidate.imdbId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-2.5 border border-[#e6e6df]/10 text-[0.65rem] uppercase tracking-wider text-[#e6e6df] hover:border-[#4b6b94] hover:bg-[#e6e6df] hover:text-[#020203] flex items-center justify-center gap-1 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4b6b94] focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080a]"
                      aria-label="Enlace IMDb"
                    >
                      IMDb <ExternalLink size={8} />
                    </a>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center opacity-60">No se encontraron candidatos.</div>
          )}
        </motion.div>

        {/* Right Column: Detective Deductions */}
        <div className="flex flex-col gap-6">
          
          {/* Detective Narrative analysis */}
          <motion.div 
            variants={scanRevealVariants}
            className="border border-[#e6e6df]/10 bg-[#08080a]/30 p-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#4b6b94]/5 blur-2xl rounded-full pointer-events-none" />
            <h4 className="text-xs font-bold text-[#4b6b94] uppercase tracking-[0.15em] mb-3 flex items-center gap-2">
              <HelpCircle size={12} /> Diagnóstico del Detective
            </h4>
            <p className="text-sm font-light leading-relaxed text-[#c0c0bb]">
              {analysis}
            </p>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-[0.6rem] uppercase tracking-widest text-[#90908b]">Confianza en la recuperación:</span>
              <span className={`text-[0.65rem] uppercase tracking-widest font-bold px-2 py-0.5 border ${
                confidence === 'high' ? 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5' :
                confidence === 'medium' ? 'text-amber-400 border-amber-400/20 bg-amber-400/5' :
                'text-rose-400 border-rose-400/20 bg-rose-400/5'
              }`}>
                {confidence}
              </span>
            </div>
          </motion.div>

          {/* Noise vs Anchors Section */}
          <motion.div 
            variants={scanRevealVariants}
            className="border border-[#e6e6df]/10 bg-[#08080a]/30 p-6 flex flex-col gap-6 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#151b26_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

            <h4 className="text-xs font-bold text-[#e6e6df] uppercase tracking-[0.15em] border-b border-[#e6e6df]/5 pb-3">
              Deducciones: Ruido vs Anclas
            </h4>

            {/* Anchors (Anclas) */}
            <div>
              <span className="text-[0.65rem] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5 mb-3">
                <Anchor size={10} /> Anclas de Memoria (Datos Confirmados)
              </span>
              {ruido_vs_anclas?.anclas && ruido_vs_anclas.anclas.length > 0 ? (
                <ul className="flex flex-col gap-2">
                  {ruido_vs_anclas.anclas.map((anchor, idx) => (
                    <li key={idx} className="text-xs text-[#90908b] flex items-start gap-2 leading-relaxed">
                      <motion.div 
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + idx * 0.1 }}
                        className="flex items-start gap-2"
                      >
                        <span className="text-emerald-400 mt-0.5">✓</span>
                        <span>{anchor}</span>
                      </motion.div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-[#90908b] italic">No se identificaron anclas sólidas.</p>
              )}
            </div>

            {/* Noise (Ruido / Correcciones) */}
            <div>
              <span className="text-[0.65rem] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5 mb-3">
                <AlertCircle size={10} /> Correcciones de Ruido Sináptico
              </span>
              {ruido_vs_anclas?.ruido && ruido_vs_anclas.ruido.length > 0 ? (
                <ul className="flex flex-col gap-2">
                  {ruido_vs_anclas.ruido.map((noise, idx) => (
                    <li key={idx} className="text-xs text-[#90908b] flex items-start gap-2 leading-relaxed">
                      <motion.div 
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + idx * 0.1 }}
                        className="flex items-start gap-2"
                      >
                        <span className="text-amber-400 mt-0.5">⚠</span>
                        <span>{noise}</span>
                      </motion.div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-[#90908b] italic">No se detectó ruido aparente.</p>
              )}
            </div>

          </motion.div>

        </div>

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
