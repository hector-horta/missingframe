import type { Clue, ReconstructionResponse, MediaDomain } from '../../../src/types';

export interface ReconstructionProvider {
  reconstruct(
    query?: string,
    clues?: Clue[],
    followUpQuestion?: string,
    followUpAnswer?: string,
    domain?: MediaDomain
  ): Promise<ReconstructionResponse>;
}
