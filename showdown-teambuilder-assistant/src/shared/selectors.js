// ═══════════════════════════════════════════════════════════════════════════
// selectors.js — selectores y patrones de texto del DOM de Showdown,
// centralizados aquí para que sean fáciles de actualizar si la web cambia.
//
// La función "Importar a Showdown" es BEST-EFFORT: el cliente de Showdown
// es una SPA (Preact) cuyo DOM puede cambiar entre versiones. Por eso cada
// selector es en realidad una LISTA de candidatos (se probarán en orden) y,
// si nada funciona, el content script informa al side panel para que ofrezca
// el fallback de "copiar al portapapeles".
//
// Flujo real del Teambuilder de Showdown (verificado contra el código fuente
// de smogon/pokemon-showdown-client en play.pokemonshowdown.com/src/*.tsx):
//   1. La sala "teambuilder" (panel-teambuilder.tsx) lista los equipos y
//      tiene un botón <button data-cmd="/newteam"> que crea un equipo vacío
//      al principio de la lista (PS.teams.unshift(...)).
//   2. Cada equipo se muestra como <a class="team" href="team-<key>">; al
//      pulsarlo, el router de PS abre la sala "team-<key>"
//      (panel-teambuilder-team.tsx), renderizada como
//      <div class="ps-room" id="room-team-<key>">.
//   3. Dentro de esa sala, <TeamEditor> tiene dos pestañas: "Wizard" e
//      "Import/Export" (battle-team-editor.tsx). La pestaña "Import/Export"
//      muestra un <textarea class="textbox teamtextbox"> (hay un segundo
//      textarea oculto con clase "heighttester" que hay que descartar).
//   4. Ese textarea no tiene botón "Guardar": el handler onInput
//      (this.input = updateText() + save()) llama a editor.import(value) y
//      persiste el equipo automáticamente en cuanto se dispara el evento
//      "input" sobre el textarea.
// ═══════════════════════════════════════════════════════════════════════════
(function (global) {
  const TBA = global.TBA || (global.TBA = {});

  TBA.SELECTORS = {
    // Sala principal del Teambuilder (lista de equipos).
    teambuilderRoom: [
      '.ps-room#room-teambuilder',
      '.ps-room[id="room-teambuilder"]',
      '.ps-room[id*="teambuilder"]',
      '.teambuilder',
    ],

    // Botón "New team" (crea un equipo vacío al principio de la lista).
    newTeamButtons: [
      'button[data-cmd="/newteam"]',
      'button[data-cmd^="/newteam"]',
    ],

    // Enlaces a equipos individuales dentro de la lista (el primero es el
    // equipo recién creado, ya que /newteam hace unshift al principio).
    teamListLinks: [
      'ul.teamlist a.team[href^="team-"]',
      'a.team[href^="team-"]',
    ],

    // Pestaña "Import/Export" dentro del editor de un equipo.
    // Se busca por texto del botón (ver findButtonByText en el content script).
    importExportTabButtonTextPatterns: [
      /import\s*\/\s*export/i,
    ],

    // Textarea de import/export dentro del editor de un equipo (excluye el
    // textarea oculto "heighttester" usado solo para medir altura).
    teamTextarea: [
      '.teameditor textarea.teamtextbox:not(.heighttester)',
      'textarea.teamtextbox:not(.heighttester)',
      'textarea.teamtextbox',
    ],
  };
})(typeof window !== 'undefined' ? window : globalThis);
