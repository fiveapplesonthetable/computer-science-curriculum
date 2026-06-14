# Algorithms From the Ground Up
### A Deep, Conversational Reader Before CLRS

A beginner-friendly, intuition-first companion designed to be read **before**
*Introduction to Algorithms* (Cormen, Leiserson, Rivest, Stein — "CLRS").
It covers the full CLRS syllabus, but slows down: every idea is built from
the ground up in plain language, then made precise. Hundreds of pages, the
same conversational style and visual language as the companion pure-math
reader *Proofs From the Ground Up*.

## What it covers (the whole of CLRS)

- **Foundations** — what an algorithm is, insertion sort & loop invariants,
  asymptotic notation, divide-and-conquer & the master theorem, probability
  and randomized algorithms.
- **Sorting & order statistics** — heapsort, quicksort, linear-time sorting,
  medians and selection.
- **Data structures** — elementary structures, hash tables, binary search
  trees, red-black trees, augmentation.
- **Advanced design** — dynamic programming, greedy algorithms, amortized
  analysis.
- **Advanced data structures** — B-trees, union-find, Fibonacci heaps,
  van Emde Boas trees.
- **Graph algorithms** — BFS/DFS, MST, shortest paths (single- and all-pairs),
  maximum flow.
- **Selected topics** — matrix operations, linear programming, FFT, number
  theory, string matching, computational geometry, NP-completeness,
  approximation, parallel, and machine-learning algorithms.
- **Mathematical background** — summations, counting, probability, matrices.

## Build

```bash
./build.sh           # writes dist/algorithms-from-the-ground-up.pdf
```

Requires a TeX Live install with `algorithm2e`, `tcolorbox`, `tikz`, and
`listings`. Sources are in `src/`, the rendered PDF lands in `dist/`.

## License

MIT — see `LICENSE`.
