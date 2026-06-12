// ═══════════════════════════════════════════════════════════════════════════
// formats.js — formatos disponibles en el selector del side panel.
// Los "id" siguen el formato interno (toID) de Showdown.
//
// Para añadir un formato nuevo: añade una entrada aquí y equipos con ese
// mismo "format" en data/teams.json.
// ═══════════════════════════════════════════════════════════════════════════
(function (global) {
  const TBA = global.TBA || (global.TBA = {});

  TBA.FORMATS = [
    { id: 'gen9ou', name: 'Gen 9 OU' },
    { id: 'gen9ubers', name: 'Gen 9 Ubers' },
    { id: 'gen9uu', name: 'Gen 9 UU' },
    { id: 'gen9ru', name: 'Gen 9 RU' },
    { id: 'gen9nu', name: 'Gen 9 NU' },
    { id: 'gen9monotype', name: 'Gen 9 Monotype' },
    { id: 'gen9doublesou', name: 'Gen 9 Doubles OU' },
    { id: 'gen9nationaldex', name: 'Gen 9 National Dex' },
  ];
})(typeof window !== 'undefined' ? window : globalThis);
