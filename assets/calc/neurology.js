/* Neurology: NIHSS, Glasgow Coma Scale. */
(function () {
  const UN = [0, 'UN — amputation or joint fusion (scores 0)'];

  Calc.score({
    id: 'nihss', group: 'Neurology, Psychiatry & Geriatric Medicine', title: 'NIHSS', subtitle: 'NIH Stroke Scale · 0–42',
    keywords: ['NIHSS', 'stroke', 'NIH stroke scale', 'cerebrovascular', 'trombolisis', 'thrombolysis', 'neurologi', 'defisit neurologis'],
    intro: 'Score what the patient does, not what you think they can do. Items in standard order; untestable limbs (UN) score 0.',
    scoreLabel: 'NIHSS',
    wideItems: true,
    items: [
      { id: 'n1a', label: '1a. Level of consciousness', options: [[0, '0 — Alert'], [1, '1 — Not alert; arousable to minor stimulation'], [2, '2 — Not alert; needs repeated/painful stimulation'], [3, '3 — Reflex responses only or unresponsive']] },
      { id: 'n1b', label: '1b. LOC questions (month, age)', options: [[0, '0 — Both correct'], [1, '1 — One correct'], [2, '2 — Neither correct']] },
      { id: 'n1c', label: '1c. LOC commands (open/close eyes, grip)', options: [[0, '0 — Both correct'], [1, '1 — One correct'], [2, '2 — Neither correct']] },
      { id: 'n2', label: '2. Best gaze', options: [[0, '0 — Normal'], [1, '1 — Partial gaze palsy'], [2, '2 — Forced deviation / total gaze paresis']] },
      { id: 'n3', label: '3. Visual fields', options: [[0, '0 — No visual loss'], [1, '1 — Partial hemianopia'], [2, '2 — Complete hemianopia'], [3, '3 — Bilateral hemianopia / blind']] },
      { id: 'n4', label: '4. Facial palsy', options: [[0, '0 — Normal'], [1, '1 — Minor (flat nasolabial fold, asymmetric smile)'], [2, '2 — Partial (lower face)'], [3, '3 — Complete (upper and lower face)']] },
      { id: 'n5a', label: '5a. Motor arm — left', options: [[0, '0 — No drift (10 s)'], [1, '1 — Drift, does not hit bed'], [2, '2 — Some effort against gravity'], [3, '3 — No effort against gravity'], [4, '4 — No movement'], UN] },
      { id: 'n5b', label: '5b. Motor arm — right', options: [[0, '0 — No drift (10 s)'], [1, '1 — Drift, does not hit bed'], [2, '2 — Some effort against gravity'], [3, '3 — No effort against gravity'], [4, '4 — No movement'], UN] },
      { id: 'n6a', label: '6a. Motor leg — left', options: [[0, '0 — No drift (5 s)'], [1, '1 — Drift, does not hit bed'], [2, '2 — Some effort against gravity'], [3, '3 — No effort against gravity'], [4, '4 — No movement'], UN] },
      { id: 'n6b', label: '6b. Motor leg — right', options: [[0, '0 — No drift (5 s)'], [1, '1 — Drift, does not hit bed'], [2, '2 — Some effort against gravity'], [3, '3 — No effort against gravity'], [4, '4 — No movement'], UN] },
      { id: 'n7', label: '7. Limb ataxia', options: [[0, '0 — Absent'], [1, '1 — Present in one limb'], [2, '2 — Present in two limbs'], UN] },
      { id: 'n8', label: '8. Sensory', options: [[0, '0 — Normal'], [1, '1 — Mild to moderate loss'], [2, '2 — Severe to total loss']] },
      { id: 'n9', label: '9. Best language', options: [[0, '0 — No aphasia'], [1, '1 — Mild to moderate aphasia'], [2, '2 — Severe aphasia'], [3, '3 — Mute / global aphasia']] },
      { id: 'n10', label: '10. Dysarthria', options: [[0, '0 — Normal'], [1, '1 — Mild to moderate'], [2, '2 — Severe / unintelligible or mute'], UN] },
      { id: 'n11', label: '11. Extinction & inattention (neglect)', options: [[0, '0 — No abnormality'], [1, '1 — Inattention/extinction in one modality'], [2, '2 — Profound hemi-inattention or >1 modality']] },
    ],
    interpret: (s) => s === 0 ? { tone: 'ok', label: 'No stroke symptoms.' }
      : s <= 4 ? { tone: 'ok', label: 'Minor stroke (1–4).' }
      : s <= 15 ? { tone: 'warn', label: 'Moderate stroke (5–15).' }
      : s <= 20 ? { tone: 'bad', label: 'Moderate-to-severe stroke (16–20).' }
      : { tone: 'bad', label: 'Severe stroke (21–42).' },
    note: 'NIHSS is one input to treatment decisions; it under-represents posterior-circulation strokes and does not replace imaging or eligibility criteria for reperfusion therapy.',
    refs: [{ text: 'Brott T, Adams HP Jr, Olinger CP, et al. Measurements of acute cerebral infarction: a clinical examination scale. Stroke 1989;20:864–70.', doi: '10.1161/01.STR.20.7.864' }],
  });

  Calc.score({
    id: 'gcs', group: 'Neurology, Psychiatry & Geriatric Medicine', title: 'Glasgow Coma Scale (GCS)', subtitle: 'Eye · verbal · motor · 3–15',
    keywords: ['GCS', 'glasgow', 'coma', 'consciousness', 'kesadaran', 'head injury', 'cedera kepala', 'trauma'],
    scoreLabel: 'GCS', max: 15,
    items: [
      { id: 'e', label: 'Eye opening (E)', value: 4, options: [[4, '4 — Spontaneous'], [3, '3 — To voice'], [2, '2 — To pressure'], [1, '1 — None']] },
      { id: 'v', label: 'Verbal response (V)', value: 5, options: [[5, '5 — Oriented'], [4, '4 — Confused'], [3, '3 — Words (inappropriate)'], [2, '2 — Sounds (incomprehensible)'], [1, '1 — None']] },
      { id: 'm', label: 'Motor response (M)', value: 6, options: [[6, '6 — Obeys commands'], [5, '5 — Localizes pain'], [4, '4 — Withdraws (normal flexion)'], [3, '3 — Abnormal flexion'], [2, '2 — Extension'], [1, '1 — None']] },
    ],
    interpret: (s, v) => [
      { type: 'note', tone: 'info', label: 'Components:', text: `E${v.e} V${v.v} M${v.m}` },
      s >= 13 ? { tone: 'ok', label: 'Mild (13–15).' } : s >= 9 ? { tone: 'warn', label: 'Moderate (9–12).' } : { tone: 'bad', label: 'Severe (3–8).', text: 'Consider airway protection.' },
    ],
    note: 'Report the three components rather than only the sum. For intubated patients record V as “T”; the paediatric (<2 y) verbal and motor scales differ from the adult scale shown.',
    refs: [{ text: 'Teasdale G, Jennett B. Assessment of coma and impaired consciousness: a practical scale. Lancet 1974;2:81–4.', doi: '10.1016/S0140-6736(74)91639-0' }],
  });
})();
