import { describe, it, expect } from 'vitest';
import { buildSystemInstruction, buildPromptText } from '../functions/api/promptBuilder';
import type { Clue } from '../src/types';

describe('Prompt Builder tests', () => {
  it('builds system instruction containing Movie Detective persona', () => {
    const sys = buildSystemInstruction();
    expect(sys).toContain('You are Movie Detective');
    expect(sys).toContain('reconstruct imperfect memories');
  });

  it('builds raw description prompt for step 1', () => {
    const prompt = buildPromptText('sci-fi with blue bionic arm', undefined);
    expect(prompt).toContain('User memory raw query description: "sci-fi with blue bionic arm"');
  });

  it('builds refined clues prompt for step 2', () => {
    const clues: Clue[] = [
      { label: 'Sci-Fi', confidence: 0.95, status: 'confirmed' },
      { label: 'Bionic legs', confidence: 0.8, status: 'uncertain' }
    ];
    const prompt = buildPromptText(undefined, clues);
    expect(prompt).toContain('Active clues extracted from memory:');
    expect(prompt).toContain('- Sci-Fi (status: confirmed)');
    expect(prompt).toContain('- Bionic legs (status: uncertain)');
  });

  it('builds prompt including follow up interaction for step 4 resolution', () => {
    const clues: Clue[] = [
      { label: 'Sci-Fi', confidence: 0.95, status: 'confirmed' }
    ];
    const prompt = buildPromptText(
      undefined,
      clues,
      'Was the actor Laurence Fishburne?',
      'No, it was Forest Whitaker'
    );
    expect(prompt).toContain('Detective Clarification Question: "Was the actor Laurence Fishburne?"');
    expect(prompt).toContain('User Answer: "No, it was Forest Whitaker"');
  });

  it('builds system instruction containing physical anchors and active elimination guidelines', () => {
    const sys = buildSystemInstruction();
    expect(sys).toContain('Physical Anchors');
    expect(sys).toContain('active elimination');
    expect(sys).toContain('most discriminating conflict');
    expect(sys).toContain('budget');
    expect(sys).toContain('surgical');
  });

  it('builds system instruction containing Double-Check Protocol guidelines', () => {
    const sys = buildSystemInstruction();
    expect(sys).toContain('Double-Check Protocol');
    expect(sys).toContain('Undeniable Anchors');
    expect(sys).toContain('0% confidence');
  });

  it('builds system instruction containing follow-up answer handling rules', () => {
    const sys = buildSystemInstruction();
    expect(sys).toContain('do not modify the ranking');
    expect(sys).toContain('slightly decrease the global confidence');
    expect(sys).toContain('Never discard candidates solely because');
  });
});
