// Chapter 2, graph-algorithms: BFS frontier/layered wave vs DFS traversal.
// Default-export mount(root). Uses responsiveSvg, handle, formula, row, slider, button, and SVG theme classes.

import { responsiveSvg, s, handle, row, slider, button, formula, note, label, clamp, lerp, type Mount } from './lib';

interface Vertex {
  id: string;
  name: string;
  x: number;
  y: number;
}

interface Edge {
  u: string;
  v: string;
}

const VERTICES: Vertex[] = [
  { id: 's', name: 's', x: 80, y: 130 },
  { id: 'a', name: 'A', x: 160, y: 70 },
  { id: 'b', name: 'B', x: 160, y: 190 },
  { id: 'c', name: 'C', x: 260, y: 70 },
  { id: 'd', name: 'D', x: 260, y: 190 },
  { id: 'e', name: 'E', x: 360, y: 130 },
  { id: 'f', name: 'F', x: 440, y: 130 },
];

const EDGES: Edge[] = [
  { u: 's', v: 'a' },
  { u: 's', v: 'b' },
  { u: 'a', v: 'c' },
  { u: 'b', v: 'd' },
  { u: 'c', v: 'e' },
  { u: 'd', v: 'e' },
  { u: 'e', v: 'f' },
  { u: 'a', v: 'b' }, // cross edge
  { u: 'c', v: 'd' }, // cross edge
];

interface StepState {
  t: number;
  visited: Set<string>;
  frontier: Set<string>;
  settled: Set<string>;
  treeEdges: Set<string>;
  current: string;
  queueOrStack: string[];
  desc: string;
}

const BFS_STEPS: StepState[] = [
  {
    t: 0,
    visited: new Set(['s']),
    frontier: new Set(['s']),
    settled: new Set(),
    treeEdges: new Set(),
    current: 's',
    queueOrStack: ['s (d=0)'],
    desc: 'Initialize: Q = [s], d[s] = 0.',
  },
  {
    t: 1,
    visited: new Set(['s', 'a', 'b']),
    frontier: new Set(['a', 'b']),
    settled: new Set(['s']),
    treeEdges: new Set(['s-a', 's-b']),
    current: 'a',
    queueOrStack: ['a (d=1)', 'b (d=1)'],
    desc: 'Dequeue s, explore neighbors A and B (d=1). Q = [A, B].',
  },
  {
    t: 2,
    visited: new Set(['s', 'a', 'b', 'c', 'd']),
    frontier: new Set(['c', 'd']),
    settled: new Set(['s', 'a']),
    treeEdges: new Set(['s-a', 's-b', 'a-c']),
    current: 'b',
    queueOrStack: ['b (d=1)', 'c (d=2)', 'd (d=2)'],
    desc: 'Dequeue A, explore neighbor C (d=2). Q = [B, C, D].',
  },
  {
    t: 3,
    visited: new Set(['s', 'a', 'b', 'c', 'd']),
    frontier: new Set(['c', 'd']),
    settled: new Set(['s', 'a', 'b']),
    treeEdges: new Set(['s-a', 's-b', 'a-c', 'b-d']),
    current: 'c',
    queueOrStack: ['c (d=2)', 'd (d=2)'],
    desc: 'Dequeue B, explore neighbor D (d=2). Q = [C, D].',
  },
  {
    t: 4,
    visited: new Set(['s', 'a', 'b', 'c', 'd', 'e']),
    frontier: new Set(['e']),
    settled: new Set(['s', 'a', 'b', 'c']),
    treeEdges: new Set(['s-a', 's-b', 'a-c', 'b-d', 'c-e']),
    current: 'd',
    queueOrStack: ['d (d=2)', 'e (d=3)'],
    desc: 'Dequeue C, explore neighbor E (d=3). Q = [D, E].',
  },
  {
    t: 5,
    visited: new Set(['s', 'a', 'b', 'c', 'd', 'e']),
    frontier: new Set(['e']),
    settled: new Set(['s', 'a', 'b', 'c', 'd']),
    treeEdges: new Set(['s-a', 's-b', 'a-c', 'b-d', 'c-e']),
    current: 'e',
    queueOrStack: ['e (d=3)'],
    desc: 'Dequeue D (E already discovered via C). Q = [E].',
  },
  {
    t: 6,
    visited: new Set(['s', 'a', 'b', 'c', 'd', 'e', 'f']),
    frontier: new Set(['f']),
    settled: new Set(['s', 'a', 'b', 'c', 'd', 'e']),
    treeEdges: new Set(['s-a', 's-b', 'a-c', 'b-d', 'c-e', 'e-f']),
    current: 'f',
    queueOrStack: ['f (d=4)'],
    desc: 'Dequeue E, explore neighbor F (d=4). Q = [F].',
  },
  {
    t: 7,
    visited: new Set(['s', 'a', 'b', 'c', 'd', 'e', 'f']),
    frontier: new Set(),
    settled: new Set(['s', 'a', 'b', 'c', 'd', 'e', 'f']),
    treeEdges: new Set(['s-a', 's-b', 'a-c', 'b-d', 'c-e', 'e-f']),
    current: '',
    queueOrStack: [],
    desc: 'Dequeue F. Queue empty. BFS traversal complete!',
  },
];

const DFS_STEPS: StepState[] = [
  {
    t: 0,
    visited: new Set(['s']),
    frontier: new Set(['s']),
    settled: new Set(),
    treeEdges: new Set(),
    current: 's',
    queueOrStack: ['s'],
    desc: 'DFS Start: Stack S = [s]. Discover s.',
  },
  {
    t: 1,
    visited: new Set(['s', 'a']),
    frontier: new Set(['a']),
    settled: new Set(),
    treeEdges: new Set(['s-a']),
    current: 'a',
    queueOrStack: ['a', 'b'],
    desc: 'Push A onto stack. Tree edge (s, A). Stack = [s, a].',
  },
  {
    t: 2,
    visited: new Set(['s', 'a', 'c']),
    frontier: new Set(['c']),
    settled: new Set(),
    treeEdges: new Set(['s-a', 'a-c']),
    current: 'c',
    queueOrStack: ['c', 'b'],
    desc: 'Push C onto stack. Tree edge (A, C). Stack = [s, a, c].',
  },
  {
    t: 3,
    visited: new Set(['s', 'a', 'c', 'e']),
    frontier: new Set(['e']),
    settled: new Set(),
    treeEdges: new Set(['s-a', 'a-c', 'c-e']),
    current: 'e',
    queueOrStack: ['e', 'd', 'b'],
    desc: 'Push E onto stack. Tree edge (C, E). Stack = [s, a, c, e].',
  },
  {
    t: 4,
    visited: new Set(['s', 'a', 'c', 'e', 'f']),
    frontier: new Set(['f']),
    settled: new Set(),
    treeEdges: new Set(['s-a', 'a-c', 'c-e', 'e-f']),
    current: 'f',
    queueOrStack: ['f', 'd', 'b'],
    desc: 'Push F onto stack. Tree edge (E, F). Stack = [s, a, c, e, f].',
  },
  {
    t: 5,
    visited: new Set(['s', 'a', 'c', 'e', 'f']),
    frontier: new Set(['e']),
    settled: new Set(['f']),
    treeEdges: new Set(['s-a', 'a-c', 'c-e', 'e-f']),
    current: 'e',
    queueOrStack: ['e', 'd', 'b'],
    desc: 'F finishes (no unvisited neighbors). Backtrack to E.',
  },
  {
    t: 6,
    visited: new Set(['s', 'a', 'c', 'e', 'f', 'd']),
    frontier: new Set(['d']),
    settled: new Set(['f', 'e']),
    treeEdges: new Set(['s-a', 'a-c', 'c-e', 'e-f', 'c-d']),
    current: 'd',
    queueOrStack: ['d', 'b'],
    desc: 'From E, explore unvisited D. Tree edge (C, D). Stack = [s, a, c, d].',
  },
  {
    t: 7,
    visited: new Set(['s', 'a', 'c', 'e', 'f', 'd', 'b']),
    frontier: new Set(['b']),
    settled: new Set(['f', 'e', 'd']),
    treeEdges: new Set(['s-a', 'a-c', 'c-e', 'e-f', 'c-d', 'b']),
    current: 'b',
    queueOrStack: ['b'],
    desc: 'Complete remaining branch through B to S. DFS traversal complete!',
  },
];

const mount: Mount = (root) => {
  let mode: 'bfs' | 'dfs' = 'bfs';
  let tStep = 0;
  const maxStep = 7;

  const view = responsiveSvg(root, {
    label: 'Interactive BFS layered wave versus DFS depth-first traversal visualizer',
    aspect: 0.52,
    minH: 260,
    maxH: 350,
  });
  const svgEl = view.el;

  const bgG = s('g', {}, svgEl);
  const edgesG = s('g', {}, svgEl);
  const nodesG = s('g', {}, svgEl);

  const edgeElements = EDGES.map((e) => {
    const uV = VERTICES.find((v) => v.id === e.u)!;
    const vV = VERTICES.find((v) => v.id === e.v)!;
    const line = s('line', { x1: uV.x, y1: uV.y, x2: vV.x, y2: vV.y, class: 'edge' }, edgesG);
    return { u: e.u, v: e.v, uV, vV, line };
  });

  const nodeElements = VERTICES.map((v) => {
    const g = s('g', {}, nodesG);
    const circle = s('circle', { cx: v.x, cy: v.y, r: 18, class: 'dot-dim' }, g);
    const txt = s('text', { x: v.x, y: v.y + 5, class: 'lbl-fg', 'text-anchor': 'middle' }, g);
    txt.textContent = v.name;
    return { id: v.name.toLowerCase(), v, circle, txt };
  });

  const hd = handle(svgEl, {
    label: 'Traversal step timeline',
    x: 80,
    y: 220,
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
  const nBox = note(root);
  const r = row(root);

  const bfsBtn = button(r, 'BFS (Layered Wave)', () => {
    mode = 'bfs';
    bfsBtn.setAttribute('aria-pressed', 'true');
    dfsBtn.setAttribute('aria-pressed', 'false');
    update();
  });
  bfsBtn.setAttribute('aria-pressed', 'true');

  const dfsBtn = button(r, 'DFS (Depth-First)', () => {
    mode = 'dfs';
    dfsBtn.setAttribute('aria-pressed', 'true');
    bfsBtn.setAttribute('aria-pressed', 'false');
    update();
  });

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
    const steps = mode === 'bfs' ? BFS_STEPS : DFS_STEPS;
    const st = steps[tStep] || steps[0];
    const sx = (x: number) => (x / 480) * view.W;

    nodeElements.forEach((ne) => {
      const cx = sx(ne.v.x);
      ne.circle.setAttribute('cx', String(cx));
      ne.txt.setAttribute('x', String(cx));
      const id = ne.id;
      const isVisited = st.visited.has(id);
      const isFrontier = st.frontier.has(id);
      const isSettled = st.settled.has(id);
      const isCurrent = st.current === id;

      if (isCurrent) {
        ne.circle.setAttribute('class', 'dot-ring');
        ne.txt.setAttribute('class', 'lbl-acc');
      } else if (isSettled) {
        ne.circle.setAttribute('class', 'dot-dim');
        ne.txt.setAttribute('class', 'lbl-fg');
      } else if (isFrontier || isVisited) {
        ne.circle.setAttribute('class', 'dot-ring');
        ne.txt.setAttribute('class', 'lbl-fg');
      } else {
        ne.circle.setAttribute('class', 'dot-dim');
        ne.txt.setAttribute('class', 'lbl');
      }
    });

    edgeElements.forEach((ee) => {
      ee.line.setAttribute('x1', String(sx(ee.uV.x)));
      ee.line.setAttribute('x2', String(sx(ee.vV.x)));
      const key1 = `${ee.u}-${ee.v}`;
      const key2 = `${ee.v}-${ee.u}`;
      const isTree = st.treeEdges.has(key1) || st.treeEdges.has(key2);
      if (isTree) {
        ee.line.setAttribute('class', 'curve-acc');
      } else {
        ee.line.setAttribute('class', 'edge');
      }
    });

    const startX = sx(60);
    const endX = view.W - sx(60);
    bgG.replaceChildren();
    label(bgG, sx(60), 22, mode === 'bfs' ? 'BFS layered wave (FIFO queue)' : 'DFS deep branch (LIFO stack)', 'lbl', 'start');
    s('line', { class: 'ax', x1: startX, x2: endX, y1: 220, y2: 220 }, bgG);
    const curX = lerp(startX, endX, tStep / maxStep);
    hd.move(curX, 220);

    const containerName = mode === 'bfs' ? 'Q' : 'S';
    const containerStr = st.queueOrStack.join(', ');
    f.set(
      `\\text{${mode.toUpperCase()}} (t=${tStep}):\\quad ${containerName} = [${containerStr}]`,
    );
    nBox.set(st.desc);
  }

  view.onResize(() => {
    update();
  });
  update();
};

export default mount;
