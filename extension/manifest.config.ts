import { defineManifest } from "@crxjs/vite-plugin";

export default defineManifest({
  manifest_version: 3,

  name: "AI Sales Assistant",
  description: "Assistente inteligente para reuniões comerciais no Microsoft Teams.",
  version: "0.1.0",

  permissions: ["storage"],

  host_permissions: [
  "https://teams.microsoft.com/*",
  "https://*.teams.microsoft.com/*",
  "https://teams.live.com/*",
  "https://*.teams.live.com/*",
  "http://localhost:8000/*",
  "http://127.0.0.1:8000/*",
  "ws://localhost:8000/*",
  "ws://127.0.0.1:8000/*"
],


  action: {
    default_popup: "src/popup/index.html"
  },

  background: {
    service_worker: "src/background/index.ts",
    type: "module"
  },

  content_scripts: [
    {
      matches: [
        "https://teams.microsoft.com/*",
        "https://*.teams.microsoft.com/*",
        "https://teams.live.com/*",
        "https://*.teams.live.com/*"
      ],
      js: ["src/content/index.tsx"],
      run_at: "document_idle"
    }
  ]
});