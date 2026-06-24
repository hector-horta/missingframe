interface Env {
  GEMINI_API_KEY?: string;
}

interface RequestBody {
  query: string;
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

    const { query, followUpQuestion, followUpAnswer } = (await request.json()) as RequestBody;

    if (!query) {
      return new Response(
        JSON.stringify({ error: "Missing memory query." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
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

    // Construct history message if there's a follow-up interaction
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
        JSON.stringify({ error: "Gemini API returned an empty response." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Return the structured JSON from Gemini directly
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
