import type { Clue, ReconstructionResponse, MediaDomain } from '../../../src/types';
import type { ReconstructionProvider } from './base';
import { NvidiaProvider } from '../../../src/lib/ai/client';
import { buildPromptText, buildSystemInstruction } from '../promptBuilder';

export class NvidiaReconstructionProvider implements ReconstructionProvider {
  private provider: NvidiaProvider;

  constructor(apiKey?: string, model?: string) {
    this.provider = new NvidiaProvider({ apiKey, model });
  }

  async reconstruct(
    query?: string,
    clues?: Clue[],
    followUpQuestion?: string,
    followUpAnswer?: string,
    domain: MediaDomain = 'movie'
  ): Promise<ReconstructionResponse> {
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

    const promptContent = buildPromptText(query, clues, followUpQuestion, followUpAnswer);

    const messages = [
      { role: 'system' as const, content: sysInstruction },
      { role: 'user' as const, content: promptContent }
    ];

    const rawResponse = await this.provider.complete(messages);
    if (!rawResponse) {
      throw new Error("Nvidia returned empty response content.");
    }

    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error(`Failed to extract JSON from Nvidia response: ${rawResponse}`);
    }

    const parsed = JSON.parse(jsonMatch[0]) as any;
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
