import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, Flame, ExternalLink, Play } from 'lucide-react';
import type { CandidateMovie } from '../services/reconstruct';

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
    <div className="reconstruction-container fade-in-reveal" style={{ width: '100%', maxWidth: '1080px', margin: '0 auto' }}>
      {showCelebrationOverlay && (
        <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 999, pointerEvents: 'none' }} />
      )}

      {selectedMovie && (
        <div 
          className="fade-in-reveal"
          style={{
            background: 'rgba(212, 175, 55, 0.08)',
            border: '1px solid var(--accent-gold)',
            color: 'var(--accent-gold)',
            padding: '1.25rem',
            borderRadius: '8px',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            boxShadow: '0 0 25px rgba(212, 175, 55, 0.15)',
            textAlign: 'center',
            fontSize: '1.1rem',
            fontWeight: 600,
            letterSpacing: '0.05em'
          }}
        >
          <Flame size={20} style={{ animation: 'bounce-slow 1s infinite alternate' }} />
          <span>RECONSTRUCTION SUCCESSFUL: "{selectedMovie.title.toUpperCase()}" IS THE MOVIE!</span>
        </div>
      )}

      <div className="reconstruction-header">
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
          Step 4 — Reconstructed Matches
        </span>
        <h2 className="font-display text-glow-gold" style={{ fontSize: '2rem', marginTop: '0.25rem', color: 'var(--text-primary)' }}>
          Ranked Candidates
        </h2>
      </div>

      {/* Grid of Candidates */}
      <div className="candidates-grid">
        {candidates.map((candidate, idx) => {
          const isSelected = selectedMovie?.title === candidate.title;
          const matchPercent = Math.round(candidate.match * 100);
          
          return (
            <div 
              key={idx}
              className={`candidate-card-item ${isSelected ? 'selected' : ''}`}
            >
              {/* Poster Backdrop Header or Image */}
              <div className="candidate-media-wrap">
                {candidate.backdropUrl ? (
                  <img 
                    src={candidate.backdropUrl} 
                    alt="" 
                    className="candidate-media-img"
                  />
                ) : (
                  <div className="candidate-media-placeholder" />
                )}
                
                {/* Confidence Floating Tag */}
                <div className="candidate-confidence-badge">
                  {matchPercent}% Match
                </div>

              </div>

              {/* Main Content Details */}
              <div className="candidate-details-wrap">
                <div>
                  <h3 className="font-display" style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                    {candidate.title} ({candidate.year})
                  </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                  {/* Why it matches */}
                  <div>
                    <span className="candidate-section-title match">
                      ✓ Clue Alignment
                    </span>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {candidate.why}
                    </p>
                  </div>

                  {/* Why it might not match / Possible memory errors */}
                  {candidate.possible_memory_errors && candidate.possible_memory_errors.length > 0 && (
                    <div>
                      <span className="candidate-section-title conflict">
                        ⚠ Conflict Markers
                      </span>
                      <ul style={{ paddingLeft: '1rem', margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {candidate.possible_memory_errors.map((errorText, eIdx) => (
                          <li key={eIdx} style={{ lineHeight: 1.5, marginBottom: '0.2rem' }}>
                            {errorText}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* External links & Payoff actions */}
                <div className="candidate-links-wrap">
                  
                  {/* Watch links */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <a 
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(candidate.title + ' ' + candidate.year + ' official trailer')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-secondary"
                      style={{ flex: 1, padding: '0.4rem 0.6rem', fontSize: '0.75rem', gap: '0.3rem' }}
                      aria-label="Watch Trailer"
                    >
                      <Play size={12} /> Trailer
                    </a>
                    
                    {candidate.imdbId && (
                      <a 
                        href={`https://www.imdb.com/title/${candidate.imdbId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-secondary"
                        style={{ flex: 1, padding: '0.4rem 0.6rem', fontSize: '0.75rem', gap: '0.3rem' }}
                        aria-label="IMDb link"
                      >
                        IMDb <ExternalLink size={10} />
                      </a>
                    )}

                    {candidate.tmdbId && (
                      <a 
                        href={`https://www.themoviedb.org/movie/${candidate.tmdbId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-secondary"
                        style={{ flex: 1, padding: '0.4rem 0.6rem', fontSize: '0.75rem', gap: '0.3rem' }}
                        aria-label="TMDb link"
                      >
                        TMDb <ExternalLink size={10} />
                      </a>
                    )}
                  </div>

                  {/* That's The Movie Confirmation Button */}
                  {!selectedMovie ? (
                    <button 
                      onClick={() => handleThatIsTheMovie(candidate)} 
                      className="btn-gold"
                      style={{ width: '100%', padding: '0.6rem' }}
                    >
                      THAT'S THE MOVIE!
                    </button>
                  ) : (
                    isSelected && (
                      <div className="candidate-selected-badge">
                        Confirmed Selection
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
      <div className="dig-again-wrap">
        <button onClick={onReset} className="btn-secondary" style={{ minWidth: '180px' }}>
          <RotateCcw size={14} /> Dig Again
        </button>
      </div>
    </div>
  );
};
