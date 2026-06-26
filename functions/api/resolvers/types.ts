import type { CandidateMatch } from '../../../src/types';

export interface MetadataResolver {
  resolve(candidate: CandidateMatch): Promise<CandidateMatch>;
}
