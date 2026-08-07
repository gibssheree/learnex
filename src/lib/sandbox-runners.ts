/** JS + Python runners for CodeSandbox.astro. Both execute inside a fresh
 * Web Worker — never `eval`/`new Function` on the main thread — so a
 * genuine infinite loop in either language can be killed by terminating the
 * worker (the only reliable way to interrupt synchronous script execution),
 * and so sandboxed code never touches this page's DOM, cookies, or
 * localStorage. Nothing here ever calls a Learnitas endpoint: JS runs fully
 * offline, Python only reaches out to jsdelivr's CDN once to fetch the
 * Pyodide (WASM) runtime itself, on demand, the first time a Python
 * sandbox is actually run. */

export interface RunResult {
  output: string;
  error?: string;
  stopped?: boolean;
}

export interface RunHandle {
  stop: () => void;
}

// Version pinned deliberately (not "latest") for reproducibility — verified
// against the real jsdelivr CDN that this exact path resolves to real JS
// (Pyodide's npm package layout puts pyodide.js at package root, not under
// a `full/` subdirectory like some older docs/examples suggest).
const PYODIDE_CDN_URL = 'https://cdn.jsdelivr.net/npm/pyodide@0.29.4/pyodide.js';

function startWorker(source: string, payload: unknown, onDone: (result: RunResult) => void, onStatus?: (status: string) => void): RunHandle {
  const blob = new Blob([source], { type: 'application/javascript' });
  const url = URL.createObjectURL(blob);
  const worker = new Worker(url);
  let finished = false;

  const finish = (result: RunResult) => {
    if (finished) return;
    finished = true;
    URL.revokeObjectURL(url);
    worker.terminate();
    onDone(result);
  };

  worker.onmessage = (e) => {
    const msg = e.data as { status?: string; ok?: boolean; output?: string; error?: string };
    if (msg.status && !msg.ok && msg.status !== 'done') {
      onStatus?.(msg.status);
      return;
    }
    finish(msg.ok ? { output: msg.output ?? '' } : { output: msg.output ?? '', error: msg.error ?? 'Unknown error' });
  };
  worker.onerror = (e) => {
    finish({ output: '', error: e.message || 'Worker error' });
  };

  worker.postMessage(payload);

  return {
    stop: () => finish({ output: '', stopped: true }),
  };
}

const JS_WORKER_SRC = `
self.onmessage = (e) => {
  const code = e.data;
  const logs = [];
  const push = (...args) => logs.push(args.map((a) => {
    try { return typeof a === 'string' ? a : JSON.stringify(a); }
    catch { return String(a); }
  }).join(' '));
  const console = { log: push, info: push, warn: push, error: push };
  try {
    const fn = new Function('console', code);
    fn(console);
    self.postMessage({ ok: true, output: logs.join('\\n') });
  } catch (err) {
    self.postMessage({ ok: false, output: logs.join('\\n'), error: err && err.message ? err.message : String(err) });
  }
};
`;

export function runJavaScript(code: string, onDone: (result: RunResult) => void): RunHandle {
  return startWorker(JS_WORKER_SRC, code, onDone);
}

function pythonWorkerSrc(cdnUrl: string): string {
  return `
self.onmessage = async (e) => {
  try {
    self.postMessage({ status: 'loading', ok: false });
    importScripts(${JSON.stringify(cdnUrl)});
    const pyodide = await loadPyodide();
    self.postMessage({ status: 'running', ok: false });
    let output = '';
    pyodide.setStdout({ batched: (s) => { output += s + '\\n'; } });
    pyodide.setStderr({ batched: (s) => { output += s + '\\n'; } });
    await pyodide.runPythonAsync(e.data);
    self.postMessage({ status: 'done', ok: true, output });
  } catch (err) {
    self.postMessage({ status: 'done', ok: false, output: '', error: err && err.message ? err.message : String(err) });
  }
};
`;
}

export function runPython(code: string, onDone: (result: RunResult) => void, onStatus?: (status: 'loading' | 'running') => void): RunHandle {
  return startWorker(pythonWorkerSrc(PYODIDE_CDN_URL), code, onDone, onStatus as (status: string) => void);
}
