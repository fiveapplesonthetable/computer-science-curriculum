// Languages Ch 3: Rust Ownership, Aliasing XOR Mutability, and Non-Lexical Lifetimes
import { responsiveSvg, s, handle, row, button, formula, note, slider, clamp, scale, label, type Mount } from './lib';

interface TraceStep {
  code: string;
  vState: string;
  borrows: string;
  heap: number[];
  readers: number;
  writers: number;
  mode: 'owner' | 'shared' | 'mut' | 'dropped';
  why: string;
}

const STEPS: TraceStep[] = [
  {
    code: '1. let mut v = vec![10, 20];',
    vState: 'v: R + W + O',
    borrows: 'borrows: none',
    heap: [10, 20],
    readers: 1,
    writers: 1,
    mode: 'owner',
    why: 'Line 1: v owns the heap buffer uniquely (ptr, len=2, cap=2) with Read, Write, and Own permissions.',
  },
  {
    code: '2. let r1 = &v; let r2 = &v;',
    vState: 'v: R (W frozen)',
    borrows: 'r1: &v (R), r2: &v (R)',
    heap: [10, 20],
    readers: 3,
    writers: 0,
    mode: 'shared',
    why: 'Line 2: Two shared borrows (&v) alias the buffer safely because mutation (W) on v is frozen while they live.',
  },
  {
    code: '3. let sum = r1[0] + r2[1];',
    vState: 'v: R + W + O',
    borrows: 'r1, r2 ended (NLL)',
    heap: [10, 20],
    readers: 1,
    writers: 1,
    mode: 'owner',
    why: 'Line 3: Non-Lexical Lifetimes (NLL) end r1 and r2 right after their last read — before the enclosing brace closes.',
  },
  {
    code: '4. let m = &mut v;',
    vState: 'v: frozen',
    borrows: 'm: &mut v (R + W)',
    heap: [10, 20],
    readers: 1,
    writers: 1,
    mode: 'mut',
    why: 'Line 4: m takes an exclusive mutable borrow (&mut v); v itself cannot even be read until m finishes.',
  },
  {
    code: '5. m.push(30);',
    vState: 'v: R + W + O',
    borrows: 'm ended (NLL)',
    heap: [10, 20, 30],
    readers: 1,
    writers: 1,
    mode: 'owner',
    why: 'Line 5: m mutates the heap buffer with zero competing aliases (no iterator invalidation), then NLL ends m.',
  },
  {
    code: '6. } // scope exit -> drop(v)',
    vState: 'v: moved / dropped',
    borrows: 'heap freed once',
    heap: [],
    readers: 0,
    writers: 0,
    mode: 'dropped',
    why: 'Line 6: Scope exit runs Drop::drop(&mut v) deterministically — freeing the heap slab once with zero GC pause.',
  },
];

const mount: Mount = (root) => {
  let stepIdx = 2; // start at step 3 (middle of 0..5)
  const pad = { l: 18, r: 18 };

  const view = responsiveSvg(root, {
    label: 'Rust ownership, shared borrows, exclusive mutable borrow, and NLL timeline',
    aspect: 0.56,
    minH: 245,
    maxH: 310,
  });
  const svgEl = view.el;
  const gBoxes = s('g', {}, svgEl);
  const gText = s('g', {}, svgEl);
  const gRail = s('g', {}, svgEl);

  const hd = handle(svgEl, {
    label: 'Program line scrubber',
    x: 0,
    y: 0,
    valueText: () => `Line ${stepIdx + 1}: ${STEPS[stepIdx].code}`,
    onDrag: (px) => {
      const W = view.W;
      const k = clamp((px - pad.l) / Math.max(1, W - pad.l - pad.r), 0, 1);
      setStep(Math.round(k * (STEPS.length - 1)));
    },
    onKey: (dx, dy) => {
      const d = dx !== 0 ? dx : dy;
      setStep(clamp(stepIdx + d, 0, STEPS.length - 1));
    },
  });

  const f = formula(root);
  const nBox = note(root);
  const r1 = row(root);
  const sld = slider(r1, {
    label: 'Line',
    min: 1,
    max: STEPS.length,
    step: 1,
    value: stepIdx + 1,
    onInput: (v) => setStep(v - 1),
  });
  button(r1, 'Reset', () => setStep(1));

  function setStep(idx: number) {
    stepIdx = clamp(idx, 0, STEPS.length - 1);
    sld.set(stepIdx + 1);
    draw();
  }

  function draw() {
    const { W, H } = view;
    gBoxes.replaceChildren();
    gText.replaceChildren();
    gRail.replaceChildren();

    const st = STEPS[stepIdx];
    const leftX = pad.l;
    const leftW = Math.round((W - pad.l - pad.r) * 0.48);
    const rightX = leftX + leftW + Math.round((W - pad.l - pad.r) * 0.08);
    const rightW = W - pad.r - rightX;

    // Header code line
    label(gText, leftX, 20, st.code, 'lbl-fg', 'start');

    // Stack frame cards
    const boxY1 = 36;
    const boxH = 52;
    const boxY2 = boxY1 + boxH + 14;
    const vCls = st.mode === 'owner' ? 'area-tp' : st.mode === 'dropped' ? 'area-neg' : 'bar';
    const bCls = st.mode === 'shared' || st.mode === 'mut' ? 'area-tp' : 'bar';

    s('rect', { class: vCls, x: leftX, y: boxY1, width: leftW, height: boxH, rx: 6 }, gBoxes);
    label(gText, leftX + 10, boxY1 + 21, 'Stack owner', 'lbl', 'start');
    label(gText, leftX + 10, boxY1 + 41, st.vState, st.mode === 'owner' ? 'lbl-acc' : 'lbl-fg', 'start');

    s('rect', { class: bCls, x: leftX, y: boxY2, width: leftW, height: boxH, rx: 6 }, gBoxes);
    label(gText, leftX + 10, boxY2 + 21, 'Active borrows', 'lbl', 'start');
    label(gText, leftX + 10, boxY2 + 41, st.borrows, st.mode === 'shared' || st.mode === 'mut' ? 'lbl-acc' : 'lbl', 'start');

    // Heap slab on right
    const heapY = 48;
    const heapH = 92;
    s('rect', { class: st.mode === 'dropped' ? 'area-neg' : 'bar', x: rightX, y: heapY, width: rightW, height: heapH, rx: 6 }, gBoxes);
    label(gText, rightX + rightW / 2, heapY + 22, st.mode === 'dropped' ? 'Heap (freed)' : `Heap Vec (len=${st.heap.length})`, 'lbl', 'middle');

    if (st.heap.length > 0) {
      const n = 3;
      const cellGap = 4;
      const cellW = Math.max(24, Math.floor((rightW - 20 - cellGap * (n - 1)) / n));
      const startX = rightX + Math.floor((rightW - (cellW * n + cellGap * (n - 1))) / 2);
      for (let i = 0; i < n; i++) {
        const cx = startX + i * (cellW + cellGap);
        const cy = heapY + 34;
        const active = i < st.heap.length;
        s('rect', { class: active ? 'area-tp' : 'area-neg', x: cx, y: cy, width: cellW, height: 42, rx: 4 }, gBoxes);
        label(gText, cx + cellW / 2, cy + 26, active ? String(st.heap[i]) : '—', active ? 'lbl-acc' : 'lbl', 'middle');
      }

      // Pointer arrow from active path to heap
      const srcY = st.mode === 'shared' || st.mode === 'mut' ? boxY2 + boxH / 2 : boxY1 + boxH / 2;
      const lineCls = st.mode === 'mut' ? 'line-acc' : st.mode === 'shared' ? 'edge' : 'line';
      s('path', { class: lineCls, d: `M ${leftX + leftW + 2} ${srcY} L ${rightX - 3} ${heapY + heapH / 2}` }, gBoxes);
    }

    // Scrubber rail at bottom
    const railY = H - 24;
    const xPos = scale(0, STEPS.length - 1, pad.l, W - pad.r);
    s('line', { class: 'ax', x1: pad.l, x2: W - pad.r, y1: railY, y2: railY }, gRail);
    for (let i = 0; i < STEPS.length; i++) {
      s('circle', { class: i <= stepIdx ? 'dot-acc' : 'dot-dim', cx: xPos(i), cy: railY, r: 3.5 }, gRail);
    }
    hd.move(xPos(stepIdx), railY);

    f.set(`\\text{line } ${stepIdx + 1}:\\ \\text{readers}=${st.readers},\\ \\text{writers}=${st.writers}`);
    nBox.set(st.why);
  }

  view.onResize(draw);
  draw();
};

export default mount;
