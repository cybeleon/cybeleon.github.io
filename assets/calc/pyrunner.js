/* Runs the bundled Clinical Calculator Python library in the browser (Pyodide).
   Loaded lazily: nothing is downloaded until someone opens a library calculator.
   Self-host Pyodide instead of using the CDN by setting, before this script:
       window.PYODIDE_BASE = 'assets/pyodide/';   // folder containing pyodide.js
*/
(function () {
  const BASE = window.PYODIDE_BASE || 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/';
  const INIT = `
import sys, json, dataclasses
sys.path.insert(0, '/home/pyodide')
from clinical_calculators import load_registry
_reg = load_registry(include_custom=False)
def run_calc(cid, payload_json):
    r = _reg.get(cid).run(json.loads(payload_json))
    return json.dumps(dataclasses.asdict(r), ensure_ascii=False)
`;
  let pending = null;
  const PyRunner = (window.PyRunner = { ready: false, error: null });

  const script = (src) => new Promise((ok, no) => {
    const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = () => no(new Error('Could not load ' + src)); document.head.appendChild(s);
  });

  PyRunner.load = () => {
    if (pending) return pending;
    pending = (async () => {
      await script(BASE + 'pyodide.js');
      const py = await window.loadPyodide({ indexURL: BASE });
      const zip = await (await fetch('assets/py/clinical_calculators.zip')).arrayBuffer();
      py.unpackArchive(zip, 'zip', '/home/pyodide');
      py.runPython(INIT);
      PyRunner.ready = true;
      return py;
    })().catch((e) => { PyRunner.error = e; pending = null; throw e; });
    return pending;
  };

  PyRunner.run = async (id, payload) => {
    const py = await PyRunner.load();
    return JSON.parse(py.globals.get('run_calc')(id, JSON.stringify(payload)));
  };
})();
