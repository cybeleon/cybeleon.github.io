/* ==========================================================================
   Calculator engine — registry, renderer, grouping, search.
   You normally never edit this file. To add things, see assets/calc/_template.js

     Calc.group({ id, title, blurb, order })       -> declare a group (once)
     Calc.add({ id, group, title, subtitle, keywords, inputs, calculate, refs })
     Calc.score({ ...same, items, interpret })     -> shortcut for point-based scores

   Input types : number | select | seg | check | date | heading
   Result blocks (returned from calculate(v)):
     {type:'stat', label, value, unit, sub, tone}     big number (consecutive ones form a row)
     {type:'table', caption, head:[], rows:[[]]}      cells may contain trusted HTML
     {type:'note', text|html, tone}                   paragraph / callout
     {type:'list', items:[]}
     or just a string -> shown as a muted hint ("fill in the required fields")
   Tones: ok | warn | bad | info | mute
   ========================================================================== */
(function () {
  'use strict';
  const Calc = (window.Calc = { groups: [], items: [], util: {} });
  const U = Calc.util;

  /* ---------- small helpers ---------- */
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  U.esc = esc;
  U.range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  U.fmt = (x, dp = 1) => (x == null || !isFinite(x) ? '—' : String(+(+x).toFixed(dp))); // rounded, trailing zeros trimmed
  U.fix = (x, dp = 1) => (x == null || !isFinite(x) ? '—' : (+x).toFixed(dp)); // fixed decimals
  U.clamp = (x, a, b) => Math.min(b, Math.max(a, x));

  /* normal distribution */
  U.pnorm = (z) => {
    const t = 1 / (1 + 0.2316419 * Math.abs(z)), d = 0.3989422804014327 * Math.exp((-z * z) / 2);
    const p = d * t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
    return z > 0 ? 1 - p : p;
  };
  U.qnorm = (p) => { // Acklam's algorithm
    const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239];
    const b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572];
    const c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
    const d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416];
    const pl = 0.02425; let q, r;
    if (p < pl) { q = Math.sqrt(-2 * Math.log(p)); return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
    if (p > 1 - pl) { q = Math.sqrt(-2 * Math.log(1 - p)); return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
    q = p - 0.5; r = q * q;
    return ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  };
  U.pct = (p) => { // p in 0..100 -> text
    if (p == null || !isFinite(p)) return '—';
    if (p >= 99.9) return '>99.9'; if (p < 0.1) return '<0.1';
    return p >= 10 || p < 1 ? (p < 1 ? p.toFixed(1) : p.toFixed(0)) : p.toFixed(1);
  };

  /* dates (all UTC-midnight to avoid DST drift) */
  U.parseDate = (s) => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ''); return m ? Date.UTC(+m[1], +m[2] - 1, +m[3]) : null; };
  U.dateStr = (ms) => new Date(ms).toISOString().slice(0, 10);
  U.today = () => { const d = new Date(); return U.dateStr(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); };
  U.days = (a, b) => Math.round((b - a) / 864e5);
  U.addDays = (ms, n) => ms + n * 864e5;
  U.longDate = (ms) => new Date(ms).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

  /* body-size formulas shared by several calculators */
  U.bmi = (kg, cm) => kg / Math.pow(cm / 100, 2);
  U.bsa = {
    mosteller: (kg, cm) => Math.sqrt((kg * cm) / 3600),
    dubois: (kg, cm) => 0.007184 * Math.pow(kg, 0.425) * Math.pow(cm, 0.725),
    haycock: (kg, cm) => 0.024265 * Math.pow(kg, 0.5378) * Math.pow(cm, 0.3964),
    gehan: (kg, cm) => 0.0235 * Math.pow(kg, 0.51456) * Math.pow(cm, 0.42246),
  };

  /* ---------- registry ---------- */
  Calc.group = (g) => {
    const ex = Calc.groups.find((x) => x.id === g.id);
    if (ex) return Object.assign(ex, g);
    if (g.order == null) g.order = (Calc.groups.length + 1) * 10;
    Calc.groups.push(g); return g;
  };
  Calc.add = (c) => {
    c.inputs = c.inputs || [];
    c.inputs.forEach((f) => { if (!f.type) f.type = f.options ? 'select' : 'number'; }); // sensible default so a missing type can't break a card
    // Override: a block with the same id as an earlier one, or listing ids in  replaces: ['calc-0022'],  takes its place.
    const gone = new Set([c.id].concat(c.replaces || []).map((x) => String(x).toLowerCase()));
    Calc.items = Calc.items.filter((x) => !gone.has(String(x.id).toLowerCase()));
    Calc.items.push(c); return c;
  };
  // Hide broken entries without replacing them:  Calc.hide('calc-0123', 'calc-0456');
  Calc.hide = (...ids) => { const g = new Set(ids.flat().map((x) => String(x).toLowerCase())); Calc.items = Calc.items.filter((x) => !g.has(String(x.id).toLowerCase())); };

  /* Calc.ref: static reference card (tables, text, images) with no inputs. Searchable by title/keywords/captions/table text. */
  Calc.ref = (c) => { c.ref = true; c.inputs = []; c.calculate = () => c.blocks || []; return Calc.add(c); };

  /* Calc.score: point-based score from checkboxes/selects/segments */
  Calc.score = (c) => {
    c.inputs = c.items.map((it) => Object.assign({ type: it.options ? 'select' : 'check', value: it.options ? 0 : false, wide: !!c.wideItems && !!it.options }, it));
    c.calculate = (v) => {
      let total = 0, answered = 0, n = 0;
      c.items.forEach((it) => {
        if (it.type === 'heading') return;
        n++;
        const x = v[it.id];
        if (it.options) { if (x != null && !isNaN(x)) { total += +x; answered++; } }
        else { if (x) total += it.points == null ? 1 : it.points; answered++; }
      });
      const max = c.max != null ? c.max : c.items.reduce((s, it) => s + (it.type === 'heading' ? 0 : it.options ? Math.max(...it.options.map((o) => o[0])) : ((it.points == null ? 1 : it.points) > 0 ? (it.points == null ? 1 : it.points) : 0)), 0);
      const out = [{ type: 'stat', label: c.scoreLabel || 'Total score', value: total, unit: '/ ' + max, tone: 'info' }];
      if (answered < n) { out.push({ type: 'note', tone: 'warn', text: `${n - answered} item(s) not answered yet — score is provisional.` }); }
      const r = c.interpret ? c.interpret(total, v, max) : null;
      if (r) (Array.isArray(r) ? r : [r]).forEach((b) => out.push(b.type ? b : Object.assign({ type: 'note' }, b)));
      return out;
    };
    return Calc.add(c);
  };

  /* ---------- rendering ---------- */
  let uid = 0;
  const fieldHTML = (f, calcId) => {
    const id = `${calcId}__${f.id}`;
    if (f.type === 'heading') return `<h4 class="f-heading" data-f="${f.id}">${esc(f.label)}</h4>`;
    const wide = f.wide || f.type === 'check' ? ' wide' : '';
    const hint = f.hint ? `<small class="f-hint">${esc(f.hint)}</small>` : '';
    let ctl = '';
    if (f.type === 'number') {
      const units = Array.isArray(f.unit) ? `<select class="f-unit" name="${f.id}_unit" aria-label="unit">${f.unit.map((u) => `<option>${esc(u)}</option>`).join('')}</select>` : f.unit ? `<span class="f-unit-txt">${esc(f.unit)}</span>` : '';
      ctl = `<div class="f-num"><input id="${id}" name="${f.id}" type="text" inputmode="decimal" autocomplete="off" placeholder="${esc(f.placeholder || '')}" value="${f.value != null ? f.value : ''}" data-min="${f.min != null ? f.min : ''}" data-max="${f.max != null ? f.max : ''}">${units}</div>`;
    } else if (f.type === 'text' || f.type === 'list') {
      ctl = `<input id="${id}" name="${f.id}" type="text" autocomplete="off" placeholder="${esc(f.placeholder || (f.type === 'list' ? 'e.g. 1, 0, 2, 3' : ''))}" value="${esc(f.value || '')}">`;
    } else if (f.type === 'json') {
      ctl = `<textarea id="${id}" name="${f.id}" rows="9" spellcheck="false" class="f-json">${esc(f.value || '')}</textarea>`;
    } else if (f.type === 'select') {
      let picked = false; // options may share a value (e.g. NIHSS "UN" = 0): select only the first match
      ctl = `<select id="${id}" name="${f.id}">${f.options.map((o) => { const on = !picked && String(o[0]) === String(f.value); if (on) picked = true; return `<option value="${esc(o[0])}"${on ? ' selected' : ''}>${esc(o[1])}</option>`; }).join('')}</select>`;
    } else if (f.type === 'seg') {
      ctl = `<div class="seg" role="radiogroup">${f.options.map((o, i) => `<label><input type="radio" name="${id}" data-name="${f.id}" value="${esc(o[0])}"${f.value != null && String(o[0]) === String(f.value) ? ' checked' : ''}><span>${esc(o[1])}</span></label>`).join('')}</div>`;
    } else if (f.type === 'date') {
      ctl = `<input id="${id}" name="${f.id}" type="date" value="${f.value === 'today' ? U.today() : f.value || ''}">`;
    } else if (f.type === 'check') {
      const pts = f.points != null && f.showPoints !== false ? `<em class="pts">${f.points > 0 ? '+' : ''}${f.points}</em>` : '';
      return `<div class="f f-check wide" data-f="${f.id}"><label class="chk"><input type="checkbox" id="${id}" name="${f.id}"${f.value ? ' checked' : ''}><span class="box" aria-hidden="true"></span><span class="chk-t">${esc(f.label)}${f.hint ? `<small>${esc(f.hint)}</small>` : ''}</span>${pts}</label></div>`;
    }
    const lbl = f.type === 'seg' ? `<span class="f-label">${esc(f.label)}</span>` : `<label class="f-label" for="${id}">${esc(f.label)}</label>`;
    return `<div class="f${wide}" data-f="${f.id}">${lbl}${ctl}${hint}</div>`;
  };

  const readValues = (c, body) => {
    const v = {};
    c.inputs.forEach((f) => {
      if (f.type === 'heading') return;
      let x;
      if (f.type === 'number') {
        const el = body.querySelector(`input[name="${f.id}"]`);
        const raw = el.value.trim().replace(',', '.');
        x = raw === '' || isNaN(+raw) ? null : +raw;
        const u = body.querySelector(`select[name="${f.id}_unit"]`); if (u) v[f.id + '_unit'] = u.value;
        el.classList.toggle('bad', x != null && ((f.min != null && x < f.min) || (f.max != null && x > f.max)));
      } else if (f.type === 'seg') {
        const el = body.querySelector(`input[data-name="${f.id}"]:checked`); x = el ? el.value : null;
        if (x != null && f.options.every((o) => typeof o[0] === 'number')) x = +x;
      } else if (f.type === 'check') x = body.querySelector(`input[name="${f.id}"]`).checked;
      else if (f.type === 'select') { x = body.querySelector(`select[name="${f.id}"]`).value; if (f.placeholder && x === '') x = null; else if (f.options.every((o) => typeof o[0] === 'number')) x = +x; }
      else if (f.type === 'list') { const t = body.querySelector(`input[name="${f.id}"]`).value.trim(); x = t ? t.split(/[\s,;]+/).filter(Boolean).map((n) => +n.replace(',', '.')) : null; if (x && f.len && x.length !== f.len) x = null; }
      else if (f.type === 'json') x = body.querySelector(`textarea[name="${f.id}"]`).value;
      else if (f.type === 'text') x = body.querySelector(`input[name="${f.id}"]`).value;
      else x = body.querySelector(`input[name="${f.id}"]`).value;
      v[f.id] = x;
    });
    return v;
  };

  const blocksHTML = (blocks) => {
    if (typeof blocks === 'string') return `<p class="r-hint">${esc(blocks)}</p>`;
    if (blocks && !Array.isArray(blocks)) blocks = blocks.blocks || [];
    let html = '', stats = [];
    const flush = () => { if (stats.length) { html += `<div class="r-stats">${stats.join('')}</div>`; stats = []; } };
    blocks.forEach((b) => {
      if (!b) return;
      if (b.type === 'stat') {
        stats.push(`<div class="r-stat tone-${b.tone || 'info'}"><span class="r-label">${esc(b.label)}</span><span class="r-value">${b.html ? b.value : esc(b.value)}${b.unit ? `<small>${esc(b.unit)}</small>` : ''}</span>${b.sub ? `<span class="r-sub">${esc(b.sub)}</span>` : ''}</div>`);
        return;
      }
      flush();
      if (b.type === 'table') {
        html += `<div class="r-table-wrap"><table class="r-table">${b.caption ? `<caption>${esc(b.caption)}</caption>` : ''}${b.head ? `<thead><tr>${b.head.map((h) => `<th>${h}</th>`).join('')}</tr></thead>` : ''}<tbody>${b.rows.map((r) => `<tr>${r.map((cell, i) => `<${i === 0 && b.rowHead !== false ? 'th scope="row"' : 'td'}>${cell == null ? '—' : cell}</${i === 0 && b.rowHead !== false ? 'th' : 'td'}>`).join('')}</tr>`).join('')}</tbody></table></div>`;
      } else if (b.type === 'image') {
        html += `<figure class="r-fig"><img src="${esc(b.src)}" alt="${esc(b.alt || b.caption || '')}" loading="lazy" data-src="${esc(b.src)}">${b.caption ? `<figcaption>${esc(b.caption)}${b.credit ? ` <span class="cr">${esc(b.credit)}</span>` : ''}</figcaption>` : ''}</figure>`;
      } else if (b.type === 'list') {
        html += `<ul class="r-list">${b.items.map((i) => `<li>${b.html ? i : esc(i)}</li>`).join('')}</ul>`;
      } else {
        const head = b.label ? `<strong>${esc(b.label)}</strong> ` : '';
        html += `<p class="r-note tone-${b.tone || 'mute'}">${head}${b.html ? b.html : esc(b.text || '')}</p>`;
      }
    });
    flush();
    return html;
  };

  const refsHTML = (c) => {
    if (!c.refs || !c.refs.length) return '';
    return `<div class="refs"><h5>References</h5><ol>${c.refs.map((r) => `<li>${esc(r.text || r)}${r.doi ? ` <a href="https://doi.org/${esc(r.doi)}" target="_blank" rel="noopener">doi:${esc(r.doi)}</a>` : ''}${r.url ? ` <a href="${esc(r.url)}" target="_blank" rel="noopener">link</a>` : ''}</li>`).join('')}</ol></div>`;
  };

  const buildBody = (c, el) => {
    const body = el.querySelector('.calc-body');
    const cid = 'c' + ++uid;
    if (c.ref) {
      body.innerHTML = `${c.intro ? `<p class="c-intro">${esc(c.intro)}</p>` : ''}<div class="results ref">${blocksHTML(c.blocks || [])}</div>${c.note ? `<p class="c-note">${esc(c.note)}</p>` : ''}${refsHTML(c)}`;
      return;
    }
    body.innerHTML = `${c.intro ? `<p class="c-intro">${esc(c.intro)}</p>` : ''}
      <form class="fields" onsubmit="return false" novalidate>${c.inputs.map((f) => fieldHTML(f, cid)).join('')}</form>
      <div class="c-actions"><button type="button" data-act="reset">Atur ulang</button><button type="button" data-act="copy">Salin hasil</button></div>
      <div class="results" aria-live="polite"></div>${c.note ? `<p class="c-note">${esc(c.note)}</p>` : ''}${refsHTML(c)}`;
    const resEl = body.querySelector('.results');
    const update = () => {
      const v = readValues(c, body);
      c.inputs.forEach((f) => { // conditional visibility
        if (!f.showIf) return;
        const n = body.querySelector(`[data-f="${f.id}"]`); if (n) n.hidden = !f.showIf(v);
      });
      let out; const mine = (c._seq = (c._seq || 0) + 1);
      try { out = c.calculate(v); } catch (e) { console.error(c.id, e); out = 'Could not calculate — please check the values entered.'; }
      if (out && typeof out.then === 'function') { // async calculators (e.g. Python engine)
        resEl.innerHTML = `<p class="r-hint">${esc(c.pendingText || 'Menghitung…')}</p>`;
        out.then((o) => { if (mine === c._seq) resEl.innerHTML = blocksHTML(o); }).catch((e) => { if (mine === c._seq) resEl.innerHTML = blocksHTML('Could not calculate: ' + e.message); });
      } else resEl.innerHTML = blocksHTML(out);
    };
    body.addEventListener('input', update); body.addEventListener('change', update);
    body.addEventListener('click', (e) => {
      const act = e.target.closest('[data-act]'); if (!act) return;
      if (act.dataset.act === 'reset') { body.querySelector('form').outerHTML = `<form class="fields" onsubmit="return false" novalidate>${c.inputs.map((f) => fieldHTML(f, cid)).join('')}</form>`; update(); }
      if (act.dataset.act === 'copy') {
        const text = `${c.title}\n` + resEl.innerText.replace(/\n{2,}/g, '\n');
        (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(() => { act.textContent = 'Tersalin ✓'; setTimeout(() => (act.textContent = 'Salin hasil'), 1400); }).catch(() => { act.textContent = 'Gagal menyalin'; });
      }
    });
    update();
    if (c.onOpen) c.onOpen();
  };

  /* ---------- images: missing-file hint + click to zoom ---------- */
  document.addEventListener('error', (e) => {
    const im = e.target; if (!im || im.tagName !== 'IMG' || !im.closest || !im.closest('.r-fig')) return;
    const f = im.closest('.r-fig'); f.classList.add('missing');
    im.replaceWith(Object.assign(document.createElement('div'), { className: 'r-missing', textContent: 'Gambar belum ditambahkan — taruh file di ' + (im.dataset.src || '') }));
  }, true);
  document.addEventListener('click', (e) => {
    const im = e.target.closest && e.target.closest('.r-fig img'); if (!im) return;
    const ov = document.createElement('div'); ov.className = 'lightbox'; ov.innerHTML = `<img src="${im.src}" alt="${im.alt}"><button type="button" aria-label="Tutup">×</button>`;
    const close = () => { ov.remove(); document.removeEventListener('keydown', key); }; const key = (k) => { if (k.key === 'Escape') close(); };
    ov.addEventListener('click', close); document.addEventListener('keydown', key); document.body.appendChild(ov);
  });

  /* ---------- page ---------- */
  const refText = (c) => (c.blocks || []).map((b) => [b.alt, b.caption, b.label, b.text, (b.head || []).join(' '), (b.rows || []).map((r) => r.join(' ')).join(' '), (b.items || []).join(' ')].join(' ')).join(' ').replace(/<[^>]+>/g, ' ');
  const haystack = (c) => norm([refText(c), c.title, c.subtitle, c.id, (c.keywords || []).join(' '), (Calc.groups.find((g) => g.id === c.group) || {}).title, ((Calc.groups.find((g) => g.id === c.group) || {}).keywords || []).join(' ')].join(' '));

  Calc.render = () => {
    const root = $('#calc-root'); if (!root) return;
    const used = Calc.items.map((c) => c.group);
    used.forEach((id) => { if (!Calc.groups.find((g) => g.id === id)) Calc.group({ id, title: id }); });
    const groups = Calc.groups.filter((g) => used.includes(g.id)).sort((a, b) => a.order - b.order);
    root.innerHTML = groups.map((g, gi) => {
      const items = Calc.items.filter((c) => c.group === g.id).sort((a, b) => ((a.uc ? 2 : 0) + (a.badge ? 1 : 0)) - ((b.uc ? 2 : 0) + (b.badge ? 1 : 0)));
      return `<details class="cgroup" id="g-${g.id}" data-g="${g.id}"><summary><span class="g-num">${String(gi + 1).padStart(2, '0')}</span><span class="g-title">${esc(g.title)}</span><span class="g-count">${items.length}</span><span class="g-chev" aria-hidden="true"></span></summary>
        ${g.blurb ? `<p class="g-blurb">${esc(g.blurb)}</p>` : ''}
        <div class="clist">${items.map((c) => `<details class="calc" id="${c.id}" data-id="${c.id}"><summary><span class="c-title">${esc(c.title)}</span>${c.subtitle ? `<span class="c-sub">${esc(c.subtitle)}</span>` : ''}${c.badge ? `<span class="c-badge">${esc(c.badge)}</span>` : ''}</summary><div class="calc-body"></div></details>`).join('')}</div></details>`;
    }).join('') + `<p class="empty" hidden>Tidak ada kalkulator yang cocok. Coba kata kunci lain (mis. “skor”, “anak”, “GFR”).</p>`;

    // lazy-build bodies on first open
    root.addEventListener('toggle', (e) => {
      const d = e.target; if (!d.classList || !d.classList.contains('calc') || !d.open || d.dataset.built) return;
      d.dataset.built = 1; buildBody(Calc.items.find((c) => c.id === d.dataset.id), d);
    }, true);

    // search
    const q = $('#calc-q'), status = $('#calc-status'), empty = $('.empty', root);
    const index = Calc.items.map((c) => [c, haystack(c)]);
    const run = () => {
      const terms = norm(q.value).split(/\s+/).filter(Boolean);
      let hits = 0;
      root.querySelectorAll('.calc').forEach((d) => {
        const h = index.find((x) => x[0].id === d.dataset.id)[1];
        const ok = terms.every((t) => h.includes(t)); d.hidden = !ok; if (ok) hits++;
      });
      if (terms.length) root.querySelectorAll('.calc:not([hidden])').forEach((d) => { if (hits <= 2) d.open = true; });
      root.querySelectorAll('.cgroup').forEach((g) => {
        const n = g.querySelectorAll('.calc:not([hidden])').length; g.hidden = n === 0;
        const cnt = $('.g-count', g); cnt.textContent = terms.length ? `${n}` : g.querySelectorAll('.calc').length;
        if (terms.length) g.open = n > 0;
      });
      if (!terms.length && !location.hash) root.querySelectorAll('.cgroup').forEach((g) => (g.open = false));
      empty.hidden = hits > 0;
      status.textContent = terms.length ? `${hits} kalkulator ditemukan` : `${Calc.items.length} kalkulator · ${groups.length} kelompok`;
    };
    q.addEventListener('input', run);
    document.addEventListener('keydown', (e) => { if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'SELECT') { e.preventDefault(); q.focus(); } if (e.key === 'Escape' && document.activeElement === q) { q.value = ''; run(); q.blur(); } });
    $('#calc-expand') && $('#calc-expand').addEventListener('click', (e) => {
      const open = e.currentTarget.dataset.open !== '1'; e.currentTarget.dataset.open = open ? '1' : '0';
      e.currentTarget.textContent = open ? 'Tutup semua kelompok' : 'Buka semua kelompok';
      root.querySelectorAll('.cgroup:not([hidden])').forEach((g) => (g.open = open));
    });

    // deep links: calculators.html#nihss  or  #g-peds  or  ?q=wells
    const go = () => {
      const id = decodeURIComponent(location.hash.slice(1)); if (!id) return;
      const t = document.getElementById(id); if (!t) return;
      const g = t.closest('.cgroup'); if (g) g.open = true;
      if (t.classList.contains('calc')) t.open = true;
      setTimeout(() => t.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    };
    const qp = new URLSearchParams(location.search).get('q'); if (qp) q.value = qp;
    run(); go(); window.addEventListener('hashchange', go);
  };

  document.addEventListener('DOMContentLoaded', Calc.render);
})();
