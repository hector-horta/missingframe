import type { Clue, ReconstructionResponse } from '../../../src/types';
import type { MovieReconstructorProvider } from './base';
import { buildPromptText, buildSystemInstruction } from '../promptBuilder';

export class GeminiProvider implements MovieReconstructorProvider {
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
      throw new Error("Gemini API key is not configured.");
    }

    const sysInstruction = buildSystemInstruction();
    const promptText = buildPromptText(query, clues, followUpQuestion, followUpAnswer);

    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: promptText }]
        }
      ],
      systemInstruction: {
        parts: [{ text: sysInstruction }]
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
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Gemini API failed: ${err}`);
    }

    const data = await response.json() as any;
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error("Gemini returned empty response content.");
    }

    return JSON.parse(text) as ReconstructionResponse;
  }
}
