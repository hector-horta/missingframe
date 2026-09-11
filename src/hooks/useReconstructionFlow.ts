import { useState } from 'react';
import { reconstructMemory } from '../services/apiClient';
import type { Clue, CandidateMovie, MediaDomain } from '../types';
import { emit } from '../analytics/eventBus';

export type Step = 1 | 2 | 4;

export function useReconstructionFlow() {
  const [step, setStep] = useState<Step>(1);
  const [query, setQuery] = useState('');
  const [clues, setClues] = useState<Clue[]>([]);
  const [candidates, setCandidates] = useState<CandidateMovie[]>([]);
  const [followUpQuestion, setFollowUpQuestion] = useState<string | null>(null);
  const [domain, setDomain] = useState<MediaDomain>('movie');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExtractClues = async (searchQuery: string) => {
    setIsLoading(true);
    setError(null);
    setQuery(searchQuery);

    try {
      const response = await reconstructMemory({ query: searchQuery });
      const currentDomain = response.domain || 'movie';
      setDomain(currentDomain);
      setClues(response.extracted_clues || []);
      setStep(2);

      emit({
        type: 'search_submitted',
        timestamp: Date.now(),
        domain: currentDomain,
        payload: { query: searchQuery }
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to extract clues from memory synapses.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReconstruct = async (refinedClues: Clue[]) => {
    setClues(refinedClues);
    setIsLoading(true);
    setError(null);

    try {
      const response = await reconstructMemory({ clues: refinedClues, domain });
      const currentDomain = response.domain || domain;
      setDomain(currentDomain);
      
      if (response.clarification_needed && response.clarification_question) {
        setFollowUpQuestion(response.clarification_question);
      } else if (response.candidates && response.candidates.length > 0) {
        setCandidates(response.candidates);
        setStep(4);
      } else {
        setError("Reconstruction returned empty matching database records.");
      }

      emit({
        type: 'clues_refined',
        timestamp: Date.now(),
        domain: currentDomain,
        payload: { cluesCount: refinedClues.length }
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Reconstruction failed to assemble movie candidates.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowUpSubmit = async (answer: string) => {
    if (!followUpQuestion) return;
    setIsLoading(true);
    setError(null);

    try {
      const response = await reconstructMemory({
        clues,
        followUpQuestion,
        followUpAnswer: answer,
        domain
      });
      const currentDomain = response.domain || domain;
      setDomain(currentDomain);
      
      setFollowUpQuestion(null);

      if (response.candidates && response.candidates.length > 0) {
        setCandidates(response.candidates);
        setStep(4);
      } else {
        setError("Failed to resolve candidate target after follow-up details.");
      }

      emit({
        type: 'follow_up_answered',
        timestamp: Date.now(),
        domain: currentDomain,
        payload: { question: followUpQuestion, answer }
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Reconstruction failed during follow-up query evaluation.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    emit({
      type: 'session_reset',
      timestamp: Date.now(),
      domain,
      payload: {}
    });

    setStep(1);
    setQuery('');
    setClues([]);
    setCandidates([]);
    setFollowUpQuestion(null);
    setError(null);
    setDomain('movie');
  };

  const handleConfirmCandidate = (candidate: CandidateMovie) => {
    emit({
      type: 'candidate_confirmed',
      timestamp: Date.now(),
      domain: candidate.domain || domain,
      payload: { title: candidate.title, match: candidate.match }
    });
  };

  return {
    step,
    query,
    clues,
    candidates,
    followUpQuestion,
    domain,
    isLoading,
    error,
    handleExtractClues,
    handleReconstruct,
    handleFollowUpSubmit,
    handleReset,
    handleConfirmCandidate
  };
}
