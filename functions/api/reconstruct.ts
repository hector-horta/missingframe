interface Env {
  GEMINI_API_KEY?: string;
}

interface Clue {
  label: string;
  confidence: number;
  status: 'confirmed' | 'uncertain';
}

interface Movie {
  title: string;
  year: string;
  match: number;
  why: string;
  possible_memory_errors: string[];
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
    const apiKey = env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY is not configured on Cloudflare." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const { query, clues, followUpQuestion, followUpAnswer } = (await request.json()) as RequestBody;

    if (!query && (!clues || clues.length === 0)) {
      return new Response(
        JSON.stringify({ error: "Missing query description or clues." }),
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
    if (query) {
      promptContent = `User memory raw query description: "${query}"`;
    } else if (clues) {
      promptContent = `Active clues extracted from memory:\n` + 
        clues.map((c) => `- ${c.label} (status: ${c.status})`).join('\n');
    }

    if (followUpQuestion && followUpAnswer) {
      promptContent += `\n\nDetective Clarification Question: "${followUpQuestion}"\nUser Answer: "${followUpAnswer}"\n\nBased on these combined clues, reconstruct the final ranked candidates.`;
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
