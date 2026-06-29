import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NvidiaReconstructionProvider } from '../functions/api/providers/nvidia';
import type { Clue } from '../src/types';

describe('NvidiaReconstructionProvider', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('performs reconstruction by calling NVIDIA endpoint and returning parsed JSON response', async () => {
    const provider = new NvidiaReconstructionProvider('test-nvidia-key', 'test-model');

    const mockApiResponse = {
      choices: [
        {
          message: {
            role: 'assistant',
            content: JSON.stringify({
              analysis: 'Detected space film from 2014',
              confidence: 'high',
              clarification_needed: false,
              clarification_question: '',
              extracted_clues: [
                { label: 'space journey', confidence: 0.95, status: 'confirmed' }
              ],
              candidates: [
                {
                  title: 'Interstellar',
                  year: '2014',
                  match: 0.98,
                  why: 'Matches space and black hole theme',
                  possible_memory_errors: []
                }
              ]
            })
          }
        }
      ]
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse
    });

    const clues: Clue[] = [{ label: 'space journey', confidence: 0.95, status: 'confirmed' }];
    const result = await provider.reconstruct('a movie in space with black hole', clues);

    expect(fetch).toHaveBeenCalledWith('https://integrate.api.nvidia.com/v1/chat/completions', expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({
        'Authorization': 'Bearer test-nvidia-key'
      })
    }));

    expect(result.analysis).toBe('Detected space film from 2014');
    expect(result.candidates[0].title).toBe('Interstellar');
    expect(result.candidates[0].domain).toBe('movie'); // Verify candidate domain mapping
  });

  it('throws an error when NVIDIA api returns empty response', async () => {
    const provider = new NvidiaReconstructionProvider('test-nvidia-key');

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ choices: [] })
    });

    await expect(provider.reconstruct('some query')).rejects.toThrow();
  });
});
