import type { AnalyticsEvent, AnalyticsSubscriber } from './types';

const subscribers: AnalyticsSubscriber[] = [];

export function subscribe(sub: AnalyticsSubscriber): void {
  subscribers.push(sub);
}

export function emit(event: AnalyticsEvent): void {
  subscribers.forEach((sub) => {
    try {
      sub.handle(event);
    } catch (error) {
      console.error("Analytics subscriber failed:", error);
    }
  });
}
