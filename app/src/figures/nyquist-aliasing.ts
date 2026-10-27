// Signal Processing, figure: nyquist-aliasing.ts
// Continuous sinusoid cos(2 pi f_0 t) (curve-muted) sampled at f_s = 8 Hz (dot-acc sample points)
// along with the unique reconstructed baseband alias cos(2 pi f_alias t) (curve-acc) passing through those exact samples.

import { responsiveSvg, s, attr, handle, row, button, formula, slider, clamp, scale, label, type Mount } from './lib';

const mount: Mount = (root) => {
  let f0 = 2.5; // signal frequency in Hz
  const fs = 8.0; // sampling rate in Hz

  const pad = { l: 30, r: 30, t: 30, b: 30 };
  const view = responsiveSvg(root, {
    label: 'Nyquist aliasing demonstration with continuous and aliased reconstruction',
    aspect: 0.45,
    minH: 230,
    maxH: 360,
  });
  const svgEl = view.el;

  const g = s('g', {}, svgEl);
  const axX = s('line', { class: 'ax' }, g);
  const axY = s('line', { class: 'ax' }, g);
  const trueCurve = s('path', { class: 'curve-muted' }, g);
  const aliasCurve = s('path', { class: 'curve-acc' }, g);
  const samplesGroup = s('g', {}, g);
  const lbl = label(g, 0, 0, 'Sampled vs Aliased Wave (f_s = 8 Hz)', 'lbl-fg', 'middle');

  const hd = handle(svgEl, {
    label: 'Signal frequency f_0',
    x: 0,
    y: 0,
    valueText: () => `f_0 ${f0.toFixed(2)} Hz`,
    onDrag: (px) => {
      const x0 = view.W * 0.1;
      const x1 = view.W - pad.r;
      f0 = clamp(scale(x0, x1, 0.5, 7.5).invert(px), 0.5, 7.5);
      freqSlider.set(f0);
      draw();
    },
    onKey: (dx, _dy, big) => {
      f0 = clamp(f0 + dx * (big ? 0.5 : 0.1), 0.5, 7.5);
      freqSlider.set(f0);
      draw();
    },
  });

  const f = formula(root);
  const r = row(root);
  const freqSlider = slider(r, {
    label: 'Signal Freq f_0',
    texLabel: 'f_0',
    min: 0.5,
    max: 7.5,
    step: 0.1,
    value: f0,
    format: (v) => v.toFixed(1) + ' Hz',
    onInput: (v) => { f0 = v; draw(); },
  });
  button(r, 'Reset', () => {
    f0 = 2.5;
    freqSlider.set(f0);
    draw();
  });

  function draw() {
    const W = view.W;
    const H = view.H;
    const x0 = W * 0.1;
    const x1 = W - pad.r;
    const cy = H * 0.56;
    const rH = H * 0.32;

    attr(axX, { x1: x0 - 10, x2: x1, y1: cy, y2: cy });
    attr(axY, { x1: x0, x2: x0, y1: cy - rH - 8, y2: cy + rH + 8 });
    attr(lbl, { x: W / 2, y: 18 });

    const tMax = 1.0; // 1 second duration
    const steps = 120;

    // True signal curve cos(2 pi f_0 t)
    const truePts: string[] = [];
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * tMax;
      const val = Math.cos(2 * Math.PI * f0 * t);
      const px = scale(0, tMax, x0, x1)(t);
      const py = cy - val * rH;
      truePts.push(`${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
    }
    attr(trueCurve, { d: truePts.join(' ') });

    // Compute alias frequency: fold(f0, fs) = |f0 - round(f0/fs) * fs|
    const kFold = Math.round(f0 / fs);
    const fAlias = Math.abs(f0 - kFold * fs);

    // Reconstructed alias curve cos(2 pi f_alias t)
    const aliasPts: string[] = [];
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * tMax;
      const val = Math.cos(2 * Math.PI * fAlias * t);
      const px = scale(0, tMax, x0, x1)(t);
      const py = cy - val * rH;
      aliasPts.push(`${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
    }
    attr(aliasCurve, { d: aliasPts.join(' ') });

    // Sample points at t = n / fs
    samplesGroup.replaceChildren();
    const numSamples = Math.floor(tMax * fs);
    for (let n = 0; n <= numSamples; n++) {
      const t = n / fs;
      const val = Math.cos(2 * Math.PI * f0 * t);
      const px = scale(0, tMax, x0, x1)(t);
      const py = cy - val * rH;
      s('circle', { class: 'dot-acc', cx: px, cy: py, r: 5 }, samplesGroup);
      if (n === 2) {
        hd.move(px, py);
      }
    }

    f.set(`f_0=${f0.toFixed(1)},\\ f_s=8,\\ f_{\\text{alias}}=${fAlias.toFixed(1)}\\text{ Hz}`);
  }

  view.onResize(draw);
  draw();
};

export default mount;
