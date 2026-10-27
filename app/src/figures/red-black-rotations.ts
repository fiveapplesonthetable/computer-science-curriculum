// Chapter 13: Red-Black Tree Rotation Visualizer
import { responsiveSvg, s, handle, row, button, formula, slider, clamp, label, lerp, type Mount } from './lib';

const mount: Mount = (root) => {
  let t = 0.0; // 0 = left rotation state (y root), 1 = right rotation state (x root)
  const pad = { l: 40, r: 40, t: 30, b: 50 };

  const view = responsiveSvg(root, {
    label: 'BST tree rotation interpolating between x and y roots while preserving in-order projection',
    aspect: 0.5,
    minH: 240,
    maxH: 340,
  });
  const svgEl = view.el;

  const edgesGroup = s('g', {}, svgEl);
  const nodesGroup = s('g', {}, svgEl);
  const textGroup = s('g', {}, svgEl);

  const hd = handle(svgEl, {
    label: 'Rotation interpolation slider',
    x: 0,
    y: 0,
    valueText: () => `t = ${t.toFixed(2)}`,
    onDrag: (px) => {
      const W = view.W;
      const xMin = pad.l;
      const xMax = W - pad.r;
      const val = clamp((px - xMin) / (xMax - xMin), 0, 1);
      setT(val);
    },
    onKey: (_dx, dy, _big) => {
      setT(clamp(t + (dy !== 0 ? dy * 0.1 : 0.1), 0, 1));
    },
  });

  const f = formula(root);
  const r1 = row(root);
  const sld = slider(r1, {
    label: 'Interpolation t',
    min: 0,
    max: 1,
    step: 0.01,
    value: t,
    format: (v) => v.toFixed(2),
    onInput: (v) => setT(v),
  });
  button(r1, 'Rotate Left', () => setT(0));
  button(r1, 'Rotate Right', () => setT(1));
  button(r1, 'Reset', () => setT(0));

  function setT(val: number) {
    t = clamp(val, 0, 1);
    sld.set(t);
    draw();
  }

  function draw() {
    const { W, H } = view;
    edgesGroup.replaceChildren();
    nodesGroup.replaceChildren();
    textGroup.replaceChildren();

    s('line', { class: 'ax', x1: pad.l, x2: W - pad.r, y1: H - 20, y2: H - 20 }, edgesGroup);
    hd.move(pad.l + t * (W - pad.l - pad.r), H - 20);

    const midX = W / 2;
    // Coordinates for configuration 0 (y is root) vs configuration 1 (x is root)
    // Root x0, y0
    const rx0 = midX + 40, ry0 = pad.t + 30;
    const rx1 = midX - 40, ry1 = pad.t + 30;
    const rx = lerp(rx0, rx1, t);
    const ry = lerp(ry0, ry1, t);

    // Left child lx, ly
    const lx0 = midX - 40, ly0 = pad.t + 90;
    const lx1 = midX + 40, ly1 = pad.t + 90;
    const lx = lerp(lx0, lx1, t);
    const ly = lerp(ly0, ly1, t);

    // Subtrees alpha, beta, gamma
    const ax = midX - 95, ay = pad.t + 145;
    const bx = midX, by = pad.t + 145;
    const gx = midX + 95, gy = pad.t + 145;

    // Edges (beta interpolates attachment from x at t=0 to y at t=1)
    const betaParentX = lerp(lx, rx, t);
    const betaParentY = lerp(ly, ry, t);
    const alphaParentX = lerp(lx, rx, t);
    const alphaParentY = lerp(ly, ry, t);
    const gammaParentX = lerp(rx, lx, t);
    const gammaParentY = lerp(ry, ly, t);

    s('line', { class: 'line', x1: rx, y1: ry, x2: lx, y2: ly }, edgesGroup);
    s('line', { class: 'line', x1: alphaParentX, y1: alphaParentY, x2: ax, y2: ay - 16 }, edgesGroup);
    s('line', { class: 'line', x1: betaParentX, y1: betaParentY, x2: bx, y2: by - 16 }, edgesGroup);
    s('line', { class: 'line', x1: gammaParentX, y1: gammaParentY, x2: gx, y2: gy - 16 }, edgesGroup);

    // Subtree triangles so edges terminate cleanly above the labels
    for (const [tx, ty] of [[ax, ay], [bx, by], [gx, gy]]) {
      s('polygon', { class: 'bar', points: `${tx},${ty - 16} ${tx - 16},${ty + 8} ${tx + 16},${ty + 8}` }, nodesGroup);
    }

    // Nodes (high-contrast rings with clear labels inside)
    s('circle', { class: 'dot-ring', cx: rx, cy: ry, r: 16 }, nodesGroup);
    label(nodesGroup, rx, ry + 5, t < 0.5 ? 'y' : 'x', 'lbl-acc');

    s('circle', { class: 'dot-ring', cx: lx, cy: ly, r: 16 }, nodesGroup);
    label(nodesGroup, lx, ly + 5, t < 0.5 ? 'x' : 'y', 'lbl-fg');

    // Subtree labels inside triangles
    label(nodesGroup, ax, ay + 4, 'α', 'lbl-fg');
    label(nodesGroup, bx, by + 4, 'β', 'lbl-fg');
    label(nodesGroup, gx, gy + 4, 'γ', 'lbl-fg');

    f.set(`t=${t.toFixed(2)}:\\ \\text{in-order } [\\alpha, x, \\beta, y, \\gamma]`);
  }

  view.onResize(draw);
  draw();
};

export default mount;
