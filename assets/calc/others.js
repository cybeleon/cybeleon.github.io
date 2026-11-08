/* Others: STOP-Bang, RSI drug doses, Centor/McIsaac, BMI & BSA (adult). */
(function () {
  const U = Calc.util;
  Calc.group({ id: 'other', title: 'Lainnya', order: 90, keywords: ['misc', 'other', 'anesthesia', 'anestesi', 'ENT', 'THT'], blurb: 'Skrining OSA, dosis RSI, faringitis, dan antropometri dewasa.' });

  /* ---- STOP-Bang ---- */
  Calc.score({
    id: 'stopbang', group: 'other', title: 'STOP-Bang', subtitle: 'Obstructive sleep apnoea screening · 0–8',
    keywords: ['STOP-Bang', 'STOPBANG', 'sleep apnea', 'OSA', 'apnea tidur', 'mendengkur', 'snoring', 'preoperative', 'anesthesia', 'anestesi'],
    scoreLabel: 'STOP-Bang',
    items: [
      { id: 's', label: 'Snoring — loud enough to be heard through a closed door or your bed-partner elbows you' },
      { id: 't', label: 'Tired — often feel tired, fatigued or sleepy during the daytime' },
      { id: 'o', label: 'Observed — anyone observed you stop breathing during sleep' },
      { id: 'p', label: 'Pressure — treated for, or have, high blood pressure' },
      { id: 'bmi', label: 'BMI > 35 kg/m²' },
      { id: 'age', label: 'Age > 50 years' },
      { id: 'neck', label: 'Neck circumference > 40 cm' },
      { id: 'male', label: 'Gender — male' },
    ].map((i) => Object.assign(i, { points: 1, showPoints: false })),
    interpret: (s, v) => {
      const stop = ['s', 't', 'o', 'p'].filter((k) => v[k]).length, rule = stop >= 2 && (v.bmi || v.male || v.neck);
      return s >= 5 || (s >= 3 && rule)
        ? { tone: 'bad', label: 'High risk of OSA.', text: (s >= 5 ? 'Score 5–8.' : 'STOP score ≥2 plus male sex, BMI >35 or neck >40 cm.') + ' Consider a sleep study and perioperative precautions.' }
        : s >= 3 ? { tone: 'warn', label: 'Intermediate risk (3–4).' } : { tone: 'ok', label: 'Low risk (0–2).' };
    },
    note: 'A screening tool for moderate-to-severe OSA; sensitivity is high but specificity is modest. Neck-circumference cut-offs differ in some populations.',
    refs: [
      { text: 'Chung F, Yegneswaran B, Liao P, et al. STOP questionnaire: a tool to screen patients for obstructive sleep apnea. Anesthesiology 2008;108:812–21.', doi: '10.1097/ALN.0b013e31816d83e4' },
      { text: 'Chung F, Abdullah HR, Liao P. STOP-Bang questionnaire: a practical approach to screen for obstructive sleep apnea. Chest 2016;149:631–8.', doi: '10.1378/chest.15-0903' },
    ],
  });

  /* ---- Centor / McIsaac ---- */
  Calc.score({
    id: 'centor', group: 'other', title: 'Centor score (McIsaac-modified)', subtitle: 'Group A streptococcal pharyngitis',
    keywords: ['Centor', 'McIsaac', 'strep', 'streptococcus', 'pharyngitis', 'faringitis', 'sore throat', 'nyeri tenggorok', 'tonsilitis', 'GAS'],
    scoreLabel: 'Centor / McIsaac',
    items: [
      { id: 'ex', label: 'Tonsillar swelling or exudate', points: 1 },
      { id: 'ln', label: 'Tender / swollen anterior cervical lymph nodes', points: 1 },
      { id: 'fv', label: 'Temperature > 38 °C (history or measured)', points: 1 },
      { id: 'nc', label: 'Absence of cough', points: 1 },
      { id: 'ag', label: 'Age', options: [[1, '3–14 years (+1)'], [0, '15–44 years (0)'], [-1, '≥45 years (−1)']], value: 0 },
    ],
    interpret: (s) => {
      const p = s <= 0 ? '≈2–3%' : s === 1 ? '≈4–6%' : s === 2 ? '≈10–12%' : s === 3 ? '≈27–28%' : '≈38–63%';
      return [{ type: 'stat', label: 'Probability of GAS', value: p, tone: s >= 4 ? 'bad' : s >= 2 ? 'warn' : 'ok', sub: 'approximate, from validation studies' },
        s <= 1 ? { tone: 'ok', label: 'Score ≤1:', text: 'No testing or antibiotics needed.' } : s <= 3 ? { tone: 'warn', label: 'Score 2–3:', text: 'Rapid antigen detection test (± throat culture); treat if positive.' } : { tone: 'bad', label: 'Score ≥4:', text: 'Test (RADT/culture) or consider empiric treatment according to local guidance.' }];
    },
    note: 'Probability bands are approximate and differ between cohorts. Guidelines differ on whether to use clinical scores alone in adults; follow local policy.',
    refs: [
      { text: 'Centor RM, Witherspoon JM, Dalton HP, Brody CE, Link K. The diagnosis of strep throat in adults in the emergency room. Med Decis Making 1981;1:239–46.', doi: '10.1177/0272989X8100100304' },
      { text: 'McIsaac WJ, White D, Tannenbaum D, Low DE. A clinical score to reduce unnecessary antibiotic use in patients with sore throat. CMAJ 1998;158:75–83.' },
      { text: 'McIsaac WJ, Kellner JD, Aufricht P, Vanjaka A, Low DE. Empirical validation of guidelines for the management of pharyngitis in children and adults. JAMA 2004;291:1587–95.', doi: '10.1001/jama.291.13.1587' },
    ],
  });

  /* ---- BMI & BSA (adult) ---- */
  const ibw = (sex, cm) => (sex === 'm' ? 50 : 45.5) + 2.3 * (cm / 2.54 - 60); // Devine
  Calc.add({
    id: 'bmi-bsa', group: 'other', title: 'BMI & BSA (adults)', subtitle: 'BMI categories (WHO and Asia-Pacific), BSA, ideal body weight',
    keywords: ['BMI', 'BSA', 'body mass index', 'indeks massa tubuh', 'IMT', 'luas permukaan tubuh', 'obesity', 'obesitas', 'overweight', 'ideal body weight', 'berat badan ideal', 'Asia Pacific', 'Mosteller', 'Devine'],
    inputs: [
      { id: 'sex', type: 'seg', label: 'Sex (for ideal weight)', options: [['m', 'Male'], ['f', 'Female']], value: null },
      { id: 'wt', type: 'number', label: 'Weight', unit: 'kg', min: 20, max: 400, placeholder: 'e.g. 68' },
      { id: 'ht', type: 'number', label: 'Height', unit: 'cm', min: 100, max: 230, placeholder: 'e.g. 165' },
    ],
    calculate(v) {
      if (v.wt == null || v.ht == null) return 'Enter weight and height.';
      const b = U.bmi(v.wt, v.ht);
      const who = b < 18.5 ? ['Underweight', 'warn'] : b < 25 ? ['Normal', 'ok'] : b < 30 ? ['Overweight (pre-obese)', 'warn'] : b < 35 ? ['Obesity class I', 'bad'] : b < 40 ? ['Obesity class II', 'bad'] : ['Obesity class III', 'bad'];
      const ap = b < 18.5 ? ['Underweight', 'warn'] : b < 23 ? ['Normal', 'ok'] : b < 25 ? ['Overweight (at risk)', 'warn'] : b < 30 ? ['Obese I', 'bad'] : ['Obese II', 'bad'];
      const h2 = Math.pow(v.ht / 100, 2);
      const out = [
        { type: 'stat', label: 'BMI', value: U.fix(b, 1), unit: 'kg/m²', tone: who[1] },
        { type: 'stat', label: 'WHO category', value: who[0], tone: who[1], sub: 'cut-offs 18.5 / 25 / 30 / 35 / 40' },
        { type: 'stat', label: 'Asia-Pacific category', value: ap[0], tone: ap[1], sub: 'cut-offs 18.5 / 23 / 25 / 30' },
        { type: 'stat', label: 'BSA — Mosteller', value: U.fix(U.bsa.mosteller(v.wt, v.ht), 2), unit: 'm²' },
        { type: 'stat', label: 'BSA — DuBois', value: U.fix(U.bsa.dubois(v.wt, v.ht), 2), unit: 'm²' },
      ];
      out.push({ type: 'note', tone: 'info', label: 'Healthy-weight range for this height:', text: `${U.fix(18.5 * h2, 1)}–${U.fix(24.9 * h2, 1)} kg (WHO) · ${U.fix(18.5 * h2, 1)}–${U.fix(22.9 * h2, 1)} kg (Asia-Pacific).` });
      if (v.sex) {
        const i = ibw(v.sex, v.ht);
        if (i > 0) out.push({ type: 'note', tone: 'info', label: 'Ideal body weight (Devine):', text: `${U.fix(i, 1)} kg · adjusted body weight ${U.fix(i + 0.4 * (v.wt - i), 1)} kg (IBW + 0.4 × excess).` });
      }
      out.push({ type: 'note', tone: 'mute', text: 'BMI does not distinguish fat from lean mass or fat distribution; add waist circumference where appropriate. Not for children (use growth percentiles).' });
      return out;
    },
    refs: [
      { text: 'WHO Expert Consultation. Appropriate body-mass index for Asian populations and its implications for policy and intervention strategies. Lancet 2004;363:157–63.', doi: '10.1016/S0140-6736(03)15268-3' },
      { text: 'WHO. Obesity: preventing and managing the global epidemic. WHO Technical Report Series 894. Geneva: WHO; 2000.' },
      { text: 'Devine BJ. Gentamicin therapy. Drug Intell Clin Pharm 1974;8:650–5.' },
    ],
  });

  /* ---- RSI drug doses ---- */
  Calc.add({
    id: 'rsi', group: 'other', title: 'RSI drug doses & ETT size', subtitle: 'Rapid-sequence intubation · weight-based, adult & paediatric',
    keywords: ['RSI', 'rapid sequence intubation', 'intubasi', 'airway', 'jalan napas', 'etomidate', 'ketamine', 'propofol', 'succinylcholine', 'rocuronium', 'suxamethonium', 'induction', 'paralytic', 'ETT', 'atropine', 'emergency', 'anestesi'],
    intro: 'Reference doses only — always verify against your local protocol, drug concentrations, and the patient’s physiology (shock, raised ICP, contraindications).',
    inputs: [
      { id: 'grp', type: 'seg', label: 'Patient group', options: [['adult', 'Adult / adolescent'], ['child', 'Child 1–11 y'], ['infant', 'Infant < 1 y']], value: 'adult', wide: true },
      { id: 'wt', type: 'number', label: 'Weight (actual)', unit: 'kg', min: 2, max: 300, placeholder: 'e.g. 70' },
      { id: 'sex', type: 'seg', label: 'Sex (for ideal weight)', options: [['m', 'Male'], ['f', 'Female']], value: null, showIf: (v) => v.grp === 'adult' },
      { id: 'ht', type: 'number', label: 'Height (optional)', unit: 'cm', min: 100, max: 230, showIf: (v) => v.grp === 'adult' },
      { id: 'dw', type: 'seg', label: 'Dose induction agents & rocuronium by', options: [['abw', 'Actual weight'], ['ibw', 'Ideal weight']], value: 'abw', showIf: (v) => v.grp === 'adult', hint: 'Ideal weight is commonly used in obesity; succinylcholine uses actual weight.' },
      { id: 'age', type: 'number', label: 'Age (for ETT size)', unit: 'years', min: 1, max: 11.99, showIf: (v) => v.grp === 'child' },
    ],
    calculate(v) {
      if (v.wt == null) return 'Enter the patient’s weight.';
      const adult = v.grp === 'adult', kid = !adult;
      let w = v.wt, wLabel = 'actual weight';
      if (adult && v.dw === 'ibw') { if (!v.sex || v.ht == null) return 'Ideal-weight dosing needs sex and height.'; w = ibw(v.sex, v.ht); wLabel = 'ideal body weight'; if (!(w > 0)) return 'Height is too short for the Devine formula.'; }
      const amt = (perKg, base, lo, hi) => { const a = perKg[0] * base, b = (perKg[1] || perKg[0]) * base; return perKg[1] ? `${U.fix(a, 0)}–${U.fix(b, 0)}` : U.fix(a, a < 10 ? 1 : 0); };
      const dose = (name, perKg, unit, base, note) => [name, perKg[1] ? `${perKg[0]}–${perKg[1]} ${unit}/kg` : `${perKg[0]} ${unit}/kg`, `<strong>${amt(perKg, base)} ${unit}</strong>`, note || ''];
      const suxK = v.grp === 'infant' ? 2 : 1.5;
      const rows = [
        dose('Etomidate', [0.3], 'mg', w, 'haemodynamically neutral; adrenal suppression'),
        dose('Ketamine', [1, 2], 'mg', w, 'use the lower end in shock'),
        dose('Propofol', [1.5, 2], 'mg', w, 'avoid in hypotension'),
      ];
      if (adult) rows.push(dose('Fentanyl (adjunct)', [2, 3], 'µg', w, 'blunt sympathetic response (e.g. raised ICP)'));
      rows.push(dose('Succinylcholine', [suxK], 'mg', v.wt, 'actual weight; check K⁺/contraindications'), dose('Rocuronium', [1, 1.2], 'mg', w, 'alternative to succinylcholine'));
      if (kid) rows.push(dose('Atropine (pre-medication)', [0.02], 'mg', v.wt, 'min 0.1 mg in many protocols; max 0.5 mg'));
      const out = [{ type: 'stat', label: 'Dosing weight', value: U.fix(w, 1), unit: 'kg', sub: wLabel, tone: 'info' }];
      if (adult && v.sex && v.ht) { const i = ibw(v.sex, v.ht); if (i > 0) out.push({ type: 'stat', label: 'Ideal body weight', value: U.fix(i, 1), unit: 'kg', sub: 'Devine' }); }
      out.push({ type: 'table', caption: 'Doses', head: ['Drug', 'Dose', 'Amount', 'Comment'], rows });
      if (v.grp === 'child' && v.age != null) {
        const c = v.age / 4 + 3.5, u = v.age / 4 + 4;
        out.push({ type: 'table', caption: 'Endotracheal tube', head: ['', 'Size (ID)', 'Depth at lip'], rows: [['Cuffed', U.fix(c, 1) + ' mm', U.fix(c * 3, 1) + ' cm'], ['Uncuffed', U.fix(u, 1) + ' mm', U.fix(u * 3, 1) + ' cm']] });
      } else if (v.grp === 'infant') out.push({ type: 'note', tone: 'info', label: 'ETT (infant):', text: 'Cuffed 3.0–3.5 mm or uncuffed 3.5 mm ID (term neonate 3.0–3.5 mm). Depth ≈ 3 × tube size at the lip. Confirm with waveform capnography.' });
      out.push({ type: 'note', tone: 'mute', text: 'Children: cuffed ID = age/4 + 3.5 mm, uncuffed ID = age/4 + 4 mm; oral depth ≈ 3 × ID (cm at the lip). Adult RSI doses are weight-based approximations from standard airway references; individualise for age, comorbidity and haemodynamics.' });
      return out;
    },
    refs: [
      { text: 'Brown CA 3rd, Sakles JC, Mick NW, eds. The Walls Manual of Emergency Airway Management, 5th ed. Philadelphia: Wolters Kluwer; 2018.' },
      { text: 'Motoyama EK. Endotracheal intubation. In: Motoyama EK, Davis PJ, eds. Smith’s Anesthesia for Infants and Children. 6th ed. St Louis: Mosby; 1996.' },
      { text: 'Weiss M, Dullenkopf A, Fischer JE, Keller C, Gerber AC. Prospective randomized controlled multi-centre trial of cuffed or uncuffed endotracheal tubes in small children. Br J Anaesth 2009;103:867–73.', doi: '10.1093/bja/aep290' },
    ],
  });
})();
