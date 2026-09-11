import React from 'react';
import { Film, Play, ExternalLink } from 'lucide-react';
import type { CandidateMovie } from '../types';

export interface CandidateCardProps {
  candidate: CandidateMovie;
  isSelected: boolean;
  hasSelectedMovie: boolean;
  onSelect: (candidate: CandidateMovie) => void;
}

export const CandidateCard: React.FC<CandidateCardProps> = ({
  candidate,
  isSelected,
  hasSelectedMovie,
  onSelect,
}) => {
  const matchPercent = Math.round(candidate.match * 100);

  return (
    <div className="flex flex-col border border-[#e6e6df]/5 bg-[#08080a]/30 h-full">
      {/* Poster Backdrop Header or Image */}
      <div className="relative aspect-[2/3] w-full bg-[#0e0e12] flex items-center justify-center overflow-hidden">
        {candidate.posterUrl ? (
          <img 
            src={candidate.posterUrl} 
            alt={candidate.title} 
            className="object-cover w-full h-full hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="text-center p-6">
            <Film size={24} className="mb-4 opacity-40 mx-auto text-[#e6e6df]" />
            <h4 className="text-sm uppercase tracking-wider text-[#90908b]">
              {candidate.title}
            </h4>
          </div>
        )}
        
        {/* Confidence Floating Tag */}
        <div className="absolute top-4 right-4 bg-[#020203]/80 border border-[#e6e6df]/10 px-3 py-1.5 text-[0.7rem] uppercase tracking-widest text-[#e6e6df]">
          {matchPercent}% Match
        </div>
      </div>

      {/* Main Content Details */}
      <div className="p-6 flex flex-col justify-between flex-grow gap-8">
        <div className="flex flex-col gap-6">
          <div>
            <h3 className="font-display text-xl text-[#e6e6df] tracking-wide leading-tight">
              {candidate.title.toUpperCase()}
            </h3>
            <span className="text-serif-italic text-[#90908b] text-sm mt-1 block">
              Released in {candidate.year}
            </span>
          </div>

          <div className="flex flex-col gap-5">
            {/* Why it matches */}
            <div>
              <span className="text-[0.65rem] font-bold text-emerald-400 uppercase tracking-widest block mb-2">
                Clue Alignment
              </span>
              <p className="text-xs text-[#e6e6df] leading-relaxed font-light">
                {candidate.why}
              </p>
            </div>

            {/* Why it might not match / Possible memory errors */}
            {candidate.possible_memory_errors && candidate.possible_memory_errors.length > 0 && (
              <div>
                <span className="text-[0.65rem] font-bold text-amber-400 uppercase tracking-widest block mb-2">
                  Suspected Synapses
                </span>
                <ul className="list-disc pl-4 text-xs text-[#90908b] flex flex-col gap-1.5 font-light">
                  {candidate.possible_memory_errors.map((errorText, eIdx) => (
                    <li key={eIdx} className="leading-relaxed">
                      {errorText}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* External links & Payoff actions */}
        <div className="flex flex-col gap-4 mt-auto">
          {/* Watch links */}
          <div className="flex gap-2">
            <a 
              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(candidate.title + ' ' + candidate.year + ' official trailer')}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-2.5 border border-[#e6e6df]/10 text-[0.65rem] uppercase tracking-wider text-[#e6e6df] hover:border-[#4b6b94] hover:bg-[#e6e6df] hover:text-[#020203] flex items-center justify-center gap-1.5 transition-all duration-300"
              aria-label="Watch Trailer"
            >
              <Play size={10} /> Trailer
            </a>
            
            {candidate.imdbId && (
              <a 
                href={`https://www.imdb.com/title/${candidate.imdbId}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2.5 border border-[#e6e6df]/10 text-[0.65rem] uppercase tracking-wider text-[#e6e6df] hover:border-[#4b6b94] hover:bg-[#e6e6df] hover:text-[#020203] flex items-center justify-center gap-1 transition-all duration-300"
                aria-label="IMDb link"
              >
                IMDb <ExternalLink size={8} />
              </a>
            )}

            {candidate.tmdbId && (
              <a 
                href={`https://www.themoviedb.org/movie/${candidate.tmdbId}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2.5 border border-[#e6e6df]/10 text-[0.65rem] uppercase tracking-wider text-[#e6e6df] hover:border-[#4b6b94] hover:bg-[#e6e6df] hover:text-[#020203] flex items-center justify-center gap-1 transition-all duration-300"
                aria-label="TMDb link"
              >
                TMDb <ExternalLink size={8} />
              </a>
            )}
          </div>

          {/* That's The Movie Confirmation Button */}
          {!hasSelectedMovie ? (
            <button 
              onClick={() => onSelect(candidate)} 
              className="w-full py-3 border border-[#e6e6df] hover:border-[#4b6b94] hover:bg-[#e6e6df] hover:text-[#020203] text-xs font-bold uppercase tracking-widest text-[#e6e6df] transition-all duration-500 cursor-pointer"
            >
              THAT'S THE MOVIE!
            </button>
          ) : (
            isSelected && (
              <div className="w-full py-3 border border-[#4b6b94]/20 bg-[#4b6b94]/5 text-center text-xs uppercase tracking-widest text-[#4b6b94]">
                Dossier Confirmed
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
