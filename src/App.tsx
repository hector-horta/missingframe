import { useState, useEffect } from 'react';
import { Settings, Film, AlertTriangle } from 'lucide-react';
import { DetectiveConsole } from './components/DetectiveConsole';
import { ReconstructionScreen } from './components/ReconstructionScreen';
import { FollowUpModal } from './components/FollowUpModal';
import { SettingsModal } from './components/SettingsModal';
import { reconstructMemory, getLocalGeminiKey } from './services/reconstruct';
import type { ReconstructedMovie } from './services/reconstruct';

function App() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [movie, setMovie] = useState<ReconstructedMovie | null>(null);
  const [followUpQuestion, setFollowUpQuestion] = useState<string | null>(null);
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noKeyWarning, setNoKeyWarning] = useState(false);

  // Check key configuration on load
  useEffect(() => {
    const key = getLocalGeminiKey();
    if (!key) {
      // Check if we are running in local dev mode
      setNoKeyWarning(true);
    }
  }, []);

  const handleReconstruct = async (searchQuery: string) => {
    setIsLoading(true);
    setError(null);
    setQuery(searchQuery);

    try {
      const response = await reconstructMemory(searchQuery);
      
      if (response.needsFollowUp && response.followUpQuestion) {
        setFollowUpQuestion(response.followUpQuestion);
      } else if (response.reconstructedMovie) {
        setMovie(response.reconstructedMovie);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "The reconstruction engine encountered a memory fault.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowUpSubmit = async (answer: string) => {
    if (!followUpQuestion) return;
    setIsLoading(true);
    setError(null);

    try {
      const response = await reconstructMemory(query, followUpQuestion, answer);
      
      // Clear follow up
      setFollowUpQuestion(null);

      if (response.reconstructedMovie) {
        setMovie(response.reconstructedMovie);
      } else {
        setError("Reconstruction failed to converge after follow-up inquiry.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Memory fault resolved during follow-up analysis.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMovie(null);
    setFollowUpQuestion(null);
    setQuery('');
    setError(null);
  };

  return (
    <div className="cinema-container">
      {/* Cinematic Navigation Header */}
      <header 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '1.25rem',
          marginBottom: '2.5rem'
        }}
      >
        <div 
          onClick={handleReset}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.6rem', 
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <Film style={{ color: 'var(--accent-gold)' }} size={22} />
          <span 
            className="font-display text-glow-gold" 
            style={{ 
              fontSize: '1.2rem', 
              fontWeight: 700, 
              color: 'var(--accent-gold)',
              letterSpacing: '0.15em'
            }}
          >
            Missing Frame
          </span>
        </div>

        <div>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="btn-secondary"
            style={{
              padding: '0.5rem 0.8rem',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border-color)'
            }}
            aria-label="Detective settings"
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* Warnings & Errors */}
      {noKeyWarning && !getLocalGeminiKey() && (
        <div 
          className="glass-panel"
          style={{
            padding: '1rem 1.5rem',
            border: '1px solid var(--border-color-glow)',
            color: 'var(--accent-gold)',
            borderRadius: '8px',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.85rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertTriangle size={18} />
            <span>Missing Gemini API Key. Provide it in Settings (key icon) to enable local reconstruction.</span>
          </div>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="btn-gold"
            style={{ padding: '0.4rem 1rem', fontSize: '0.75rem' }}
          >
            Setup Key
          </button>
        </div>
      )}

      {error && (
        <div 
          className="glass-panel"
          style={{
            padding: '1rem 1.5rem',
            border: '1px solid var(--error)',
            color: 'var(--error)',
            borderRadius: '8px',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: '0.85rem',
            background: 'rgba(229, 72, 77, 0.05)'
          }}
        >
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Workspace Body */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
        {movie ? (
          <ReconstructionScreen 
            movie={movie} 
            onDigAgain={handleReset} 
          />
        ) : (
          <DetectiveConsole 
            onSubmit={handleReconstruct} 
            isLoading={isLoading} 
            initialQuery={query}
          />
        )}
      </main>

      {/* Detective follow-up modal */}
      {followUpQuestion && (
        <FollowUpModal 
          question={followUpQuestion} 
          onSubmit={handleFollowUpSubmit}
          isLoading={isLoading}
        />
      )}

      {/* Settings Modal overlay */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => {
          setIsSettingsOpen(false);
          setNoKeyWarning(!getLocalGeminiKey());
        }} 
      />

      {/* Cinematic Footer */}
      <footer 
        style={{
          borderTop: '1px solid var(--border-color)',
          paddingTop: '1.25rem',
          marginTop: '2.5rem',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.75rem',
          letterSpacing: '0.05em'
        }}
      >
        <p>MISSING FRAME © {new Date().getFullYear()} — AN ELITE CINEMATIC RECONSTRUCTION PROJECT.</p>
      </footer>
    </div>
  );
}

export default App;
