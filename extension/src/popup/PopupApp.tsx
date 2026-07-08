import { useEffect, useState } from "react";

import type { AssistantSettings } from "../shared/types/settings";
import {
  DEFAULT_SETTINGS,
  getAssistantSettings,
  saveAssistantSettings
} from "../services/storage/settingsStorage";

export function PopupApp() {
  const [settings, setSettings] = useState<AssistantSettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getAssistantSettings().then(setSettings);
  }, []);

  async function handleSave() {
    await saveAssistantSettings(settings);
    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 1500);
  }

  return (
    <main className="popup">
      <h1>AI Sales Assistant</h1>

      <label>
        <span>Assistente ativo</span>

        <input
          type="checkbox"
          checked={settings.enabled}
          onChange={(event) =>
            setSettings((current) => ({
              ...current,
              enabled: event.target.checked
            }))
          }
        />
      </label>

      <label>
        <span>Personalidade</span>

        <select
          value={settings.personality}
          onChange={(event) =>
            setSettings((current) => ({
              ...current,
              personality: event.target.value as AssistantSettings["personality"]
            }))
          }
        >
          <option value="consultiva">Consultiva</option>
          <option value="direta">Direta</option>
          <option value="analitica">Analítica</option>
        </select>
      </label>

      <label>
        <span>Frequência das sugestões</span>

        <select
          value={settings.suggestionFrequency}
          onChange={(event) =>
            setSettings((current) => ({
              ...current,
              suggestionFrequency: event.target
                .value as AssistantSettings["suggestionFrequency"]
            }))
          }
        >
          <option value="baixa">Baixa</option>
          <option value="media">Média</option>
          <option value="alta">Alta</option>
        </select>
      </label>

      <button onClick={handleSave}>Salvar configurações</button>

      {saved && <p className="saved">Configurações salvas.</p>}
    </main>
  );
}