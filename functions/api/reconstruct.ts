import { parseConfig } from './config';
import { createProvider } from './providers/factory';
import { populateMoviesArtServer } from './tmdb';
import { Clue } from '../../src/types';

interface Env {
  GEMINI_API_KEY?: string;
  GROQ_API_KEY?: string;
  OPENROUTER_API_KEY?: string;
  MOVIE_PROVIDER?: string;
  TMDB_API_KEY?: string;
}

interface RequestBody {
  query?: string;
  clues?: Clue[];
  followUpQuestion?: string;
  followUpAnswer?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context;
    const config = parseConfig(env);

    // Read body parameters
    const body = (await request.json()) as RequestBody;
    const { query, clues, followUpQuestion, followUpAnswer } = body;

    if (!query && (!clues || clues.length === 0)) {
      return new Response(
        JSON.stringify({ error: "Missing query description or clues." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Resolve provider via Factory
    const provider = createProvider(config);

    // Perform reconstruction
    const result = await provider.reconstruct(
      query,
      clues,
      followUpQuestion,
      followUpAnswer
    );

    // Populate movie poster/backdrop details securely on the server
    if (result.movies && result.movies.length > 0) {
      result.movies = await populateMoviesArtServer(result.movies, config.tmdbApiKey);
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error("Reconstruction endpoint failed:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An internal reconstruction error occurred." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
