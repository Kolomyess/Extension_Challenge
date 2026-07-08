import type { AssistantSettings } from "../../shared/types/settings";

const STORAGE_KEY = "assistantSettings";

export const DEFAULT_SETTINGS: AssistantSettings = {
  enabled: true,
  personality: "consultiva",
  suggestionFrequency: "media"
};

export async function getAssistantSettings(): Promise<AssistantSettings> {
  return new Promise((resolve) => {
    chrome.storage.sync.get([STORAGE_KEY], (result) => {
      resolve({
        ...DEFAULT_SETTINGS,
        ...result[STORAGE_KEY]
      });
    });
  });
}

export async function saveAssistantSettings(settings: AssistantSettings) {
  return new Promise<void>((resolve) => {
    chrome.storage.sync.set(
      {
        [STORAGE_KEY]: settings
      },
      () => resolve()
    );
  });
}