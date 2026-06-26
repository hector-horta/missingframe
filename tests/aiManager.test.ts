import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AIManager } from '../src/lib/ai/client';

describe('AIManager', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.stubEnv('VITE_NVIDIA_API_KEY', 'test-key');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('defaults to deepseek-ai/deepseek-v4-flash when VITE_ACTIVE_MODEL is not set', () => {
    vi.stubEnv('VITE_ACTIVE_MODEL', '');
    const manager = new AIManager();
    expect(manager.getActiveModel()).toBe('deepseek-ai/deepseek-v4-flash');
  });

  it('reads active model from VITE_ACTIVE_MODEL when set', () => {
    vi.stubEnv('VITE_ACTIVE_MODEL', 'mistralai/mistral-medium-3.5-128b');
    const manager = new AIManager();
    expect(manager.getActiveModel()).toBe('mistralai/mistral-medium-3.5-128b');
  });

  it('allows setting a valid candidate model', () => {
    const manager = new AIManager();
    manager.setActiveModel('z-ai/glm-5.1');
    expect(manager.getActiveModel()).toBe('z-ai/glm-5.1');
  });

  it('throws an error when setting an invalid model', () => {
    const manager = new AIManager();
    expect(() => manager.setActiveModel('invalid-model'))
      .toThrow('Invalid model: invalid-model. Must be one of the approved NVIDIA candidate models.');
  });

  it('delegates complete() to NvidiaProvider using the active model', async () => {
    vi.stubEnv('VITE_ACTIVE_MODEL', 'minimax/minimax-m2.7');
    const manager = new AIManager();
    
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { role: 'assistant', content: 'Minimax response' } }]
      })
    });

    const result = await manager.complete([{ role: 'user', content: 'hi' }]);
    expect(result).toBe('Minimax response');

    // Verify it called fetch with the correct model
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/chat/completions'),
      expect.objectContaining({
        body: expect.stringContaining('"model":"minimax/minimax-m2.7"')
      })
    );
  });

  it('updates the underlying provider model when active model is changed', async () => {
    const manager = new AIManager();
    manager.setActiveModel('mistralai/mistral-medium-3.5-128b');

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { role: 'assistant', content: 'Mistral response' } }]
      })
    });

    await manager.complete([{ role: 'user', content: 'hi' }]);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/chat/completions'),
      expect.objectContaining({
        body: expect.stringContaining('"model":"mistralai/mistral-medium-3.5-128b"')
      })
    );
  });
});
