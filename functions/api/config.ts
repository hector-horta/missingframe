export interface AppConfig {
  geminiApiKey?: string;
  groqApiKey?: string;
  openrouterApiKey?: string;
  movieProvider: 'gemini' | 'groq' | 'openrouter';
  tmdbApiKey?: string;
}

export function parseConfig(env: any): AppConfig {
  return {
    geminiApiKey: env?.GEMINI_API_KEY,
    groqApiKey: env?.GROQ_API_KEY,
    openrouterApiKey: env?.OPENROUTER_API_KEY,
    movieProvider: (env?.MOVIE_PROVIDER || 'gemini').toLowerCase() as any,
    tmdbApiKey: env?.TMDB_API_KEY,
  };
}
