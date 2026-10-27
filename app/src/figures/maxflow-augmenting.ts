// Chapter 12, graph-algorithms: Ford-Fulkerson Augmenting Path & Min-Cut Visualizer.
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
  cap: number;
}

const VERTICES: Vertex[] = [
  { id: 's', name: 's', x: 60, y: 130 },
  { id: 'a', name: 'A', x: 180, y: 60 },
  { id: 'b', name: 'B', x: 180, y: 200 },
  { id: 'c', name: 'C', x: 300, y: 60 },
  { id: 'd', name: 'D', x: 300, y: 200 },
  { id: 't', name: 'T', x: 420, y: 130 },
];

const EDGES: Edge[] = [
  { u: 's', v: 'a', cap: 10 },
  { u: 's', v: 'b', cap: 5 },
  { u: 'a', v: 'c', cap: 8 },
  { u: 'a', v: 'b', cap: 2 },
  { u: 'b', v: 'd', cap: 7 },
  { u: 'c', v: 't', cap: 7 },
  { u: 'c', v: 'd', cap: 3 },
  { u: 'd', v: 't', cap: 10 },
];

interface FlowStep {
  t: number;
  flow: Record<string, number>;
  path: string[];
  bottleneck: number;
  totalFlow: number;
  minCut: boolean;
  desc: string;
}

const STEPS: FlowStep[] = [
  {
    t: 0,
    flow: { 's-a': 0, 's-b': 0, 'a-c': 0, 'a-b': 0, 'b-d': 0, 'c-t': 0, 'c-d': 0, 'd-t': 0 },
    path: [],
    bottleneck: 0,
    totalFlow: 0,
    minCut: false,
    desc: 'Initial state: flow f = 0 on all edges. Total flow |f| = 0.',
  },
  {
    t: 1,
    flow: { 's-a': 5, 's-b': 0, 'a-c': 5, 'a-b': 0, 'b-d': 0, 'c-t': 5, 'c-d': 0, 'd-t': 0 },
    path: ['s', 'a', 'c', 't'],
    bottleneck: 5,
    totalFlow: 5,
    minCut: false,
    desc: 'Augmenting path s -> A -> C -> T with bottleneck capacity Δ = 5. |f| = 5.',
  },
  {
    t: 2,
    flow: { 's-a': 10, 's-b': 2, 'a-c': 8, 'a-b': 2, 'b-d': 2, 'c-t': 7, 'c-d': 3, 'd-t': 5 },
    path: ['s', 'a', 'b', 'd', 't'],
    bottleneck: 2,
    totalFlow: 7,
    minCut: false,
    desc: 'Augmenting path s -> A -> B -> D -> T with bottleneck Δ = 2. |f| = 7.',
  },
  {
    t: 3,
    flow: { 's-a': 10, 's-b': 5, 'a-c': 8, 'a-b': 2, 'b-d': 5, 'c-t': 7, 'c-d': 3, 'd-t': 8 },
    path: ['s', 'b', 'd', 't'],
    bottleneck: 3,
    totalFlow: 10,
    minCut: true,
    desc: 'Augmenting path s -> B -> D -> T with bottleneck Δ = 3. Maximum flow |f*| = 10 reached! Min s-t cut S = {s, A, B}, T = {C, D, T} with capacity 10.',
  },
];

const mount: Mount = (root) => {
  let tStep = 0;
  const maxStep = STEPS.length - 1;

  const view = responsiveSvg(root, {
    label: 'Ford-Fulkerson augmenting path and min s-t cut visualizer',
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
    txt.textContent = `0/${e.cap}`;
    return { u: e.u, v: e.v, cap: e.cap, uV, vV, line, txt };
  });

  const nodeElements = VERTICES.map((v) => {
    const g = s('g', {}, nodesG);
    const circle = s('circle', { cx: v.x, cy: v.y, r: 18, class: 'dot-dim' }, g);
    const txt = s('text', { x: v.x, y: v.y + 4, class: 'lbl-fg', 'text-anchor': 'middle' }, g);
    txt.textContent = v.name;
    return { id: v.id, v, circle, txt };
  });

  const hd = handle(svgEl, {
    label: 'Flow step timeline',
    x: 60,
    y: 240,
    valueText: () => `Step ${tStep}`,
    onDrag: (px) => {
      const stepWidth = (view.W - 120) / maxStep;
      const newT = Math.round(clamp((px - 60) / stepWidth, 0, maxStep));
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

    edgeElements.forEach((ee) => {
      const x1 = sx(ee.uV.x);
      const x2 = sx(ee.vV.x);
      const y1 = ee.uV.y;
      const y2 = ee.vV.y;
      ee.line.setAttribute('x1', String(x1));
      ee.line.setAttribute('x2', String(x2));
      const isVert = Math.abs(x1 - x2) < 4;
      const isBottom = (y1 + y2) / 2 > 140;
      ee.txt.setAttribute('x', String((x1 + x2) / 2 + (isVert ? 18 : 0)));
      ee.txt.setAttribute('y', String((y1 + y2) / 2 + (isVert ? 4 : isBottom ? 16 : -8)));
      const key = `${ee.u}-${ee.v}`;
      const fVal = st.flow[key] ?? 0;
      ee.txt.textContent = `${fVal}/${ee.cap}`;
      if (fVal > 0) {
        ee.line.setAttribute('class', 'curve-acc');
      } else {
        ee.line.setAttribute('class', 'edge');
      }
    });

    nodeElements.forEach((ne) => {
      const cx = sx(ne.v.x);
      ne.circle.setAttribute('cx', String(cx));
      ne.txt.setAttribute('x', String(cx));
      if (st.minCut && (ne.id === 's' || ne.id === 'a' || ne.id === 'b')) {
        ne.circle.setAttribute('class', 'dot-ring');
        ne.txt.setAttribute('class', 'lbl-acc');
      } else if (ne.id === 's' || ne.id === 't') {
        ne.circle.setAttribute('class', 'dot-ring');
        ne.txt.setAttribute('class', 'lbl-fg');
      } else {
        ne.circle.setAttribute('class', 'dot-dim');
        ne.txt.setAttribute('class', 'lbl-fg');
      }
    });

    const startX = sx(60);
    const endX = view.W - sx(60);
    const curX = lerp(startX, endX, tStep / maxStep);
    hd.move(curX, 240);

    const pathTex = st.path.length ? `\\quad P = (${st.path.map((p) => p.toUpperCase()).join(' \\to ')})` : '';
    const cutTex = st.minCut ? '\\quad |f^*| = c(S,T) = 10' : '';
    f.set(
      `\\text{Step } ${tStep}:\\quad |f| = ${st.totalFlow},\\quad \\Delta = ${st.bottleneck}${pathTex}${cutTex}`,
    );
  }

  view.onResize(() => {
    update();
  });
  update();
};

export default mount;
