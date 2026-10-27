// Chapter 4: Divide-and-Conquer & Master Theorem Recursion Tree
import { responsiveSvg, s, handle, row, button, formula, slider, clamp, scale, label, type Mount } from './lib';

const mount: Mount = (root) => {
  let a = 2;
  let k = 1;
  const b = 2;
  const levels = 4;
  const pad = { l: 30, r: 30, t: 25, b: 40 };

  const view = responsiveSvg(root, {
    label: 'Recursion tree and work-per-level bars for Master Theorem T(n) = a T(n/b) + n^k',
    aspect: 0.5,
    minH: 260,
    maxH: 360,
  });
  const svgEl = view.el;

  const leftTreeGroup = s('g', {}, svgEl);
  const rightBarsGroup = s('g', {}, svgEl);
  const axGroup = s('g', {}, svgEl);

  const hd = handle(svgEl, {
    label: 'Branching factor a',
    x: 0,
    y: 0,
    valueText: () => `a = ${a}, k = ${k}`,
    onDrag: (px) => {
      const W = view.W;
      const kVal = clamp(Math.round(scale(pad.l, W - pad.r, 1, 4)(px)), 1, 4);
      a = kVal;
      aSld.set(a);
      draw();
    },
    onKey: (_dx, dy, _big) => {
      a = clamp(a + (dy !== 0 ? dy : 1), 1, 4);
      aSld.set(a);
      draw();
    },
  });

  const f = formula(root);
  const r1 = row(root);
  const aSld = slider(r1, {
    label: 'Branching a',
    min: 1,
    max: 4,
    step: 1,
    value: a,
    onInput: (v) => {
      a = v;
      draw();
    },
  });
  const kSld = slider(r1, {
    label: 'Exponent k',
    min: 0,
    max: 2,
    step: 1,
    value: k,
    onInput: (v) => {
      k = v;
      draw();
    },
  });
  button(r1, 'Reset', () => {
    a = 2;
    k = 1;
    aSld.set(a);
    kSld.set(k);
    draw();
  });

  function draw() {
    const { W, H } = view;
    leftTreeGroup.replaceChildren();
    rightBarsGroup.replaceChildren();
    axGroup.replaceChildren();

    const midX = W / 2;
    // Panel titles at top (no collision with bottom bar labels)
    label(axGroup, (pad.l + midX - 16) / 2, 18, 'Recursion Tree', 'lbl-fg', 'middle');
    label(axGroup, (midX + 16 + W - pad.r) / 2, 18, 'Work per Level', 'lbl-fg', 'middle');

    // Bottom axes
    s('line', { class: 'ax', x1: pad.l, x2: midX - 16, y1: H - pad.b, y2: H - pad.b }, axGroup);
    s('line', { class: 'ax', x1: midX + 16, x2: W - pad.r, y1: H - pad.b, y2: H - pad.b }, axGroup);

    // Draw tree nodes and parent-child edges on left
    const topT = pad.t + 14;
    const yStep = (H - topT - pad.b - 10) / (levels - 1);
    const levelCoords: { x: number; y: number }[][] = [];
    for (let d = 0; d < levels; d++) {
      const numNodes = Math.min(Math.pow(a, d), 8);
      const rowY = topT + d * yStep;
      const leftW = midX - 16 - pad.l;
      const coords: { x: number; y: number }[] = [];
      for (let i = 0; i < numNodes; i++) {
        const nx = pad.l + ((i + 0.5) / numNodes) * leftW;
        coords.push({ x: nx, y: rowY });
      }
      levelCoords.push(coords);
    }
    for (let d = 0; d < levels - 1; d++) {
      const parents = levelCoords[d];
      const children = levelCoords[d + 1];
      children.forEach((ch, ci) => {
        const pi = Math.min(parents.length - 1, Math.floor(ci / a));
        const pNode = parents[pi];
        if (pNode) {
          s('line', { class: 'ax', x1: pNode.x, y1: pNode.y, x2: ch.x, y2: ch.y }, leftTreeGroup);
        }
      });
    }
    levelCoords.forEach((rowNodes) => {
      rowNodes.forEach((pt) => {
        s('circle', { class: 'dot-acc', cx: pt.x, cy: pt.y, r: 4.5 }, leftTreeGroup);
      });
    });

    // Draw work-per-level bars on right
    const b_k = Math.pow(b, k);
    let maxWork = 0;
    const works: number[] = [];
    for (let d = 0; d < levels; d++) {
      const work = Math.pow(a / b_k, d);
      works.push(work);
      if (work > maxWork) maxWork = work;
    }

    const rightW = W - pad.r - (midX + 16);
    const slotW = rightW / levels;
    const barW = Math.max(10, slotW - 8);
    works.forEach((w, d) => {
      const bx = midX + 16 + d * slotW + (slotW - barW) / 2;
      const bH = (w / Math.max(1, maxWork)) * (H - topT - pad.b - 10);
      const by = H - pad.b - bH;
      s('rect', { class: 'bar', x: bx, y: by, width: barW, height: bH, rx: 3 }, rightBarsGroup);
      label(rightBarsGroup, bx + barW / 2, H - pad.b + 18, `d=${d}`, 'lbl', 'middle');
    });

    const rootPt = levelCoords[0][0];
    hd.move(rootPt.x, rootPt.y);

    const regime =
      a < Math.pow(2, k)
        ? `\\Theta(n^{${k}})`
        : a === Math.pow(2, k)
          ? `\\Theta(n^{${k}}\\log n)`
          : `\\Theta(n^{\\log_2 ${a}})`;
    f.set(`T(n)=${a}T(n/2)+n^{${k}}=${regime}`);
  }

  view.onResize(draw);
  draw();
};

export default mount;
