// Geometric chord-and-tangent point addition P + Q = R on elliptic curve y^2 = x^3 - 2x + 2 over R.
import { responsiveSvg, s, handle, row, button, formula, clamp, scale, label, type Mount } from './lib';

// Elliptic curve: y^2 = x^3 - 2x + 2
// f(x) = x^3 - 2x + 2
function curveY(x: number): number {
  const v = x * x * x - 2 * x + 2;
  return v >= 0 ? Math.sqrt(v) : NaN;
}

const mount: Mount = (root) => {
  // Initial points P and Q on the curve
  let px = 0.0;
  let py = curveY(px); // ~1.414
  let qx = 1.0;
  let qy = curveY(qx); // 1.0

  const view = responsiveSvg(root, {
    label: 'Elliptic curve point addition P + Q = R on y^2 = x^3 - 2x + 2',
    aspect: 0.65,
    minH: 260,
    maxH: 360,
  });
  const svgEl = view.el;

  const curveG = s('g', {}, svgEl);
  const geomG = s('g', {}, svgEl);
  const formulaBox = formula(root);

  const r = row(root);
  button(r, 'Reset', () => {
    px = 0.0;
    py = curveY(px);
    qx = 1.0;
    qy = curveY(qx);
    draw();
  });

  const pad = 24;

  // Handle for point P
  const hdP = handle(svgEl, {
    label: 'Point P handle',
    x: 0,
    y: 0,
    valueText: () => `P = (${px.toFixed(2)}, ${py.toFixed(2)})`,
    onDrag: (mx, my) => {
      const { W, H } = view;
      const xSc = scale(-3, 3, pad, W - pad);
      const ySc = scale(-3, 3, H - pad, pad);
      const targetX = clamp(xSc.invert(mx), -1.5, 1.8);
      const yVal = curveY(targetX);
      if (!isNaN(yVal)) {
        px = targetX;
        py = ySc.invert(my) < 0 ? -yVal : yVal;
        draw();
      }
    },
    onKey: (dx) => {
      px = clamp(px + dx * 0.1, -1.5, 1.8);
      py = curveY(px);
      draw();
    },
  });

  // Handle for point Q
  const hdQ = handle(svgEl, {
    label: 'Point Q handle',
    x: 0,
    y: 0,
    valueText: () => `Q = (${qx.toFixed(2)}, ${qy.toFixed(2)})`,
    onDrag: (mx, my) => {
      const { W, H } = view;
      const xSc = scale(-3, 3, pad, W - pad);
      const ySc = scale(-3, 3, H - pad, pad);
      const targetX = clamp(xSc.invert(mx), -1.5, 1.8);
      const yVal = curveY(targetX);
      if (!isNaN(yVal)) {
        qx = targetX;
        qy = ySc.invert(my) < 0 ? -yVal : yVal;
        draw();
      }
    },
    onKey: (dx) => {
      qx = clamp(qx + dx * 0.1, -1.5, 1.8);
      qy = curveY(qx);
      draw();
    },
  });

  function draw() {
    const { W, H } = view;
    curveG.replaceChildren();
    geomG.replaceChildren();

    const xMin = -3, xMax = 3;
    const yMin = -3, yMax = 3;
    const xSc = scale(xMin, xMax, pad, W - pad);
    const ySc = scale(yMin, yMax, H - pad, pad);

    // Draw axes
    s('line', { x1: xSc(xMin), y1: ySc(0), x2: xSc(xMax), y2: ySc(0), class: 'ax' }, curveG);
    s('line', { x1: xSc(0), y1: ySc(yMin), x2: xSc(0), y2: ySc(yMax), class: 'ax' }, curveG);

    // Draw curve branches (top and bottom)
    const ptsTop: string[] = [];
    const ptsBot: string[] = [];
    for (let pxCoord = pad; pxCoord <= W - pad; pxCoord += 2) {
      const x = xSc.invert(pxCoord);
      const y = curveY(x);
      if (!isNaN(y) && y <= yMax) {
        ptsTop.push(`${pxCoord.toFixed(1)},${ySc(y).toFixed(1)}`);
        ptsBot.push(`${pxCoord.toFixed(1)},${ySc(-y).toFixed(1)}`);
      }
    }
    s('polyline', { points: ptsTop.join(' '), class: 'curve' }, curveG);
    s('polyline', { points: ptsBot.join(' '), class: 'curve' }, curveG);

    // Compute line through P and Q (or tangent if P == Q)
    let slope = 0;
    let intercept = 0;
    const isTangent = Math.abs(px - qx) < 1e-4 && Math.abs(py - qy) < 1e-4;
    if (isTangent) {
      slope = (3 * px * px - 2) / (2 * py);
    } else {
      slope = (qy - py) / (qx - px);
    }
    intercept = py - slope * px;

    // Third intersection x3 = slope^2 - px - qx
    const x3 = slope * slope - px - qx;
    const y3 = slope * x3 + intercept;
    const rx = x3;
    const ry = -y3;

    // Draw secant / tangent line clipped to [xMin, xMax] x [yMin, yMax]
    const secPts: string[] = [];
    for (let i = 0; i <= 60; i++) {
      const lx = xMin + (i / 60) * (xMax - xMin);
      const ly = slope * lx + intercept;
      if (ly >= yMin && ly <= yMax) {
        secPts.push(`${xSc(lx).toFixed(1)},${ySc(ly).toFixed(1)}`);
      }
    }
    if (secPts.length >= 2) {
      s('polyline', { points: secPts.join(' '), class: 'line-muted' }, geomG);
    }

    // Third intersection point -R = (x3, y3)
    const x3c = clamp(x3, xMin, xMax);
    const y3c = clamp(y3, yMin, yMax);
    const rxc = clamp(rx, xMin, xMax);
    const ryc = clamp(ry, yMin, yMax);
    s('circle', { cx: xSc(x3c), cy: ySc(y3c), r: 5, class: 'dot-ring' }, geomG);
    label(geomG, xSc(x3c) - 10, ySc(y3c) + 4, '−R', 'lbl', 'end');

    // Vertical reflection dashed segment to R = (x3, -y3)
    s('line', {
      x1: xSc(x3c),
      y1: ySc(y3c),
      x2: xSc(rxc),
      y2: ySc(ryc),
      class: 'edge',
    }, geomG);

    // Points P, Q, and R
    const pScr = { x: xSc(px), y: ySc(py) };
    const qScr = { x: xSc(qx), y: ySc(qy) };
    const rScr = { x: xSc(rxc), y: ySc(ryc) };

    s('circle', { cx: pScr.x, cy: pScr.y, r: 6, class: 'dot' }, geomG);
    s('circle', { cx: qScr.x, cy: qScr.y, r: 6, class: 'dot' }, geomG);
    s('circle', { cx: rScr.x, cy: rScr.y, r: 7, class: 'dot-acc' }, geomG);

    label(geomG, pScr.x, pScr.y - 14, 'P', 'lbl-fg', 'middle');
    label(geomG, qScr.x + 12, qScr.y - 8, 'Q', 'lbl-fg', 'start');
    label(geomG, rScr.x + 12, rScr.y + 14, 'R', 'lbl-acc', 'start');

    hdP.move(pScr.x, pScr.y);
    hdQ.move(qScr.x, qScr.y);

    formulaBox.set(
      `P+Q = R = (${rx.toFixed(2)},\\, ${ry.toFixed(2)})`
    );
  }

  view.onResize(draw);
  draw();
};

export default mount;
