import React, { useState } from 'react';
import { HelpCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#020203]/90 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-xl p-8 border border-[#e6e6df]/5 bg-[#08080a] flex flex-col gap-8 shadow-2xl"
      >
        <div className="flex gap-4 items-start">
          <div className="bg-[#4b6b94]/10 border border-[#4b6b94]/30 rounded-full p-2 flex items-center justify-center text-[#4b6b94] shadow-[0_0_15px_rgba(75,107,148,0.1)]">
            <HelpCircle size={22} />
          </div>
          <div>
            <span className="text-[0.7rem] font-bold text-[#4b6b94] uppercase tracking-[0.15em] block mb-1">
              The Detective's Inquiry
            </span>
            <h2 className="text-serif-italic text-lg font-normal leading-relaxed text-[#e6e6df]">
              "{question}"
            </h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label htmlFor="inquiry-answer" className="sr-only">
              Your Answer
            </label>
            <textarea
              id="inquiry-answer"
              placeholder="Answer the inquiry, or state what else you recall..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={isLoading}
              className="w-full min-h-[100px] p-4 bg-transparent border border-[#e6e6df]/10 text-sm text-[#e6e6df] placeholder-[#4e4e4a] focus:border-[#4b6b94] focus:outline-none transition-colors resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
          </div>

          <div className="flex justify-end">
            <button 
              type="submit" 
              disabled={!answer.trim() || isLoading}
              className={`px-6 py-3 border text-xs tracking-wider uppercase flex items-center gap-2 transition-all duration-300 ${
                !answer.trim() || isLoading
                  ? 'border-[#4e4e4a] text-[#4e4e4a] cursor-not-allowed'
                  : 'border-[#e6e6df] hover:border-[#4b6b94] hover:bg-[#e6e6df] hover:text-[#020203] text-[#e6e6df] cursor-pointer'
              }`}
            >
              <span>{isLoading ? "Analyzing clue..." : "Resolve Synapse"}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
