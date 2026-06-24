interface Env {
  GEMINI_API_KEY?: string;
}

interface Clue {
  text: string;
  status: 'valid' | 'doubtful';
}

interface RequestBody {
  clues: Clue[];
  followUpQuestion?: string;
  followUpAnswer?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context;
    const apiKey = env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY is not configured on Cloudflare." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const { clues, followUpQuestion, followUpAnswer } = (await request.json()) as RequestBody;

    if (!clues || clues.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing clues list." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
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
- Only ask one follow-up question when it significantly increases confidence. Never interrogate the user.
- If confidence is low (meaning multiple matches are possible, or clues are highly ambiguous/contradictory) AND this is the first iteration (meaning no followUpAnswer is provided), set "needsFollowUp" to true and formulate "followUpQuestion" as ONE single, highly intelligent, thematic question to narrow it down (e.g., 'Could the actor have been Laurence Fishburne instead?'). Maximize information gain. Keep it cinematic and concise.
- If you can resolve the movies immediately, or if the user has answered the follow-up, set "needsFollowUp" to false and return a list of ranked "candidates" (up to 3).
- For each movie candidate, populate the following fields:
  - "title": Movie title.
  - "year": Release year.
  - "director": Director's name.
  - "confidence": Your confidence percentage (integer).
  - "whyItMatches": Clear reasons why it matches the user's clues.
  - "whyItMightNotMatch": Any contradictions, mismatches, or corrected memory facts (e.g., explaining who the actual actor was or what scene was merged).
  - "imdbId": The actual IMDb ID for this movie (e.g., 'tt2543164').
  - "tmdbId": The actual TMDb ID for this movie (e.g., '329865').
- Never look like a chatbot; output only the requested JSON data structure.
- Never invent fake certainty. Be concise.`;

    let promptContent = `Active clues extracted from memory:\n` + 
      clues.map((c) => `- ${c.text} (status: ${c.status})`).join('\n');
      
    if (followUpQuestion && followUpAnswer) {
      promptContent += `\n\nDetective Inquiry: "${followUpQuestion}"\nUser Answer: "${followUpAnswer}"\n\nBased on these details, reconstruct the final ranked candidates.`;
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
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(geminiPayload)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(
        JSON.stringify({ error: `Gemini API responded with error: ${errorText}` }),
        { status: response.status, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await response.json() as any;
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      return new Response(
        JSON.stringify({ error: "Gemini API returned an empty response during reconstruction." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(responseText, {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || "An internal error occurred." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
