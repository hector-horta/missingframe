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

  it('contains search strategy guidelines (Physical Anchors, active elimination, discriminating questions)', () => {
    const prompt = buildRecoveryPrompt('test memory');

    expect(prompt).toContain('Physical Anchors');
    expect(prompt).toContain('active elimination');
    expect(prompt).toContain('most discriminating conflict');
    expect(prompt).toContain('budget');
    expect(prompt).toContain('surgical');
  });

  it('contains Double-Check Protocol guidelines (Undeniable Anchors, 0% confidence, lesser-known match)', () => {
    const prompt = buildRecoveryPrompt('test memory');

    expect(prompt).toContain('Double-Check Protocol');
    expect(prompt).toContain('Undeniable Anchors');
    expect(prompt).toContain('0% confidence');
  });

  it('contains follow-up answer handling rules (do not modify ranking, decrease global confidence, never discard)', () => {
    const prompt = buildRecoveryPrompt('test memory');

    expect(prompt).toContain('do not modify the ranking');
    expect(prompt).toContain('slightly decrease the global confidence');
    expect(prompt).toContain('Never discard candidates solely because');
  });
});
