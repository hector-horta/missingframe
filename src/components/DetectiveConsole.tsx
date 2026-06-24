import React, { useState, useEffect } from 'react';
import { Compass, Cpu } from 'lucide-react';

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
    <div className="detective-console fade-in-reveal" style={{ width: '100%', maxWidth: '850px', margin: '0 auto', textAlign: 'center' }}>
      {isLoading ? (
        <div 
          style={{
            minHeight: '260px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2rem',
            padding: '2rem',
            textAlign: 'center'
          }}
        >
          <Cpu size={32} style={{ color: 'var(--text-primary)', opacity: 0.6, animation: 'spin-slow 8s linear infinite' }} />
          <div>
            <h3 className="font-display" style={{ fontSize: '0.8rem', letterSpacing: '0.2em', color: 'var(--text-primary)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
              Detective Engine Active
            </h3>
            <p className="text-serif-italic" style={{ color: 'var(--text-secondary)', fontSize: '1.4rem', fontStyle: 'italic', fontWeight: 300, minHeight: '1.8lh' }}>
              {DETECTIVE_PHASES[phaseIndex]}
            </p>
          </div>

          <style>{`
            @keyframes spin-slow {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
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
          </div>

          <div>
            <button 
              type="submit" 
              className="btn-gold" 
              disabled={!query.trim()}
              style={{ minWidth: '260px' }}
            >
              Recover Memory
            </button>
          </div>

          {/* Suggestions disappear immediately once user starts typing */}
          {!query && (
            <div className="suggestions-container fade-in-reveal" style={{ marginTop: '2rem', borderTop: '1px solid rgba(230, 230, 223, 0.05)', paddingTop: '2.5rem' }}>
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: '0.5rem', 
                  color: 'var(--text-secondary)', 
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  marginBottom: '1.5rem'
                }}
              >
                <Compass size={12} /> Or start with a fragmented memory:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '700px', margin: '0 auto' }}>
                {SUGGESTIONS.map((suggestion, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSuggestionClick(suggestion)}
                    style={{
                      padding: '1.25rem',
                      cursor: 'pointer',
                      fontSize: '0.95rem',
                      color: 'var(--text-secondary)',
                      transition: 'all 0.4s var(--ease-cinema)',
                      border: '1px solid rgba(230, 230, 223, 0.05)',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(230, 230, 223, 0.2)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                      e.currentTarget.style.background = 'rgba(230, 230, 223, 0.02)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(230, 230, 223, 0.05)';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                      e.currentTarget.style.background = 'transparent';
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
