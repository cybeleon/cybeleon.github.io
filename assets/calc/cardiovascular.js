/* Cardiovascular: Wells score for DVT. Add more (Wells PE, CHA2DS2-VASc, HAS-BLED, …) below. */
(function () {
  Calc.group({ id: 'cardio', title: 'Kardiovaskular', order: 60, keywords: ['cardiology', 'cardiovascular', 'heart', 'jantung', 'vascular', 'kardiologi'], blurb: 'Probabilitas pra-tes dan skor risiko kardiovaskular.' });

  Calc.score({
    id: 'wells-dvt', group: 'cardio', title: 'Wells score for DVT', subtitle: 'Pre-test probability of deep vein thrombosis',
    keywords: ['Wells', 'DVT', 'deep vein thrombosis', 'thrombosis', 'trombosis vena dalam', 'D-dimer', 'venous thromboembolism', 'VTE', 'leg swelling', 'bengkak kaki'],
    scoreLabel: 'Wells (DVT)',
    items: [
      { id: 'w1', label: 'Active cancer', hint: 'Treatment ongoing, within 6 months, or palliative', points: 1 },
      { id: 'w2', label: 'Paralysis, paresis or recent plaster immobilisation of the lower extremity', points: 1 },
      { id: 'w3', label: 'Recently bedridden ≥3 days, or major surgery within 12 weeks', hint: 'Requiring general or regional anaesthesia', points: 1 },
      { id: 'w4', label: 'Localised tenderness along the distribution of the deep venous system', points: 1 },
      { id: 'w5', label: 'Entire leg swollen', points: 1 },
      { id: 'w6', label: 'Calf swelling ≥3 cm larger than the asymptomatic side', hint: 'Measured 10 cm below the tibial tuberosity', points: 1 },
      { id: 'w7', label: 'Pitting oedema confined to the symptomatic leg', points: 1 },
      { id: 'w8', label: 'Collateral superficial veins (non-varicose)', points: 1 },
      { id: 'w9', label: 'Previously documented DVT', points: 1 },
      { id: 'w10', label: 'Alternative diagnosis at least as likely as DVT', points: -2 },
    ],
    max: 9,
    interpret: (s) => [
      { type: 'stat', label: 'Three-tier probability', value: s <= 0 ? 'Low' : s <= 2 ? 'Moderate' : 'High', tone: s <= 0 ? 'ok' : s <= 2 ? 'warn' : 'bad', sub: s <= 0 ? '≈ 5% prevalence of DVT' : s <= 2 ? '≈ 17% prevalence' : '≈ 53% prevalence' },
      { type: 'stat', label: 'Two-tier', value: s >= 2 ? 'DVT likely' : 'DVT unlikely', tone: s >= 2 ? 'bad' : 'ok', sub: s >= 2 ? 'score ≥2' : 'score ≤1' },
      s >= 2 ? { tone: 'bad', label: 'Likely:', text: 'Proceed to compression ultrasound (consider empiric anticoagulation if imaging is delayed).' } : { tone: 'ok', label: 'Unlikely:', text: 'A negative high-sensitivity D-dimer effectively excludes DVT; if D-dimer is positive, proceed to ultrasound.' },
    ],
    note: 'Prevalence figures are approximate and come from derivation/validation cohorts; they vary by setting. Not validated in pregnancy or in patients already on anticoagulants.',
    refs: [
      { text: 'Wells PS, Anderson DR, Rodger M, et al. Evaluation of D-dimer in the diagnosis of suspected deep-vein thrombosis. N Engl J Med 2003;349:1227–35.', doi: '10.1056/NEJMoa023153' },
      { text: 'Wells PS, Owen C, Doucette S, Fergusson D, Tran H. Does this patient have deep vein thrombosis? JAMA 2006;295:199–207.', doi: '10.1001/jama.295.2.199' },
    ],
  });
})();
