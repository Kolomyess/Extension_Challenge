import type { CaptionMessage } from "../../shared/types/captions";

class MeetingStateStore {
  private readonly captions: CaptionMessage[] = [];
  private readonly participants = new Set<string>();
  private readonly startedAt = new Date().toISOString();

  addCaption(caption: CaptionMessage) {
    this.captions.push(caption);
    this.participants.add(caption.speaker);
  }

  getCaptions() {
    return [...this.captions];
  }

  getParticipants() {
    return [...this.participants];
  }

  getSnapshot() {
    return {
      startedAt: this.startedAt,
      captions: this.getCaptions(),
      participants: this.getParticipants()
    };
  }
}

export const meetingState = new MeetingStateStore();