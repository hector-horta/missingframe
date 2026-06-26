import { describe, it, expect } from 'vitest';
import { buildRecoveryPrompt } from '../src/lib/ai/prompts.ts';

describe('buildRecoveryPrompt', () => {
  it('injects user memory into the returned prompt', () => {
    const memory = 'a movie about a green ogre who lives in a swamp and saves a princess';
    const prompt = buildRecoveryPrompt(memory);

    expect(prompt).toContain(memory);
  });

  it('contains System Prompt details (Movie Detective, human memory)', () => {
    const prompt = buildRecoveryPrompt('test memory');

    expect(prompt).toContain('Movie Detective');
    expect(prompt).toContain('human memory');
    expect(prompt).toContain('imperfect memories');
  });

  it('explicitly requests the JSON containing the analysis of "ruido vs anclas"', () => {
    const prompt = buildRecoveryPrompt('test memory');

    expect(prompt).toContain('JSON');
    expect(prompt).toContain('ruido_vs_anclas');
    expect(prompt).toContain('anclas');
    expect(prompt).toContain('ruido');
  });
});
