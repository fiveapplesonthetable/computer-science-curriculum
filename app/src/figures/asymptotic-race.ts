// Chapter 3: Asymptotic Growth & Big-O Contract Diagram
import { responsiveSvg, s, attr, handle, row, button, formula, note, slider, clamp, scale, label, lerp, tween, type Mount } from './lib';

const f_n = (n: number) => 0.4 * n * n + 1.8 * n + 3;

const mount: Mount = (root) => {
  let c = 0.85;
  const pad = { l: 40, r: 30, t: 25, b: 40 };

  const view = responsiveSvg(root, {
    label: 'Big-O asymptotic contract comparing f(n) against c*g(n) for n >= n0',
    aspect: 0.5,
    minH: 240,
    maxH: 340,
  });
  const svgEl = view.el;

  const bandRect = s('rect', { class: 'band' }, svgEl);
  const axGroup = s('g', {}, svgEl);
  const curvesGroup = s('g', {}, svgEl);
  const pathF = s('path', { class: 'curve' }, curvesGroup);
  const pathCg = s('path', { class: 'curve-acc' }, curvesGroup);
  const n0Line = s('line', { class: 'edge' }, svgEl);

  const hd = handle(svgEl, {
    label: 'Constant c multiplier',
    x: 0,
    y: 0,
    valueText: () => `c = ${c.toFixed(2)}`,
    onDrag: (_px, py) => {
      // Map py to c in [0.45, 2.0]
      const newC = scale(view.H - pad.b, pad.t, 0.45, 2.0)(py);
      setC(newC);
    },
    onKey: (_dx, dy, big) => {
      setC(c + dy * (big ? 0.05 : 0.01));
    },
  });

  const f = formula(root);
  const nBox = note(root);
  const r = row(root);
  const sld = slider(r, {
    label: 'Constant c',
    min: 0.45,
    max: 2.0,
    step: 0.01,
    value: c,
    format: (v) => v.toFixed(2),
    onInput: (v) => setC(v),
  });
  button(r, 'Reset', () => {
    const from = c;
    tween((k) => setC(lerp(from, 0.85, k)));
  });

  function setC(v: number) {
    c = clamp(v, 0.45, 2.0);
    sld.set(c);
    draw();
  }

  // Solve c * n^2 = 0.4 n^2 + 1.8 n + 3 => (c - 0.4)n^2 - 1.8n - 3 = 0
  function computeN0(cv: number): number {
    const a = cv - 0.4;
    if (a <= 0.001) return 50;
    const discriminant = 1.8 * 1.8 + 4 * a * 3;
    const nRoot = (1.8 + Math.sqrt(discriminant)) / (2 * a);
    return Math.max(1, Math.ceil(nRoot));
  }

  function draw() {
    const { W, H } = view;
    const nMax = 25;
    const yMax = f_n(nMax) * 1.1;

    const x = scale(0, nMax, pad.l, W - pad.r);
    const y = scale(0, yMax, H - pad.b, pad.t);

    axGroup.replaceChildren();
    // Horizontal tier gridlines
    for (const frac of [0.25, 0.5, 0.75, 1.0]) {
      const gy = y(yMax * frac);
      s('line', { class: 'grid', x1: pad.l, x2: W - pad.r, y1: gy, y2: gy }, axGroup);
    }
    // Axes
    s('line', { class: 'ax', x1: pad.l, x2: W - pad.r, y1: H - pad.b, y2: H - pad.b }, axGroup);
    s('line', { class: 'ax', x1: pad.l, x2: pad.l, y1: pad.t, y2: H - pad.b }, axGroup);
    label(axGroup, W - pad.r, H - pad.b + 18, 'n', 'lbl');
    label(axGroup, pad.l + 6, pad.t - 8, 'cost: c·n² (accent) vs f(n)', 'lbl', 'start');

    // Build paths (clipped to chart top pad.t)
    let dF = '';
    let dCg = '';
    const pts = 60;
    for (let i = 0; i <= pts; i++) {
      const nv = (i / pts) * nMax;
      const px = x(nv);
      const pyF = clamp(y(f_n(nv)), pad.t, H - pad.b);
      dF += `${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${pyF.toFixed(1)}`;
      const cgVal = c * nv * nv;
      if (cgVal <= yMax * 1.02) {
        const pyCg = clamp(y(cgVal), pad.t, H - pad.b);
        dCg += `${dCg === '' ? 'M' : 'L'} ${px.toFixed(1)} ${pyCg.toFixed(1)}`;
      }
    }
    attr(pathF, { d: dF });
    attr(pathCg, { d: dCg });

    const n0 = computeN0(c);
    const x0 = x(n0);
    attr(bandRect, { x: Math.max(pad.l, x0), width: Math.max(0, W - pad.r - Math.max(pad.l, x0)), y: pad.t, height: H - pad.b - pad.t });
    attr(n0Line, { x1: x0, x2: x0, y1: pad.t, y2: H - pad.b });

    // Handle position on c*n^2 curve at n0
    const handleY = y(c * n0 * n0);
    hd.move(x0, clamp(handleY, pad.t, H - pad.b));

    f.set(`c=${c.toFixed(2)},\\ n_0=${n0}:\\ f(n_0)=${f_n(n0).toFixed(1)}\\le ${(c * n0 * n0).toFixed(1)}`);
    nBox.set(
      n0 <= nMax
        ? `For multiplier c = ${c.toFixed(2)}, the quadratic surplus (${(c - 0.4).toFixed(2)}·n²) overtakes the lower-order terms 1.8n + 3 at threshold n₀ = ${n0}, trapping f(n) ≤ c·n² inside the shaded region for all n ≥ ${n0}.`
        : `Multiplier c = ${c.toFixed(2)} is close to the leading coefficient 0.40, pushing the crossover threshold n₀ = ${n0} past the visible window (n > ${nMax})—yet a finite n₀ still exists!`,
    );
  }

  view.onResize(draw);
  draw();
};

export default mount;
