/// <reference types="@cloudflare/workers-types" />
import { parseConfig } from './config';
import { createProvider } from './providers/factory';
import { getResolver } from './resolvers/registry';
import type { Clue, MediaDomain } from '../../src/types';

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
  domain?: MediaDomain;
  inputChannel?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context;
    const config = parseConfig(env);

    // Read body parameters
    const body = (await request.json()) as RequestBody;
    const { query, clues, followUpQuestion, followUpAnswer, domain = 'movie', inputChannel } = body;

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
      followUpAnswer,
      domain
    );

    // Populate candidate details securely on the server using resolver registry
    const resolver = getResolver(domain, { tmdb: config.tmdbApiKey });
    if (resolver && result.candidates && result.candidates.length > 0) {
      result.candidates = await Promise.all(
        result.candidates.map((candidate) => resolver.resolve(candidate))
      );
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
