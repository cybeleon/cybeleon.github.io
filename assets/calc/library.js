/* Adapter: registers every calculator of the bundled Clinical Calculator library (MIT) into the page.
   - Groups = the library's own specialty categories (same names and order).
   - Forms are generated from assets/data/clinical-catalog.js (input types probed at build time).
   - Calculations run in Python (Pyodide) via assets/calc/pyrunner.js.
   Load this BEFORE the hand-written group files so the group order is set. */
(function () {
  const cat = window.ClinicalCatalog; if (!cat) return;
  const U = Calc.util;

  cat.categories.forEach((title, i) => Calc.group({ id: title, title, order: (i + 1) * 10 }));

  const UNITS = [['_mm_hg', 'mmHg'], ['_mg_dl', 'mg/dL'], ['_g_dl', 'g/dL'], ['_mmol_l', 'mmol/L'], ['_meq_l', 'mEq/L'], ['_umol_l', 'µmol/L'], ['_mg_l', 'mg/L'], ['_ml_min_1_73m2', 'mL/min/1.73 m²'], ['_mg_g', 'mg/g'], ['_u_l', 'U/L'], ['_10e9_l', '×10⁹/L'], ['_breaths_min', '/min'], ['_bpm', 'beats/min'], ['_percent', '%'], ['_years', 'years'], ['_months', 'months'], ['_weeks', 'weeks'], ['_seconds', 's'], ['_minutes', 'min'], ['_kg', 'kg'], ['_cm', 'cm'], ['_mm', 'mm'], ['_ml', 'mL'], ['_l', 'L'], ['_db', 'dB']];
  const ACR = { bun: 'BUN', sbp: 'SBP', dbp: 'DBP', gcs: 'GCS', bmi: 'BMI', inr: 'INR', ast: 'AST', alt: 'ALT', ldl: 'LDL', hdl: 'HDL', hba1c: 'HbA1c', lvef: 'LVEF', fio2: 'FiO₂', pao2: 'PaO₂', paco2: 'PaCO₂', ph: 'pH', csf: 'CSF', wbc: 'WBC', rbc: 'RBC', ecg: 'ECG', qt: 'QT', qrs: 'QRS', hr: 'HR', rr: 'RR', icu: 'ICU', dvt: 'DVT', cad: 'CAD', copd: 'COPD', ckd: 'CKD', hiv: 'HIV', ct: 'CT', mri: 'MRI', na: 'Na', k: 'K', cl: 'Cl', hco3: 'HCO₃', ef: 'EF', rlq: 'RLQ', ugib: 'UGIB', adl: 'ADL', iq: 'IQ', fast: 'FAST', mg: 'Mg', ca: 'Ca', po4: 'PO₄', nyha: 'NYHA', asa: 'ASA', ecog: 'ECOG', who: 'WHO', mi: 'MI', tia: 'TIA', pci: 'PCI', cabg: 'CABG' };
  const pretty = (s) => s.replace(/_/g, ' ').trim().split(/\s+/).map((w, i) => ACR[w.toLowerCase()] || (i === 0 ? w[0].toUpperCase() + w.slice(1) : w)).join(' ');
  const split = (name) => { for (const [suf, u] of UNITS) if (name.toLowerCase().endsWith(suf) && name.length > suf.length) return [name.slice(0, -suf.length), u]; return [name, '']; };

  const fieldFor = (i) => {
    const [base, unit] = split(i.name);
    const label = pretty(base) + (i.extra ? ' (optional extra)' : '');
    const range = i.min != null && i.max != null ? `${i.min} to ${i.max}` : i.min != null ? `≥ ${i.min}` : i.max != null ? `≤ ${i.max}` : '';
    const hint = [i.desc, range && 'allowed ' + range].filter(Boolean).join(' · ') || undefined;
    switch (i.type) {
      case 'boolean': return { id: i.name, type: 'check', label, value: false };
      case 'choice': return { id: i.name, type: 'select', label, value: '', placeholder: true, options: [['', '— select —']].concat(i.choices.map((c) => [c, pretty(String(c))])) };
      case 'sequence': return { id: i.name, type: 'list', label, unit: '', hint: `Comma-separated numbers${i.len ? ` — exactly ${i.len} values` : ''}. Order follows the original instrument; see the source.`, wide: true, len: i.len };
      case 'number': return { id: i.name, type: 'number', label, unit, min: i.min, max: i.max, hint };
      default: return { id: i.name, type: 'text', label, hint: 'Number, true/false or text (as the instrument expects)' };
    }
  };

  const toBlocks = (item, r) => {
    if (r.status === 'missing_inputs') return 'Missing: ' + r.required_inputs.map((n) => pretty(split(n)[0])).join(', ');
    if (r.status === 'invalid_inputs') return [{ type: 'note', tone: 'warn', label: 'Check the inputs:', text: r.message }];
    const out = [];
    if (r.value != null && typeof r.value !== 'object') out.push({ type: 'stat', label: 'Result', value: typeof r.value === 'number' ? U.fmt(r.value, 3) : String(r.value), unit: r.unit || '', tone: 'info' });
    else if (r.value != null) out.push({ type: 'note', tone: 'info', label: 'Result:', text: JSON.stringify(r.value) });
    if (r.interpretation) out.push({ type: 'note', tone: 'info', label: 'Interpretation:', text: r.interpretation });
    if (!out.length) out.push({ type: 'note', tone: 'mute', text: r.message });
    if (item.partial) out.push({ type: 'note', tone: 'warn', text: 'Intermediate step: this entry needs pre-scored components or upstream results as inputs.' });
    return out;
  };

  // Library entries whose boolean inputs must be sent as 0/1 numbers (the Python side rejects true/false for them)
  const NUM01 = new Set(['CALC-0027', 'CALC-0036', 'CALC-0059', 'CALC-0532', 'CALC-0583', 'CALC-0647', 'CALC-0808']);

  cat.items.forEach((item) => {
    if (!item.ok) { // no usable form yet -> placeholder card (replace it with your own block using the same id)
      Calc.add({ id: item.id.toLowerCase(), group: item.cat, title: item.name, subtitle: 'Under construction', uc: true, keywords: [item.cn, item.id], inputs: [], calculate: () => [{ type: 'note', tone: 'mute', text: 'Under construction.' }] });
      return;
    }
    const fields = item.inputs.map(fieldFor);
    Calc.add({
      id: item.id.toLowerCase(), group: item.cat, title: item.name, subtitle: item.partial ? 'intermediate step' : '',
      keywords: [item.cn, item.id], badge: 'Pustaka', pendingText: 'Memuat mesin hitung Python (hanya sekali, ±10 MB)…',
      inputs: fields, onOpen: () => PyRunner.load().catch(() => {}),
      calculate(v) {
        const payload = {}, missing = [];
        if (item.ok) {
          item.inputs.forEach((i) => {
            const x = v[i.name];
            if (i.type === 'boolean') payload[i.name] = NUM01.has(item.id) ? (x ? 1 : 0) : !!x;
            else if (i.type === 'number') { if (x == null) missing.push(i); else payload[i.name] = x; }
            else if (i.type === 'choice') { if (x === '' || x == null) missing.push(i); else payload[i.name] = /^-?\d+(\.\d+)?$/.test(x) ? +x : x; }
            else if (i.type === 'sequence') { if (!Array.isArray(x) || !x.length || x.some((n) => isNaN(n))) missing.push(i); else payload[i.name] = x; }
            else { const t = String(x == null ? '' : x).trim(); if (!t) missing.push(i); else payload[i.name] = t === 'true' ? true : t === 'false' ? false : isNaN(+t) ? t : +t; }
          });
          if (missing.length) return 'Fill in: ' + missing.map((i) => pretty(split(i.name)[0])).join(', ');
        }
        return PyRunner.run(item.id, payload).then((r) => toBlocks(item, r)).catch((e) => [{ type: 'note', tone: 'bad', text: 'Could not run the Python engine: ' + e.message + '. Check the internet connection (it is downloaded from a CDN on first use).' }]);
      },
      refs: [{ text: item.src + (item.ver ? ' (' + item.ver + ')' : ''), url: /^https?:/.test(item.url) ? item.url : undefined }],
      note: 'Source: Clinical Calculator open-source library (MIT). Not independently clinically reviewed — verify the version, population and units against the original source before use.',
    });
  });
})();
