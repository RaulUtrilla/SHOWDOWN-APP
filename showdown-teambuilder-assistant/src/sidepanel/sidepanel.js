// ═══════════════════════════════════════════════════════════════════════════
// sidepanel.js — UI principal: lista equipos por formato, búsqueda por
// especie/autor/arquetipo, vista previa con sprites, y acciones de
// "Copiar" / "Importar a Showdown".
// ═══════════════════════════════════════════════════════════════════════════
(function () {
  const ALL_FORMATS = [{ id: 'all', name: 'Todos los formatos' }, ...window.TBA.FORMATS];

  let TEAMS = [];
  let currentFormat = 'gen9ou';
  let searchQuery = '';
  const expanded = new Set();

  const els = {
    format: document.getElementById('tba-format'),
    search: document.getElementById('tba-search'),
    list: document.getElementById('tba-list'),
    status: document.getElementById('tba-status'),
    count: document.getElementById('tba-count'),
  };

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
  }

  function formatName(id) {
    const f = window.TBA.FORMATS.find((f) => f.id === id);
    return f ? f.name : id;
  }

  // ── Carga inicial ────────────────────────────────────────────────────────
  async function init() {
    populateFormats();

    try {
      const stored = await chrome.storage.local.get(['favFormat']);
      if (stored.favFormat && ALL_FORMATS.some((f) => f.id === stored.favFormat)) {
        currentFormat = stored.favFormat;
      }
    } catch (_) {}
    els.format.value = currentFormat;

    els.format.addEventListener('change', () => {
      currentFormat = els.format.value;
      try { chrome.storage.local.set({ favFormat: currentFormat }); } catch (_) {}
      render();
    });
    els.search.addEventListener('input', () => {
      searchQuery = els.search.value.trim().toLowerCase();
      render();
    });

    await loadTeams();
    render();
  }

  function populateFormats() {
    els.format.innerHTML = '';
    for (const f of ALL_FORMATS) {
      const opt = document.createElement('option');
      opt.value = f.id;
      opt.textContent = f.name;
      els.format.appendChild(opt);
    }
  }

  async function loadTeams() {
    try {
      const url = chrome.runtime.getURL('data/teams.json');
      const res = await fetch(url);
      const data = await res.json();
      TEAMS = Array.isArray(data) ? data : [];
      for (const t of TEAMS) t._sets = window.TBA.parseExport(t.export || '');
    } catch (err) {
      els.status.textContent = 'Error cargando teams.json: ' + err;
      TEAMS = [];
    }
  }

  // ── Filtrado ────────────────────────────────────────────────────────────
  function matchesSearch(team, q) {
    if (!q) return true;
    if ((team.name || '').toLowerCase().includes(q)) return true;
    if ((team.author || '').toLowerCase().includes(q)) return true;
    if ((team.description || '').toLowerCase().includes(q)) return true;
    if ((team.tags || []).some((t) => t.toLowerCase().includes(q))) return true;
    if ((team._sets || []).some((s) =>
      (s.species || '').toLowerCase().includes(q) || (s.name || '').toLowerCase().includes(q)
    )) return true;
    return false;
  }

  // ── Render ──────────────────────────────────────────────────────────────
  function render() {
    const filtered = TEAMS.filter((t) =>
      (currentFormat === 'all' || t.format === currentFormat) && matchesSearch(t, searchQuery)
    );

    els.count.textContent = filtered.length + ' equipo' + (filtered.length === 1 ? '' : 's');
    els.list.innerHTML = '';

    if (!filtered.length) {
      const empty = document.createElement('div');
      empty.className = 'tba-empty';
      empty.innerHTML = TEAMS.length
        ? 'No hay equipos para este filtro todavía.<br>Añade más en <code>data/teams.json</code>.'
        : 'No se han podido cargar equipos. Revisa <code>data/teams.json</code>.';
      els.list.appendChild(empty);
      return;
    }

    for (const team of filtered) els.list.appendChild(renderCard(team));
  }

  function renderCard(team) {
    const card = document.createElement('section');
    card.className = 'tba-card';
    const isExpanded = expanded.has(team.id);

    const header = document.createElement('div');
    header.className = 'tba-card-header';
    header.innerHTML = `
      <div class="tba-card-title">
        <strong>${escapeHtml(team.name)}</strong>
        <span class="tba-card-format">${escapeHtml(formatName(team.format))}</span>
      </div>
      <div class="tba-card-meta">${escapeHtml(team.author || '')}</div>
      ${team.description ? `<div class="tba-card-desc">${escapeHtml(team.description)}</div>` : ''}
    `;
    card.appendChild(header);

    const sprites = document.createElement('div');
    sprites.className = 'tba-sprites';
    for (const set of team._sets || []) sprites.appendChild(renderSprite(set));
    card.appendChild(sprites);

    if (team.tags && team.tags.length) {
      const tagsEl = document.createElement('div');
      tagsEl.className = 'tba-card-tags';
      tagsEl.innerHTML = team.tags.map((t) => `<span class="tba-tag">${escapeHtml(t)}</span>`).join('');
      card.appendChild(tagsEl);
    }

    card.appendChild(renderActions(team, isExpanded));

    if (isExpanded) {
      const details = document.createElement('div');
      details.className = 'tba-details';
      for (const set of team._sets || []) details.appendChild(renderSetDetail(set));
      card.appendChild(details);
    }

    return card;
  }

  function renderSprite(set) {
    const wrap = document.createElement('div');
    wrap.className = 'tba-sprite';
    const img = document.createElement('img');
    const label = set.name ? `${set.name} (${set.species})` : (set.species || '?');
    img.alt = set.species || '?';
    img.title = label;

    const urls = window.TBA.spriteUrls(set.species || '');
    const fallback = chrome.runtime.getURL('icons/icon48.png');
    let i = 0;
    img.src = urls[0];
    img.addEventListener('error', () => {
      i++;
      img.src = i < urls.length ? urls[i] : fallback;
    });

    wrap.appendChild(img);
    return wrap;
  }

  function renderSetDetail(set) {
    const div = document.createElement('div');
    div.className = 'tba-set';
    const title = set.name ? `${set.name} (${set.species})` : (set.species || '?');
    const STAT_KEYS = window.TBA.STAT_KEYS;
    const STAT_LABELS = window.TBA.STAT_LABELS;
    const evs = STAT_KEYS.filter((k) => set.evs[k]).map((k) => `${set.evs[k]} ${STAT_LABELS[k]}`).join(' / ');
    const ivs = STAT_KEYS.filter((k) => set.ivs[k] != null).map((k) => `${set.ivs[k]} ${STAT_LABELS[k]}`).join(' / ');

    const extras = [];
    if (set.item) extras.push(escapeHtml(set.item));
    if (set.ability) extras.push(escapeHtml(set.ability));
    if (set.teraType) extras.push('Tera ' + escapeHtml(set.teraType));
    if (set.level) extras.push('Lv. ' + set.level);
    if (set.shiny) extras.push('✨ Shiny');
    if (set.gigantamax) extras.push('Gigantamax');

    div.innerHTML = `
      <div class="tba-set-title">${escapeHtml(title)}${set.gender ? ' (' + set.gender + ')' : ''}</div>
      ${extras.length ? `<div class="tba-set-line">${extras.join(' · ')}</div>` : ''}
      ${evs ? `<div class="tba-set-line">EVs: ${escapeHtml(evs)}</div>` : ''}
      ${set.nature ? `<div class="tba-set-line">${escapeHtml(set.nature)} Nature</div>` : ''}
      ${ivs ? `<div class="tba-set-line">IVs: ${escapeHtml(ivs)}</div>` : ''}
      <div class="tba-set-moves">${(set.moves || []).map((m) => `<span class="tba-move">${escapeHtml(m)}</span>`).join('')}</div>
    `;
    return div;
  }

  function renderActions(team, isExpanded) {
    const actions = document.createElement('div');
    actions.className = 'tba-actions';

    const detailsBtn = document.createElement('button');
    detailsBtn.className = 'tba-btn tba-btn-ghost';
    detailsBtn.textContent = isExpanded ? 'Ocultar set ▲' : 'Ver set ▼';
    detailsBtn.addEventListener('click', () => {
      if (expanded.has(team.id)) expanded.delete(team.id);
      else expanded.add(team.id);
      render();
    });
    actions.appendChild(detailsBtn);

    if (team.source) {
      const srcLink = document.createElement('a');
      srcLink.className = 'tba-btn tba-btn-ghost';
      srcLink.textContent = 'Fuente ↗';
      srcLink.href = team.source;
      srcLink.target = '_blank';
      srcLink.rel = 'noopener noreferrer';
      actions.appendChild(srcLink);
    }

    const copyBtn = document.createElement('button');
    copyBtn.className = 'tba-btn';
    copyBtn.textContent = 'Copiar';
    copyBtn.addEventListener('click', () => copyTeam(team, copyBtn));
    actions.appendChild(copyBtn);

    const importBtn = document.createElement('button');
    importBtn.className = 'tba-btn tba-btn-primary';
    importBtn.textContent = 'Importar a Showdown';
    importBtn.addEventListener('click', () => importTeam(team, importBtn));
    actions.appendChild(importBtn);

    return actions;
  }

  // ── Acciones ────────────────────────────────────────────────────────────
  function flash(btn, text, ms) {
    const original = btn.textContent;
    btn.textContent = text;
    btn.disabled = true;
    setTimeout(() => { btn.textContent = original; btn.disabled = false; }, ms || 1600);
  }

  let statusTimeout;
  function showStatus(text, ms) {
    if (!text) return;
    clearTimeout(statusTimeout);
    els.status.textContent = text;
    statusTimeout = setTimeout(() => { els.status.textContent = ''; }, ms || 8000);
  }

  async function copyTeam(team, btn) {
    try {
      await navigator.clipboard.writeText(team.export || '');
      if (btn) flash(btn, '✅ Copiado');
      return true;
    } catch (err) {
      if (btn) flash(btn, '⚠️ Error al copiar');
      return false;
    }
  }

  async function importTeam(team, btn) {
    let tab;
    try {
      [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    } catch (_) {}

    if (!tab || !/^https:\/\/play\.pokemonshowdown\.com\//.test(tab.url || '')) {
      await copyTeam(team);
      flash(btn, '📋 Abre Showdown (copiado)');
      return;
    }

    try {
      const resp = await chrome.tabs.sendMessage(tab.id, { type: 'TBA_IMPORT_TEAM', export: team.export });
      if (resp && resp.ok && resp.saved) {
        flash(btn, '✅ Importado', 2400);
        showStatus(resp.note);
      } else if (resp && resp.ok) {
        await copyTeam(team);
        flash(btn, '📋 Pegado, pulsa Guardar');
      } else {
        await copyTeam(team);
        flash(btn, '📋 No se pudo auto-pegar (copiado)', 2400);
      }
    } catch (err) {
      await copyTeam(team);
      flash(btn, '📋 Copiado — pégalo en Import/Export', 2400);
    }
  }

  init();
})();
