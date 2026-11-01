// Languages Ch 12: Async Rust Future::poll State Machine & Zero-Alloc Enum Frame
import { responsiveSvg, s, handle, row, button, formula, note, slider, clamp, scale, label, type Mount } from './lib';

interface AsyncStage {
  tag: number;
  variant: string;
  ret: string;
  slots: [string, string, string];
  usedBytes: number;
  why: string;
}

const STAGES: AsyncStage[] = [
  {
    tag: 0,
    variant: 'Start',
    ret: 'not polled yet',
    slots: ['tag=0', 'tx_id (16 B)', 'unused (40 B)'],
    usedBytes: 24,
    why: 'Calling settle(tx_id) performs zero I/O: it packs tx_id into Variant 0 of a 64-byte stack-sized enum.',
  },
  {
    tag: 1,
    variant: 'WaitBal',
    ret: 'Poll::Pending',
    slots: ['tag=1', 'tx_id (16 B)', 'bal_fut + Waker'],
    usedBytes: 56,
    why: 'poll #1 sends the SQL query, stores bal_fut inline in Variant 1, registers the Waker with epoll, and yields the OS thread.',
  },
  {
    tag: 1,
    variant: 'WaitBal (woken)',
    ret: 'Waker::wake()',
    slots: ['tag=1', 'tx_id (16 B)', 'socket ready'],
    usedBytes: 56,
    why: 'PostgreSQL replies on the TCP socket; the reactor invokes Waker::wake(), pushing the task pointer back onto Tokio’s run queue.',
  },
  {
    tag: 2,
    variant: 'WaitCom',
    ret: 'Poll::Pending',
    slots: ['tag=2', 'tx_id + bal', 'commit_fut'],
    usedBytes: 64,
    why: 'poll #2 reads bal, drops bal_fut in place, and reuses the exact same 64-byte frame for Variant 2 (commit_fut) — zero heap mallocs.',
  },
  {
    tag: 3,
    variant: 'Done',
    ret: 'Poll::Ready(Ok)',
    slots: ['tag=3', 'retired', 'retired'],
    usedBytes: 8,
    why: 'poll #3 receives the WAL commit acknowledgement, transitions to Done, and returns Poll::Ready(Ok(Receipt)).',
  },
];

const STATE_NAMES = ['Start', 'WaitBal', 'WaitCom', 'Done'];

const mount: Mount = (root) => {
  let stageIdx = 2; // start in middle (stage 3 of 5)
  const pad = { l: 16, r: 16 };

  const view = responsiveSvg(root, {
    label: 'Rust async fn state machine enum variants and inline memory reuse across await points',
    aspect: 0.56,
    minH: 245,
    maxH: 310,
  });
  const svgEl = view.el;
  const gDiagram = s('g', {}, svgEl);
  const gText = s('g', {}, svgEl);
  const gRail = s('g', {}, svgEl);

  const hd = handle(svgEl, {
    label: 'Async poll stage scrubber',
    x: 0,
    y: 0,
    valueText: () => `Stage ${stageIdx + 1}: ${STAGES[stageIdx].variant}`,
    onDrag: (px) => {
      const W = view.W;
      const k = clamp((px - pad.l) / Math.max(1, W - pad.l - pad.r), 0, 1);
      setStage(Math.round(k * (STAGES.length - 1)));
    },
    onKey: (dx, dy) => {
      const d = dx !== 0 ? dx : dy;
      setStage(clamp(stageIdx + d, 0, STAGES.length - 1));
    },
  });

  const f = formula(root);
  const nBox = note(root);
  const r1 = row(root);
  const sld = slider(r1, {
    label: 'Stage',
    min: 1,
    max: STAGES.length,
    step: 1,
    value: stageIdx + 1,
    onInput: (v) => setStage(v - 1),
  });
  button(r1, 'Reset', () => setStage(1));

  function setStage(idx: number) {
    stageIdx = clamp(idx, 0, STAGES.length - 1);
    sld.set(stageIdx + 1);
    draw();
  }

  function draw() {
    const { W, H } = view;
    gDiagram.replaceChildren();
    gText.replaceChildren();
    gRail.replaceChildren();

    const st = STAGES[stageIdx];
    const innerW = W - pad.l - pad.r;

    // Top row: 4 enum state nodes
    const gap = 8;
    const nodeW = Math.floor((innerW - gap * 3) / 4);
    const nodeY = 22;
    const nodeH = 42;
    for (let i = 0; i < 4; i++) {
      const nx = pad.l + i * (nodeW + gap);
      const active = st.tag === i;
      s('rect', { class: active ? 'area-tp' : 'bar', x: nx, y: nodeY, width: nodeW, height: nodeH, rx: 6 }, gDiagram);
      label(gText, nx + nodeW / 2, nodeY + 26, STATE_NAMES[i], active ? 'lbl-acc' : 'lbl', 'middle');
      if (i < 3) {
        s('line', { class: i < st.tag ? 'line-acc' : 'ax', x1: nx + nodeW + 1, x2: nx + nodeW + gap - 1, y1: nodeY + nodeH / 2, y2: nodeY + nodeH / 2 }, gDiagram);
      }
    }

    // Middle row: single 64-byte overlapping enum memory layout
    const memY = 92;
    const memH = 66;
    label(gText, pad.l, memY - 8, `enum SettleFut (64 B inline) · ${st.ret}`, 'lbl-fg', 'start');

    const w0 = Math.round(innerW * 0.22);
    const w1 = Math.round(innerW * 0.36);
    const w2 = innerW - w0 - w1 - 8;
    const parts = [
      { x: pad.l, w: w0, txt: st.slots[0], cls: 'area-tp' },
      { x: pad.l + w0 + 4, w: w1, txt: st.slots[1], cls: st.tag < 3 ? 'area-tp' : 'area-neg' },
      { x: pad.l + w0 + w1 + 8, w: w2, txt: st.slots[2], cls: st.tag === 1 || st.tag === 2 ? 'area-fp' : 'area-neg' },
    ];
    for (const p of parts) {
      s('rect', { class: p.cls, x: p.x, y: memY, width: p.w, height: memH, rx: 5 }, gDiagram);
      label(gText, p.x + p.w / 2, memY + 38, p.txt, 'lbl-fg', 'middle');
    }

    // Bottom rail
    const railY = H - 24;
    const xPos = scale(0, STAGES.length - 1, pad.l, W - pad.r);
    s('line', { class: 'ax', x1: pad.l, x2: W - pad.r, y1: railY, y2: railY }, gRail);
    for (let i = 0; i < STAGES.length; i++) {
      s('circle', { class: i <= stageIdx ? 'dot-acc' : 'dot-dim', cx: xPos(i), cy: railY, r: 3.5 }, gRail);
    }
    hd.move(xPos(stageIdx), railY);

    f.set(`\\text{tag}=${st.tag},\\; ${st.usedBytes}/64\\text{ B},\\; \\text{allocs}=0`);
    nBox.set(st.why);
  }

  view.onResize(draw);
  draw();
};

export default mount;
