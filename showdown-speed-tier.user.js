// ==UserScript==
// @name         Threat Matrix - Pokémon Showdown
// @namespace    https://pokemonshowdown.com
// @version      2.0.0
// @description  Panel de amenazas para Gen 9 Random Battles: muestra los movimientos probables del rival y el daño que harían a tu Pokémon (y el tuyo a él), con % y probabilidad de KO. Calcula usando el motor interno de Showdown — convive con Showdex.
// @author       Tu nombre
// @match        https://play.pokemonshowdown.com/*
// @match        https://pokemonshowdown.com/*
// @grant        none
// ==/UserScript==

(function () {

  // ═══════════════════════════════════════════════════════════════════════════
  // UTILIDADES BÁSICAS
  // ═══════════════════════════════════════════════════════════════════════════
  const log = (...a) => console.log('[ThreatMatrix]', ...a);

  // toID: normaliza nombres al formato interno de Showdown ("Close Combat" → "closecombat")
  function toID(s) { return String(s == null ? '' : s).toLowerCase().replace(/[^a-z0-9]/g, ''); }
  function cap(s) { s = String(s || ''); return s.charAt(0).toUpperCase() + s.slice(1); }

  // ═══════════════════════════════════════════════════════════════════════════
  // ACCESO AL MOTOR DE BATALLA DE SHOWDOWN
  // app.curRoom.battle es la misma fuente que usa Showdex. Con @grant none el
  // script corre en el contexto de la página, así que window.app / window.Dex
  // son accesibles directamente.
  // ═══════════════════════════════════════════════════════════════════════════
  function getBattle() {
    try {
      const app = window.app;
      if (app && app.curRoom && app.curRoom.battle) return app.curRoom.battle;
    } catch (_) {}
    return null;
  }
  function DexSpecies(name) { try { return window.Dex.species.get(name); } catch (_) { return null; } }
  function DexMove(name)    { try { return window.Dex.moves.get(name); }   catch (_) { return null; } }

  // ═══════════════════════════════════════════════════════════════════════════
  // SETS DE GEN 9 RANDOM BATTLE (pkmn.github.io)
  // Para predecir los movimientos típicos del rival ANTES de que los revele.
  // Se cachea en localStorage (TTL 7 días). Si la descarga falla (p. ej. CSP),
  // el panel funciona igual con los movimientos ya revelados.
  // ═══════════════════════════════════════════════════════════════════════════
  const RANDBATS_URL = 'https://pkmn.github.io/randbats/data/gen9randombattle.json';
  const SETS_CACHE_KEY = 'showdown-tm-randbats-gen9';
  const SETS_TTL = 7 * 24 * 60 * 60 * 1000;
  let RANDSETS = null;

  function loadSets() {
    // 1) Intentar caché
    try {
      const raw = localStorage.getItem(SETS_CACHE_KEY);
      if (raw) {
        const obj = JSON.parse(raw);
        if (obj && obj.ts && obj.data && (Date.now() - obj.ts) < SETS_TTL) {
          RANDSETS = obj.data;
          log('Sets cargados de caché:', Object.keys(RANDSETS).length, 'especies');
        }
      }
    } catch (_) {}
    // 2) Descargar si falta o está caducado
    if (!RANDSETS) fetchSets();
  }

  function fetchSets() {
    try {
      fetch(RANDBATS_URL, { method: 'GET', cache: 'force-cache' })
        .then(r => r.json())
        .then(data => {
          RANDSETS = data;
          try { localStorage.setItem(SETS_CACHE_KEY, JSON.stringify({ ts: Date.now(), data })); } catch (_) {}
          log('Sets descargados:', Object.keys(data).length, 'especies');
          scheduleRender();
        })
        .catch(e => log('No se pudieron descargar los sets (se usarán solo movimientos revelados):', e && e.message));
    } catch (e) {
      log('fetch no disponible:', e && e.message);
    }
  }

  // Spread por defecto de Gen 9 randbats: EV 84 / IV 31, con overrides escasos.
  function getSpread(forme) {
    const evs = { hp: 84, atk: 84, def: 84, spa: 84, spd: 84, spe: 84 };
    const ivs = { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };
    let level = null;
    const entry = randEntry(forme);
    if (entry) {
      if (entry.evs) Object.assign(evs, entry.evs);
      if (entry.ivs) Object.assign(ivs, entry.ivs);
      if (entry.level) level = entry.level;
    }
    return { evs, ivs, level };
  }

  function randEntry(forme) {
    if (!RANDSETS) return null;
    if (RANDSETS[forme]) return RANDSETS[forme];
    // Buscar por forma base ("Urshifu-Rapid-Strike" → "Urshifu")
    const base = String(forme).split('-')[0];
    if (RANDSETS[base]) return RANDSETS[base];
    // Búsqueda por id normalizado
    const id = toID(forme);
    for (const k in RANDSETS) if (toID(k) === id) return RANDSETS[k];
    return null;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FÓRMULAS DE STATS (Gen 3+)
  // ═══════════════════════════════════════════════════════════════════════════
  function calcStat(base, iv, ev, level, natureMult) {
    return Math.floor((Math.floor((2 * base + iv + Math.floor(ev / 4)) * level / 100) + 5) * (natureMult || 1));
  }
  function calcHP(base, iv, ev, level) {
    if (base === 1) return 1; // Shedinja
    return Math.floor((2 * base + iv + Math.floor(ev / 4)) * level / 100) + level + 10;
  }
  // Multiplicador por etapa de boost (atk/def/spa/spd) — distinto del de velocidad
  function boostMult(stage) {
    stage = Math.max(-6, Math.min(6, stage || 0));
    return stage >= 0 ? (2 + stage) / 2 : 2 / (2 - stage);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // EFECTIVIDAD DE TIPOS — usa la tabla que el cliente ya tiene cargada
  // ═══════════════════════════════════════════════════════════════════════════
  function typeChartEntry(typeName) {
    const T = window.BattleTypeChart || {};
    return T[typeName] || T[cap(typeName)] || T[toID(typeName)] || null;
  }
  function typeMult(moveType, defenderTypes) {
    let m = 1;
    for (const dt of defenderTypes) {
      const e = typeChartEntry(dt);
      if (!e || !e.damageTaken) continue;
      let code = e.damageTaken[moveType];
      if (code === undefined) code = e.damageTaken[cap(moveType)];
      m *= code === 1 ? 2 : code === 2 ? 0.5 : code === 3 ? 0 : 1;
    }
    return m;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CLIMA ACTUAL
  // ═══════════════════════════════════════════════════════════════════════════
  function currentWeather() {
    const b = getBattle();
    if (!b) return null;
    const w = toID(b.weather || '');
    if (!w) return null;
    if (w.indexOf('sun') >= 0 || w === 'desolateland') return 'sun';
    if (w.indexOf('rain') >= 0 || w === 'primordialsea') return 'rain';
    if (w.indexOf('sand') >= 0) return 'sand';
    if (w.indexOf('snow') >= 0 || w === 'hail') return 'snow';
    return null;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CONSTRUCCIÓN DE "ACTORES" (atacante / defensor) DESDE EL ESTADO DE BATALLA
  // ═══════════════════════════════════════════════════════════════════════════

  // Empareja el Pokémon activo propio con su entrada del servidor (stats reales).
  function getMyServerPokemon(battle, cp) {
    const arr = battle && battle.myPokemon;
    if (!arr || !cp) return null;
    const cpId = toID(cp.speciesForme);
    for (const p of arr) {
      const det = String(p.details || p.ident || '');
      const name = det.split(',')[0].replace(/^p\d+:?\s*/i, '');
      if (toID(p.speciesForme || name) === cpId || toID(name) === cpId) return p;
    }
    return null;
  }

  function buildActor(clientSide, cp, isMine, battle) {
    if (!cp) return null;
    const forme = cp.speciesForme;
    const sp = DexSpecies(forme);
    if (!sp || !sp.baseStats) return null;

    const spread = getSpread(forme);
    const level = cp.level || spread.level || 100;

    let stats = null, maxhp = null, curHP = null, statsReal = false;

    if (isMine) {
      const sv = getMyServerPokemon(battle, cp);
      if (sv && sv.stats) {
        stats = {
          atk: sv.stats.atk, def: sv.stats.def,
          spa: sv.stats.spa, spd: sv.stats.spd, spe: sv.stats.spe,
        };
        maxhp = cp.maxhp; // HP real para los propios
        curHP = cp.hp;
        statsReal = true;
      }
    }

    if (!stats) {
      // Estimación (IV 31, EV 84 o lo que diga randbats, naturaleza neutra)
      const { evs, ivs } = spread;
      stats = {
        atk: calcStat(sp.baseStats.atk, ivs.atk, evs.atk, level, 1),
        def: calcStat(sp.baseStats.def, ivs.def, evs.def, level, 1),
        spa: calcStat(sp.baseStats.spa, ivs.spa, evs.spa, level, 1),
        spd: calcStat(sp.baseStats.spd, ivs.spd, evs.spd, level, 1),
        spe: calcStat(sp.baseStats.spe, ivs.spe, evs.spe, level, 1),
      };
      maxhp = calcHP(sp.baseStats.hp, ivs.hp, evs.hp, level);
      // El cliente normaliza el HP del rival a /100 → usamos la fracción
      const frac = cp.maxhp ? (cp.hp / cp.maxhp) : 1;
      curHP = Math.max(0, Math.round(maxhp * frac));
    }

    const tera = cp.terastallized || '';
    const types = tera ? [tera] : sp.types.slice();

    const screens = (clientSide && clientSide.sideConditions) || {};

    return {
      forme, level, stats, maxhp, curHP, statsReal,
      types, baseTypes: sp.types.slice(),
      boosts: cp.boosts || {},
      status: cp.status || '',
      item: cp.item || '',
      ability: cp.ability || cp.baseAbility || '',
      tera,
      screens: {
        reflect:    !!screens.reflect,
        lightscreen:!!screens.lightscreen,
        auroraveil: !!screens.auroraveil,
      },
      cp,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CÁLCULO DE DAÑO (aproximación fiel a @smogon/calc para Gen 9)
  // ═══════════════════════════════════════════════════════════════════════════
  function estimateDamage(att, def, moveName) {
    const mv = DexMove(moveName);
    if (!mv) return null;
    if (mv.category === 'Status') return null;
    const bp = mv.basePower;
    if (!bp || bp <= 0) return { variable: true, move: mv };

    const isPhys = mv.category === 'Physical';
    let atkStat = isPhys ? att.stats.atk : att.stats.spa;
    let defStat = isPhys ? def.stats.def : def.stats.spd;

    // Boosts ofensivos/defensivos
    atkStat = Math.floor(atkStat * boostMult(isPhys ? att.boosts.atk : att.boosts.spa));
    defStat = Math.floor(defStat * boostMult(isPhys ? def.boosts.def : def.boosts.spd));

    // Item ofensivo
    let finalMod = 1;
    const it = toID(att.item);
    if (it === 'choiceband' && isPhys) atkStat = Math.floor(atkStat * 1.5);
    if (it === 'choicespecs' && !isPhys) atkStat = Math.floor(atkStat * 1.5);
    if (it === 'lifeorb') finalMod *= 1.3;
    if (it === 'expertbelt') finalMod *= 1.2; // se aplica solo si supereficaz; aprox.

    // Ability ofensiva (las más comunes)
    const ab = toID(att.ability);
    if ((ab === 'hugepower' || ab === 'purepower') && isPhys) atkStat *= 2;
    if (ab === 'guts' && att.status && isPhys) atkStat = Math.floor(atkStat * 1.5);

    // Efectividad de tipos
    const typeEff = typeMult(mv.type, def.types);
    if (typeEff === 0) return { rolls: new Array(16).fill(0), typeEff: 0, move: mv, isPhys };

    // STAB
    let stab = 1;
    const attTypeIds = att.types.map(toID);
    if (attTypeIds.indexOf(toID(mv.type)) >= 0) stab = (ab === 'adaptability') ? 2 : 1.5;

    // Clima
    let weatherMod = 1;
    const w = currentWeather();
    const mtId = toID(mv.type);
    if (w === 'sun')  { if (mtId === 'fire')  weatherMod = 1.5; if (mtId === 'water') weatherMod = 0.5; }
    if (w === 'rain') { if (mtId === 'water') weatherMod = 1.5; if (mtId === 'fire')  weatherMod = 0.5; }

    // Quemadura (solo físicos, salvo Guts/Facade)
    const burn = att.status === 'brn' && isPhys && ab !== 'guts' && toID(mv.name) !== 'facade';

    // Pantallas del lado defensor (no aplican en crítico, aquí no calculamos crít)
    if (isPhys && (def.screens.reflect || def.screens.auroraveil)) finalMod *= 0.5;
    if (!isPhys && (def.screens.lightscreen || def.screens.auroraveil)) finalMod *= 0.5;

    // Daño base
    let base = Math.floor(Math.floor(Math.floor(Math.floor(2 * att.level / 5 + 2) * bp * atkStat) / defStat) / 50) + 2;
    if (weatherMod !== 1) base = Math.floor(base * weatherMod);

    // 16 tiradas (factor aleatorio 0.85–1.00)
    const rolls = [];
    for (let i = 0; i < 16; i++) {
      let d = Math.floor(base * (85 + i) / 100);
      if (stab !== 1) d = Math.floor(d * stab);
      d = Math.floor(d * typeEff);
      if (burn) d = Math.floor(d / 2);
      if (finalMod !== 1) d = Math.floor(d * finalMod);
      rolls.push(Math.max(1, d));
    }
    return { rolls, typeEff, move: mv, isPhys, stab };
  }

  // Etiqueta de KO según HP actual del defensor
  function koInfo(rolls, curHP) {
    const min = rolls[0], max = rolls[rolls.length - 1];
    if (max <= 0 || curHP <= 0) return { text: '—', danger: 0 };
    const worst = Math.ceil(curHP / min); // peor caso (más golpes)
    const best  = Math.ceil(curHP / max); // mejor caso (menos golpes)
    let text = best === worst ? worst + 'HKO' : best + '-' + worst + 'HKO';
    let danger = worst <= 1 ? 3 : worst <= 2 ? 2 : worst <= 3 ? 1 : 0;
    if (best === 1 && worst > 1) {
      const c = rolls.filter(r => r >= curHP).length;
      text = `${best}-${worst}HKO · ${Math.round(c / rolls.length * 100)}% OHKO`;
      danger = Math.max(danger, 2);
    }
    return { text, danger };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SELECCIÓN DE MOVIMIENTOS
  // ═══════════════════════════════════════════════════════════════════════════

  // Movimientos candidatos del rival: revelados ∪ sets típicos de randbats.
  function getFoeCandidateMoves(foeCp) {
    const revealed = (foeCp.moveTrack || []).map(m => m[0]);
    const revIds = revealed.map(toID);
    const result = [];
    const seen = new Set();

    // 1) Revelados primero (marcados como confirmados)
    for (const name of revealed) {
      const id = toID(name);
      if (seen.has(id)) continue;
      seen.add(id);
      result.push({ name, revealed: true });
    }

    // 2) Predichos por randbats
    const entry = randEntry(foeCp.speciesForme);
    if (entry && entry.roles) {
      const roles = Object.values(entry.roles);
      // Si ya reveló algo, prioriza los roles que contengan esos movimientos
      let matching = roles;
      if (revIds.length) {
        const hit = roles.filter(r => (r.moves || []).some(mv => revIds.indexOf(toID(mv)) >= 0));
        if (hit.length) matching = hit;
      }
      for (const r of matching) {
        for (const mv of (r.moves || [])) {
          const id = toID(mv);
          if (seen.has(id)) continue;
          seen.add(id);
          result.push({ name: mv, revealed: false });
        }
      }
    }
    return result;
  }

  // Mis movimientos: del servidor si están, si no de los revelados.
  function getMyMoves(battle, cp) {
    const sv = getMyServerPokemon(battle, cp);
    if (sv && sv.moves && sv.moves.length) {
      return sv.moves.map(id => {
        const m = DexMove(id);
        return { name: (m && m.name) || id, revealed: true };
      });
    }
    return (cp.moveTrack || []).map(m => ({ name: m[0], revealed: true }));
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CONSTRUCCIÓN DE LA MATRIZ DE AMENAZAS
  // ═══════════════════════════════════════════════════════════════════════════
  function buildMatrix() {
    const battle = getBattle();
    if (!battle) return { ready: false, reason: 'Sin batalla activa' };
    if (!window.Dex || !window.Dex.species) return { ready: false, reason: 'Datos de Showdown no cargados aún' };

    const mySide = battle.mySide;
    const foeSide = battle.farSide;
    if (!mySide || !foeSide) return { ready: false, reason: 'Esperando a los equipos…' };

    const myCp  = mySide.active && mySide.active[0];
    const foeCp = foeSide.active && foeSide.active[0];
    if (!myCp || !foeCp) return { ready: false, reason: 'Esperando a los Pokémon activos…' };

    const me  = buildActor(mySide, myCp, true, battle);
    const foe = buildActor(foeSide, foeCp, false, battle);
    if (!me || !foe) return { ready: false, reason: 'No se pudo leer el estado' };

    // Entrantes: el rival te golpea a ti
    const incoming = [];
    for (const cm of getFoeCandidateMoves(foeCp)) {
      const dmg = estimateDamage(foe, me, cm.name);
      if (!dmg) continue;
      if (dmg.variable) { incoming.push({ name: cm.name, revealed: cm.revealed, variable: true, type: dmg.move.type, category: dmg.move.category }); continue; }
      const ko = koInfo(dmg.rolls, me.curHP);
      incoming.push({
        name: cm.name, revealed: cm.revealed,
        type: dmg.move.type, category: dmg.move.category,
        minPct: dmg.rolls[0] / me.maxhp * 100,
        maxPct: dmg.rolls[15] / me.maxhp * 100,
        ko: ko.text, danger: ko.danger, typeEff: dmg.typeEff,
      });
    }
    incoming.sort((a, b) => (b.maxPct || 0) - (a.maxPct || 0));

    // Salientes: tú golpeas al rival
    const outgoing = [];
    for (const cm of getMyMoves(battle, myCp)) {
      const dmg = estimateDamage(me, foe, cm.name);
      if (!dmg) continue;
      if (dmg.variable) { outgoing.push({ name: cm.name, variable: true, type: dmg.move.type, category: dmg.move.category }); continue; }
      const ko = koInfo(dmg.rolls, foe.curHP);
      outgoing.push({
        name: cm.name,
        type: dmg.move.type, category: dmg.move.category,
        minPct: dmg.rolls[0] / foe.maxhp * 100,
        maxPct: dmg.rolls[15] / foe.maxhp * 100,
        ko: ko.text, danger: ko.danger, typeEff: dmg.typeEff,
      });
    }
    outgoing.sort((a, b) => (b.maxPct || 0) - (a.maxPct || 0));

    return {
      ready: true,
      me: { forme: me.forme, level: me.level, hpPct: me.maxhp ? me.curHP / me.maxhp * 100 : 100, statsReal: me.statsReal },
      foe: { forme: foe.forme, level: foe.level, hpPct: foe.maxhp ? foe.curHP / foe.maxhp * 100 : 100 },
      weather: currentWeather(),
      hasSets: !!RANDSETS,
      incoming, outgoing,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIGURACIÓN (posición, visibilidad)
  // ═══════════════════════════════════════════════════════════════════════════
  const CONFIG_KEY = 'showdown-tm-config';
  function defaultConfig() { return { x: null, y: null, visible: true, showOutgoing: true }; }
  let cfg = (function () {
    try {
      const raw = localStorage.getItem(CONFIG_KEY);
      if (raw) return Object.assign(defaultConfig(), JSON.parse(raw));
    } catch (_) {}
    return defaultConfig();
  })();
  function saveConfig() { try { localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg)); } catch (_) {} }

  // ═══════════════════════════════════════════════════════════════════════════
  // COLORES DE TIPO (para los chips de movimiento)
  // ═══════════════════════════════════════════════════════════════════════════
  const TYPE_COLORS = {
    normal: '#9fa19f', fire: '#e62829', water: '#2980ef', electric: '#fac000',
    grass: '#3fa129', ice: '#3dcef3', fighting: '#ff8000', poison: '#9141cb',
    ground: '#915121', flying: '#81b9ef', psychic: '#ef4179', bug: '#91a119',
    rock: '#afa981', ghost: '#704170', dragon: '#5060e1', dark: '#624d4e',
    steel: '#60a1b8', fairy: '#ef70ef',
  };
  function typeColor(t) { return TYPE_COLORS[toID(t)] || '#888'; }
  function dangerColor(d) { return d >= 3 ? '#ff4d4d' : d === 2 ? '#ff9a3d' : d === 1 ? '#e6c84d' : '#7fb069'; }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER DEL PANEL
  // ═══════════════════════════════════════════════════════════════════════════
  let overlayEl = null;
  let miniBtn = null;

  function ensureOverlay() {
    if (overlayEl) return overlayEl;
    const div = document.createElement('div');
    div.id = 'threat-matrix-overlay';
    Object.assign(div.style, {
      position: 'fixed',
      top: (cfg.y != null ? cfg.y : 90) + 'px',
      left: (cfg.x != null ? cfg.x : 12) + 'px',
      zIndex: 999999,
      width: '270px',
      maxHeight: '80vh',
      overflowY: 'auto',
      background: 'rgba(20,22,28,0.96)',
      color: '#e8e8ea',
      font: '12px/1.35 -apple-system,Segoe UI,Roboto,sans-serif',
      borderRadius: '10px',
      border: '1px solid rgba(255,255,255,0.10)',
      boxShadow: '0 6px 24px rgba(0,0,0,0.55)',
      userSelect: 'none',
      display: cfg.visible ? 'block' : 'none',
    });
    document.body.appendChild(div);
    overlayEl = div;
    makeDraggable(div);
    return div;
  }

  function moveRow(m, side) {
    const tcol = typeColor(m.type);
    const chip = `<span style="display:inline-block;min-width:30px;text-align:center;background:${tcol};
                   color:#fff;border-radius:4px;padding:0 4px;font-size:9px;font-weight:700;
                   text-transform:uppercase;letter-spacing:.3px;">${(m.type || '?').slice(0, 3)}</span>`;
    const catIcon = m.category === 'Physical' ? '🟠' : m.category === 'Special' ? '🔵' : '⚪';
    const revMark = (side === 'in' && m.revealed)
      ? `<span title="Movimiento revelado" style="color:#6fd; font-size:9px;">●</span>` : '';

    if (m.variable) {
      return `<div style="display:flex;align-items:center;gap:5px;padding:3px 9px;">
        ${chip}<span style="flex:1;color:#cfd;">${m.name} ${revMark}</span>
        <span style="color:#888;font-size:10px;">var.</span></div>`;
    }

    const dcol = dangerColor(m.danger);
    const effTag = m.typeEff > 1 ? `<span style="color:#6fd;font-size:9px;">×${m.typeEff}</span>`
                 : m.typeEff < 1 ? `<span style="color:#f99;font-size:9px;">×${m.typeEff}</span>` : '';
    const pctStr = `${m.minPct.toFixed(0)}–${m.maxPct.toFixed(0)}%`;
    const barW = Math.min(100, m.maxPct);

    return `
      <div style="padding:3px 9px;">
        <div style="display:flex;align-items:center;gap:5px;">
          ${chip}
          <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${m.name} ${revMark} ${effTag}</span>
          <span style="color:${dcol};font-weight:700;">${pctStr}</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px;margin-top:1px;">
          <div style="flex:1;height:4px;background:rgba(255,255,255,0.08);border-radius:3px;overflow:hidden;">
            <div style="height:100%;width:${barW}%;background:${dcol};"></div>
          </div>
          <span style="color:${dcol};font-size:9px;min-width:62px;text-align:right;">${m.ko}</span>
        </div>
      </div>`;
  }

  function render() {
    const el = ensureOverlay();
    const data = buildMatrix();

    if (!data.ready) {
      el.innerHTML = headerHTML('⚔️ Threat Matrix') +
        `<div style="padding:14px 12px;color:#888;font-style:italic;">${data.reason}</div>`;
      attachHeaderEvents();
      return;
    }

    const me = data.me, foe = data.foe;
    const weatherIcon = { sun: '☀️', rain: '🌧️', sand: '🏜️', snow: '❄️' }[data.weather] || '';

    let html = headerHTML('⚔️ Threat Matrix');

    // Cabecera del enfrentamiento
    html += `
      <div style="padding:6px 10px;border-bottom:1px solid rgba(255,255,255,0.07);">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="color:#ff8f8f;font-weight:600;">${foe.forme} <span style="color:#888;font-size:10px;">L${foe.level}</span></span>
          <span style="color:#888;font-size:10px;">${foe.hpPct.toFixed(0)}% HP ${weatherIcon}</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:1px;">
          <span style="color:#8fd0ff;font-weight:600;">${me.forme} <span style="color:#888;font-size:10px;">L${me.level}</span></span>
          <span style="color:#888;font-size:10px;">${me.hpPct.toFixed(0)}% HP</span>
        </div>
      </div>`;

    // ENTRANTES: el rival te golpea
    html += `<div style="padding:5px 10px 2px;font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:#ff8f8f;font-weight:700;">
               🛡️ Te hace ${data.hasSets ? '' : '<span style="color:#777;text-transform:none;font-weight:400;">(solo revelados)</span>'}
             </div>`;
    if (data.incoming.length === 0) html += `<div style="padding:4px 10px;color:#777;">Sin movimientos de ataque conocidos</div>`;
    else for (const m of data.incoming) html += moveRow(m, 'in');

    // SALIENTES: tú le golpeas
    if (cfg.showOutgoing) {
      html += `<div style="padding:7px 10px 2px;font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:#8fd0ff;font-weight:700;border-top:1px solid rgba(255,255,255,0.07);margin-top:3px;">
                 ⚔️ Le haces
               </div>`;
      if (data.outgoing.length === 0) html += `<div style="padding:4px 10px;color:#777;">—</div>`;
      else for (const m of data.outgoing) html += moveRow(m, 'out');
    }

    // Aviso
    html += `<div style="padding:5px 10px 7px;font-size:9px;color:#666;line-height:1.25;border-top:1px solid rgba(255,255,255,0.05);margin-top:3px;">
               Estimación (IV31 · EV84 · nat. neutra). El daño real varía según EVs/ítem/ability del rival.
             </div>`;

    el.innerHTML = html;
    attachHeaderEvents();
  }

  function headerHTML(title) {
    return `
      <div id="tm-header" style="display:flex;align-items:center;justify-content:space-between;
           padding:7px 10px;border-bottom:1px solid rgba(255,255,255,0.08);cursor:grab;
           background:rgba(255,255,255,0.03);border-radius:10px 10px 0 0;">
        <span style="font-weight:700;font-size:12px;letter-spacing:.3px;color:#cdd;">${title}</span>
        <span>
          <button id="tm-toggle-out" title="Mostrar/ocultar tu daño" style="background:none;border:none;
                  color:#888;cursor:pointer;font-size:13px;padding:0 4px;">⚔️</button>
          <button id="tm-close" title="Ocultar panel" style="background:none;border:none;
                  color:#888;cursor:pointer;font-size:16px;line-height:1;padding:0 2px;">×</button>
        </span>
      </div>`;
  }

  function attachHeaderEvents() {
    const closeBtn = overlayEl.querySelector('#tm-close');
    if (closeBtn) closeBtn.onclick = (e) => {
      e.stopPropagation();
      cfg.visible = false; saveConfig();
      overlayEl.style.display = 'none';
      showMiniButton();
    };
    const outBtn = overlayEl.querySelector('#tm-toggle-out');
    if (outBtn) outBtn.onclick = (e) => {
      e.stopPropagation();
      cfg.showOutgoing = !cfg.showOutgoing; saveConfig();
      render();
    };
  }

  function showMiniButton() {
    if (!miniBtn) {
      miniBtn = document.createElement('div');
      miniBtn.textContent = '⚔️';
      Object.assign(miniBtn.style, {
        position: 'fixed', bottom: '14px', left: '14px', zIndex: 999999,
        width: '38px', height: '38px', borderRadius: '50%',
        background: 'rgba(20,22,28,0.96)', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '18px', cursor: 'pointer',
        border: '1px solid rgba(255,255,255,0.15)',
        boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
      });
      miniBtn.title = 'Mostrar Threat Matrix';
      miniBtn.onclick = () => {
        cfg.visible = true; saveConfig();
        miniBtn.style.display = 'none';
        if (overlayEl) overlayEl.style.display = 'block';
        render();
      };
      document.body.appendChild(miniBtn);
    }
    miniBtn.style.display = 'flex';
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ARRASTRE DEL PANEL
  // ═══════════════════════════════════════════════════════════════════════════
  function makeDraggable(el) {
    let sx = 0, sy = 0, ox = 0, oy = 0, dragging = false;
    el.addEventListener('mousedown', (e) => {
      const header = el.querySelector('#tm-header');
      if (!header || !header.contains(e.target)) return;
      if (e.target.tagName === 'BUTTON') return;
      dragging = true;
      sx = e.clientX; sy = e.clientY;
      const r = el.getBoundingClientRect();
      ox = r.left; oy = r.top;
      e.preventDefault();
    });
    document.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      const nx = ox + (e.clientX - sx);
      const ny = oy + (e.clientY - sy);
      el.style.left = nx + 'px';
      el.style.top = ny + 'px';
    });
    document.addEventListener('mouseup', () => {
      if (!dragging) return;
      dragging = false;
      const r = el.getBoundingClientRect();
      cfg.x = Math.round(r.left); cfg.y = Math.round(r.top);
      saveConfig();
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // BUCLE DE ACTUALIZACIÓN
  // ═══════════════════════════════════════════════════════════════════════════
  let renderTimer = null;
  function scheduleRender() {
    if (renderTimer) return;
    renderTimer = setTimeout(() => { renderTimer = null; try { render(); } catch (e) { log('render error', e); } }, 120);
  }

  function init() {
    loadSets();
    const wait = setInterval(() => {
      if (!getBattle()) return;
      clearInterval(wait);
      log('Batalla detectada. Iniciando panel.');
      render();
      // Re-render periódico (lee el motor de batalla, barato)
      setInterval(() => scheduleRender(), 700);
      // Y reacciona a cambios del DOM del log
      const obs = new MutationObserver(() => scheduleRender());
      const logEl = document.querySelector('.battle-log') || document.body;
      obs.observe(logEl, { childList: true, subtree: true, characterData: true });
    }, 500);
  }

  init();
  log('v2.0.0 loaded');

})();
