// ═══════════════════════════════════════════════════════════════════════════
// teambuilder.content.js — recibe el equipo desde el side panel e intenta
// importarlo al Teambuilder de Showdown.
//
// El Teambuilder no tiene un diálogo "Import/Export" por equipo en la sala
// de lista: hay que (1) crear un equipo nuevo, (2) abrir su editor y (3)
// cambiar a la pestaña "Import/Export", cuyo textarea se autoguarda con el
// evento "input" (no hay botón "Guardar"). Ver selectors.js para detalles
// y los selectores candidatos.
//
// Esto es BEST-EFFORT: si Showdown cambia su DOM y algún paso falla, se
// responde con el motivo y el side panel hace fallback a "copiar al
// portapapeles" con instrucciones para el usuario.
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

  // Reintenta `getter()` hasta que devuelva algo truthy o se agoten los
  // intentos (la SPA de Showdown tarda un poco en renderizar tras cada paso).
  async function waitFor(getter, tries, intervalMs) {
    for (let i = 0; i < tries; i++) {
      const el = getter();
      if (el) return el;
      await delay(intervalMs);
    }
    return null;
  }

  async function tryImport(exportText) {
    if (!SEL) return { ok: false, reason: 'selectors-missing' };

    const tbRoom = queryFirst(SEL.teambuilderRoom);
    if (!tbRoom) return { ok: false, reason: 'no-teambuilder-room' };

    // 1) Crear un equipo nuevo y vacío al principio de la lista.
    const newTeamBtn = queryFirst(SEL.newTeamButtons, tbRoom);
    if (!newTeamBtn) return { ok: false, reason: 'no-new-team-button' };
    newTeamBtn.click();
    await delay(250);

    // 2) Localizar el enlace al equipo recién creado (el primero de la
    //    lista, ya que "New team" hace unshift) y recordar a qué sala lleva
    //    para esperar a que aparezca esa sala exacta.
    const teamLink = queryFirst(SEL.teamListLinks, tbRoom);
    if (!teamLink) return { ok: false, reason: 'no-team-link' };
    const href = teamLink.getAttribute('href') || '';
    teamLink.click();

    // 3) Esperar a que se abra la sala del editor de ese equipo.
    const teamRoom = await waitFor(
      () => (href && document.getElementById('room-' + href)) || null,
      12, 150
    );
    if (!teamRoom) return { ok: false, reason: 'no-team-room' };

    // 4) Cambiar a la pestaña "Import/Export".
    const importTab = await waitFor(
      () => findButtonByText(SEL.importExportTabButtonTextPatterns, teamRoom),
      6, 150
    );
    if (!importTab) return { ok: false, reason: 'no-import-tab' };
    importTab.click();

    // 5) Pegar el equipo en el textarea: el handler "input" del editor lo
    //    parsea y lo guarda automáticamente (no hay botón "Guardar").
    const textarea = await waitFor(
      () => queryFirst(SEL.teamTextarea, teamRoom),
      6, 150
    );
    if (!textarea) return { ok: false, reason: 'no-textarea' };

    setTextareaValue(textarea, exportText);
    textarea.focus();

    return {
      ok: true,
      saved: true,
      note: 'Se ha importado como un equipo nuevo. Si aparece como ' +
        '"Sin categorizar", elige el formato correcto con el menú junto al ' +
        'nombre del equipo.',
    };
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
