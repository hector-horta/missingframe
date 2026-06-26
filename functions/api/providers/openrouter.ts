import type { Clue, ReconstructionResponse, MediaDomain } from '../../../src/types';
import type { ReconstructionProvider } from './base';
import { buildPromptText, buildSystemInstruction } from '../promptBuilder';

export class OpenRouterProvider implements ReconstructionProvider {
  private apiKey?: string;
  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  async reconstruct(
    query?: string,
    clues?: Clue[],
    followUpQuestion?: string,
    followUpAnswer?: string,
    domain: MediaDomain = 'movie'
  ): Promise<ReconstructionResponse> {
    if (!this.apiKey) {
      throw new Error("OpenRouter API key is not configured.");
    }

    const sysInstruction = buildSystemInstruction(domain) + 
      "\n\nIMPORTANT: You must return a JSON object exactly conforming to this JSON schema:\n" +
      `{
        "analysis": "string",
        "confidence": "high" | "medium" | "low",
        "clarification_needed": boolean,
        "clarification_question": "string",
        "extracted_clues": [
          { "label": "string", "confidence": number, "status": "confirmed" | "uncertain" }
        ],
        "candidates": [
          { "title": "string", "year": "string", "match": number, "why": "string", "possible_memory_errors": ["string"] }
        ]
      }`;

    const promptText = buildPromptText(query, clues, followUpQuestion, followUpAnswer);

    const payload = {
      model: "google/gemini-2.5-flash", // Use Google Gemini 2.5 Flash via OpenRouter by default
      messages: [
        { role: "system", content: sysInstruction },
        { role: "user", content: promptText }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1
    };

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
          "HTTP-Referer": "https://missingframe.pages.dev",
          "X-Title": "Missing Frame"
        },
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenRouter API failed: ${err}`);
    }

    const data = await response.json() as any;
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("OpenRouter returned empty response content.");
    }

    const parsed = JSON.parse(content) as any;
    if (parsed.candidates) {
      parsed.candidates = parsed.candidates.map((c: any) => ({
        ...c,
        domain
      }));
    }
    parsed.domain = domain;
    return parsed as ReconstructionResponse;
  }
}
