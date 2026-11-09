/* Classification criteria & staging: NYHA, Modified Duke, MMSE, Killip, Jones (2015), leprosy (WHO + Ridley–Jopling),
   2019 EULAR/ACR SLE, WHO vision impairment. Entries that reuse a library id (calc-0529, 0214, 0782, 0530, 0425) replace it. */
(function () {
  const U = Calc.util;
  const HF = 'Heart Failure, Electrocardiology & Vascular Medicine';

  /* ---------------- NYHA ---------------- */
  Calc.ref({
    id: 'calc-0529', group: HF, title: 'NYHA Functional Class', subtitle: 'Heart failure symptoms · I–IV',
    keywords: ['NYHA', 'New York Heart Association', 'heart failure', 'gagal jantung', 'functional class', 'kelas fungsional', 'dyspnea', 'ACC/AHA stage'],
    blocks: [
      { type: 'table', head: ['Class', 'Patient symptoms'], rows: [
        ['I', 'No limitation of physical activity. Ordinary activity does not cause undue fatigue, palpitation or dyspnea.'],
        ['II', 'Slight limitation. Comfortable at rest; ordinary physical activity causes fatigue, palpitation, dyspnea or angina.'],
        ['III', 'Marked limitation. Comfortable at rest; less-than-ordinary activity causes fatigue, palpitation, dyspnea or angina.'],
        ['IV', 'Unable to carry on any physical activity without symptoms; symptoms (heart failure or angina) may be present at rest, and any activity increases discomfort.'],
      ] },
      { type: 'table', caption: 'ACC/AHA stages (for comparison — based on structure, not symptoms)', head: ['Stage', 'Meaning', 'Usual NYHA'], rows: [
        ['A', 'At risk for HF; no structural disease or symptoms', '—'],
        ['B', 'Structural heart disease, no HF symptoms (pre-HF)', 'I'],
        ['C', 'Structural heart disease with current or prior HF symptoms', 'I–IV'],
        ['D', 'Advanced HF: marked symptoms at rest despite maximal therapy', 'III–IV'],
      ] },
      { type: 'note', tone: 'mute', text: 'Class is assigned from the patient’s symptoms at the time of assessment and can move up or down; ACC/AHA stage only progresses.' },
    ],
    refs: [
      { text: 'The Criteria Committee of the New York Heart Association. Nomenclature and Criteria for Diagnosis of Diseases of the Heart and Great Vessels, 9th ed. Boston: Little, Brown; 1994.' },
      { text: 'Heidenreich PA, Bozkurt B, Aguilar D, et al. 2022 AHA/ACC/HFSA guideline for the management of heart failure. Circulation 2022;145:e895–e1032.', doi: '10.1161/CIR.0000000000001063' },
    ],
  });

  /* ---------------- Killip ---------------- */
  Calc.add({
    id: 'calc-0530', group: HF, title: 'Killip class', subtitle: 'Acute MI · I–IV',
    keywords: ['Killip', 'Killip-Kimball', 'myocardial infarction', 'infark miokard', 'STEMI', 'cardiogenic shock', 'syok kardiogenik', 'pulmonary edema', 'edema paru', 'AMI'],
    inputs: [{ id: 'k', type: 'select', label: 'Clinical findings', value: 1, wide: true, options: [
      [1, 'I — No clinical signs of heart failure'],
      [2, 'II — Rales (< 50% of lung fields), S3 gallop, elevated JVP'],
      [3, 'III — Frank pulmonary oedema (rales throughout)'],
      [4, 'IV — Cardiogenic shock (SBP < 90 mmHg with peripheral vasoconstriction: oliguria, cyanosis, sweating)'],
    ] }],
    calculate(v) {
      const mort = { 1: '6%', 2: '17%', 3: '38%', 4: '81%' }, tone = { 1: 'ok', 2: 'warn', 3: 'bad', 4: 'bad' };
      return [
        { type: 'stat', label: 'Killip class', value: ['', 'I', 'II', 'III', 'IV'][v.k], tone: tone[v.k], sub: `Original 1967 in-hospital mortality ≈ ${mort[v.k]}` },
        { type: 'table', head: ['Class', 'Findings', 'Mortality in the 1967 series'], rows: [['I', 'No heart failure', '6%'], ['II', 'Mild–moderate HF (S3, basal rales, ↑JVP)', '17%'], ['III', 'Pulmonary oedema', '38%'], ['IV', 'Cardiogenic shock', '81%']] },
        { type: 'note', tone: 'mute', text: 'Mortality figures are from the pre-reperfusion era (coronary-care unit, 1963–65); contemporary mortality is considerably lower at every class, but the class still tracks risk (also used in GRACE and TIMI-type scores).' },
      ];
    },
    refs: [{ text: 'Killip T 3rd, Kimball JT. Treatment of myocardial infarction in a coronary care unit: a two year experience with 250 patients. Am J Cardiol 1967;20:457–64.', doi: '10.1016/0002-9149(67)90023-9' }],
  });

  /* ---------------- Modified Duke ---------------- */
  Calc.add({
    id: 'calc-0214', group: 'Infectious Diseases', title: 'Modified Duke criteria', subtitle: 'Infective endocarditis · definite / possible / rejected',
    keywords: ['Duke', 'modified Duke', 'infective endocarditis', 'endokarditis infektif', 'IE', 'vegetation', 'vegetasi', 'blood culture', 'Li 2000'],
    intro: 'Li et al. 2000 modification of the Duke criteria. Tick everything that applies. (The 2023 Duke–ISCVID update adds extra items — not implemented here.)',
    inputs: [
      { type: 'heading', id: 'h0', label: 'Pathological criterion' },
      { id: 'path', type: 'check', label: 'Microorganisms by culture or histology in a vegetation, embolised vegetation or intracardiac abscess — OR — pathological lesions: vegetation or abscess confirmed by histology showing active endocarditis' },
      { type: 'heading', id: 'h1', label: 'Major criteria' },
      { id: 'maj1', type: 'check', label: 'Positive blood cultures', hint: 'Typical organism (viridans streptococci, S. gallolyticus/bovis, HACEK, S. aureus, community-acquired enterococci without a primary focus) in 2 separate cultures; OR persistently positive cultures of an organism consistent with IE (≥ 2 positive drawn > 12 h apart, or all of 3 / majority of ≥ 4 separate cultures with first and last ≥ 1 h apart); OR single positive culture for Coxiella burnetii or phase-I IgG titre > 1:800' },
      { id: 'maj2', type: 'check', label: 'Evidence of endocardial involvement', hint: 'Echo positive (oscillating mass on valve/supporting structures/in the path of regurgitant jets/on implanted material without another anatomic explanation; abscess; new partial dehiscence of a prosthetic valve) OR new valvular regurgitation' },
      { type: 'heading', id: 'h2', label: 'Minor criteria' },
      { id: 'min1', type: 'check', label: 'Predisposition', hint: 'Predisposing heart condition or injection drug use' },
      { id: 'min2', type: 'check', label: 'Fever', hint: '≥ 38.0 °C' },
      { id: 'min3', type: 'check', label: 'Vascular phenomena', hint: 'Major arterial emboli, septic pulmonary infarcts, mycotic aneurysm, intracranial haemorrhage, conjunctival haemorrhages, Janeway lesions' },
      { id: 'min4', type: 'check', label: 'Immunologic phenomena', hint: 'Glomerulonephritis, Osler nodes, Roth spots, rheumatoid factor' },
      { id: 'min5', type: 'check', label: 'Microbiological evidence', hint: 'Positive blood culture not meeting a major criterion, or serological evidence of active infection with an organism consistent with IE' },
      { type: 'heading', id: 'h3', label: 'Rejection criteria' },
      { id: 'rej', type: 'check', label: 'Firm alternate diagnosis, OR resolution with ≤ 4 days of antibiotics, OR no pathological evidence at surgery/autopsy after ≤ 4 days of antibiotics' },
    ],
    calculate(v) {
      const maj = (v.maj1 ? 1 : 0) + (v.maj2 ? 1 : 0), min = ['min1', 'min2', 'min3', 'min4', 'min5'].filter((k) => v[k]).length;
      let cls, tone, why;
      if (v.path) { cls = 'Definite IE'; tone = 'bad'; why = 'Pathological criterion met.'; }
      else if (maj >= 2) { cls = 'Definite IE'; tone = 'bad'; why = '2 major criteria.'; }
      else if (maj === 1 && min >= 3) { cls = 'Definite IE'; tone = 'bad'; why = '1 major + 3 minor criteria.'; }
      else if (min >= 5) { cls = 'Definite IE'; tone = 'bad'; why = '5 minor criteria.'; }
      else if (v.rej) { cls = 'Rejected'; tone = 'ok'; why = 'Rejection criterion met.'; }
      else if ((maj === 1 && min >= 1) || min >= 3) { cls = 'Possible IE'; tone = 'warn'; why = maj ? '1 major + 1 minor criteria.' : '3 minor criteria.'; }
      else { cls = 'Rejected / not met'; tone = 'ok'; why = 'Does not meet possible-IE criteria.'; }
      return [
        { type: 'stat', label: 'Classification', value: cls, tone, sub: why },
        { type: 'stat', label: 'Major', value: maj, unit: '/ 2' }, { type: 'stat', label: 'Minor', value: min, unit: '/ 5' },
        { type: 'table', head: ['Class', 'Requirement'], rows: [['Definite', 'Pathological criterion; or 2 major; or 1 major + 3 minor; or 5 minor'], ['Possible', '1 major + 1 minor; or 3 minor'], ['Rejected', 'Firm alternate diagnosis; resolution ≤ 4 days of antibiotics; no pathological evidence after ≤ 4 days of antibiotics; or possible criteria not met']] },
        { type: 'note', tone: 'mute', text: '“Possible” still warrants treatment decisions on clinical grounds; the criteria are a diagnostic aid (sensitivity falls in prosthetic-valve and device-related IE and culture-negative cases).' },
      ];
    },
    refs: [
      { text: 'Li JS, Sexton DJ, Mick N, et al. Proposed modifications to the Duke criteria for the diagnosis of infective endocarditis. Clin Infect Dis 2000;30:633–8.', doi: '10.1086/313753' },
      { text: 'Fowler VG, Durack DT, Selton-Suty C, et al. The 2023 Duke–International Society for Cardiovascular Infectious Diseases criteria for infective endocarditis. Clin Infect Dis 2023;77:518–26.', doi: '10.1093/cid/ciad271' },
    ],
  });

  /* ---------------- MMSE ---------------- */
  const n = (k, extra) => Array.from({ length: k + 1 }, (_, i) => [k - i, `${k - i}` + (extra && extra[k - i] ? ' — ' + extra[k - i] : '')]);
  Calc.score({
    id: 'calc-0782', group: 'Neurology, Psychiatry, Geriatrics & Behavioral Medicine', title: 'MMSE', subtitle: 'Mini-Mental State Examination · 0–30',
    keywords: ['MMSE', 'Mini-Mental', 'Folstein', 'cognitive', 'kognitif', 'dementia', 'demensia', 'geriatri', 'orientation', 'orientasi'],
    intro: 'Enter the points obtained in each domain (best = top of list). Scoring is tabulated here; administer with the licensed form (PAR).',
    scoreLabel: 'MMSE', max: 30, wideItems: true,
    items: [
      { id: 'ot', label: 'Orientation to time (year, season, date, day, month)', value: 5, options: n(5) },
      { id: 'op', label: 'Orientation to place (country, province/state, town, hospital, floor)', value: 5, options: n(5) },
      { id: 'reg', label: 'Registration (repeat 3 words)', value: 3, options: n(3) },
      { id: 'att', label: 'Attention and calculation (serial 7s, or spell WORLD backwards)', value: 5, options: n(5) },
      { id: 'rec', label: 'Recall (3 words)', value: 3, options: n(3) },
      { id: 'nam', label: 'Naming (pencil, watch)', value: 2, options: n(2) },
      { id: 'rep', label: 'Repetition (“no ifs, ands, or buts”)', value: 1, options: n(1) },
      { id: 'cmd', label: 'Three-stage command', value: 3, options: n(3) },
      { id: 'rd', label: 'Reading (obey “close your eyes”)', value: 1, options: n(1) },
      { id: 'wr', label: 'Writing (a sentence)', value: 1, options: n(1) },
      { id: 'cp', label: 'Copying (intersecting pentagons)', value: 1, options: n(1) },
    ],
    interpret: (s) => [
      s >= 24 ? { tone: 'ok', label: '24–30: no cognitive impairment (by the usual cut-off).' }
        : s >= 18 ? { tone: 'warn', label: '18–23: mild cognitive impairment.' }
        : s >= 10 ? { tone: 'bad', label: '10–17: moderate impairment.' } : { tone: 'bad', label: '0–9: severe impairment.' },
      { type: 'table', head: ['Score', 'Commonly used category'], rows: [['24–30', 'Normal / no impairment'], ['18–23', 'Mild'], ['10–17', 'Moderate'], ['0–9', 'Severe']] },
      { type: 'note', tone: 'mute', text: 'Scores depend on age and education (low education lowers scores; a cut-off of ≤ 21–23 is sometimes used for people with little schooling) and the MMSE is insensitive to executive dysfunction — consider MoCA. A screening result is not a diagnosis.' },
    ],
    refs: [
      { text: 'Folstein MF, Folstein SE, McHugh PR. “Mini-mental state”: a practical method for grading the cognitive state of patients for the clinician. J Psychiatr Res 1975;12:189–98.', doi: '10.1016/0022-3956(75)90026-6' },
      { text: 'Tombaugh TN, McIntyre NJ. The Mini-Mental State Examination: a comprehensive review. J Am Geriatr Soc 1992;40:922–35.', doi: '10.1111/j.1532-5415.1992.tb01992.x' },
    ],
  });

  /* ---------------- Jones criteria 2015 ---------------- */
  Calc.add({
    id: 'jones-2015', group: 'Cardiovascular Medicine', title: 'Jones criteria (2015) — acute rheumatic fever', subtitle: 'Initial or recurrent ARF · low vs moderate/high-risk populations',
    keywords: ['Jones', 'rheumatic fever', 'demam rematik', 'DRA', 'ARF', 'rheumatic heart disease', 'PJR', 'carditis', 'chorea', 'streptococcus', 'ASTO', 'ASO', 'AHA'],
    intro: 'Revised Jones criteria (AHA 2015). Indonesia is generally treated as a moderate/high-risk setting.',
    inputs: [
      { id: 'risk', type: 'select', label: 'Population risk', value: 'hi', wide: true, options: [['hi', 'Moderate / high risk (ARF incidence > 2 per 100,000 school-age children, or RHD prevalence > 1 per 1000 per year)'], ['lo', 'Low risk (ARF incidence ≤ 2/100,000 school-age children and RHD prevalence ≤ 1/1000 per year)']] },
      { id: 'rec', type: 'seg', label: 'Episode', value: 0, options: [[0, 'Initial ARF'], [1, 'Recurrent ARF']] },
      { id: 'gas', type: 'check', label: 'Evidence of preceding group A streptococcal infection', hint: 'Positive throat culture or rapid antigen test; elevated or rising ASO / anti-DNase B titre (or recent scarlet fever)' },
      { type: 'heading', id: 'hM', label: 'Major criteria' },
      { id: 'carditis', type: 'check', label: 'Carditis (clinical and/or subclinical on echocardiography)' },
      { id: 'arth', type: 'check', label: 'Arthritis', hint: 'Low risk: polyarthritis only · Moderate/high risk: monoarthritis, polyarthritis or polyarthralgia' },
      { id: 'chorea', type: 'check', label: 'Sydenham chorea' },
      { id: 'em', type: 'check', label: 'Erythema marginatum' },
      { id: 'nod', type: 'check', label: 'Subcutaneous nodules' },
      { type: 'heading', id: 'hm', label: 'Minor criteria' },
      { id: 'arthralgia', type: 'check', label: 'Arthralgia', hint: 'Low risk: polyarthralgia · Moderate/high risk: monoarthralgia. Do not count if arthritis is already counted as major.' },
      { id: 'fever', type: 'check', label: 'Fever', hint: 'Low risk: ≥ 38.5 °C · Moderate/high risk: ≥ 38.0 °C' },
      { id: 'esr', type: 'check', label: 'Raised acute-phase reactants', hint: 'Low risk: ESR ≥ 60 mm/h and/or CRP ≥ 3.0 mg/dL · Moderate/high risk: ESR ≥ 30 mm/h and/or CRP ≥ 3.0 mg/dL' },
      { id: 'pr', type: 'check', label: 'Prolonged PR interval on ECG', hint: 'Allowing for age variability; do not count if carditis is counted as major' },
    ],
    calculate(v) {
      const M = ['carditis', 'arth', 'chorea', 'em', 'nod'].filter((k) => v[k]).length;
      let m = ['arthralgia', 'fever', 'esr', 'pr'].filter((k) => v[k]).length;
      const notes = [];
      if (v.arth && v.arthralgia) { m--; notes.push('Arthralgia not counted as minor because arthritis is counted as major.'); }
      if (v.carditis && v.pr) { m--; notes.push('Prolonged PR not counted as minor because carditis is counted as major.'); }
            const rec = +v.rec === 1;
      const met = rec ? (M >= 2 || (M >= 1 && m >= 1) || m >= 3) : (M >= 2 || (M >= 1 && m >= 2));
      const out = [];
      if (met && v.gas) out.push({ type: 'stat', label: rec ? 'Recurrent ARF' : 'Initial ARF', value: 'Criteria met', tone: 'bad', sub: `${M} major, ${m} minor, with evidence of GAS infection` });
      else if (met) out.push({ type: 'stat', label: rec ? 'Recurrent ARF' : 'Initial ARF', value: 'Not confirmed', tone: 'warn', sub: `${M} major, ${m} minor, but no evidence of preceding GAS infection` });
      else out.push({ type: 'stat', label: rec ? 'Recurrent ARF' : 'Initial ARF', value: 'Criteria not met', tone: 'ok', sub: `${M} major, ${m} minor` });
      if (v.chorea && !v.gas) out.push({ type: 'note', tone: 'warn', label: 'Chorea alone:', text: 'Sydenham chorea (and indolent carditis) may be accepted as ARF without laboratory evidence of GAS infection if other causes are excluded.' });
      if (v.carditis && !v.gas && !met) out.push({ type: 'note', tone: 'warn', label: 'Indolent carditis:', text: 'Late-presenting carditis can count without GAS evidence if other causes are excluded.' });
      notes.forEach((t) => out.push({ type: 'note', tone: 'mute', text: t }));
      out.push({ type: 'table', head: ['', 'Required'], rows: [['Initial ARF', 'Evidence of GAS infection + 2 major, or 1 major + 2 minor'], ['Recurrent ARF (known RHD / prior ARF)', 'Evidence of GAS infection + 2 major, or 1 major + 1 minor, or 3 minor']] });
      out.push({ type: 'note', tone: 'mute', text: 'Echocardiography/Doppler is recommended in all suspected ARF to detect subclinical carditis. Confirmed ARF → penicillin treatment of the infection and secondary prophylaxis per national guidelines.' });
      return out;
    },
    refs: [{ text: 'Gewitz MH, Baltimore RS, Tani LY, et al. Revision of the Jones criteria for the diagnosis of acute rheumatic fever in the era of Doppler echocardiography: a scientific statement from the American Heart Association. Circulation 2015;131:1806–18.', doi: '10.1161/CIR.0000000000000205' }],
  });

  /* ---------------- Leprosy ---------------- */
  Calc.add({
    id: 'leprosy', group: 'Infectious Diseases', title: 'Leprosy (Morbus Hansen) — WHO and Ridley–Jopling classification', subtitle: 'PB / MB and the five-point spectrum',
    keywords: ['leprosy', 'kusta', 'morbus hansen', 'Hansen', 'Ridley', 'Jopling', 'TT', 'BT', 'BB', 'BL', 'LL', 'PB', 'MB', 'paucibacillary', 'multibacillary', 'MDT', 'lepromatous', 'tuberculoid', 'borderline', 'kulit'],
    intro: 'The WHO operational classification (PB/MB) decides treatment; Ridley–Jopling is the histo-immunological spectrum.',
    inputs: [
      { id: 'les', type: 'number', label: 'Number of skin lesions', min: 0, max: 500, placeholder: 'e.g. 4' },
      { id: 'nerve', type: 'seg', label: 'Nerve involvement (definite damage with loss of sensation / enlarged nerve)', value: 0, options: [[0, 'None'], [1, 'One nerve'], [2, 'More than one nerve']] },
      { id: 'smear', type: 'seg', label: 'Slit-skin smear (AFB)', value: null, options: [[0, 'Negative'], [1, 'Positive'], [2, 'Not done']] },
    ],
    calculate(v) {
      const out = [];
      if (v.les != null) {
        const mb = v.les >= 6 || +v.nerve === 2 || +v.smear === 1;
        const pb = !mb && v.les >= 1;
        if (v.les === 0 && +v.nerve === 0 && +v.smear !== 1) out.push({ type: 'note', tone: 'mute', text: 'No skin lesion or nerve sign entered — pure neuritic leprosy needs nerve involvement; otherwise leprosy not supported.' });
        else {
          out.push({ type: 'stat', label: 'WHO type', value: mb ? 'MB' : 'PB', tone: mb ? 'bad' : 'warn', sub: mb ? 'Multibacillary' : 'Paucibacillary' });
          out.push({ type: 'note', tone: 'info', label: 'Basis:', text: (mb ? '≥ 6 lesions, or > 1 nerve involved, or smear-positive.' : '1–5 lesions, no more than one nerve, smear negative or not done.') + ' (Indonesian programme / WHO 1998 rule. The 2018 WHO SEARO guideline classifies ANY definite nerve involvement as MB — check your local protocol.)' });
          if (+v.smear === 2 && !mb) out.push({ type: 'note', tone: 'warn', text: 'Smear not done: with doubt, treat as MB (WHO: when in doubt, classify as MB).' });
          out.push({ type: 'note', tone: 'mute', label: 'Adult MDT (WHO):', text: mb ? 'Rifampicin 600 mg once monthly (supervised) + clofazimine 300 mg monthly (supervised) and 50 mg daily + dapsone 100 mg daily, for 12 months.' : 'Rifampicin 600 mg once monthly (supervised) + dapsone 100 mg daily, for 6 months. Children and special situations differ — follow the national leprosy programme.' });
        }
      } else out.push({ type: 'note', tone: 'mute', text: 'Enter the number of skin lesions to see the WHO type; the Ridley–Jopling table is below.' });
      out.push({ type: 'table', caption: 'Ridley–Jopling spectrum', head: ['Feature', 'TT', 'BT', 'BB', 'BL', 'LL'], rows: [
        ['Lesions', 'Single or few', 'Few–several, asymmetric', 'Several, “dimorphic”', 'Numerous, near-symmetric', 'Innumerable, symmetric, diffuse infiltration'],
        ['Morphology', 'Well-defined dry plaque, scaly, anaesthetic', 'Plaques with satellite lesions', '“Punched-out”/inverted-saucer lesions', 'Papules, nodules, plaques', 'Macules, papules, nodules; leonine facies; madarosis'],
        ['Sensation', 'Markedly reduced', 'Reduced', 'Reduced', 'Mild', 'Often preserved early; glove-and-stocking later'],
        ['Nerve damage', 'Early, single thick nerve', 'Early, asymmetric', 'Asymmetric, several', 'Symmetric, late', 'Symmetric, late'],
        ['Slit-skin smear (BI)', 'Negative (0)', 'Negative–1+', '2–4+', '3–5+', '5–6+'],
        ['Mitsuda (lepromin)', 'Strongly +', '+', '− / ±', '−', '−'],
        ['Cell-mediated immunity', 'High', '↓', 'Intermediate, unstable', '↓↓', 'Absent to M. leprae'],
        ['Histopathology', 'Epithelioid granulomas, Langhans cells, few/no AFB', 'Granulomas, lymphocytes', 'Epithelioid cells, no giant cells', 'Foamy macrophages, lymphocytes', 'Foamy (Virchow) cells, grenz zone, many AFB (globi)'],
        ['WHO group', 'PB', 'PB (MB if > 5 lesions or smear +)', 'MB', 'MB', 'MB'],
      ] },
      { type: 'note', tone: 'mute', text: 'Indeterminate leprosy (early, 1–2 hypopigmented macules) and pure neuritic leprosy are outside the five-point spectrum. Lepra reactions: type 1 (reversal; borderline forms) and type 2 (ENL; BL/LL).' });
      return out;
    },
    refs: [
      { text: 'Ridley DS, Jopling WH. Classification of leprosy according to immunity: a five-group system. Int J Lepr 1966;34:255–73.' },
      { text: 'World Health Organization. Guidelines for the diagnosis, treatment and prevention of leprosy. New Delhi: WHO SEARO; 2018.' },
      { text: 'Kementerian Kesehatan RI. Pedoman Nasional Program Pengendalian Kusta (current edition) — verify regimens and local definitions there.' },
    ],
  });

  /* ---------------- 2019 EULAR/ACR SLE ---------------- */
  const sel = (id, label, opts) => ({ id, type: 'select', label, value: 0, wide: true, options: [[0, 'None']].concat(opts.map(([p, t]) => [p, `${t} — ${p}`])) });
  const SLEDOM = [
    ['const', 'Constitutional', ['fever']], ['heme', 'Haematologic', ['leuko', 'thrombo', 'hemo']], ['neuro', 'Neuropsychiatric', ['delirium', 'psychosis', 'seizure']],
    ['muco', 'Mucocutaneous', ['alopecia', 'oral', 'scle', 'acle']], ['sero', 'Serosal', ['effusion', 'pericarditis']], ['msk', 'Musculoskeletal', ['joint']], ['renal', 'Renal', ['prot', 'class25', 'class34']],
    ['apl', 'Antiphospholipid antibodies', ['apl']], ['comp', 'Complement', ['c']], ['ab', 'SLE-specific antibodies', ['dna']],
  ];
  Calc.add({
    id: 'calc-0425', group: 'Rheumatology & Immunology', title: '2019 EULAR/ACR SLE classification criteria', subtitle: 'ANA entry criterion + weighted domains · ≥ 10',
    keywords: ['SLE', 'lupus', 'LES', 'EULAR', 'ACR', 'classification criteria', 'kriteria klasifikasi', 'ANA', 'anti-dsDNA', 'SLICC', 'Aringer', '2019'],
    intro: 'Entry criterion: ANA ≥ 1:80 on HEp-2 cells (or an equivalent positive test) at least once. Within each domain only the highest-weighted criterion counts. Criteria need not be simultaneous and are not counted if another cause is more likely than SLE. (Published as the 2019 criteria — there is no separate 2018 version.)',
    inputs: [
      { id: 'ana', type: 'check', label: 'ANA ≥ 1:80 on HEp-2 cells (or equivalent positive test), at least once — ENTRY CRITERION' },
      { type: 'heading', id: 'd1', label: 'Clinical domains' },
      sel('fever', 'Constitutional — fever > 38.3 °C', [[2, 'Fever']]),
      sel('heme', 'Haematologic', [[3, 'Leukopenia < 4,000/µL'], [4, 'Thrombocytopenia < 100,000/µL'], [4, 'Autoimmune haemolysis']]),
      sel('neuro', 'Neuropsychiatric', [[2, 'Delirium'], [3, 'Psychosis'], [5, 'Seizure']]),
      sel('muco', 'Mucocutaneous', [[2, 'Non-scarring alopecia'], [2, 'Oral ulcers'], [4, 'Subacute cutaneous or discoid lupus'], [6, 'Acute cutaneous lupus']]),
      sel('sero', 'Serosal', [[5, 'Pleural or pericardial effusion'], [6, 'Acute pericarditis']]),
      sel('msk', 'Musculoskeletal', [[6, 'Joint involvement (synovitis of ≥ 2 joints, or tenderness in ≥ 2 joints plus ≥ 30 min morning stiffness)']]),
      sel('renal', 'Renal', [[4, 'Proteinuria > 0.5 g/24 h'], [8, 'Biopsy class II or V lupus nephritis'], [10, 'Biopsy class III or IV lupus nephritis']]),
      { type: 'heading', id: 'd2', label: 'Immunologic domains' },
      sel('apl', 'Antiphospholipid antibodies', [[2, 'Anticardiolipin IgG > 40 GPL, anti-β2GP1 IgG > 40 units, or lupus anticoagulant']]),
      sel('comp', 'Complement proteins', [[3, 'Low C3 or low C4'], [4, 'Low C3 and low C4']]),
      sel('ab', 'SLE-specific antibodies', [[6, 'Anti-dsDNA or anti-Smith antibody']]),
    ],
    calculate(v) {
      if (!v.ana) return [{ type: 'note', tone: 'warn', text: 'Entry criterion not met (positive ANA required). The criteria are not applicable.' }];
      const keys = ['fever', 'heme', 'neuro', 'muco', 'sero', 'msk', 'renal', 'apl', 'comp', 'ab'];
      const vals = keys.map((k) => +v[k] || 0), total = vals.reduce((a, b) => a + b, 0);
      const clin = ['fever', 'heme', 'neuro', 'muco', 'sero', 'msk', 'renal'].some((k) => +v[k] > 0);
      const ok = total >= 10 && clin;
      return [
        { type: 'stat', label: 'Total', value: total, unit: '/ 10 needed', tone: ok ? 'bad' : 'info' },
        { type: 'stat', label: 'Classification', value: ok ? 'SLE' : 'Not classified', tone: ok ? 'bad' : 'ok', sub: ok ? '≥ 1 clinical criterion and ≥ 10 points' : total >= 10 ? 'needs at least one clinical criterion' : `${10 - total} more point(s) needed` },
        { type: 'note', tone: 'mute', text: 'These are classification criteria for research and comparability, not diagnostic criteria; a patient can have SLE below the threshold. Sensitivity 96.1%, specificity 93.4% in validation.' },
      ];
    },
    refs: [{ text: 'Aringer M, Costenbader K, Daikh D, et al. 2019 European League Against Rheumatism/American College of Rheumatology classification criteria for systemic lupus erythematosus. Arthritis Rheumatol 2019;71:1400–12.', doi: '10.1002/art.40930' }],
  });

  /* ---------------- WHO visual impairment ---------------- */
  const VA = [['6/6', 'Equal to or better than 6/12'], ['6/9', ''], ['6/12', ''], ['6/18', ''], ['6/24', ''], ['6/36', ''], ['6/60', ''], ['5/60', ''], ['4/60', ''], ['3/60', ''], ['2/60', ''], ['1/60 (finger counting at 1 m)', ''], ['Light perception', ''], ['No light perception', '']];
  const rank = { '6/6': 0, '6/9': 0, '6/12': 0, '6/18': 1, '6/24': 2, '6/36': 2, '6/60': 2, '5/60': 3, '4/60': 3, '3/60': 3, '2/60': 4, '1/60 (finger counting at 1 m)': 4, 'Light perception': 5, 'No light perception': 6 };
  Calc.add({
    id: 'who-vision', group: 'Ophthalmology', title: 'WHO visual impairment & blindness categories', subtitle: 'ICD-10 (H54) and ICD-11 · better eye',
    keywords: ['WHO', 'blindness', 'kebutaan', 'low vision', 'visual impairment', 'gangguan penglihatan', 'visual acuity', 'tajam penglihatan', 'ICD-11', 'ICD-10', 'H54', 'Snellen', 'visual field', 'lapang pandang'],
    intro: 'Use the PRESENTING visual acuity in the BETTER eye (with current correction, if any) at distance. Metric Snellen (6 m).',
    inputs: [
      { id: 'va', type: 'select', label: 'Presenting distance visual acuity, better eye', value: '6/6', wide: true, options: VA.map(([k]) => [k, k]) },
      { id: 'vf', type: 'check', label: 'Central visual field of the better eye constricted to < 10° from fixation', hint: 'Classifies as blindness (ICD-10 category 3) regardless of acuity' },
      { id: 'near', type: 'check', label: 'Near vision worse than N6 (M 0.8) at 40 cm with existing correction' },
    ],
    calculate(v) {
      const r = rank[v.va];
      const icd11 = ['No distance vision impairment', 'Mild', 'Moderate', 'Severe', 'Blindness (category 4)', 'Blindness (category 5)', 'Blindness (category 6)'];
      const icd10 = [null, null, 'Category 1 (low vision)', 'Category 2 (low vision)', 'Category 3 (blindness)', 'Category 4 (blindness)', 'Category 5 (blindness)'];
      // ICD-10: cat1 <6/18 ... ≥6/60 ; cat2 <6/60 ≥3/60 ; cat3 <3/60 ≥1/60 ; cat4 <1/60 ≥LP ; cat5 NLP
      const c10 = (() => { if (v.va === '6/18' || ['6/24', '6/36', '6/60'].includes(v.va)) return v.va === '6/18' ? null : 'Category 1 (low vision)'; if (['5/60', '4/60', '3/60'].includes(v.va)) return 'Category 2 (low vision)'; if (['2/60', '1/60 (finger counting at 1 m)'].includes(v.va)) return 'Category 3 (blindness)'; if (v.va === 'Light perception') return 'Category 4 (blindness)'; if (v.va === 'No light perception') return 'Category 5 (blindness)'; return null; })();
      let c10f = c10; if (v.vf && (!c10 || c10.startsWith('Category 1') || c10.startsWith('Category 2'))) c10f = 'Category 3 (blindness) — by visual field';
      const out = [
        { type: 'stat', label: 'ICD-11 distance', value: icd11[r], tone: r === 0 ? 'ok' : r <= 2 ? 'warn' : 'bad', sub: ['≥ 6/12', '< 6/12 to ≥ 6/18', '< 6/18 to ≥ 6/60', '< 6/60 to ≥ 3/60', '< 3/60 to ≥ 1/60', '< 1/60 to light perception', 'No light perception'][r] },
        { type: 'stat', label: 'ICD-10 (H54) category', value: c10f || 'Normal / mild (not categorised)', tone: !c10f ? 'ok' : /blind/.test(c10f) ? 'bad' : 'warn', sub: v.vf ? 'field < 10° considered' : undefined },
      ];
      if (v.near) out.push({ type: 'note', tone: 'warn', label: 'Near vision impairment', text: 'present (ICD-11 9D90.7) — often correctable with reading glasses.' });
      out.push({ type: 'table', head: ['ICD-11', 'Presenting VA (better eye)', 'ICD-10 category'], rows: [
        ['None', '≥ 6/12', '—'], ['Mild', '< 6/12 to ≥ 6/18', '—'], ['Moderate', '< 6/18 to ≥ 6/60', '1 (low vision)'], ['Severe', '< 6/60 to ≥ 3/60', '2 (low vision)'],
        ['Blindness 4', '< 3/60 to ≥ 1/60 (or field < 10°)', '3 (blindness)'], ['Blindness 5', '< 1/60 to light perception', '4 (blindness)'], ['Blindness 6', 'No light perception', '5 (blindness)'],
      ] });
      out.push({ type: 'note', tone: 'mute', text: 'The ICD-10 category 1 starts at < 6/18, ICD-11 “moderate” spans < 6/18 to 6/60. 3/60 = counting fingers at 3 m; 6/60 ≈ 0.1 decimal ≈ 20/200 ≈ logMAR 1.0. Use better-eye acuity only; if only one eye is affected, classify as monocular loss separately.' });
      return out;
    },
    refs: [
      { text: 'World Health Organization. International Classification of Diseases 11th Revision — 9D90 Vision impairment including blindness. Geneva: WHO; 2019.' },
      { text: 'World Health Organization. ICD-10 Version 2019, H54 Visual impairment including blindness (binocular or monocular). Geneva: WHO.' },
      { text: 'World Health Organization. World report on vision. Geneva: WHO; 2019.' },
    ],
  });
})();
