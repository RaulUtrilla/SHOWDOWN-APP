// ═══════════════════════════════════════════════════════════════════════════
// teambuilder.content.js — recibe el equipo desde el side panel y trata de
// pegarlo en el diálogo "Import/Export" del Teambuilder de Showdown.
//
// Esto es BEST-EFFORT (ver selectors.js): si no se encuentra el textarea o el
// botón de guardar, se responde con el motivo y el side panel hace fallback
// a "copiar al portapapeles" con instrucciones para el usuario.
// ═══════════════════════════════════════════════════════════════════════════
(function () {
  const SEL = window.TBA && window.TBA.SELECTORS;

  function queryFirst(selectors, root) {
    root = root || document;
    for (const sel of selectors) {
      try {
        const el = root.querySelector(sel);
        if (el) return el;
      } catch (_) { /* selector inválido en este navegador: lo ignoramos */ }
    }
    return null;
  }

  function findButtonByText(patterns, root) {
    root = root || document;
    const candidates = root.querySelectorAll('button, a.button, label.button, .button, [role="button"]');
    for (const el of candidates) {
      const text = (el.textContent || '').trim();
      if (!text) continue;
      for (const p of patterns) {
        if (p.test(text)) return el;
      }
    }
    return null;
  }

  // Pone el valor de un <textarea> de forma que frameworks tipo React/Preact
  // detecten el cambio (usan el setter nativo + evento "input").
  function setTextareaValue(el, value) {
    const proto = window.HTMLTextAreaElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, 'value') &&
      Object.getOwnPropertyDescriptor(proto, 'value').set;
    if (setter) setter.call(el, value);
    else el.value = value;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function tryImport(exportText) {
    if (!SEL) return { ok: false, reason: 'selectors-missing' };

    const room = queryFirst(SEL.teambuilderRoom) || document;

    // 1) ¿Ya hay un textarea de import/export visible?
    let textarea = queryFirst(SEL.importExportTextarea, room);

    // 2) Si no, intentar abrir el diálogo pulsando el botón Import/Export.
    if (!textarea) {
      const btn = findButtonByText(SEL.importExportButtonTextPatterns, room);
      if (!btn) return { ok: false, reason: 'no-button' };
      btn.click();
      await delay(200);
      textarea = queryFirst(SEL.importExportTextarea, room);
    }

    if (!textarea) return { ok: false, reason: 'no-textarea' };

    setTextareaValue(textarea, exportText);
    textarea.focus();

    // 3) Intentar guardar/confirmar automáticamente.
    await delay(50);
    const saveBtn = findButtonByText(SEL.saveButtonTextPatterns, room);
    if (saveBtn) {
      saveBtn.click();
      return { ok: true, saved: true };
    }

    // El texto se pegó pero el usuario debe pulsar Guardar manualmente.
    return { ok: true, saved: false };
  }

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (!msg || msg.type !== 'TBA_IMPORT_TEAM') return;
    tryImport(msg.export)
      .then(sendResponse)
      .catch((err) => sendResponse({ ok: false, reason: 'error', error: String(err) }));
    return true; // respuesta asíncrona
  });

  console.log('[TBA] content script listo en', location.href);
})();
