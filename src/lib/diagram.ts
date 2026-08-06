/** Renders Learnex's own tiny node/edge diagram format (see DIAGRAM_INSTRUCTION
 * in ai-personas.ts) as a self-contained inline SVG string — no charting
 * library. Shared by StudyAssistant.astro (renders it inside a chat bubble)
 * and StudyCanvas.astro (renders the same spec as a non-destructive overlay
 * on the drawing pane), so the two surfaces never draw a diagram differently. */

export interface DiagramNode {
  id: string;
  label: string;
}

export interface DiagramEdge {
  from: string;
  to: string;
  label?: string;
}

export interface DiagramSpec {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const shortLabel = (s: string) => (s.length > 22 ? `${s.slice(0, 21)}…` : s);

/** Lays out nodes top-down by BFS depth from the first node (any node the
 * BFS never reaches gets appended as its own trailing row, so a malformed
 * edge list never silently drops a node), then draws boxes + arrows. Good
 * enough for the handful of nodes the AI is asked to sketch — not a general
 * graph-layout engine. */
export function renderDiagramSvg(spec: DiagramSpec): string {
  if (!spec || !Array.isArray(spec.nodes)) return '';

  const seenIds = new Set<string>();
  const nodes = spec.nodes
    .filter((n) => n && typeof n.id === 'string' && typeof n.label === 'string' && n.id && n.label)
    .filter((n) => (seenIds.has(n.id) ? false : (seenIds.add(n.id), true)))
    .slice(0, 12);
  if (nodes.length === 0) return '';

  const nodeIds = new Set(nodes.map((n) => n.id));
  const edges = (Array.isArray(spec.edges) ? spec.edges : [])
    .filter((e) => e && nodeIds.has(e.from) && nodeIds.has(e.to))
    .slice(0, 24);

  const adj = new Map<string, string[]>();
  nodes.forEach((n) => adj.set(n.id, []));
  edges.forEach((e) => adj.get(e.from)?.push(e.to));

  const depth = new Map<string, number>();
  depth.set(nodes[0].id, 0);
  const queue = [nodes[0].id];
  while (queue.length) {
    const id = queue.shift()!;
    for (const next of adj.get(id) ?? []) {
      if (!depth.has(next)) {
        depth.set(next, (depth.get(id) ?? 0) + 1);
        queue.push(next);
      }
    }
  }
  let maxDepth = Math.max(0, ...depth.values());
  for (const n of nodes) {
    if (!depth.has(n.id)) depth.set(n.id, ++maxDepth);
  }

  const rows = new Map<number, DiagramNode[]>();
  for (const n of nodes) {
    const d = depth.get(n.id)!;
    if (!rows.has(d)) rows.set(d, []);
    rows.get(d)!.push(n);
  }

  const ROW_H = 74;
  const COL_W = 168;
  const BOX_W = 140;
  const BOX_H = 40;
  const rowCount = maxDepth + 1;
  const maxCols = Math.max(...[...rows.values()].map((r) => r.length));
  const width = Math.max(maxCols * COL_W, 220);
  const height = rowCount * ROW_H + 20;

  const pos = new Map<string, { x: number; y: number }>();
  for (const [d, rowNodes] of rows) {
    const rowWidth = rowNodes.length * COL_W;
    const startX = (width - rowWidth) / 2 + COL_W / 2;
    rowNodes.forEach((n, i) => pos.set(n.id, { x: startX + i * COL_W, y: d * ROW_H + BOX_H / 2 + 10 }));
  }

  let svg = `<svg viewBox="0 0 ${width} ${height}" class="lx-diagram-svg" role="img" aria-label="Diagram">`;
  svg +=
    '<defs><marker id="lx-diagram-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L8,4 L0,8 z" class="lx-diagram-arrowhead" /></marker></defs>';

  for (const e of edges) {
    const a = pos.get(e.from)!;
    const b = pos.get(e.to)!;
    const sameRow = a.y === b.y;
    const x1 = a.x;
    const y1 = sameRow ? a.y : a.y + BOX_H / 2;
    const x2 = b.x;
    const y2 = sameRow ? b.y : b.y - BOX_H / 2;
    svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="lx-diagram-edge" marker-end="url(#lx-diagram-arrow)" />`;
    if (e.label) {
      svg += `<text x="${(x1 + x2) / 2}" y="${(y1 + y2) / 2 - 4}" text-anchor="middle" class="lx-diagram-edge-label">${escapeHtml(e.label)}</text>`;
    }
  }

  for (const n of nodes) {
    const p = pos.get(n.id)!;
    svg += `<rect x="${p.x - BOX_W / 2}" y="${p.y - BOX_H / 2}" width="${BOX_W}" height="${BOX_H}" rx="6" class="lx-diagram-node" />`;
    svg += `<text x="${p.x}" y="${p.y + 4}" text-anchor="middle" class="lx-diagram-label">${escapeHtml(shortLabel(n.label))}<title>${escapeHtml(n.label)}</title></text>`;
  }
  svg += '</svg>';
  return svg;
}
