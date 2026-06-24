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
    <div 
      className="settings-overlay flex-center"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(5, 5, 8, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div 
        className="glass-panel settings-content fade-in-reveal"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '480px',
          padding: '2.5rem',
          position: 'relative',
          border: '1px solid var(--border-color-glow)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}
      >
        <button 
          className="close-btn" 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            color: 'var(--text-secondary)',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label 
              htmlFor="gemini-key-input"
              style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Key size={14} style={{ color: 'var(--accent-gold)' }} /> Gemini API Key
            </label>
            <input
              id="gemini-key-input"
              type="password"
              placeholder="AI Engine Key..."
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                transition: 'border-color 0.3s'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent-gold)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
            />
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Required if not deployed with a secure Cloudflare environment variable.
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label 
              htmlFor="tmdb-key-input"
              style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Film size={14} style={{ color: 'var(--accent-gold)' }} /> TMDB API Key (Optional)
            </label>
            <input
              id="tmdb-key-input"
              type="password"
              placeholder="The Movie Database Key..."
              value={tmdbKey}
              onChange={(e) => setTmdbKey(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                transition: 'border-color 0.3s'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent-gold)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
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
