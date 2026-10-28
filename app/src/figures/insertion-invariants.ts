// Chapter 2: Insertion Sort Invariants Visualization
import { responsiveSvg, s, handle, row, button, formula, note, slider, clamp, scale, label, type Mount } from './lib';

const initialArray = [5, 2, 4, 6, 1, 3, 8, 7];

// Precompute trace steps for insertion sort
interface TraceStep {
  j: number;
  i: number; // current scanning position during shift
  key: number;
  arr: number[];
  phase: 'select' | 'shift' | 'insert';
  comparisons: number;
  shifts: number;
}

function generateTrace(arr0: number[]): TraceStep[] {
  const arr = [...arr0];
  const steps: TraceStep[] = [];
  let comps = 0;
  let shifts = 0;

  steps.push({ j: 1, i: 0, key: arr[1], arr: [...arr], phase: 'select', comparisons: comps, shifts: shifts });

  for (let j = 1; j < arr.length; j++) {
    const key = arr[j];
    let i = j - 1;
    steps.push({ j, i, key, arr: [...arr], phase: 'select', comparisons: comps, shifts });

    while (i >= 0 && arr[i] > key) {
      comps++;
      steps.push({ j, i, key, arr: [...arr], phase: 'shift', comparisons: comps, shifts });
      arr[i + 1] = arr[i];
      shifts++;
      i--;
    }
    if (i >= 0) comps++; // final comparison that failed
    arr[i + 1] = key;
    steps.push({ j, i: i + 1, key, arr: [...arr], phase: 'insert', comparisons: comps, shifts });
  }
  return steps;
}

const trace = generateTrace(initialArray);

const mount: Mount = (root) => {
  let stepIdx = 0;
  const pad = { l: 40, r: 30, t: 30, b: 50 };

  const view = responsiveSvg(root, {
    label: 'Insertion Sort array snapshots showing sorted prefix invariant, current key, and unsorted suffix',
    aspect: 0.5,
    minH: 240,
    maxH: 340,
  });
  const svgEl = view.el;

  const bgGroup = s('g', {}, svgEl);
  const barsGroup = s('g', {}, svgEl);
  const textGroup = s('g', {}, svgEl);

  const hd = handle(svgEl, {
    label: 'Sorting step scrubber',
    x: 0,
    y: 0,
    valueText: () => `Step ${stepIdx + 1} of ${trace.length}`,
    onDrag: (px) => {
      const W = view.W;
      const xMin = pad.l;
      const xMax = W - pad.r;
      const k = clamp((px - xMin) / (xMax - xMin), 0, 1);
      setStep(Math.round(k * (trace.length - 1)));
    },
    onKey: (_dx, dy, big) => {
      const delta = dy !== 0 ? dy : 1; // treat up/down or left/right
      setStep(stepIdx + (big ? 5 : 1) * (delta > 0 ? 1 : -1));
    },
  });

  const f = formula(root);
  const nBox = note(root);
  const r = row(root);
  const sld = slider(r, {
    label: 'Step',
    min: 0,
    max: trace.length - 1,
    step: 1,
    value: 0,
    format: (v) => `${v + 1} / ${trace.length}`,
    onInput: (v) => setStep(v),
  });
  button(r, 'Reset', () => setStep(0));

  function setStep(v: number) {
    stepIdx = clamp(v, 0, trace.length - 1);
    sld.set(stepIdx);
    draw();
  }

  function draw() {
    const { W, H } = view;
    const step = trace[stepIdx];
    const n = step.arr.length;
    const xMin = pad.l;
    const xMax = W - pad.r;
    const barW = (xMax - xMin) / n - 8;
    const yMax = Math.max(...initialArray) + 1;
    const y = scale(0, yMax, H - pad.b, pad.t);

    bgGroup.replaceChildren();
    barsGroup.replaceChildren();
    textGroup.replaceChildren();

    // Top lane header and invariant divider
    label(bgGroup, xMin, 18, 'sorted prefix A[1..j−1]  ·  key  ·  unsorted', 'lbl', 'start');
    const divX = xMin + step.j * ((xMax - xMin) / n);
    s('line', { class: 'edge', x1: divX, x2: divX, y1: pad.t, y2: H - pad.b }, bgGroup);

    // Timeline track
    s('line', { class: 'ax', x1: xMin, x2: xMax, y1: H - 20, y2: H - 20 }, bgGroup);
    const handleX = xMin + (stepIdx / (trace.length - 1)) * (xMax - xMin);
    hd.move(handleX, H - 20);

    // Draw bars
    step.arr.forEach((val, idx) => {
      const bx = xMin + idx * ((xMax - xMin) / n) + 4;
      const by = y(val);
      const bH = y(0) - y(val);

      let cls = 'bar';
      if (idx < step.j && idx !== step.i) cls = 'area-tp'; // sorted prefix
      else if (idx === step.j || (step.phase === 'shift' && idx === step.i + 1)) cls = 'area-fp'; // key / active
      else if (idx === step.i && step.phase === 'shift') cls = 'dot-acc';

      s('rect', { class: cls, x: bx, y: by, width: barW, height: bH, rx: 4 }, barsGroup);
      label(textGroup, bx + barW / 2, H - pad.b + 18, String(val), idx < step.j ? 'lbl-acc' : 'lbl');
    });

    f.set(
      `j=${step.j + 1},\\ \\text{key}=${step.key},\\ \\text{comps}=${step.comparisons},\\ \\text{shifts}=${step.shifts}`,
    );
    const phaseDesc =
      step.phase === 'select'
        ? `Select key = ${step.key} at index j = ${step.j + 1}; prefix A[1..${step.j}] is already in sorted order.`
        : step.phase === 'shift'
          ? `Compare A[${step.i + 1}] = ${step.arr[step.i]} > key (${step.key}): shift ${step.arr[step.i]} one slot right to open space.`
          : `Insert key = ${step.key} into slot ${step.i + 1}; the sorted prefix now extends across A[1..${step.j + 1}].`;
    nBox.set(phaseDesc);
  }

  view.onResize(draw);
  draw();
};

export default mount;
