/* Obstetrics: EDD & gestational age by LMP, Bishop score. More to come — append new Calc.add({...}) blocks below. */
(function () {
  const U = Calc.util;
  Calc.group({ id: 'ob', title: 'Obstetri', order: 20, keywords: ['obstetric', 'pregnancy', 'kehamilan', 'ibu hamil', 'obgyn', 'persalinan'], blurb: 'Taksiran persalinan, usia kehamilan, dan skor serviks.' });

  Calc.add({
    id: 'edd-lmp', group: 'ob', title: 'EDD & gestational age by LMP', subtitle: 'Naegele’s rule with cycle-length adjustment',
    keywords: ['EDD', 'HPL', 'hari perkiraan lahir', 'HPHT', 'LMP', 'last menstrual period', 'gestational age', 'usia kehamilan', 'Naegele', 'pregnancy', 'kehamilan', 'trimester', 'due date'],
    inputs: [
      { id: 'lmp', type: 'date', label: 'First day of last menstrual period (LMP / HPHT)' },
      { id: 'cycle', type: 'number', label: 'Cycle length', unit: 'days', value: 28, min: 21, max: 45, hint: 'Default 28. EDD shifts by (cycle − 28) days.' },
      { id: 'ref', type: 'date', label: 'Calculate gestational age on', value: 'today' },
    ],
    calculate(v) {
      const lmp = U.parseDate(v.lmp), ref = U.parseDate(v.ref);
      if (lmp == null) return 'Enter the first day of the last menstrual period.';
      const cyc = v.cycle == null ? 28 : v.cycle, adj = Math.round(cyc - 28);
      const edd = U.addDays(lmp, 280 + adj), out = [{ type: 'stat', label: 'Estimated due date', value: U.longDate(edd), tone: 'info', sub: `LMP + 280 days${adj ? ` ${adj > 0 ? '+' : '−'} ${Math.abs(adj)} (cycle ${cyc} d)` : ''}` }];
      if (ref != null) {
        const d = U.days(lmp, ref) - adj;
        if (d < 0) out.push({ type: 'note', tone: 'warn', text: 'The reference date is before the LMP.' });
        else {
          const w = Math.floor(d / 7), dd = d % 7;
          const tri = w < 14 ? '1st trimester' : w < 28 ? '2nd trimester' : '3rd trimester';
          const term = w < 37 ? 'Preterm' : w < 39 ? 'Early term' : w < 41 ? 'Full term' : w < 42 ? 'Late term' : 'Post-term';
          out.push({ type: 'stat', label: 'Gestational age', value: `${w}w ${dd}d`, sub: `${tri} · ${term}`, tone: w > 44 ? 'bad' : w >= 42 ? 'warn' : 'ok' });
          out.push({ type: 'stat', label: 'Days to EDD', value: U.days(ref, edd), unit: 'days' });
          if (w > 44) out.push({ type: 'note', tone: 'warn', text: 'Gestational age >44 weeks — check the dates entered.' });
        }
      }
      const mile = [['End of 1st trimester (14w0d)', 98], ['Detailed anomaly scan window (18–22w)', 126, 154], ['Routine GDM screening window (24–28w)', 168, 196], ['Start of 3rd trimester (28w0d)', 196], ['Term begins (37w0d)', 259], ['Full term begins (39w0d)', 273], ['Post-term (42w0d)', 294]];
      out.push({ type: 'table', caption: 'Milestones', head: ['Event', 'Date'], rows: mile.map((m) => [m[0], U.longDate(U.addDays(lmp, m[1] + adj)) + (m[2] ? ' – ' + U.longDate(U.addDays(lmp, m[2] + adj)) : '')]) });
      out.push({ type: 'note', tone: 'mute', text: 'LMP dating is reliable only with a certain LMP and regular cycles. If an early ultrasound (CRL) differs from LMP dating by more than the ACOG thresholds (e.g. >5 days before 9w0d, >7 days at 9w0d–13w6d), re-date by ultrasound.' });
      return out;
    },
    refs: [
      { text: 'ACOG Committee Opinion No. 700: Methods for estimating the due date. Obstet Gynecol 2017;129:e150–4.', doi: '10.1097/AOG.0000000000002046' },
      { text: 'ACOG Committee Opinion No. 579: Definition of term pregnancy. Obstet Gynecol 2013;122:1139–40.', doi: '10.1097/01.AOG.0000437385.88715.4a' },
    ],
  });

  Calc.score({
    id: 'bishop', group: 'ob', title: 'Bishop score', subtitle: 'Cervical favourability before induction of labour',
    keywords: ['Bishop', 'induction', 'induksi', 'serviks', 'cervix', 'ripening', 'labour', 'persalinan', 'pelvic score'],
    scoreLabel: 'Bishop score',
    items: [
      { id: 'dil', label: 'Cervical dilation', options: [[0, 'Closed'], [1, '1–2 cm'], [2, '3–4 cm'], [3, '≥5 cm']] },
      { id: 'eff', label: 'Effacement', options: [[0, '0–30%'], [1, '40–50%'], [2, '60–70%'], [3, '≥80%']] },
      { id: 'sta', label: 'Fetal station (−3 to +2 system)', options: [[0, '−3'], [1, '−2'], [2, '−1 or 0'], [3, '+1 or +2']] },
      { id: 'con', label: 'Cervical consistency', options: [[0, 'Firm'], [1, 'Medium'], [2, 'Soft']] },
      { id: 'pos', label: 'Cervical position', options: [[0, 'Posterior'], [1, 'Mid-position'], [2, 'Anterior']] },
    ],
    interpret: (s) => s >= 8
      ? { tone: 'ok', label: 'Favourable (≥8).', text: 'High likelihood of successful induction / vaginal delivery, similar to spontaneous labour.' }
      : s >= 6
        ? { tone: 'warn', label: 'Intermediate (6–7).', text: 'Many protocols already regard a score ≤6 as unfavourable; cervical ripening may be considered.' }
        : { tone: 'bad', label: 'Unfavourable (≤5).', text: 'Cervical ripening (e.g. prostaglandin or mechanical methods) is generally considered before oxytocin induction.' },
    refs: [
      { text: 'Bishop EH. Pelvic scoring for elective induction. Obstet Gynecol 1964;24:266–8.' },
      { text: 'ACOG Practice Bulletin No. 107: Induction of labor. Obstet Gynecol 2009;114:386–97.', doi: '10.1097/AOG.0b013e3181b48ef5' },
    ],
  });
})();
