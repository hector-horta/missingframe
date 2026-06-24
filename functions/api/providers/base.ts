import type { Clue, ReconstructionResponse } from '../../../src/types';

export interface MovieReconstructorProvider {
  reconstruct(
    query?: string,
    clues?: Clue[],
    followUpQuestion?: string,
    followUpAnswer?: string
  ): Promise<ReconstructionResponse>;
}
