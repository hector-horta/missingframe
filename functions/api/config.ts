export interface AppConfig {
  geminiApiKey?: string;
  groqApiKey?: string;
  openrouterApiKey?: string;
  nvidiaApiKey?: string;
  nvidiaModel?: string;
  movieProvider: 'gemini' | 'groq' | 'openrouter' | 'nvidia';
  tmdbApiKey?: string;
}

export function parseConfig(env: any): AppConfig {
  return {
    geminiApiKey: env?.GEMINI_API_KEY,
    groqApiKey: env?.GROQ_API_KEY,
    openrouterApiKey: env?.OPENROUTER_API_KEY,
    nvidiaApiKey: env?.NVIDIA_API_KEY,
    nvidiaModel: env?.NVIDIA_MODEL || env?.VITE_ACTIVE_MODEL,
    movieProvider: (env?.MOVIE_PROVIDER || 'gemini').toLowerCase() as any,
    tmdbApiKey: env?.TMDB_API_KEY,
  };
}
