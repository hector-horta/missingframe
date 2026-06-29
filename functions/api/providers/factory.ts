import type { AppConfig } from '../config';
import type { ReconstructionProvider } from './base';
import { GeminiProvider } from './gemini';
import { GroqProvider } from './groq';
import { OpenRouterProvider } from './openrouter';
import { NvidiaReconstructionProvider } from './nvidia';

export function createProvider(config: AppConfig): ReconstructionProvider {
  switch (config.movieProvider) {
    case 'gemini':
      return new GeminiProvider(config.geminiApiKey);
    case 'groq':
      return new GroqProvider(config.groqApiKey);
    case 'openrouter':
      return new OpenRouterProvider(config.openrouterApiKey);
    case 'nvidia':
      return new NvidiaReconstructionProvider(config.nvidiaApiKey, config.nvidiaModel);
    default:
      throw new Error(`Unsupported provider: ${config.movieProvider}`);
  }
}
