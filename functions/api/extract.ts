interface Env {
  GEMINI_API_KEY?: string;
}

interface RequestBody {
  query: string;
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

    const { query } = (await request.json()) as RequestBody;

    if (!query) {
      return new Response(
        JSON.stringify({ error: "Missing query description." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const systemInstruction = `You are the clue extractor for Missing Frame.
Your job is to dissect the user's raw movie description into key, isolated, semantic clues.
Human memory is fallible; they mix up scenes, confuse actors, or remember details that might be incorrect.
For each semantic detail (e.g. genre, setting, actor, plot point, bionic parts, visual elements):
- Extract it as a brief, clean description text (e.g., 'Sci-Fi', 'Bionic legs', 'Forest Whitaker', 'Road setting').
- Evaluate whether this clue seems standard/logical (status: 'valid') or if it is likely a confused or doubtful memory (status: 'doubtful'). A clue is 'doubtful' if it contradicts common film casting (e.g., matching a modern sci-fi detail to an actor who doesn't typically do that genre, or if the user explicitly says 'maybe it has X').`;

    const geminiPayload = {
      contents: [
        {
          role: "user",
          parts: [{ text: `Extract clues from memory query: "${query}"` }]
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
        JSON.stringify({ error: "Gemini API returned an empty response during clue extraction." }),
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
