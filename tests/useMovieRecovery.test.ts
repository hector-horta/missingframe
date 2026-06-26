import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMovieRecovery } from '../src/hooks/useMovieRecovery';
import { AIManager } from '../src/lib/ai/client';

describe('useMovieRecovery Hook', () => {
  it('initializes with default state', () => {
    const { result } = renderHook(() => useMovieRecovery());
    
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.result).toBe(null);
  });

  it('handles successful movie recovery and parses JSON', async () => {
    const mockResponse = {
      ruido_vs_anclas: {
        anclas: ['actor green ogre', 'saves princess'],
        ruido: ['swamp lives in']
      },
      analysis: 'ogre saved princess in swamp',
      confidence: 'high',
      clarification_needed: false,
      clarification_question: '',
      extracted_clues: [],
      candidates: [
        {
          title: 'Shrek',
          year: '2001',
          match: 0.99,
          why: 'Matches perfectly',
          possible_memory_errors: []
        }
      ]
    };

    const mockAiManager = {
      complete: vi.fn().mockResolvedValue(JSON.stringify(mockResponse))
    } as unknown as AIManager;

    const { result } = renderHook(() => useMovieRecovery(mockAiManager));

    await act(async () => {
      await result.current.recoverMovie('a green ogre saves a princess');
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.result).toEqual(mockResponse);
    expect(mockAiManager.complete).toHaveBeenCalled();
  });

  it('handles generic error and notifies user', async () => {
    const mockAiManager = {
      complete: vi.fn().mockRejectedValue(new Error('API failure'))
    } as unknown as AIManager;

    const { result } = renderHook(() => useMovieRecovery(mockAiManager));

    await act(async () => {
      await expect(result.current.recoverMovie('green ogre')).rejects.toThrow('API failure');
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.result).toBe(null);
    expect(result.current.error).toBe('API failure');
  });

  it('handles 429 rate limit error and notifies user elegantly', async () => {
    const mockAiManager = {
      complete: vi.fn().mockRejectedValue(new Error('Nvidia API failed: 429 - Too Many Requests'))
    } as unknown as AIManager;

    const { result } = renderHook(() => useMovieRecovery(mockAiManager));

    await act(async () => {
      await expect(result.current.recoverMovie('green ogre')).rejects.toThrow(
        'Nuestros detectives están ocupados, intenta en un minuto.'
      );
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.result).toBe(null);
    expect(result.current.error).toBe('Nuestros detectives están ocupados, intenta en un minuto.');
  });
});
