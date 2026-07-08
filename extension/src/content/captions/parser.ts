import { TEAMS_SELECTORS } from "../../shared/constants/teamsSelectors";
import type { CaptionMessage } from "../../shared/types/captions";

function createId() {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function normalizeText(value: string | null | undefined) {
  return value?.replace(/\s+/g, " ").trim() ?? "";
}

function createCaptionMessage(speaker: string, text: string): CaptionMessage {
  return {
    id: createId(),
    speaker,
    text,
    capturedAt: new Date().toISOString(),
    source: "teams-live-caption"
  };
}

/**
 * Estratégia 1:
 * tenta capturar usando os atributos oficiais que encontramos no HTML do Teams.
 */
function findAuthorForCaption(captionElement: Element): Element | null {
  let current = captionElement.parentElement;

  for (let depth = 0; current && depth < 12; depth += 1) {
    const author = current.querySelector(TEAMS_SELECTORS.author);

    if (author) {
      return author;
    }

    current = current.parentElement;
  }

  return null;
}

function getCaptionTextElements(root: ParentNode): Element[] {
  const elements: Element[] = [];

  if (root instanceof Element && root.matches(TEAMS_SELECTORS.captionText)) {
    elements.push(root);
  }

  elements.push(...Array.from(root.querySelectorAll(TEAMS_SELECTORS.captionText)));

  return elements;
}

function parseStructuredCaptionsFromRoot(root: ParentNode): CaptionMessage[] {
  const captionTextElements = getCaptionTextElements(root);

  return captionTextElements
    .map((captionElement): CaptionMessage | null => {
      const authorElement = findAuthorForCaption(captionElement);

      const speaker = normalizeText(authorElement?.textContent);
      const text = normalizeText(captionElement.textContent);

      if (!speaker || !text) {
        return null;
      }

      return createCaptionMessage(speaker, text);
    })
    .filter((caption): caption is CaptionMessage => caption !== null);
}

/**
 * Estratégia 2:
 * fallback para quando o Teams muda os atributos internos.
 *
 * Aqui usamos o texto visível do container de legendas.
 */
function getVisibleText(root: ParentNode) {
  if (root instanceof HTMLElement) {
    return root.innerText;
  }

  if (root instanceof Element) {
    return root.textContent ?? "";
  }

  return "";
}

function isLikelySpeakerLine(line: string) {
  const words = line.split(/\s+/).filter(Boolean);

  if (words.length < 2 || words.length > 8) {
    return false;
  }

  if (line.length > 90) {
    return false;
  }

  /**
   * Frases de legenda normalmente têm pontuação.
   * Nomes normalmente não têm.
   */
  if (/[?.!,;:]/.test(line)) {
    return false;
  }

  const capitalizedWords = words.filter((word) =>
    /^[A-ZÁÀÂÃÉÈÊÍÓÔÕÚÇ]/.test(word)
  );

  return capitalizedWords.length >= 2;
}

function parsePlainTextCaptionsFromRoot(root: ParentNode): CaptionMessage[] {
  const rawText = getVisibleText(root);

  const lines = rawText
    .split(/\n+/)
    .map(normalizeText)
    .filter(Boolean)
    .filter((line) => line.length > 1);

  const captions: CaptionMessage[] = [];

  let currentSpeaker = "";

  for (const line of lines) {
    /**
     * Ignora iniciais de avatar, como HG, HS etc.
     */
    if (/^[A-Z]{1,3}$/.test(line)) {
      continue;
    }

    if (isLikelySpeakerLine(line)) {
      currentSpeaker = line;
      continue;
    }

    if (!currentSpeaker) {
      continue;
    }

    if (line === currentSpeaker) {
      continue;
    }

    captions.push(createCaptionMessage(currentSpeaker, line));
  }

  return captions;
}

export function parseCaptionsFromRoot(root: ParentNode): CaptionMessage[] {
  const structuredCaptions = parseStructuredCaptionsFromRoot(root);

  if (structuredCaptions.length > 0) {
    return structuredCaptions;
  }

  return parsePlainTextCaptionsFromRoot(root);
}