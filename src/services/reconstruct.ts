export interface Clue {
  label: string;
  confidence: number;
  status: 'confirmed' | 'uncertain';
}

export interface CandidateMovie {
  title: string;
  year: string;
  match: number;
  why: string;
  possible_memory_errors: string[];
  imdbId?: string;
  tmdbId?: string;
  posterUrl?: string;
  backdropUrl?: string;
}

export interface ReconstructionResponse {
  analysis: string;
  confidence: 'high' | 'medium' | 'low';
  clarification_needed: boolean;
  clarification_question: string;
  extracted_clues: Clue[];
  movies: CandidateMovie[];
}

export interface ReconstructionRequest {
  query?: string;
  clues?: Clue[];
  followUpQuestion?: string;
  followUpAnswer?: string;
}

// Check local storage for dynamic API keys (set in settings modal)
export const getLocalGeminiKey = (): string => {
  return localStorage.getItem("MF_GEMINI_API_KEY") || import.meta.env.VITE_GEMINI_API_KEY || "";
};

export const getLocalTMDBKey = (): string => {
  return localStorage.getItem("MF_TMDB_API_KEY") || import.meta.env.VITE_TMDB_API_KEY || "";
};

/**
 * Searches TMDB for movie poster and backdrop if API key is present
 */
export async function fetchMovieArt(title: string, year?: string): Promise<{ posterUrl?: string; backdropUrl?: string; imdbId?: string; tmdbId?: string }> {
  const tmdbKey = getLocalTMDBKey();
  if (!tmdbKey) return {};

  try {
    const yearParam = year ? `&year=${year.trim()}` : "";
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${tmdbKey}&query=${encodeURIComponent(title)}${yearParam}`;
    const response = await fetch(url);
    if (!response.ok) return {};

    const data = await response.json();
    const movie = data.results?.[0];
    if (movie) {
      // Get detailed movie details to obtain IMDb ID
      let imdbId = undefined;
      try {
        const detailUrl = `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${tmdbKey}`;
        const detailRes = await fetch(detailUrl);
        if (detailRes.ok) {
          const detailData = await detailRes.json();
          imdbId = detailData.imdb_id;
        }
      } catch (err) {
        console.error("Failed to fetch TMDB details for IMDb ID:", err);
      }

      return {
        posterUrl: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : undefined,
        backdropUrl: movie.backdrop_path ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}` : undefined,
        imdbId,
        tmdbId: String(movie.id)
      };
    }
  } catch (error) {
    console.error("Failed to fetch TMDB movie art:", error);
  }
  return {};
}

/**
 * Core reconstruction query service using the unified JSON schema
 */
export async function reconstructMemory(req: ReconstructionRequest): Promise<ReconstructionResponse> {
  let result: ReconstructionResponse;

  // 1. Try Cloudflare Pages Function
  try {
    const response = await fetch("/api/reconstruct", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req)
    });

    if (response.ok) {
      result = (await response.json()) as ReconstructionResponse;
      return await populateMoviesArt(result);
    }
    console.warn("Cloudflare endpoint unavailable, trying client fallback...");
  } catch (err) {
    console.warn("Failed to reach Cloudflare api, using client fallback:", err);
  }

  // 2. Local Fallback direct to Gemini
  const localKey = getLocalGeminiKey();
  if (!localKey) {
    throw new Error(
      "Missing Gemini API key. Please configure it in your environment or in-app settings."
    );
  }

  const systemInstruction = `You are Movie Detective. You are an expert in cinema and human memory.
Your job is NOT to search for movies. Your job is to reconstruct imperfect memories.
Assume every memory may contain mistakes (confusing actors, mixing scenes, remembering locations incorrectly, remembering visual feelings instead of plot, inventing connections unconsciously). Never trust any single remembered fact.

Your method:
1. Extract reliable clues.
2. Detect contradictions.
3. Infer probable corrections (e.g. if actor confusion is likely, consider visually or culturally similar actors like Forest Whitaker -> Laurence Fishburne -> Ving Rhames).
4. Search for movies matching both remembered facts and corrected facts.

Your behavior:
- Speak like a confident, minimal, intelligent detective.
- Determine if the provided description/clues are sufficient to identify the movie candidates with high confidence.
- Only ask one follow-up question when it significantly increases confidence. Never interrogate the user.
- If confidence is low (meaning multiple matches are possible, or clues are highly ambiguous/contradictory) AND this is the first iteration (meaning no followUpAnswer is provided), set "clarification_needed" to true and formulate "clarification_question" as ONE single, highly intelligent, thematic question to narrow it down (e.g., 'Could the actor have been Laurence Fishburne instead?'). Maximize information gain. Keep it cinematic and concise.
- If you can resolve the movies immediately, or if the user has answered the follow-up, set "clarification_needed" to false and return a list of ranked "movies" (up to 3).
- For each movie candidate, populate:
  - "title": Movie title.
  - "year": Release year.
  - "match": Confidence match factor between 0.0 and 1.0 (float).
  - "why": Clear reasoning explaining why it matches and any inferred corrections.
  - "possible_memory_errors": Array of strings representing details the user likely mixed up (e.g. confused actor, mixed ending).
- Populate the "extracted_clues" array in all responses. Map each clue item's status to 'confirmed' (corresponds to valid memories) or 'uncertain' (corresponds to suspected/confused memories) with a confidence rating (float between 0.0 and 1.0).
- Always respond using the requested JSON schema. Never invent fake certainty. Be concise.`;

  let promptContent = "";
  if (req.query) {
    promptContent = `User memory raw query description: "${req.query}"`;
  } else if (req.clues) {
    promptContent = `Active clues extracted from memory:\n` + 
      req.clues.map((c) => `- ${c.label} (status: ${c.status})`).join('\n');
  }

  if (req.followUpQuestion && req.followUpAnswer) {
    promptContent += `\n\nDetective Clarification Question: "${req.followUpQuestion}"\nUser Answer: "${req.followUpAnswer}"\n\nBased on these combined clues, reconstruct the final ranked candidates.`;
  }

  const geminiPayload = {
    contents: [{ role: "user", parts: [{ text: promptContent }] }],
    systemInstruction: { parts: [{ text: systemInstruction }] },
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          analysis: { type: "STRING" },
          confidence: { type: "STRING", enum: ["high", "medium", "low"] },
          clarification_needed: { type: "BOOLEAN" },
          clarification_question: { type: "STRING" },
          extracted_clues: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                label: { type: "STRING" },
                confidence: { type: "NUMBER" },
                status: { type: "STRING", enum: ["confirmed", "uncertain"] }
              },
              required: ["label", "confidence", "status"]
            }
          },
          movies: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                title: { type: "STRING" },
                year: { type: "STRING" },
                match: { type: "NUMBER" },
                why: { type: "STRING" },
                possible_memory_errors: {
                  type: "ARRAY",
                  items: { type: "STRING" }
                }
              },
              required: ["title", "year", "match", "why", "possible_memory_errors"]
            }
          }
        },
        required: ["analysis", "confidence", "clarification_needed", "extracted_clues", "movies"]
      }
    }
  };

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${localKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(geminiPayload)
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini reconstruct error: ${errText}`);
  }

  const data = await response.json() as any;
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty reconstruction response from Gemini.");

  result = JSON.parse(text) as ReconstructionResponse;
  return await populateMoviesArt(result);
}

/**
 * Fetch artwork for all movie candidates
 */
async function populateMoviesArt(res: ReconstructionResponse): Promise<ReconstructionResponse> {
  if (res.movies && res.movies.length > 0) {
    const promises = res.movies.map(async (movie) => {
      const art = await fetchMovieArt(movie.title, movie.year);
      movie.posterUrl = art.posterUrl;
      movie.backdropUrl = art.backdropUrl;
      
      // If TMDB provided detailed IDs and they aren't returned by Gemini, append them
      if (art.imdbId) movie.imdbId = art.imdbId;
      if (art.tmdbId) movie.tmdbId = art.tmdbId;
      
      return movie;
    });
    res.movies = await Promise.all(promises);
  }
  return res;
}
