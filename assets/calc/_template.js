/* ==========================================================================
   TEMPLATE — how to add calculators.   (This file is NOT loaded by the page.)

   A) Add a calculator to an EXISTING group
      Open that group's file (e.g. assets/calc/cardiovascular.js) and paste a block
      like the ones below just before the closing  })();   That's it — it appears
      in the right group and in search automatically.

   B) Groups
      Groups come from the Clinical Calculator library (56 specialty categories, defined in
      assets/calc/library.js). Set  group:  to one of those category titles, e.g.
      'Cardiovascular Medicine' or 'Pediatrics'.  Your hand-written entries are listed
      first inside each group; library entries carry a "Pustaka" badge.
      A brand-new group is possible with Calc.group({id:'My group', title:'My group', order:1000}).
      New file? Add <script src="assets/calc/<name>.js"></script> to calculators.html after library.js.

   Handy helpers: Calc.util.fix(x,dp) · fmt(x,dp) · pct(p) · range(a,b) · pnorm/qnorm
                  bmi(kg,cm) · bsa.mosteller(kg,cm) · parseDate/addDays/days/longDate
   Result text is shown as plain text; table cells may contain trusted HTML.
   ========================================================================== */
(function () {
  const U = Calc.util;


  /* ---- 1) POINT SCORE (checkboxes and/or dropdowns) ---- */
  Calc.score({
    id: 'example-score',                 // unique; also the link anchor: calculators.html#example-score
    group: 'Cardiovascular Medicine',
    title: 'Example score',
    subtitle: 'What it predicts · range',
    keywords: ['alias', 'istilah indonesia', 'abbreviation'],   // extra search words
    scoreLabel: 'Example',
    items: [
      { id: 'a', label: 'Criterion A', hint: 'optional small print', points: 1 },        // checkbox: adds points when ticked
      { id: 'b', label: 'Criterion B', points: 2 },
      { id: 'c', label: 'Graded item', options: [[0, 'None'], [1, 'Mild'], [2, 'Severe']] },   // dropdown: value = points
      { id: 'd', label: 'Yes/No item', type: 'seg', value: null, options: [[1, 'Yes'], [0, 'No']] }, // segmented buttons
    ],
    interpret: (score, v) => score >= 3
      ? { tone: 'bad', label: 'High risk.', text: 'What to do next.' }     // tone: ok | warn | bad | info | mute
      : { tone: 'ok', label: 'Low risk.' },
    refs: [{ text: 'Author A, et al. Title. Journal 2020;1:1–10.', doi: '10.xxxx/xxxxx' }],
  });

  /* ---- 2) FORMULA CALCULATOR (numbers in, results out) ---- */
  Calc.add({
    id: 'example-formula',
    group: 'Cardiovascular Medicine',
    title: 'Example formula',
    subtitle: 'Units in metric',
    keywords: [],
    inputs: [
      { id: 'sex', type: 'seg', label: 'Sex', options: [['m', 'Male'], ['f', 'Female']], value: null },
      { id: 'wt', type: 'number', label: 'Weight', unit: 'kg', min: 1, max: 300, placeholder: 'e.g. 70' },
      { id: 'cr', type: 'number', label: 'Creatinine', unit: ['mg/dL', 'µmol/L'] },       // array = unit dropdown -> v.cr_unit
      { id: 'when', type: 'date', label: 'Date', value: 'today' },
      { id: 'mode', type: 'select', label: 'Mode', value: 'a', options: [['a', 'Mode A'], ['b', 'Mode B']] },
      { id: 'extra', type: 'number', label: 'Only in mode B', unit: 'mg', showIf: (v) => v.mode === 'b' },
      { type: 'heading', label: 'Section heading', id: 'h1' },
      { id: 'flag', type: 'check', label: 'A yes/no checkbox' },
    ],
    calculate(v) {                                   // v = current values; numbers are null when empty
      if (v.wt == null) return 'Enter the weight.'; // a string = hint shown until inputs are complete
      return [
        { type: 'stat', label: 'Result', value: U.fix(v.wt * 2, 1), unit: 'mg', tone: 'info', sub: 'small caption' },
        { type: 'table', caption: 'Details', head: ['Item', 'Value'], rows: [['Doubled', U.fix(v.wt * 2, 1)]] },
        { type: 'note', tone: 'warn', label: 'Caution:', text: 'Free text.' },
      ];
    },
    note: 'Optional footnote under the results.',
    refs: [{ text: 'Reference text.', doi: '10.xxxx/xxxxx' }],
  });
})();

/* ==========================================================================
   FIXING / HIDING A BROKEN LIBRARY CALCULATOR  (put these in your own file, loaded after library.js)
   1) Find its id: open the calculator, the page address ends in  #calc-0022
   2) Replace it with a corrected version — same id (or  replaces: [...]):
        Calc.score({ id: 'calc-0022', group: 'Emergency & Critical Care Medicine', title: 'NEXUS C-Spine', ... });
      or a hand-written formula with  Calc.add({ id: 'my-fix', replaces: ['calc-0022'], ... })
   3) Or just hide it:   Calc.hide('calc-0022', 'calc-0100');
   ========================================================================== */
