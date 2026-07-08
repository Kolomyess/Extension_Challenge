export type CaptionSource = "teams-live-caption";

export interface CaptionMessage {
  id: string;
  speaker: string;
  text: string;
  capturedAt: string;
  source: CaptionSource;
}