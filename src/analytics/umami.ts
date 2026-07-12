import type { AnalyticsEvent, AnalyticsSubscriber } from './types';

declare global {
  interface Window {
    umami?: {
      track: (eventName: string, eventData?: Record<string, any>) => void;
    };
  }
}

export class UmamiSubscriber implements AnalyticsSubscriber {
  handle(event: AnalyticsEvent): void {
    if (typeof window !== 'undefined' && window.umami && typeof window.umami.track === 'function') {
      window.umami.track(event.type, {
        domain: event.domain,
        ...event.payload,
      });
    }
  }
}

export async function initUmami(): Promise<void> {
  try {
    const response = await fetch('/api/analytics-config');
    if (!response.ok) {
      throw new Error(`Failed to fetch analytics config: ${response.status}`);
    }

    const { scriptUrl, websiteId } = await response.json();
    if (!scriptUrl || !websiteId) {
      console.warn('Umami credentials not found in analytics config.');
      return;
    }

    if (typeof document !== 'undefined') {
      const existingScript = document.querySelector(`script[data-website-id="${websiteId}"]`);
      if (existingScript) return;

      const script = document.createElement('script');
      script.defer = true;
      script.src = scriptUrl;
      script.setAttribute('data-website-id', websiteId);
      document.head.appendChild(script);
    }
  } catch (error) {
    console.warn('Failed to initialize Umami analytics:', error);
  }
}
