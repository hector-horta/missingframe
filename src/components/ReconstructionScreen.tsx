import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, Flame, ExternalLink, Play, Film } from 'lucide-react';
import { motion } from 'framer-motion';
import type { CandidateMovie } from '../types';

interface ReconstructionScreenProps {
  candidates: CandidateMovie[];
  onReset: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
  color: string;
  decay: number;
}

export const ReconstructionScreen: React.FC<ReconstructionScreenProps> = ({ candidates, onReset }) => {
  const [selectedMovie, setSelectedMovie] = useState<CandidateMovie | null>(null);
  const [showCelebrationOverlay, setShowCelebrationOverlay] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Canvas particle engine for celebration
  useEffect(() => {
    if (!showCelebrationOverlay || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Particle[] = [];
    const colors = [
      'rgba(212, 175, 55, 0.85)', // Gold
      'rgba(243, 207, 101, 0.9)',  // Light Gold
      'rgba(255, 255, 255, 0.95)', // White sparks
      'rgba(218, 62, 82, 0.75)'    // Crimson sparks
    ];

    const spawnSparks = (x: number, y: number, count: number) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 8 + 2;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - (Math.random() * 3),
          alpha: 1,
          size: Math.random() * 3 + 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          decay: Math.random() * 0.015 + 0.01
        });
      }
    };

    spawnSparks(canvas.width / 2, canvas.height / 2, 150);
    spawnSparks(canvas.width * 0.25, canvas.height * 0.75, 80);
    spawnSparks(canvas.width * 0.75, canvas.height * 0.75, 80);

    const floatInterval = setInterval(() => {
      for (let i = 0; i < 4; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: canvas.height + 10,
          vx: (Math.random() - 0.5) * 2,
          vy: -(Math.random() * 4 + 2),
          alpha: 1,
          size: Math.random() * 2.5 + 0.5,
          color: colors[Math.floor(Math.random() * colors.length)],
          decay: Math.random() * 0.01 + 0.005
        });
      }
    }, 50);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
        p.vx *= 0.98;
        p.alpha -= p.decay;

        if (p.alpha <= 0 || p.y > canvas.height + 20) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        if (p.color.includes('212') || p.color.includes('243')) {
          ctx.shadowBlur = 8;
          ctx.shadowColor = 'rgba(212, 175, 55, 0.6)';
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    const timeout = setTimeout(() => {
      setShowCelebrationOverlay(false);
    }, 6000);

    return () => {
      clearInterval(floatInterval);
      clearTimeout(timeout);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [showCelebrationOverlay]);

  const handleThatIsTheMovie = (movie: CandidateMovie) => {
    setSelectedMovie(movie);
    setShowCelebrationOverlay(true);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-5xl mx-auto px-4"
    >
      {showCelebrationOverlay && (
        <canvas ref={canvasRef} className="fixed inset-0 z-[999] pointer-events-none" />
      )}

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
        {candidates.map((candidate, idx) => {
          const isSelected = selectedMovie?.title === candidate.title;
          const matchPercent = Math.round(candidate.match * 100);
          
          return (
            <div 
              key={idx}
              className="flex flex-col border border-[#e6e6df]/5 bg-[#08080a]/30 h-full"
            >
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
                  {!selectedMovie ? (
                    <button 
                      onClick={() => handleThatIsTheMovie(candidate)} 
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
        })}
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
