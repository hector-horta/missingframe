import { describe, it, expect, vi } from 'vitest';
import { buildSystemInstruction } from '../functions/api/promptBuilder';
import { getResolver } from '../functions/api/resolvers/registry';
import { TmdbResolver } from '../functions/api/resolvers/tmdbResolver';
import * as eventBus from '../src/analytics/eventBus';
import type { AnalyticsEvent } from '../src/analytics/types';

describe('Extensibility Architecture', () => {
  describe('Domain System Instructions', () => {
    it('returns Movie Detective instruction for movie domain', () => {
      const instr = buildSystemInstruction('movie');
      expect(instr).toContain('You are the Detective behind Missing Frame');
      expect(instr).toContain('reconstruct imperfect human memories');
    });

    it('returns placeholder instructions for tv, anime, book, game, song domains', () => {
      expect(buildSystemInstruction('tv')).toContain('TV Show');
      expect(buildSystemInstruction('anime')).toContain('Anime');
      expect(buildSystemInstruction('book')).toContain('Book');
      expect(buildSystemInstruction('game')).toContain('Video Game');
      expect(buildSystemInstruction('song')).toContain('Song');
    });

    it('throws error for invalid domain', () => {
      expect(() => buildSystemInstruction('invalid_domain' as any)).toThrow();
    });
  });

  describe('Metadata Resolver Registry', () => {
    it('returns TmdbResolver for movie domain when api key is provided', () => {
      const resolver = getResolver('movie', { tmdb: 'api-key-123' });
      expect(resolver).toBeInstanceOf(TmdbResolver);
    });

    it('returns null for domains without registered resolvers', () => {
      const resolver = getResolver('book', { tmdb: 'api-key-123' });
      expect(resolver).toBeNull();
    });
  });

  describe('Analytics Event Bus', () => {
    it('notifies registered subscribers of emitted events', () => {
      const subscriber = {
        handle: vi.fn()
      };

      eventBus.subscribe(subscriber);

      const event: AnalyticsEvent = {
        type: 'search_submitted',
        timestamp: Date.now(),
        domain: 'movie',
        payload: { query: 'test query' }
      };

      eventBus.emit(event);

      expect(subscriber.handle).toHaveBeenCalledWith(event);
    });
  });
});
