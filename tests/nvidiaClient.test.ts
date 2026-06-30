import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NvidiaProvider } from '../src/lib/ai/client';
import type { Message } from '../src/lib/ai/client';

describe('NvidiaProvider', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.stubEnv('VITE_NVIDIA_API_KEY', 'test-env-key');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('instantiates with API key from options', () => {
    const provider = new NvidiaProvider({ apiKey: 'custom-key' });
    expect((provider as any).apiKey).toBe('custom-key');
  });

  it('instantiates with API key from import.meta.env when not provided in options', () => {
    const provider = new NvidiaProvider();
    expect((provider as any).apiKey).toBe('test-env-key');
  });

  it('throws an error if no API key is configured', async () => {
    vi.stubEnv('VITE_NVIDIA_API_KEY', '');
    const provider = new NvidiaProvider();
    await expect(provider.complete([{ role: 'user', content: 'hello' }]))
      .rejects.toThrow('NVIDIA API key is not configured.');
  });

  it('performs POST request to NVIDIA endpoint and returns text content on success', async () => {
    const provider = new NvidiaProvider({ apiKey: 'custom-key', model: 'custom-model' });
    const mockResponse = {
      choices: [
        {
          message: {
            role: 'assistant',
            content: 'Hello, I am Llama!'
          }
        }
      ]
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const messages: Message[] = [{ role: 'user', content: 'Say hello' }];
    const result = await provider.complete(messages);

    expect(fetch).toHaveBeenCalledWith('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer custom-key'
      },
      body: JSON.stringify({
        model: 'custom-model',
        messages,
        temperature: 0.2,
        max_tokens: 4096,
        response_format: { type: 'json_object' }
      })
    });
    expect(result).toBe('Hello, I am Llama!');
  });

  it('throws an error when NVIDIA API returns non-ok response', async () => {
    const provider = new NvidiaProvider({ apiKey: 'custom-key' });
    (fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: async () => 'Unauthorized'
    });

    const messages: Message[] = [{ role: 'user', content: 'Say hello' }];
    await expect(provider.complete(messages)).rejects.toThrow('Nvidia API failed: 401 - Unauthorized');
  });
});
