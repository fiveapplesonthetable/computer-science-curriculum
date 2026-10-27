// Modular arithmetic clock Z/pZ (p=17, g=3) and Diffie-Hellman key exchange visualizer.
import { responsiveSvg, s, handle, row, button, formula, slider, clamp, label, type Mount } from './lib';

const p = 17;
const g = 3;

// Compute (base^exp) % mod
function modPow(base: number, exp: number, mod: number): number {
  let res = 1;
  base = base % mod;
  while (exp > 0) {
    if (exp % 2 === 1) res = (res * base) % mod;
    base = (base * base) % mod;
    exp = Math.floor(exp / 2);
  }
  return res;
}

const mount: Mount = (root) => {
  let a = 5; // Alice's secret
  let b = 11; // Bob's secret

  const view = responsiveSvg(root, {
    label: 'Modular clock Z/17Z showing Diffie-Hellman key exchange with g=3',
    aspect: 0.65,
    minH: 260,
    maxH: 360,
  });
  const svgEl = view.el;

  const groupG = s('g', {}, svgEl); void groupG;
  const chordsG = s('g', {}, svgEl);
  const nodesG = s('g', {}, svgEl);

  // Labels for public/shared values
  const infoGroup = s('g', {}, svgEl);
  const formulaBox = formula(root);

  const r = row(root);
  const sA = slider(r, {
    label: 'Alice secret a',
    texLabel: 'a',
    min: 1,
    max: 16,
    step: 1,
    value: a,
    onInput: (v) => {
      a = v;
      draw();
    },
  });
  const sB = slider(r, {
    label: 'Bob secret b',
    texLabel: 'b',
    min: 1,
    max: 16,
    step: 1,
    value: b,
    onInput: (v) => {
      b = v;
      draw();
    },
  });
  button(r, 'Reset', () => {
    a = 5;
    b = 11;
    sA.set(a);
    sB.set(b);
    draw();
  });

  // Draggable handle around the clock for Alice's secret 'a'
  const hd = handle(svgEl, {
    label: 'Alice secret handle',
    x: 0,
    y: 0,
    valueText: () => `secret a = ${a}`,
    onDrag: (px, py) => {
      const cx = view.W / 2;
      const cy = (view.H - 30) / 2 + 10;
      let angle = Math.atan2(py - cy, px - cx);
      if (angle < 0) angle += 2 * Math.PI;
      // map angle to residue 0..16
      const residue = Math.round((angle / (2 * Math.PI)) * p) % p;
      a = residue === 0 ? 16 : residue;
      sA.set(a);
      draw();
    },
    onKey: (_dx, dy) => {
      a = clamp(a + dy, 1, 16);
      sA.set(a);
      draw();
    },
  });

  function draw() {
    const { W, H } = view;
    const cx = W / 2;
    const cy = (H - 22) / 2;
    const radius = Math.min(cx, cy) - 34;

    chordsG.replaceChildren();
    nodesG.replaceChildren();
    infoGroup.replaceChildren();

    const A = modPow(g, a, p);
    const B = modPow(g, b, p);
    const K_alice = modPow(B, a, p);
    const K_bob = modPow(A, b, p); void K_bob;

    // Draw clock circle
    s('circle', { cx, cy, r: radius, class: 'ax' }, chordsG);

    // Compute node coordinates
    const coords: { x: number; y: number }[] = [];
    for (let i = 0; i < p; i++) {
      // Start from top (-90 deg)
      const theta = -Math.PI / 2 + (i * 2 * Math.PI) / p;
      const x = cx + radius * Math.cos(theta);
      const y = cy + radius * Math.sin(theta);
      coords.push({ x, y });
    }

    // Draw chords for powers of A (Alice's exponentiation: g^1, g^2, ..., g^a)
    let curr = 1;
    for (let step = 1; step <= a; step++) {
      curr = (curr * g) % p;
      const nextCoord = coords[curr];
      // Draw chord from prev to next or from origin/previous
      const opacity = step === a ? '1' : '0.3';
      const cls = step === a ? 'line-acc' : 'line-muted';
      // To make it clear, let's draw lines from g^(k-1) to g^k
      const prevVal = modPow(g, step - 1, p);
      const pCoord = coords[prevVal];
      s('line', { x1: pCoord.x, y1: pCoord.y, x2: nextCoord.x, y2: nextCoord.y, class: cls, opacity }, chordsG);
    }

    // Draw nodes
    for (let i = 0; i < p; i++) {
      const { x, y } = coords[i];
      const isA = i === A;
      const isB = i === B;
      const isK = i === K_alice;

      const cls = isK ? 'dot-acc' : isA || isB ? 'dot-ring' : 'dot';
      const rSize = isK || isA || isB ? 6 : 4;
      s('circle', { cx: x, cy: y, r: rSize, class: cls }, nodesG);

      // Label text offset slightly outward
      const theta = -Math.PI / 2 + (i * 2 * Math.PI) / p;
      const lx = cx + (radius + 20) * Math.cos(theta);
      const ly = cy + (radius + 20) * Math.sin(theta);
      const lblCls = isK ? 'lbl-acc' : isA || isB ? 'lbl-fg' : 'lbl';
      label(nodesG, lx, ly, String(i), lblCls, 'middle');
    }

    // Position handle at Alice's public value A's coordinate
    const handleCoord = coords[A];
    hd.move(handleCoord.x, handleCoord.y);

    // Single concise centered summary at bottom of SVG (no multi-label overlap)
    const infoY = H - 8;
    s('text', { x: W / 2, y: infoY, class: 'lbl-acc', 'text-anchor': 'middle' }, infoGroup).textContent =
      `A = ${A},   B = ${B},   Shared key K = ${K_alice}`;

    formulaBox.set(
      `A=${A},\\ B=${B},\\ K=3^{${a}\\cdot ${b}}\\bmod 17=${K_alice}`
    );
  }

  view.onResize(draw);
  draw();
};

export default mount;
