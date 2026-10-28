// Chapter 17: Amortized Analysis & Potential Method Table Doubling
import { responsiveSvg, s, attr, handle, row, button, formula, note, slider, clamp, scale, label, type Mount } from './lib';

const maxOps = 17;

function getOpData(n: number) {
  // simulate table doubling
  let cap = 1;
  let size = 0;
  let actualCost = 1;
  for (let i = 1; i <= n; i++) {
    size++;
    if (size > cap) {
      actualCost = 1 + (size - 1); // copy old elements + 1
      cap *= 2;
    } else {
      actualCost = 1;
    }
  }
  const phi = 2 * size - cap;
  return { size, cap, actualCost, phi };
}

const mount: Mount = (root) => {
  let opIdx = 8;
  const pad = { l: 40, r: 30, t: 25, b: 40 };

  const view = responsiveSvg(root, {
    label: 'Dynamic array table doubling actual cost spikes vs constant amortized cost curve',
    aspect: 0.5,
    minH: 240,
    maxH: 340,
  });
  const svgEl = view.el;

  const barsGroup = s('g', {}, svgEl);
  const curvesGroup = s('g', {}, svgEl);
  const axGroup = s('g', {}, svgEl);
  const pathPhi = s('path', { class: 'curve' }, curvesGroup);
  const pathAmort = s('path', { class: 'curve-acc' }, curvesGroup);

  const hd = handle(svgEl, {
    label: 'Push operation scrubber',
    x: 0,
    y: 0,
    valueText: () => `Operation i = ${opIdx}`,
    onDrag: (px) => {
      const W = view.W;
      const xMin = pad.l;
      const xMax = W - pad.r;
      const k = clamp((px - xMin) / (xMax - xMin), 0, 1);
      setOp(Math.round(clamp(1 + k * (maxOps - 1), 1, maxOps)));
    },
    onKey: (_dx, dy, _big) => {
      setOp(clamp(opIdx + (dy !== 0 ? dy : 1), 1, maxOps));
    },
  });

  const f = formula(root);
  const nBox = note(root);
  const r1 = row(root);
  const sld = slider(r1, {
    label: 'Operations i',
    min: 1,
    max: maxOps,
    step: 1,
    value: opIdx,
    onInput: (v) => setOp(v),
  });
  button(r1, 'Reset', () => setOp(5));

  function setOp(v: number) {
    opIdx = clamp(v, 1, maxOps);
    sld.set(opIdx);
    draw();
  }

  function draw() {
    const { W, H } = view;
    barsGroup.replaceChildren();
    axGroup.replaceChildren();

    const xMin = pad.l;
    const xMax = W - pad.r;
    const x = scale(1, maxOps, xMin, xMax);
    const y = scale(0, 18, H - pad.b, pad.t);

    for (const gv of [3, 6, 12, 18]) {
      const gy = y(gv);
      s('line', { class: 'grid', x1: xMin, x2: xMax, y1: gy, y2: gy }, axGroup);
    }
    s('line', { class: 'ax', x1: xMin, x2: xMax, y1: H - pad.b, y2: H - pad.b }, axGroup);
    s('line', { class: 'ax', x1: xMin, x2: xMin, y1: pad.t, y2: H - pad.b }, axGroup);
    label(axGroup, xMin + 6, pad.t - 6, 'bars: actual c_i  ·  curve: Φ_i  ·  accent: ĉ_i = 3', 'lbl', 'start');
    label(axGroup, xMax, H - pad.b + 18, 'op i', 'lbl', 'end');

    const handleX = x(opIdx);
    hd.move(handleX, H - 20);

    // Draw actual cost bars up to opIdx
    const barW = (xMax - xMin) / maxOps - 4;
    for (let i = 1; i <= opIdx; i++) {
      const data = getOpData(i);
      const bx = x(i) - barW / 2;
      const by = y(data.actualCost);
      const bH = y(0) - y(data.actualCost);
      s('rect', { class: i === opIdx ? 'area-fp' : 'bar', x: bx, y: by, width: barW, height: bH, rx: 3 }, barsGroup);
    }

    // Build potential and amortized curves
    let dPhi = '';
    let dAmort = '';
    for (let i = 1; i <= maxOps; i++) {
      const data = getOpData(i);
      const px = x(i);
      const pyPhi = y(data.phi);
      const pyAmort = y(3); // constant amortized cost = 3
      dPhi += `${i === 1 ? 'M' : 'L'} ${px.toFixed(1)} ${pyPhi.toFixed(1)}`;
      dAmort += `${i === 1 ? 'M' : 'L'} ${px.toFixed(1)} ${pyAmort.toFixed(1)}`;
    }
    attr(pathPhi, { d: dPhi });
    attr(pathAmort, { d: dAmort });

    const currData = getOpData(opIdx);
    const prevPhi = opIdx > 1 ? getOpData(opIdx - 1).phi : 0;
    f.set(`i=${opIdx},\\ \\text{Cost } c_i=${currData.actualCost},\\ \\Phi_i=${currData.phi},\\ \\hat{c}_i=3`);
    nBox.set(
      currData.actualCost > 1
        ? `Resize spike at op i = ${opIdx}: table doubles to capacity ${currData.cap} and copies ${currData.actualCost - 1} existing items (actual cost c_${opIdx} = ${currData.actualCost}), paid for by releasing ΔΦ = ${currData.phi - prevPhi} stored potential so ĉ_${opIdx} = 3.`
        : `Fast push at op i = ${opIdx} (size ${currData.size}/${currData.cap}): actual cost is c_${opIdx} = 1 and potential rises by ΔΦ = +2 to Φ_${opIdx} = ${currData.phi}, banking credit for the next doubling.`,
    );
  }

  view.onResize(draw);
  draw();
};

export default mount;
