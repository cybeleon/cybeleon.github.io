/* Pediatrics: growth percentiles (WHO + CDC), target height, BSA, blood pressure (AAP 2017). */
(function () {
  const U = Calc.util;

  /* ====================== growth engine (LMS method) ====================== */
  const G = {
    // LMS (and CDC-BMI sigma) at age in months; linear interpolation. Duplicate age nodes (24, 60 mo) mark table switches.
    lms(tbl, m) {
      if (!tbl || m < tbl[0][0] || m > tbl[tbl.length - 1][0]) return null;
      let lo = 0, hi = tbl.length - 1;
      while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (tbl[mid][0] <= m) lo = mid; else hi = mid - 1; }
      const a = tbl[lo], b = tbl[Math.min(lo + 1, tbl.length - 1)];
      if (b[0] === a[0]) return { L: a[1], M: a[2], S: a[3], sigma: a[4] };
      const t = (m - a[0]) / (b[0] - a[0]), f = (i) => a[i] + t * (b[i] - a[i]);
      return { L: f(1), M: f(2), S: f(3), sigma: a[4] != null ? f(4) : null };
    },
    z(x, p) { return p.L === 0 ? Math.log(x / p.M) / p.S : (Math.pow(x / p.M, p.L) - 1) / (p.L * p.S); },
    val(z, p) { return p.L === 0 ? p.M * Math.exp(p.S * z) : p.M * Math.pow(1 + p.L * p.S * z, 1 / p.L); }, // value at a given z
    // WHO "restricted" z-score for weight-based indicators when |z| > 3
    whoZ(x, p, restrict) {
      let z = G.z(x, p);
      if (restrict && Math.abs(z) > 3) {
        if (z > 3) { const s3 = G.val(3, p), s2 = G.val(2, p); z = 3 + (x - s3) / (s3 - s2); }
        else { const s3 = G.val(-3, p), s2 = G.val(-2, p); z = -3 + (x - s3) / (s2 - s3); }
      }
      return z;
    },
    // Age in months from the form values (DOB mode uses days / 30.4375, as WHO does)
    age(v) {
      if (v.mode === 'age') { if (v.ageY == null && v.ageM == null) return null; return (v.ageY || 0) * 12 + (v.ageM || 0); }
      const d = U.parseDate(v.dob), t = U.parseDate(v.visit); if (d == null || t == null) return null;
      return U.days(d, t) / 30.4375;
    },
    ageText(m) { const y = Math.floor(m / 12 + 1e-9), mo = Math.floor(m - y * 12 + 1e-9); return (y ? y + ' y ' : '') + mo + ' mo'; },
    zbar(z) { return `<span class="zbar" title="z = ${U.fix(z, 2)}"><i style="left:${U.clamp(((z + 3) / 6) * 100, 1, 99)}%"></i></span>`; },
    pctOf(sys, key, sex, x, age) { // -> {z, pct, p, ext?} | null when outside the table's age range
      const tbl = (window.GrowthRef || {})[sys] && GrowthRef[sys][key][sex];
      const p = G.lms(tbl, age); if (!p) return null;
      if (sys === 'who') { const z = G.whoZ(x, p, key !== 'hfa'); return { z, pct: U.pnorm(z) * 100, p }; }
      const z = G.z(x, p); let r = { z, pct: U.pnorm(z) * 100, p };
      if (key === 'bfa') { // CDC extended BMI-for-age (Wei 2020) above the 95th percentile
        const p95 = G.val(1.6448536, p); r.p95 = p95; r.ofP95 = (x / p95) * 100;
        if (x >= p95 && p.sigma) { r.pct = 90 + 10 * U.pnorm((x - p95) / p.sigma); r.z = U.qnorm(r.pct / 100); r.ext = true; }
      }
      return r;
    },
  };
  Calc.growth = G; // exposed for other calculators

  const T = (text, tone) => `<span class="tag t-${tone}">${text}</span>`;
  const whoClass = (key, z, age) => {
    if (key === 'wfa') return z < -3 ? T('Severely underweight', 'bad') : z < -2 ? T('Underweight', 'warn') : z > 2 ? T('High weight-for-age', 'warn') : T('Within normal range', 'ok');
    if (key === 'hfa') return z < -3 ? T('Severely stunted', 'bad') : z < -2 ? T('Stunted', 'warn') : z > 3 ? T('Very tall', 'warn') : z > 2 ? T('Tall', 'mute') : T('Within normal range', 'ok');
    const u5 = age < 60;
    if (z < -3) return T(u5 ? 'Severe wasting' : 'Severe thinness', 'bad');
    if (z < -2) return T(u5 ? 'Wasting' : 'Thinness', 'warn');
    if (z > 3 && u5) return T('Obese', 'bad');
    if (z > 2) return T(u5 ? 'Overweight' : 'Obesity', 'bad');
    if (z > 1) return T(u5 ? 'Possible risk of overweight' : 'Overweight', 'warn');
    return T('Within normal range', 'ok');
  };
  const cdcClass = (key, r, x) => {
    const p = r.pct;
    if (key === 'wfa') return p < 5 ? T('<5th percentile', 'warn') : p >= 95 ? T('≥95th percentile', 'warn') : T('Within 5th–95th', 'ok');
    if (key === 'hfa') return p < 3 ? T('<3rd percentile (short)', 'warn') : p > 97 ? T('>97th percentile (tall)', 'mute') : T('Within 3rd–97th', 'ok');
    if (p < 5) return T('Underweight', 'warn');
    if (p < 85) return T('Healthy weight', 'ok');
    if (p < 95) return T('Overweight', 'warn');
    const c = r.ofP95 >= 140 || x >= 40 ? 3 : r.ofP95 >= 120 || x >= 35 ? 2 : 1;
    return T('Obesity class ' + c + (c > 1 ? ' (severe)' : ''), 'bad');
  };

  /* ---------- 1. Growth percentiles ---------- */
  const ageFields = [
    { id: 'mode', type: 'seg', label: 'Age entered as', options: [['dob', 'Date of birth'], ['age', 'Age (years/months)']], value: 'dob', wide: true },
    { id: 'dob', type: 'date', label: 'Date of birth', showIf: (v) => v.mode !== 'age' },
    { id: 'visit', type: 'date', label: 'Date of measurement', value: 'today', showIf: (v) => v.mode !== 'age' },
    { id: 'ageY', type: 'number', label: 'Age — years', unit: 'y', min: 0, max: 20, showIf: (v) => v.mode === 'age' },
    { id: 'ageM', type: 'number', label: 'Age — months', unit: 'mo', min: 0, max: 11.99, showIf: (v) => v.mode === 'age' },
  ];
  Calc.add({
    id: 'growth', group: 'Pediatrics', title: 'Growth percentiles — weight, height, BMI', subtitle: 'WHO 2006/2007 and CDC 2000 · z-score & percentile',
    keywords: ['growth chart', 'WHO', 'CDC', 'z-score', 'percentile', 'BMI', 'weight for age', 'height for age', 'length', 'stunting', 'wasting', 'obesity', 'anthropometry', 'gizi', 'pertumbuhan', 'berat badan', 'tinggi badan', 'persentil', 'kurva', 'antropometri'],
    intro: 'Enter either or both measurements. The chart is chosen by age: WHO growth standards under 5 years, CDC charts from 5 years. Use recumbent length below 2 years and standing height from 2 years.',
    inputs: [{ id: 'sex', type: 'seg', label: 'Sex', options: [['m', 'Male'], ['f', 'Female']], value: null }].concat(ageFields, [
      { id: 'wt', type: 'number', label: 'Weight', unit: 'kg', min: 0.3, max: 250, placeholder: 'e.g. 12.4' },
      { id: 'ht', type: 'number', label: 'Length / height', unit: 'cm', min: 30, max: 230, placeholder: 'e.g. 88.5' },
      { id: 'both', type: 'check', label: 'Also show the other chart (compare WHO and CDC)' },
    ]),
    calculate(v) {
      if (!window.GrowthRef) return 'Reference data failed to load (assets/data/growth-ref.js).';
      if (!v.sex) return 'Select the sex of the child.';
      const age = G.age(v);
      if (age == null) return v.mode === 'age' ? 'Enter the age.' : 'Enter the date of birth and date of measurement.';
      if (age < 0) return 'The date of measurement is before the date of birth.';
      if (age > 240) return 'Growth charts cover birth to 20 years (WHO to 19 years).';
      if (v.wt == null && v.ht == null) return 'Enter weight and/or length/height.';
      const bmi = v.wt != null && v.ht != null ? U.bmi(v.wt, v.ht) : null;
      const rows = [{ k: 'wfa', name: 'Weight-for-age', x: v.wt, fmt: (x) => U.fix(x, 2) + ' kg' }, { k: 'hfa', name: age < 24 ? 'Length-for-age' : 'Height-for-age', x: v.ht, fmt: (x) => U.fix(x, 1) + ' cm' }, { k: 'bfa', name: 'BMI-for-age', x: bmi, fmt: (x) => U.fix(x, 1) + ' kg/m²' }];
      const out = [{ type: 'stat', label: 'Age', value: G.ageText(age), sub: U.fix(age, 1) + ' months', tone: 'info' }];
      if (bmi != null) out.push({ type: 'stat', label: 'BMI', value: U.fix(bmi, 1), unit: 'kg/m²', tone: 'info' });
      const warn = [];
      const table = (sys, caption, cls) => {
        const body = [];
        rows.forEach((r) => {
          if (r.x == null) return;
          const res = G.pctOf(sys, r.k, v.sex, r.x, age);
          if (!res) { body.push([r.name, r.fmt(r.x), '—', '—', '', `<span class="t-mute">Outside ${sys.toUpperCase()} range</span>`]); return; }
          const lim = { wfa: [-6, 5], hfa: [-6, 6], bfa: [-5, 5] }[r.k];
          if (sys === 'who' && (res.z < lim[0] || res.z > lim[1])) warn.push(`WHO ${r.name}: z = ${U.fix(res.z, 1)} is biologically implausible by WHO flag limits — check the entry.`);
          body.push([r.name + (res.ext ? ' <small class="t-mute">(extended)</small>' : ''), r.fmt(r.x), (res.z >= 0 ? '+' : '') + U.fix(res.z, 2), U.pct(res.pct), G.zbar(res.z), cls(r.k, res, r.x)]);
        });
        return { type: 'table', caption, head: ['Indicator', 'Value', 'Z', 'Percentile', '−3 … +3', 'Interpretation'], rows: body };
      };
      out.push({ type: 'stat', label: 'Chart used', value: age < 60 ? 'WHO' : 'CDC', sub: age < 60 ? 'WHO standards, <5 years' : 'CDC 2000, ≥5 years', tone: 'info' });
      if (age < 60 || v.both) out.push(table('who', age < 60 ? 'WHO Child Growth Standards (2006)' : 'WHO Growth Reference (2007, 5–19 y) — comparison', (k, r) => whoClass(k, r.z, age)));
      if (age >= 60 || v.both) out.push(table('cdc', age < 24 ? 'CDC 2000 · infant charts (birth–24 mo) — comparison' : age < 60 ? 'CDC 2000 · 2–20 y charts — comparison' : 'CDC 2000 · 2–20 y charts', (k, r, x) => cdcClass(k, r, x)));
      const cdcBmi = bmi != null && (age >= 60 || v.both) && G.pctOf('cdc', 'bfa', v.sex, bmi, age);
      if (cdcBmi && cdcBmi.pct >= 95) out.push({ type: 'note', tone: 'bad', label: 'CDC BMI:', text: `${U.fix(cdcBmi.ofP95, 0)}% of the 95th percentile (P95 = ${U.fix(cdcBmi.p95, 1)} kg/m²). Obesity classes: class 1 ≥95th to <120% of P95; class 2 120–<140% of P95 or BMI ≥35; class 3 ≥140% of P95 or BMI ≥40.` });
      warn.forEach((w) => out.push({ type: 'note', tone: 'warn', text: w }));
      out.push({ type: 'note', tone: 'mute', text: 'WHO standards are used under 5 years and CDC charts from 5 years. WHO z-scores beyond ±3 use the WHO “restricted” adjustment for weight and BMI; CDC BMI above the 95th percentile uses the extended method.' });
      return out;
    },
    refs: [
      { text: 'WHO Multicentre Growth Reference Study Group. WHO Child Growth Standards: Methods and development. Geneva: WHO; 2006.' },
      { text: 'de Onis M, et al. Development of a WHO growth reference for school-aged children and adolescents. Bull World Health Organ 2007;85:660–7.', doi: '10.2471/BLT.07.043497' },
      { text: 'Kuczmarski RJ, et al. 2000 CDC Growth Charts for the United States: methods and development. Vital Health Stat 11 2002;(246).' },
      { text: 'Wei R, et al. A method for calculating BMI z-scores and percentiles above the 95th percentile of the CDC growth charts. Ann Hum Biol 2020;47:514–21.', doi: '10.1080/03014460.2020.1808065' },
      { text: 'Hampl SE, et al. Clinical practice guideline for the evaluation and treatment of children and adolescents with obesity. Pediatrics 2023;151:e2022060640.', doi: '10.1542/peds.2022-060640' },
      { text: 'Cole TJ, Green PJ. Smoothing reference centile curves: the LMS method. Stat Med 1992;11:1305–19.', doi: '10.1002/sim.4780111005' },
    ],
    note: 'Percentiles are computed from the official LMS tables (linear interpolation between monthly nodes), not read from printed charts.',
  });

  /* ---------- 2. Target (mid-parental) height ---------- */
  Calc.add({
    id: 'target-height', group: 'Pediatrics', title: 'Target height (mid-parental)', subtitle: 'Tanner formula from father’s and mother’s height',
    keywords: ['mid-parental height', 'genetic height', 'adult height', 'short stature', 'tinggi target', 'tinggi orang tua', 'tinggi akhir'],
    inputs: [
      { id: 'sex', type: 'seg', label: 'Child’s sex', options: [['m', 'Male'], ['f', 'Female']], value: null },
      { id: 'fa', type: 'number', label: 'Father’s height', unit: 'cm', min: 120, max: 230, placeholder: 'e.g. 170' },
      { id: 'mo', type: 'number', label: 'Mother’s height', unit: 'cm', min: 120, max: 230, placeholder: 'e.g. 158' },
    ],
    calculate(v) {
      if (!v.sex || v.fa == null || v.mo == null) return 'Select sex and enter both parents’ heights.';
      const th = (v.fa + v.mo + (v.sex === 'm' ? 13 : -13)) / 2, lo = th - 8.5, hi = th + 8.5;
      const out = [{ type: 'stat', label: 'Target height', value: U.fix(th, 1), unit: 'cm', tone: 'info' }, { type: 'stat', label: 'Expected range (±8.5 cm)', value: `${U.fix(lo, 0)}–${U.fix(hi, 0)}`, unit: 'cm', sub: 'approx. 3rd–97th percentile of children with these parents' }];
      const r = window.GrowthRef && G.pctOf('cdc', 'hfa', v.sex, th, 240);
      if (r) out.push({ type: 'note', tone: 'info', text: `A target of ${U.fix(th, 1)} cm sits at about the ${U.pct(r.pct)}th percentile of CDC adult (20-year) stature for ${v.sex === 'm' ? 'males' : 'females'} (z = ${U.fix(r.z, 2)}).` });
      out.push({ type: 'note', tone: 'mute', text: 'Male: (father + mother + 13) ÷ 2. Female: (father + mother − 13) ÷ 2. Measure parents rather than relying on reported heights; a child’s current height percentile far from the target range warrants evaluation.' });
      return out;
    },
    refs: [{ text: 'Tanner JM, Goldstein H, Whitehouse RH. Standards for children’s height at ages 2–9 years allowing for heights of parents. Arch Dis Child 1970;45:755–62.', doi: '10.1136/adc.45.244.755' }],
  });

  /* ---------- 3. BSA (paediatric) ---------- */
  Calc.add({
    id: 'bsa-peds', group: 'Pediatrics', title: 'Body surface area (BSA)', subtitle: 'Mosteller · Haycock · DuBois · Gehan–George, with dose per m²',
    keywords: ['BSA', 'body surface area', 'luas permukaan tubuh', 'dose', 'chemotherapy', 'mosteller', 'haycock', 'dubois', 'dosis', 'kemoterapi'],
    inputs: [
      { id: 'wt', type: 'number', label: 'Weight', unit: 'kg', min: 0.3, max: 250, placeholder: 'e.g. 18' },
      { id: 'ht', type: 'number', label: 'Height / length', unit: 'cm', min: 30, max: 230, placeholder: 'e.g. 108' },
      { id: 'dose', type: 'number', label: 'Optional: dose per m²', unit: 'mg/m²', min: 0, hint: 'Gives total dose = BSA × dose' },
    ],
    calculate(v) {
      if (v.wt == null || v.ht == null) return 'Enter weight and height.';
      const m = U.bsa.mosteller(v.wt, v.ht), out = [
        { type: 'stat', label: 'BSA — Mosteller', value: U.fix(m, 2), unit: 'm²', tone: 'info' },
        { type: 'stat', label: 'BSA — Haycock', value: U.fix(U.bsa.haycock(v.wt, v.ht), 2), unit: 'm²', sub: 'validated across newborn–adult' },
        { type: 'stat', label: 'DuBois', value: U.fix(U.bsa.dubois(v.wt, v.ht), 2), unit: 'm²' },
        { type: 'stat', label: 'Gehan–George', value: U.fix(U.bsa.gehan(v.wt, v.ht), 2), unit: 'm²' },
      ];
      if (v.dose != null) out.push({ type: 'note', tone: 'info', label: 'Dose:', text: `${U.fix(v.dose, 1)} mg/m² × ${U.fix(m, 2)} m² (Mosteller) = ${U.fix(v.dose * m, 1)} mg.` });
      return out;
    },
    note: 'Mosteller is the most widely used; Haycock was derived in children and is common in paediatric oncology and nephrology. Follow the BSA formula specified by your protocol.',
    refs: [
      { text: 'Mosteller RD. Simplified calculation of body-surface area. N Engl J Med 1987;317:1098.', doi: '10.1056/NEJM198710223171717' },
      { text: 'Haycock GB, Schwartz GJ, Wisotsky DH. Geometric method for measuring body surface area. J Pediatr 1978;93:62–6.', doi: '10.1016/S0022-3476(78)80601-5' },
      { text: 'DuBois D, DuBois EF. A formula to estimate the approximate surface area if height and weight be known. Arch Intern Med 1916;17:863–71.' },
      { text: 'Gehan EA, George SL. Estimation of human body surface area from height and weight. Cancer Chemother Rep 1970;54:225–35.' },
    ],
  });

  /* ---------- 4. Blood pressure (AAP 2017) ---------- */
  const BPCAT = ['Normal BP', 'Elevated BP', 'Stage 1 hypertension', 'Stage 2 hypertension'];
  const BPTONE = ['ok', 'warn', 'bad', 'bad'];
  // Estimated percentile from the tabulated P50 / P90 / P95 (piecewise-linear in z; an estimate only)
  const bpEst = (x, p50, p90, p95) => {
    const s1 = (p90 - p50) / 1.2815516, s2 = Math.max((p95 - p90) / (1.6448536 - 1.2815516), 0.1);
    const z = x <= p90 ? (x - p50) / s1 : x <= p95 ? 1.2815516 + (x - p90) / s2 : 1.6448536 + (x - p95) / s2;
    return U.pnorm(z) * 100;
  };
  const bpCat = (x, t, kind, young) => { // t = [P50, P90, P95]
    if (young) { const lim = kind === 'S' ? [120, 130, 140] : [80, 80, 90];
      return x >= Math.min(t[2] + 12, lim[2]) ? 3 : x >= Math.min(t[2], lim[1]) ? 2 : x >= Math.min(t[1], lim[0]) ? 1 : 0; }
    const lim = kind === 'S' ? [120, 130, 140] : [Infinity, 80, 90];
    return x >= lim[2] ? 3 : x >= lim[1] ? 2 : x >= lim[0] ? 1 : 0;
  };
  Calc.add({
    id: 'bp-peds', group: 'Pediatrics', title: 'Blood pressure percentiles & classification', subtitle: 'AAP 2017 guideline · ages 1–17 years',
    keywords: ['blood pressure', 'hypertension', 'tekanan darah', 'hipertensi', 'AAP 2017', 'percentile', 'sistolik', 'diastolik', 'children'],
    intro: 'Percentiles use the AAP 2017 tables (sex, age and height percentile). Height percentile is taken from the CDC 2000 stature/length-for-age charts, as in the guideline.',
    inputs: [
      { id: 'sex', type: 'seg', label: 'Sex', options: [['m', 'Male'], ['f', 'Female']], value: null },
      { id: 'ageY', type: 'number', label: 'Age — years', unit: 'y', min: 1, max: 17, placeholder: '1–17' },
      { id: 'ageM', type: 'number', label: 'Age — extra months', unit: 'mo', min: 0, max: 11, hint: 'Optional; refines the height percentile' },
      { id: 'ht', type: 'number', label: 'Height', unit: 'cm', min: 60, max: 210, placeholder: 'e.g. 140' },
      { id: 'sbp', type: 'number', label: 'Systolic BP', unit: 'mmHg', min: 40, max: 260 },
      { id: 'dbp', type: 'number', label: 'Diastolic BP', unit: 'mmHg', min: 20, max: 200 },
    ],
    calculate(v) {
      if (!window.AAPBP || !window.GrowthRef) return 'Reference data failed to load.';
      if (!v.sex || v.ageY == null || v.ht == null || v.sbp == null || v.dbp == null) return 'Fill in sex, age, height, systolic and diastolic BP.';
      const y = Math.floor(v.ageY);
      if (y < 1) return 'The AAP tables start at 1 year of age.';
      if (y > 17) return 'The AAP pediatric tables end at 17 years; use adult thresholds from 18 years.';
      const ageMo = y * 12 + (v.ageM || 0), hp = G.pctOf('cdc', 'hfa', v.sex, v.ht, ageMo);
      if (!hp) return 'Height is outside the CDC reference range for this age.';
      const bins = AAPBP.heightPct; let col = 0;
      bins.forEach((b, i) => { if (Math.abs(b - hp.pct) < Math.abs(bins[col] - hp.pct)) col = i; });
      const tb = AAPBP[v.sex][y], S = [50, 90, 95].map((p) => tb.S[p][col]), D = [50, 90, 95].map((p) => tb.D[p][col]);
      const young = y < 13, cs = bpCat(v.sbp, S, 'S', young), cd = bpCat(v.dbp, D, 'D', young), c = Math.max(cs, cd);
      const ps = bpEst(v.sbp, ...S), pd = bpEst(v.dbp, ...D);
      const out = [
        { type: 'stat', label: 'Classification', value: BPCAT[c], tone: BPTONE[c], sub: young ? 'percentile-based (<13 y)' : 'absolute thresholds (≥13 y)' },
        { type: 'stat', label: 'Systolic ≈ percentile', value: '≈' + U.pct(ps), sub: BPCAT[cs] },
        { type: 'stat', label: 'Diastolic ≈ percentile', value: '≈' + U.pct(pd), sub: BPCAT[cd] },
        { type: 'stat', label: 'Height percentile', value: U.pct(hp.pct), sub: `table column: ${bins[col]}th` },
      ];
      out.push({ type: 'table', caption: `AAP 2017 thresholds (mmHg) · ${v.sex === 'm' ? 'boys' : 'girls'}, age ${y} y, height-percentile column ${bins[col]}`, head: ['', 'Measured', 'P50', 'P90', 'P95', 'P95 + 12'],
        rows: [['Systolic', v.sbp, ...S, S[2] + 12], ['Diastolic', v.dbp, ...D, D[2] + 12]] });
      out.push({ type: 'note', tone: 'mute', text: young
        ? 'Age <13 y: normal <P90; elevated ≥P90 to <P95 (or 120/80 to <P95, whichever is lower); stage 1 ≥P95 to <P95+12 (or 130/80–139/89, whichever is lower); stage 2 ≥P95+12 (or ≥140/90, whichever is lower). Category = the higher of systolic and diastolic.'
        : 'Age ≥13 y: normal <120/<80; elevated 120–129/<80; stage 1 130/80–139/89; stage 2 ≥140/90.' });
      out.push({ type: 'note', tone: 'mute', text: 'The guideline tables only publish P50, P90 and P95; the “≈ percentile” is an interpolated estimate (±a few points) — rely on the classification. Confirm elevated readings on repeat auscultatory measurement with an appropriately sized cuff.' });
      return out;
    },
    refs: [{ text: 'Flynn JT, Kaelber DC, Baker-Smith CM, et al. Clinical practice guideline for screening and management of high blood pressure in children and adolescents. Pediatrics 2017;140:e20171904.', doi: '10.1542/peds.2017-1904' }],
  });
})();
