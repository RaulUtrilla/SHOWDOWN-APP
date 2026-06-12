// ═══════════════════════════════════════════════════════════════════════════
// selectors.js — selectores y patrones de texto del DOM de Showdown,
// centralizados aquí para que sean fáciles de actualizar si la web cambia.
//
// La función "Importar a Showdown" es BEST-EFFORT: el cliente de Showdown
// es una SPA cuyo DOM puede cambiar entre versiones. Por eso cada selector
// es en realidad una LISTA de candidatos (se probarán en orden) y, si nada
// funciona, el content script informa al side panel para que ofrezca el
// fallback de "copiar al portapapeles".
// ═══════════════════════════════════════════════════════════════════════════
(function (global) {
  const TBA = global.TBA || (global.TBA = {});

  TBA.SELECTORS = {
    // Sala del Teambuilder (contiene "teambuilder" en su id de room)
    teambuilderRoom: [
      '.ps-room[id*="teambuilder"]',
      '.ps-room .teambuilder',
      '.teambuilder',
    ],

    // Botón que abre el diálogo "Import/Export" de un equipo concreto.
    // Se busca por texto del botón (ver findButtonByText en el content script).
    importExportButtonTextPatterns: [
      /import\s*\/\s*export/i,
      /^import$/i,
      /^export$/i,
      /importar/i,
      /exportar/i,
    ],

    // Textarea donde Showdown muestra/edita el texto en formato export.
    // Candidatos por selector CSS, de más a menos específico.
    importExportTextarea: [
      'textarea.teambuilder-import',
      '.teambuilder textarea',
      '.ps-room[id*="teambuilder"] textarea',
      'textarea.textbox',
    ],

    // Botón para confirmar el import (guarda el equipo pegado en el textarea).
    saveButtonTextPatterns: [
      /^save$/i,
      /^import$/i,
      /^ok$/i,
      /guardar/i,
    ],
  };
})(typeof window !== 'undefined' ? window : globalThis);
