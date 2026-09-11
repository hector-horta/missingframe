import React from 'react';
import { motion } from 'framer-motion';
import { Anchor, AlertCircle, HelpCircle } from 'lucide-react';
import type { MovieRecoveryResult } from '../hooks/useMovieRecovery';

export interface MemoryDeductionsPanelProps {
  analysis: string;
  confidence: MovieRecoveryResult['confidence'];
  ruido_vs_anclas?: MovieRecoveryResult['ruido_vs_anclas'];
  scanRevealVariants?: any;
}

export const MemoryDeductionsPanel: React.FC<MemoryDeductionsPanelProps> = ({
  analysis,
  confidence,
  ruido_vs_anclas,
  scanRevealVariants
}) => {
  return (
    <div className="flex flex-col gap-6">
      {/* Detective Narrative analysis */}
      <motion.div 
        variants={scanRevealVariants}
        className="border border-[#e6e6df]/10 bg-[#08080a]/30 p-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#4b6b94]/5 blur-2xl rounded-full pointer-events-none" />
        <h4 className="text-xs font-bold text-[#4b6b94] uppercase tracking-[0.15em] mb-3 flex items-center gap-2">
          <HelpCircle size={12} /> Diagnóstico del Detective
        </h4>
        <p className="text-sm font-light leading-relaxed text-[#c0c0bb]">
          {analysis}
        </p>
        <div className="mt-4 flex items-center gap-2">
          <span className="text-[0.6rem] uppercase tracking-widest text-[#90908b]">Confianza en la recuperación:</span>
          <span className={`text-[0.65rem] uppercase tracking-widest font-bold px-2 py-0.5 border ${
            confidence === 'high' ? 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5' :
            confidence === 'medium' ? 'text-amber-400 border-amber-400/20 bg-amber-400/5' :
            'text-rose-400 border-rose-400/20 bg-rose-400/5'
          }`}>
            {confidence}
          </span>
        </div>
      </motion.div>

      {/* Noise vs Anchors Section */}
      <motion.div 
        variants={scanRevealVariants}
        className="border border-[#e6e6df]/10 bg-[#08080a]/30 p-6 flex flex-col gap-6 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#151b26_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

        <h4 className="text-xs font-bold text-[#e6e6df] uppercase tracking-[0.15em] border-b border-[#e6e6df]/5 pb-3">
          Deducciones: Ruido vs Anclas
        </h4>

        {/* Anchors (Anclas) */}
        <div>
          <span className="text-[0.65rem] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5 mb-3">
            <Anchor size={10} /> Anclas de Memoria (Datos Confirmados)
          </span>
          {ruido_vs_anclas?.anclas && ruido_vs_anclas.anclas.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {ruido_vs_anclas.anclas.map((anchor, idx) => (
                <li key={idx} className="text-xs text-[#90908b] flex items-start gap-2 leading-relaxed">
                  <motion.div 
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + idx * 0.1 }}
                    className="flex items-start gap-2"
                  >
                    <span className="text-emerald-400 mt-0.5">✓</span>
                    <span>{anchor}</span>
                  </motion.div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-[#90908b] italic">No se identificaron anclas sólidas.</p>
          )}
        </div>

        {/* Noise (Ruido / Correcciones) */}
        <div>
          <span className="text-[0.65rem] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5 mb-3">
            <AlertCircle size={10} /> Correcciones de Ruido Sináptico
          </span>
          {ruido_vs_anclas?.ruido && ruido_vs_anclas.ruido.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {ruido_vs_anclas.ruido.map((noise, idx) => (
                <li key={idx} className="text-xs text-[#90908b] flex items-start gap-2 leading-relaxed">
                  <motion.div 
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + idx * 0.1 }}
                    className="flex items-start gap-2"
                  >
                    <span className="text-amber-400 mt-0.5">⚠</span>
                    <span>{noise}</span>
                  </motion.div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-[#90908b] italic">No se detectó ruido aparente.</p>
          )}
        </div>

      </motion.div>
    </div>
  );
};
