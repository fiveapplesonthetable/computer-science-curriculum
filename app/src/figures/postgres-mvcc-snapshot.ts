// Databases Ch 5: PostgreSQL MVCC Tuple Chain & Snapshot Visibility Horizon
import { responsiveSvg, s, handle, row, button, formula, note, slider, clamp, scale, label, type Mount } from './lib';

interface HeapTuple {
  ctid: string;
  bal: string;
  xmin: number;
  xmax: number; // 0 means infinity / not deleted
  xmaxAborted?: boolean;
  xminAborted?: boolean;
}

const TUPLES: HeapTuple[] = [
  { ctid: '(0,1)', bal: '$100', xmin: 100, xmax: 102 },
  { ctid: '(0,2)', bal: '$180', xmin: 102, xmax: 104 },
  { ctid: '(0,3)', bal: '$130', xmin: 104, xmax: 105, xmaxAborted: true },
  { ctid: '(0,4)', bal: '$250', xmin: 105, xmax: 0, xminAborted: true },
];

function classifyTuple(t: HeapTuple, snapXmax: number): 'visible' | 'dead' | 'future' {
  if (t.xminAborted || t.xmin >= snapXmax) return 'future';
  if (t.xmax === 0 || t.xmaxAborted || t.xmax >= snapXmax) return 'visible';
  return 'dead';
}

const mount: Mount = (root) => {
  let snapTx = 103; // range 101..106, starts at 103 (middle)
  const minTx = 101;
  const maxTx = 106;
  const pad = { l: 16, r: 16 };

  const view = responsiveSvg(root, {
    label: 'PostgreSQL 8 KB heap page MVCC tuple chain visibility under moving snapshot horizon',
    aspect: 0.58,
    minH: 255,
    maxH: 320,
  });
  const svgEl = view.el;
  const gRows = s('g', {}, svgEl);
  const gText = s('g', {}, svgEl);
  const gRail = s('g', {}, svgEl);

  const hd = handle(svgEl, {
    label: 'Reader snapshot transaction horizon',
    x: 0,
    y: 0,
    valueText: () => `Snapshot xmax = ${snapTx}`,
    onDrag: (px) => {
      const W = view.W;
      const k = clamp((px - pad.l) / Math.max(1, W - pad.l - pad.r), 0, 1);
      setSnap(Math.round(minTx + k * (maxTx - minTx)));
    },
    onKey: (dx, dy) => {
      const d = dx !== 0 ? dx : dy;
      setSnap(clamp(snapTx + d, minTx, maxTx));
    },
  });

  const f = formula(root);
  const nBox = note(root);
  const r1 = row(root);
  const sld = slider(r1, {
    label: 'Snapshot xmax',
    min: minTx,
    max: maxTx,
    step: 1,
    value: snapTx,
    onInput: (v) => setSnap(v),
  });
  button(r1, 'Reset', () => setSnap(103));

  function setSnap(v: number) {
    snapTx = clamp(v, minTx, maxTx);
    sld.set(snapTx);
    draw();
  }

  function draw() {
    const { W, H } = view;
    gRows.replaceChildren();
    gText.replaceChildren();
    gRail.replaceChildren();

    const innerW = W - pad.l - pad.r;
    label(gText, pad.l, 19, `Page 0 tuple chain (tx 105 aborted in pg_xact)`, 'lbl', 'start');

    const startY = 30;
    const rowH = 38;
    const rowGap = 7;

    let visTuple: HeapTuple = TUPLES[0];
    let deadCount = 0;

    TUPLES.forEach((t, i) => {
      const st = classifyTuple(t, snapTx);
      if (st === 'visible') visTuple = t;
      if (st === 'dead') deadCount++;

      const ry = startY + i * (rowH + rowGap);
      const cls = st === 'visible' ? 'area-tp' : st === 'dead' ? 'area-neg' : 'bar';
      s('rect', { class: cls, x: pad.l, y: ry, width: innerW, height: rowH, rx: 5 }, gRows);

      const xmaxTxt = t.xmax === 0 ? '∞' : t.xmaxAborted ? `${t.xmax}✗` : String(t.xmax);
      const xminTxt = t.xminAborted ? `${t.xmin}✗` : String(t.xmin);
      const statusTxt = st === 'visible' ? 'VISIBLE' : st === 'dead' ? 'DEAD' : 'INVISIBLE';

      label(gText, pad.l + 10, ry + 24, `${t.ctid} ${t.bal}`, st === 'visible' ? 'lbl-acc' : 'lbl-fg', 'start');
      label(gText, pad.l + Math.round(innerW * 0.50), ry + 24, `[${xminTxt}, ${xmaxTxt})`, 'lbl', 'middle');
      label(gText, pad.l + innerW - 10, ry + 24, statusTxt, st === 'visible' ? 'lbl-acc' : 'lbl', 'end');
    });

    // Bottom rail
    const railY = H - 22;
    const xPos = scale(minTx, maxTx, pad.l, W - pad.r);
    s('line', { class: 'ax', x1: pad.l, x2: W - pad.r, y1: railY, y2: railY }, gRail);
    for (let tx = minTx; tx <= maxTx; tx++) {
      s('circle', { class: tx <= snapTx ? 'dot-acc' : 'dot-dim', cx: xPos(tx), cy: railY, r: 3.5 }, gRail);
    }
    hd.move(xPos(snapTx), railY);

    f.set(`\\text{xmax}=${snapTx}:\\ ${visTuple.ctid}\\ (\\${visTuple.bal}),\\ \\text{dead}=${deadCount}`);
    nBox.set(
      snapTx >= 105
        ? `At snapshot xmax = ${snapTx}: tx 105 aborted in pg_xact, so (0,4) is invisible without rewriting the heap page, and (0,3)’s aborted xmax = 105 is ignored — leaving (0,3) ($130) visible and ${deadCount} older versions reclaimable by VACUUM.`
        : `At snapshot xmax = ${snapTx}: ${visTuple.ctid} (${visTuple.bal}) satisfies xmin < ${snapTx} and xmax ≥ ${snapTx}, while ${deadCount} superseded tuple(s) have committed xmax < ${snapTx}.`,
    );
  }

  view.onResize(draw);
  draw();
};

export default mount;
