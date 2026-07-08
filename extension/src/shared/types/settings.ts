export type AssistantPersonality = "consultiva" | "direta" | "analitica";

export interface AssistantSettings {
  enabled: boolean;
  personality: AssistantPersonality;
  suggestionFrequency: "baixa" | "media" | "alta";
}