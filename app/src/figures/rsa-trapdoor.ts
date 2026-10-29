// Interactive RSA trapdoor permutation visualizer on p=3, q=11, n=33, phi(n)=20.
import { responsiveSvg, s, handle, row, button, formula, note, slider, clamp, label, type Mount } from './lib';

const p = 3;
const q = 11;
const n = p * q; // 33

// Valid public exponents e coprime to 20: 3, 7, 13
const validE = [3, 7, 13];
const validD = [7, 3, 17]; // modular inverses mod 20

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
  let eIdx = 0; // index in validE (default e=3, d=7)
  let m = 5;    // message m in 0..32

  const view = responsiveSvg(root, {
    label: 'RSA trapdoor permutation with n=33 and selectable public exponent e',
    aspect: 0.6,
    minH: 260,
    maxH: 360,
  });
  const svgEl = view.el;

  const linesG = s('g', {}, svgEl);
  const nodesG = s('g', {}, svgEl);
  const formulaBox = formula(root);
  const nBox = note(root);

  const r = row(root);
  const bE3 = button(r, 'e = 3', () => { eIdx = 0; updateButtons(); draw(); });
  const bE7 = button(r, 'e = 7', () => { eIdx = 1; updateButtons(); draw(); });
  const bE13 = button(r, 'e = 13', () => { eIdx = 2; updateButtons(); draw(); });
  const sMsg = slider(r, {
    label: 'Message m',
    texLabel: 'm',
    min: 0,
    max: 32,
    step: 1,
    value: m,
    onInput: (v) => {
      m = v;
      draw();
    },
  });
  button(r, 'Reset', () => {
    m = 5;
    eIdx = 0;
    sMsg.set(m);
    updateButtons();
    draw();
  });

  function updateButtons() {
    bE3.setAttribute('aria-pressed', String(eIdx === 0));
    bE7.setAttribute('aria-pressed', String(eIdx === 1));
    bE13.setAttribute('aria-pressed', String(eIdx === 2));
  }
  updateButtons();

  const hd = handle(svgEl, {
    label: 'Message handle',
    x: 0,
    y: 0,
    valueText: () => `message m = ${m}`,
    onDrag: (px) => {
      const x0 = 40;
      const x1 = view.W - 40;
      const k = clamp((px - x0) / (x1 - x0), 0, 1);
      m = Math.round(k * 32);
      sMsg.set(m);
      draw();
    },
    onKey: (_dx, dy) => {
      m = clamp(m + dy, 0, 32);
      sMsg.set(m);
      draw();
    },
  });

  function draw() {
    const { W, H } = view;
    linesG.replaceChildren();
    nodesG.replaceChildren();

    const e = validE[eIdx];
    const d = validD[eIdx];
    const c = modPow(m, e, n);
    const decrypted = modPow(c, d, n);

    const pad = 32;
    const yTop = 52;
    const yBot = H - 52;
    const span = W - 2 * pad;

    // Draw axes for m (top) and c (bottom), with left-aligned titles and right-aligned live readouts so handles never collide
    s('line', { x1: pad, y1: yTop, x2: W - pad, y2: yTop, class: 'ax' }, linesG);
    s('line', { x1: pad, y1: yBot, x2: W - pad, y2: yBot, class: 'ax' }, linesG);
    label(linesG, pad, 20, 'Messages m ∈ {0..32}', 'lbl-fg', 'start');
    label(linesG, W - pad, 20, `m = ${m}`, 'lbl-acc', 'end');
    label(linesG, pad, yBot + 32, 'Ciphertexts c = m^e mod 33', 'lbl-fg', 'start');
    label(linesG, W - pad, yBot + 32, `c = ${c}`, 'lbl-acc', 'end');

    const getX = (val: number) => pad + (val / 32) * span;

    // Draw permutation mapping lines for all m or subset
    let activeLine = null;
    for (let i = 0; i < n; i++) {
      const ci = modPow(i, e, n);
      const x1 = getX(i);
      const x2 = getX(ci);
      const isSelected = i === m;
      if (isSelected) {
        activeLine = { x1, x2 };
      } else {
        s('line', { x1, y1: yTop, x2, y2: yBot, class: 'line-muted', opacity: '0.15' }, linesG);
      }
    }
    if (activeLine) {
      s('line', { x1: activeLine.x1, y1: yTop, x2: activeLine.x2, y2: yBot, class: 'line-acc', opacity: '1' }, linesG);
    }

    // Draw nodes for selected m and c
    const xm = getX(m);
    const xc = getX(c);
    s('circle', { cx: xm, cy: yTop, r: 6, class: 'dot-acc' }, nodesG);
    s('circle', { cx: xc, cy: yBot, r: 6, class: 'dot-acc' }, nodesG);

    hd.move(xm, yTop);

    formulaBox.set(
      `m=${m} \\xrightarrow{m^{${e}}\\bmod 33} c=${c} \\xrightarrow{c^{${d}}\\bmod 33} ${decrypted}`
    );
    nBox.set(
      `Because gcd(e=${e}, φ(33)=20) = 1, m ↦ m^${e} mod 33 is a bijection on {0..32}. Trapdoor exponent d = ${d} satisfies ${e}·${d} = ${e * d} ≡ 1 (mod 20), inverting c = ${c} back to m = ${decrypted}.`,
    );
  }

  view.onResize(draw);
  draw();
};

export default mount;
