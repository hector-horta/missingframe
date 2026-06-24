import React, { useState, useEffect, useRef } from 'react';
import { Check, RotateCcw, Flame, Film, User, Calendar, ExternalLink } from 'lucide-react';
import type { ReconstructedMovie } from '../services/reconstruct';

interface ReconstructionScreenProps {
  movie: ReconstructedMovie;
  onDigAgain: () => void;
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

export const ReconstructionScreen: React.FC<ReconstructionScreenProps> = ({ movie, onDigAgain }) => {
  const [isCelebrated, setIsCelebrated] = useState(false);
  const [showCelebrationOverlay, setShowCelebrationOverlay] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Trigger procedural backdrop styling if no backdrop is loaded
  const hasBackdrop = !!movie.backdropUrl;
  const backdropStyle: React.CSSProperties = hasBackdrop 
    ? { backgroundImage: `linear-gradient(to bottom, rgba(5, 5, 8, 0.85), rgba(5, 5, 8, 0.98)), url(${movie.backdropUrl})` }
    : { backgroundImage: 'radial-gradient(circle at 50% 30%, rgba(212, 175, 55, 0.08) 0%, rgba(218, 62, 82, 0.03) 40%, var(--bg-primary) 100%)' };

  // Canvas particle engine for celebration
  useEffect(() => {
    if (!showCelebrationOverlay || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize canvas
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Particle[] = [];
    const colors = [
      'rgba(212, 175, 55, 0.85)', // Gold
      'rgba(243, 207, 101, 0.9)',  // Light Gold
      'rgba(255, 255, 255, 0.95)', // White sparks
      'rgba(218, 62, 82, 0.75)'    // Muted cinematic crimson sparks
    ];

    // Spawn sparks
    const spawnSparks = (x: number, y: number, count: number) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 8 + 2;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - (Math.random() * 3), // Upward tendency
          alpha: 1,
          size: Math.random() * 3 + 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          decay: Math.random() * 0.015 + 0.01
        });
      }
    };

    // Initial burst from center and sides
    spawnSparks(canvas.width / 2, canvas.height / 2, 150);
    spawnSparks(canvas.width * 0.25, canvas.height * 0.75, 80);
    spawnSparks(canvas.width * 0.75, canvas.height * 0.75, 80);

    // Continuous floating sparks
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
        p.vy += 0.05; // Gravity
        p.vx *= 0.98; // Friction
        p.alpha -= p.decay;

        if (p.alpha <= 0 || p.y > canvas.height + 20) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        // Blur shadow glow for gold particles
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

    // Auto cleanup of overlay after a few seconds but keep subtle sparks floating
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

  const handleThatIsTheMovie = () => {
    setIsCelebrated(true);
    setShowCelebrationOverlay(true);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'match':
        return { color: 'var(--success)', label: 'Match' };
      case 'misremembered':
        return { color: '#e28743', label: 'Misremembered' };
      case 'correction':
        return { color: 'var(--error)', label: 'Correction' };
      default:
        return { color: 'var(--text-secondary)', label: 'Alignment' };
    }
  };

  return (
    <div 
      className="reconstruction-container fade-in-reveal"
      style={{
        width: '100%',
        maxWidth: '920px',
        margin: '0 auto',
        padding: '2.5rem',
        borderRadius: '16px',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        ...backdropStyle,
        transition: 'all 0.5s var(--ease-cinema)'
      }}
    >
      {/* Immersive Golden Sparks Overlay */}
      {showCelebrationOverlay && (
        <canvas 
          ref={canvasRef}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999,
            pointerEvents: 'none'
          }}
        />
      )}

      {/* Celebration visual payoff card */}
      {isCelebrated && (
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
          <span>RECONSTRUCTION COMPLETE. THAT'S THE MOVIE!</span>
          <style>{`
            @keyframes bounce-slow {
              from { transform: translateY(0); }
              to { transform: translateY(-4px); }
            }
          `}</style>
        </div>
      )}

      {/* Main Panel Content split into Poster and Details */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2.5rem',
          alignItems: 'start'
        }}
      >
        {/* Cinematic Poster Area */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
          {movie.posterUrl ? (
            <img 
              src={movie.posterUrl} 
              alt={movie.title} 
              style={{
                width: '100%',
                maxWidth: '280px',
                aspectRatio: '2/3',
                objectFit: 'cover',
                borderRadius: '8px',
                boxShadow: '0 15px 35px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05)',
                border: isCelebrated ? '2px solid var(--accent-gold)' : '1px solid transparent',
                transition: 'border-color 0.5s'
              }}
            />
          ) : (
            /* Procedural Cinematic Poster Placeholder */
            <div 
              style={{
                width: '100%',
                maxWidth: '280px',
                aspectRatio: '2/3',
                borderRadius: '8px',
                boxShadow: '0 15px 35px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05)',
                background: 'linear-gradient(135deg, #0f0f15 0%, #060608 100%)',
                border: isCelebrated ? '2px solid var(--accent-gold)' : '1px solid var(--border-color-glow)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '2rem 1.5rem',
                position: 'relative',
                overflow: 'hidden',
                textAlign: 'center'
              }}
            >
              {/* Procedural light beam line */}
              <div 
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '1px',
                  height: '60%',
                  background: 'linear-gradient(to bottom, rgba(212, 175, 55, 0.3), transparent)'
                }}
              />
              <div style={{ zIndex: 1 }}>
                <Film size={28} style={{ color: 'var(--accent-gold)', opacity: 0.5, margin: '0 auto' }} />
              </div>
              <div style={{ zIndex: 1, margin: '2rem 0' }}>
                <h3 className="font-display" style={{ fontSize: '1.4rem', color: 'var(--text-primary)', letterSpacing: '0.02em', textWrap: 'balance' }}>
                  {movie.title}
                </h3>
                <p className="text-serif-italic" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  Directed by {movie.director}
                </p>
              </div>
              <div style={{ zIndex: 1, display: 'flex', justifyContent: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span>{movie.year}</span>
              </div>
            </div>
          )}

          {/* Confidence Indicator */}
          <div 
            className="glass-panel"
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              border: '1px solid var(--border-color-glow)'
            }}
          >
            <div 
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: movie.confidence >= 80 ? 'var(--success)' : '#e28743',
                boxShadow: `0 0 10px ${movie.confidence >= 80 ? 'var(--success)' : '#e28743'}`
              }}
            />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
              Confidence Score: <span style={{ color: 'var(--accent-gold)' }}>{movie.confidence}%</span>
            </span>
          </div>
        </div>

        {/* Detailed Investigation Report */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          <div>
            <span 
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.15em'
              }}
            >
              Reconstructed Dossier
            </span>
            <h2 className="font-display text-glow-gold" style={{ fontSize: '2rem', marginTop: '0.25rem', color: 'var(--text-primary)' }}>
              {movie.title} ({movie.year})
            </h2>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <User size={14} /> Dir: {movie.director}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Calendar size={14} /> Release: {movie.year}
              </span>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
              Dossier Summary
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              {movie.summary}
            </p>
          </div>

          {/* Memory Alignment Table */}
          <div>
            <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
              Memory Alignment Analysis
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {movie.alignments.map((alignment, idx) => {
                const statusInfo = getStatusStyle(alignment.status);
                return (
                  <div 
                    key={idx}
                    className="glass-panel"
                    style={{
                      padding: '0.85rem 1.2rem',
                      fontSize: '0.85rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.4rem',
                      borderLeft: `3px solid ${statusInfo.color}`,
                      background: 'rgba(255, 255, 255, 0.01)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                        Your Memory
                      </span>
                      <span style={{ color: statusInfo.color, fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                      "{alignment.memory}"
                    </div>
                    <div 
                      style={{ 
                        borderTop: '1px solid rgba(255, 255, 255, 0.03)', 
                        paddingTop: '0.4rem',
                        marginTop: '0.2rem',
                        color: 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.4rem'
                      }}
                    >
                      <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>Reality:</span>
                      <span>{alignment.reality}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
              Detective's Explanation
            </h4>
            <p className="text-serif-italic" style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '1rem' }}>
              "{movie.explanation}"
            </p>
          </div>

          {/* Action Buttons */}
          <div 
            style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '1rem', 
              marginTop: '1rem',
              borderTop: '1px solid var(--border-color)',
              paddingTop: '1.5rem'
            }}
          >
            {!isCelebrated ? (
              <button 
                onClick={handleThatIsTheMovie} 
                className="btn-gold"
                style={{ flex: 1, minWidth: '200px' }}
              >
                <Check size={16} /> THAT'S THE MOVIE!
              </button>
            ) : (
              <a 
                href={`https://www.google.com/search?q=${encodeURIComponent(movie.title + ' ' + movie.year + ' movie')}`} 
                target="_blank" 
                rel="noreferrer"
                className="btn-gold"
                style={{ flex: 1, minWidth: '200px', textDecoration: 'none' }}
              >
                Find Movie to Watch <ExternalLink size={14} />
              </a>
            )}
            
            <button 
              onClick={onDigAgain} 
              className="btn-secondary"
              style={{ flex: 1, minWidth: '160px' }}
            >
              <RotateCcw size={14} /> Reconstruct Another
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
