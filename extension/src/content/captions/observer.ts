import type { CaptionMessage } from "../../shared/types/captions";
import { logger } from "../../shared/utils/logger";
import { createRecentKeyCache } from "../../shared/utils/recentKeyCache";
import { parseCaptionsFromRoot } from "./parser";

interface StartCaptionObserverOptions {
  onCaption: (caption: CaptionMessage) => void;
  onStatusChange?: (status: string) => void;
}

const CAPTION_STABILIZATION_MS = 500;

export function startCaptionObserver(options: StartCaptionObserverOptions) {
  const recentCaptions = createRecentKeyCache(300);

  let observer: MutationObserver | null = null;
  let processingTimer: number | undefined;
  let stabilizationTimer: number | undefined;
  let pendingCaption: CaptionMessage | null = null;

  function emitStatus(status: string) {
    options.onStatusChange?.(status);
    logger.info(status);
  }

  function getCaptionKey(caption: CaptionMessage) {
    return `${caption.speaker}::${caption.text}`;
  }

  function flushPendingCaption() {
    if (!pendingCaption) {
      return;
    }

    const caption = pendingCaption;
    pendingCaption = null;

    const key = getCaptionKey(caption);

    if (recentCaptions.has(key)) {
      return;
    }

    recentCaptions.add(key);

    logger.info("Nova legenda estabilizada:", caption);

    options.onCaption(caption);
  }

  function queueCaption(caption: CaptionMessage) {
    pendingCaption = caption;

    window.clearTimeout(stabilizationTimer);

    stabilizationTimer = window.setTimeout(() => {
      flushPendingCaption();
    }, CAPTION_STABILIZATION_MS);
  }

  function processPage() {
    const captions = parseCaptionsFromRoot(document);

    const latestCaption = captions.at(-1);

    if (!latestCaption) {
      return;
    }

    queueCaption(latestCaption);
  }

  function scheduleProcessing() {
    window.clearTimeout(processingTimer);

    processingTimer = window.setTimeout(() => {
      processPage();
    }, 150);
  }

  function startObserver() {
    emitStatus("Monitorando legendas do Microsoft Teams...");

    processPage();

    observer = new MutationObserver(() => {
      scheduleProcessing();
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  startObserver();

  return function stopCaptionObserver() {
    window.clearTimeout(processingTimer);
    window.clearTimeout(stabilizationTimer);

    observer?.disconnect();
    observer = null;

    emitStatus("Monitoramento de legendas encerrado.");
  };
}