import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { emit, subscribe } from '../src/analytics/eventBus';
import { initUmami, UmamiSubscriber } from '../src/analytics/umami';

describe('Umami Analytics Integration', () => {
  beforeEach(() => {
    // Reset global state
    vi.stubGlobal('fetch', vi.fn());
    vi.stubGlobal('window', {
      umami: {
        track: vi.fn(),
      },
    });
    document.head.innerHTML = '';
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.head.innerHTML = '';
  });

  it('initUmami fetches config and injects script into document head', async () => {
    const mockConfig = {
      scriptUrl: 'https://analytics.wati.health/script.js',
      websiteId: 'f2be6a0f-eaf1-42e6-a41d-b79af6759a2b',
    };

    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockConfig,
    });

    await initUmami();

    expect(globalThis.fetch).toHaveBeenCalledWith('/api/analytics-config');
    const script = document.querySelector('script');
    expect(script).toBeTruthy();
    expect(script?.getAttribute('src')).toBe(mockConfig.scriptUrl);
    expect(script?.getAttribute('data-website-id')).toBe(mockConfig.websiteId);
    expect(script?.defer).toBe(true);
  });

  it('initUmami handles failed configuration fetch gracefully', async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    await initUmami();

    expect(globalThis.fetch).toHaveBeenCalledWith('/api/analytics-config');
    const script = document.querySelector('script');
    expect(script).toBeNull();
    expect(consoleWarnSpy).toHaveBeenCalled();
    
    consoleWarnSpy.mockRestore();
  });

  it('UmamiSubscriber forwards events from eventBus to window.umami.track', () => {
    const subscriber = new UmamiSubscriber();
    subscribe(subscriber);

    const testEvent = {
      type: 'search_submitted' as const,
      timestamp: Date.now(),
      domain: 'movie' as const,
      payload: { query: 'Inception' },
    };

    emit(testEvent);

    expect(window.umami?.track).toHaveBeenCalledWith(testEvent.type, {
      domain: testEvent.domain,
      ...testEvent.payload,
    });
  });
});
