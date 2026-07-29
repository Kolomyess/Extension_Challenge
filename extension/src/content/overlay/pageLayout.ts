const PAGE_LAYOUT_STYLE_ID = "ai-sales-assistant-page-layout-style";

export function applyTeamsPageOffset() {
  document.documentElement.classList.add("asa-sidebar-open");

  let style = document.getElementById(PAGE_LAYOUT_STYLE_ID);

  if (!style) {
    style = document.createElement("style");
    style.id = PAGE_LAYOUT_STYLE_ID;
    document.head.appendChild(style);
  }

  style.textContent = `
    :root.asa-sidebar-open {
      --asa-sidebar-width: clamp(360px, 30vw, 440px);
    }

    @media (min-width: 901px) {
      :root.asa-sidebar-open body {
        box-sizing: border-box !important;
        padding-right: var(--asa-sidebar-width) !important;
        transition: padding-right 220ms ease !important;
        overflow-x: hidden !important;
      }
    }

    @media (max-width: 900px) {
      :root.asa-sidebar-open body {
        padding-right: 0 !important;
      }
    }
  `;
}

export function clearTeamsPageOffset() {
  document.documentElement.classList.remove("asa-sidebar-open");
}