import React from 'react';
import { X, Cpu, Shield, Film } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#020203]/90 backdrop-blur-md" onClick={onClose}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md p-8 border border-[#e6e6df]/5 bg-[#08080a] flex flex-col gap-6 shadow-2xl"
          >
            <button 
              className="absolute top-4 right-4 text-[#90908b] hover:text-[#e6e6df] transition-colors" 
              onClick={onClose}
              aria-label="close settings"
            >
              <X size={18} />
            </button>

            <div>
              <h2 className="font-display text-sm uppercase tracking-[0.2em] text-[#4b6b94]">
                Dossier Configuration
              </h2>
              <p className="text-[#90908b] text-xs mt-1 leading-relaxed">
                System status and cryptographic environment parameters.
              </p>
            </div>

            <div className="flex flex-col gap-4 border-t border-[#e6e6df]/5 pt-4 text-xs">
              {/* Host Status */}
              <div className="flex justify-between items-center py-2 border-b border-[#e6e6df]/5">
                <div className="flex items-center gap-2 text-[#90908b]">
                  <Cpu size={14} />
                  <span>LLM Provider Host</span>
                </div>
                <span className="font-mono text-[#e6e6df] bg-[#e6e6df]/5 px-2 py-0.5 uppercase tracking-wide">
                  Cloudflare Edge
                </span>
              </div>

              {/* Encryption Status */}
              <div className="flex justify-between items-center py-2 border-b border-[#e6e6df]/5">
                <div className="flex items-center gap-2 text-[#90908b]">
                  <Shield size={14} />
                  <span>Key Storage Security</span>
                </div>
                <span className="text-emerald-400 font-medium">
                  AES-256 Secured
                </span>
              </div>

              {/* TMDB Artwork Status */}
              <div className="flex justify-between items-center py-2">
                <div className="flex items-center gap-2 text-[#90908b]">
                  <Film size={14} />
                  <span>Artwork Indexer</span>
                </div>
                <span className="text-emerald-400 font-medium">
                  TMDB Proxy Active
                </span>
              </div>
            </div>

            <p className="text-[#4e4e4a] text-[0.65rem] text-center italic mt-2 leading-relaxed">
              For security, API credentials reside inside the Cloudflare Workers vault and are never exposed to the browser client.
            </p>

            <button 
              type="button" 
              onClick={onClose}
              className="w-full py-2.5 border border-[#e6e6df]/10 hover:border-[#e6e6df]/20 hover:bg-[#e6e6df] hover:text-[#020203] text-xs uppercase tracking-wider text-[#e6e6df] transition-all duration-300"
            >
              Acknowledge
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
