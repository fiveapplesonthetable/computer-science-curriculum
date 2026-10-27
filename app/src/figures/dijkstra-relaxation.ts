// Chapter 7, graph-algorithms: Dijkstra Shortest Path Priority Queue & Relaxation Stepper.
// Default-export mount(root). Uses responsiveSvg, handle, formula, row, slider, button, and SVG theme classes.

import { responsiveSvg, s, handle, row, slider, button, formula, clamp, lerp, type Mount } from './lib';

interface Vertex {
  id: string;
  name: string;
  x: number;
  y: number;
}

interface Edge {
  u: string;
  v: string;
  w: number;
}

const VERTICES: Vertex[] = [
  { id: 's', name: 's', x: 80, y: 130 },
  { id: 'a', name: 'A', x: 200, y: 60 },
  { id: 'b', name: 'B', x: 200, y: 200 },
  { id: 'c', name: 'C', x: 320, y: 60 },
  { id: 'd', name: 'D', x: 320, y: 200 },
  { id: 't', name: 'T', x: 440, y: 130 },
];

const EDGES: Edge[] = [
  { u: 's', v: 'a', w: 4 },
  { u: 's', v: 'b', w: 2 },
  { u: 'a', v: 'c', w: 5 },
  { u: 'b', v: 'a', w: 1 },
  { u: 'b', v: 'd', w: 8 },
  { u: 'c', v: 't', w: 3 },
  { u: 'd', v: 't', w: 1 },
  { u: 'c', v: 'd', w: 2 },
];

interface DijkstraStep {
  t: number;
  u: string;
  d: Record<string, number>;
  settled: Set<string>;
  relaxEdge?: string;
  desc: string;
}

const STEPS: DijkstraStep[] = [
  {
    t: 0,
    u: 's',
    d: { s: 0, a: Infinity, b: Infinity, c: Infinity, d: Infinity, t: Infinity },
    settled: new Set(),
    desc: 'Initialize: d[s] = 0, all other d[v] = ∞. Priority queue Q = {s, A, B, C, D, T}.',
  },
  {
    t: 1,
    u: 's',
    d: { s: 0, a: 4, b: 2, c: Infinity, d: Infinity, t: Infinity },
    settled: new Set(['s']),
    relaxEdge: 's-b',
    desc: 'Extract min s (d=0). Relax (s,A) -> d[A]=4, (s,B) -> d[B]=2.',
  },
  {
    t: 2,
    u: 'b',
    d: { s: 0, a: 3, b: 2, c: Infinity, d: 10, t: Infinity },
    settled: new Set(['s', 'b']),
    relaxEdge: 'b-a',
    desc: 'Extract min B (d=2). Relax (B,A): 2+1=3 < 4 (updates d[A]), (B,D): 2+8=10.',
  },
  {
    t: 3,
    u: 'a',
    d: { s: 0, a: 3, b: 2, c: 8, d: 10, t: Infinity },
    settled: new Set(['s', 'b', 'a']),
    relaxEdge: 'a-c',
    desc: 'Extract min A (d=3). Relax (A,C): 3+5=8 (updates d[C]).',
  },
  {
    t: 4,
    u: 'c',
    d: { s: 0, a: 3, b: 2, c: 8, d: 10, t: 11 },
    settled: new Set(['s', 'b', 'a', 'c']),
    relaxEdge: 'c-t',
    desc: 'Extract min C (d=8). Relax (C,T): 8+3=11 (updates d[T]), (C,D): 8+2=10.',
  },
  {
    t: 5,
    u: 'd',
    d: { s: 0, a: 3, b: 2, c: 8, d: 10, t: 11 },
    settled: new Set(['s', 'b', 'a', 'c', 'd']),
    relaxEdge: 'd-t',
    desc: 'Extract min D (d=10). Relax (D,T): 10+1=11 (no improvement).',
  },
  {
    t: 6,
    u: 't',
    d: { s: 0, a: 3, b: 2, c: 8, d: 10, t: 11 },
    settled: new Set(['s', 'b', 'a', 'c', 'd', 't']),
    desc: 'Extract min T. Shortest path tree complete! d[T] = 11.',
  },
];

const mount: Mount = (root) => {
  let tStep = 0;
  const maxStep = STEPS.length - 1;

  const view = responsiveSvg(root, {
    label: 'Dijkstra shortest-path priority-queue and edge relaxation visualizer',
    aspect: 0.52,
    minH: 260,
    maxH: 350,
  });
  const svgEl = view.el;

  const edgesG = s('g', {}, svgEl);
  const nodesG = s('g', {}, svgEl);

  const edgeElements = EDGES.map((e) => {
    const uV = VERTICES.find((v) => v.id === e.u)!;
    const vV = VERTICES.find((v) => v.id === e.v)!;
    const line = s('line', { x1: uV.x, y1: uV.y, x2: vV.x, y2: vV.y, class: 'edge' }, edgesG);
    const mx = (uV.x + vV.x) / 2;
    const my = (uV.y + vV.y) / 2;
    const txt = s('text', { x: mx, y: my - 6, class: 'lbl', 'text-anchor': 'middle' }, edgesG);
    txt.textContent = `${e.w}`;
    return { u: e.u, v: e.v, w: e.w, uV, vV, line, txt };
  });

  const nodeElements = VERTICES.map((v) => {
    const g = s('g', {}, nodesG);
    const circle = s('circle', { cx: v.x, cy: v.y, r: 18, class: 'dot-dim' }, g);
    const txt = s('text', { x: v.x, y: v.y + 4, class: 'lbl-fg', 'text-anchor': 'middle' }, g);
    txt.textContent = v.name;
    const distLbl = s('text', { x: v.x, y: v.y - 24, class: 'lbl-acc', 'text-anchor': 'middle' }, g);
    distLbl.textContent = '∞';
    return { id: v.id, v, circle, txt, distLbl };
  });

  const hd = handle(svgEl, {
    label: 'Dijkstra step timeline',
    x: 80,
    y: 240,
    valueText: () => `Step ${tStep}`,
    onDrag: (px) => {
      const stepWidth = (view.W - 160) / maxStep;
      const newT = Math.round(clamp((px - 80) / stepWidth, 0, maxStep));
      if (newT !== tStep) {
        tStep = newT;
        sl.set(tStep);
        update();
      }
    },
    onKey: (dx) => {
      tStep = clamp(tStep + dx, 0, maxStep);
      sl.set(tStep);
      update();
    },
  });

  const f = formula(root);
  const r = row(root);

  button(r, 'Reset', () => {
    tStep = 0;
    sl.set(0);
    update();
  });

  const sl = slider(r, {
    label: 'Step',
    min: 0,
    max: maxStep,
    step: 1,
    value: 0,
    onInput: (v) => {
      tStep = v;
      update();
    },
  });

  function update() {
    const st = STEPS[tStep] || STEPS[0];
    const sx = (x: number) => (x / 480) * view.W;

    nodeElements.forEach((ne) => {
      const cx = sx(ne.v.x);
      ne.circle.setAttribute('cx', String(cx));
      ne.txt.setAttribute('x', String(cx));
      ne.distLbl.setAttribute('x', String(cx));
      // Place distance label below bottom-row nodes (B, D) and above top/mid nodes so vertical edges never collide
      const distY = ne.v.y >= 190 ? ne.v.y + 32 : ne.v.y - 24;
      ne.distLbl.setAttribute('y', String(distY));
      const dist = st.d[ne.id];
      ne.distLbl.textContent = dist === Infinity ? '∞' : `${dist}`;
      if (ne.id === st.u && tStep > 0) {
        ne.circle.setAttribute('class', 'dot-ring');
        ne.txt.setAttribute('class', 'lbl-acc');
      } else if (st.settled.has(ne.id)) {
        ne.circle.setAttribute('class', 'dot-ring');
        ne.txt.setAttribute('class', 'lbl-fg');
      } else {
        ne.circle.setAttribute('class', 'dot-dim');
        ne.txt.setAttribute('class', 'lbl-fg');
      }
    });

    edgeElements.forEach((ee) => {
      const x1 = sx(ee.uV.x);
      const x2 = sx(ee.vV.x);
      const y1 = ee.uV.y;
      const y2 = ee.vV.y;
      ee.line.setAttribute('x1', String(x1));
      ee.line.setAttribute('x2', String(x2));
      const isVert = Math.abs(x1 - x2) < 4;
      const isBottom = (y1 + y2) / 2 > 140;
      ee.txt.setAttribute('x', String((x1 + x2) / 2 + (isVert ? 12 : 0)));
      ee.txt.setAttribute('y', String((y1 + y2) / 2 + (isVert ? 4 : isBottom ? 15 : -8)));
      const key = `${ee.u}-${ee.v}`;
      if (st.relaxEdge === key) {
        ee.line.setAttribute('class', 'curve-acc');
      } else {
        ee.line.setAttribute('class', 'edge');
      }
    });

    const startX = sx(60);
    const endX = view.W - sx(60);
    const curX = lerp(startX, endX, tStep / maxStep);
    hd.move(curX, 240);

    const dT = st.d.t === Infinity ? '\\infty' : String(st.d.t);
    f.set(
      `u=\\text{${st.u.toUpperCase()}},\\ d(A)=${st.d.a === Infinity ? '\\infty' : st.d.a},\\ d(T)=${dT}`,
    );
  }

  view.onResize(() => {
    update();
  });
  update();
};

export default mount;
