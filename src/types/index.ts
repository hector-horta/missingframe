export type MediaDomain = 'movie' | 'tv' | 'anime' | 'book' | 'game' | 'song';

export const DEFAULT_DOMAIN: MediaDomain = 'movie';

export interface Clue {
  label: string;
  confidence: number;
  status: 'confirmed' | 'uncertain';
}

export interface CandidateMatch {
  title: string;
  year: string;
  match: number;
  why: string;
  possible_memory_errors: string[];
  domain: MediaDomain;
  imdbId?: string;
  tmdbId?: string;
  posterUrl?: string;
  backdropUrl?: string;
  externalUrls?: Record<string, string>;
}

// Keep CandidateMovie as an alias for backward compatibility
export type CandidateMovie = CandidateMatch;

export interface ReconstructionRequest {
  query?: string;
  clues?: Clue[];
  followUpQuestion?: string;
  followUpAnswer?: string;
  domain?: MediaDomain;
  inputChannel?: string;
}

export interface ReconstructionResponse {
  analysis: string;
  confidence: 'high' | 'medium' | 'low';
  clarification_needed: boolean;
  clarification_question: string;
  extracted_clues: Clue[];
  candidates: CandidateMatch[];
  domain: MediaDomain;
}
