export type InputChannelType = 'text' | 'voice' | 'screenshot' | 'clip' | 'soundtrack';

export interface InputPayload {
  channel: InputChannelType;
  text?: string;
  audioUrl?: string;
  imageUrl?: string;
  videoUrl?: string;
}
