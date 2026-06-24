import React, { useState, useEffect } from 'react';
import { X, Key, Film, Check } from 'lucide-react';
import { getLocalGeminiKey, getLocalTMDBKey } from '../services/reconstruct';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [geminiKey, setGeminiKey] = useState('');
  const [tmdbKey, setTmdbKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setGeminiKey(getLocalGeminiKey());
      setTmdbKey(getLocalTMDBKey());
      setSaved(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('MF_GEMINI_API_KEY', geminiKey.trim());
    localStorage.setItem('MF_TMDB_API_KEY', tmdbKey.trim());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="glass-panel modal-content-wrap fade-in-reveal" onClick={(e) => e.stopPropagation()}>
        <button 
          className="modal-close-btn" 
          onClick={onClose}
          aria-label="close settings"
        >
          <X size={20} />
        </button>

        <div>
          <h2 className="font-display text-glow-gold" style={{ fontSize: '1.4rem', color: 'var(--accent-gold)' }}>
            Detective Keys
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            Configure local credentials for memory reconstruction. Keys remain securely on your device.
          </p>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label htmlFor="gemini-key-input" className="form-label">
              <Key size={14} style={{ color: 'var(--accent-gold)' }} /> Gemini API Key
            </label>
            <input
              id="gemini-key-input"
              type="password"
              placeholder="AI Engine Key..."
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              className="form-input-field"
            />
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Required if not deployed with a secure Cloudflare environment variable.
            </span>
          </div>

          <div className="form-group">
            <label htmlFor="tmdb-key-input" className="form-label">
              <Film size={14} style={{ color: 'var(--accent-gold)' }} /> TMDB API Key (Optional)
            </label>
            <input
              id="tmdb-key-input"
              type="password"
              placeholder="The Movie Database Key..."
              value={tmdbKey}
              onChange={(e) => setTmdbKey(e.target.value)}
              className="form-input-field"
            />
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Enables rich visual movie poster and backdrop reconstruction.
            </span>
          </div>

          {saved ? (
            <div 
              style={{ 
                background: 'rgba(48, 164, 108, 0.1)', 
                border: '1px solid var(--success)', 
                color: 'var(--success)',
                padding: '0.75rem',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontSize: '0.85rem'
              }}
            >
              <Check size={16} /> Keys Registered Successfully
            </div>
          ) : (
            <button 
              type="submit" 
              className="btn-gold"
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              Save Credentials
            </button>
          )}
        </form>
      </div>
    </div>
  );
};
