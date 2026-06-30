import { describe, it, expect } from 'vitest';
import { buildRecoveryPrompt } from '../src/lib/ai/prompts.ts';

describe('buildRecoveryPrompt', () => {
  it('injects user memory into the returned prompt', () => {
    const memory = 'a movie about a green ogre who lives in a swamp and saves a princess';
    const prompt = buildRecoveryPrompt(memory);

    expect(prompt).toContain(memory);
  });

  it('contains System Prompt details (Detective behind Missing Frame, human memory)', () => {
    const prompt = buildRecoveryPrompt('test memory');

    expect(prompt).toContain('Detective behind Missing Frame');
    expect(prompt).toContain('Human memory');
    expect(prompt).toContain('imperfect human memories');
  });

  it('explicitly requests the JSON containing the analysis of "ruido vs anclas"', () => {
    const prompt = buildRecoveryPrompt('test memory');

    expect(prompt).toContain('JSON');
    expect(prompt).toContain('ruido_vs_anclas');
    expect(prompt).toContain('anclas');
    expect(prompt).toContain('ruido');
  });

  it('contains MASTER SYSTEM PROMPT v3 headers and role', () => {
    const prompt = buildRecoveryPrompt('test memory');

    expect(prompt).toContain('MASTER SYSTEM PROMPT v3');
    expect(prompt).toContain('reconstruct imperfect human memories');
  });

  it('contains Phase 2 Exclusivity and Reliability scoring guidelines', () => {
    const prompt = buildRecoveryPrompt('test memory');

    expect(prompt).toContain('Reliability');
    expect(prompt).toContain('Exclusivity');
    expect(prompt).toContain('Nearly Unique');
    expect(prompt).toContain('Five generic clues');
  });

  it('contains Phase 7 follow-up answer rules (I DON\'T REMEMBER, UNKNOWN ≠ FALSE)', () => {
    const prompt = buildRecoveryPrompt('test memory');

    expect(prompt).toContain('I DON\'T REMEMBER');
    expect(prompt).toContain('UNKNOWN ≠ FALSE');
    expect(prompt).toContain('Never discard a movie solely because');
  });

  it('contains Exclusive Memory Anchors and Candidate Ranking guidelines', () => {
    const prompt = buildRecoveryPrompt('test memory');

    expect(prompt).toContain('Exclusive Memory Anchors');
    expect(prompt).toContain('Memory distortion likelihood');
  });
});
