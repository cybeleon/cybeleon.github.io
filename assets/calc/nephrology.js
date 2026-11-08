/* Nephrology: CKD-EPI 2021 (creatinine ± cystatin C), bedside Schwartz (children). */
(function () {
  const U = Calc.util;
  Calc.group({ id: 'renal', title: 'Nefrologi', order: 70, keywords: ['nephrology', 'kidney', 'ginjal', 'renal', 'ginjal'], blurb: 'Estimasi laju filtrasi glomerulus dan staging PGK.' });

  const stage = (g) => g >= 90 ? ['G1', 'Normal or high', 'ok'] : g >= 60 ? ['G2', 'Mildly decreased', 'ok'] : g >= 45 ? ['G3a', 'Mildly to moderately decreased', 'warn'] : g >= 30 ? ['G3b', 'Moderately to severely decreased', 'warn'] : g >= 15 ? ['G4', 'Severely decreased', 'bad'] : ['G5', 'Kidney failure', 'bad'];

  Calc.add({
    id: 'ckd-epi', group: 'renal', title: 'CKD-EPI eGFR (2021)', subtitle: 'Race-free · creatinine, with optional cystatin C · adults',
    keywords: ['CKD-EPI', 'eGFR', 'GFR', 'LFG', 'laju filtrasi glomerulus', 'creatinine', 'kreatinin', 'cystatin C', 'kidney', 'ginjal', 'CKD', 'PGK', 'penyakit ginjal kronik', 'renal'],
    intro: 'For adults (≥18 y) in steady state. Not valid in acute kidney injury, pregnancy or extremes of muscle mass/diet.',
    inputs: [
      { id: 'sex', type: 'seg', label: 'Sex', options: [['m', 'Male'], ['f', 'Female']], value: null },
      { id: 'age', type: 'number', label: 'Age', unit: 'years', min: 18, max: 120, placeholder: '≥18' },
      { id: 'scr', type: 'number', label: 'Serum creatinine', unit: ['mg/dL', 'µmol/L'], min: 0.1, placeholder: 'e.g. 1.1' },
      { id: 'cys', type: 'number', label: 'Cystatin C (optional)', unit: 'mg/L', min: 0.1, max: 20, hint: 'Enables cystatin-only and combined estimates' },
      { id: 'wt', type: 'number', label: 'Weight (optional)', unit: 'kg', min: 20, max: 300, hint: 'With height: non-indexed eGFR for drug dosing' },
      { id: 'ht', type: 'number', label: 'Height (optional)', unit: 'cm', min: 100, max: 230 },
    ],
    calculate(v) {
      if (!v.sex || v.age == null || v.scr == null) return 'Select sex and enter age and serum creatinine.';
      if (v.age < 18) return 'CKD-EPI is for adults. For children use the bedside Schwartz calculator.';
      const f = v.sex === 'f', scr = v.scr_unit === 'µmol/L' ? v.scr / 88.4 : v.scr;
      const k = f ? 0.7 : 0.9, a = f ? -0.241 : -0.302, r = scr / k;
      const cr = 142 * Math.pow(Math.min(r, 1), a) * Math.pow(Math.max(r, 1), -1.2) * Math.pow(0.9938, v.age) * (f ? 1.012 : 1);
      const st = stage(cr);
      const out = [
        { type: 'stat', label: 'eGFRcr (2021)', value: U.fix(cr, 0), unit: 'mL/min/1.73 m²', tone: st[2] },
        { type: 'stat', label: 'GFR category', value: st[0], sub: st[1], tone: st[2] },
      ];
      let primary = cr;
      if (v.cys != null) {
        const s = v.cys / 0.8, cys = 133 * Math.pow(Math.min(s, 1), -0.499) * Math.pow(Math.max(s, 1), -1.328) * Math.pow(0.996, v.age) * (f ? 0.932 : 1);
        const k2 = f ? 0.7 : 0.9, a2 = f ? -0.219 : -0.144, r2 = scr / k2;
        const both = 135 * Math.pow(Math.min(r2, 1), a2) * Math.pow(Math.max(r2, 1), -0.544) * Math.pow(Math.min(s, 1), -0.323) * Math.pow(Math.max(s, 1), -0.778) * Math.pow(0.9961, v.age) * (f ? 0.963 : 1);
        out.push({ type: 'stat', label: 'eGFRcys (2012)', value: U.fix(cys, 0), unit: 'mL/min/1.73 m²' });
        out.push({ type: 'stat', label: 'eGFRcr-cys (2021)', value: U.fix(both, 0), unit: 'mL/min/1.73 m²', tone: stage(both)[2], sub: stage(both)[0] + ' · ' + stage(both)[1] });
        primary = both;
      }
      if (v.wt != null && v.ht != null) {
        const bsa = U.bsa.mosteller(v.wt, v.ht);
        out.push({ type: 'stat', label: 'Non-indexed eGFR', value: U.fix((primary * bsa) / 1.73, 0), unit: 'mL/min', sub: `BSA ${U.fix(bsa, 2)} m² (Mosteller); for drug dosing` });
      }
      out.push({ type: 'note', tone: 'mute', text: 'CKD requires abnormality of kidney structure or function for >3 months; classify also by albuminuria (A1–A3). G3a–G5 persisting >3 months define CKD irrespective of albuminuria. Cystatin C is useful when creatinine is unreliable (low/high muscle mass, amputation, liver disease).' });
      return out;
    },
    refs: [
      { text: 'Inker LA, Eneanya ND, Coresh J, et al. New creatinine- and cystatin C–based equations to estimate GFR without race. N Engl J Med 2021;385:1737–49.', doi: '10.1056/NEJMoa2102953' },
      { text: 'Inker LA, Schmid CH, Tighiouart H, et al. Estimating glomerular filtration rate from serum creatinine and cystatin C. N Engl J Med 2012;367:20–9.', doi: '10.1056/NEJMoa1114248' },
      { text: 'KDIGO 2024 Clinical Practice Guideline for the Evaluation and Management of CKD. Kidney Int 2024;105(4S):S117–314.', doi: '10.1016/j.kint.2023.10.018' },
    ],
  });

  Calc.add({
    id: 'schwartz', group: 'renal', title: 'Bedside Schwartz eGFR (children)', subtitle: 'Height-based estimate · ages 1–17 y',
    keywords: ['Schwartz', 'pediatric GFR', 'GFR anak', 'children', 'anak', 'creatinine', 'kreatinin', 'eGFR', 'pediatrik'],
    inputs: [
      { id: 'ht', type: 'number', label: 'Height', unit: 'cm', min: 50, max: 220, placeholder: 'e.g. 120' },
      { id: 'scr', type: 'number', label: 'Serum creatinine (enzymatic/IDMS-traceable)', unit: ['mg/dL', 'µmol/L'], min: 0.05, placeholder: 'e.g. 0.6' },
    ],
    calculate(v) {
      if (v.ht == null || v.scr == null) return 'Enter height and serum creatinine.';
      const scr = v.scr_unit === 'µmol/L' ? v.scr / 88.4 : v.scr, g = (0.413 * v.ht) / scr, st = stage(g);
      return [
        { type: 'stat', label: 'eGFR (bedside Schwartz)', value: U.fix(g, 0), unit: 'mL/min/1.73 m²', tone: st[2] },
        { type: 'stat', label: 'GFR category', value: st[0], sub: st[1], tone: st[2] },
        { type: 'note', tone: 'mute', text: 'eGFR = 0.413 × height (cm) ÷ serum creatinine (mg/dL). Validated in children with CKD (CKiD cohort); the newer CKiD-U25 equations (age/sex-specific) can be added as another block. Not for neonates or AKI.' },
      ];
    },
    refs: [{ text: 'Schwartz GJ, Muñoz A, Schneider MF, et al. New equations to estimate GFR in children with CKD. J Am Soc Nephrol 2009;20:629–37.', doi: '10.1681/ASN.2008030287' }],
  });
})();
