import type { MediaDomain } from '../types';

export type AnalyticsEventType =
  | 'search_submitted'
  | 'clues_refined'
  | 'follow_up_answered'
  | 'candidate_confirmed'
  | 'candidate_rejected'
  | 'session_reset';

export interface AnalyticsEvent {
  type: AnalyticsEventType;
  timestamp: number;
  domain: MediaDomain;
  payload: Record<string, unknown>;
}

export interface AnalyticsSubscriber {
  handle(event: AnalyticsEvent): void | Promise<void>;
}
