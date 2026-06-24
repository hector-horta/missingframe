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

    const systemInstruction = `You are Movie Detective. You are an expert in cinema and human memory.
Your job is NOT to search for movies. Your job is to extract clues from imperfect memories to assist in later reconstruction.
Assume every memory description may contain mistakes (confusing actors, mixing scenes, remembering locations incorrectly, remembering visual feelings instead of plot, inventing connections unconsciously). Never trust any single remembered fact.

Your task:
- Dissect the user's raw movie description into key, isolated, semantic clues.
- For each semantic clue (e.g. genre, setting, actor, plot point, bionic parts, visual elements), extract it as a brief, clean description text.
- Evaluate whether this clue seems standard/logical (status: 'valid') or if it is likely a confused, contradictory, or doubtful memory (status: 'doubtful'). A clue is 'doubtful' if it contradicts common film casting (e.g., matching a modern sci-fi detail to an actor who doesn't typically do that genre, or if actor confusion is likely based on visually/culturally similar actors).`;

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
