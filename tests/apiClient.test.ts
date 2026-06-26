import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { reconstructMemory } from '../src/services/apiClient';
import type { ReconstructionRequest, ReconstructionResponse } from '../src/types';

describe('API Client Service', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('performs POST request to /api/reconstruct and returns parsed json data', async () => {
    const mockResponse: ReconstructionResponse = {
      analysis: 'Test analysis',
      confidence: 'high',
      clarification_needed: false,
      clarification_question: '',
      extracted_clues: [],
      candidates: [
        {
          title: 'Arrival',
          year: '2016',
          match: 0.95,
          why: 'Matches sci-fi criteria',
          possible_memory_errors: [],
          domain: 'movie'
        }
      ],
      domain: 'movie'
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const req: ReconstructionRequest = { query: 'Alien linguist sci-fi' };
    const result = await reconstructMemory(req);

    expect(fetch).toHaveBeenCalledWith('/api/reconstruct', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req)
    });
    expect(result).toEqual(mockResponse);
  });

  it('throws an error when api fetch fails', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => 'Internal Server Error'
    });

    const req: ReconstructionRequest = { query: 'fail' };
    await expect(reconstructMemory(req)).rejects.toThrow('Reconstruction failed: 500');
  });
});
