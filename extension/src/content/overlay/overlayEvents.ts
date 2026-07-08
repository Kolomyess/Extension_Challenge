import type { CaptionMessage } from "../../shared/types/captions";
import type { InsightMessage } from "../../shared/types/insights";

export type OverlayEvent =
  | {
      type: "status.changed";
      payload: string;
    }
  | {
      type: "caption.received";
      payload: CaptionMessage;
    }
  | {
      type: "insight.received";
      payload: InsightMessage;
    };

const overlayEventTarget = new EventTarget();

export function publishOverlayEvent(event: OverlayEvent) {
  overlayEventTarget.dispatchEvent(
    new CustomEvent<OverlayEvent>("overlay:event", {
      detail: event
    })
  );
}

export function subscribeToOverlayEvents(callback: (event: OverlayEvent) => void) {
  const listener = (event: Event) => {
    const customEvent = event as CustomEvent<OverlayEvent>;
    callback(customEvent.detail);
  };

  overlayEventTarget.addEventListener("overlay:event", listener);

  return () => {
    overlayEventTarget.removeEventListener("overlay:event", listener);
  };
}