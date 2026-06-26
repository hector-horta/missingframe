import { useState, useCallback } from 'react';
import { AIManager } from '../lib/ai/client';
import { buildRecoveryPrompt } from '../lib/ai/prompts';

export interface NoiseVsAnchors {
  anclas: string[];
  ruido: string[];
}

export interface MovieRecoveryResult {
  ruido_vs_anclas: NoiseVsAnchors;
  analysis: string;
  confidence: 'high' | 'medium' | 'low';
  clarification_needed: boolean;
  clarification_question: string;
  extracted_clues: Array<{ label: string; confidence: number; status: 'confirmed' | 'uncertain' }>;
  candidates: Array<{
    title: string;
    year: string;
    match: number;
    why: string;
    possible_memory_errors: string[];
    posterUrl?: string;
    imdbId?: string;
    tmdbId?: string;
  }>;
}

export function useMovieRecovery(aiManager: AIManager = new AIManager()) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MovieRecoveryResult | null>(null);

  const recoverMovie = useCallback(async (userMemory: string) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const prompt = buildRecoveryPrompt(userMemory);
      const rawResponse = await aiManager.complete([{ role: 'user', content: prompt }]);
      
      const parsed = JSON.parse(rawResponse) as MovieRecoveryResult;
      setResult(parsed);
      return parsed;
    } catch (err: any) {
      console.error('Error recovering movie:', err);
      
      let friendlyMessage = 'Hubo un error al procesar tu solicitud. Por favor intenta de nuevo.';
      if (err.message && err.message.includes('429')) {
        friendlyMessage = 'Nuestros detectives están ocupados, intenta en un minuto.';
      } else if (err.message) {
        friendlyMessage = err.message;
      }
      
      setError(friendlyMessage);
      throw new Error(friendlyMessage);
    } finally {
      setLoading(false);
    }
  }, [aiManager]);

  return {
    loading,
    error,
    result,
    recoverMovie
  };
}
