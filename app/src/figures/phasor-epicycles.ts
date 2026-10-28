// Signal Processing, figure: phasor-epicycles.ts
// Rotating complex exponential phasor z(t) = A e^{j(omega t + phi)} on the left unit circle
// projecting horizontally onto the real cosine wave on the right time-domain plot.

import { responsiveSvg, s, attr, handle, row, button, formula, note, slider, clamp, scale, label, type Mount } from './lib';

const mount: Mount = (root) => {
  let A = 1.0;
  let omega = 2.0; // rad/s or freq scaling
  let phi = 0.0;   // phase
  let tAnim = 0.35;
  let running = false;
  let lastTime = performance.now();

  const pad = { l: 30, r: 30, t: 30, b: 30 };
  const view = responsiveSvg(root, {
    label: 'Rotating complex phasor projecting onto real cosine wave',
    aspect: 0.45,
    minH: 230,
    maxH: 360,
  });
  const svgEl = view.el;

  // Left circle (complex plane) group and Right time plot group
  const gLeft = s('g', {}, svgEl);
  const gRight = s('g', {}, svgEl);

  // Left circle elements
  const axX = s('line', { class: 'ax' }, gLeft);
  const axY = s('line', { class: 'ax' }, gLeft);
  const circle = s('circle', { class: 'curve-muted', r: '1' }, gLeft);
  const phasorLine = s('line', { class: 'curve-acc' }, gLeft);
  const projLine = s('line', { class: 'line-muted' }, svgEl); // bridge between left and right
  const tipDot = s('circle', { class: 'dot-acc', r: '5' }, gLeft);

  // Right time elements
  const rAxX = s('line', { class: 'ax' }, gRight);
  const rAxY = s('line', { class: 'ax' }, gRight);
  const waveCurve = s('path', { class: 'curve' }, gRight);
  const waveDot = s('circle', { class: 'dot-acc', r: '5' }, gRight);

  // Labels
  const lblLeft = label(gLeft, 0, 0, 'Complex Plane', 'lbl', 'middle');
  const lblRight = label(gRight, 0, 0, 'Time Domain Re{z(t)}', 'lbl', 'middle');

  const hd = handle(svgEl, {
    label: 'Phasor tip angle and amplitude',
    x: 0,
    y: 0,
    valueText: () => `A ${A.toFixed(2)}, angle ${(omega * tAnim + phi).toFixed(2)} rad`,
    onDrag: (px, py) => {
      // map px, py back to center of left circle
      const cx = view.W * 0.25;
      const cy = view.H * 0.5;
      const radius = Math.min(view.W * 0.2, view.H * 0.35);
      const dx = (px - cx) / radius;
      const dy = (py - cy) / radius;
      A = clamp(Math.sqrt(dx * dx + dy * dy), 0.3, 1.2);
      const targetAngle = Math.atan2(-dy, dx); // SVG y is down
      // adjust phi so targetAngle = omega * tAnim + phi
      phi = targetAngle - omega * tAnim;
      ampSlider.set(A);
      phaseSlider.set(phi);
      draw();
    },
    onKey: (_dx, dy, big) => {
      phi += dy * (big ? 0.2 : 0.05);
      phaseSlider.set(phi);
      draw();
    },
  });

  const f = formula(root);
  const nBox = note(root);
  const r = row(root);
  const ampSlider = slider(r, {
    label: 'Amplitude A',
    texLabel: 'A',
    min: 0.3,
    max: 1.2,
    step: 0.05,
    value: A,
    format: (v) => v.toFixed(2),
    onInput: (v) => { A = v; draw(); },
  });
  const phaseSlider = slider(r, {
    label: 'Phase \\varphi',
    texLabel: '\\varphi',
    min: -3.14,
    max: 3.14,
    step: 0.1,
    value: phi,
    format: (v) => v.toFixed(2),
    onInput: (v) => { phi = v; draw(); },
  });
  const freqSlider = slider(r, {
    label: 'Freq \\omega',
    texLabel: '\\omega',
    min: 0.5,
    max: 5.0,
    step: 0.1,
    value: omega,
    format: (v) => v.toFixed(2),
    onInput: (v) => { omega = v; draw(); },
  });
  const runBtn = button(r, 'Play', () => {
    running = !running;
    runBtn.textContent = running ? 'Pause' : 'Play';
    runBtn.setAttribute('aria-pressed', String(running));
    if (running) {
      lastTime = performance.now();
      requestAnimationFrame(loop);
    }
  });
  button(r, 'Reset', () => {
    A = 1.0;
    omega = 2.0;
    phi = 0.0;
    tAnim = 0.35;
    running = false;
    runBtn.textContent = 'Play';
    runBtn.setAttribute('aria-pressed', 'false');
    ampSlider.set(A);
    phaseSlider.set(phi);
    freqSlider.set(omega);
    draw();
  });

  function draw() {
    const W = view.W;
    const H = view.H;
    const cx1 = W * 0.25;
    const cy1 = H * 0.55;
    const r1 = Math.min(W * 0.19, H * 0.32);

    // Left coordinate system
    attr(axX, { x1: cx1 - r1 - 12, x2: cx1 + r1 + 12, y1: cy1, y2: cy1 });
    attr(axY, { x1: cx1, x2: cx1, y1: cy1 - r1 - 10, y2: cy1 + r1 + 10 });
    attr(circle, { cx: cx1, cy: cy1, r: r1 });
    attr(lblLeft, { x: cx1, y: 18 });

    const theta = omega * tAnim + phi;
    const tipX = cx1 + A * r1 * Math.cos(theta);
    const tipY = cy1 - A * r1 * Math.sin(theta); // SVG y is inverted

    attr(phasorLine, { x1: cx1, y1: cy1, x2: tipX, y2: tipY });
    attr(tipDot, { cx: tipX, cy: tipY });
    hd.move(tipX, tipY);

    // Right side: time domain plot
    const x0 = W * 0.54;
    const x1 = W - pad.r;
    const cy2 = H * 0.55;
    const r2H = H * 0.30;

    attr(rAxX, { x1: x0, x2: x1, y1: cy2, y2: cy2 });
    attr(rAxY, { x1: x0, x2: x0, y1: cy2 - r2H - 10, y2: cy2 + r2H + 10 });
    attr(lblRight, { x: (x0 + x1) / 2, y: 18 });

    // Project line between tip and right y-axis
    attr(projLine, { x1: tipX, y1: tipY, x2: x0, y2: tipY });

    // Draw cosine wave over time [0, 4*pi] mapped to [x0, x1]
    const pts: string[] = [];
    const tMax = 4 * Math.PI;
    const steps = 80;
    for (let i = 0; i <= steps; i++) {
      const tVal = (i / steps) * tMax;
      const currentT = tAnim - (tMax / 2) + (tVal / tMax) * tMax;
      const val = A * Math.cos(omega * currentT + phi);
      const px = scale(0, tMax, x0, x1)(tVal);
      const py = cy2 - val * r2H;
      pts.push(`${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
    }
    attr(waveCurve, { d: pts.join(' ') });

    const currentPx = scale(0, tMax, x0, x1)(tMax / 2);
    const currentVal = A * Math.cos(theta);
    const currentPy = cy2 - currentVal * r2H;
    attr(waveDot, { cx: currentPx, cy: currentPy });

    f.set(`z(t)=${A.toFixed(1)}e^{j(${omega.toFixed(1)}t+${phi.toFixed(1)})},\\ \\operatorname{Re} z=${(A * Math.cos(theta)).toFixed(2)}`);
    nBox.set(
      `Euler’s formula e^{jθ} = cos θ + j sin θ turns uniform rotation at speed ω = ${omega.toFixed(1)} rad/s on the complex plane (left) into a real sinusoid of amplitude A = ${A.toFixed(2)} and phase φ = ${phi.toFixed(2)} rad in time (right).`,
    );
  }

  view.onResize(draw);

  function loop(now: number) {
    if (!running) return;
    const dt = (now - lastTime) / 1000;
    lastTime = now;
    tAnim += dt * 0.8;
    draw();
    requestAnimationFrame(loop);
  }
  draw();
};

export default mount;
