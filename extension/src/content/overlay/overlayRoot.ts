import { DOM_IDS } from "../../shared/constants/app";

export function createOverlayRoot() {
  const existingHost = document.getElementById(DOM_IDS.overlayHost);

  if (existingHost?.shadowRoot) {
    return existingHost.shadowRoot;
  }

  const host = document.createElement("div");

  host.id = DOM_IDS.overlayHost;

  document.documentElement.appendChild(host);

  return host.attachShadow({ mode: "open" });
}