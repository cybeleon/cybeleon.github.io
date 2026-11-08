/* Pulmonology: CURB-65. */
(function () {
  Calc.group({ id: 'pulm', title: 'Pulmonologi', order: 40, keywords: ['pulmonology', 'respiratory', 'lung', 'paru', 'pernapasan'], blurb: 'Stratifikasi keparahan pneumonia komunitas.' });

  const MORT = ['0.7%', '3.2%', '13%', '17%', '41.5%', '57%'];
  Calc.score({
    id: 'curb65', group: 'pulm', title: 'CURB-65', subtitle: 'Severity of community-acquired pneumonia',
    keywords: ['CURB-65', 'CRB-65', 'pneumonia', 'CAP', 'community acquired', 'pneumonia komunitas', 'rawat inap', 'mortalitas', 'respirologi', 'paru'],
    scoreLabel: 'CURB-65',
    items: [
      { id: 'c', label: 'Confusion', hint: 'New disorientation in person, place or time (e.g. AMT ≤8)' },
      { id: 'u', label: 'Urea > 7 mmol/L', hint: 'BUN > 19 mg/dL  ·  urea > 42 mg/dL' },
      { id: 'r', label: 'Respiratory rate ≥ 30 /min' },
      { id: 'b', label: 'Blood pressure low', hint: 'Systolic < 90 mmHg or diastolic ≤ 60 mmHg' },
      { id: 'a', label: 'Age ≥ 65 years' },
    ],
    interpret: (s, v) => [
      { type: 'stat', label: 'CRB-65 (no urea)', value: s - (v.u ? 1 : 0), unit: '/ 4', sub: 'for settings without blood tests' },
      { type: 'stat', label: '30-day mortality', value: MORT[s], sub: 'original derivation/validation cohorts', tone: s >= 3 ? 'bad' : s === 2 ? 'warn' : 'ok' },
      s <= 1 ? { tone: 'ok', label: 'Low risk (0–1).', text: 'Likely suitable for outpatient treatment, if no other clinical or social concerns.' }
        : s === 2 ? { tone: 'warn', label: 'Moderate risk (2).', text: 'Consider short inpatient stay or closely supervised outpatient treatment.' }
        : { tone: 'bad', label: 'Severe pneumonia (≥3).', text: 'Manage in hospital; consider ICU assessment, especially with a score of 4–5.' },
    ],
    note: 'The score does not capture hypoxaemia, multilobar involvement, comorbidity or social factors — apply clinical judgement (and e.g. ATS/IDSA severity criteria).',
    refs: [{ text: 'Lim WS, van der Eerden MM, Laing R, et al. Defining community acquired pneumonia severity on presentation to hospital: an international derivation and validation study. Thorax 2003;58:377–82.', doi: '10.1136/thorax.58.5.377' }],
  });
})();
