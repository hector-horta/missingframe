import React, { useState } from 'react';
import { HelpCircle, ArrowRight } from 'lucide-react';

interface FollowUpModalProps {
  question: string;
  onSubmit: (answer: string) => void;
  isLoading: boolean;
}

export const FollowUpModal: React.FC<FollowUpModalProps> = ({ question, onSubmit, isLoading }) => {
  const [answer, setAnswer] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.trim() && !isLoading) {
      onSubmit(answer.trim());
    }
  };

  return (
    <div 
      className="settings-overlay flex-center"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 990,
        backgroundColor: 'rgba(5, 5, 8, 0.9)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div 
        className="glass-panel fade-in-reveal"
        style={{
          width: '100%',
          maxWidth: '560px',
          padding: '3rem 2.5rem',
          border: '1px solid var(--border-color-glow)',
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.9), 0 0 40px rgba(212, 175, 55, 0.05)'
        }}
      >
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <div 
            style={{
              background: 'rgba(212, 175, 55, 0.1)',
              border: '1px solid var(--accent-gold)',
              borderRadius: '50%',
              padding: '0.6rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-gold)',
              boxShadow: '0 0 15px rgba(212, 175, 55, 0.2)'
            }}
          >
            <HelpCircle size={24} />
          </div>
          <div>
            <span 
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--accent-gold)',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                display: 'block',
                marginBottom: '0.4rem'
              }}
            >
              The Detective's Inquiry
            </span>
            <h2 className="text-serif-italic" style={{ fontSize: '1.25rem', fontWeight: 500, lineHeight: 1.5, color: 'var(--text-primary)' }}>
              "{question}"
            </h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ position: 'relative' }}>
            <textarea
              placeholder="Answer the inquiry, or state what else you recall..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={isLoading}
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '1rem 1.25rem',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                color: 'var(--text-primary)',
                fontSize: '1rem',
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                resize: 'none',
                transition: 'all 0.3s var(--ease-cinema)'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent-gold)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button 
              type="submit" 
              className="btn-gold" 
              disabled={!answer.trim() || isLoading}
              style={{ minWidth: '160px' }}
            >
              {isLoading ? "Analyzing clue..." : "Resolve Synapse"} <ArrowRight size={14} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
