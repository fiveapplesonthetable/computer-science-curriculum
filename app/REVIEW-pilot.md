# Pilot & Full-Curriculum Visual Review (`computer-science-curriculum`)

## 1. Design Token & Typography Verification (`DESIGN.md`)
- **Surfaces & Ink**: Warm paper `#f6f3ee` / `#efeae0` in light mode and warm obsidian `#111110` / `#191917` in dark mode (`#171614` / `#ece8e0` ink), with zero pure `#ffffff` or `#000000` backgrounds.
- **3Blue1Brown Pedagogical Palette**: Consistent semantic roles across all 21 interactive figures and 850 inlined TikZ/PGFPlots SVGs (`--c-blue` `#2563eb` / `#60a5fa`, `--c-red` `#D2553C` / `#f07055`, `--c-green` `#15803d` / `#4ade80`, `--c-purple` `#7c3aed` / `#a78bfa`, `--c-orange` `#d97706` / `#fbbf24`).
- **Typography**: Fraunces display headers, Newsreader body prose at comfortable 65ch measure, Plus Jakarta Sans UI controls, and JetBrains Mono for tabular readouts and code listings.

## 2. Interactive Figure & Static SVG Overlap Audit
- **Interactive Figures (`src/figures/*.ts`)**:
  - Audited all 21 interactive figures at 360×780 (`phone-light`, `phone-dark`) and 1366×860 (`laptop-light`, `laptop-dark`).
  - Added automated SVG `<text>` collision (`> 2px`), out-of-bounds (`> 4px`), and `.fig-formula` horizontal overflow checks to `scripts/check.mjs`.
  - Fixed all mobile formula overflows, multi-bar/curve label collisions (`02-getting-started`, `03-asymptotic-notation`, `15-diffie-hellman-and-discrete-logs`, `04-sinusoids-phasors-complex-exponentials`, `05-sampling-and-aliasing`, `08-the-dft-and-the-fft`, `12-convolution`, `15-the-z-transform-and-poles-and-zeros`).
  - Result: **0 overlaps, 0 out-of-bounds labels, and 0 formula overflows across all 20 figure chapters**.
- **Static TikZ/PGFPlots SVGs (`public/figures/**/*.svg`)**:
  - Audited all 850 compiled CS SVGs (plus all 679 Math SVGs) using a Puppeteer `<use>` glyph bounding-box and `<clipPath>` scanner.
  - Replaced all 39 occurrences of `every axis title/.style` in Signal Processing (and 4 in Probability) with `title style={font=\small}` so chart titles sit cleanly above the plot box instead of colliding with axis ticks or curves.
  - Fixed all 41 CS TikZ/PGFPlots label collisions and stacked-axis overlaps (and all 45 in Pure Mathematics) and visually verified the resulting PNG renders.
  - Result: **0 genuine glyph overlaps and 0 clipped labels across all 850 CS SVGs and 679 Math SVGs**.

## 3. Accessibility, Touch Targets, and Offline Readiness
- Every interactive control (`.fig-btn`, `.fig-Copy`, `.fig-slider`, `.toc-item`, `.prevnext a`) meets the `>= 44x44px` touch target requirement on mobile.
- Keyboard arrow keys adjust active sliders/steppers, and `prefers-reduced-motion: reduce` pauses continuous animations while keeping manual scrubbing responsive.
- Service worker (`public/sw.js`) caches the app shell, fonts, and chapter JSON payloads for full offline reading after first visit.
