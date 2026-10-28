// Chapter 15: Dynamic Programming Table Scrubber & Dependency Visualizer
import { responsiveSvg, s, handle, row, button, formula, note, slider, clamp, label, type Mount } from './lib';

const mount: Mount = (root) => {
  let filledCells = 4;
  const tableValues = [0, 1, 5, 8, 10, 13, 17, 20];
  const pad = { l: 30, r: 30, t: 30, b: 50 };

  const view = responsiveSvg(root, {
    label: 'Dynamic programming bottom-up table filling and predecessor dependency subproblems',
    aspect: 0.5,
    minH: 240,
    maxH: 340,
  });
  const svgEl = view.el;

  const tableGroup = s('g', {}, svgEl);
  const arrowsGroup = s('g', {}, svgEl);
  const textGroup = s('g', {}, svgEl);

  const hd = handle(svgEl, {
    label: 'DP cell scrubber',
    x: 0,
    y: 0,
    valueText: () => `Cell ${filledCells} of ${tableValues.length - 1}`,
    onDrag: (px) => {
      const W = view.W;
      const xMin = pad.l;
      const xMax = W - pad.r;
      const k = clamp((px - xMin) / (xMax - xMin), 0, 1);
      setCells(Math.round(k * (tableValues.length - 1)));
    },
    onKey: (_dx, dy, _big) => {
      setCells(clamp(filledCells + (dy !== 0 ? dy : 1), 0, tableValues.length - 1));
    },
  });

  const f = formula(root);
  const nBox = note(root);
  const r1 = row(root);
  const sld = slider(r1, {
    label: 'Filled cells',
    min: 0,
    max: tableValues.length - 1,
    step: 1,
    value: filledCells,
    onInput: (v) => setCells(v),
  });
  button(r1, 'Reset', () => setCells(0));

  function setCells(v: number) {
    filledCells = clamp(v, 0, tableValues.length - 1);
    sld.set(filledCells);
    draw();
  }

  function draw() {
    const { W, H } = view;
    tableGroup.replaceChildren();
    arrowsGroup.replaceChildren();
    textGroup.replaceChildren();

    const n = tableValues.length;
    const firstCut = [0, 1, 2, 3, 2, 2, 6, 1];
    const cutPrices = [0, 1, 5, 8, 9, 10, 17, 17];
    const xMin = pad.l;
    const xMax = W - pad.r;
    const cellW = (xMax - xMin) / n;
    const cellY = H / 2 - 12;

    label(textGroup, xMin, 18, 'bottom-up DP table r[0..7]', 'lbl', 'start');
    s('line', { class: 'ax', x1: xMin, x2: xMax, y1: H - 20, y2: H - 20 }, tableGroup);
    const handleX = xMin + (filledCells / (n - 1)) * (xMax - xMin);
    hd.move(handleX, H - 20);

    const kCut = firstCut[filledCells];
    const predIdx = filledCells - kCut;
    if (filledCells > 0) {
      const x0 = xMin + (predIdx + 0.5) * cellW;
      const x1 = xMin + (filledCells + 0.5) * cellW;
      const topY = cellY - 24;
      const midX = (x0 + x1) / 2;
      s('path', { class: 'edge', d: `M ${x0.toFixed(1)} ${topY} Q ${midX.toFixed(1)} ${topY - 28} ${x1.toFixed(1)} ${topY}` }, arrowsGroup);
    }

    tableValues.forEach((val, idx) => {
      const cx = xMin + idx * cellW + 2;
      const cw = cellW - 4;
      const ch = 45;
      const cy = cellY - ch / 2;

      let cls = 'bar';
      if (idx <= filledCells) cls = idx === filledCells ? 'area-fp' : idx === predIdx && filledCells > 0 ? 'dot-ring' : 'area-tp';

      s('rect', { class: cls, x: cx, y: cy, width: cw, height: ch, rx: 6 }, tableGroup);
      label(textGroup, cx + cw / 2, cy + ch / 2 + 5, idx <= filledCells ? String(val) : '?', idx === filledCells ? 'lbl-acc' : 'lbl');
      label(textGroup, cx + cw / 2, cy + ch + 18, `r[${idx}]`, 'lbl');
    });

    f.set(`i=${filledCells},\\ r[${filledCells}] = p[${kCut}] + r[${predIdx}] = ${cutPrices[kCut]} + ${tableValues[predIdx]} = ${tableValues[filledCells]}`);
    nBox.set(
      filledCells === 0
        ? 'Base case r[0] = 0: a rod of length 0 yields 0 revenue and anchors every subsequent bottom-up lookup.'
        : `To compute r[${filledCells}], DP checks all first cuts 1..${filledCells} in already-solved cells r[0..${filledCells - 1}]; the optimal cut k = ${kCut} adds price p[${kCut}] = ${cutPrices[kCut]} to precomputed r[${predIdx}] = ${tableValues[predIdx]}.`,
    );
  }

  view.onResize(draw);
  draw();
};

export default mount;
