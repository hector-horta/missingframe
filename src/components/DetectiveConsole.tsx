import React, { useState, useEffect } from 'react';
import { Search, Compass, Cpu } from 'lucide-react';

interface DetectiveConsoleProps {
  onSubmit: (query: string) => void;
  isLoading: boolean;
  initialQuery?: string;
}

const DETECTIVE_PHASES = [
  "Analyzing temporal markers...",
  "Cross-referencing memory fragments...",
  "De-conflicting actor overlays...",
  "Triangulating emotional synapses...",
  "Decrypting scene associations...",
  "Reconstructing final cinematic frame..."
];

const SUGGESTIONS = [
  "A guy gets a call that he will die in 3 days, wait no it's a tape that kills you if you watch it. There's a well and a creepy girl.",
  "That thriller from the 90s, Brad Pitt is a detective, it is raining all the time, they investigate 7 sins and there is a box at the end.",
  "A space movie where they visit a planet with huge waves, time goes super slow, and a dad talks to his daughter through a bookshelf."
];

export const DetectiveConsole: React.FC<DetectiveConsoleProps> = ({ onSubmit, isLoading, initialQuery = '' }) => {
  const [query, setQuery] = useState(initialQuery);
  const [phaseIndex, setPhaseIndex] = useState(0);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    let interval: any;
    if (isLoading) {
      setPhaseIndex(0);
      interval = setInterval(() => {
        setPhaseIndex((prev) => (prev + 1) % DETECTIVE_PHASES.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSubmit(query.trim());
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (!isLoading) {
      setQuery(suggestion);
    }
  };

  return (
    <div className="detective-console fade-in-reveal" style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
      {isLoading ? (
        <div 
          className="glass-panel flex-center"
          style={{
            minHeight: '260px',
            flexDirection: 'column',
            gap: '1.5rem',
            padding: '2rem',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div 
            style={{
              position: 'absolute',
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 70%)',
              animation: 'pulse-glow 2s infinite ease-in-out'
            }}
          />
          <Cpu className="text-glow-gold" size={36} style={{ color: 'var(--accent-gold)', animation: 'spin-slow 6s linear infinite' }} />
          <div>
            <h3 className="font-display" style={{ fontSize: '1rem', letterSpacing: '0.1em', color: 'var(--accent-gold)', marginBottom: '0.5rem' }}>
              Detective Engine Active
            </h3>
            <p className="text-serif-italic" style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', minHeight: '1.8lh' }}>
              {DETECTIVE_PHASES[phaseIndex]}
            </p>
          </div>

          <style>{`
            @keyframes pulse-glow {
              0%, 100% { transform: scale(1); opacity: 0.5; }
              50% { transform: scale(1.5); opacity: 1; }
            }
            @keyframes spin-slow {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ position: 'relative' }}>
            <textarea
              className="console-textarea"
              placeholder="Describe everything you remember. It doesn't matter if some details are wrong."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <div 
              style={{
                position: 'absolute',
                bottom: '1rem',
                right: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'var(--text-muted)',
                fontSize: '0.75rem'
              }}
            >
              <span>Press Enter to analyze</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button 
              type="submit" 
              className="btn-gold" 
              disabled={!query.trim()}
              style={{ width: '100%', minWidth: '220px' }}
            >
              <Search size={16} /> Reconstruct Memory
            </button>
          </div>

          {/* Suggestions disappear once typing starts (i.e., query is empty) */}
          {!query && (
            <div className="suggestions-container fade-in-reveal" style={{ marginTop: '1rem' }}>
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  color: 'var(--text-secondary)', 
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '0.75rem'
                }}
              >
                <Compass size={14} style={{ color: 'var(--accent-gold)' }} /> Or start with a fragmented memory:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {SUGGESTIONS.map((suggestion, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="glass-panel suggestion-item"
                    style={{
                      padding: '1rem',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      color: 'var(--text-secondary)',
                      transition: 'all 0.3s var(--ease-cinema)',
                      border: '1px solid var(--border-color)',
                      background: 'rgba(255, 255, 255, 0.01)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
                      e.currentTarget.style.background = 'rgba(212, 175, 55, 0.02)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.01)';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }}
                  >
                    <span className="text-serif-italic">"{suggestion}"</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </form>
      )}
    </div>
  );
};
