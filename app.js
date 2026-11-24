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
      aspects: {}, techniques: {}, items: [], notes: '',
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
  let S = load();
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

  function stat(label, value, max, act) {
    return `<div class="stat"><div class="lbl">${label}</div>
      <div class="val">${value}${max !== undefined ? `<small> / ${max}</small>` : ''}</div>
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
        <label class="f">Klasse<select data-bind="klass">${Object.entries(R.classes).map(([key, v]) => `<option value="${key}"${key === c.klass ? ' selected' : ''}>${v.name}</option>`).join('')}</select></label>
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
      ${stat('ATK', c.atk, undefined, 'atk')}
      ${stat('DEF', c.def, undefined, 'def')}
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

    <section class="card">
      <h2>Geld</h2>
      <div class="money">
        ${['g', 's', 'k'].map((m) => `<label>${{ g: 'Gold', s: 'Silber', k: 'Kupfer' }[m]}<input type="number" inputmode="numeric" data-money="${m}" value="${num(c.money[m])}"></label>`).join('')}
      </div>
    </section>

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
      <h2>Klassenpunkte <small>${esc(c.sub ? c.sub.split(' (')[0] : 'keine Unterklasse gewählt')}</small></h2>
      ${c.classSlots.map((s, i) => {
        if (!s.name) return `<div class="slot empty"><span class="dot" style="background:var(--line)"></span><button class="name btn small" style="text-align:left" data-act="pickClass" data-i="${i}">+ Klassenfähigkeit wählen</button></div>`;
        const known = sub.find(([n]) => n === s.name);
        return `<div class="slot"><span class="dot" style="background:var(--c)"></span>
          <div class="name" data-act="pickClass" data-i="${i}"><b>${esc(s.name)}</b><small>${esc(known ? known[1] : s.text)}</small></div>
          <button class="btn small" data-act="classStufe" data-i="${i}" data-d="-1" aria-label="Stufe senken">−</button>
          <button class="btn small" data-act="classStufe" data-i="${i}" data-d="1" aria-label="Stufe erhöhen">+</button>
          <span class="lvl" title="Stufe">${s.stufe}</span></div>`;
      }).join('')}
      <p class="hint">Klassenfähigkeiten haben die Stufen 1–6. Die Unterklasse wählst du im Reiter „Bogen“.</p>
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

  function inventar(c) {
    return `
    <section class="card">
      <h2>Geld</h2>
      <div class="money">${['g', 's', 'k'].map((m) => `<label>${{ g: 'Gold', s: 'Silber', k: 'Kupfer' }[m]}<input type="number" inputmode="numeric" data-money="${m}" value="${num(c.money[m])}"></label>`).join('')}</div>
    </section>
    <section class="card">
      <h2>Inventar <small>${c.items.length} Einträge${attrStufe(c, 'Traglast') ? ` · Traglast +${attrStufe(c, 'Traglast')} Plätze` : ''}</small></h2>
      ${c.items.map((it, i) => `<div class="item">
        <input data-item="name" data-i="${i}" value="${esc(it.name)}" placeholder="Gegenstand">
        <input type="number" inputmode="numeric" data-item="qty" data-i="${i}" value="${num(it.qty, 1)}" aria-label="Anzahl">
        <button class="btn small danger" data-act="delItem" data-i="${i}" aria-label="Entfernen">×</button>
        <input class="note" data-item="note" data-i="${i}" value="${esc(it.note)}" placeholder="Notiz"></div>`).join('')}
      <div class="row end" style="margin-top:10px"><button class="btn fill" data-act="addItem">+ Gegenstand</button></div>
    </section>`;
  }

  function notizen(c) {
    return `
    <section class="card"><h2>Notizen</h2>
      <textarea data-bind="notes" rows="14">${esc(c.notes)}</textarea></section>
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
    dlg.showModal();
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
    openDialog(`<h3>Klassenfähigkeit</h3>
      ${sub.length ? sub.map(([n, d]) => `<button class="choice" data-d-act="pick" data-n="${esc(n)}">${esc(n)}<small>${esc(d)}</small></button>`).join('') : '<p class="hint">Wähle zuerst im Reiter „Bogen“ eine Unterklasse, dann erscheinen hier ihre Fähigkeiten.</p>'}
      <div class="group-h">Eigene Fähigkeit</div>
      <label class="f">Name<input id="cn" value="${esc(sub.find(([n]) => n === slot.name) ? '' : slot.name)}"></label>
      <label class="f">Beschreibung<input id="ct" value="${esc(slot.text)}"></label>
      <div class="row end">${slot.name ? '<button class="btn danger" data-d-act="clear">Platz leeren</button>' : ''}<button class="btn" data-d-act="close">Abbrechen</button><button class="btn fill" data-d-act="own">Übernehmen</button></div>`,
    (act, b) => {
      if (act === 'pick') change((c) => { c.classSlots[i] = { name: b.dataset.n, text: '', stufe: c.classSlots[i].name === b.dataset.n ? c.classSlots[i].stufe : 1, check: c.classSlots[i].check }; });
      if (act === 'own') { const n = $('#cn', dlg).value.trim(); if (n) change((c) => { c.classSlots[i] = { ...c.classSlots[i], name: n, text: $('#ct', dlg).value.trim(), stufe: c.classSlots[i].stufe || 1 }; }); }
      if (act === 'clear') change((c) => { c.classSlots[i] = { name: '', text: '', stufe: 0, check: false }; });
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

  function charMenu() {
    openDialog(`<h3>Charaktere</h3><div class="char-list">
      ${S.chars.map((c) => `<button class="choice${c.id === S.current ? ' on' : ''}" data-d-act="sel" data-id="${c.id}">${esc(c.name)}<small>${esc(klassOf(c).name)} · Level ${c.level}</small></button>`).join('')}</div>
      <div class="row end"><button class="btn danger" data-d-act="del">Aktuellen löschen</button><button class="btn fill" data-d-act="new">+ Neuer Charakter</button></div>`,
    (act, b) => {
      if (act === 'sel') { S.current = b.dataset.id; save(); render(); }
      if (act === 'new') { const c = newChar(); S.chars.push(c); S.current = c.id; S.tab = 'bogen'; save(); render(); }
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
    else if (t.dataset.money) { c.money[t.dataset.money] = num(t.value); save(); }
    else if (t.dataset.item) { const it = c.items[num(t.dataset.i)]; it[t.dataset.item] = t.dataset.item === 'qty' ? num(t.value, 1) : t.value; save(); }
  });
  view.addEventListener('change', (e) => {
    const t = e.target;
    if (t.tagName === 'SELECT' && t.dataset.bind) change((c) => {
      c[t.dataset.bind] = t.value;
      if (t.dataset.bind === 'klass') c.sub = '';
    });
    else if (t.dataset.bindn) render();
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
      case 'atk': return change((c) => { c.atk = Math.max(0, c.atk + d); });
      case 'def': return change((c) => { c.def = Math.max(0, c.def + d); });
      case 'save': return change((c) => { c.saves[i] = !c.saves[i]; });
      case 'pickAttr': return pickAttr(i);
      case 'pickClass': return pickClass(i);
      case 'attrStufe': {
        const s = ch().attrSlots[i];
        if (d > 0 && lockedReason(ch(), s.skill)) return alert(lockedReason(ch(), s.skill));
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
      case 'addItem': return change((c) => { c.items.push({ name: '', qty: 1, note: '' }); });
      case 'delItem': return change((c) => { c.items.splice(i, 1); });
      case 'export': return exportFile();
    }
  });

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

  render();
})();
