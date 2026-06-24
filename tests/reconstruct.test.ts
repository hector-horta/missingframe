import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { reconstructMemory } from '../src/services/reconstruct';

describe('reconstructMemory service with unified JSON schema', () => {
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

  it('calls Cloudflare api/reconstruct successfully for Step 1 extraction', async () => {
    const mockUnifiedResponse = {
      analysis: "User remembers a sci-fi thriller featuring an actor resembling Forest Whitaker.",
      confidence: "low",
      clarification_needed: true,
      clarification_question: "Do you remember the ending happening in a desert, or in a rainy city?",
      extracted_clues: [
        { label: 'Sci-Fi', confidence: 0.95, status: 'confirmed' },
        { label: 'Forest Whitaker', confidence: 0.75, status: 'uncertain' }
      ],
      movies: []
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockUnifiedResponse
    });

    const result = await reconstructMemory({ query: 'sci-fi movie with forest whitaker' });
    
    expect(fetch).toHaveBeenCalledWith('/api/reconstruct', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ query: 'sci-fi movie with forest whitaker' })
    }));
    expect(result.extracted_clues).toHaveLength(2);
    expect(result.clarification_needed).toBe(true);
    expect(result.clarification_question).toBe("Do you remember the ending happening in a desert, or in a rainy city?");
  });

  it('calls Cloudflare api/reconstruct with refined clues and answers to yield movies list', async () => {
    const mockReconstructResponse = {
      analysis: "Synapses resolved. The movie is Se7en.",
      confidence: "high",
      clarification_needed: false,
      clarification_question: "",
      extracted_clues: [
        { label: 'Thriller', confidence: 0.95, status: 'confirmed' },
        { label: 'Brad Pitt', confidence: 0.95, status: 'confirmed' }
      ],
      movies: [
        {
          title: 'Se7en',
          year: '1995',
          match: 0.98,
          why: 'Brad Pitt plays a detective and there is a box at the end.',
          possible_memory_errors: ['Confused Brad Pitt with Tom Cruise initially']
        }
      ]
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockReconstructResponse
    });

    const result = await reconstructMemory({
      clues: [
        { label: 'Thriller', status: 'confirmed', confidence: 0.95 },
        { label: 'Brad Pitt', status: 'confirmed', confidence: 0.95 }
      ],
      followUpQuestion: "Was the ending in a desert?",
      followUpAnswer: "Yes, it was in a desert."
    });

    expect(fetch).toHaveBeenCalledWith('/api/reconstruct', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({
        clues: [
          { label: 'Thriller', status: 'confirmed', confidence: 0.95 },
          { label: 'Brad Pitt', status: 'confirmed', confidence: 0.95 }
        ],
        followUpQuestion: "Was the ending in a desert?",
        followUpAnswer: "Yes, it was in a desert."
      })
    }));
    expect(result.movies).toHaveLength(1);
    expect(result.movies?.[0].title).toBe('Se7en');
    expect(result.movies?.[0].possible_memory_errors).toContain('Confused Brad Pitt with Tom Cruise initially');
  });

  it('falls back to client-side direct Gemini calls using the unified schema when Cloudflare fails', async () => {
    localStorage.setItem('MF_GEMINI_API_KEY', 'local-gemini-key');
    (fetch as any).mockResolvedValueOnce({ ok: false, status: 500 }); // Cloudflare fails

    const mockGeminiResponse = {
      candidates: [
        {
          content: {
            parts: [
              {
                text: JSON.stringify({
                  analysis: "Direct client connection resolved.",
                  confidence: "high",
                  clarification_needed: false,
                  clarification_question: "",
                  extracted_clues: [{ label: 'Dreams', confidence: 0.9, status: 'confirmed' }],
                  movies: [{
                    title: 'Inception',
                    year: '2010',
                    match: 0.95,
                    why: 'Dreams inside dreams.',
                    possible_memory_errors: []
                  }]
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

    const result = await reconstructMemory({ query: 'spinning top dreams wife' });
    
    expect(result.movies?.[0].title).toBe('Inception');
    expect((fetch as any).mock.calls[1][0]).toContain('generativelanguage.googleapis.com');
  });
});
