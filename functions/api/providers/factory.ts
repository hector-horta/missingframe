import type { AppConfig } from '../config';
import type { MovieReconstructorProvider } from './base';
import { GeminiProvider } from './gemini';
import { GroqProvider } from './groq';
import { OpenRouterProvider } from './openrouter';

export function createProvider(config: AppConfig): MovieReconstructorProvider {
  switch (config.movieProvider) {
    case 'gemini':
      return new GeminiProvider(config.geminiApiKey);
    case 'groq':
      return new GroqProvider(config.groqApiKey);
    case 'openrouter':
      return new OpenRouterProvider(config.openrouterApiKey);
    default:
      throw new Error(`Unsupported provider: ${config.movieProvider}`);
  }
}
