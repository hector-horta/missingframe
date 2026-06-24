export interface Clue {
  label: string;
  confidence: number;
  status: 'confirmed' | 'uncertain';
}

export interface CandidateMovie {
  title: string;
  year: string;
  match: number;
  why: string;
  possible_memory_errors: string[];
  imdbId?: string;
  tmdbId?: string;
  posterUrl?: string;
  backdropUrl?: string;
}

export interface ReconstructionResponse {
  analysis: string;
  confidence: 'high' | 'medium' | 'low';
  clarification_needed: boolean;
  clarification_question: string;
  extracted_clues: Clue[];
  movies: CandidateMovie[];
}

export interface ReconstructionRequest {
  query?: string;
  clues?: Clue[];
  followUpQuestion?: string;
  followUpAnswer?: string;
}
