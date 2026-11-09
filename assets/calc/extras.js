/* Hand-written replacements for library entries that had no usable form:
   GERD-Q (calc-0733), SLEDAI-2K (calc-0317), MG-ADL (calc-0612), plus the new Myasthenia Gravis Composite (MGC).
   Same id as a library entry = it takes that entry's place. */
(function () {
  const NM = 'Neuromuscular Disease, Epilepsy, Multiple Sclerosis & Sleep';

  /* ---------------- GERD-Q ---------------- */
  const days = (rev) => (rev ? [[3, '0 days'], [2, '1 day'], [1, '2–3 days'], [0, '4–7 days']] : [[0, '0 days'], [1, '1 day'], [2, '2–3 days'], [3, '4–7 days']]);
  Calc.score({
    id: 'calc-0733', group: 'Gastroenterology, Hepatobiliary Medicine, Endoscopy & Nutrition', title: 'GERD-Q', subtitle: 'GERD questionnaire · 0–18',
    keywords: ['GerdQ', 'GERD', 'reflux', 'refluks', 'heartburn', 'regurgitation', 'dyspepsia', 'asam lambung'],
    intro: 'Ask about the past 7 days: on how many days did the patient have each symptom? Items 3 and 4 are reverse-scored (more days = fewer points).',
    scoreLabel: 'GERD-Q', max: 18,
    items: [
      { id: 'q1', label: '1. Heartburn (burning behind the breastbone)', options: days(false), value: 0 },
      { id: 'q2', label: '2. Regurgitation (stomach contents rising into throat or mouth)', options: days(false), value: 0 },
      { id: 'q3', label: '3. Pain in the centre of the upper stomach (epigastric)', hint: 'Reverse-scored', options: days(true), value: 3 },
      { id: 'q4', label: '4. Nausea', hint: 'Reverse-scored', options: days(true), value: 3 },
      { id: 'q5', label: '5. Difficulty getting a good night’s sleep because of heartburn or regurgitation', options: days(false), value: 0 },
      { id: 'q6', label: '6. Took over-the-counter medication (e.g. antacids) for heartburn or regurgitation, besides what the doctor prescribed', options: days(false), value: 0 },
    ],
    interpret: (s) => s <= 2 ? { tone: 'ok', label: '0–2: GERD unlikely.', text: 'Estimated GERD likelihood ≈ 0% in the validation cohort; consider other causes.' }
      : s <= 7 ? { tone: 'info', label: '3–7: low probability.', text: 'Estimated likelihood ≈ 50% in the validation cohort; below the usual cut-off, so clinical judgement decides.' }
      : s <= 10 ? { tone: 'warn', label: '8–10: GERD likely (≥ 8 is the usual cut-off).', text: 'Estimated likelihood ≈ 79%; a trial of PPI is reasonable in the primary-care setting.' }
      : { tone: 'bad', label: '11–18: GERD highly likely.', text: 'Estimated likelihood ≈ 89%; consider impact on quality of life and whether further evaluation is needed.' },
    note: 'Estimated likelihoods come from the primary-care validation study; the questionnaire is a diagnostic aid, not a substitute for assessment of alarm features (dysphagia, weight loss, bleeding, anaemia) that call for endoscopy.',
    refs: [{ text: 'Jones R, Junghard O, Dent J, et al. Development of the GerdQ, a tool for the diagnosis and management of gastro-oesophageal reflux disease in primary care. Aliment Pharmacol Ther 2009;30:1030–8.' }],
  });

  /* ---------------- SLEDAI-2K ---------------- */
  Calc.score({
    id: 'calc-0317', group: 'Hematology, Oncology & Immunology/Allergy', title: 'SLEDAI-2K', subtitle: 'SLE Disease Activity Index 2000 · 0–105',
    keywords: ['SLEDAI', 'SLE', 'lupus', 'systemic lupus erythematosus', 'disease activity', 'LES', 'reumatologi'],
    intro: 'Tick a descriptor if present on the day of the visit or in the preceding 10 days (any cause attributable to SLE; exclude infection, drugs, metabolic causes where stated).',
    scoreLabel: 'SLEDAI-2K', max: 105,
    items: [
      { id: 'seiz', label: 'Seizure — 8', hint: 'Recent onset; exclude metabolic, infectious and drug causes', points: 8 },
      { id: 'psych', label: 'Psychosis — 8', hint: 'Altered perception of reality: hallucinations, incoherence, marked loose associations, illogical or bizarre/disorganised/catatonic behaviour', points: 8 },
      { id: 'obs', label: 'Organic brain syndrome — 8', hint: 'Altered mental function with impaired orientation, memory or intellect; rapid onset, fluctuating; reduced attention plus ≥ 2 of: perceptual disturbance, incoherent speech, insomnia/daytime drowsiness, altered psychomotor activity', points: 8 },
      { id: 'vis', label: 'Visual disturbance — 8', hint: 'Retinal changes of SLE (cytoid bodies, retinal haemorrhage, serous exudate/choroidal haemorrhage) or optic neuritis; exclude hypertension, infection, drugs', points: 8 },
      { id: 'cn', label: 'Cranial nerve disorder — 8', hint: 'New-onset sensory or motor neuropathy of cranial nerves (including vertigo due to lupus)', points: 8 },
      { id: 'hdc', label: 'Lupus headache — 8', hint: 'Severe, persistent; may be migrainous; unresponsive to opioid analgesia', points: 8 },
      { id: 'cva', label: 'Cerebrovascular accident — 8', hint: 'New onset; exclude arteriosclerosis', points: 8 },
      { id: 'vasc', label: 'Vasculitis — 8', hint: 'Ulceration, gangrene, tender finger nodules, periungual infarction, splinter haemorrhages, or biopsy/angiogram proof', points: 8 },
      { id: 'arth', label: 'Arthritis — 4', hint: '> 2 joints with pain and signs of inflammation (tenderness, swelling, effusion)', points: 4 },
      { id: 'myo', label: 'Myositis — 4', hint: 'Proximal muscle aching/weakness with raised CK/aldolase, or EMG/biopsy changes', points: 4 },
      { id: 'casts', label: 'Urinary casts — 4', hint: 'Heme-granular or red-cell casts', points: 4 },
      { id: 'hem', label: 'Haematuria — 4', hint: '> 5 RBC/hpf; exclude stone, infection or other cause', points: 4 },
      { id: 'prot', label: 'Proteinuria — 4', hint: '> 0.5 g/24 h; new onset or recent increase of > 0.5 g/24 h', points: 4 },
      { id: 'pyu', label: 'Pyuria — 4', hint: '> 5 WBC/hpf; exclude infection', points: 4 },
      { id: 'rash', label: 'New rash — 2', hint: 'New-onset or recurrent inflammatory-type rash', points: 2 },
      { id: 'alo', label: 'Alopecia — 2', hint: 'New-onset or recurrent abnormal patchy or diffuse hair loss', points: 2 },
      { id: 'muc', label: 'Mucosal ulcers — 2', hint: 'New-onset or recurrent oral or nasal ulcers', points: 2 },
      { id: 'pleu', label: 'Pleurisy — 2', hint: 'Pleuritic chest pain with rub or effusion, or pleural thickening', points: 2 },
      { id: 'peri', label: 'Pericarditis — 2', hint: 'Pericardial pain plus ≥ 1 of rub, effusion, ECG or echo confirmation', points: 2 },
      { id: 'comp', label: 'Low complement — 2', hint: 'Decreased CH50, C3 or C4 below the lower limit of normal', points: 2 },
      { id: 'dna', label: 'Increased DNA binding — 2', hint: 'Above the normal range of the laboratory (e.g. anti-dsDNA)', points: 2 },
      { id: 'fev', label: 'Fever — 1', hint: '> 38 °C; exclude infectious cause', points: 1 },
      { id: 'plt', label: 'Thrombocytopenia — 1', hint: '< 100 × 10⁹/L; exclude drugs', points: 1 },
      { id: 'wbc', label: 'Leukopenia — 1', hint: '< 3 × 10⁹/L; exclude drugs', points: 1 },
    ],
    interpret: (s) => s === 0 ? { tone: 'ok', label: 'No disease activity (0).' }
      : s <= 5 ? { tone: 'ok', label: 'Mild activity (1–5).' }
      : s <= 10 ? { tone: 'warn', label: 'Moderate activity (6–10).' }
      : s <= 19 ? { tone: 'bad', label: 'High activity (11–19).' }
      : { tone: 'bad', label: 'Very high activity (≥ 20).' },
    note: 'Category cut-offs are the ones in common use. A change of about 4 points or more is commonly used as clinically important (the SRI-4 response criterion uses a ≥ 4-point reduction); the index scores presence, not severity, of each descriptor.',
    refs: [{ text: 'Gladman DD, Ibañez D, Urowitz MB. Systemic Lupus Erythematosus Disease Activity Index 2000. J Rheumatol 2002;29:288–91.' }],
  });

  /* ---------------- MG-ADL ---------------- */
  const o = (...t) => t.map((x, i) => [i, `${i} — ${x}`]);
  Calc.score({
    id: 'calc-0612', group: NM, title: 'MG-ADL', subtitle: 'Myasthenia Gravis Activities of Daily Living · 0–24',
    keywords: ['MG-ADL', 'MGADL', 'myasthenia gravis', 'miastenia gravis', 'MG', 'neuromuscular', 'patient reported'],
    intro: 'Patient-reported; considers the past 7 days. Choose the grade that best fits each activity.',
    scoreLabel: 'MG-ADL', max: 24, wideItems: true,
    items: [
      { id: 'talk', label: '1. Talking', options: o('Normal', 'Intermittent slurring or nasal speech', 'Constant slurring or nasal speech, but can be understood', 'Difficult-to-understand speech') },
      { id: 'chew', label: '2. Chewing', options: o('Normal', 'Fatigue with solid food', 'Fatigue with soft food', 'Gastric tube') },
      { id: 'swal', label: '3. Swallowing', options: o('Normal', 'Rare episode of choking', 'Frequent choking necessitating changes in diet', 'Gastric tube') },
      { id: 'brea', label: '4. Breathing', options: o('Normal', 'Shortness of breath with exertion', 'Shortness of breath at rest', 'Ventilator dependence') },
      { id: 'brsh', label: '5. Impairment of ability to brush teeth or comb hair', options: o('None', 'Extra effort, but no rest periods needed', 'Rest periods needed', 'Cannot do one of these functions') },
      { id: 'chair', label: '6. Impairment of ability to rise from a chair', options: o('None', 'Mild, sometimes uses arms', 'Moderate, always uses arms', 'Severe, requires assistance') },
      { id: 'dipl', label: '7. Double vision', options: o('None', 'Occurs, but not daily', 'Daily, but not constant', 'Constant') },
      { id: 'ptos', label: '8. Eyelid droop', options: o('None', 'Occurs, but not daily', 'Daily, but not constant', 'Constant') },
    ],
    interpret: (s, v) => [
      { type: 'note', tone: 'info', label: 'Domains:', text: `Bulbar (items 1–3) ${+v.talk + +v.chew + +v.swal} · Respiratory ${v.brea} · Limb (5–6) ${+v.brsh + +v.chair} · Ocular (7–8) ${+v.dipl + +v.ptos}` },
      { type: 'note', tone: s === 0 ? 'ok' : 'mute', text: s === 0 ? 'No symptoms on the scale.' : 'A change of ≥ 2 points is considered clinically meaningful. Patient-reported symptoms burden; there are no validated severity bands.' },
    ],
    refs: [
      { text: 'Wolfe GI, Herbelin L, Nations SP, et al. Myasthenia gravis activities of daily living profile. Neurology 1999;52:1487–9.' },
      { text: 'Muppidi S, Wolfe GI, Conaway M, Burns TM. MG-ADL: still a relevant outcome measure. Muscle Nerve 2011;44:727–31.' },
    ],
  });

  /* ---------------- MGC (new) ---------------- */
  const time = (a, b, c, d) => [[0, `${a} — 0`], [1, `${b} — 1`], [c[0], `${c[1]} — ${c[0]}`], [d[0], `${d[1]} — ${d[0]}`]];
  const mrc = (w) => [[0, 'Normal — 0'], [w[0], `Mild weakness (modified MRC 4+) — ${w[0]}`], [w[1], `Moderate weakness (modified MRC 4 to 4−) — ${w[1]}`], [w[2], `Severe weakness (modified MRC 3 or less) — ${w[2]}`]];
  Calc.score({
    id: 'mgc', group: NM, title: 'Myasthenia Gravis Composite (MGC)', subtitle: 'Weighted physician + patient items · 0–50',
    keywords: ['MGC', 'MG composite', 'myasthenia gravis composite', 'miastenia gravis', 'MG', 'neuromuscular', 'ptosis', 'diplopia'],
    intro: 'Items 1–3 are timed or examined at the visit; items 4–7 are patient-reported (past week); items 8–10 are examined. Scores are already weighted.',
    scoreLabel: 'MGC', max: 50, wideItems: true,
    items: [
      { id: 'ptosis', label: '1. Ptosis, upward gaze (examined)', options: [[0, 'Lid stays up beyond 45 s — 0'], [1, 'Ptosis at 11–45 s — 1'], [2, 'Ptosis at 1–10 s — 2'], [3, 'Immediate ptosis — 3']] },
      { id: 'dipl', label: '2. Double vision on lateral gaze (examined)', options: [[0, 'No diplopia beyond 45 s — 0'], [1, 'Diplopia at 11–45 s — 1'], [3, 'Diplopia at 1–10 s — 3'], [4, 'Immediate diplopia — 4']] },
      { id: 'eye', label: '3. Eye closure (examined)', options: [[0, 'Normal — 0'], [0, 'Mild weakness (can be forced open with effort) — 0'], [1, 'Moderate weakness (can be forced open easily) — 1'], [2, 'Severe weakness (unable to keep eyes closed) — 2']] },
      { id: 'talk', label: '4. Talking (patient-reported)', options: [[0, 'Normal — 0'], [2, 'Intermittent slurring or nasal speech — 2'], [4, 'Constant slurring or nasal speech, but understandable — 4'], [6, 'Difficult to understand — 6']] },
      { id: 'chew', label: '5. Chewing (patient-reported)', options: [[0, 'Normal — 0'], [2, 'Fatigue with solid food — 2'], [4, 'Fatigue with soft food — 4'], [6, 'Gastric tube — 6']] },
      { id: 'swal', label: '6. Swallowing (patient-reported)', options: [[0, 'Normal — 0'], [2, 'Rare episode of choking — 2'], [5, 'Frequent choking requiring diet changes — 5'], [6, 'Gastric tube — 6']] },
      { id: 'brea', label: '7. Breathing, attributed to MG (patient-reported)', options: [[0, 'Normal — 0'], [2, 'Shortness of breath with exertion — 2'], [4, 'Shortness of breath at rest — 4'], [9, 'Ventilator dependence — 9']] },
      { id: 'neck', label: '8. Neck flexion or extension — weaker of the two (examined)', options: mrc([1, 3, 4]) },
      { id: 'shou', label: '9. Shoulder abduction (examined)', options: mrc([2, 4, 5]) },
      { id: 'hip', label: '10. Hip flexion (examined)', options: mrc([2, 4, 5]) },
    ],
    interpret: (s) => [
      { type: 'note', tone: s === 0 ? 'ok' : 'info', label: s === 0 ? 'No MG signs on the composite.' : 'Higher = worse.', text: 'A change of ≥ 3 points is considered clinically meaningful. There are no validated severity bands.' },
    ],
    refs: [
      { text: 'Burns TM, Conaway M, Sanders DB; MG Composite and MG-QOL15 Study Group. The MG Composite: a valid and reliable outcome measure for myasthenia gravis. Neurology 2010;74:1434–40.' },
      { text: 'Burns TM, Conaway MR, Cutter GR, Sanders DB. Construction of an efficient evaluative instrument for myasthenia gravis: the MG Composite. Muscle Nerve 2008;38:1553–62.', doi: '10.1002/mus.21185' },
    ],
  });
})();
