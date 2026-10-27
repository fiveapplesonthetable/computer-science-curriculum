// Signal Processing, figure: convolution-flip-slide.ts
// Discrete LTI convolution (x * h)[n] = sum_k x[k] h[n - k] flip-and-slide scrubber.
// Top row shows input stems x[k] and flipped-and-shifted impulse response h[n - k];
// bottom row shows the running convolution output up to shift n.

import { responsiveSvg, s, attr, handle, row, button, formula, slider, clamp, scale, label, type Mount } from './lib';

const mount: Mount = (root) => {
  let shiftN = 0; // shift index n in [-2..9]

  const pad = { l: 30, r: 30, t: 25, b: 25 };
  const view = responsiveSvg(root, {
    label: 'Discrete LTI convolution flip-and-slide scrubber',
    aspect: 0.5,
    minH: 240,
    maxH: 360,
  });
  const svgEl = view.el;

  const xSeq = [1, 2, 1, 0.5]; // indices 0, 1, 2, 3
  const hSeq = [1, 1, 0.5];   // indices 0, 1, 2

  const gTop = s('g', {}, svgEl);
  const gBot = s('g', {}, svgEl);

  const axTop = s('line', { class: 'ax' }, gTop);
  const axBot = s('line', { class: 'ax' }, gBot);
  const lblTop = label(gTop, 0, 0, 'Inputs x[k] and flipped h[n − k]', 'lbl-fg', 'start');
  const lblBot = label(gBot, 0, 0, 'Convolution Output (x * h)[n]', 'lbl-fg', 'start');

  const stemsGroup = s('g', {}, gTop);
  const outGroup = s('g', {}, gBot);

  const hd = handle(svgEl, {
    label: 'Convolution shift n',
    x: 0,
    y: 0,
    valueText: () => `shift n ${shiftN}`,
    onDrag: (px) => {
      const x0 = view.W * 0.15;
      const x1 = view.W - pad.r;
      shiftN = clamp(Math.round(scale(x0, x1, -2, 9).invert(px)), -2, 9);
      shiftSlider.set(shiftN);
      draw();
    },
    onKey: (dx, _dy, big) => {
      shiftN = clamp(shiftN + dx * (big ? 3 : 1), -2, 9);
      shiftSlider.set(shiftN);
      draw();
    },
  });

  const f = formula(root);
  const r = row(root);
  const shiftSlider = slider(r, {
    label: 'Shift n',
    texLabel: 'n',
    min: -2,
    max: 9,
    step: 1,
    value: shiftN,
    format: (v) => String(v),
    onInput: (v) => { shiftN = v; draw(); },
  });
  button(r, 'Reset', () => {
    shiftN = 0;
    shiftSlider.set(shiftN);
    draw();
  });

  function draw() {
    const W = view.W;
    const H = view.H;
    const x0 = W * 0.12;
    const x1 = W - pad.r;

    // Top panel geometry (title at y=16, axis at H*0.36, max stem 2*20=40px -> top at y>=48, well below title)
    const yTop = H * 0.36;
    attr(axTop, { x1: x0 - 10, x2: x1, y1: yTop, y2: yTop });
    attr(lblTop, { x: x0 - 10, y: 16 });

    // Bottom panel geometry (title at H*0.62, axis at H*0.90, max stem 2.5*18=45px -> top at y>=H*0.70, well below title)
    const yBot = H * 0.90;
    attr(axBot, { x1: x0 - 10, x2: x1, y1: yBot, y2: yBot });
    attr(lblBot, { x: x0 - 10, y: H * 0.62 });

    // Map k in [-2..8] to x coordinates
    const kMin = -2;
    const kMax = 8;
    const getX = (k: number) => scale(kMin, kMax, x0, x1)(k);

    stemsGroup.replaceChildren();
    // Draw x[k] stems (solid up) and h[n-k] stems (accent down)
    let overlapSum = 0;
    for (let k = kMin; k <= kMax; k++) {
      const px = getX(k);
      const xVal = (k >= 0 && k < xSeq.length) ? xSeq[k] : 0;
      if (xVal > 0) {
        s('line', { class: 'line', x1: px, y1: yTop, x2: px, y2: yTop - xVal * 20 }, stemsGroup);
        s('circle', { class: 'dot', cx: px, cy: yTop - xVal * 20, r: 3.5 }, stemsGroup);
      }

      const hIdx = shiftN - k;
      const hVal = (hIdx >= 0 && hIdx < hSeq.length) ? hSeq[hIdx] : 0;
      if (hVal > 0) {
        s('line', { class: 'line-acc', x1: px, y1: yTop, x2: px, y2: yTop + hVal * 22 }, stemsGroup);
        s('circle', { class: 'dot-acc', cx: px, cy: yTop + hVal * 22, r: 3.5 }, stemsGroup);
      }

      if (xVal > 0 && hVal > 0) {
        overlapSum += xVal * hVal;
      }
    }

    // Bottom panel output stems up to shiftN
    outGroup.replaceChildren();
    for (let n = kMin; n <= kMax; n++) {
      if (n <= shiftN) {
        let val = 0;
        for (let k = 0; k < xSeq.length; k++) {
          const hk = n - k;
          if (hk >= 0 && hk < hSeq.length) {
            val += xSeq[k] * hSeq[hk];
          }
        }
        const px = getX(n);
        s('line', { class: 'line-acc', x1: px, y1: yBot, x2: px, y2: yBot - val * 18 }, outGroup);
        s('circle', { class: 'dot-acc', cx: px, cy: yBot - val * 18, r: 4 }, outGroup);
      }
    }

    // Place handle on the h[n-k] leading stem (k = shiftN) below yTop so it never collides with lblTop or x[k]
    hd.move(getX(shiftN), yTop + 22);

    f.set(`(x * h)[${shiftN}] = \\sum_{k} x[k]h[${shiftN} - k] = ${overlapSum.toFixed(1)}`);
  }

  view.onResize(draw);
  draw();
};

export default mount;
