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
    c.level = 1;
    c.notes = 'Ansichten der Dorfbewohner über Hicks:\nKleiner Quatschkopf/Chaot, will sich beweisen, macht aus vielem einen Wettbewerb, irgendwie sympathisch. Die Kinder im Dorf finden ihn gleichermaßen seltsam wie lustig (wie ein cooler Opa); verbreitet gute Laune.\n\nHeimatdorf: Hella (einen Tagesritt südlich von Hallrodon).';
    return c;
  }
  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(KEY));
      if (s && Array.isArray(s.chars) && s.chars.length) return s;
    } catch (e) { /* leer oder gesperrt */ }
    const c = hicks();
    return { chars: [c], current: c.id, tab: 'bogen', sheet: 'zauber' };
  }
  // Einträge in Listen bekommen eine feste Kennung, damit der Abgleich sie zuordnen kann.
  function withIds(st) {
    (st.chars || []).forEach((c) => ['items', 'freeItems'].forEach((l) => (c[l] || []).forEach((it) => { it.id ||= uid(); })));
    return st;
  }
  let S = withIds(load());
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
  const lpMax = (c) => R.startLP + c.level * R.lpPerLevel + 2 * attrStufe(c, 'Lebenspunktebonus') + num(c.lpExtra);
  const resMax = (c) => num(c.resBase) + c.level * R.resourcePerLevel + attrStufe(c, 'Kampfgeist') + num(c.resExtra);
  const saveCount = (c) => 5 + attrStufe(c, 'Überlebenskunst');
  const spentPoints = (c) => num(c.atk) + num(c.def) + c.attrSlots.reduce((a, s) => a + (s.skill ? num(s.stufe) : 0), 0);
  const cur = (v, max) => (v === null || v === undefined ? max : Math.min(v, max));

  const sheetDef = (k) => R.sheets.find((s) => s.key === k) || R.sheets[0];
  const aspectKey = (sheet, chart, aspect) => `${sheet}.${chart}.${aspect}`;
  const aspectState = (c, k) => (c.aspects[k] ||= { stufe: 0, punkte: 0 });
  const baseNeed = (sheet, stufe) => (R.baseThresholds[sheetDef(sheet).thresholds] || R.baseThresholds.normal)[stufe];
  const techNeed = (t) => (R.thresholds[t.diff] || R.thresholds.leicht)[t.stufe];
  function teachNote(stufe) {
    if (stufe >= R.masterFrom) return 'Nächste Stufe nur bei einem Meister (Lehre).';
    if (stufe >= R.teacherFrom) return 'Für die nächste Stufe braucht es jemanden, der sie beibringt.';
    return '';
  }

  // ---------- Darstellung ----------
  function applyTheme() {
    const k = klassOf(ch());
    document.documentElement.style.setProperty('--c', k.color);
    document.documentElement.style.setProperty('--cl', k.light);
    $('meta[name=theme-color]').setAttribute('content', k.color);
    $('#title').textContent = ch().name || 'Charakterbogen';
    $('#subtitle').textContent = [k.name, ch().sub.split(' (')[0]].filter(Boolean).join(' · ');
    document.title = (ch().name || 'Charakterbogen') + ' – Charakterbogen';
  }
  function render() {
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
    const free = c.level - spentPoints(c);
    const subs = Object.keys(R.subclasses[c.klass] || {});
    const n = saveCount(c);
    return `
    <section class="card">
      <h2>Charakter</h2>
      <label class="f">Name<input data-bind="name" value="${esc(c.name)}"></label>
      <div class="grid2">
        <label class="f">Klasse<div class="fixed">${esc(k.name)}</div></label>
        <label class="f">Unterklasse<select data-bind="sub"><option value="">–</option>${subs.map((s) => `<option${s === c.sub ? ' selected' : ''}>${esc(s)}</option>`).join('')}</select></label>
      </div>
      <div class="grid3">
        <label class="f">Alter<input data-bind="alter" value="${esc(c.alter)}"></label>
        <label class="f">Rasse<input data-bind="rasse" value="${esc(c.rasse)}"></label>
        <label class="f">Größe<input data-bind="groesse" value="${esc(c.groesse)}"></label>
      </div>
    </section>

    <section class="stats">
      ${stat('Lebenspunkte', cur(c.lpCur, lm), lm, 'lp')}
      ${stat(k.resource, cur(c.resCur, rm), rm, 'res')}
      ${stat('Level', c.level, undefined, 'level')}
      <div class="stat"><div class="lbl">Punkte zu verteilen</div><div class="val">${free}</div>
        <div class="hint" style="margin:4px 0 0">1 pro Level: ATK, DEF oder Attributfähigkeit</div></div>
      ${stat('ATK', c.atk + gearBonus(c, 'atk'), undefined, 'atk', gearBonus(c, 'atk') ? `${c.atk} geskillt ${gearBonus(c, 'atk') > 0 ? '+' : '−'} ${Math.abs(gearBonus(c, 'atk'))} Ausrüstung` : '')}
      ${stat('DEF', c.def + gearBonus(c, 'def'), undefined, 'def', gearBonus(c, 'def') ? `${c.def} geskillt ${gearBonus(c, 'def') > 0 ? '+' : '−'} ${Math.abs(gearBonus(c, 'def'))} Ausrüstung` : '')}
    </section>
    ${free < 0 ? '<p class="warn">Es sind mehr Punkte verteilt, als das Level hergibt.</p>' : ''}

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
      <p class="hint">LP max = ${R.startLP} + ${R.lpPerLevel} je Level + 2 je Stufe Lebenspunktebonus + Zusatz.
        ${k.resource} max = Start + ${R.resourcePerLevel} je Level + Stufe Kampfgeist + Zusatz.</p>
    </section>`;
  }

  function faehigkeiten(c) {
    const sub = (R.subclasses[c.klass] || {})[c.sub] || [];
    const used = c.attrSlots.filter((s) => s.skill).length;
    return `
    <section class="card">
      <h2>Levelpunkte <small>Attributfähigkeiten ${used}/10</small></h2>
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
      <h2>Klassenpunkte <span class="row"><small>${esc(c.sub ? c.sub.split(' (')[0] : 'keine Unterklasse')}</small><button class="btn small" data-act="catalog">Katalog</button></span></h2>
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
      <p class="hint">Klassenfähigkeiten haben die Stufen 1–6. Wählbar sind nur die Fähigkeiten der aktuellen Unterklasse (Reiter „Bogen“). Fähigkeiten aus einer früheren Unterklasse bleiben stehen und sind grau markiert.</p>
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
      const st = aspectState(c, aspectKey(sheet.key, chart.key, asp));
      const r = (Math.min(st.stufe, rings) / rings) * rMax;
      const am = (a0 + a1) / 2;
      out += `<path class="seg" d="${wedge(rMax, a0, a1)}" fill="transparent" data-act="aspect" data-k="${esc(aspectKey(sheet.key, chart.key, asp))}"/>`;
      if (r) out += `<path d="${wedge(r, a0, a1)}" fill="var(--c)" opacity="${st.stufe > rings ? 0.95 : 0.55}" pointer-events="none"/>`;
      const [lx, ly] = pt(rMax + 22, am);
      const anchor = Math.abs(Math.cos(am)) < 0.3 ? 'middle' : Math.cos(am) > 0 ? 'start' : 'end';
      out += `<text x="${lx}" y="${ly}" text-anchor="${anchor}" dominant-baseline="middle" pointer-events="none">${esc(asp)}</text>`;
      out += `<text class="num" x="${lx}" y="${ly + 16}" text-anchor="${anchor}" dominant-baseline="middle" pointer-events="none">${st.stufe}${st.punkte ? ` · ${st.punkte} P` : ''}</text>`;
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
      <p class="hint">Abschnitt antippen, um Punkte oder Stufe vom DM von Hand einzutragen.</p>
    </section>
    <section class="card">
      <h2>${sheet.listName === 'Zauber' ? 'Zauber' : 'Techniken'} <button class="btn small fill" data-act="newTech">+ Neu</button></h2>
      ${own ? '' : `<p class="hint">Nicht deine Klasse: hier sind nur leichte ${sheet.listName === 'Zauber' ? 'Zauber' : 'Techniken'} erlernbar.</p>`}
      ${list.length ? list.map((t) => {
        const need = techNeed(t);
        const pct = need ? Math.min(100, (t.punkte / need) * 100) : 100;
        const aspects = t.aspects.map((k) => k.split('.').slice(2).join('.'));
        return `<div class="tech">
          <div class="head"><b>${esc(t.name)}</b><span class="tag">${esc(R.difficulties[t.diff] || t.diff)}</span></div>
          <div>${aspects.map((a) => `<span class="tag">${esc(a)}</span>`).join('') || '<span class="hint">belegt keine Abschnitte</span>'}</div>
          <div class="hint">Stufe ${t.stufe} · ${t.punkte}${need ? ` / ${need}` : ''} Punkte bis zur nächsten Stufe${t.note ? ' · ' + esc(t.note) : ''}</div>
          <div class="bar"><i style="width:${pct}%"></i></div>
          ${need && t.punkte >= need ? `<p class="hint">${esc(teachNote(t.stufe) || 'Aufstieg möglich.')}</p>` : ''}
          <div class="row end" style="margin-top:8px">
            <button class="btn small" data-act="editTech" data-id="${t.id}">Bearbeiten</button>
            ${need && t.punkte >= need ? `<button class="btn small" data-act="techUp" data-id="${t.id}">Stufe aufsteigen</button>` : ''}
            <button class="btn small fill" data-act="applyTech" data-id="${t.id}">Angewendet +1</button>
          </div></div>`;
      }).join('') : '<p class="hint">Noch keine Einträge.</p>'}
      <p class="hint">„Angewendet +1“ gibt der ${sheet.listName === 'Zauber' ? 'Zauber' : 'Technik'} und jedem belegten Abschnitt im Kreis einen Punkt.</p>
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
  function booking(d, btn) {
    const box = btn.closest('.card');
    const field = (m) => box.querySelector(`[data-tx="${m}"]`);
    const amt = {};
    COINS.forEach(([m]) => { amt[m] = Math.max(0, num(field(m).value.replace(/\D/g, ''))); });
    if (!COINS.some(([m]) => amt[m])) return alert('Bitte einen Betrag eintragen.');
    const c = ch();
    const after = COINS.map(([m, n]) => [n, num(c.money[m]) + d * amt[m]]);
    const short = after.filter(([, v]) => v < 0);
    if (short.length && !confirm(`Dafür reicht es nicht: ${short.map(([n, v]) => `${n} ${v}`).join(', ')}.\n\nTrotzdem buchen?`)) return;
    const note = field('note').value.trim();
    change((c) => {
      COINS.forEach(([m]) => { c.money[m] = num(c.money[m]) + d * amt[m]; });
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
          <label class="item-qty">×<input type="number" inputmode="numeric" data-item="qty" data-list="${list}" data-i="${i}" value="${num(it.qty, 1)}" aria-label="Anzahl"></label>
        </div>
        <input class="item-note" data-item="note" data-list="${list}" data-i="${i}" value="${esc(it.note)}" placeholder="Notiz">
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
  }

  function pickAttr(i) {
    const c = ch();
    const taken = new Set(c.attrSlots.map((s) => s.skill).filter(Boolean));
    const curSkill = c.attrSlots[i].skill;
    openDialog(`<h3>Attributfähigkeit wählen</h3>
      ${R.attributeGroups.map((g) => `<div class="group-h" style="color:${g.color}">●</div>${g.skills.map(([n, d]) => {
        const lock = lockedReason(c, n);
        const dis = (taken.has(n) && n !== curSkill) || lock;
        return `<button class="choice" data-d-act="pick" data-n="${esc(n)}" style="border-left:5px solid ${g.color}"${dis ? ' disabled' : ''}>${esc(n)}<small>${esc(lock || (taken.has(n) && n !== curSkill ? 'schon gewählt' : d))}</small></button>`;
      }).join('')}`).join('')}
      <div class="row end">${curSkill ? '<button class="btn danger" data-d-act="clear">Platz leeren</button>' : ''}<button class="btn" data-d-act="close">Abbrechen</button></div>`,
    (act, b) => {
      if (act === 'pick') change((c) => { if (c.attrSlots[i].skill !== b.dataset.n) c.attrSlots[i] = { skill: b.dataset.n, stufe: 0, check: false }; });
      if (act === 'clear') change((c) => { c.attrSlots[i] = { skill: '', stufe: 0, check: false }; });
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
      ${sub.length ? sub.map(([n, d]) => `<button class="choice" data-d-act="pick" data-n="${esc(n)}"${taken(n) ? ' disabled' : ''}>${esc(n)}<small>${esc(taken(n) ? 'schon eingetragen' : d)}</small></button>`).join('') : '<p class="hint">Wähle zuerst im Reiter „Bogen“ die aktuelle Unterklasse, dann erscheinen hier ihre Fähigkeiten.</p>'}
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
      const st = aspectState(ch(), k);
      const need = baseNeed(sheetKey, st.stufe);
      return `<h3>${esc(name)}</h3><p class="hint">${esc(sheetDef(sheetKey).title)}</p>
      <div class="stats">
        <div class="stat"><div class="lbl">Stufe (Ringe)</div><div class="val">${st.stufe}</div>
          <div class="stepper"><button class="btn" data-d-act="stufe" data-v="-1">−</button><button class="btn" data-d-act="stufe" data-v="1">+</button></div></div>
        <div class="stat"><div class="lbl">Punkte</div><div class="val">${st.punkte}${need ? `<small> / ${need}</small>` : ''}</div>
          <div class="stepper"><button class="btn" data-d-act="punkte" data-v="-1">−</button><button class="btn" data-d-act="punkte" data-v="1">+</button><button class="btn" data-d-act="punkte" data-v="5">+5</button></div></div>
      </div>
      ${need && st.punkte >= need ? `<p class="hint">${esc(teachNote(st.stufe) || 'Aufstieg möglich.')}</p><button class="btn fill" data-d-act="up">Stufe aufsteigen (−${need} Punkte)</button>` : ''}
      <div class="row end" style="margin-top:12px"><button class="btn" data-d-act="close">Fertig</button></div>`;
    };
    openDialog(draw(), (act, b) => {
      if (act === 'close') return dlg.close();
      const c = ch(), st = aspectState(c, k), v = num(b.dataset.v);
      if (act === 'stufe') st.stufe = Math.max(0, Math.min(15, st.stufe + v));
      if (act === 'punkte') st.punkte = Math.max(0, st.punkte + v);
      if (act === 'up') { const need = baseNeed(sheetKey, st.stufe); if (need && st.punkte >= need) { st.punkte -= need; st.stufe += 1; } }
      save(); render(); dlg.innerHTML = draw();
    });
  }

  function editTech(id) {
    const c = ch(), sheet = sheetDef(S.sheet);
    const list = (c.techniques[sheet.key] ||= []);
    const t = list.find((x) => x.id === id) || { id: '', name: '', diff: 'leicht', stufe: 0, punkte: 0, aspects: [], note: '' };
    const own = sheet.klass === c.klass;
    openDialog(`<h3>${t.id ? 'Bearbeiten' : sheet.listName === 'Zauber' ? 'Neuer Zauber' : 'Neue Technik'}</h3>
      <label class="f">Name<input id="tn" value="${esc(t.name)}"></label>
      <label class="f">Schwierigkeit<select id="td">${Object.entries(R.difficulties).map(([key, v]) => `<option value="${key}"${key === t.diff ? ' selected' : ''}${!own && key !== 'leicht' ? ' disabled' : ''}>${v}</option>`).join('')}</select></label>
      <p class="hint">Welche Abschnitte belegt sie? Beim Anwenden bekommt jeder einen Punkt.</p>
      ${sheet.charts.map((ct) => `${ct.label ? `<div class="group-h">${esc(ct.label)}</div>` : ''}<div class="aspect-pick">${ct.aspects.map((a) => {
        const key = aspectKey(sheet.key, ct.key, a);
        return `<label><input type="checkbox" value="${esc(key)}"${t.aspects.includes(key) ? ' checked' : ''}>${esc(a)}</label>`;
      }).join('')}</div>`).join('')}
      <div class="grid2"><label class="f">Stufe<input type="number" id="ts" value="${t.stufe}"></label><label class="f">Punkte<input type="number" id="tp" value="${t.punkte}"></label></div>
      <label class="f">Notiz${sheet.listName === 'Zauber' ? ' / Aufbau' : ''}<input id="tt" value="${esc(t.note)}"></label>
      <div class="row end">${t.id ? '<button class="btn danger" data-d-act="del">Löschen</button>' : ''}<button class="btn" data-d-act="close">Abbrechen</button><button class="btn fill" data-d-act="ok">Speichern</button></div>`,
    (act) => {
      if (act === 'del') {
        if (!confirm('Wirklich löschen?')) return;
        change((c) => { c.techniques[sheet.key] = c.techniques[sheet.key].filter((x) => x.id !== t.id); });
      }
      if (act === 'ok') {
        const name = $('#tn', dlg).value.trim();
        if (!name) return $('#tn', dlg).focus();
        const upd = { id: t.id || uid(), name, diff: $('#td', dlg).value, stufe: Math.max(0, num($('#ts', dlg).value)), punkte: Math.max(0, num($('#tp', dlg).value)),
          aspects: [...dlg.querySelectorAll('.aspect-pick input:checked')].map((x) => x.value), note: $('#tt', dlg).value.trim() };
        change((c) => { const l = (c.techniques[sheet.key] ||= []); const i = l.findIndex((x) => x.id === upd.id); if (i >= 0) l[i] = upd; else l.push(upd); });
      }
      dlg.close();
    });
  }

  // Neuer Charakter: Name und Klasse werden einmalig festgelegt.
  function newCharDialog() {
    openDialog(`<h3>Neuer Charakter</h3>
      <label class="f">Name<input id="nn" placeholder="Name"></label>
      <p class="hint">Klasse wählen – sie lässt sich danach nicht mehr ändern.</p>
      ${Object.entries(R.classes).map(([key, v]) => `<button class="choice" data-d-act="klass" data-k="${key}" style="border-left:6px solid ${v.color}">${esc(v.name)}<small>Ressource: ${esc(v.resource)}</small></button>`).join('')}
      <div class="row end"><button class="btn" data-d-act="close">Abbrechen</button></div>`,
    (act, b) => {
      if (act === 'klass') {
        const c = newChar($('#nn', dlg).value.trim() || 'Neuer Charakter', b.dataset.k);
        S.chars.push(c); S.current = c.id; S.tab = 'bogen'; save(); render();
      }
      dlg.close();
    });
  }

  function charMenu() {
    openDialog(`<h3>Charaktere</h3><div class="char-list">
      ${S.chars.map((c) => `<button class="choice${c.id === S.current ? ' on' : ''}" data-d-act="sel" data-id="${c.id}">${esc(c.name)}<small>${esc(klassOf(c).name)} · Level ${c.level}</small></button>`).join('')}</div>
      <div class="row end"><button class="btn danger" data-d-act="del">Aktuellen löschen</button><button class="btn fill" data-d-act="new">+ Neuer Charakter</button></div>`,
    (act, b) => {
      if (act === 'sel') { S.current = b.dataset.id; save(); render(); }
      if (act === 'new') return newCharDialog();
      if (act === 'del') {
        if (S.chars.length < 2) return alert('Der letzte Charakter kann nicht gelöscht werden.');
        if (!confirm(`„${ch().name}“ wirklich löschen?`)) return;
        S.chars = S.chars.filter((c) => c.id !== S.current); S.current = S.chars[0].id; save(); render();
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
      case 'level': return change((c) => { c.level = Math.max(0, c.level + d); });
      case 'atk': if (!pointOk(d)) return; return change((c) => { c.atk = Math.max(0, c.atk + d); });
      case 'def': if (!pointOk(d)) return; return change((c) => { c.def = Math.max(0, c.def + d); });
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
      case 'attrStufe': {
        const s = ch().attrSlots[i];
        if (d > 0 && lockedReason(ch(), s.skill)) return alert(lockedReason(ch(), s.skill));
        if (!pointOk(d)) return;
        return change((c) => { c.attrSlots[i].stufe = Math.max(0, c.attrSlots[i].stufe + d); });
      }
      case 'classStufe': return change((c) => { c.classSlots[i].stufe = Math.max(0, Math.min(6, c.classSlots[i].stufe + d)); });
      case 'sheet': S.tab = 'techniken'; S.sheet = b.dataset.k; save(); return render();
      case 'aspect': return editAspect(b.dataset.k);
      case 'newTech': return editTech('');
      case 'editTech': return editTech(b.dataset.id);
      case 'applyTech': return change((c) => {
        const t = (c.techniques[S.sheet] || []).find((x) => x.id === b.dataset.id);
        if (!t) return;
        t.punkte += 1;
        t.aspects.forEach((k) => { aspectState(c, k).punkte += 1; });
      });
      case 'techUp': return change((c) => {
        const t = (c.techniques[S.sheet] || []).find((x) => x.id === b.dataset.id);
        const need = t && techNeed(t);
        if (need && t.punkte >= need) { t.punkte -= need; t.stufe += 1; }
      });
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
      case 'slotExtra': return change((c) => { c.slotExtra = Math.max(0, num(c.slotExtra) + d); });
      case 'tx': return booking(d, b);
      case 'export': return exportFile();
    }
  });

  // Widerspruch, wenn mehr Punkte verteilt würden, als das Level hergibt (DM-Ausnahmen bleiben möglich).
  function pointOk(d) {
    if (d <= 0) return true;
    const c = ch(), free = c.level - spentPoints(c);
    if (free > 0) return true;
    return confirm(`Keine Punkte mehr zu verteilen: Level ${c.level} gibt ${c.level} Punkte, verteilt sind schon ${spentPoints(c)}.\n\nTrotzdem skillen (z. B. weil der DM es erlaubt)?`);
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
  const shared = (st) => JSON.parse(JSON.stringify({ chars: st.chars }));

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
    if (last === 'moneyLog' && Array.isArray(l) && Array.isArray(r)) {
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

  const FIELD = { name: 'Name', sub: 'Unterklasse', alter: 'Alter', rasse: 'Rasse', groesse: 'Größe', level: 'Level', lpCur: 'Lebenspunkte', lpExtra: 'LP Zusatz',
    resCur: 'Ressource', resBase: 'Ressource Start', resExtra: 'Ressource Zusatz', atk: 'ATK', def: 'DEF', saves: 'Rettungswürfe', vorteil: 'Vorteil', nachteil: 'Nachteil',
    money: 'Geld', moneyLog: 'Buchungen', attrSlots: 'Levelpunkte', classSlots: 'Klassenpunkte', aspects: 'Übungskreise', techniques: 'Techniken', items: 'Inventar',
    freeItems: 'Ohne Inventarslot', equip: 'Ausrüstung', notes: 'Notizen', slotExtra: 'Slot-Ausbau', stufe: 'Stufe', punkte: 'Punkte', skill: 'Fähigkeit', qty: 'Anzahl',
    note: 'Notiz', label: 'Slot-Name', item: 'Gegenstand', diff: 'Schwierigkeit', klass: 'Klasse', from: 'Unterklasse' };
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
    if (!S.chars.some((c) => c.id === S.current)) S.current = S.chars[0].id;
    Y.base = shared(S); Y.last = new Date().toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    save(); saveSync(); render(); toast(msg);
  }
  function toast(msg) {
    let t = $('#toast');
    if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('on');
    clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('on'), 3500);
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
      const merged = merge(Y.base, local, remote, [], conflicts);
      if (conflicts.length) { setButton(); return conflictDialog(merged, conflicts, remote); }
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
        const merged = merge({}, local, remote, [], conflicts);
        if (conflicts.length) conflictDialog(merged, conflicts, remote); else complete(merged, remote);
      }
    });
  }
  function conflictDialog(merged, conflicts, remote) {
    const choice = conflicts.map((x) => x.l);
    const draw = () => `<h3>Unterschiede klären</h3>
      <p class="hint">Diese Angaben wurden auf beiden Geräten unterschiedlich geändert. Welche gilt?</p>
      ${conflicts.map((x, i) => `<div class="conflict"><b>${esc(pathText(x.path))}</b>
        <button class="choice${choice[i] === x.l ? ' on' : ''}" data-d-act="pick" data-i="${i}" data-s="l">Dieses Gerät<small>${esc(shown(x.l))}</small></button>
        <button class="choice${choice[i] === x.r ? ' on' : ''}" data-d-act="pick" data-i="${i}" data-s="r">Anderes Gerät<small>${esc(shown(x.r))}</small></button></div>`).join('')}
      <div class="row end"><button class="btn" data-d-act="close">Abbrechen</button><button class="btn fill" data-d-act="ok">Übernehmen</button></div>`;
    openDialog(draw(), (act, b) => {
      if (act === 'pick') { const i = num(b.dataset.i); choice[i] = b.dataset.s === 'l' ? conflicts[i].l : conflicts[i].r; const top = dlg.scrollTop; dlg.innerHTML = draw(); dlg.scrollTop = top; return; }
      dlg.close();
      if (act === 'ok') complete(resolve(merged, choice), remote);
    });
  }
  function tokenDialog(thenSync) {
    openDialog(`<h3>Abgleich einrichten</h3>
      <p class="hint">Einmal pro Gerät nötig. Die Daten werden als geheime Datei („Gist“) in deinem GitHub-Konto abgelegt.</p>
      <ol class="steps">
        <li>Öffne <a href="https://github.com/settings/tokens/new?scopes=gist&description=Charakterbogen" target="_blank" rel="noopener">diesen Link</a> (bei GitHub angemeldet).</li>
        <li>Bei „Expiration“ <b>No expiration</b> wählen. Das Häkchen bei <b>gist</b> ist schon gesetzt.</li>
        <li>Ganz unten <b>Generate token</b> drücken und den Schlüssel (beginnt mit <code>ghp_</code>) kopieren.</li>
        <li>Hier einfügen. Auf dem zweiten Gerät kannst du denselben Schlüssel verwenden.</li>
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
  if (!skip) setTimeout(() => sync(true), 300);
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
