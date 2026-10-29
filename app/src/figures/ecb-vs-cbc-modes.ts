// Block cipher modes of operation visualizer: ECB vs CBC vs CTR.
import { responsiveSvg, s, handle, row, button, formula, note, slider, clamp, label, type Mount } from './lib';

const mount: Mount = (root) => {
  let mode: 'ECB' | 'CBC' | 'CTR' = 'ECB';
  let progress = 32; // 0..64 encrypted blocks
  let iv = 5; // IV / nonce seed

  const view = responsiveSvg(root, {
    label: 'Block cipher modes of operation: ECB vs CBC vs CTR',
    aspect: 0.55,
    minH: 260,
    maxH: 360,
  });
  const svgEl = view.el;

  const leftGridG = s('g', {}, svgEl);
  const rightGridG = s('g', {}, svgEl);
  const arrowsG = s('g', {}, svgEl);
  const formulaBox = formula(root);
  const nBox = note(root);

  const r = row(root);
  const bECB = button(r, 'ECB', () => { mode = 'ECB'; updateButtons(); draw(); });
  const bCBC = button(r, 'CBC', () => { mode = 'CBC'; updateButtons(); draw(); });
  const bCTR = button(r, 'CTR', () => { mode = 'CTR'; updateButtons(); draw(); });
  const sProg = slider(r, {
    label: 'Progress',
    min: 0,
    max: 64,
    step: 1,
    value: progress,
    onInput: (v) => {
      progress = v;
      draw();
    },
  });
  button(r, 'Reset', () => {
    progress = 32;
    sProg.set(progress);
    draw();
  });

  function updateButtons() {
    bECB.setAttribute('aria-pressed', String(mode === 'ECB'));
    bCBC.setAttribute('aria-pressed', String(mode === 'CBC'));
    bCTR.setAttribute('aria-pressed', String(mode === 'CTR'));
  }
  updateButtons();

  // Draggable handle along progress slider area or visualizer
  const hd = handle(svgEl, {
    label: 'Encryption progress handle',
    x: 0,
    y: 0,
    valueText: () => `progress ${progress}/64`,
    onDrag: (px) => {
      const x0 = view.W / 2 - 120;
      const x1 = view.W / 2 + 120;
      const k = clamp((px - x0) / (x1 - x0), 0, 1);
      progress = Math.round(k * 64);
      sProg.set(progress);
      draw();
    },
    onKey: (_dx, dy) => {
      progress = clamp(progress + dy * 4, 0, 64);
      sProg.set(progress);
      draw();
    },
  });

  // Plaintext structured icon (an 8x8 bitmap representing a simple silhouette/smiley or letter)
  // 1 = dark/filled, 0 = empty
  const pattern = [
    0,0,1,1,1,1,0,0,
    0,1,0,0,0,0,1,0,
    1,0,1,0,0,1,0,1,
    1,0,0,0,0,0,0,1,
    1,0,1,0,0,1,0,1,
    1,0,0,1,1,0,0,1,
    0,1,0,0,0,0,1,0,
    0,0,1,1,1,1,0,0,
  ];

  const PRF = (x: number) => {
    const n = Math.sin(x * 12.9898 + 78.233) * 43758.5453;
    return (n - Math.floor(n)) > 0.5 ? 1 : 0;
  };

  const cbcCipher: number[] = [];
  let prevC = iv % 2;
  for (let i = 0; i < 64; i++) {
    const c = PRF((pattern[i] ^ prevC) * 13 + i * 17 + iv);
    cbcCipher.push(c);
    prevC = c;
  }

  function draw() {
    const { W, H } = view; void H;
    leftGridG.replaceChildren();
    rightGridG.replaceChildren();
    arrowsG.replaceChildren();

    const gridSize = 8;
    const cellSize = Math.min(15, Math.floor((W / 2 - 48) / gridSize));
    const leftX = 24;
    const topY = 30;
    const rightX = W - leftX - gridSize * cellSize;

    // Titles
    label(leftGridG, leftX + (gridSize * cellSize) / 2, topY - 10, 'Plaintext (P)', 'lbl-fg', 'middle');
    label(rightGridG, rightX + (gridSize * cellSize) / 2, topY - 10, `Ciphertext (${mode})`, 'lbl-acc', 'middle');

    // Draw left (plaintext) grid
    for (let rIdx = 0; rIdx < gridSize; rIdx++) {
      for (let cIdx = 0; cIdx < gridSize; cIdx++) {
        const idx = rIdx * gridSize + cIdx;
        const active = idx < progress;
        const val = pattern[idx];
        const cls = val ? (active ? 'dot-acc' : 'bar') : 'grid'; void cls;
        s('rect', {
          x: leftX + cIdx * cellSize,
          y: topY + rIdx * cellSize,
          width: cellSize - 1,
          height: cellSize - 1,
          class: val ? 'dot' : 'grid',
          opacity: active ? '1' : '0.4',
        }, leftGridG);
      }
    }

    // Draw right (ciphertext) grid according to mode
    for (let rIdx = 0; rIdx < gridSize; rIdx++) {
      for (let cIdx = 0; cIdx < gridSize; cIdx++) {
        const idx = rIdx * gridSize + cIdx;
        const active = idx < progress;
        const val = pattern[idx];
        
        // Transform based on mode
        let displayVal = val;
        if (mode === 'ECB') {
          displayVal = val;
        } else if (mode === 'CBC') {
          displayVal = cbcCipher[idx];
        } else {
          const counterVal = PRF(idx + iv * 100);
          displayVal = val ^ counterVal;
        }

        s('rect', {
          x: rightX + cIdx * cellSize,
          y: topY + rIdx * cellSize,
          width: cellSize - 1,
          height: cellSize - 1,
          class: displayVal ? (active ? 'dot-acc' : 'bar') : 'grid',
          opacity: active ? '1' : '0.4',
        }, rightGridG);
      }
    }

    // Draw connecting arrows / description in between
    const midX = W / 2;
    const midY = topY + (gridSize * cellSize) / 2;
    s('line', { x1: leftX + gridSize * cellSize + 10, y1: midY, x2: rightX - 10, y2: midY, class: 'line-acc' }, arrowsG);
    label(arrowsG, midX, midY - 8, mode, 'lbl-acc', 'middle');

    // Position handle on a visible progress track
    const trackY = topY + gridSize * cellSize + 25;
    const x0 = Math.max(24, W / 2 - 120);
    const x1 = Math.min(W - 24, W / 2 + 120);
    s('line', { class: 'ax', x1, x2: x0, y1: trackY, y2: trackY }, arrowsG);
    hd.move(x0 + (progress / 64) * (x1 - x0), trackY);

    if (mode === 'ECB') {
      formulaBox.set(`\\text{ECB: } C_i = E_K(P_i)`);
      nBox.set(`ECB encrypts each block independently (${progress}/64 blocks processed): identical plaintext blocks always map to identical ciphertext blocks, leaking the global image silhouette.`);
    } else if (mode === 'CBC') {
      formulaBox.set(`\\text{CBC: } C_i = E_K(P_i \\oplus C_{i-1})`);
      nBox.set(`CBC XORs each plaintext block P_i with the previous ciphertext block C_{i−1} before encryption (${progress}/64 blocks), scrambling repeated patterns into uniform pseudo-randomness.`);
    } else {
      formulaBox.set(`\\text{CTR: } C_i = P_i \\oplus E_K(\\text{IV} \\parallel i)`);
      nBox.set(`CTR encrypts a unique counter block (IV || i) to generate a keystream pad for each position i (${progress}/64 blocks), so identical plaintext blocks encrypt to distinct ciphertexts in parallel.`);
    }
  }

  view.onResize(draw);
  draw();
};

export default mount;
