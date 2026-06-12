// Service worker: abre el side panel al hacer clic en el icono de la extensión.
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((err) => console.error('[TBA] No se pudo configurar el side panel:', err));
