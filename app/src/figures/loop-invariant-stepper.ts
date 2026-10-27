// Chapter 2: Loop Invariant Proof Stepper & Interactive Array Inspector
import { responsiveSvg, stepper, s, handle, row, button, formula, slider, clamp, scale, label, texHtml, type Step, type Mount } from './lib';

const steps: Step[] = [
  {
    html: `<strong>Claim (Loop Invariant):</strong> At the start of each iteration of the outer <span class="sc">for</span> loop (index ${texHtml('j')}), the subarray ${texHtml('A[1..j-1]')} consists of the elements originally in ${texHtml('A[1..j-1]')} in sorted order.`,
    why: 'Core inductive hypothesis for correctness.',
  },
  {
    html: `<strong>Initialization (${texHtml('j=2')}):</strong> Before the first iteration, ${texHtml('A[1..1]')} contains single element ${texHtml('A[1]')}, which is trivially sorted.`,
    why: 'Base case establishes invariant before loop starts.',
  },
  {
    html: `<strong>Maintenance:</strong> The body moves ${texHtml('A[j-1], A[j-2], \\dots')} right until the correct slot for ${texHtml('\\text{key} = A[j]')} is found, preserving sorted order in ${texHtml('A[1..j]')}.`,
    why: 'Inductive step proves preservation across iterations.',
  },
  {
    html: `<strong>Termination (${texHtml('j = n+1')}):</strong> The loop terminates when ${texHtml('j = n+1')}. Substituting ${texHtml('j = n+1')} into the invariant shows ${texHtml('A[1..n]')} is sorted.`,
    why: 'Conclusion guarantees full array sorting.',
  },
];

const mount: Mount = (root) => {
  let jVal = 2;
  const sampleArr = [2, 4, 5, 6, 1, 3, 8];
  const pad = { l: 40, r: 30, t: 30, b: 50 };
  let sld: ReturnType<typeof slider> | null = null;

  const st = stepper(root, steps, (i) => {
    if (i === 1) jVal = 2;
    else if (i === 2) jVal = 4;
    else if (i === 3) jVal = sampleArr.length + 1;
    if (!sld) return;
    sld.set(jVal);
    draw();
  });

  const view = responsiveSvg(root, {
    label: 'Loop invariant inspection across array indices',
    aspect: 0.45,
    minH: 220,
    maxH: 320,
  });
  const svgEl = view.el;

  const barsGroup = s('g', {}, svgEl);
  const textGroup = s('g', {}, svgEl);

  const hd = handle(svgEl, {
    label: 'Inspect loop index j',
    x: 0,
    y: 0,
    valueText: () => `j = ${jVal}`,
    onDrag: (px) => {
      const W = view.W;
      const xMin = pad.l;
      const xMax = W - pad.r;
      const k = clamp((px - xMin) / (xMax - xMin), 0, 1);
      jVal = Math.round(clamp(2 + k * (sampleArr.length - 1), 2, sampleArr.length + 1));
      sld?.set(jVal);
      draw();
    },
    onKey: (_dx, dy, _big) => {
      jVal = clamp(jVal + (dy !== 0 ? dy : 1), 2, sampleArr.length + 1);
      sld?.set(jVal);
      draw();
    },
  });

  const f = formula(root);
  const r = row(root);
  sld = slider(r, {
    label: 'Index j',
    min: 2,
    max: sampleArr.length + 1,
    step: 1,
    value: jVal,
    onInput: (v) => {
      jVal = v;
      draw();
    },
  });
  button(r, 'Reset', () => {
    jVal = 2;
    sld?.set(jVal);
    st.go(0);
    draw();
  });

  function draw() {
    const { W, H } = view;
    const n = sampleArr.length;
    const xMin = pad.l;
    const xMax = W - pad.r;
    const barW = (xMax - xMin) / n - 8;
    const yMax = Math.max(...sampleArr) + 1;
    const y = scale(0, yMax, H - pad.b, pad.t);

    barsGroup.replaceChildren();
    textGroup.replaceChildren();

    // Timeline track
    s('line', { class: 'ax', x1: xMin, x2: xMax, y1: H - 20, y2: H - 20 }, barsGroup);
    const jNorm = Math.min(jVal - 1, n) / n;
    hd.move(xMin + jNorm * (xMax - xMin), H - 20);

    sampleArr.forEach((val, idx) => {
      const bx = xMin + idx * ((xMax - xMin) / n) + 4;
      const by = y(val);
      const bH = y(0) - y(val);

      let cls = 'bar';
      if (idx < jVal - 1) cls = 'area-tp'; // sorted prefix A[1..j-1]
      else if (idx === jVal - 1 && jVal <= n) cls = 'area-fp'; // current key A[j]

      s('rect', { class: cls, x: bx, y: by, width: barW, height: bH, rx: 4 }, barsGroup);
      label(textGroup, bx + barW / 2, H - pad.b + 18, String(val), idx < jVal - 1 ? 'lbl-acc' : 'lbl');
    });

    f.set(`j=${jVal},\\ \\text{Sorted prefix: } A[1..${Math.min(jVal - 1, n)}]`);
  }

  view.onResize(draw);
  draw();
};

export default mount;
