# Computer Science Curriculum — Interactive Web Edition Progress

## Completed Milestones

- [x] **Repository Consolidation (`computer-science-curriculum`)**
  - Consolidated 4 complete Computer Science books into a unified curriculum repository:
    - **Book I — Algorithms from the Ground Up** (`src/`, 39 chapters + preface)
    - **Book II — Graph Algorithms from the Ground Up** (`books/graph-algorithms/`, 42 chapters + preface)
    - **Book III — Cryptography from the Ground Up** (`books/cryptography/`, 41 chapters + preface)
    - **Book IV — Signal Processing from the Ground Up** (`books/signal-processing/`, 42 chapters + preface)
  - All 4 books compile cleanly via `./build.sh` with 0 LaTeX errors.

- [x] **LaTeX-to-JSON AST & TikZ/PGFPlots SVG Pipeline**
  - `node scripts/build-content.mjs` parses all 164 chapters across all 4 books (4,008 cross-reference labels, 0 warnings).
  - `node scripts/build-figures.mjs` compiles all 850 TikZ/PGFPlots figures across the 4 books into standalone SVG assets via `pdflatex` + `dvisvgm --font-format=woff2` and inlines them at build time with dark-mode aware CSS styling.

- [x] **21 Bespoke 3Blue1Brown-Style Interactive Figures (20 Flagship Chapters)**
  - **Book I — Algorithms (5 chapters / 6 figures)**:
    - `02-getting-started`: Insertion Sort vs. Merge Sort Step-by-Step Visualizer & Recursion Tree
    - `03-asymptotic-notation`: Big-$O$ / $\Omega$ / $\Theta$ Crossing Point & Growth Explorer
    - `07-quicksort`: Lomuto Partition & Pivot Choice Explorer
    - `11-hash-tables`: Chaining vs. Open Addressing (Linear Probing) Collision Explorer
    - `13-red-black-trees`: BST vs. Red-Black Rotation & Rebalancing Visualizer
    - `14-dynamic-programming`: Rod Cutting & LCS DP Table Subproblem DAG Explorer
  - **Book II — Graph Algorithms (5 chapters)**:
    - `03-breadth-first-search`: BFS Frontier Wave & Shortest-Path Layer Tree
    - `04-depth-first-search`: DFS Discovery/Finish Intervals & Edge Classification
    - `07-minimum-spanning-trees`: Cut Property: Kruskal vs. Prim Step-by-Step
    - `09-dijkstras-algorithm`: Dijkstra Expanding Balls & Edge Relaxation
    - `12-maximum-flow-and-minimum-cut`: Ford–Fulkerson Augmenting Paths & Residual Cut Explorer
  - **Book III — Cryptography (5 chapters)**:
    - `03-perfect-secrecy-and-the-one-time-pad`: One-Time Pad Perfect Secrecy & Two-Time Pad Key Reuse Attack
    - `07-block-ciphers-and-aes`: AES Round Pipeline: SubBytes, ShiftRows, MixColumns, AddRoundKey
    - `08-modes-of-operation`: ECB Penguin vs. CBC vs. CTR Encryption Visualizer
    - `14-rsa`: RSA Key Generation, Trapdoor Encryption & CRT Speedup Explorer
    - `15-diffie-hellman-and-discrete-logs`: Diffie–Hellman Clock Group & Discrete Log Paint Analogy
  - **Book IV — Signal Processing (5 chapters)**:
    - `04-sinusoids-phasors-complex-exponentials`: Rotating Phasor $e^{j\omega t}$ & Sinusoid Projection
    - `05-sampling-and-aliasing`: Nyquist Sampling, Stroboscopic Wagon-Wheel & Frequency Folding
    - `08-the-dft-and-the-fft`: DFT Winding Machine: Wrapping a Signal Around the Origin
    - `12-convolution`: Flip-and-Slide Convolution Machine $(x * h)[n]$
    - `15-the-z-transform-and-poles-and-zeros`: Pole–Zero Unit Circle Studio & 3D Rubber-Sheet Frequency Response

- [x] **Exhaustive Overlap & Clipping Audit Across All Interactive & Static Figures**
  - Enhanced `app/scripts/check.mjs` with automated SVG `<text>` bounding-box overlap detection (`> 2px`), out-of-bounds detection (`> 4px`), and `.fig-formula` horizontal overflow checks (`> 2px` at 360px width).
  - Ran a Puppeteer `<use>` glyph bounding-box overlap and `clip-path` audit across all 1,529 active TikZ/PGFPlots SVGs across both `computer-science-curriculum` (850 SVGs) and `pure-mathematics-curriculum` (679 SVGs), fixing all 86 genuine label collisions, legend overlaps, `every axis title/.style` overrides, and clipped annotations.

- [x] **Verification & Offline PWA**
  - `npx tsc --noEmit`: 0 errors.
  - `node scripts/check.mjs --all`: 164/164 chapters pass across `phone-light`, `phone-dark`, `laptop-light`, and `laptop-dark` with 0 problems.
  - `node scripts/android-e2e.mjs`: Android Cuttlefish E2E passes on real mobile Chrome.
