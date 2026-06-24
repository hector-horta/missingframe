import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { extractClues, reconstructFromClues } from '../src/services/reconstruct';

describe('extractClues service', () => {
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

  it('calls Cloudflare api/extract successfully', async () => {
    const mockExtractResponse = {
      clues: [
        { text: 'Sci-Fi', status: 'valid' },
        { text: 'Forest Whitaker', status: 'doubtful' }
      ]
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockExtractResponse
    });

    const result = await extractClues('sci-fi forest whitaker');
    
    expect(fetch).toHaveBeenCalledWith('/api/extract', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ query: 'sci-fi forest whitaker' })
    }));
    expect(result.clues).toHaveLength(2);
    expect(result.clues[0].text).toBe('Sci-Fi');
    expect(result.clues[1].status).toBe('doubtful');
  });

  it('falls back to direct Gemini call for extraction when Cloudflare fails', async () => {
    localStorage.setItem('MF_GEMINI_API_KEY', 'my-gemini-key');
    (fetch as any).mockResolvedValueOnce({ ok: false, status: 404 }); // Cloudflare 404

    const mockGeminiResponse = {
      candidates: [
        {
          content: {
            parts: [
              {
                text: JSON.stringify({
                  clues: [
                    { text: 'Time travel', status: 'valid' }
                  ]
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

    const result = await extractClues('time travel movie');
    expect(result.clues[0].text).toBe('Time travel');
    expect((fetch as any).mock.calls[1][0]).toContain('generativelanguage.googleapis.com');
  });
});

describe('reconstructFromClues service', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('calls Cloudflare api/reconstruct with clues', async () => {
    const mockReconstructResponse = {
      needsFollowUp: false,
      candidates: [
        {
          title: 'Arrival',
          year: '2016',
          director: 'Denis Villeneuve',
          confidence: 95,
          whyItMatches: 'Contains bionic legs and aliens.',
          whyItMightNotMatch: 'No Forest Whitaker is in the film.',
          imdbId: 'tt2543164',
          tmdbId: '329865'
        }
      ]
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockReconstructResponse
    });

    const result = await reconstructFromClues([
      { text: 'Sci-Fi', status: 'valid' },
      { text: 'Bionic legs', status: 'valid' }
    ]);

    expect(fetch).toHaveBeenCalledWith('/api/reconstruct', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({
        clues: [
          { text: 'Sci-Fi', status: 'valid' },
          { text: 'Bionic legs', status: 'valid' }
        ]
      })
    }));
    expect(result.candidates).toHaveLength(1);
    expect(result.candidates?.[0].title).toBe('Arrival');
    expect(result.candidates?.[0].imdbId).toBe('tt2543164');
  });

  it('handles low confidence follow-up responses', async () => {
    const mockReconstructResponse = {
      needsFollowUp: true,
      followUpQuestion: 'Could the actor have been Laurence Fishburne instead?'
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockReconstructResponse
    });

    const result = await reconstructFromClues([{ text: 'Matrix-like', status: 'valid' }]);
    
    expect(result.needsFollowUp).toBe(true);
    expect(result.followUpQuestion).toBe('Could the actor have been Laurence Fishburne instead?');
  });
});
