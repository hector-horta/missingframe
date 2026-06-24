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
    <div className="followup-overlay">
      <div className="glass-panel followup-content-wrap fade-in-reveal">
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
          <div>
            <textarea
              placeholder="Answer the inquiry, or state what else you recall..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={isLoading}
              className="followup-text-area"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
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
