import { describe, it, expect } from 'vitest';
import { parseConfig } from '../functions/api/config';
import { createProvider } from '../functions/api/providers/factory';
import { GeminiProvider } from '../functions/api/providers/gemini';
import { GroqProvider } from '../functions/api/providers/groq';
import { OpenRouterProvider } from '../functions/api/providers/openrouter';

describe('Provider Factory', () => {
  it('instantiates Gemini provider when configuration is gemini', () => {
    const config = parseConfig({
      GEMINI_API_KEY: 'test-gemini-key',
      MOVIE_PROVIDER: 'gemini'
    });
    const provider = createProvider(config);
    expect(provider).toBeInstanceOf(GeminiProvider);
  });

  it('instantiates Groq provider when configuration is groq', () => {
    const config = parseConfig({
      GROQ_API_KEY: 'test-groq-key',
      MOVIE_PROVIDER: 'groq'
    });
    const provider = createProvider(config);
    expect(provider).toBeInstanceOf(GroqProvider);
  });

  it('instantiates OpenRouter provider when configuration is openrouter', () => {
    const config = parseConfig({
      OPENROUTER_API_KEY: 'test-openrouter-key',
      MOVIE_PROVIDER: 'openrouter'
    });
    const provider = createProvider(config);
    expect(provider).toBeInstanceOf(OpenRouterProvider);
  });

  it('throws an error for unsupported provider configuration', () => {
    const config = parseConfig({
      MOVIE_PROVIDER: 'unsupported'
    });
    expect(() => createProvider(config)).toThrow('Unsupported provider');
  });
});
