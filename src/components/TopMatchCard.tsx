import React from 'react';
import { motion } from 'framer-motion';
import { Film, Play, ExternalLink } from 'lucide-react';
import type { CandidateMovie } from '../types';

export interface TopMatchCardProps {
  candidate?: CandidateMovie;
  itemVariants?: any;
}

export const TopMatchCard: React.FC<TopMatchCardProps> = ({ candidate, itemVariants }) => {
  const matchPercent = candidate ? Math.round(candidate.match * 100) : 0;

  return (
    <motion.div 
      variants={itemVariants} 
      className="flex flex-col border border-[#e6e6df]/10 bg-[#08080a]/45 relative overflow-hidden group"
    >
      {/* Scan Line effect */}
      <motion.div 
        className="absolute h-1 w-full bg-[#4b6b94]/40 z-10 top-0 left-0"
        animate={{ top: ['0%', '100%', '0%'] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
      />

      {candidate ? (
        <>
          {/* Poster Backdrop */}
          <div className="relative aspect-[2/3] w-full bg-[#0e0e12] flex items-center justify-center overflow-hidden">
            {candidate.posterUrl ? (
              <img 
                src={candidate.posterUrl} 
                alt={candidate.title} 
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
                {candidate.title}
              </h3>
              <span className="text-serif-italic text-[#90908b] text-sm block mt-1">
                Estreno: {candidate.year}
              </span>
              <div className="mt-4 border-t border-[#e6e6df]/10 pt-4">
                <span className="text-[0.65rem] font-bold text-emerald-400 uppercase tracking-widest block mb-1">
                  Alineación de pistas
                </span>
                <p className="text-xs text-[#90908b] leading-relaxed">
                  {candidate.why}
                </p>
              </div>
            </div>

            {/* External Dossier Links */}
            <div className="flex gap-2 mt-6">
              <a 
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(candidate.title + ' ' + candidate.year + ' official trailer')}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2.5 border border-[#e6e6df]/10 text-[0.65rem] uppercase tracking-wider text-[#e6e6df] hover:border-[#4b6b94] hover:bg-[#e6e6df] hover:text-[#020203] flex items-center justify-center gap-1.5 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4b6b94] focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080a]"
                aria-label="Ver Trailer"
              >
                <Play size={10} /> Trailer
              </a>
              
              {candidate.imdbId && (
                <a 
                  href={`https://www.imdb.com/title/${candidate.imdbId}`}
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
  );
};
