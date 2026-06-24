import React, { useState, useEffect } from 'react';
import { Compass, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    let interval: ReturnType<typeof setInterval>;
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
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-3xl mx-auto text-center"
    >
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-[260px] flex flex-col items-center justify-center gap-8 p-8"
          >
            <Cpu className="text-[#e6e6df] opacity-60 animate-spin" size={32} />
            <div>
              <h3 className="font-display text-[0.8rem] tracking-[0.2em] text-[#e6e6df] mb-3 uppercase">
                Detective Engine Active
              </h3>
              <p className="text-serif-italic text-[#90908b] text-2xl font-light min-h-[3rem]">
                {DETECTIVE_PHASES[phaseIndex]}
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.form 
            key="console-form"
            onSubmit={handleSubmit} 
            className="flex flex-col gap-12"
          >
            <div className="relative">
              <label htmlFor="memory-query" className="sr-only">
                Describe everything you remember
              </label>
              <textarea
                id="memory-query"
                className="w-full min-h-[160px] text-3xl md:text-4xl text-center text-[#e6e6df] placeholder-[#4e4e4a] bg-transparent border-b border-transparent focus:border-[#4b6b94] outline-none resize-none text-serif-italic transition-all duration-700"
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
                disabled={!query.trim()}
                aria-label="Recover Memory from description"
                className={`min-w-[260px] px-8 py-3 text-xs tracking-[0.2em] uppercase transition-all duration-500 border ${
                  query.trim() 
                    ? 'border-[#e6e6df] hover:border-[#4b6b94] hover:bg-[#e6e6df] hover:text-[#020203] text-[#e6e6df] cursor-pointer' 
                    : 'border-[#4e4e4a] text-[#4e4e4a] cursor-not-allowed'
                }`}
              >
                Recover Memory
              </button>
            </div>

            {/* Suggestions disappear immediately once user starts typing */}
            {!query && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-8 border-t border-[#e6e6df]/5 pt-10"
              >
                <div className="flex items-center justify-center gap-2 text-[#90908b] text-[0.75rem] font-medium uppercase tracking-[0.15em] mb-6">
                  <Compass size={12} />
                  <span>Or start with a fragmented memory:</span>
                </div>
                <div className="flex flex-col gap-4 max-w-2xl mx-auto">
                  {SUGGESTIONS.map((suggestion, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSuggestionClick(suggestion)}
                      aria-label={`Select suggestion ${idx + 1}`}
                      className="p-5 text-left text-[0.95rem] text-[#90908b] border border-[#e6e6df]/5 hover:border-[#e6e6df]/20 hover:text-[#e6e6df] hover:bg-[#e6e6df]/[0.02] transition-all duration-300"
                    >
                      <span className="text-serif-italic">"{suggestion}"</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
