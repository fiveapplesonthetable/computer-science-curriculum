// Chapter 15: Dynamic Programming Table Scrubber & Dependency Visualizer
import { responsiveSvg, s, handle, row, button, formula, slider, clamp, label, type Mount } from './lib';

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
    const xMin = pad.l;
    const xMax = W - pad.r;
    const cellW = (xMax - xMin) / n;
    const cellY = H / 2 - 20;

    s('line', { class: 'ax', x1: xMin, x2: xMax, y1: H - 20, y2: H - 20 }, tableGroup);
    const handleX = xMin + (filledCells / (n - 1)) * (xMax - xMin);
    hd.move(handleX, H - 20);

    tableValues.forEach((val, idx) => {
      const cx = xMin + idx * cellW + 2;
      const cw = cellW - 4;
      const ch = 45;
      const cy = cellY - ch / 2;

      let cls = 'bar';
      if (idx <= filledCells) cls = idx === filledCells ? 'area-fp' : 'area-tp';

      s('rect', { class: cls, x: cx, y: cy, width: cw, height: ch, rx: 6 }, tableGroup);
      label(textGroup, cx + cw / 2, cy + ch / 2 + 5, idx <= filledCells ? String(val) : '?', idx === filledCells ? 'lbl-acc' : 'lbl');
      label(textGroup, cx + cw / 2, cy + ch + 18, `r[${idx}]`, 'lbl');
    });

    f.set(`i=${filledCells},\\ \\text{Optimal revenue } r[${filledCells}]=${tableValues[filledCells]}`);
  }

  view.onResize(draw);
  draw();
};

export default mount;
