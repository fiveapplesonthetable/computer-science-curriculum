// Chapter 7: Quicksort Lomuto Partition Visualization
import { responsiveSvg, s, handle, row, button, formula, note, slider, clamp, scale, label, type Mount } from './lib';

const initialArray = [2, 8, 7, 1, 3, 5, 6, 4];
const pivotVal = 4;

const mount: Mount = (root) => {
  let jIdx = 4;
  const pad = { l: 40, r: 30, t: 30, b: 50 };

  const view = responsiveSvg(root, {
    label: 'Lomuto partition trace showing <= x, > x, unexplored regions, and pivot',
    aspect: 0.5,
    minH: 240,
    maxH: 340,
  });
  const svgEl = view.el;

  const barsGroup = s('g', {}, svgEl);
  const textGroup = s('g', {}, svgEl);

  const hd = handle(svgEl, {
    label: 'Scan index j scrubber',
    x: 0,
    y: 0,
    valueText: () => `j = ${jIdx}`,
    onDrag: (px) => {
      const W = view.W;
      const xMin = pad.l;
      const xMax = W - pad.r;
      const k = clamp((px - xMin) / (xMax - xMin), 0, 1);
      setJ(Math.round(k * initialArray.length));
    },
    onKey: (_dx, dy, big) => {
      setJ(jIdx + (big ? 3 : 1) * (dy !== 0 ? dy : 1));
    },
  });

  const f = formula(root);
  const nBox = note(root);
  const r = row(root);
  const sld = slider(r, {
    label: 'Scan j',
    min: 0,
    max: initialArray.length,
    step: 1,
    value: jIdx,
    onInput: (v) => setJ(v),
  });
  button(r, 'Reset', () => setJ(0));

  function setJ(v: number) {
    jIdx = clamp(v, 0, initialArray.length);
    sld.set(jIdx);
    draw();
  }

  function draw() {
    const { W, H } = view;
    const n = initialArray.length;
    const xMin = pad.l;
    const xMax = W - pad.r;
    const barW = (xMax - xMin) / n - 8;
    const yMax = Math.max(...initialArray) + 1;
    const y = scale(0, yMax, H - pad.b, pad.t);

    barsGroup.replaceChildren();
    textGroup.replaceChildren();

    label(textGroup, xMin, 18, 'A[p..i] ≤ pivot  ·  A[i+1..j−1] > pivot  ·  pivot', 'lbl', 'start');
    s('line', { class: 'ax', x1: xMin, x2: xMax, y1: H - 20, y2: H - 20 }, barsGroup);
    const handleX = xMin + (jIdx / n) * (xMax - xMin);
    hd.move(handleX, H - 20);

    let iCount = 0;
    initialArray.forEach((val, idx) => {
      if (idx < jIdx && val <= pivotVal) iCount++;
    });
    const iIdx = Math.max(-1, iCount - 1);

    // Draw boundary dividers at i and j
    if (iIdx >= 0) {
      const iDivX = xMin + (iIdx + 1) * ((xMax - xMin) / n);
      s('line', { class: 'edge', x1: iDivX, x2: iDivX, y1: pad.t, y2: H - pad.b }, barsGroup);
    }
    if (jIdx > 0 && jIdx < n) {
      const jDivX = xMin + jIdx * ((xMax - xMin) / n);
      s('line', { class: 'line-muted', x1: jDivX, x2: jDivX, y1: pad.t, y2: H - pad.b }, barsGroup);
    }

    initialArray.forEach((val, idx) => {
      const bx = xMin + idx * ((xMax - xMin) / n) + 4;
      const by = y(val);
      const bH = y(0) - y(val);

      let cls = 'bar';
      if (idx === n - 1) cls = 'dot-acc'; // pivot
      else if (idx <= iIdx) cls = 'area-tp'; // <= x
      else if (idx < jIdx) cls = 'area-fp'; // > x

      s('rect', { class: cls, x: bx, y: by, width: barW, height: bH, rx: 4 }, barsGroup);
      label(textGroup, bx + barW / 2, H - pad.b + 18, String(val), idx === n - 1 ? 'lbl-acc' : 'lbl');
    });

    f.set(`j=${jIdx},\\ \\text{pivot}=${pivotVal},\\ i=${iIdx}\\ (A[p..i]\\le ${pivotVal})`);
    const scanDesc =
      jIdx === 0
        ? `Start of partition: pivot x = ${pivotVal} sits at the right end; scan pointer j = 0 has not inspected any elements yet.`
        : jIdx < n
          ? `After scanning ${jIdx} element(s), ${iCount} element(s) ≤ ${pivotVal} are packed in the left region and ${jIdx - iCount} element(s) > ${pivotVal} sit in the middle region.`
          : `Scan complete: ${iCount} elements ≤ ${pivotVal} lie to the left of index ${iIdx + 1}, ready for the final swap placing pivot ${pivotVal} at its exact sorted rank!`;
    nBox.set(scanDesc);
  }

  view.onResize(draw);
  draw();
};

export default mount;
