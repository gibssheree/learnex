/** Shared pointer/brush engine behind the annotate toolbar — used both by
 * the overlay-on-content annotations (AnnotationCanvas.astro) and the
 * full-screen Study Canvas's blank drawing pane. Each caller owns its own
 * canvas, toolbar and storage key; this just wires pointer input to strokes
 * and strokes to the toolbar controls. */

import { loadStrokes, saveStrokes, type Stroke, type StrokePoint } from './annotations-db';

export interface AnnotationToolkitOptions {
  canvas: HTMLCanvasElement;
  toolbar: HTMLElement;
  /** Defines the coordinate space and size strokes are drawn/scaled into. */
  root: HTMLElement;
  /** IndexedDB key strokes are loaded from / saved to. */
  storageKey: string;
  /** Whether the canvas is allowed to receive pointer input right now
   * (e.g. AnnotationCanvas gates this on the global iPad-mode toggle; the
   * Study Canvas is always active since its own visibility is the gate). */
  getActive: () => boolean;
}

export interface AnnotationToolkit {
  resize: () => void;
}

type DrawTool = 'pen' | 'pencil' | 'highlighter';

export function attachAnnotationToolkit(opts: AnnotationToolkitOptions): AnnotationToolkit {
  const { canvas, toolbar, root, storageKey, getActive } = opts;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('annotation-toolkit: canvas 2D context unavailable');
  const htmlRoot = document.documentElement;

  let strokes: Stroke[] = [];
  let tool: 'view' | DrawTool | 'eraser' = 'view';
  let color = 'var(--accent)';
  let brushSize = 3;
  const ERASER_RADIUS = 14;

  function isActive(): boolean {
    return getActive() && tool !== 'view';
  }

  function syncInteractivity() {
    canvas.style.pointerEvents = isActive() ? 'auto' : 'none';
    canvas.style.cursor = tool === 'eraser' ? 'cell' : tool === 'view' ? 'default' : 'crosshair';
  }

  function resolveColor(input: string): string {
    // Preset swatches pass a var(--token) expression so strokes keep their
    // ink color if the reader later flips the light/dark theme; the custom
    // color picker passes a literal hex, which needs no resolving.
    if (!input.startsWith('var(')) return input;
    return getComputedStyle(htmlRoot).getPropertyValue(input.slice(4, -1)).trim() || '#8a1526';
  }

  let dpr = 1;
  function resize() {
    const rect = root.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(rect.width, 1) * dpr;
    canvas.height = Math.max(rect.height, 1) * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    redraw();
  }

  // Strokes from before pencil/highlighter existed have no `tool` saved —
  // treat those as plain pen strokes rather than special-casing them.
  function drawStroke(s: Stroke) {
    if (s.points.length < 2) return;
    const strokeTool = s.tool ?? 'pen';
    ctx!.save();
    ctx!.strokeStyle = s.color;
    ctx!.lineCap = 'round';
    ctx!.lineJoin = 'round';
    if (strokeTool === 'highlighter') {
      // Flat, translucent, multiply-blended so it reads as a marker swipe
      // sitting behind the ink rather than another pen stroke on top.
      ctx!.globalAlpha = 0.35;
      ctx!.globalCompositeOperation = 'multiply';
    } else if (strokeTool === 'pencil') {
      ctx!.globalAlpha = 0.75;
    }
    ctx!.beginPath();
    ctx!.moveTo(s.points[0].x, s.points[0].y);
    for (let i = 1; i < s.points.length; i++) {
      const p = s.points[i];
      if (strokeTool === 'highlighter') {
        ctx!.lineWidth = s.width * 3;
      } else if (strokeTool === 'pencil') {
        ctx!.lineWidth = s.width * 0.6 * (0.5 + p.pressure);
      } else {
        ctx!.lineWidth = s.width * (0.5 + p.pressure);
      }
      ctx!.lineTo(p.x, p.y);
    }
    ctx!.stroke();
    ctx!.restore();
  }

  function redraw() {
    ctx!.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    for (const s of strokes) drawStroke(s);
  }

  let saveTimer: number | undefined;
  function scheduleSave() {
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => saveStrokes(storageKey, strokes), 400);
  }

  // ---------- Pointer input (Pencil / touch / mouse, unified) ----------
  let current: Stroke | null = null;

  function pointToLocal(e: PointerEvent): StrokePoint {
    const rect = root.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top, pressure: e.pressure || 0.5 };
  }

  function eraseAt(p: StrokePoint) {
    const before = strokes.length;
    strokes = strokes.filter((s) => !s.points.some((sp) => Math.hypot(sp.x - p.x, sp.y - p.y) < ERASER_RADIUS));
    if (strokes.length !== before) redraw();
  }

  canvas.addEventListener('pointerdown', (e) => {
    if (tool === 'view') return;
    canvas.setPointerCapture(e.pointerId);
    const p = pointToLocal(e);
    if (tool === 'eraser') {
      eraseAt(p);
    } else {
      current = { points: [p], color: resolveColor(color), width: brushSize, tool };
    }
    e.preventDefault();
  });

  canvas.addEventListener('pointermove', (e) => {
    if (tool === 'view' || e.buttons === 0) return;
    const p = pointToLocal(e);
    if (tool === 'eraser') {
      eraseAt(p);
    } else if (current) {
      current.points.push(p);
      redraw();
      drawStroke(current);
    }
  });

  function endStroke(e: PointerEvent) {
    if (current) {
      strokes.push(current);
      current = null;
      scheduleSave();
    } else if (tool === 'eraser') {
      scheduleSave();
    }
    canvas.releasePointerCapture?.(e.pointerId);
  }
  canvas.addEventListener('pointerup', endStroke);
  canvas.addEventListener('pointercancel', endStroke);

  // ---------- Toolbar ----------
  toolbar.querySelectorAll<HTMLButtonElement>('.annotate-tool[data-tool]').forEach((btn) => {
    btn.addEventListener('click', () => {
      tool = btn.dataset.tool as typeof tool;
      toolbar.querySelectorAll('.annotate-tool[data-tool]').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      syncInteractivity();
    });
  });

  toolbar.querySelectorAll<HTMLButtonElement>('.annotate-color').forEach((btn) => {
    btn.style.background = btn.dataset.color ?? '';
    btn.addEventListener('click', () => {
      color = btn.dataset.color ?? color;
      toolbar.querySelectorAll('.annotate-color').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    });
  });

  const colorPicker = toolbar.querySelector<HTMLInputElement>('.annotate-color-picker');
  colorPicker?.addEventListener('input', () => {
    color = colorPicker.value;
    // A custom color replaces whichever preset swatch was active.
    toolbar.querySelectorAll('.annotate-color').forEach((b) => b.setAttribute('aria-pressed', 'false'));
  });

  const sizeInput = toolbar.querySelector<HTMLInputElement>('.annotate-size');
  sizeInput?.addEventListener('input', () => {
    brushSize = Number(sizeInput.value) || brushSize;
  });

  toolbar.querySelector('.annotate-undo-btn')?.addEventListener('click', () => {
    if (strokes.length === 0) return;
    strokes.pop();
    redraw();
    scheduleSave();
  });

  toolbar.querySelector('.annotate-clear-btn')?.addEventListener('click', () => {
    if (strokes.length === 0) return;
    if (!confirm('Clear all annotations on this note?')) return;
    strokes = [];
    redraw();
    scheduleSave();
  });

  // ---------- iPad mode reacting live (no reload needed) ----------
  document.addEventListener('learnex:ipad-mode-changed', () => {
    syncInteractivity();
    if (getActive()) resize();
  });

  window.addEventListener('resize', () => {
    if (getActive()) resize();
  });

  (async function init() {
    strokes = await loadStrokes(storageKey);
    syncInteractivity();
    if (getActive()) resize();
  })();

  return { resize };
}
