// ═══════════════════════════════════════════════════════════════════════════
// teamparser.js — utilidades compartidas para parsear el "export format" de
// Pokémon Showdown y construir URLs de sprites.
// Se carga como script clásico (sin módulos) tanto en el content script como
// en el side panel, por eso se expone todo bajo el namespace global TBA.
// ═══════════════════════════════════════════════════════════════════════════
(function (global) {
  const TBA = global.TBA || (global.TBA = {});

  // Normaliza un nombre al formato interno de Showdown:
  // "Landorus-Therian" -> "landorustherian", "Mr. Mime" -> "mrmime"
  function toID(text) {
    return String(text == null ? '' : text)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
  }

  const STAT_KEYS = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];
  const STAT_LABELS = { hp: 'HP', atk: 'Atk', def: 'Def', spa: 'SpA', spd: 'SpD', spe: 'Spe' };

  // "252 HP / 4 Def / 252 SpD" -> { hp: 252, def: 4, spd: 252 }
  function parseStatLine(line) {
    const out = {};
    line.split('/').forEach((part) => {
      const m = part.trim().match(/^(\d+)\s+(HP|Atk|Def|SpA|SpD|Spe)$/i);
      if (m) out[m[2].toLowerCase()] = parseInt(m[1], 10);
    });
    return out;
  }

  // Texto export completo (varios Pokémon separados por línea en blanco)
  // -> array de "sets" parseados.
  function parseExport(text) {
    if (!text) return [];
    const blocks = String(text)
      .replace(/\r\n/g, '\n')
      .split(/\n\s*\n/)
      .map((b) => b.trim())
      .filter(Boolean);

    return blocks.map(parseSet).filter(Boolean);
  }

  // Parsea un único bloque (un Pokémon) del export format.
  function parseSet(block) {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
    if (!lines.length) return null;

    const set = {
      name: null,          // apodo, si lo hay
      species: null,
      gender: null,        // 'M' | 'F' | null
      item: null,
      ability: null,
      level: null,
      shiny: false,
      gigantamax: false,
      teraType: null,
      happiness: null,
      dynamaxLevel: null,
      nature: null,
      evs: {},
      ivs: {},
      moves: [],
      raw: block,
    };

    // ── Línea 1: "[Nick (Species)] [(Gender)] [@ Item]" ──
    let head = lines[0];
    const atIdx = head.indexOf(' @ ');
    if (atIdx >= 0) {
      set.item = head.slice(atIdx + 3).trim();
      head = head.slice(0, atIdx).trim();
    }
    const genderMatch = head.match(/\s\((M|F)\)$/);
    if (genderMatch) {
      set.gender = genderMatch[1];
      head = head.slice(0, genderMatch.index).trim();
    }
    const nickMatch = head.match(/^(.+?)\s\((.+)\)$/);
    if (nickMatch) {
      set.name = nickMatch[1].trim();
      set.species = nickMatch[2].trim();
    } else {
      set.species = head;
    }

    // ── Resto de líneas ──
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith('-')) {
        const move = line.replace(/^-\s*/, '').trim();
        if (move) set.moves.push(move);
        continue;
      }
      let m;
      if ((m = line.match(/^Ability:\s*(.+)$/i))) { set.ability = m[1].trim(); continue; }
      if ((m = line.match(/^Level:\s*(\d+)$/i))) { set.level = parseInt(m[1], 10); continue; }
      if (/^Shiny:\s*Yes$/i.test(line)) { set.shiny = true; continue; }
      if (/^Gigantamax:\s*Yes$/i.test(line)) { set.gigantamax = true; continue; }
      if ((m = line.match(/^Tera Type:\s*(.+)$/i))) { set.teraType = m[1].trim(); continue; }
      if ((m = line.match(/^Happiness:\s*(\d+)$/i))) { set.happiness = parseInt(m[1], 10); continue; }
      if ((m = line.match(/^Dynamax Level:\s*(\d+)$/i))) { set.dynamaxLevel = parseInt(m[1], 10); continue; }
      if ((m = line.match(/^EVs:\s*(.+)$/i))) { set.evs = parseStatLine(m[1]); continue; }
      if ((m = line.match(/^IVs:\s*(.+)$/i))) { set.ivs = parseStatLine(m[1]); continue; }
      if ((m = line.match(/^(.+?)\s+Nature$/i))) { set.nature = m[1].trim(); continue; }
      // Línea no reconocida (formato futuro/desconocido): se ignora.
    }

    return set;
  }

  // Devuelve las especies (en orden) de los sets de un export, para
  // previews/sprites y para la búsqueda por especie.
  function speciesOf(setsOrExport) {
    const sets = Array.isArray(setsOrExport) ? setsOrExport : parseExport(setsOrExport);
    return sets.map((s) => s.species).filter(Boolean);
  }

  // Candidatos de URL de sprite para una especie, en orden de preferencia.
  // La UI debe probarlos con onerror y caer a un icono local si todos fallan.
  function spriteUrls(species) {
    const id = toID(species);
    return [
      `https://play.pokemonshowdown.com/sprites/dex/${id}.png`,
      `https://play.pokemonshowdown.com/sprites/gen5/${id}.png`,
    ];
  }

  TBA.toID = toID;
  TBA.STAT_KEYS = STAT_KEYS;
  TBA.STAT_LABELS = STAT_LABELS;
  TBA.parseStatLine = parseStatLine;
  TBA.parseExport = parseExport;
  TBA.parseSet = parseSet;
  TBA.speciesOf = speciesOf;
  TBA.spriteUrls = spriteUrls;
})(typeof window !== 'undefined' ? window : globalThis);
