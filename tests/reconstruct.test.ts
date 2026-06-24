import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { reconstructMemory, getLocalGeminiKey, getLocalTMDBKey } from '../src/services/reconstruct';

describe('reconstructMemory service', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('fetch', vi.fn());
    vi.stubGlobal('console', {
      warn: vi.fn(),
      error: vi.fn(),
      log: vi.fn()
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('retrieves from Cloudflare API when endpoint is successful', async () => {
    const mockResponse = {
      needsFollowUp: false,
      reconstructedMovie: {
        title: 'Se7en',
        year: '1995',
        director: 'David Fincher',
        confidence: 95,
        summary: 'Two detectives hunt a serial killer.',
        alignments: [],
        explanation: 'Matches sins and box.'
      }
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const result = await reconstructMemory('brad pitt box sins raining');
    
    expect(fetch).toHaveBeenCalledWith('/api/reconstruct', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ query: 'brad pitt box sins raining' })
    }));
    expect(result.reconstructedMovie?.title).toBe('Se7en');
  });

  it('falls back to client-side Gemini call when Cloudflare API fails and local key exists', async () => {
    localStorage.setItem('MF_GEMINI_API_KEY', 'local-gemini-key-123');

    // First fetch: /api/reconstruct fails (e.g. 404)
    (fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 404
    });

    // Second fetch: Client fallback direct to Gemini API
    const mockGeminiResponse = {
      candidates: [
        {
          content: {
            parts: [
              {
                text: JSON.stringify({
                  needsFollowUp: false,
                  reconstructedMovie: {
                    title: 'Inception',
                    year: '2010',
                    director: 'Christopher Nolan',
                    confidence: 90,
                    summary: 'Dreams within dreams.',
                    alignments: [],
                    explanation: 'Correct top and wife.'
                  }
                })
              }
            ]
          }
        }
      ]
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockGeminiResponse
    });

    const result = await reconstructMemory('dreams top leo wife ghost');
    
    expect(fetch).toHaveBeenCalledTimes(2);
    // Verified direct gemini link was called
    expect((fetch as any).mock.calls[1][0]).toContain('generativelanguage.googleapis.com');
    expect((fetch as any).mock.calls[1][0]).toContain('key=local-gemini-key-123');
    expect(result.reconstructedMovie?.title).toBe('Inception');
  });

  it('throws error when Cloudflare API fails and no local API key is configured', async () => {
    // Cloudflare api throws error
    (fetch as any).mockRejectedValueOnce(new Error('Network offline'));

    await expect(reconstructMemory('test query')).rejects.toThrow(/Missing Gemini API key/);
  });
});
