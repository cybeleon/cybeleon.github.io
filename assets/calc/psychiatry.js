/* Psychiatry & cognition: GDS-15, PHQ-9, AMT-10, MoCA (score tally). */
(function () {
  const U = Calc.util;
  Calc.group({ id: 'psych', title: 'Psikiatri & Kognitif', order: 50, keywords: ['psychiatry', 'mental', 'jiwa', 'cognitive', 'depression', 'geriatric'], blurb: 'Skrining depresi dan fungsi kognitif.' });

  /* ---- Geriatric Depression Scale, 15 items. Value = points scored by the answer. ---- */
  const gds = (id, label, depressedAnswer) => ({
    id, label, type: 'seg', value: null,
    options: depressedAnswer === 'no' ? [[0, 'Yes'], [1, 'No']] : [[1, 'Yes'], [0, 'No']],
  });
  Calc.score({
    id: 'gds15', group: 'psych', title: 'Geriatric Depression Scale (GDS-15)', subtitle: 'Depression screen in older adults · 0–15',
    keywords: ['GDS', 'GDS-15', 'geriatric depression', 'depresi', 'lansia', 'elderly', 'geriatri', 'skrining depresi', 'mood'],
    intro: 'Ask “how have you felt over the past week?”. Answers are scored automatically (reverse-keyed items handled).',
    scoreLabel: 'GDS-15',
    items: [
      gds('g1', '1. Are you basically satisfied with your life?', 'no'),
      gds('g2', '2. Have you dropped many of your activities and interests?'),
      gds('g3', '3. Do you feel that your life is empty?'),
      gds('g4', '4. Do you often get bored?'),
      gds('g5', '5. Are you in good spirits most of the time?', 'no'),
      gds('g6', '6. Are you afraid that something bad is going to happen to you?'),
      gds('g7', '7. Do you feel happy most of the time?', 'no'),
      gds('g8', '8. Do you often feel helpless?'),
      gds('g9', '9. Do you prefer to stay at home rather than going out and doing new things?'),
      gds('g10', '10. Do you feel you have more problems with memory than most?'),
      gds('g11', '11. Do you think it is wonderful to be alive now?', 'no'),
      gds('g12', '12. Do you feel pretty worthless the way you are now?'),
      gds('g13', '13. Do you feel full of energy?', 'no'),
      gds('g14', '14. Do you feel that your situation is hopeless?'),
      gds('g15', '15. Do you think that most people are better off than you are?'),
    ].map((i) => Object.assign(i, { wide: true })),
    interpret: (s) => [
      s <= 4 ? { tone: 'ok', label: 'Normal (0–4).' } : s <= 8 ? { tone: 'warn', label: 'Mild depressive symptoms (5–8).' } : s <= 11 ? { tone: 'bad', label: 'Moderate (9–11).' } : { tone: 'bad', label: 'Severe (12–15).' },
      { type: 'note', tone: 'mute', text: 'A score ≥5 is a commonly used positive-screen threshold (some studies use >5); it is a screen, not a diagnosis — follow with a clinical interview. Cognitive impairment can reduce validity.' },
    ],
    refs: [
      { text: 'Sheikh JI, Yesavage JA. Geriatric Depression Scale (GDS): recent evidence and development of a shorter version. Clin Gerontol 1986;5:165–73.', doi: '10.1300/J018v05n01_09' },
      { text: 'Yesavage JA, et al. Development and validation of a geriatric depression screening scale: a preliminary report. J Psychiatr Res 1982;17:37–49.', doi: '10.1016/0022-3956(82)90033-4' },
    ],
  });

  /* ---- PHQ-9 ---- */
  const FREQ = [[0, 'Not at all (0)'], [1, 'Several days (1)'], [2, 'More than half the days (2)'], [3, 'Nearly every day (3)']];
  const phq = (id, label) => ({ id, label, type: 'seg', value: null, options: FREQ, wide: true });
  Calc.score({
    id: 'phq9', group: 'psych', title: 'PHQ-9', subtitle: 'Patient Health Questionnaire · depression severity · 0–27',
    keywords: ['PHQ-9', 'PHQ9', 'depression', 'depresi', 'major depressive', 'mood', 'self-harm', 'bunuh diri', 'suicide', 'skrining'],
    intro: 'Over the last 2 weeks, how often has the patient been bothered by the following problems?',
    scoreLabel: 'PHQ-9',
    items: [
      phq('p1', '1. Little interest or pleasure in doing things'),
      phq('p2', '2. Feeling down, depressed, or hopeless'),
      phq('p3', '3. Trouble falling or staying asleep, or sleeping too much'),
      phq('p4', '4. Feeling tired or having little energy'),
      phq('p5', '5. Poor appetite or overeating'),
      phq('p6', '6. Feeling bad about yourself — or that you are a failure or have let yourself or your family down'),
      phq('p7', '7. Trouble concentrating on things, such as reading or watching television'),
      phq('p8', '8. Moving or speaking so slowly that others could have noticed — or being so fidgety/restless that you move around a lot more than usual'),
      phq('p9', '9. Thoughts that you would be better off dead, or of hurting yourself in some way'),
    ],
    interpret: (s, v) => {
      const items = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9'], n = items.filter((k, i) => (v[k] || 0) >= (i === 8 ? 1 : 2)).length;
      const major = n >= 5 && ((v.p1 || 0) >= 2 || (v.p2 || 0) >= 2);
      const out = [
        s <= 4 ? { tone: 'ok', label: 'None–minimal (0–4).', text: 'No treatment needed.' }
          : s <= 9 ? { tone: 'warn', label: 'Mild (5–9).', text: 'Watchful waiting; repeat PHQ-9 at follow-up.' }
          : s <= 14 ? { tone: 'warn', label: 'Moderate (10–14).', text: 'Treatment plan: counselling, follow-up and/or pharmacotherapy.' }
          : s <= 19 ? { tone: 'bad', label: 'Moderately severe (15–19).', text: 'Active treatment with pharmacotherapy and/or psychotherapy.' }
          : { tone: 'bad', label: 'Severe (20–27).', text: 'Immediate initiation of treatment and expedited referral to a mental-health specialist.' },
        { type: 'note', tone: major ? 'bad' : 'mute', label: 'Diagnostic algorithm:', text: major ? `${n} symptoms at threshold including a core symptom — pattern consistent with a major depressive syndrome (clinical confirmation required).` : `${n} symptom(s) at threshold (need ≥5 including item 1 or 2) — algorithm for major depressive syndrome not met.` },
      ];
      if ((v.p9 || 0) > 0) out.unshift({ type: 'note', tone: 'bad', label: 'Item 9 positive:', text: 'Thoughts of death or self-harm reported — perform a suicide-risk assessment today regardless of total score.' });
      return out;
    },
    refs: [{ text: 'Kroenke K, Spitzer RL, Williams JBW. The PHQ-9: validity of a brief depression severity measure. J Gen Intern Med 2001;16:606–13.', doi: '10.1046/j.1525-1497.2001.016009606.x' }],
  });

  /* ---- AMT-10 ---- */
  Calc.score({
    id: 'amt10', group: 'psych', title: 'Abbreviated Mental Test (AMT-10)', subtitle: 'Quick cognitive screen · 0–10',
    keywords: ['AMT', 'AMT-10', 'abbreviated mental test', 'cognitive', 'dementia', 'delirium', 'demensia', 'kognitif', 'orientasi', 'lansia'],
    intro: 'Tick each item answered correctly (1 point each). Adapt item 8 and 9 to local well-known facts when needed.',
    scoreLabel: 'AMT-10',
    items: [
      { id: 'a1', label: 'Age' },
      { id: 'a2', label: 'Time (to the nearest hour)' },
      { id: 'a3', label: 'Address for recall at the end of the test (e.g. “42 West Street”)', hint: 'Give it at the start; ask the patient to repeat it, then recall at the end.' },
      { id: 'a4', label: 'Year' },
      { id: 'a5', label: 'Name of the hospital / place' },
      { id: 'a6', label: 'Recognises two persons (e.g. doctor, nurse)' },
      { id: 'a7', label: 'Date of birth' },
      { id: 'a8', label: 'Year of a major historical event (e.g. start of WWI / local equivalent)' },
      { id: 'a9', label: 'Name of the current head of state / president' },
      { id: 'a10', label: 'Counts backwards from 20 to 1 without error' },
    ].map((i) => Object.assign(i, { points: 1, showPoints: false })),
    interpret: (s) => s >= 8 ? { tone: 'ok', label: 'Normal range (8–10).' } : s >= 4 ? { tone: 'warn', label: 'Suggests cognitive impairment (≤7).', text: 'Consider delirium, dementia or other causes; follow with a fuller assessment (e.g. MoCA/MMSE) and delirium screen.' } : { tone: 'bad', label: 'Marked impairment (≤3).', text: 'Assess urgently for delirium and other acute causes.' },
    note: 'Cut-offs vary by population (≤6 is also used); education, language and sensory impairment affect scores. Not diagnostic.',
    refs: [{ text: 'Hodkinson HM. Evaluation of a mental test score for assessment of mental impairment in the elderly. Age Ageing 1972;1:233–8.', doi: '10.1093/ageing/1.4.233' }],
  });

  /* ---- MoCA (score tally only) ---- */
  const sel = (id, label, max, hint) => ({ id, type: 'select', label, hint, options: U.range(0, max).map((n) => [n, String(n)]), value: 0 });
  Calc.add({
    id: 'moca', group: 'psych', title: 'MoCA (score tally)', subtitle: 'Montreal Cognitive Assessment · 0–30',
    keywords: ['MoCA', 'montreal', 'cognitive', 'MCI', 'mild cognitive impairment', 'dementia', 'demensia', 'kognitif', 'gangguan kognitif ringan'],
    intro: 'Enter the points obtained in each domain from the completed official MoCA form.',
    inputs: [
      sel('vs', 'Visuospatial / executive (max 5)', 5, 'Trail-making 1 · cube copy 1 · clock 3'),
      sel('nm', 'Naming (max 3)', 3),
      sel('at', 'Attention (max 6)', 6, 'Digit span 2 · letter tapping 1 · serial 7s 3'),
      sel('lg', 'Language (max 3)', 3, 'Sentence repetition 2 · letter fluency 1'),
      sel('ab', 'Abstraction (max 2)', 2),
      sel('dr', 'Delayed recall (max 5)', 5),
      sel('or', 'Orientation (max 6)', 6),
      { id: 'edu', type: 'check', label: '≤ 12 years of formal education', hint: 'Adds 1 point (maximum total remains 30)', points: 1 },
    ],
    calculate(v) {
      const raw = ['vs', 'nm', 'at', 'lg', 'ab', 'dr', 'or'].reduce((s, k) => s + (v[k] || 0), 0), adj = v.edu && raw < 30 ? 1 : 0, t = raw + adj;
      return [
        { type: 'stat', label: 'MoCA total', value: t, unit: '/ 30', tone: t >= 26 ? 'ok' : 'warn', sub: adj ? `raw ${raw} + 1 education point` : `raw ${raw}` },
        t >= 26 ? { type: 'note', tone: 'ok', label: 'Normal (≥26).' }
          : t >= 18 ? { type: 'note', tone: 'warn', label: 'Mild cognitive impairment range (18–25).' }
          : t >= 10 ? { type: 'note', tone: 'bad', label: 'Moderate impairment range (10–17).' }
          : { type: 'note', tone: 'bad', label: 'Severe impairment range (<10).' },
        { type: 'note', tone: 'mute', text: 'Severity bands are conventional guides, not validated diagnostic categories; optimal cut-offs vary by language, culture and education. The MoCA is copyrighted: use the official forms and training (mocacognition.com). This page only adds up scores.' },
      ];
    },
    refs: [{ text: 'Nasreddine ZS, Phillips NA, Bédirian V, et al. The Montreal Cognitive Assessment, MoCA: a brief screening tool for mild cognitive impairment. J Am Geriatr Soc 2005;53:695–9.', doi: '10.1111/j.1532-5415.2005.53221.x' }],
  });
})();
