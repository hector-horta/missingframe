import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { DetectiveConsole } from './components/DetectiveConsole';
import { ClueChipsView } from './components/ClueChipsView';
import { ReconstructionScreen } from './components/ReconstructionScreen';
import { FollowUpModal } from './components/FollowUpModal';
import { SettingsModal } from './components/SettingsModal';
import { useReconstructionFlow } from './hooks/useReconstructionFlow';

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const {
    step,
    query,
    clues,
    candidates,
    followUpQuestion,
    isLoading,
    error,
    handleExtractClues,
    handleReconstruct,
    handleFollowUpSubmit,
    handleReset,
    handleConfirmCandidate
  } = useReconstructionFlow();

  return (
    <div className="min-h-screen flex flex-col justify-between p-8 md:p-16 max-w-6xl mx-auto">
      {/* Cinematic Navigation Header (Only displayed after Step 1) */}
      {step !== 1 && (
        <header className="flex justify-between items-center border-b border-[#e6e6df]/5 pb-6 mb-8 animate-fade-in">
          <button 
            onClick={handleReset} 
            className="flex items-center gap-2 cursor-pointer group"
            aria-label="Back to homepage"
          >
            <span className="font-display text-sm tracking-[0.15em] text-[#e6e6df] group-hover:text-[#4b6b94] transition-colors">
              Missing Frame
            </span>
          </button>
        </header>
      )}

      {/* Warnings & Errors */}
      {error && (
        <div className="flex items-center gap-3 p-4 border border-rose-500/25 bg-rose-950/10 text-rose-300 text-sm mb-6">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Workspace Body */}
      <main className="flex-grow flex items-center justify-center w-full min-h-[50vh]">
        {step === 1 ? (
          /* Homepage: Centered Logo + Tagline + Textarea console */
          <div className="flex flex-col items-center gap-14 w-full">
            <div className="text-center">
              <h1 className="text-5xl md:text-7xl font-extrabold uppercase tracking-tight text-[#e6e6df] mb-2 font-display">
                Missing Frame
              </h1>
              <span className="text-[#90908b] text-sm md:text-base font-light tracking-wider uppercase block">
                Recover movie memories from fragmented synapses
              </span>
            </div>

            <DetectiveConsole 
              onSubmit={handleExtractClues} 
              isLoading={isLoading} 
              initialQuery={query}
            />
          </div>
        ) : step === 2 ? (
          <ClueChipsView 
            clues={clues} 
            onReconstruct={handleReconstruct}
            isLoading={isLoading}
          />
        ) : (
          <ReconstructionScreen 
            candidates={candidates} 
            onReset={handleReset} 
            onConfirmCandidate={handleConfirmCandidate}
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
        onClose={() => setIsSettingsOpen(false)} 
      />

      {/* Cinematic A24 Footer */}
      <footer className="flex flex-col items-center mt-16 border-t border-[#e6e6df]/5 pt-6 text-center">
        <p className="text-[0.65rem] text-[#4e4e4a] tracking-wider uppercase">
          MISSING FRAME © {new Date().getFullYear()} — AN ELITE MEMORIES RECONSTRUCTION PROJECT.
        </p>
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="text-[0.65rem] text-[#4e4e4a] hover:text-[#90908b] uppercase tracking-[0.1em] mt-1.5 transition-colors"
          aria-label="Open settings credentials modal"
        >
          credentials
        </button>
      </footer>
    </div>
  );
}

export default App;
