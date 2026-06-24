import type { Clue, ReconstructionResponse } from '../../../src/types';
import type { MovieReconstructorProvider } from './base';
import { buildPromptText, buildSystemInstruction } from '../promptBuilder';

export class GroqProvider implements MovieReconstructorProvider {
  private apiKey?: string;
  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  async reconstruct(
    query?: string,
    clues?: Clue[],
    followUpQuestion?: string,
    followUpAnswer?: string
  ): Promise<ReconstructionResponse> {
    if (!this.apiKey) {
      throw new Error("Groq API key is not configured.");
    }

    const sysInstruction = buildSystemInstruction() + 
      "\n\nIMPORTANT: You must return a JSON object exactly conforming to this JSON schema:\n" +
      `{
        "analysis": "string",
        "confidence": "high" | "medium" | "low",
        "clarification_needed": boolean,
        "clarification_question": "string",
        "extracted_clues": [
          { "label": "string", "confidence": number, "status": "confirmed" | "uncertain" }
        ],
        "movies": [
          { "title": "string", "year": "string", "match": number, "why": "string", "possible_memory_errors": ["string"] }
        ]
      }`;

    const promptText = buildPromptText(query, clues, followUpQuestion, followUpAnswer);

    const payload = {
      model: "llama3-70b-8192",
      messages: [
        { role: "system", content: sysInstruction },
        { role: "user", content: promptText }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1
    };

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Groq API failed: ${err}`);
    }

    const data = await response.json() as any;
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("Groq returned empty response content.");
    }

    return JSON.parse(content) as ReconstructionResponse;
  }
}
