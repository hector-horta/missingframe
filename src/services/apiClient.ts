import type { ReconstructionRequest, ReconstructionResponse } from '../types';

export async function reconstructMemory(req: ReconstructionRequest): Promise<ReconstructionResponse> {
  const response = await fetch('/api/reconstruct', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(req)
  });

  if (!response.ok) {
    throw new Error(`Reconstruction failed: ${response.status}`);
  }

  return (await response.json()) as ReconstructionResponse;
}
