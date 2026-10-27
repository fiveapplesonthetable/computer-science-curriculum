// Chapter 11: Hash Table Open Addressing Probing Visualizer
import { responsiveSvg, s, handle, row, button, formula, slider, clamp, label, type Mount } from './lib';

const keys = [22, 1, 13, 11, 24, 33, 18, 42];
const m = 11;

type ProbeMode = 'linear' | 'quadratic' | 'double';

const mount: Mount = (root) => {
  let insertedCount = 5;
  let mode: ProbeMode = 'linear';
  const pad = { l: 30, r: 30, t: 30, b: 50 };

  const view = responsiveSvg(root, {
    label: 'Open addressing collision probing visualization on m=11 slots',
    aspect: 0.5,
    minH: 240,
    maxH: 340,
  });
  const svgEl = view.el;

  const tableGroup = s('g', {}, svgEl);
  const arcsGroup = s('g', {}, svgEl);
  const textGroup = s('g', {}, svgEl);

  const hd = handle(svgEl, {
    label: 'Inserted keys scrubber',
    x: 0,
    y: 0,
    valueText: () => `${insertedCount} keys inserted`,
    onDrag: (px) => {
      const W = view.W;
      const xMin = pad.l;
      const xMax = W - pad.r;
      const k = clamp((px - xMin) / (xMax - xMin), 0, 1);
      setInserted(Math.round(k * keys.length));
    },
    onKey: (_dx, dy, _big) => {
      setInserted(clamp(insertedCount + (dy !== 0 ? dy : 1), 1, keys.length));
    },
  });

  const f = formula(root);
  const r1 = row(root);
  const sld = slider(r1, {
    label: 'Keys',
    min: 1,
    max: keys.length,
    step: 1,
    value: insertedCount,
    onInput: (v) => setInserted(v),
  });
  button(r1, 'Linear', () => setMode('linear'));
  button(r1, 'Quad', () => setMode('quadratic'));
  button(r1, 'Double', () => setMode('double'));
  button(r1, 'Reset', () => setInserted(3));

  function setInserted(v: number) {
    insertedCount = clamp(v, 1, keys.length);
    sld.set(insertedCount);
    draw();
  }

  function setMode(mVal: ProbeMode) {
    mode = mVal;
    draw();
  }

  function simulateTable(count: number) {
    const table: (number | null)[] = new Array(m).fill(null);
    let totalProbes = 0;

    for (let idx = 0; idx < count; idx++) {
      const k = keys[idx];
      const h1 = k % m;
      const h2 = 1 + (k % (m - 1));
      let slot = h1;
      let probes = 1;

      for (let i = 0; i < m; i++) {
        if (mode === 'linear') slot = (h1 + i) % m;
        else if (mode === 'quadratic') slot = (h1 + i * i) % m;
        else slot = (h1 + i * h2) % m;

        if (table[slot] === null) {
          table[slot] = k;
          break;
        }
        probes++;
      }
      totalProbes += probes;
    }
    return { table, avgProbes: totalProbes / count };
  }

  function draw() {
    const { W, H } = view;
    tableGroup.replaceChildren();
    arcsGroup.replaceChildren();
    textGroup.replaceChildren();

    const xMin = pad.l;
    const xMax = W - pad.r;
    const slotW = (xMax - xMin) / m;
    const slotY = H / 2 - 20;

    s('line', { class: 'ax', x1: xMin, x2: xMax, y1: H - 20, y2: H - 20 }, tableGroup);
    const handleX = xMin + (insertedCount / keys.length) * (xMax - xMin);
    hd.move(handleX, H - 20);

    const { table, avgProbes } = simulateTable(insertedCount);

    table.forEach((val, idx) => {
      const sx = xMin + idx * slotW + 2;
      const sw = slotW - 4;
      const sh = 45;
      const sy = slotY - sh / 2;

      const cls = val !== null ? 'area-tp' : 'bar';
      s('rect', { class: cls, x: sx, y: sy, width: sw, height: sh, rx: 6 }, tableGroup);
      label(textGroup, sx + sw / 2, sy + sh / 2 + 5, val !== null ? String(val) : '', val !== null ? 'lbl-acc' : 'lbl');
      label(textGroup, sx + sw / 2, sy + sh + 18, String(idx), 'lbl');
    });

    const alpha = insertedCount / m;
    f.set(`\\text{${mode}}:\\ \\alpha=${alpha.toFixed(2)},\\ \\text{probes}=${avgProbes.toFixed(2)}`);
  }

  view.onResize(draw);
  draw();
};

export default mount;
