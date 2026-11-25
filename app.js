// Charakterbogen – läuft komplett im Browser, Daten bleiben auf dem Gerät (localStorage).
(() => {
  'use strict';
  const R = window.RULES;
  const KEY = 'charakterbogen-v1';
  const $ = (s, el = document) => el.querySelector(s);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uid = () => Math.random().toString(36).slice(2, 10);
  const num = (v, d = 0) => { const n = parseInt(v, 10); return Number.isFinite(n) ? n : d; };

  // ---------- Daten ----------
  function newChar(name = 'Neuer Charakter', klass = 'zauberer') {
    return {
      id: uid(), name, klass, sub: '', alter: '', rasse: '', groesse: '',
      level: 0, lpCur: null, lpExtra: 0, resCur: null, resBase: 0, resExtra: 0,
      atk: 0, def: 0, saves: [], vorteil: '', nachteil: '',
      money: { g: 0, s: 0, k: 0 },
      attrSlots: Array.from({ length: 10 }, () => ({ skill: '', stufe: 0, check: false })),
      classSlots: Array.from({ length: 10 }, () => ({ name: '', text: '', stufe: 0, check: false })),
      aspects: {}, techniques: {}, items: [], freeItems: [], slotExtra: 0, notes: '',
    };
  }
  function hicks() {
    const c = newChar('Hicks', 'zauberer');
    c.player = 'Joshua';
    c.slotExtra = 6; // Hicks hat 9 Inventarslots (3 Grund + 6)
    c.level = 1;
    c.laufName = 'Joshua';
    c.notes = 'Ansichten der Dorfbewohner über Hicks:\nKleiner Quatschkopf/Chaot, will sich beweisen, macht aus vielem einen Wettbewerb, irgendwie sympathisch. Die Kinder im Dorf finden ihn gleichermaßen seltsam wie lustig (wie ein cooler Opa); verbreitet gute Laune.\n\nHeimatdorf: Hella (einen Tagesritt südlich von Hallrodon).';
    return c;
  }
  function vince() {
    const c = newChar('Vince La Grak', 'handwerker');
    c.id = 'vince-la-grak'; c.player = 'Kim';
    c.slotExtra = 6; // Vince hat 9 Inventarslots (3 Grund + 6)
    c.level = 1;
    c.laufName = 'Kim';
    c.notes = 'Ansichten der Dorfbewohner über Vince La Grak:\nHöflich, ruhig; lässt sich aber gern, vor allem von Hicks, zu Quatsch verleiten, ist aber dennoch bedacht und bedenkt die Konsequenzen seines Handelns; hält Hicks’ Schabernack auch oft im Zaum; viele Damen im Dorf finden ihn attraktiv.\n\nHeimatdorf: Hella (einen Tagesritt südlich von Hallrodon).';
    return c;
  }
  // Fertige Charaktere der Kampagne (zur Auswahl beim ersten Start und unter „Neuer Charakter“).
  const PRESETS = [
    { make: hicks, name: 'Hicks', klass: 'zauberer', who: 'Joshua' },
    { make: vince, name: 'Vince La Grak', klass: 'handwerker', who: 'Kim' },
  ];
  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(KEY));
      if (s && Array.isArray(s.chars) && s.chars.length) return s;
    } catch (e) { /* leer oder gesperrt */ }
    const c = hicks();
    return { chars: [c], current: c.id, tab: 'bogen', sheet: 'zauber', firstRun: true };
  }
  // Einträge in Listen bekommen eine feste Kennung, damit der Abgleich sie zuordnen kann.
  function withIds(st) {
    (st.chars || []).forEach((c) => {
      if (c.laufName === undefined) { const pr = PRESETS.find((x) => x.name.toLowerCase() === String(c.name).trim().toLowerCase()); if (pr) c.laufName = pr.who; }
      if (c.points === undefined) c.points = c.level > 0 ? R.levelPoints[Math.min(c.level, R.levelPoints.length) - 1] : 0;
      if (c.guild === undefined) c.guild = 0;
    });
    (st.chars || []).forEach((c) => ['items', 'freeItems'].forEach((l) => (c[l] || []).forEach((it) => { it.id ||= uid(); })));
    return st;
  }
  let S = withIds(load());
  // Spieler: jeder Charakter gehört zu einem Spieler. Einmalig: Joshua (Hicks) und Kim (Vince La Grak) anlegen.
  function initPlayers() {
    S.chars.forEach((c) => {
      if (c.player) return;
      const pr = PRESETS.find((x) => x.name.toLowerCase() === String(c.name).trim().toLowerCase());
      c.player = pr ? pr.who : 'Joshua';
    });
    if (!S.playersV1 && !S.firstRun) {
      S.playersV1 = true;
      if (!S.chars.some((c) => c.name === 'Vince La Grak')) S.chars.push(withIds({ chars: [vince()] }).chars[0]);
    }
    S.players = [...new Set([...(S.players || []), ...S.chars.map((c) => c.player)])];
    // Einmalig: Hicks und Vince La Grak bekommen 9 Inventarslots (neue Charaktere starten weiter mit 3).
    if (!S.slots9V1) {
      S.slots9V1 = true;
      S.chars.forEach((c) => { if (['Hicks', 'Vince La Grak'].includes(c.name)) c.slotExtra = Math.max(num(c.slotExtra), 6); });
    }
    // Einmalig: Vince La Grak ist Handwerker (nicht Künstler).
    if (!S.vinceHandwerkerV1) {
      S.vinceHandwerkerV1 = true;
      S.chars.forEach((c) => { if (c.name === 'Vince La Grak' && c.klass === 'kuenstler') { c.klass = 'handwerker'; c.sub = ''; S.sheetFor = null; } });
    }
  }
  initPlayers();
  try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* kein Speicher */ }
  function syncPlayers() { S.players = [...new Set([...(S.players || []), ...S.chars.map((c) => c.player).filter(Boolean)])]; }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* kein Speicher */ } }
  const ch = () => S.chars.find((c) => c.id === S.current) || S.chars[0];

  // ---------- Regeln ----------
  const klassOf = (c) => R.classes[c.klass] || R.classes.zauberer;
  const attrInfo = {};
  R.attributeGroups.forEach((g, gi) => g.skills.forEach(([n, d], i) => { attrInfo[n] = { group: gi, idx: i, color: g.color, desc: d, last: i === g.skills.length - 1 }; }));
  const attrStufe = (c, name) => (c.attrSlots.find((s) => s.skill === name) || {}).stufe || 0;
  function lockedReason(c, name) {
    const info = attrInfo[name];
    if (!info || !info.last) return '';
    const missing = R.attributeGroups[info.group].skills.slice(0, -1).map(([n]) => n).filter((n) => attrStufe(c, n) < 1);
    return missing.length ? 'Erst skillbar, wenn diese mindestens Stufe 1 haben: ' + missing.join(', ') : '';
  }
  // Boni pro Levelaufstieg laut Tabelle (Aufstieg von Level i auf i+1 nutzt die Zeile von Level i).
  const bonusAt = (i) => [...R.levelBonus].reverse().find((b) => i >= b.from) || R.levelBonus[0];
  const bonusSum = (level, k) => { let t = 0; for (let i = 0; i < level; i++) t += bonusAt(i)[k]; return t; };
  const levelFromPoints = (p) => R.levelPoints.filter((x) => p >= x).length;
  const lpMax = (c) => R.startLP + bonusSum(c.level, 'lp') + 2 * attrStufe(c, 'Lebenspunktebonus') + num(c.lpExtra);
  const resMax = (c) => num(c.resBase) + bonusSum(c.level, 'res') + attrStufe(c, 'Kampfgeist') + num(c.resExtra);
  const levelPointsTotal = (c) => bonusSum(c.level, 'attr');
  const saveCount = (c) => 5 + attrStufe(c, 'Überlebenskunst');
  const spentPoints = (c) => num(c.atk) + num(c.def) + c.attrSlots.reduce((a, s) => a + (s.skill ? num(s.stufe) : 0), 0);
  const cur = (v, max) => (v === null || v === undefined ? max : Math.min(v, max));

  const sheetDef = (k) => R.sheets.find((s) => s.key === k) || R.sheets[0];
  const aspectKey = (sheet, chart, aspect) => `${sheet}.${chart}.${aspect}`;
  const aspectState = (c, k) => (c.aspects[k] ||= { punkte: 0, spent: 0 });
  // Die Punkte werden in den Feldern (Ringen) gesammelt. Die Stufe ergibt sich automatisch aus den gesammelten Punkten.
  const ringStufe = (k, st) => (R.baseThresholds[sheetDef(k.split('.')[0]).thresholds] || R.baseThresholds.normal).filter((x) => num(st && st.punkte) >= x).length;
  const ringAvail = (st) => Math.max(0, num(st && st.punkte) - num(st && st.spent));
  const ringName = (k) => k.split('.').slice(2).join('.');
  // Stufe einer Technik = niedrigste Stufe ihrer Felder (Würfelbonus beim Anwenden).
  const techStufe = (c, t) => (t.aspects.length ? Math.min(...t.aspects.map((k) => ringStufe(k, c.aspects[k]))) : 0);
  const baseNeed = (sheet, stufe) => (R.baseThresholds[sheetDef(sheet).thresholds] || R.baseThresholds.normal)[stufe];

  function teachNote(stufe) {
    if (stufe >= R.masterFrom) return 'Nächste Stufe nur bei einem Meister (Lehre).';
    if (stufe >= R.teacherFrom) return 'Für die nächste Stufe braucht es jemanden, der sie beibringt.';
    return '';
  }

  // ---------- Darstellung ----------
  // Im dunklen Modus wird die helle Klassenfarbe durch eine dunkle Tönung ersetzt, damit Text lesbar bleibt.
  const darkMode = window.matchMedia('(prefers-color-scheme: dark)');
  function mixHex(a, b, t) {
    const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
    const [x, y] = [p(a), p(b)];
    return '#' + x.map((v, i) => Math.round(v * t + y[i] * (1 - t)).toString(16).padStart(2, '0')).join('');
  }
  if (darkMode.addEventListener) darkMode.addEventListener('change', () => applyTheme());
  function applyTheme() {
    const k = klassOf(ch());
    document.documentElement.style.setProperty('--c', k.color);
    const lum = (h) => { const [r, g, b] = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255); return 0.299 * r + 0.587 * g + 0.114 * b; };
    document.documentElement.style.setProperty('--on-c', lum(k.color) > 0.6 ? '#2b2230' : '#ffffff');
    document.documentElement.style.setProperty('--cl', darkMode.matches ? mixHex(k.color, '#221e26', 0.3) : k.light);
    $('meta[name=theme-color]').setAttribute('content', k.color);
    $('#title').textContent = ch().name || 'Charakterbogen';
    $('#subtitle').textContent = [k.name, ch().sub ? ch().sub.split(' (')[0] : 'Neutral'].join(' · ');
    document.title = (ch().name || 'Charakterbogen') + ' – Charakterbogen';
  }
  function render() {
    if (S.sheetFor !== S.current) { const own = R.sheets.find((x) => x.klass === ch().klass); if (own) S.sheet = own.key; S.sheetFor = S.current; }
    applyTheme();
    document.querySelectorAll('#tabs button').forEach((b) => b.classList.toggle('on', b.dataset.tab === S.tab));
    const y = window.scrollY;
    $('#view').innerHTML = ({ bogen, faehigkeiten, techniken, inventar, notizen }[S.tab] || bogen)(ch());
    window.scrollTo(0, y);
  }
  const change = (fn) => { fn(ch()); save(); render(); };

  function stat(label, value, max, act, note = '') {
    return `<div class="stat"><div class="lbl">${label}</div>
      <div class="val">${value}${max !== undefined ? `<small> / ${max}</small>` : ''}</div>${note ? `<div class="hint" style="margin:0">${note}</div>` : ''}
      <div class="stepper"><button class="btn" data-act="${act}" data-d="-1">−</button><button class="btn" data-act="${act}" data-d="1">+</button></div></div>`;
  }

  function bogen(c) {
    const k = klassOf(c);
    const lm = lpMax(c), rm = resMax(c);
    const free = levelPointsTotal(c) - spentPoints(c);
    const lz = c.lauf;
    const subs = Object.keys(R.subclasses[c.klass] || {});
    const n = saveCount(c);
    return `
    <section class="card">
      <h2>Charakter <button class="edit-btn" data-act="editChar" aria-label="Charakterangaben bearbeiten">✎</button></h2>
      <div class="charname">${esc(c.name)}</div>
      <div class="grid2">
        <div class="ro"><span>Klasse</span><b>${esc(k.name)}</b></div>
        <div class="ro"><span>Aktuelle Ausrichtung</span><b>${esc(c.sub ? c.sub.split(' (')[0] : 'Neutral')}</b></div>
      </div>
      <div class="grid3">
        <div class="ro"><span>Alter</span><b>${esc(c.alter) || '–'}</b></div>
        <div class="ro"><span>Rasse</span><b>${esc(c.rasse) || '–'}</b></div>
        <div class="ro"><span>Größe</span><b>${esc(c.groesse) || '–'}</b></div>
      </div>
    </section>

    <section class="stats">
      ${stat('Lebenspunkte', cur(c.lpCur, lm), lm, 'lp')}
      ${stat(k.resource, cur(c.resCur, rm), rm, 'res')}
      <div class="stat stat-info"><button class="info-i" data-act="levelInfo" aria-label="Level-Infos">i</button><div class="lbl">Level</div><div class="val">${c.level}</div>
        ${levelBar(c)}</div>
      <div class="stat"><div class="lbl">Punkte zu verteilen</div><div class="val">${free}</div>
        <div class="hint" style="margin:4px 0 0">für ATK, DEF oder Attributfähigkeit</div></div>
      ${stat('ATK', c.atk + gearBonus(c, 'atk'), undefined, 'atk', gearBonus(c, 'atk') ? `${c.atk} geskillt ${gearBonus(c, 'atk') > 0 ? '+' : '−'} ${Math.abs(gearBonus(c, 'atk'))} Ausrüstung` : '')}
      ${stat('DEF', c.def + gearBonus(c, 'def'), undefined, 'def', gearBonus(c, 'def') ? `${c.def} geskillt ${gearBonus(c, 'def') > 0 ? '+' : '−'} ${Math.abs(gearBonus(c, 'def'))} Ausrüstung` : '')}
    </section>
    ${free < 0 ? '<p class="warn">Es sind mehr Punkte verteilt, als das Level hergibt.</p>' : ''}

    ${pointsCard(c)}
    ${alignCard(c)}
    <section class="card" style="margin-top:12px">
      <h2>Rettungswürfe <small>${n - c.saves.filter((_, i) => i < n && c.saves[i]).length} übrig</small></h2>
      <div class="saves">${Array.from({ length: n }, (_, i) => `<button class="save${c.saves[i] ? ' used' : ''}" data-act="save" data-i="${i}" aria-label="Rettungswurf ${i + 1}"></button>`).join('')}</div>
      <p class="hint">Antippen = verbraucht. Überlebenskunst gibt pro Stufe einen Kreis mehr.</p>
    </section>

    <section class="card">
      <h2>Vorteil / Nachteil</h2>
      <label class="f">Vorteil<input data-bind="vorteil" value="${esc(c.vorteil)}" placeholder="Notiz"></label>
      <label class="f">Nachteil<input data-bind="nachteil" value="${esc(c.nachteil)}" placeholder="Notiz"></label>
    </section>

    ${moneyCard(c)}

    <section class="card">
      <h2>Grundwerte <small>für Korrekturen</small></h2>
      <div class="grid3">
        <label class="f">${k.resource} Start<input type="number" inputmode="numeric" data-bindn="resBase" value="${num(c.resBase)}"></label>
        <label class="f">${k.resource} Zusatz<input type="number" inputmode="numeric" data-bindn="resExtra" value="${num(c.resExtra)}"></label>
        <label class="f">LP Zusatz<input type="number" inputmode="numeric" data-bindn="lpExtra" value="${num(c.lpExtra)}"></label>
      </div>
      <label class="f">Name im Laufzettel der DM<input data-bind="laufName" value="${esc(c.laufName || '')}" placeholder="z. B. Joshua"></label>
      <p class="hint">LP max = ${R.startLP} + Boni je Levelaufstieg (laut Tabelle) + 2 je Stufe Lebenspunktebonus + Zusatz.
        ${k.resource} max = Start + Boni je Levelaufstieg + Stufe Kampfgeist + Zusatz.</p>
    </section>`;
  }

  function faehigkeiten(c) {
    const sub = (R.subclasses[c.klass] || {})[c.sub] || [];
    const used = c.attrSlots.filter((s) => s.skill).length;
    return `
    <section class="card">
      <h2>Levelpunkte <span class="row"><small>Attributfähigkeiten ${used}/10</small><button class="btn small" data-act="attrCatalog">Katalog</button></span></h2>
      ${c.attrSlots.map((s, i) => {
        const info = attrInfo[s.skill];
        if (!s.skill) return `<div class="slot empty"><span class="dot" style="background:var(--line)"></span><button class="name btn small" style="text-align:left" data-act="pickAttr" data-i="${i}">+ Fähigkeit wählen</button></div>`;
        return `<div class="slot"><span class="dot" style="background:${info ? info.color : 'var(--line)'}"></span>
          <div class="name" data-act="pickAttr" data-i="${i}"><b>${esc(s.skill)}</b><small>${esc(info ? info.desc : '')}</small></div>
          <button class="btn small" data-act="attrStufe" data-i="${i}" data-d="-1" aria-label="Stufe senken">−</button>
          <button class="btn small" data-act="attrStufe" data-i="${i}" data-d="1" aria-label="Stufe erhöhen">+</button>
          <span class="lvl" title="Stufe">${s.stufe}</span></div>`;
      }).join('')}
      <p class="hint">Die unterste Fähigkeit jeder Farbe ist erst skillbar, wenn die anderen fünf derselben Farbe mindestens Stufe 1 haben.</p>
    </section>
    <section class="card">
      <h2>Klassenpunkte <span class="row"><small>${esc(c.sub ? c.sub.split(' (')[0] : 'Neutral')}</small><button class="btn small" data-act="catalog">Katalog</button></span></h2>
      ${c.classSlots.map((s, i) => {
        if (!s.name) return `<div class="slot empty"><span class="dot" style="background:var(--line)"></span><button class="name btn small" style="text-align:left" data-act="pickClass" data-i="${i}">+ Klassenfähigkeit wählen</button></div>`;
        const a = findAbility(c, s);
        const other = a && a.sub !== c.sub;
        return `<div class="slot"><span class="dot" style="background:${other ? 'var(--line)' : 'var(--c)'}"></span>
          <div class="name" data-act="pickClass" data-i="${i}"><b>${esc(s.name)}</b><small>${other ? `<i>aus ${esc(a.sub.split(' (')[0])} · </i>` : ''}${esc(a ? a.desc : s.text)}</small></div>
          <button class="btn small" data-act="classStufe" data-i="${i}" data-d="-1" aria-label="Stufe senken">−</button>
          <button class="btn small" data-act="classStufe" data-i="${i}" data-d="1" aria-label="Stufe erhöhen">+</button>
          <span class="lvl" title="Stufe">${s.stufe}</span></div>`;
      }).join('')}
      <p class="hint">Klassenfähigkeiten haben die Stufen 1–6. Wählbar sind nur die Fähigkeiten der aktuellen Ausrichtung (Reiter „Bogen“). Fähigkeiten aus einer früheren Ausrichtung bleiben stehen und sind grau markiert.</p>
    </section>`;
  }

  // Kreis als SVG: 8 Ringe = Stufen, Abschnitt n gefüllt bis zur Stufe.
  function chartSvg(c, sheet, chart) {
    const N = chart.aspects.length, size = 300, cx = 150, cy = 150, rMax = 100, rings = 8;
    const start = -Math.PI / 2; // oben, im Uhrzeigersinn
    const pt = (r, a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
    const wedge = (r, a0, a1) => {
      if (r <= 0) return '';
      if (N === 1) return `M${cx - r},${cy}a${r},${r} 0 1,0 ${2 * r},0a${r},${r} 0 1,0 ${-2 * r},0`;
      const [x0, y0] = pt(r, a0), [x1, y1] = pt(r, a1);
      return `M${cx},${cy}L${x0},${y0}A${r},${r} 0 ${a1 - a0 > Math.PI ? 1 : 0},1 ${x1},${y1}Z`;
    };
    let out = `<svg viewBox="-75 0 ${size + 150} ${size}" role="img" aria-label="${esc(chart.label || sheet.title)}">`;
    chart.aspects.forEach((asp, i) => {
      const a0 = start + (i * 2 * Math.PI) / N, a1 = start + ((i + 1) * 2 * Math.PI) / N;
      const ak = aspectKey(sheet.key, chart.key, asp), st = c.aspects[ak] || {}, sf = ringStufe(ak, st);
      const r = (Math.min(sf, rings) / rings) * rMax;
      const am = (a0 + a1) / 2;
      out += `<path class="seg" d="${wedge(rMax, a0, a1)}" fill="transparent" data-act="aspect" data-k="${esc(aspectKey(sheet.key, chart.key, asp))}"/>`;
      if (r) out += `<path d="${wedge(r, a0, a1)}" fill="var(--c)" opacity="${sf > rings ? 0.95 : 0.55}" pointer-events="none"/>`;
      const [lx, ly] = pt(rMax + 22, am);
      const anchor = Math.abs(Math.cos(am)) < 0.3 ? 'middle' : Math.cos(am) > 0 ? 'start' : 'end';
      out += `<text x="${lx}" y="${ly}" text-anchor="${anchor}" dominant-baseline="middle" pointer-events="none">${esc(asp)}</text>`;
      out += `<text class="num" x="${lx}" y="${ly + 16}" text-anchor="${anchor}" dominant-baseline="middle" pointer-events="none">${sf}${st.punkte ? ` · ${st.punkte} P` : ''}</text>`;
    });
    for (let k = 1; k <= rings; k++) out += `<circle cx="${cx}" cy="${cy}" r="${(k / rings) * rMax}" fill="none" stroke="var(--line)" pointer-events="none"/>`;
    for (let i = 0; i < N && N > 1; i++) {
      const [x, y] = pt(rMax + 6, start + (i * 2 * Math.PI) / N);
      out += `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="var(--ink)" stroke-width="1.2" pointer-events="none"/>`;
    }
    return out + '</svg>';
  }

  function techniken(c) {
    const sheet = sheetDef(S.sheet);
    const list = c.techniques[sheet.key] || [];
    const own = sheet.klass === c.klass;
    return `
    <div class="sheet-tabs">${[...R.sheets].sort((a, b) => (b.klass === c.klass) - (a.klass === c.klass)).map((s) => `<button data-act="sheet" data-k="${s.key}"${s.key === sheet.key ? ' class="on"' : ''}>${esc(s.title)}</button>`).join('')}</div>
    <section class="card">
      <h2>${esc(sheet.title)} <small>Ringe = Stufe</small></h2>
      <div class="charts">${sheet.charts.map((ct) => `<div class="chart">${chartSvg(c, sheet, ct)}${ct.label ? `<h3>${esc(ct.label)}</h3>` : ''}</div>`).join('')}</div>
      <p class="hint">Die Punkte werden in den Feldern gesammelt, die Ringe (Stufe) steigen automatisch. Feld antippen, um Punkte von der DM von Hand einzutragen.</p>
    </section>
    <section class="card">
      <h2>${sheet.listName === 'Zauber' ? 'Zauber' : 'Techniken'} <button class="btn small fill" data-act="newTech">+ Neu</button></h2>
      ${own ? '' : `<p class="hint">Nicht deine Klasse: hier sind nur leichte ${sheet.listName === 'Zauber' ? 'Zauber' : 'Techniken'} erlernbar.</p>`}
      ${list.length ? list.map((t) => {
        return `<div class="tech">
          <div class="head"><b>${esc(t.name)}</b><span class="tag">${esc(diffLabel(t))}</span></div>
          <div>${t.aspects.map((k) => `<span class="tag">${esc(ringName(k))} · Stufe ${ringStufe(k, c.aspects[k])}</span>`).join('') || '<span class="hint">belegt keine Felder</span>'}</div>
          <div class="hint">Würfelbonus +${techStufe(c, t)} (niedrigste Stufe der Felder)${t.note ? ' · ' + esc(t.note) : ''}</div>
          <div class="row end" style="margin-top:8px">
            <button class="btn small" data-act="editTech" data-id="${t.id}">Bearbeiten</button>
            <button class="btn small fill" data-act="applyTech" data-id="${t.id}">Anwenden</button>
          </div></div>`;
      }).join('') : '<p class="hint">Noch keine Einträge.</p>'}
      <p class="hint">„Anwenden“: Würfelergebnis eintragen, die App rechnet Ergebnis und Punkte aus. Erst nach deiner Bestätigung bekommt jedes Feld ${sheet.listName === 'Zauber' ? 'des Zaubers' : 'der Technik'} im Kreis die Punkte.</p>
    </section>`;
  }

  // Geld: Bestand anzeigen, Beträge über Felder mit + / − buchen, letzte 10 Buchungen merken.
  const COINS = [['g', 'Gold'], ['s', 'Silber'], ['k', 'Kupfer']];
  const coinText = (o) => COINS.filter(([m]) => num(o[m])).map(([m, n]) => `${num(o[m])} ${n}`).join(', ') || '0';
  function moneyCard(c) {
    const log = c.moneyLog || [];
    return `<section class="card">
      <h2>Geld</h2>
      <div class="money">${COINS.map(([m, n]) => `<div class="stat"><div class="lbl">${n}</div><div class="val">${num(c.money[m])}</div></div>`).join('')}</div>
      <div class="money" style="margin-top:10px">${COINS.map(([m, n]) => `<label>${n}<input type="text" inputmode="numeric" pattern="[0-9]*" data-tx="${m}" placeholder="0" aria-label="${n} buchen"></label>`).join('')}</div>
      <label class="f" style="margin-top:8px">Anmerkung (optional)<input data-tx="note" placeholder="z. B. Brot gekauft"></label>
      <div class="row">
        <button class="btn grow" data-act="tx" data-d="-1">− Ausgeben</button>
        <button class="btn fill grow" data-act="tx" data-d="1">+ Einnehmen</button>
      </div>
      ${log.length ? `<div class="group-h" style="margin-top:12px">Letzte Buchungen</div>${log.map((t) => `<div class="tx">
        <span class="${t.d > 0 ? 'plus' : 'minus'}">${t.d > 0 ? '+' : '−'} ${esc(coinText(t))}</span>
        <small>${esc(t.when)}${t.note ? ' · ' + esc(t.note) : ''}</small></div>`).join('')}` : ''}
    </section>`;
  }
  // Bezahlen mit automatischem Wechseln (größere Münzen werden nur so weit wie nötig gewechselt).
  const moneyText = (m) => COINS.map(([k, n]) => `${num(m[k])} ${n}`).join(', ');
  function payWithChange(money, amt, d) {
    const { kPerS, sPerG } = R.exchange;
    const m = { g: num(money.g) + d * amt.g, s: num(money.s) + d * amt.s, k: num(money.k) + d * amt.k };
    const changes = [];
    if (d > 0) return { money: m, changes, short: false };
    if (m.g * sPerG * kPerS + m.s * kPerS + m.k < 0) return { short: true };
    // 1) Fehlendes Kupfer aus Silber (bzw. Gold) wechseln, fehlendes Silber aus Gold.
    if (m.k < 0) {
      const needS = Math.ceil(-m.k / kPerS);
      if (m.s < needS && m.g > 0) { const g = Math.min(m.g, Math.ceil((needS - m.s) / sPerG)); m.g -= g; m.s += g * sPerG; changes.push(`${g} Gold → ${g * sPerG} Silber`); }
      const t = Math.min(needS, Math.max(0, m.s)); if (t) { m.s -= t; m.k += t * kPerS; changes.push(`${t} Silber → ${t * kPerS} Kupfer`); }
    }
    if (m.s < 0 && m.g > 0) { const g = Math.min(m.g, Math.ceil(-m.s / sPerG)); m.g -= g; m.s += g * sPerG; changes.push(`${g} Gold → ${g * sPerG} Silber`); }
    // 2) Fehlt dann noch Silber oder Gold, aus kleineren Münzen zusammenlegen.
    if (m.s < 0 && m.k >= kPerS) { const t = Math.min(Math.floor(m.k / kPerS), -m.s); m.k -= t * kPerS; m.s += t; changes.push(`${t * kPerS} Kupfer → ${t} Silber`); }
    if (m.g < 0) {
      if (m.s < (-m.g) * sPerG && m.k >= kPerS) { const t = Math.min(Math.floor(m.k / kPerS), (-m.g) * sPerG - m.s); m.k -= t * kPerS; m.s += t; changes.push(`${t * kPerS} Kupfer → ${t} Silber`); }
      const g = Math.min(-m.g, Math.floor(m.s / sPerG)); if (g) { m.s -= g * sPerG; m.g += g; changes.push(`${g * sPerG} Silber → ${g} Gold`); }
    }
    if (m.s < 0 && m.k >= kPerS) { const t = Math.min(Math.floor(m.k / kPerS), -m.s); m.k -= t * kPerS; m.s += t; changes.push(`${t * kPerS} Kupfer → ${t} Silber`); }
    if (m.g < 0 || m.s < 0 || m.k < 0) return { short: true };
    return { money: m, changes, short: false };
  }
  function booking(d, btn) {
    const box = btn.closest('.card');
    const field = (m) => box.querySelector(`[data-tx="${m}"]`);
    const amt = {};
    COINS.forEach(([m]) => { amt[m] = Math.max(0, num(field(m).value.replace(/\D/g, ''))); });
    if (!COINS.some(([m]) => amt[m])) return alert('Bitte einen Betrag eintragen.');
    const c = ch();
    const res = payWithChange(c.money, amt, d);
    if (res.short) {
      const after = COINS.map(([m, n]) => [n, num(c.money[m]) + d * amt[m]]).filter(([, v]) => v < 0);
      if (!confirm(`Dafür reicht das Geld insgesamt nicht (${moneyText(c.money)} vorhanden).\n\nTrotzdem buchen? Danach: ${after.map(([n, v]) => `${n} ${v}`).join(', ')}.`)) return;
    } else if (res.changes.length && !confirm(`Zum Bezahlen wird gewechselt: ${res.changes.join(', ')}.\n\nNach dem Bezahlen: ${moneyText(res.money)}. Einverstanden?`)) return;
    const note = field('note').value.trim();
    change((c) => {
      if (res.short) COINS.forEach(([m]) => { c.money[m] = num(c.money[m]) + d * amt[m]; });
      else c.money = { ...res.money };
      const when = new Date().toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
      c.moneyLog = [{ d, ...amt, note, when, ts: Date.now() }, ...(c.moneyLog || [])].slice(0, 10);
    });
  }

  // Inventar: begrenzte Slots (3 + Traglast + Ausbau), dazu eine Liste ohne Slot.
  const slotMax = (c) => R.inventorySlots + attrStufe(c, 'Traglast') + num(c.slotExtra);
  function itemRows(c, list) {
    return (c[list] || []).map((it, i) => `<div class="item${list === 'freeItems' ? ' free' : ''}">
        <div class="item-top">
          ${list === 'items' ? `<span class="item-no">${i + 1}</span>` : ''}
          <input class="item-name" data-item="name" data-list="${list}" data-i="${i}" value="${esc(it.name)}" placeholder="Gegenstand">
          <label class="item-qty">×<input type="text" inputmode="numeric" data-item="qty" data-list="${list}" data-i="${i}" value="${num(it.qty, 1)}" aria-label="Anzahl"></label>
        </div>
        <input class="item-note" data-item="note" data-list="${list}" data-i="${i}" value="${esc(it.note)}" placeholder="Notiz">
        <div class="item-adj">
          <input type="text" inputmode="numeric" class="adj-amt" placeholder="Menge" aria-label="Menge zum Hinzufügen oder Wegnehmen">
          <button class="btn small" data-act="adjQty" data-d="1" data-list="${list}" data-i="${i}" aria-label="Menge hinzufügen">+</button>
          <button class="btn small" data-act="adjQty" data-d="-1" data-list="${list}" data-i="${i}" aria-label="Menge wegnehmen">−</button>
        </div>
        <div class="item-actions">
          <button class="link" data-act="equip" data-list="${list}" data-i="${i}">anlegen</button>
          <button class="link" data-act="moveItem" data-list="${list}" data-i="${i}">${list === 'items' ? '→ ohne Slot' : '→ in einen Slot'}</button>
          <button class="link danger" data-act="delItem" data-list="${list}" data-i="${i}">Entfernen</button>
        </div></div>`).join('');
  }
  // Ausrüstung: 9 Slots mit ATK/DEF, die zu den Werten im Bogen zählen.
  const equipOf = (c) => {
    if (!Array.isArray(c.equip)) c.equip = [];
    while (c.equip.length < R.equipmentSlots) c.equip.push({ label: '', item: null });
    return c.equip;
  };
  const gearBonus = (c, k) => equipOf(c).reduce((a, e) => a + (e.item ? num(e.item[k]) : 0), 0);
  const signed = (v) => (v > 0 ? '+' + v : String(v));
  function equipCard(c) {
    return `<section class="card">
      <h2>Ausrüstung <small>${equipOf(c).filter((e) => e.item).length} / ${R.equipmentSlots} angelegt</small></h2>
      ${equipOf(c).map((e, i) => {
        const label = `<input class="equip-label" data-equip="label" data-i="${i}" value="${esc(e.label)}" placeholder="Ausrüstung ${i + 1}" aria-label="Name des Slots">`;
        if (!e.item) return `<div class="item empty-slot equip">${label}<span class="grow">leer</span></div>`;
        const it = e.item;
        return `<div class="item equip">
          ${label}
          <div class="item-top"><input class="item-name" data-equip="name" data-i="${i}" value="${esc(it.name)}" placeholder="Gegenstand"></div>
          <div class="equip-vals">
            <label>ATK<input type="number" inputmode="numeric" data-equip="atk" data-i="${i}" value="${num(it.atk)}"></label>
            <label>DEF<input type="number" inputmode="numeric" data-equip="def" data-i="${i}" value="${num(it.def)}"></label>
          </div>
          <input class="item-note" data-equip="note" data-i="${i}" value="${esc(it.note)}" placeholder="Notiz">
          <div class="item-actions"><button class="link" data-act="unequip" data-i="${i}">← ablegen ins Inventar</button></div>
        </div>`;
      }).join('')}
      <p class="hint">ATK und DEF der angelegten Ausrüstung werden im Bogen dazugezählt. Anlegen über „anlegen“ im Inventar.</p>
    </section>`;
  }
  function equipItem(list, i) {
    const c = ch(), free = equipOf(c).map((e, j) => (e.item ? -1 : j)).filter((j) => j >= 0);
    if (!free.length) return alert('Alle Ausrüstungsslots sind belegt. Lege zuerst etwas ab.');
    const it = c[list][i];
    openDialog(`<h3>„${esc(it.name || 'Gegenstand')}“ anlegen</h3><p class="hint">In welchen Ausrüstungsslot?</p>
      ${free.map((j) => `<button class="choice" data-d-act="slot" data-j="${j}">${esc(c.equip[j].label || `Ausrüstung ${j + 1}`)}</button>`).join('')}
      <div class="row end"><button class="btn" data-d-act="close">Abbrechen</button></div>`,
    (act, b) => {
      if (act === 'slot') change((c) => {
        const [item] = c[list].splice(i, 1);
        item.qty = num(item.qty, 1);
        if (item.qty > 1) { c[list].splice(i, 0, { ...item, id: uid(), qty: item.qty - 1 }); item.qty = 1; }
        c.equip[num(b.dataset.j)].item = { atk: 0, def: 0, ...item, from: list };
      });
      dlg.close();
    });
  }

  // ---------- Ausrichtung & Laufzettel ----------
  const COLS = ['Gut', 'Neutral', 'Böse'], ROWS = ['Gesetzestreu', 'Neutral', 'Chaotisch'];
  function regionSub(klass, col, row) {
    const a = COLS[Math.floor(col / R.laufzettel.region)], b = ROWS[Math.floor(row / R.laufzettel.region)];
    if (a === 'Neutral' && b === 'Neutral') return '';
    return Object.keys(R.subclasses[klass] || {}).find((k) => k.endsWith(`(${a}, ${b})`)) || '';
  }
  const LZ_KEY = 'charakterbogen-laufzettel';
  let LZ = (() => { try { return JSON.parse(localStorage.getItem(LZ_KEY)) || {}; } catch (e) { return {}; } })();
  let lzStatus = '';
  function alignCard(c) {
    const g = R.laufzettel.grid, rg = R.laufzettel.region, cs = 16, off = 0;
    const lz = c.lauf;
    let svg = `<svg viewBox="-2 -16 ${g * cs + 92} ${g * cs + 20}" class="align">`;
    for (let ry = 0; ry < 3; ry++) for (let rx = 0; rx < 3; rx++) {
      const sub = regionSub(c.klass, rx * rg, ry * rg);
      const mine = lz && Math.floor(lz.col / rg) === rx && Math.floor(lz.row / rg) === ry;
      svg += `<rect x="${rx * rg * cs}" y="${ry * rg * cs}" width="${rg * cs}" height="${rg * cs}" fill="${mine ? 'var(--cl)' : 'transparent'}" stroke="var(--ink)" stroke-width="1.5"/>`;
      svg += `<text x="${(rx + 0.5) * rg * cs}" y="${(ry + 0.5) * rg * cs}" text-anchor="middle" dominant-baseline="middle" class="al-sub">${esc(sub ? sub.split(' (')[0] : 'Neutral')}</text>`;
    }
    for (let i = 1; i < g; i++) if (i % rg) {
      svg += `<line x1="${i * cs}" y1="0" x2="${i * cs}" y2="${g * cs}" stroke="var(--line)" stroke-width=".5"/><line x1="0" y1="${i * cs}" x2="${g * cs}" y2="${i * cs}" stroke="var(--line)" stroke-width=".5"/>`;
    }
    COLS.forEach((t, i) => { svg += `<text x="${(i + 0.5) * rg * cs}" y="-5" text-anchor="middle" class="al-ax">${t}</text>`; });
    ROWS.forEach((t, i) => { svg += `<text x="${g * cs + 5}" y="${(i + 0.5) * rg * cs}" dominant-baseline="middle" class="al-ax">${t}</text>`; });
    if (lz) svg += `<circle cx="${(lz.col + 0.5) * cs}" cy="${(lz.row + 0.5) * cs}" r="6" fill="#c9211e" stroke="#fff" stroke-width="1.5"/>`;
    svg += '</svg>';
    return `<section class="card" style="margin-top:12px"><h2>Ausrichtung <small>${lz ? `Laufzettel, Stand ${esc(lz.when)}` : 'Laufzettel'}</small></h2>
      ${svg}
      ${!c.laufName ? '<p class="hint">Trage unten bei „Grundwerte“ deinen Namen im Laufzettel der DM ein, dann liest die App Position und Punkte von dort.</p>' : ''}
      ${lzStatus ? `<p class="warn">${esc(lzStatus)}</p>` : ''}
      ${lz ? `<p class="hint">Position und Punkte kommen aus dem Laufzettel der DM und werden beim Laden bzw. mit ⟳ aktualisiert.</p>` : ''}
    </section>`;
  }

  // Minimales Entpacken einer .xlsx-Datei (ZIP) mit Bordmitteln des Browsers.
  async function unzip(buf, wanted) {
    const v = new DataView(buf), out = {};
    let e = buf.byteLength - 22;
    while (e >= 0 && v.getUint32(e, true) !== 0x06054b50) e--;
    if (e < 0) throw new Error('keine gültige Tabelle');
    let p = v.getUint32(e + 16, true);
    const n = v.getUint16(e + 10, true), dec = new TextDecoder();
    for (let k = 0; k < n; k++) {
      const method = v.getUint16(p + 10, true), size = v.getUint32(p + 20, true);
      const nl = v.getUint16(p + 28, true), xl = v.getUint16(p + 30, true), cl = v.getUint16(p + 32, true), lo = v.getUint32(p + 42, true);
      const name = dec.decode(new Uint8Array(buf, p + 46, nl));
      p += 46 + nl + xl + cl;
      if (!wanted.includes(name)) continue;
      const start = lo + 30 + v.getUint16(lo + 26, true) + v.getUint16(lo + 28, true);
      const data = new Uint8Array(buf, start, size);
      out[name] = method === 0 ? dec.decode(data)
        : await new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).text();
    }
    return out;
  }
  const colIndex = (ref) => { const m = /^([A-Z]+)(\d+)$/.exec(ref); let n = 0; for (const ch2 of m[1]) n = n * 26 + ch2.charCodeAt(0) - 64; return [n - 1, num(m[2]) - 1]; };
  async function readLaufzettel() {
    const res = await fetch(`https://docs.google.com/spreadsheets/d/${R.laufzettel.sheetId}/export?format=xlsx`, { cache: 'no-store' });
    if (!res.ok) throw new Error('nicht lesbar');
    const buf = await res.arrayBuffer();
    if (new Uint8Array(buf)[0] !== 0x50) throw new Error('nicht lesbar');
    const files = await unzip(buf, ['xl/sharedStrings.xml', 'xl/styles.xml', 'xl/worksheets/sheet1.xml']);
    const xml = (t) => new DOMParser().parseFromString(t || '<x/>', 'application/xml');
    const strings = [...xml(files['xl/sharedStrings.xml']).getElementsByTagName('si')].map((x) => x.textContent);
    const st = xml(files['xl/styles.xml']);
    const fontColor = [...st.getElementsByTagName('fonts')[0].getElementsByTagName('font')].map((f) => { const c = f.getElementsByTagName('color')[0]; return c ? c.getAttribute('rgb') || '' : ''; });
    const xfs = [...st.getElementsByTagName('cellXfs')[0].getElementsByTagName('xf')].map((x) => num(x.getAttribute('fontId')));
    const isRed = (rgb) => { if (!rgb || rgb.length < 6) return false; const h = rgb.slice(-6); const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); return r > 150 && g < 110 && b < 110; };
    return [...xml(files['xl/worksheets/sheet1.xml']).getElementsByTagName('c')].map((c) => {
      const [col, row] = colIndex(c.getAttribute('r'));
      const vEl = c.getElementsByTagName('v')[0], t = c.getAttribute('t');
      const raw = vEl ? vEl.textContent : '';
      const value = t === 's' ? strings[num(raw)] : t === 'inlineStr' ? c.textContent : raw;
      return { col, row, value, formula: !!c.getElementsByTagName('f')[0], red: isRed(fontColor[xfs[num(c.getAttribute('s'))]]) };
    });
  }
  function laufFor(cells, name) {
    const key = String(name).trim().toLowerCase();
    const head = cells.find((x) => typeof x.value === 'string' && x.value.replace(/:/g, '').trim().toLowerCase() === key);
    if (!head) return null;
    const g = R.laufzettel.grid;
    const inGrid = cells.filter((x) => !x.formula && x.col >= head.col && x.col < head.col + g && x.row > head.row && x.row <= head.row + g);
    const red = inGrid.find((x) => x.red);
    const points = inGrid.reduce((a, x) => a + (Number.isFinite(parseFloat(x.value)) ? parseFloat(x.value) : 0), 0);
    return { col: red ? red.col - head.col : null, row: red ? red.row - head.row - 1 : null, points };
  }
  async function refreshLaufzettel(manual = false) {
    if (!S.chars.some((c) => c.laufName)) return;
    try {
      const cells = await readLaufzettel();
      lzStatus = '';
      const when = new Date().toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
      const msgs = [];
      S.chars.forEach((c) => {
        if (!c.laufName) return;
        const f = laufFor(cells, c.laufName);
        if (!f) { msgs.push(`„${c.laufName}“ steht nicht im Laufzettel.`); return; }
        LZ[c.id] = { ...f, when };
      });
      try { localStorage.setItem(LZ_KEY, JSON.stringify(LZ)); } catch (e) { /* egal */ }
      if (msgs.length) lzStatus = msgs.join(' ');
      applyLaufzettel(true);
    } catch (e) {
      lzStatus = navigator.onLine ? 'Laufzettel nicht lesbar. Die DM muss ihn einmal freigeben: Teilen → Allgemeiner Zugriff → „Jeder, der über den Link verfügt“ (Betrachter).' : 'Offline – Laufzettel wird beim nächsten Laden mit Internet gelesen.';
      if (manual) alert(lzStatus);
      render();
    }
  }
  // Werte aus dem Laufzettel in die Charaktere übernehmen (Level aus Punkten, Ausrichtung aus der Position).
  // ---------- Punkte, Level, Abenteurergilde ----------
  const pointsOf = (c) => (c.lauf ? c.lauf.points : num(c.points));
  function levelBar(c) {
    const p = pointsOf(c), lv = c.level, from = lv > 0 ? R.levelPoints[lv - 1] : 0, next = R.levelPoints[lv];
    const pct = next === undefined ? 100 : Math.max(0, Math.min(100, (p / next) * 100));
    return `<div class="lvbar" title="${p}/${next === undefined ? p : next} Punkte"><div class="bar"><i style="width:${pct}%"></i></div></div>`;
  }
  // Info zum Level: aktuelle Punkte, alle Aufstiegsschwellen und Boni.
  function levelInfo() {
    const c = ch(), p = pointsOf(c), res = klassOf(c).resource;
    const rows = R.levelPoints.map((need, i) => {
      const bo = bonusAt(i), done = c.level > i, now = c.level === i;
      return `<tr class="${done ? 'done' : ''}${now ? ' now' : ''}"><td>${i + 1}</td><td>${need}</td><td>+${bo.lp}</td><td>+${bo.res}</td><td>+${bo.attr}</td></tr>`;
    }).join('');
    const next = R.levelPoints[c.level];
    openDialog(`<h3>Level ${c.level}</h3>
      <p><b>${p}</b> Punkte${next !== undefined ? ` · nächstes Level ab <b>${next}</b> (noch ${next - p})` : ' · höchstes Level der Tabelle'}${c.lauf ? '<br><small class="hint">Punkte aus dem Laufzettel der DM.</small>' : ''}</p>
      <table class="lvtable"><thead><tr><th>Level</th><th>ab Punkten</th><th>LP</th><th>${esc(res)}</th><th>Verteil-<br>punkte</th></tr></thead><tbody>${rows}</tbody></table>
      <p class="hint">Die Boni gibt es beim Erreichen des jeweiligen Levels. Erreichte Level sind ausgegraut, das nächste ist hervorgehoben.</p>
      <div class="row end"><button class="btn" data-d-act="close">Schließen</button></div>`, () => dlg.close());
  }
  function pointsCard(c) {
    const p = pointsOf(c), lv = c.level, from = lv > 0 ? R.levelPoints[lv - 1] : 0, next = R.levelPoints[lv];
    const pct = next === undefined ? 100 : Math.max(0, Math.min(100, ((p - from) / (next - from)) * 100));
    const actions = `<div class="pa"><div class="pa-row pa-head"><span class="grow"></span><span>regulär</span><span>besonders</span></div>${R.pointActions.map(([n, a, b], i) => `<div class="pa-row"><span class="grow">${esc(n)}</span>
        <span class="tag">${a}</span><span class="tag">${b}</span></div>`).join('')}
        </div>`;
    const log = c.pointsLog || [];
    return `<section class="card" style="margin-top:12px">
      <h2>Punkte & Level <small>Level ${lv} · ${p} Punkte</small></h2>
      <div class="bar"><i style="width:${pct}%"></i></div>
      <p class="hint">${next === undefined ? 'Höchstes Level der Tabelle erreicht.' : `Noch ${next - p} Punkte bis Level ${lv + 1} (ab ${next}).`}${c.lauf ? ' Die Punkte kommen aus dem Laufzettel der DM.' : ''}</p>
      <details><summary>Wofür gibt es Punkte?</summary>${actions}</details>
      ${c.lauf ? '' : `<div class="pts-add">
          <input type="text" inputmode="numeric" id="ptsAdj" placeholder="Punkte" aria-label="Punkte">
          <input type="text" id="ptsWhy" placeholder="Grund (optional)" aria-label="Grund">
          <button class="btn fill" data-act="ptsAdj" data-d="1">+ Hinzufügen</button>
        </div>
        ${log.length ? `<div class="group-h" style="margin-top:10px">Letzte Punkte</div>${log.map((t, i) => `<div class="tx row" style="flex-direction:row">
          <span class="grow"><span class="${t.p > 0 ? 'plus' : 'minus'}">${t.p > 0 ? '+' : '−'}${Math.abs(t.p)}</span> ${esc(t.what)}<br><small>${esc(t.when)}</small></span>
          <button class="link danger" data-act="ptsUndo" data-i="${i}">zurücknehmen</button></div>`).join('')}` : ''}`}
      <div class="row" style="margin-top:12px; border-top:1px solid var(--line); padding-top:10px">
        <span class="grow"><b>Abenteurergilde</b><br><small class="hint">Stufe ${num(c.guild)} von ${R.guildMax}</small></span>
        <button class="btn small" data-act="guild" data-d="-1" aria-label="Gildenstufe senken">−</button>
        <span class="lvl-box">${num(c.guild)}</span>
        <button class="btn small" data-act="guild" data-d="1" aria-label="Gildenstufe erhöhen">+</button>
      </div>
    </section>`;
  }
  // Punkte buchen; Level ergibt sich aus den Punkten (mit Nachfrage beim Aufstieg).
  function addPoints(p, what, undoIndex = -1) {
    const c = ch(), before = num(c.points), after = Math.max(0, before + p);
    const lv = levelFromPoints(after);
    if (lv > c.level) {
      const bo = bonusAt(c.level);
      if (!confirm(`${what}: ${p > 0 ? '+' : ''}${p} Punkte.\n\nDamit erreicht ${c.name} Level ${lv}! (+${bo.lp} LP, +${bo.res} ${klassOf(c).resource}, ${bo.attr} Punkt(e) zum Verteilen)\n\nÜbernehmen?`)) return;
    } else if (lv < c.level && !confirm(`Damit sinkt ${c.name} auf Level ${lv}. Übernehmen?`)) return;
    change((c) => {
      c.points = after; c.level = lv;
      const when = new Date().toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
      if (undoIndex >= 0) { c.pointsLog.splice(undoIndex, 1); return; }
      c.pointsLog = [{ p: after - before, what, when, ts: Date.now() }, ...(c.pointsLog || [])].slice(0, 10);
    });
    if (lv > levelFromPoints(before)) toast(`Levelaufstieg auf Level ${lv}!`);
  }

  function applyLaufzettel(announce) {
    let up = '';
    S.chars.forEach((c) => {
      const f = c.laufName && LZ[c.id];
      c.lauf = f || null;
      if (!f) return;
      const lvl = levelFromPoints(f.points);
      if (lvl > c.level && c.id === S.current) up = `Levelaufstieg auf Level ${lvl}!`;
      c.level = lvl;
      if (f.col !== null) c.sub = regionSub(c.klass, f.col, f.row);
    });
    save(); render();
    if (announce && up) toast(up);
  }

  function inventar(c) {
    const max = slotMax(c), used = c.items.length, tl = attrStufe(c, 'Traglast');
    return `
    ${moneyCard(c)}
    ${equipCard(c)}
    <section class="card">
      <h2>Inventar <small>${used} / ${max} Slots</small></h2>
      ${itemRows(c, 'items')}
      ${Array.from({ length: Math.max(0, max - used) }, (_, k) => `<div class="item empty-slot"><span class="item-no">${used + k + 1}</span>freier Slot</div>`).join('')}
      ${used > max ? `<p class="warn">${used - max} Gegenstand/Gegenstände mehr als Slots.</p>` : ''}
      <div class="row" style="margin-top:10px">
        <span class="grow hint" style="margin:0">Slots: ${R.inventorySlots} Grund${tl ? ` + ${tl} Traglast` : ''} + Ausbau ${num(c.slotExtra)}</span>
        <button class="btn small" data-act="slotExtra" data-d="-1" aria-label="Ausbau verringern">−</button>
        <button class="btn small" data-act="slotExtra" data-d="1" aria-label="Slot ausbauen">+</button>
      </div>
      <div class="row end" style="margin-top:10px"><button class="btn fill" data-act="addItem" data-list="items"${used >= max ? ' disabled' : ''}>+ Gegenstand</button></div>
    </section>
    <section class="card">
      <h2>Ohne Inventarslot <small>${(c.freeItems || []).length} Einträge</small></h2>
      <p class="hint" style="margin-top:0">Für Gegenstände, die keinen Slot belegen (z. B. am Körper getragen).</p>
      ${itemRows(c, 'freeItems')}
      <div class="row end" style="margin-top:10px"><button class="btn fill" data-act="addItem" data-list="freeItems">+ Gegenstand</button></div>
    </section>`;
  }

  function notizen(c) {
    return `
    <section class="card"><h2>Notizen</h2>
      <textarea data-bind="notes" rows="14">${esc(c.notes)}</textarea></section>
    ${syncCard()}
    <section class="card"><h2>Sicherung</h2>
      <p class="hint">Die Daten liegen nur auf diesem Gerät. Ab und zu sichern, z. B. in Google Drive.</p>
      <div class="row">
        <button class="btn" data-act="export">Sicherung speichern</button>
        <label class="btn">Sicherung laden<input type="file" accept="application/json,.json" id="import" hidden></label>
      </div></section>`;
  }

  // ---------- Dialoge ----------
  const dlg = $('#dlg');
  function openDialog(html, onClick) {
    dlg.innerHTML = html;
    dlg.onclick = (e) => {
      if (e.target === dlg) return dlg.close();
      const b = e.target.closest('[data-d-act]');
      if (b) onClick(b.dataset.dAct, b, e);
    };
    if (!dlg.open) dlg.showModal();
    dlg.scrollTop = 0;
    requestAnimationFrame(() => { dlg.scrollTop = 0; });
  }

  function pickAttr(i) {
    const c = ch();
    const taken = new Set(c.attrSlots.map((s) => s.skill).filter(Boolean));
    const curSkill = c.attrSlots[i].skill;
    openDialog(`<h3>Attributfähigkeit wählen</h3>
      ${curSkill ? `<div class="row" style="margin-bottom:8px"><span class="grow hint" style="margin:0">Aktuell: <b>${esc(curSkill)}</b></span><button class="btn small danger" data-d-act="clear">Entfernen</button></div>` : ''}
      ${R.attributeGroups.map((g) => `<div class="group-h" style="color:${g.color}">●</div>${g.skills.map(([n, d]) => {
        const lock = lockedReason(c, n);
        const dis = (taken.has(n) && n !== curSkill) || lock;
        return `<button class="choice" data-d-act="pick" data-n="${esc(n)}" style="border-left:5px solid ${g.color}"${dis ? ' disabled' : ''}>${esc(n)}<small>${esc(lock || (taken.has(n) && n !== curSkill ? 'schon gewählt' : d))}</small></button>`;
      }).join('')}`).join('')}
      <div class="row end"><button class="btn" data-d-act="close">Abbrechen</button></div>`,
    (act, b) => {
      if (act === 'pick') {
        const slot = ch().attrSlots[i];
        if (slot.skill === b.dataset.n) return dlg.close();
        // Neue Fähigkeit startet auf Stufe 1 und kostet einen Punkt (beim Tausch wird der alte Platz frei).
        const refund = slot.skill ? num(slot.stufe) : 0;
        const free = levelPointsTotal(ch()) - spentPoints(ch()) + refund;
        if (free < 1 && !confirm(`Keine Punkte mehr zu verteilen (Level ${ch().level} gibt ${levelPointsTotal(ch())}, verteilt sind ${spentPoints(ch()) - refund}).\n\nTrotzdem hinzufügen (z. B. weil der DM es erlaubt)?`)) return;
        if (slot.skill && !confirm(`„${slot.skill}“ (Stufe ${slot.stufe}) durch „${b.dataset.n}“ ersetzen? Die Punkte von „${slot.skill}“ werden wieder frei.`)) return;
        change((c) => { c.attrSlots[i] = { skill: b.dataset.n, stufe: 1, check: false }; });
      }
      if (act === 'clear') {
        const sl = ch().attrSlots[i];
        if (!confirm(`„${sl.skill}“ entfernen?${sl.stufe ? ` Die ${sl.stufe} Punkt(e) werden wieder frei.` : ''}`)) return;
        change((c) => { c.attrSlots[i] = { skill: '', stufe: 0, check: false }; });
      }
      dlg.close();
    });
  }

  function pickClass(i) {
    const c = ch();
    const sub = (R.subclasses[c.klass] || {})[c.sub] || [];
    const slot = c.classSlots[i];
    const taken = (n) => c.classSlots.some((x, j) => j !== i && x.name === n && x.klass === c.klass && x.from === c.sub);
    openDialog(`<h3>Klassenfähigkeit</h3>
      ${c.sub ? `<p class="hint">${esc(klassOf(c).name)} · ${esc(c.sub)}</p>` : ''}
      ${sub.length ? sub.map(([n, d]) => `<button class="choice" data-d-act="pick" data-n="${esc(n)}"${taken(n) ? ' disabled' : ''}>${esc(n)}<small>${esc(taken(n) ? 'schon eingetragen' : d)}</small></button>`).join('') : '<p class="hint">Wähle zuerst im Reiter „Bogen“ die aktuelle Ausrichtung, dann erscheinen hier ihre Fähigkeiten.</p>'}
      <div class="row end">${slot.name ? '<button class="btn danger" data-d-act="clear">Platz leeren</button>' : ''}<button class="btn" data-d-act="close">Abbrechen</button></div>`,
    (act, b) => {
      if (act === 'pick') change((c) => {
        const same = c.classSlots[i].name === b.dataset.n && c.classSlots[i].from === c.sub;
        c.classSlots[i] = { name: b.dataset.n, klass: c.klass, from: c.sub, text: '', stufe: same ? c.classSlots[i].stufe : 1 };
      });
      if (act === 'clear') change((c) => { c.classSlots[i] = { name: '', text: '', stufe: 0, check: false }; });
      dlg.close();
    });
  }

  // Beschreibung einer eingetragenen Klassenfähigkeit (auch aus früherer Unterklasse).
  function findAbility(c, slot) {
    const look = (k, sub) => { const hit = ((R.subclasses[k] || {})[sub] || []).find(([n]) => n === slot.name); return hit && { klass: k, sub, desc: hit[1] }; };
    if (slot.from) { const a = look(slot.klass || c.klass, slot.from); if (a) return a; }
    const a = look(c.klass, c.sub);
    if (a) return a;
    for (const [k, subs] of Object.entries(R.subclasses)) for (const sub of Object.keys(subs)) { const x = look(k, sub); if (x) return x; }
    return null;
  }

  // Katalog aller Klassen, Unterklassen und Fähigkeiten.
  // Katalog aller Attributfähigkeiten mit Erklärung und eigenem Stand.
  function attrCatalog() {
    const c = ch();
    openDialog(`<h3>Katalog der Attributfähigkeiten</h3>
      <p class="hint">Je Farbe ist die unterste Fähigkeit erst skillbar, wenn die anderen fünf mindestens Stufe 1 haben. Höchstens 10 Fähigkeiten pro Charakter.</p>
      ${R.attributeGroups.map((g) => `<div class="cat" style="border-left:6px solid ${g.color}">
        ${g.skills.map(([n, d], i) => {
          const have = c.attrSlots.find((x) => x.skill === n);
          const last = i === g.skills.length - 1;
          const lock = last && lockedReason(c, n);
          return `<div class="cat-s${last ? ' cat-last' : ''}"><b>${esc(n)}${have ? ` <span class="tag">Stufe ${have.stufe}</span>` : ''}${last ? ` <span class="tag">${lock ? '🔒 gesperrt' : 'freigeschaltet'}</span>` : ''}</b><small>${esc(d)}</small></div>`;
        }).join('')}</div>`).join('')}
      <div class="row end"><button class="btn" data-d-act="close">Schließen</button></div>`,
    () => dlg.close());
  }

  function catalog(klass) {
    const c = ch();
    klass = klass || c.klass;
    const draw = () => `<h3>Katalog der Klassenfähigkeiten</h3>
      <div class="sheet-tabs">${Object.entries(R.classes).map(([k, v]) => `<button data-d-act="klass" data-k="${k}"${k === klass ? ' class="on"' : ''}>${esc(v.name)}</button>`).join('')}</div>
      ${Object.entries(R.subclasses[klass] || {}).map(([sub, skills]) => {
        const mine = klass === c.klass && sub === c.sub;
        const [name, align] = sub.split(' (');
        return `<div class="cat${mine ? ' mine' : ''}"><div class="cat-h"><b>${esc(name)}</b><small>${esc((align || '').replace(')', ''))}${mine ? ' · aktuell' : ''}</small></div>
          ${skills.map(([n, d]) => `<div class="cat-s"><b>${esc(n)}</b><small>${esc(d)}</small></div>`).join('')}</div>`;
      }).join('')}
      <div class="row end"><button class="btn" data-d-act="close">Schließen</button></div>`;
    openDialog(draw(), (act, b) => {
      if (act === 'klass') { klass = b.dataset.k; dlg.innerHTML = draw(); dlg.scrollTop = 0; return; }
      dlg.close();
    });
  }

  function editAspect(k) {
    const [sheetKey, , ...rest] = k.split('.');
    const name = rest.join('.');
    const draw = () => {
      const st = aspectState(ch(), k), sf = ringStufe(k, st);
      const need = baseNeed(sheetKey, sf);
      return `<h3>${esc(name)}</h3><p class="hint">${esc(sheetDef(sheetKey).title)}</p>
      <div class="stats">
        <div class="stat"><div class="lbl">Stufe (Ringe)</div><div class="val">${sf}</div><div class="hint" style="margin:0">automatisch</div></div>
        <div class="stat"><div class="lbl">Gesammelte Punkte</div><div class="val">${st.punkte}${need ? `<small> / ${need}</small>` : ''}</div>
          <div class="stepper"><button class="btn" data-d-act="punkte" data-v="-1">−</button><button class="btn" data-d-act="punkte" data-v="1">+</button><button class="btn" data-d-act="punkte" data-v="5">+5</button></div></div>
      </div>
      <p class="hint">Verfügbar für Lernkosten: <b>${ringAvail(st)}</b>${num(st.spent) ? ` (${st.spent} ausgegeben)` : ''}.${teachNote(sf) ? ' ' + esc(teachNote(sf)) : ''}</p>
      <div class="row end" style="margin-top:12px"><button class="btn" data-d-act="close">Fertig</button></div>`;
    };
    openDialog(draw(), (act, b) => {
      if (act === 'close') return dlg.close();
      const c = ch(), st = aspectState(c, k), v = num(b.dataset.v);
      if (act === 'punkte') { const before = ringStufe(k, st); st.punkte = Math.max(0, st.punkte + v); if (ringStufe(k, st) > before) toast(`${name}: Stufe ${ringStufe(k, st)}!`); }
      save(); render(); dlg.innerHTML = draw();
    });
  }

  // Anwenden: Würfe eintragen, Ergebnis ausrechnen, Punkte erst nach Bestätigung vergeben.
  function applyDialog(id) {
    const t = (ch().techniques[S.sheet] || []).find((x) => x.id === id);
    if (!t) return;
    const die = '';
    let w20 = '', dmg = '', pts = null;
    const calc = () => {
      const roll = num(w20, 0);
      if (!roll) return null;
      const total = roll + techStufe(ch(), t);
      const out = R.rollOutcomes.find((o) => total >= o.min && total <= o.max) || R.rollOutcomes[R.rollOutcomes.length - 1];
      const points = (R.rollPoints.find((p) => total <= p.max) || R.rollPoints[R.rollPoints.length - 1]).points;
      let dmgText = '';
      const dv = num(dmg, 0);
      if (dv) {
        const v = dv * out.factor;
        dmgText = out.factor === 0.5 && dv % 2 ? `${dv} halbiert = ${v.toLocaleString('de-DE')} → W10 entscheidet, ob auf ${Math.ceil(v)} oder ab ${Math.floor(v)} gerundet wird` : `${dv} × ${out.factor.toLocaleString('de-DE')} = ${v}`;
      }
      return { roll, total, out, points, dmgText };
    };
    const draw = () => {
      const r = calc();
      return `<h3>${esc(t.name)} anwenden</h3>
        <p class="hint">${esc(diffLabel(t))} · Würfelbonus +${techStufe(ch(), t)} (niedrigste Stufe der Felder)</p>
        <div class="grid2">
          <label class="f">W20-Wurf<input id="w20" type="text" inputmode="numeric" value="${esc(w20)}" placeholder="1–20"></label>
          <label class="f">Schadens-/Qualitätswurf (optional)<input id="wd" type="text" inputmode="numeric" value="${esc(dmg)}" placeholder="Wurf"></label>
        </div>
        <button class="btn" data-d-act="calc">Ausrechnen</button>
        ${r ? `<div class="result">
          <div>Wurf ${r.roll} + Bonus ${techStufe(ch(), t)} = <b>${r.total}</b></div>
          <div>Ergebnis: <b>${esc(r.out.text)}</b></div>
          ${r.dmgText ? `<div>Schaden/Qualität: ${esc(r.dmgText)}</div>` : ''}
          <div>Punkte laut Tabelle: <b>${r.points}</b> <small class="hint">(0–6 → 1, 7–13 → 2, 14–20 → 3)</small></div>
        </div>
        <p class="hint">Mit der DM klären und bei Bedarf ändern:</p>
        <label class="f">Punkte, die vergeben werden<input id="pts" type="text" inputmode="numeric" value="${pts ?? r.points}"></label>
        <p class="hint">Bekommen: ${t.aspects.length ? t.aspects.map(ringName).join(', ') : 'keine Felder belegt'}.</p>` : ''}
        <div class="row end"><button class="btn" data-d-act="close">Abbrechen</button>${r ? '<button class="btn fill" data-d-act="ok">Punkte vergeben</button>' : ''}</div>`;
    };
    openDialog(draw(), (act) => {
      if (act === 'calc') {
        w20 = $('#w20', dlg).value.replace(/\D/g, ''); dmg = $('#wd', dlg).value.replace(/\D/g, ''); pts = null;
        if (!num(w20)) return alert('Bitte den W20-Wurf eintragen.');
        dlg.innerHTML = draw(); return;
      }
      if (act === 'ok') {
        const p = num(($('#pts', dlg).value || '').replace(/\D/g, ''), 0);
        dlg.close();
        if (!p) return toast('Keine Punkte vergeben.');
        const ups = [];
        change((c) => {
          const tt = (c.techniques[S.sheet] || []).find((x) => x.id === id);
          if (!tt) return;
          tt.aspects.forEach((k) => {
            const st = aspectState(c, k), before = ringStufe(k, st);
            st.punkte += p;
            if (ringStufe(k, st) > before) ups.push(`${ringName(k)} Stufe ${ringStufe(k, st)}`);
          });
        });
        return toast(`${p} Punkt(e) je Feld vergeben.${ups.length ? ' Aufstieg: ' + ups.join(', ') + '!' : ''}`);
      }
      dlg.close();
    });
  }

  const diffLabel = (t) => (t.diff === 'sonstiges' ? (t.diffText || 'Sonstiges') : R.difficulties[t.diff] || t.diff);

  function editTech(id) {
    const c = ch(), sheet = sheetDef(S.sheet);
    const list = (c.techniques[sheet.key] ||= []);
    const t = list.find((x) => x.id === id) || { id: '', name: '', diff: 'leicht', stufe: 0, punkte: 0, aspects: [], note: '' };
    const own = sheet.klass === c.klass;
    const payable = Object.entries(c.aspects).filter(([k, st]) => k.startsWith(sheet.key + '.') && ringAvail(st) > 0).sort((a, b) => ringAvail(b[1]) - ringAvail(a[1]));
    openDialog(`<h3>${t.id ? 'Bearbeiten' : sheet.listName === 'Zauber' ? 'Neuer Zauber' : 'Neue Technik'}</h3>
      <label class="f">Name<input id="tn" value="${esc(t.name)}"></label>
      <label class="f">Schwierigkeit<select id="td">${Object.entries(R.difficulties).map(([key, v]) => `<option value="${key}"${key === t.diff ? ' selected' : ''}${!own && key !== 'leicht' && key !== 'sonstiges' ? ' disabled' : ''}>${v}</option>`).join('')}</select></label>
      <label class="f" id="tdxw"${t.diff === 'sonstiges' ? '' : ' hidden'}>Sonstiges (Freitext)<input id="tdx" value="${esc(t.diffText || '')}" placeholder="z. B. mit der DM vereinbart"></label>
      <p class="hint">Welche Abschnitte belegt sie? Pro Kreis ein Feld. Beim Anwenden bekommt jedes gewählte Feld die vergebenen Punkte.</p>
      ${sheet.charts.map((ct, ci) => (ct.groups || [{ label: ct.label || (sheet.charts.length > 1 ? `Kreis ${ci + 1}` : ''), aspects: ct.aspects }]).map((g, gi) => {
        const name = `ap-${ci}-${gi}`, keys = g.aspects.map((a) => aspectKey(sheet.key, ct.key, a));
        const has = keys.find((k) => t.aspects.includes(k));
        return `${g.label ? `<div class="group-h">${esc(g.label)}</div>` : ''}<div class="aspect-pick">
          <label><input type="radio" name="${name}" value=""${has ? '' : ' checked'}>keins</label>
          ${g.aspects.map((a, i) => `<label><input type="radio" name="${name}" value="${esc(keys[i])}"${keys[i] === has ? ' checked' : ''}>${esc(a)}</label>`).join('')}</div>`;
      }).join('')).join('')}

      <label class="f">Notiz${sheet.listName === 'Zauber' ? ' / Aufbau' : ''}<input id="tt" value="${esc(t.note)}"></label>
      ${t.id ? '' : `<div class="cost">
        <label class="f">Kostet das Lernen Punkte? (leer = nein)<input id="tc" type="text" inputmode="numeric" placeholder="0"></label>
        <label class="f">Bezahlt mit den Punkten von Feld<select id="tcs">${payable.length ? payable.map(([k, st]) => `<option value="${esc(k)}">${esc(ringName(k))} (${ringAvail(st)} verfügbar)</option>`).join('') : '<option value="">– noch keine Punkte gesammelt –</option>'}</select></label>
        ${sheet.key === 'handwerk' ? '<p class="hint">Laut Regeln: leicht 5, mittel 20, schwer 50 Punkte.</p>' : ''}
      </div>`}
      <div class="row end">${t.id ? '<button class="btn danger" data-d-act="del">Löschen</button>' : ''}<button class="btn" data-d-act="close">Abbrechen</button><button class="btn fill" data-d-act="ok">Speichern</button></div>`,
    (act) => {
      if (act === 'del') {
        if (!confirm('Wirklich löschen?')) return;
        change((c) => { c.techniques[sheet.key] = c.techniques[sheet.key].filter((x) => x.id !== t.id); });
      }
      if (act === 'ok') {
        const name = $('#tn', dlg).value.trim();
        if (!name) return $('#tn', dlg).focus();
        const upd = { id: t.id || uid(), name, diff: $('#td', dlg).value, diffText: $('#td', dlg).value === 'sonstiges' ? $('#tdx', dlg).value.trim() : '', 
          aspects: [...dlg.querySelectorAll('.aspect-pick input:checked')].map((x) => x.value).filter(Boolean), note: $('#tt', dlg).value.trim() };
        const cost = t.id ? 0 : num(($('#tc', dlg).value || '').replace(/\D/g, ''), 0);
        const payId = t.id ? '' : $('#tcs', dlg).value;
        if (cost) {
          const payer = c.aspects[payId];
          if (!payer) return alert('Es gibt noch kein Feld mit Punkten, von dem die Kosten bezahlt werden können.');
          if (ringAvail(payer) < cost && !confirm(`„${ringName(payId)}“ hat nur ${ringAvail(payer)} verfügbare Punkte, die Technik kostet ${cost}. Trotzdem speichern?`)) return;
          if (!confirm(`„${name}“ lernen und ${cost} verfügbare Punkte von „${ringName(payId)}“ ausgeben? (Gesammelte Punkte und Stufe des Feldes bleiben.)`)) return;
        }
        change((c) => {
          const l = (c.techniques[sheet.key] ||= []); const i = l.findIndex((x) => x.id === upd.id); if (i >= 0) l[i] = upd; else l.push(upd);
          if (cost) { const payer = aspectState(c, payId); payer.spent = Math.min(num(payer.punkte), num(payer.spent) + cost); }
        });
        if (cost) toast(`${cost} Punkte ausgegeben (gesammelte Punkte bleiben).`);
      }
      dlg.close();
    });
    const sel = $('#td', dlg);
    sel.onchange = () => { $('#tdxw', dlg).hidden = sel.value !== 'sonstiges'; if (sel.value === 'sonstiges') $('#tdx', dlg).focus(); };
  }

  // Charakterangaben nachträglich bearbeiten (bewusst nur über den kleinen ✎-Knopf).
  function editChar() {
    const c = ch(), subs = Object.keys(R.subclasses[c.klass] || {});
    openDialog(`<h3>Charakterangaben</h3>
      <label class="f">Name<input id="en" value="${esc(c.name)}"></label>
      <div class="grid3">
        <label class="f">Alter<input id="ea" value="${esc(c.alter)}"></label>
        <label class="f">Rasse<input id="er" value="${esc(c.rasse)}"></label>
        <label class="f">Größe<input id="eg" value="${esc(c.groesse)}"></label>
      </div>
      ${c.lauf ? '<p class="hint">Die Ausrichtung kommt aus dem Laufzettel der DM.</p>' : `<label class="f">Aktuelle Ausrichtung<select id="es"><option value="">Neutral</option>${subs.map((x) => `<option${x === c.sub ? ' selected' : ''}>${esc(x)}</option>`).join('')}</select></label>`}
      <p class="hint">Die Klasse (${esc(klassOf(c).name)}) ist fest.</p>
      <div class="row end"><button class="btn" data-d-act="close">Abbrechen</button><button class="btn fill" data-d-act="ok">Speichern</button></div>`,
    (act) => {
      if (act === 'ok') {
        const name = $('#en', dlg).value.trim();
        if (!name) return $('#en', dlg).focus();
        const v = { name, alter: $('#ea', dlg).value.trim(), rasse: $('#er', dlg).value.trim(), groesse: $('#eg', dlg).value.trim() };
        const sel = $('#es', dlg);
        change((c) => { Object.assign(c, v); if (sel) c.sub = sel.value; });
      }
      dlg.close();
    });
  }

  // Neuer Charakter: Name und Klasse werden einmalig festgelegt.
  // Beim ersten Start „Eigener Charakter“ gewählt: den vorbelegten Hicks wieder entfernen.
  function dropDefault() {
    if (!S.replaceDefault) return;
    S.chars = S.chars.filter((x) => x.id !== S.replaceDefault);
    delete S.replaceDefault;
  }
  function newCharDialog(player) {
    player = player || (ch() && ch().player) || (S.players || [])[0] || 'Spieler';
    openDialog(`<h3>Neuer Charakter für ${esc(player)}</h3>
      <label class="f">Name<input id="nn" placeholder="Name"></label>
      ${PRESETS.filter((pr) => pr.who === player && !S.chars.some((c) => c.name === pr.name)).map((pr) => `<button class="choice" data-d-act="preset" data-n="${esc(pr.name)}" style="border-left:6px solid ${R.classes[pr.klass].color}">${esc(pr.name)} <small>Vorlage: ${esc(R.classes[pr.klass].name)}, Spieler ${esc(pr.who)}</small></button>`).join('')}
      <p class="hint">Oder eigener Charakter: Name eintragen und Klasse wählen – sie lässt sich danach nicht mehr ändern.</p>
      ${Object.entries(R.classes).map(([key, v]) => `<button class="choice" data-d-act="klass" data-k="${key}" style="border-left:6px solid ${v.color}">${esc(v.name)}<small>Ressource: ${esc(v.resource)}</small></button>`).join('')}
      <div class="row end"><button class="btn" data-d-act="close">Abbrechen</button></div>`,
    (act, b) => {
      if (act === 'klass') {
        const c = newChar($('#nn', dlg).value.trim() || 'Neuer Charakter', b.dataset.k);
        c.player = player;
        S.chars.push(c); S.current = c.id; S.tab = 'bogen'; dropDefault(); save(); render();
      }
      if (act === 'preset') {
        const c = withIds({ chars: [PRESETS.find((x) => x.name === b.dataset.n).make()] }).chars[0];
        c.player = player;
        S.chars.push(c); S.current = c.id; S.tab = 'bogen'; dropDefault(); save(); render();
        refreshLaufzettel();
      }
      dlg.close();
    });
  }

  // Auswahl: Spieler → Charaktere. Bei jedem Spieler „+ Charakter“, unten „+ Spieler“.
  function charMenu() {
    syncPlayers();
    openDialog(`<h3>Spieler & Charaktere</h3>
      ${S.players.map((pl) => {
        const mine = S.chars.filter((c) => c.player === pl);
        return `<div class="player">
          <div class="player-h"><b>${esc(pl)}</b>${mine.length ? '' : `<button class="link danger" data-d-act="delPlayer" data-p="${esc(pl)}">Spieler entfernen</button>`}<button class="btn small" data-d-act="new" data-p="${esc(pl)}">+ Charakter</button></div>
          ${mine.map((c) => `<button class="choice${c.id === S.current ? ' on' : ''}" data-d-act="sel" data-id="${c.id}" style="border-left:6px solid ${klassOf(c).color}">${esc(c.name)}<small>${esc(klassOf(c).name)} · Level ${c.level}</small></button>`).join('') || '<p class="hint">Noch kein Charakter.</p>'}
        </div>`;
      }).join('')}
      <div class="row end"><button class="btn danger" data-d-act="del">Aktuellen Charakter löschen</button><button class="btn fill" data-d-act="newPlayer">+ Spieler</button></div>
      ${(S.trash || []).length ? `<div class="group-h" style="margin-top:14px">Zuletzt gelöscht</div>${S.trash.map((t) => `<div class="tx row" style="flex-direction:row">
        <span class="grow">${esc(t.char.name)} <small class="hint">(${esc(t.char.player || '')}, ${esc(klassOf(t.char).name)}, Level ${t.char.level})</small><br><small>gelöscht ${esc(t.when)}</small></span>
        <button class="btn small" data-d-act="restore" data-id="${esc(t.id)}">Wiederherstellen</button></div>`).join('')}` : ''}`,
    (act, b) => {
      if (act === 'sel') { S.current = b.dataset.id; save(); render(); }
      if (act === 'new') return newCharDialog(b.dataset.p);
      if (act === 'newPlayer') {
        const name = (prompt('Name des neuen Spielers:') || '').trim();
        if (!name) return;
        if (S.players.includes(name)) return alert('Diesen Spieler gibt es schon.');
        S.players.push(name); save(); return charMenu();
      }
      if (act === 'delPlayer') { S.players = S.players.filter((x) => x !== b.dataset.p); save(); return charMenu(); }
      if (act === 'del') {
        if (S.chars.length < 2) return alert('Der letzte Charakter kann nicht gelöscht werden.');
        if (!confirm(`„${ch().name}“ (${ch().player}) wirklich löschen?`)) return;
        const gone = ch();
        const when = new Date().toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        S.trash = [{ id: gone.id, char: JSON.parse(JSON.stringify(gone)), when, ts: Date.now() }, ...(S.trash || []).filter((t) => t.id !== gone.id)].slice(0, 5);
        S.chars = S.chars.filter((c) => c.id !== S.current); S.current = S.chars[0].id; save(); render();
        toast(`„${gone.name}“ gelöscht – unter ☰ wiederherstellbar.`);
      }
      if (act === 'restore') {
        const t = (S.trash || []).find((x) => x.id === b.dataset.id);
        if (!t) return;
        const c = JSON.parse(JSON.stringify(t.char));
        if (S.chars.some((x) => x.id === c.id)) c.id = uid();
        S.chars.push(c); S.current = c.id; S.trash = S.trash.filter((x) => x.id !== t.id); syncPlayers(); save(); render();
        toast(`„${c.name}“ wiederhergestellt.`);
      }
      dlg.close();
    });
  }

  // ---------- Ereignisse ----------
  $('#btn-chars').onclick = charMenu;
  $('#tabs').onclick = (e) => { const b = e.target.closest('button'); if (b) { S.tab = b.dataset.tab; save(); render(); window.scrollTo(0, 0); } };

  const view = $('#view');
  view.addEventListener('input', (e) => {
    const t = e.target, c = ch();
    if (t.dataset.bind && t.tagName !== 'SELECT') { c[t.dataset.bind] = t.value; save(); if (t.dataset.bind === 'name') applyTheme(); }
    else if (t.dataset.bindn) { c[t.dataset.bindn] = num(t.value); save(); }
    else if (t.dataset.equip) {
      const e = equipOf(c)[num(t.dataset.i)], f = t.dataset.equip;
      if (f === 'label') e.label = t.value;
      else if (e.item) e.item[f] = f === 'atk' || f === 'def' ? num(t.value) : t.value;
      save();
    }
    else if (t.dataset.item) { const it = (c[t.dataset.list] || c.items)[num(t.dataset.i)]; it[t.dataset.item] = t.dataset.item === 'qty' ? num(t.value, 1) : t.value; save(); }
  });
  view.addEventListener('change', (e) => {
    const t = e.target;
    if (t.tagName === 'SELECT' && t.dataset.bind) change((c) => {
      c[t.dataset.bind] = t.value;
      if (t.dataset.bind === 'klass') c.sub = '';
    });
    else if (t.dataset.bindn) render();
    else if (t.dataset.equip === 'atk' || t.dataset.equip === 'def') render();
    else if (t.id === 'import' && t.files[0]) importFile(t.files[0]);
  });
  view.addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const d = num(b.dataset.d), i = num(b.dataset.i);
    switch (b.dataset.act) {
      case 'lp': return change((c) => { const m = lpMax(c); c.lpCur = Math.max(0, Math.min(m, cur(c.lpCur, m) + d)); });
      case 'res': return change((c) => { const m = resMax(c); c.resCur = Math.max(0, Math.min(m, cur(c.resCur, m) + d)); });
      case 'level': {
        const c = ch(), to = c.level + d;
        if (to < 0) return;
        const res = klassOf(c).resource, bo = bonusAt(d > 0 ? c.level : to);
        const q = d > 0
          ? `Levelaufstieg auf Level ${to}?\n\nDadurch: +${bo.lp} LP, +${bo.res} ${res} und ${bo.attr} Punkt(e) zum Verteilen (ATK, DEF oder Attributfähigkeit).`
          : `Level wirklich auf ${to} senken?\n\nDadurch: −${bo.lp} LP, −${bo.res} ${res} und ${bo.attr} Punkt(e) weniger zum Verteilen.`;
        if (!confirm(q)) return;
        return change((c) => { c.level = to; });
      }
      case 'atk': case 'def': {
        const k = b.dataset.act, cur0 = num(ch()[k]);
        if (d < 0) {
          if (cur0 <= 0) return;
          if (!confirm(`${k.toUpperCase()} von ${cur0} auf ${cur0 - 1} senken? Der Punkt wird wieder frei.`)) return;
        } else if (!pointOk(d)) return;
        return change((c) => { c[k] = Math.max(0, num(c[k]) + d); });
      }
      case 'save': {
        const c = ch();
        if (!c.saves[i]) {
          const left = saveCount(c) - c.saves.filter((u, j) => u && j < saveCount(c)).length;
          if (!confirm(`Rettungswurf verbrauchen? Danach ${left - 1 === 1 ? 'bleibt 1 Rettungswurf' : `bleiben ${left - 1} Rettungswürfe`} übrig.`)) return;
        } else if (!confirm('Rettungswurf wieder freigeben?')) return;
        return change((c) => { c.saves[i] = !c.saves[i]; });
      }
      case 'pickAttr': return pickAttr(i);
      case 'pickClass': return pickClass(i);
      case 'catalog': return catalog();
      case 'attrCatalog': return attrCatalog();
      case 'attrStufe': {
        const s = ch().attrSlots[i];
        if (d > 0 && lockedReason(ch(), s.skill)) return alert(lockedReason(ch(), s.skill));
        if (d < 0 && s.stufe <= 1) {
          if (!confirm(`„${s.skill}“ entfernen? ${s.stufe ? 'Der Punkt wird wieder frei.' : ''}`)) return;
          return change((c) => { c.attrSlots[i] = { skill: '', stufe: 0, check: false }; });
        }
        if (!pointOk(d)) return;
        return change((c) => { c.attrSlots[i].stufe = Math.max(1, c.attrSlots[i].stufe + d); });
      }
      case 'classStufe': return change((c) => { c.classSlots[i].stufe = Math.max(0, Math.min(6, c.classSlots[i].stufe + d)); });
      case 'sheet': S.tab = 'techniken'; S.sheet = b.dataset.k; save(); return render();
      case 'aspect': return editAspect(b.dataset.k);
      case 'newTech': return editTech('');
      case 'editTech': return editTech(b.dataset.id);
      case 'applyTech': return applyDialog(b.dataset.id);
      case 'addItem': {
        const list = b.dataset.list || 'items';
        if (list === 'items' && ch().items.length >= slotMax(ch())) return alert('Alle Inventarslots sind belegt. Baue einen Slot aus oder lege den Gegenstand in „Ohne Inventarslot“.');
        return change((c) => { (c[list] ||= []).push({ id: uid(), name: '', qty: 1, note: '' }); });
      }
      case 'delItem': {
        const list = b.dataset.list || 'items', it = ch()[list][i];
        if (it && it.name && !confirm(`„${it.name}“ entfernen?`)) return;
        return change((c) => { c[list].splice(i, 1); });
      }
      case 'moveItem': {
        const from = b.dataset.list, to = from === 'items' ? 'freeItems' : 'items';
        if (to === 'items' && ch().items.length >= slotMax(ch())) return alert('Kein freier Inventarslot.');
        return change((c) => { (c[to] ||= []).push(...c[from].splice(i, 1)); });
      }
      case 'equip': return equipItem(b.dataset.list || 'items', i);
      case 'unequip': {
        if (ch().items.length >= slotMax(ch())) {
          if (!confirm('Kein Inventarslot frei. In „Ohne Inventarslot“ ablegen?')) return;
          return change((c) => { const it = c.equip[i].item; c.equip[i].item = null; delete it.from; (c.freeItems ||= []).push(it); });
        }
        return change((c) => { const it = c.equip[i].item; c.equip[i].item = null; delete it.from; c.items.push(it); });
      }
      case 'adjQty': {
        const list = b.dataset.list, it = ch()[list][i];
        const amt = num(b.closest('.item').querySelector('.adj-amt').value.replace(/\D/g, ''));
        if (!amt) return alert('Bitte eine Menge eintragen.');
        const left = num(it.qty, 1) + d * amt;
        if (left < 0) return alert(`So viele sind nicht da (nur ${num(it.qty, 1)}).`);
        if (left === 0) {
          if (!confirm(`Danach ist nichts mehr von „${it.name || 'Gegenstand'}“ übrig. Eintrag entfernen?`)) return;
          return change((c) => { c[list].splice(i, 1); });
        }
        return change((c) => { c[list][i].qty = left; });
      }
      case 'pts': {
        const [n, a, bb] = R.pointActions[num(b.dataset.a)], k = num(b.dataset.k);
        return addPoints(k ? bb : a, `${n} (${k ? 'besonders' : 'regulär'})`);
      }
      case 'ptsAdj': {
        const v = num(($('#ptsAdj').value || '').replace(/\D/g, ''));
        if (!v) return alert('Bitte eine Punktzahl eintragen.');
        return addPoints(d * v, ($('#ptsWhy').value || '').trim() || 'Punkte');
      }
      case 'ptsUndo': {
        const t = (ch().pointsLog || [])[i];
        if (!t || !confirm(`„${t.what}“ (${t.p > 0 ? '+' : ''}${t.p}) zurücknehmen?`)) return;
        return addPoints(-t.p, 'Zurückgenommen: ' + t.what, i);
      }
      case 'levelInfo': return levelInfo();
      case 'editChar': return editChar();
      case 'guild': {
        const from = num(ch().guild), to = Math.max(0, Math.min(R.guildMax, from + d));
        if (to === from) return;
        if (!confirm(d > 0 ? `Abenteurergilde von Stufe ${from} auf Stufe ${to} erhöhen?` : `Abenteurergilde von Stufe ${from} auf Stufe ${to} senken?`)) return;
        return change((c) => { c.guild = to; });
      }
      case 'slotExtra': return change((c) => { c.slotExtra = Math.max(0, num(c.slotExtra) + d); });
      case 'tx': return booking(d, b);
      case 'export': return exportFile();
    }
  });

  // Widerspruch, wenn mehr Punkte verteilt würden, als das Level hergibt (DM-Ausnahmen bleiben möglich).
  function pointOk(d) {
    if (d <= 0) return true;
    const c = ch(), total = levelPointsTotal(c), free = total - spentPoints(c);
    if (free > 0) return true;
    return confirm(`Keine Punkte mehr zu verteilen: Level ${c.level} gibt ${total} Punkte, verteilt sind schon ${spentPoints(c)}.\n\nTrotzdem skillen (z. B. weil der DM es erlaubt)?`);
  }

  function exportFile() {
    const blob = new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `charakterbogen-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  function importFile(file) {
    file.text().then((txt) => {
      const d = JSON.parse(txt);
      if (!d || !Array.isArray(d.chars) || !d.chars.length) throw new Error('kein Charakterbogen');
      if (!confirm('Sicherung laden? Die Daten auf diesem Gerät werden ersetzt.')) return;
      S = d; save(); render();
    }).catch(() => alert('Die Datei ist keine gültige Sicherung.'));
  }

  // ---------- Abgleich zwischen Geräten (geheimes Gist im GitHub-Konto) ----------
  const SYNC_KEY = 'charakterbogen-sync';
  const GIST_FILE = 'charakterbogen-daten.json';
  const loadSync = () => { try { return JSON.parse(localStorage.getItem(SYNC_KEY)) || {}; } catch (e) { return {}; } };
  let Y = loadSync();
  const saveSync = () => { try { localStorage.setItem(SYNC_KEY, JSON.stringify(Y)); } catch (e) { /* kein Speicher */ } };
  const shared = (st) => JSON.parse(JSON.stringify({ chars: st.chars.map(({ lauf, ...c }) => c), players: st.players || [], trash: (st.trash || []).map((t) => ({ ...t, char: (({ lauf, ...c }) => c)(t.char) })) }));

  // JSON mit sortierten Schlüsseln vergleichen
  const canon = (v) => JSON.stringify(v, (k, x) => (x && typeof x === 'object' && !Array.isArray(x) ? Object.keys(x).sort().reduce((o, key) => { o[key] = x[key]; return o; }, {}) : x));
  const same = (a, b) => canon(a) === canon(b);
  const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
  const hasIds = (...lists) => lists.every((l) => !l || (Array.isArray(l) && l.every((x) => isObj(x) && x.id)));

  // Drei-Wege-Abgleich: base = Stand beim letzten Abgleich, l = dieses Gerät, r = anderes Gerät.
  function merge(b, l, r, path, conflicts) {
    if (same(l, r)) return l;
    if (same(l, b)) return r;
    if (same(r, b)) return l;
    const last = path[path.length - 1];
    if (last === 'money' && isObj(l) && isObj(r)) {
      const out = {};
      ['g', 's', 'k'].forEach((k) => { const bb = num(b && b[k]); out[k] = bb + (num(l[k]) - bb) + (num(r[k]) - bb); });
      return out;
    }
    if ((last === 'points' || (path.includes('aspects') && (last === 'punkte' || last === 'spent'))) && typeof l === 'number' && typeof r === 'number') return num(b) + (l - num(b)) + (r - num(b));
    if (last === 'players' && Array.isArray(l) && Array.isArray(r)) return [...new Set([...l, ...r])];
    if (last === 'trash' && Array.isArray(l) && Array.isArray(r)) {
      const m = new Map(); [...l, ...r].forEach((t) => m.set(t.id, t));
      const removed = new Set((Array.isArray(b) ? b : []).map((t) => t.id).filter((id) => !l.some((t) => t.id === id) || !r.some((t) => t.id === id)));
      return [...m.values()].filter((t) => !removed.has(t.id)).sort((x, y) => num(y.ts) - num(x.ts)).slice(0, 5);
    }
    if ((last === 'moneyLog' || last === 'pointsLog') && Array.isArray(l) && Array.isArray(r)) {
      const seen = new Set(), all = [];
      [...l, ...r].forEach((t) => { const k = canon(t); if (!seen.has(k)) { seen.add(k); all.push(t); } });
      return all.sort((x, y) => num(y.ts) - num(x.ts)).slice(0, 10);
    }
    if (isObj(l) && isObj(r)) {
      const bo = isObj(b) ? b : {}, out = {};
      new Set([...Object.keys(l), ...Object.keys(r)]).forEach((k) => {
        const v = merge(bo[k], l[k], r[k], [...path, k], conflicts);
        if (v !== undefined) out[k] = v;
      });
      return out;
    }
    if (Array.isArray(l) && Array.isArray(r)) {
      if (hasIds(b, l, r)) {
        const map = (a) => new Map((a || []).map((x) => [x.id, x]));
        const bm = map(b), lm = map(l), rm = map(r);
        const ids = [...l.map((x) => x.id), ...r.map((x) => x.id).filter((id) => !lm.has(id))];
        return ids.map((id) => merge(bm.get(id), lm.get(id), rm.get(id), [...path, { id, name: (lm.get(id) || rm.get(id)).name }], conflicts)).filter((v) => v !== undefined);
      }
      if (l.length === r.length && (!Array.isArray(b) || b.length === l.length)) {
        return l.map((x, i) => merge(Array.isArray(b) ? b[i] : undefined, x, r[i], [...path, i], conflicts));
      }
    }
    conflicts.push({ path, l, r });
    return { __konflikt: conflicts.length - 1 };
  }
  function resolve(v, choice) {
    if (isObj(v) && v.__konflikt !== undefined) return choice[v.__konflikt];
    if (Array.isArray(v)) return v.map((x) => resolve(x, choice)).filter((x) => x !== undefined);
    if (isObj(v)) { const o = {}; Object.keys(v).forEach((k) => { const x = resolve(v[k], choice); if (x !== undefined) o[k] = x; }); return o; }
    return v;
  }

  const FIELD = { name: 'Name', sub: 'Ausrichtung', alter: 'Alter', rasse: 'Rasse', groesse: 'Größe', level: 'Level', lpCur: 'Lebenspunkte', lpExtra: 'LP Zusatz',
    resCur: 'Ressource', resBase: 'Ressource Start', resExtra: 'Ressource Zusatz', atk: 'ATK', def: 'DEF', saves: 'Rettungswürfe', vorteil: 'Vorteil', nachteil: 'Nachteil',
    money: 'Geld', moneyLog: 'Buchungen', attrSlots: 'Levelpunkte', classSlots: 'Klassenpunkte', aspects: 'Übungskreise', techniques: 'Techniken', items: 'Inventar',
    freeItems: 'Ohne Inventarslot', equip: 'Ausrüstung', notes: 'Notizen', slotExtra: 'Slot-Ausbau', stufe: 'Stufe', punkte: 'Punkte', skill: 'Fähigkeit', qty: 'Anzahl',
    note: 'Notiz', points: 'Punkte', pointsLog: 'Punkte-Verlauf', guild: 'Abenteurergilde', laufName: 'Name im Laufzettel', label: 'Slot-Name', item: 'Gegenstand', diff: 'Schwierigkeit', klass: 'Klasse', from: 'Ausrichtung' };
  const pathText = (path) => path.filter((p) => p !== 'chars').map((p) => (typeof p === 'object' ? p.name || 'Eintrag' : typeof p === 'number' ? `Nr. ${p + 1}` : FIELD[p] || p)).join(' › ');
  function shown(v) {
    if (v === undefined || v === null) return v === undefined ? '(gelöscht)' : '(voll)';
    if (Array.isArray(v)) return `${v.length} Einträge`;
    if (isObj(v)) return v.name || v.skill || Object.entries(v).filter(([k]) => k !== 'id').map(([k, x]) => `${FIELD[k] || k}: ${typeof x === 'object' ? '…' : x}`).join(', ').slice(0, 80);
    if (typeof v === 'boolean') return v ? 'ja' : 'nein';
    return String(v).length > 80 ? String(v).slice(0, 80) + ' …' : String(v) || '(leer)';
  }

  async function gh(method, url, body) {
    const res = await fetch('https://api.github.com' + url, {
      method, headers: { Accept: 'application/vnd.github+json', Authorization: 'Bearer ' + Y.token, ...(body ? { 'Content-Type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined, cache: 'no-store',
    });
    if (res.status === 401) throw new Error('Der Zugangsschlüssel ist ungültig oder abgelaufen.');
    if (res.status === 404 && url.startsWith('/gists/')) { const e = new Error('Ablage nicht gefunden.'); e.notFound = true; throw e; }
    if (!res.ok) throw new Error(`GitHub antwortet mit Fehler ${res.status}.`);
    return res.json();
  }
  async function readGist(g) {
    const f = g.files && g.files[GIST_FILE];
    if (!f) return null;
    const txt = f.truncated ? await (await fetch(f.raw_url, { cache: 'no-store' })).text() : f.content;
    return JSON.parse(txt);
  }
  async function findGist() {
    for (let page = 1; page <= 5; page++) {
      const list = await gh('GET', `/gists?per_page=100&page=${page}`);
      const hit = list.find((g) => g.files && g.files[GIST_FILE]);
      if (hit) return hit.id;
      if (list.length < 100) break;
    }
    return null;
  }
  const writeGist = (data) => gh('PATCH', '/gists/' + Y.gistId, { files: { [GIST_FILE]: { content: JSON.stringify(data) } } });

  function setButton(state) {
    const b = $('#btn-sync');
    b.classList.toggle('spin', state === 'busy');
    b.disabled = state === 'busy';
  }
  function finish(data, msg) {
    S.chars = withIds(JSON.parse(JSON.stringify(data))).chars;
    if (Array.isArray(data.players)) S.players = [...new Set([...data.players, ...S.chars.map((c) => c.player).filter(Boolean)])];
    if (Array.isArray(data.trash)) S.trash = data.trash.filter((t) => !S.chars.some((c) => c.id === t.id)).sort((a, b) => num(b.ts) - num(a.ts)).slice(0, 5);
    if (!S.chars.some((c) => c.id === S.current)) S.current = S.chars[0].id;
    Y.base = shared(S); Y.last = new Date().toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    save(); saveSync(); applyLaufzettel(false); toast(msg);
    checkDuplicates();
  }

  // Gleichnamige Charaktere, die auf zwei Geräten getrennt angelegt wurden, gelten als derselbe.
  const nameKey = (c) => String(c.name || '').trim().toLowerCase();
  function templateFor(c) {
    const t = nameKey(c) === 'hicks' ? hicks() : newChar(c.name, c.klass);
    t.id = c.id; t.name = c.name;
    return JSON.parse(JSON.stringify(t));
  }
  function pairByName(base, local, remote) {
    const inBase = new Set((base.chars || []).map((c) => c.id)), localIds = new Set(local.chars.map((c) => c.id)), remoteIds = new Set(remote.chars.map((c) => c.id));
    const b = JSON.parse(JSON.stringify(base)); b.chars ||= [];
    const r = JSON.parse(JSON.stringify(remote));
    r.chars.forEach((rc) => {
      if (localIds.has(rc.id) || inBase.has(rc.id)) return;
      const lc = local.chars.find((x) => nameKey(x) === nameKey(rc) && !remoteIds.has(x.id) && !inBase.has(x.id));
      if (!lc) return;
      rc.id = lc.id; remoteIds.add(lc.id);
      b.chars.push(templateFor(lc));
    });
    return [b, r];
  }
  function checkDuplicates() {
    if (dlg.open) return;
    const seen = new Map();
    const dup = S.chars.map((c) => { const k = nameKey(c); if (seen.has(k)) return [seen.get(k), c]; seen.set(k, c); return null; }).find(Boolean);
    if (!dup) return;
    const [a, b] = dup;
    const info = (c) => `Level ${c.level}${c.alter ? ', Alter ' + c.alter : ''}${c.groesse ? ', Größe ' + c.groesse : ''}, ${(c.items || []).length} Gegenstände`;
    openDialog(`<h3>„${esc(a.name)}“ gibt es zweimal</h3>
      <p class="hint">Wahrscheinlich wurde der Charakter auf PC und Handy getrennt angelegt.</p>
      <p>1: ${esc(info(a))}<br>2: ${esc(info(b))}</p>
      <button class="choice" data-d-act="join">Zu einem zusammenführen<small>Eingaben beider werden übernommen, bei Widersprüchen fragt die App.</small></button>
      <div class="row end"><button class="btn" data-d-act="close">Später</button></div>`,
    (act) => {
      dlg.close();
      if (act !== 'join') return;
      const conflicts = [];
      const bb = { ...JSON.parse(JSON.stringify(b)), id: a.id };
      const joined = merge(templateFor(a), JSON.parse(JSON.stringify(a)), bb, [{ id: a.id, name: a.name }], conflicts);
      const done = (c) => {
        S.chars = S.chars.filter((x) => x.id !== b.id).map((x) => (x.id === a.id ? c : x));
        if (S.current === b.id) S.current = a.id;
        save(); render();
        if (Y.token) pushNow('Zusammengeführt und gespeichert.'); else toast('Zusammengeführt.');
      };
      if (conflicts.length) conflictDialog(joined, conflicts, done, ['Eintrag 1', 'Eintrag 2'], 'Diese Angaben stehen in beiden Einträgen verschieden. Welche gilt?');
      else done(joined);
    });
  }
  async function pushNow(msg) {
    setButton('busy');
    try { await writeGist(shared(S)); finish(shared(S), msg); }
    catch (e) { alert('Speichern hat nicht geklappt: ' + (e.message || e)); }
    finally { setButton(); }
  }
  function toast(msg) {
    let t = $('#toast');
    if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('on');
    try { sessionStorage.setItem('cb-toast', msg); } catch (e) { /* egal */ }
    clearTimeout(t._h); t._h = setTimeout(() => { t.classList.remove('on'); try { sessionStorage.removeItem('cb-toast'); } catch (e) { /* egal */ } }, 3500);
  }

  // auto = beim Laden der Seite: kein Einrichtungsdialog, Fehler nur als kurzer Hinweis.
  async function sync(auto = false) {
    if (!Y.token) return auto ? undefined : tokenDialog(true);
    setButton('busy');
    try {
      if (!Y.gistId) Y.gistId = await findGist();
      if (!Y.gistId) {
        const g = await gh('POST', '/gists', { description: 'Charakterbogen (App-Daten)', public: false, files: { [GIST_FILE]: { content: JSON.stringify(shared(S)) } } });
        Y.gistId = g.id; saveSync();
        return finish(shared(S), 'Gespeichert. Auf dem anderen Gerät jetzt „Aktualisieren“ drücken.');
      }
      let remote;
      try { remote = await readGist(await gh('GET', '/gists/' + Y.gistId)); } catch (e) { if (e.notFound) { Y.gistId = ''; saveSync(); setButton(); return sync(auto); } throw e; }
      const local = shared(S);
      if (!remote || !Array.isArray(remote.chars) || !remote.chars.length) { await writeGist(local); return finish(local, 'Gespeichert.'); }
      if (!Y.base) {
        setButton();
        return firstTimeDialog(local, remote);
      }
      const conflicts = [];
      const [base, rem] = pairByName(Y.base, local, remote);
      const merged = merge(base, local, rem, [], conflicts);
      if (conflicts.length) { setButton(); return conflictDialog(merged, conflicts, (m) => complete(m, remote)); }
      await complete(merged, remote);
    } catch (e) {
      const msg = navigator.onLine ? 'Aktualisieren hat nicht geklappt: ' + (e.message || e) : 'Offline – Abgleich beim nächsten Laden mit Internet.';
      if (auto) toast(msg); else alert(msg);
    } finally { setButton(); }
  }
  async function complete(merged, remote) {
    setButton('busy');
    try {
      if (!same(merged, remote)) await writeGist(merged);
      finish(merged, same(merged, shared(S)) ? (same(merged, remote) ? 'Alles aktuell.' : 'Gespeichert.') : 'Aktualisiert.');
    } catch (e) { alert('Aktualisieren hat nicht geklappt: ' + (e.message || e)); }
    finally { setButton(); }
  }
  function firstTimeDialog(local, remote) {
    const names = (d) => d.chars.map((c) => c.name).join(', ');
    openDialog(`<h3>Erster Abgleich auf diesem Gerät</h3>
      <p>In der Ablage liegen schon Daten: <b>${esc(names(remote))}</b>.<br>Auf diesem Gerät: <b>${esc(names(local))}</b>.</p>
      <button class="choice" data-d-act="take">Daten aus der Ablage übernehmen<small>Empfohlen. Was auf diesem Gerät steht, wird ersetzt.</small></button>
      <button class="choice" data-d-act="merge">Zusammenführen<small>Jeder Unterschied wird einzeln abgefragt.</small></button>
      <div class="row end"><button class="btn" data-d-act="close">Abbrechen</button></div>`,
    (act) => {
      dlg.close();
      if (act === 'take') finish(remote, 'Daten übernommen.');
      if (act === 'merge') {
        const conflicts = [];
        const [base, rem] = pairByName({ chars: [] }, local, remote);
        const merged = merge(base, local, rem, [], conflicts);
        if (conflicts.length) conflictDialog(merged, conflicts, (m) => complete(m, remote)); else complete(merged, remote);
      }
    });
  }
  function conflictDialog(merged, conflicts, onOk, labels = ['Dieses Gerät', 'Anderes Gerät'], intro = 'Diese Angaben wurden auf beiden Geräten unterschiedlich geändert. Welche gilt?') {
    const pick = conflicts.map(() => 'l');
    const choice = () => conflicts.map((x, i) => (pick[i] === 'l' ? x.l : x.r));
    const draw = () => `<h3>Unterschiede klären</h3>
      <p class="hint">${esc(intro)}</p>
      ${conflicts.map((x, i) => `<div class="conflict"><b>${esc(pathText(x.path))}</b>
        <button class="choice${pick[i] === 'l' ? ' on' : ''}" data-d-act="pick" data-i="${i}" data-s="l">${esc(labels[0])}<small>${esc(shown(x.l))}</small></button>
        <button class="choice${pick[i] === 'r' ? ' on' : ''}" data-d-act="pick" data-i="${i}" data-s="r">${esc(labels[1])}<small>${esc(shown(x.r))}</small></button></div>`).join('')}
      <div class="row end"><button class="btn" data-d-act="close">Abbrechen</button><button class="btn fill" data-d-act="ok">Übernehmen</button></div>`;
    openDialog(draw(), (act, b) => {
      if (act === 'pick') { pick[num(b.dataset.i)] = b.dataset.s; const top = dlg.scrollTop; dlg.innerHTML = draw(); dlg.scrollTop = top; return; }
      dlg.close();
      if (act === 'ok') onOk(resolve(merged, choice()));
    });
  }
  function tokenDialog(thenSync) {
    openDialog(`<h3>Abgleich einrichten</h3>
      <p class="hint">Einmal pro Gerät nötig. Die Daten werden als geheime Datei („Gist“) in deinem GitHub-Konto abgelegt.</p>
      <ol class="steps">
        <li>Öffne <a href="https://github.com/settings/tokens/new?scopes=gist&description=Charakterbogen%20${encodeURIComponent(new Date().toLocaleString('de-DE'))}" target="_blank" rel="noopener">diesen Link</a> (bei GitHub angemeldet).</li>
        <li>Bei „Expiration“ <b>No expiration</b> wählen. Das Häkchen bei <b>gist</b> ist schon gesetzt.</li>
        <li>Ganz unten <b>Generate token</b> drücken und den Schlüssel (beginnt mit <code>ghp_</code>) kopieren.</li>
        <li>Hier einfügen. Auf dem zweiten Gerät kannst du denselben Schlüssel verwenden – dann ist kein neuer nötig.</li>
      </ol>
      <label class="f">Zugangsschlüssel<input id="tok" autocomplete="off" spellcheck="false" placeholder="ghp_…" value="${esc(Y.token || '')}"></label>
      <div class="row end"><button class="btn" data-d-act="close">Abbrechen</button><button class="btn fill" data-d-act="ok">Speichern</button></div>`,
    (act) => {
      if (act === 'ok') {
        const t = $('#tok', dlg).value.trim();
        if (!t) return $('#tok', dlg).focus();
        if (t !== Y.token) { Y = { token: t }; saveSync(); }
        dlg.close(); render();
        if (thenSync) sync();
        return;
      }
      dlg.close();
    });
  }
  function syncCard() {
    return `<section class="card"><h2>Abgleich PC ↔ Handy</h2>
      ${Y.token ? `<p class="hint" style="margin-top:0">Eingerichtet.${Y.last ? ` Zuletzt aktualisiert: ${esc(Y.last)}.` : ''}</p>` : '<p class="hint" style="margin-top:0">Noch nicht eingerichtet.</p>'}
      <p class="hint">Abgeglichen wird automatisch beim Laden der Seite (z. B. Neu-Laden im Browser / F5) und mit ⟳ oben rechts. Dabei werden deine Änderungen gespeichert, die des anderen Geräts geholt und neue App-Fassungen geladen. Änderungen auf beiden Seiten werden zusammengeführt, bei Widersprüchen fragt die App.</p>
      <div class="row">
        <button class="btn fill" data-act="sync">⟳ Aktualisieren</button>
        <button class="btn" data-act="token">${Y.token ? 'Schlüssel ändern' : 'Einrichten'}</button>
        ${Y.token ? '<button class="btn danger" data-act="unsync">Abgleich trennen</button>' : ''}
      </div></section>`;
  }
  // ⟳: abgleichen und danach die Seite neu laden (holt auch eine neue Fassung der App).
  async function syncAndReload() {
    if (!Y.token) return tokenDialog(true);
    await sync();
    if (dlg.open) return; // Rückfrage offen – erst nach der Antwort neu laden
    try { sessionStorage.setItem('cb-synced', '1'); } catch (e) { /* egal */ }
    location.reload();
  }
  $('#btn-sync').onclick = syncAndReload;
  // Beim Laden (auch Neu-Laden im Browser) automatisch abgleichen.
  let skip = false;
  try { skip = sessionStorage.getItem('cb-synced') === '1'; sessionStorage.removeItem('cb-synced'); } catch (e) { /* egal */ }
  // Erster Start auf einem Gerät: Charakter wählen.
  function firstRunDialog() {
    return new Promise((done) => {
      openDialog(`<h3>Willkommen!</h3><p class="hint">Welchen Charakter spielst du auf diesem Gerät?</p>
        ${PRESETS.map((pr) => `<button class="choice" data-d-act="pick" data-n="${esc(pr.name)}" style="border-left:6px solid ${R.classes[pr.klass].color}">${esc(pr.name)}<small>${esc(R.classes[pr.klass].name)} · Spieler ${esc(pr.who)}</small></button>`).join('')}
        <button class="choice" data-d-act="own">Eigener Charakter<small>Name und Klasse selbst festlegen</small></button>`,
      (act, b) => {
        delete S.firstRun;
        if (act === 'pick') {
          const pr = PRESETS.find((x) => x.name === b.dataset.n), c = withIds({ chars: [pr.make()] }).chars[0];
          S.chars = [c]; S.current = c.id; S.players = [pr.who];
          if (pr.who !== 'Joshua') S.playersV1 = true; // nur auf Joshuas Gerät zusätzlich Kim/Vince anlegen
        }
        if (act === 'own') S.playersV1 = true;
        save(); render(); dlg.close();
        if (act === 'own') { S.replaceDefault = S.chars[0].id; newCharDialog(); }
        done();
      });
    });
  }

  setTimeout(async () => {
    if (S.firstRun && !Y.token) await firstRunDialog();
    if (!skip && Y.token) await sync(true); else checkDuplicates();
    if (!dlg.open) await refreshLaufzettel();
  }, 300);
  // Meldung, die vor dem Neuladen nicht mehr zu sehen war (z. B. nach ⟳), noch einmal zeigen.
  try { const m = sessionStorage.getItem('cb-toast'); if (m) setTimeout(() => toast(m), 200); } catch (e) { /* egal */ }
  // Kommt die installierte App aus dem Hintergrund zurück, ebenfalls abgleichen.
  let hiddenAt = 0;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) hiddenAt = Date.now();
    else if (hiddenAt && Date.now() - hiddenAt > 60000 && !dlg.open) sync(true);
  });
  view.addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    if (b.dataset.act === 'sync') syncAndReload();
    if (b.dataset.act === 'token') tokenDialog(false);
    if (b.dataset.act === 'unsync' && confirm('Abgleich auf diesem Gerät trennen? Die Daten hier bleiben erhalten.')) { Y = {}; saveSync(); render(); }
  });

  render();
})();
