// Chapter 6, graph-algorithms: Minimum Spanning Tree Cut Property & Kruskal Edge Stepper.
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
  { id: 'a', name: 'A', x: 100, y: 80 },
  { id: 'b', name: 'B', x: 240, y: 60 },
  { id: 'c', name: 'C', x: 380, y: 90 },
  { id: 'd', name: 'D', x: 120, y: 200 },
  { id: 'e', name: 'E', x: 260, y: 210 },
  { id: 'f', name: 'F', x: 400, y: 200 },
];

const EDGES: Edge[] = [
  { u: 'a', v: 'b', w: 2 },
  { u: 'b', v: 'c', w: 3 },
  { u: 'a', v: 'd', w: 4 },
  { u: 'b', v: 'e', w: 1 },
  { u: 'c', v: 'f', w: 5 },
  { u: 'd', v: 'e', w: 3 },
  { u: 'e', v: 'f', w: 2 },
  { u: 'b', v: 'd', w: 2 }, // cycle forming / alternative
];

interface KruskalStep {
  t: number;
  edgeIdx: number;
  action: 'safe' | 'rejected' | 'accepted';
  mstEdges: string[];
  cutVertices: string[];
  desc: string;
}

const STEPS: KruskalStep[] = [
  {
    t: 0,
    edgeIdx: -1,
    action: 'safe',
    mstEdges: [],
    cutVertices: ['a', 'd'],
    desc: 'Initialize Kruskal: sort edges by weight. Consider cut S = {A, D}.',
  },
  {
    t: 1,
    edgeIdx: 3, // b-e (w=1)
    action: 'accepted',
    mstEdges: ['b-e'],
    cutVertices: ['b', 'e'],
    desc: 'Lightest edge (B,E) with w=1 is added to MST (safe by cut property).',
  },
  {
    t: 2,
    edgeIdx: 0, // a-b (w=2)
    action: 'accepted',
    mstEdges: ['b-e', 'a-b'],
    cutVertices: ['a', 'b'],
    desc: 'Next lightest edge (A,B) with w=2 added to MST.',
  },
  {
    t: 3,
    edgeIdx: 6, // e-f (w=2)
    action: 'accepted',
    mstEdges: ['b-e', 'a-b', 'e-f'],
    cutVertices: ['e', 'f'],
    desc: 'Edge (E,F) with w=2 added to MST.',
  },
  {
    t: 4,
    edgeIdx: 7, // b-d (w=2)
    action: 'rejected',
    mstEdges: ['b-e', 'a-b', 'e-f'],
    cutVertices: ['b', 'd'],
    desc: 'Edge (B,D) with w=2 creates a cycle {A,B,E,D}; rejected.',
  },
  {
    t: 5,
    edgeIdx: 1, // b-c (w=3)
    action: 'accepted',
    mstEdges: ['b-e', 'a-b', 'e-f', 'b-c'],
    cutVertices: ['b', 'c'],
    desc: 'Edge (B,C) with w=3 added to MST. Total weight = 8.',
  },
];

const mount: Mount = (root) => {
  let tStep = 0;
  const maxStep = STEPS.length - 1;

  const view = responsiveSvg(root, {
    label: 'Minimum Spanning Tree cut property and Kruskal edge stepper',
    aspect: 0.52,
    minH: 260,
    maxH: 350,
  });
  const svgEl = view.el;

  const cutBand = s('ellipse', { class: 'band', rx: 90, ry: 60, cx: 180, cy: 135 }, svgEl);
  const edgesG = s('g', {}, svgEl);
  const nodesG = s('g', {}, svgEl);

  const edgeElements = EDGES.map((e, idx) => {
    const uV = VERTICES.find((v) => v.id === e.u)!;
    const vV = VERTICES.find((v) => v.id === e.v)!;
    const line = s('line', { x1: uV.x, y1: uV.y, x2: vV.x, y2: vV.y, class: 'edge' }, edgesG);
    const mx = (uV.x + vV.x) / 2;
    const my = (uV.y + vV.y) / 2;
    const txt = s('text', { x: mx, y: my - 6, class: 'lbl', 'text-anchor': 'middle' }, edgesG);
    txt.textContent = `${e.w}`;
    return { idx, u: e.u, v: e.v, w: e.w, uV, vV, line, txt };
  });

  const nodeElements = VERTICES.map((v) => {
    const g = s('g', {}, nodesG);
    const circle = s('circle', { cx: v.x, cy: v.y, r: 18, class: 'dot' }, g);
    const txt = s('text', { x: v.x, y: v.y + 5, class: 'lbl-fg', 'text-anchor': 'middle' }, g);
    txt.textContent = v.name;
    return { id: v.id, v, circle, txt };
  });

  const hd = handle(svgEl, {
    label: 'Kruskal step timeline',
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

    cutBand.setAttribute('cx', String(sx(180)));
    cutBand.setAttribute('rx', String(sx(90)));

    const mstSet = new Set(st.mstEdges);
    edgeElements.forEach((ee) => {
      const x1 = sx(ee.uV.x);
      const x2 = sx(ee.vV.x);
      const y1 = ee.uV.y;
      const y2 = ee.vV.y;
      ee.line.setAttribute('x1', String(x1));
      ee.line.setAttribute('x2', String(x2));
      const dx = x2 - x1;
      const dy = y2 - y1;
      const len = Math.hypot(dx, dy) || 1;
      // Offset weight label perpendicular to the edge so it never sits on the line
      const nx = (-dy / len) * 12;
      const ny = (dx / len) * 12;
      ee.txt.setAttribute('x', String((x1 + x2) / 2 + nx));
      ee.txt.setAttribute('y', String((y1 + y2) / 2 + ny + 4));
      const key1 = `${ee.u}-${ee.v}`;
      const key2 = `${ee.v}-${ee.u}`;
      if (mstSet.has(key1) || mstSet.has(key2)) {
        ee.line.setAttribute('class', 'curve-acc');
      } else if (ee.idx === st.edgeIdx) {
        ee.line.setAttribute('class', st.action === 'rejected' ? 'line-muted' : 'curve-acc');
      } else {
        ee.line.setAttribute('class', 'edge');
      }
    });

    nodeElements.forEach((ne) => {
      const cx = sx(ne.v.x);
      ne.circle.setAttribute('cx', String(cx));
      ne.txt.setAttribute('x', String(cx));
      if (st.cutVertices.includes(ne.id)) {
        ne.circle.setAttribute('class', 'dot-ring');
        ne.txt.setAttribute('class', 'lbl-acc');
      } else {
        ne.circle.setAttribute('class', 'dot-dim');
        ne.txt.setAttribute('class', 'lbl-fg');
      }
    });

    const startX = sx(60);
    const endX = view.W - sx(60);
    const curX = lerp(startX, endX, tStep / maxStep);
    hd.move(curX, 240);

    const currentEdge = st.edgeIdx >= 0 ? EDGES[st.edgeIdx] : null;
    const edgeDesc = currentEdge ? `(${currentEdge.u.toUpperCase()},${currentEdge.v.toUpperCase()})\\ w=${currentEdge.w}` : '\\text{Start}';
    const totalW = st.mstEdges.reduce((acc, key) => {
      const [u, v] = key.split('-');
      const ed = EDGES.find((e) => (e.u === u && e.v === v) || (e.u === v && e.v === u));
      return acc + (ed ? ed.w : 0);
    }, 0);
    void cutBand;

    f.set(
      `\\text{Step } ${tStep}:\\ ${edgeDesc}\\ (\\text{${st.action}}),\\ W(\\text{MST}) = ${totalW}`,
    );
  }

  view.onResize(() => {
    update();
  });
  update();
};

export default mount;
