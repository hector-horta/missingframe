export interface Alignment {
  memory: string;
  reality: string;
  status: 'match' | 'misremembered' | 'correction';
}

export interface ReconstructedMovie {
  title: string;
  year: string;
  director: string;
  confidence: number;
  summary: string;
  alignments: Alignment[];
  explanation: string;
  posterUrl?: string;
  backdropUrl?: string;
}

export interface ReconstructionResponse {
  needsFollowUp: boolean;
  followUpQuestion?: string;
  reconstructedMovie?: ReconstructedMovie;
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
 * Main reconstruction service handler
 */
export async function reconstructMemory(
  query: string,
  followUpQuestion?: string,
  followUpAnswer?: string
): Promise<ReconstructionResponse> {
  // 1. Try Cloudflare Pages Function endpoint
  try {
    const response = await fetch("/api/reconstruct", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, followUpQuestion, followUpAnswer })
    });

    if (response.ok) {
      const data = (await response.json()) as ReconstructionResponse;
      
      // If we got a movie, try fetching artwork
      if (data.reconstructedMovie) {
        const art = await fetchMovieArt(data.reconstructedMovie.title, data.reconstructedMovie.year);
        data.reconstructedMovie.posterUrl = art.posterUrl;
        data.reconstructedMovie.backdropUrl = art.backdropUrl;
      }
      return data;
    }

    // If 404 or other errors, we might be in local dev mode without wrangler, let's slide into client fallback
    console.warn("Cloudflare function endpoint unavailable, trying client-side fallback...");
  } catch (err) {
    console.warn("Failed to reach Cloudflare api function, using client fallback:", err);
  }

  // 2. Client-side fallback to Gemini REST API
  const localKey = getLocalGeminiKey();
  if (!localKey) {
    throw new Error(
      "Missing Gemini API key. Please configure it in your environment or the in-app settings (click the key icon)."
    );
  }

  const systemInstruction = `You are the Missing Frame Detective, an elite film investigator who helps users reconstruct forgotten movies from highly fragmented, incorrect, or mixed memories.
Human memory is fallible: people confuse actors, mix plots, remember emotions over events, and recall visual details rather than titles. Your job is to dissect their clues, correct their mistakes, and identify the single most likely movie.

Your behavior:
- Speak like a confident, minimal, intelligent detective.
- Determine if the user's description is too ambiguous to identify a primary movie candidate with at least 80% confidence.
- If it is too ambiguous AND this is the first iteration (meaning no followUpAnswer/followUpQuestion is provided), you MUST set "needsFollowUp" to true and formulate "followUpQuestion" as ONE single, highly intelligent, thematic question to narrow it down (e.g., 'Do you remember the ending happening in a desert under a baking sun, or in a rain-soaked city?'). Keep it cinematic, not robotic. Do not make it sound like Akinator or filling a form.
- If you can resolve the movie immediately, or if a follow-up answer is already provided, you MUST set "needsFollowUp" to false and populate "reconstructedMovie" fully.
- In "reconstructedMovie.alignments", map the user's memory fragments to the actual film facts, categorizing each alignment status as:
  - "match" (memory aligns with reality, e.g., "Brad Pitt plays a detective")
  - "misremembered" (user confused something, e.g., "thought it was Tom Cruise, but it was Brad Pitt")
  - "correction" (user mixed up scenes, plots, or movies, e.g., "the box ending is from Se7en, not Fight Club")
- Keep explanations and summaries concise but highly cinematic and confident.`;

  let promptContent = `User memory query: "${query}"`;
  if (followUpQuestion && followUpAnswer) {
    promptContent += `\nDetective follow-up question: "${followUpQuestion}"\nUser answer to follow-up: "${followUpAnswer}"\n\nBased on the original query and the follow-up answer, reconstruct the movie.`;
  }

  const geminiPayload = {
    contents: [
      {
        role: "user",
        parts: [{ text: promptContent }]
      }
    ],
    systemInstruction: {
      parts: [{ text: systemInstruction }]
    },
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          needsFollowUp: { type: "BOOLEAN" },
          followUpQuestion: { type: "STRING" },
          reconstructedMovie: {
            type: "OBJECT",
            properties: {
              title: { type: "STRING" },
              year: { type: "STRING" },
              director: { type: "STRING" },
              confidence: { type: "INTEGER" },
              summary: { type: "STRING" },
              alignments: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    memory: { type: "STRING" },
                    reality: { type: "STRING" },
                    status: { type: "STRING", enum: ["match", "misremembered", "correction"] }
                  },
                  required: ["memory", "reality", "status"]
                }
              },
              explanation: { type: "STRING" }
            },
            required: ["title", "year", "confidence", "summary", "alignments", "explanation"]
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
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${errorText}`);
  }

  const data = await response.json() as any;
  const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!responseText) {
    throw new Error("Gemini API returned an empty response.");
  }

  const result = JSON.parse(responseText) as ReconstructionResponse;
  
  if (result.reconstructedMovie) {
    const art = await fetchMovieArt(result.reconstructedMovie.title, result.reconstructedMovie.year);
    result.reconstructedMovie.posterUrl = art.posterUrl;
    result.reconstructedMovie.backdropUrl = art.backdropUrl;
  }

  return result;
}
