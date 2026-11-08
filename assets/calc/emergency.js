/* Emergency: Parkland formula, Alvarado score, FOUR score. */
(function () {
  const U = Calc.util;
  Calc.group({ id: 'em', title: 'Gawat Darurat', order: 80, keywords: ['emergency', 'ER', 'IGD', 'trauma', 'critical care', 'ICU'], blurb: 'Resusitasi luka bakar, apendisitis akut, dan penilaian koma.' });

  /* ---- Parkland ---- */
  Calc.add({
    id: 'parkland', group: 'em', title: 'Parkland formula (burn resuscitation)', subtitle: '24-hour crystalloid volume and hourly rates',
    keywords: ['Parkland', 'burn', 'luka bakar', 'resusitasi cairan', 'fluid resuscitation', 'TBSA', 'Baxter', 'Ringer lactate', 'RL', 'combustio'],
    intro: 'Use second-degree and deeper burns only (do not count superficial/first-degree). Time zero is the time of injury.',
    inputs: [
      { id: 'wt', type: 'number', label: 'Weight', unit: 'kg', min: 1, max: 300, placeholder: 'e.g. 70' },
      { id: 'tbsa', type: 'number', label: 'Burn area (TBSA)', unit: '%', min: 1, max: 100, placeholder: 'e.g. 40' },
      { id: 'f', type: 'select', label: 'Formula', value: 4, options: [[4, 'Classic Parkland — 4 mL/kg/%TBSA'], [3, 'Children — 3 mL/kg/%TBSA'], [2, 'ATLS 10th ed. adults — 2 mL/kg/%TBSA']], wide: true },
      { id: 't', type: 'number', label: 'Hours since injury', unit: 'h', value: 0, min: 0, max: 24, hint: 'If resuscitation has not started yet' },
      { id: 'mx', type: 'check', label: 'Child ≤30 kg: add maintenance fluid (4-2-1 rule, dextrose-containing)' },
    ],
    calculate(v) {
      if (v.wt == null || v.tbsa == null) return 'Enter weight and %TBSA.';
      const total = v.f * v.wt * v.tbsa, half = total / 2, t = v.t || 0, out = [];
      out.push({ type: 'stat', label: 'Total 24 h volume', value: U.fix(total, 0), unit: 'mL', tone: 'info', sub: `${v.f} × ${v.wt} kg × ${v.tbsa}%` });
      if (t < 8) out.push({ type: 'stat', label: `First ${t ? 'remaining ' : ''}8 h`, value: U.fix(half / (8 - t), 0), unit: 'mL/h', sub: `${U.fix(half, 0)} mL over ${U.fix(8 - t, 1).replace(/\.0$/, '')} h`, tone: 'warn' });
      if (t < 8) out.push({ type: 'stat', label: 'Next 16 h', value: U.fix(half / 16, 0), unit: 'mL/h', sub: `${U.fix(half, 0)} mL over 16 h` });
      else if (t < 24) out.push({ type: 'stat', label: `Remaining ${24 - t} h`, value: U.fix(total / (24 - t), 0), unit: 'mL/h', sub: 'assuming none given; subtract fluid already given', tone: 'warn' });
      else out.push({ type: 'note', tone: 'warn', text: 'The 24-hour window has elapsed; titrate to urine output.' });
      if (v.mx) {
        if (v.wt > 30) out.push({ type: 'note', tone: 'warn', text: 'Maintenance add-on applies to children ≤30 kg only.' });
        else { const m = v.wt <= 10 ? 4 * v.wt : v.wt <= 20 ? 40 + 2 * (v.wt - 10) : 60 + (v.wt - 20); out.push({ type: 'stat', label: 'Maintenance (4-2-1)', value: U.fix(m, 0), unit: 'mL/h', sub: `${U.fix(m * 24, 0)} mL/24 h, in addition to the above` }); }
      }
      out.push({ type: 'note', tone: 'info', label: 'Titrate to urine output:', text: v.wt <= 30 ? '1 mL/kg/h in children ≤30 kg' : '0.5 mL/kg/h in adults (about 30–50 mL/h)' + '. Lactated Ringer’s is the usual fluid; reduce rates if urine output is above target to avoid “fluid creep”.' });
      out.push({ type: 'note', tone: 'mute', text: 'Adult rule of nines: head 9% · each arm 9% · anterior trunk 18% · posterior trunk 18% · each leg 18% · perineum 1%. Use Lund–Browder charts for children. Add 4 mL/kg/%TBSA for high-voltage electrical injury (plus urine target 75–100 mL/h with myoglobinuria).' });
      return out;
    },
    refs: [
      { text: 'Baxter CR, Shires T. Physiological response to crystalloid resuscitation of severe burns. Ann N Y Acad Sci 1968;150:874–94.', doi: '10.1111/j.1749-6632.1968.tb14738.x' },
      { text: 'Pham TN, Cancio LC, Gibran NS. American Burn Association practice guidelines: burn shock resuscitation. J Burn Care Res 2008;29:257–66.', doi: '10.1097/BCR.0b013e31815f3876' },
      { text: 'American College of Surgeons. Advanced Trauma Life Support (ATLS) Student Course Manual, 10th ed. Chicago: ACS; 2018.' },
    ],
  });

  /* ---- Alvarado ---- */
  Calc.score({
    id: 'alvarado', group: 'em', title: 'Alvarado score (MANTRELS)', subtitle: 'Acute appendicitis likelihood · 0–10',
    keywords: ['Alvarado', 'MANTRELS', 'appendicitis', 'apendisitis', 'acute abdomen', 'abdomen akut', 'RLQ', 'nyeri perut kanan bawah', 'bedah'],
    scoreLabel: 'Alvarado',
    items: [
      { id: 'm', label: 'Migration of pain to the right iliac fossa', points: 1 },
      { id: 'a', label: 'Anorexia', points: 1 },
      { id: 'n', label: 'Nausea / vomiting', points: 1 },
      { id: 't', label: 'Tenderness in the right iliac fossa', points: 2 },
      { id: 'r', label: 'Rebound tenderness', points: 1 },
      { id: 'e', label: 'Elevated temperature', hint: '> 37.3 °C', points: 1 },
      { id: 'l', label: 'Leukocytosis', hint: 'WBC > 10 × 10⁹/L (10,000/µL)', points: 2 },
      { id: 's', label: 'Shift to the left', hint: 'Neutrophils > 75%', points: 1 },
    ],
    interpret: (s) => s <= 4 ? { tone: 'ok', label: 'Appendicitis unlikely (1–4).', text: 'Consider discharge with return advice; image if clinical suspicion persists.' }
      : s <= 6 ? { tone: 'warn', label: 'Possible (5–6).', text: 'Observe / further evaluation; imaging (ultrasound or CT) is usually appropriate.' }
      : s <= 8 ? { tone: 'bad', label: 'Probable (7–8).', text: 'Surgical consultation.' }
      : { tone: 'bad', label: 'Very probable (9–10).', text: 'Surgical consultation; likely requires appendicectomy.' },
    note: 'Performs best at excluding appendicitis (low score); poorer in women of reproductive age and children — consider imaging and gynaecological causes. Complement with clinical judgement.',
    refs: [{ text: 'Alvarado A. A practical score for the early diagnosis of acute appendicitis. Ann Emerg Med 1986;15:557–64.', doi: '10.1016/S0196-0644(86)80993-3' }],
  });

  /* ---- FOUR score ---- */
  Calc.score({
    id: 'four', group: 'em', title: 'FOUR score', subtitle: 'Full Outline of UnResponsiveness · 0–16',
    keywords: ['FOUR', 'FOUR score', 'coma', 'koma', 'unresponsive', 'brainstem', 'batang otak', 'intubated', 'ICU', 'kesadaran', 'GCS alternative'],
    intro: 'Useful where the GCS verbal score cannot be assessed (e.g. intubated patients). Choose the best response in each component.',
    scoreLabel: 'FOUR score', max: 16, wideItems: true,
    items: [
      { id: 'e', label: 'Eye response (E)', value: 4, options: [[4, 'E4 — Eyelids open/opened, tracking or blinking to command'], [3, 'E3 — Eyelids open but not tracking'], [2, 'E2 — Eyelids closed but open to loud voice'], [1, 'E1 — Eyelids closed but open to pain'], [0, 'E0 — Eyelids remain closed with pain']] },
      { id: 'm', label: 'Motor response (M)', value: 4, options: [[4, 'M4 — Thumbs-up, fist or peace sign'], [3, 'M3 — Localising to pain'], [2, 'M2 — Flexion response to pain'], [1, 'M1 — Extensor posturing'], [0, 'M0 — No response to pain, or generalised myoclonus status']] },
      { id: 'b', label: 'Brainstem reflexes (B)', value: 4, options: [[4, 'B4 — Pupil and corneal reflexes present'], [3, 'B3 — One pupil wide and fixed'], [2, 'B2 — Pupil OR corneal reflexes absent'], [1, 'B1 — Pupil AND corneal reflexes absent'], [0, 'B0 — Pupil, corneal and cough reflexes absent']] },
      { id: 'r', label: 'Respiration (R)', value: 4, options: [[4, 'R4 — Not intubated, regular breathing pattern'], [3, 'R3 — Not intubated, Cheyne–Stokes pattern'], [2, 'R2 — Not intubated, irregular breathing'], [1, 'R1 — Breathes above ventilator rate'], [0, 'R0 — Breathes at ventilator rate or apnoea']] },
    ],
    interpret: (s, v) => [
      { type: 'note', tone: 'info', label: 'Components:', text: `E${v.e} M${v.m} B${v.b} R${v.r}` },
      s === 0 ? { tone: 'bad', label: 'FOUR score 0.', text: 'Consistent with — but not by itself diagnostic of — brain death; requires formal determination per local criteria.' } : s <= 8 ? { tone: 'bad', label: 'Severe impairment of consciousness.' } : { tone: s >= 13 ? 'ok' : 'warn', label: s >= 13 ? 'Mild or no impairment.' : 'Moderate impairment.' },
    ],
    refs: [{ text: 'Wijdicks EFM, Bamlet WR, Maramattom BV, Manno EM, McClelland RL. Validation of a new coma scale: the FOUR score. Ann Neurol 2005;58:585–93.', doi: '10.1002/ana.20611' }],
  });
})();
