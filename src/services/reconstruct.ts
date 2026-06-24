export interface Clue {
  text: string;
  status: 'valid' | 'doubtful';
}

export interface CandidateMovie {
  title: string;
  year: string;
  director: string;
  confidence: number;
  whyItMatches: string;
  whyItMightNotMatch: string;
  imdbId: string;
  tmdbId: string;
  posterUrl?: string;
  backdropUrl?: string;
}

export interface ExtractResponse {
  clues: Clue[];
}

export interface ReconstructionResponse {
  needsFollowUp: boolean;
  followUpQuestion?: string;
  candidates?: CandidateMovie[];
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
export async function fetchMovieArt(title: string, year?: string): Promise<{ posterUrl?: string; backdropUrl?: string }> {
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
      return {
        posterUrl: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : undefined,
        backdropUrl: movie.backdrop_path ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}` : undefined
      };
    }
  } catch (error) {
    console.error("Failed to fetch TMDB movie art:", error);
  }
  return {};
}

/**
 * Calls `/api/extract` or falls back to client Gemini API to isolate clues.
 */
export async function extractClues(query: string): Promise<ExtractResponse> {
  // 1. Try Cloudflare Pages Function
  try {
    const response = await fetch("/api/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query })
    });

    if (response.ok) {
      return (await response.json()) as ExtractResponse;
    }
    console.warn("Cloudflare extract endpoint unavailable, using client fallback...");
  } catch (err) {
    console.warn("Failed to reach Cloudflare extract, using client fallback:", err);
  }

  // 2. Local Fallback direct to Gemini
  const localKey = getLocalGeminiKey();
  if (!localKey) {
    throw new Error(
      "Missing Gemini API key. Please configure it in your environment or in-app settings."
    );
  }

  const systemInstruction = `You are the clue extractor for Missing Frame.
Your job is to dissect the user's raw movie description into key, isolated, semantic clues.
Human memory is fallible; they mix up scenes, confuse actors, or remember details that might be incorrect.
For each semantic detail (e.g. genre, setting, actor, plot point, bionic parts, visual elements):
- Extract it as a brief, clean description text (e.g., 'Sci-Fi', 'Bionic legs', 'Forest Whitaker', 'Road setting').
- Evaluate whether this clue seems standard/logical (status: 'valid') or if it is likely a confused or doubtful memory (status: 'doubtful'). A clue is 'doubtful' if it contradicts common film casting (e.g., matching a modern sci-fi detail to an actor who doesn't typically do that genre, or if the user explicitly says 'maybe it has X').`;

  const geminiPayload = {
    contents: [{ role: "user", parts: [{ text: `Extract clues from memory query: "${query}"` }] }],
    systemInstruction: { parts: [{ text: systemInstruction }] },
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          clues: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                text: { type: "STRING" },
                status: { type: "STRING", enum: ["valid", "doubtful"] }
              },
              required: ["text", "status"]
            }
          }
        },
        required: ["clues"]
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
    throw new Error(`Gemini extract error: ${errText}`);
  }

  const data = await response.json() as any;
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty extraction response from Gemini.");

  return JSON.parse(text) as ExtractResponse;
}

/**
 * Calls `/api/reconstruct` or falls back to client Gemini API to get ranked candidates.
 */
export async function reconstructFromClues(
  clues: Clue[],
  followUpQuestion?: string,
  followUpAnswer?: string
): Promise<ReconstructionResponse> {
  let result: ReconstructionResponse;

  // 1. Try Cloudflare Pages Function
  try {
    const response = await fetch("/api/reconstruct", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clues, followUpQuestion, followUpAnswer })
    });

    if (response.ok) {
      result = (await response.json()) as ReconstructionResponse;
      return await populateCandidatesArt(result);
    }
    console.warn("Cloudflare reconstruct endpoint unavailable, using client fallback...");
  } catch (err) {
    console.warn("Failed to reach Cloudflare reconstruct, using client fallback:", err);
  }

  // 2. Local Fallback direct to Gemini
  const localKey = getLocalGeminiKey();
  if (!localKey) {
    throw new Error(
      "Missing Gemini API key. Please configure it in your environment or in-app settings."
    );
  }

  const systemInstruction = `You are the Missing Frame Detective.
Your job is to evaluate a list of user-provided clues (marked as valid or doubtful) and reconstruct the most likely candidate movies.
Your behavior:
- Speak like a confident, minimal, intelligent detective.
- Determine if the provided clues are sufficient to identify the primary candidate movie with high confidence (e.g. >= 80%).
- If the confidence is low (meaning multiple matches are possible, or the clues are highly ambiguous/contradictory) AND this is the first iteration (meaning no followUpAnswer is provided), set "needsFollowUp" to true and formulate "followUpQuestion" as ONE single, highly intelligent, thematic question to narrow it down (e.g., 'Could the actor have been Laurence Fishburne instead?'). Maximize information gain. Keep it cinematic and concise.
- If you can resolve the movies immediately, or if the user has answered the follow-up, set "needsFollowUp" to false and return a list of ranked "candidates" (up to 3).
- For each movie candidate, populate the following fields:
  - "title": Movie title.
  - "year": Release year.
  - "director": Director's name.
  - "confidence": Your confidence percentage (integer).
  - "whyItMatches": Clear reasons why it matches the user's clues.
  - "whyItMightNotMatch": Any contradictions or details that do not match.
  - "imdbId": The actual IMDb ID for this movie (e.g., 'tt2543164').
  - "tmdbId": The actual TMDb ID for this movie (e.g., '329865').
- Never look like a chatbot; output only the requested JSON data structure.`;

  let promptContent = `Active clues extracted from memory:\n` + 
    clues.map((c) => `- ${c.text} (status: ${c.status})`).join('\n');
    
  if (followUpQuestion && followUpAnswer) {
    promptContent += `\n\nDetective Inquiry: "${followUpQuestion}"\nUser Answer: "${followUpAnswer}"\n\nBased on these details, reconstruct the final ranked candidates.`;
  }

  const geminiPayload = {
    contents: [{ role: "user", parts: [{ text: promptContent }] }],
    systemInstruction: { parts: [{ text: systemInstruction }] },
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          needsFollowUp: { type: "BOOLEAN" },
          followUpQuestion: { type: "STRING" },
          candidates: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                title: { type: "STRING" },
                year: { type: "STRING" },
                director: { type: "STRING" },
                confidence: { type: "INTEGER" },
                whyItMatches: { type: "STRING" },
                whyItMightNotMatch: { type: "STRING" },
                imdbId: { type: "STRING" },
                tmdbId: { type: "STRING" }
              },
              required: ["title", "year", "director", "confidence", "whyItMatches", "whyItMightNotMatch", "imdbId", "tmdbId"]
            }
          }
        },
        required: ["needsFollowUp"]
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
  return await populateCandidatesArt(result);
}

/**
 * Fetch artwork for all movie candidates
 */
async function populateCandidatesArt(res: ReconstructionResponse): Promise<ReconstructionResponse> {
  if (res.candidates && res.candidates.length > 0) {
    const promises = res.candidates.map(async (candidate) => {
      const art = await fetchMovieArt(candidate.title, candidate.year);
      candidate.posterUrl = art.posterUrl;
      candidate.backdropUrl = art.backdropUrl;
      return candidate;
    });
    res.candidates = await Promise.all(promises);
  }
  return res;
}
