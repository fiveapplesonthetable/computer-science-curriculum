// Chapter 11: Hash Table Open Addressing Probing Visualizer
import { responsiveSvg, s, handle, row, button, formula, note, slider, clamp, label, type Mount } from './lib';

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
  const nBox = note(root);
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
    let lastTrail: number[] = [];

    for (let idx = 0; idx < count; idx++) {
      const k = keys[idx];
      const h1 = k % m;
      const h2 = 1 + (k % (m - 1));
      let slot = h1;
      let probes = 1;
      const trail: number[] = [];

      for (let i = 0; i < m; i++) {
        if (mode === 'linear') slot = (h1 + i) % m;
        else if (mode === 'quadratic') slot = (h1 + i * i) % m;
        else slot = (h1 + i * h2) % m;
        trail.push(slot);

        if (table[slot] === null) {
          table[slot] = k;
          break;
        }
        probes++;
      }
      totalProbes += probes;
      if (idx === count - 1) lastTrail = trail;
    }
    return { table, avgProbes: totalProbes / count, lastTrail };
  }

  function draw() {
    const { W, H } = view;
    tableGroup.replaceChildren();
    arcsGroup.replaceChildren();
    textGroup.replaceChildren();

    const xMin = pad.l;
    const xMax = W - pad.r;
    const slotW = (xMax - xMin) / m;
    const slotY = H / 2 - 12;

    label(textGroup, xMin, 18, `open addressing (m = 11, ${mode} probing)`, 'lbl', 'start');
    s('line', { class: 'ax', x1: xMin, x2: xMax, y1: H - 20, y2: H - 20 }, tableGroup);
    const handleX = xMin + (insertedCount / keys.length) * (xMax - xMin);
    hd.move(handleX, H - 20);

    const { table, avgProbes, lastTrail } = simulateTable(insertedCount);
    const lastSlot = lastTrail[lastTrail.length - 1];

    // Draw probe hop arcs for the most recently inserted key
    const topSlotY = slotY - 22.5;
    for (let t = 0; t < lastTrail.length - 1; t++) {
      const s0 = lastTrail[t];
      const s1 = lastTrail[t + 1];
      const x0 = xMin + (s0 + 0.5) * slotW;
      const x1 = xMin + (s1 + 0.5) * slotW;
      const midX = (x0 + x1) / 2;
      const arcH = Math.min(34, 14 + Math.abs(s1 - s0) * 3);
      s('path', { class: 'edge', d: `M ${x0.toFixed(1)} ${topSlotY - 2} Q ${midX.toFixed(1)} ${(topSlotY - arcH).toFixed(1)} ${x1.toFixed(1)} ${topSlotY - 2}` }, arcsGroup);
    }

    table.forEach((val, idx) => {
      const sx = xMin + idx * slotW + 2;
      const sw = slotW - 4;
      const sh = 45;
      const sy = slotY - sh / 2;

      const cls = idx === lastSlot ? 'area-fp' : val !== null ? 'area-tp' : 'bar';
      s('rect', { class: cls, x: sx, y: sy, width: sw, height: sh, rx: 6 }, tableGroup);
      label(textGroup, sx + sw / 2, sy + sh / 2 + 5, val !== null ? String(val) : '', val !== null ? 'lbl-acc' : 'lbl');
      label(textGroup, sx + sw / 2, sy + sh + 18, String(idx), 'lbl');
    });

    const alpha = insertedCount / m;
    const lastKey = keys[insertedCount - 1];
    f.set(`\\text{${mode}}:\\ \\alpha=${alpha.toFixed(2)},\\ \\text{avg probes}=${avgProbes.toFixed(2)}`);
    nBox.set(
      lastTrail.length === 1
        ? `Key ${lastKey} hashes directly to h₁(${lastKey}) = ${lastKey} mod 11 = ${lastTrail[0]} with 0 collisions (1 probe).`
        : `Key ${lastKey} starts at h₁(${lastKey}) = ${lastTrail[0]} and follows ${mode} probe path [${lastTrail.join(' → ')}] (${lastTrail.length} probes).`,
    );
  }

  view.onResize(draw);
  draw();
};

export default mount;
