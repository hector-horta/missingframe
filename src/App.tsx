import { useState, useEffect } from 'react';
import { Settings, Film, AlertTriangle } from 'lucide-react';
import { DetectiveConsole } from './components/DetectiveConsole';
import { ClueChipsView } from './components/ClueChipsView';
import { ReconstructionScreen } from './components/ReconstructionScreen';
import { FollowUpModal } from './components/FollowUpModal';
import { SettingsModal } from './components/SettingsModal';
import { reconstructMemory, getLocalGeminiKey } from './services/reconstruct';
import type { Clue, CandidateMovie } from './services/reconstruct';

type Step = 1 | 2 | 4;

function App() {
  const [step, setStep] = useState<Step>(1);
  const [query, setQuery] = useState('');
  const [clues, setClues] = useState<Clue[]>([]);
  const [candidates, setCandidates] = useState<CandidateMovie[]>([]);
  const [followUpQuestion, setFollowUpQuestion] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noKeyWarning, setNoKeyWarning] = useState(false);

  // Check key configuration on load
  useEffect(() => {
    const key = getLocalGeminiKey();
    if (!key) {
      setNoKeyWarning(true);
    }
  }, []);

  // Step 1: Submit raw description to extract initial clues
  const handleExtractClues = async (searchQuery: string) => {
    setIsLoading(true);
    setError(null);
    setQuery(searchQuery);

    try {
      const response = await reconstructMemory({ query: searchQuery });
      setClues(response.extracted_clues || []);
      setStep(2);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to extract clues from memory synapses.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Submit refined clues list to reconstruct
  const handleReconstruct = async (refinedClues: Clue[]) => {
    setClues(refinedClues);
    setIsLoading(true);
    setError(null);

    try {
      const response = await reconstructMemory({ clues: refinedClues });
      
      if (response.clarification_needed && response.clarification_question) {
        setFollowUpQuestion(response.clarification_question);
      } else if (response.movies && response.movies.length > 0) {
        setCandidates(response.movies);
        setStep(4);
      } else {
        setError("Reconstruction returned empty matching database records.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Reconstruction failed to assemble movie candidates.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Handle follow-up answer submit
  const handleFollowUpSubmit = async (answer: string) => {
    if (!followUpQuestion) return;
    setIsLoading(true);
    setError(null);

    try {
      const response = await reconstructMemory({
        clues,
        followUpQuestion,
        followUpAnswer: answer
      });
      
      // Clear follow up
      setFollowUpQuestion(null);

      if (response.movies && response.movies.length > 0) {
        setCandidates(response.movies);
        setStep(4);
      } else {
        setError("Failed to resolve candidate target after follow-up details.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Reconstruction failed during follow-up query evaluation.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setQuery('');
    setClues([]);
    setCandidates([]);
    setFollowUpQuestion(null);
    setError(null);
  };

  return (
    <div className="cinema-container">
      {/* Cinematic Navigation Header */}
      <header className="app-header">
        <div onClick={handleReset} className="app-logo">
          <Film style={{ color: 'var(--accent-gold)' }} size={22} />
          <span className="font-display text-glow-gold app-logo-text">
            Missing Frame
          </span>
        </div>

        <div>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="settings-toggle-btn btn-secondary"
            aria-label="Detective settings"
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* Warnings & Errors */}
      {noKeyWarning && !getLocalGeminiKey() && (
        <div className="warning-banner glass-panel">
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
        <div className="error-banner glass-panel">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Workspace Body */}
      <main className="app-main">
        {step === 1 && (
          <DetectiveConsole 
            onSubmit={handleExtractClues} 
            isLoading={isLoading} 
            initialQuery={query}
          />
        )}
        
        {step === 2 && (
          <ClueChipsView 
            clues={clues} 
            onReconstruct={handleReconstruct}
            isLoading={isLoading}
          />
        )}

        {step === 4 && (
          <ReconstructionScreen 
            candidates={candidates} 
            onReset={handleReset} 
          />
        )}
      </main>

      {/* Detective follow-up modal popover */}
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
      <footer className="app-footer">
        <p>MISSING FRAME © {new Date().getFullYear()} — AN ELITE CINEMATIC RECONSTRUCTION PROJECT.</p>
      </footer>
    </div>
  );
}

export default App;
