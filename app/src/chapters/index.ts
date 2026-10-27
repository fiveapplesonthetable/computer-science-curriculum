// Figure placements per chapter, keyed by `<book>/<chapterKey>`.
// Each entry attaches a figure module (`src/figures/<fig>.ts`) before, after,
// or in place of a block carrying `ref` in `src/content/<book>/<chapter>.json`.

export interface Placement {
  ref: string;
  where: 'before' | 'after' | 'replace';
  fig: string;
  caption?: string;
}

export const chapters: Record<string, Placement[]> = {
  // ---------------- Algorithms From the Ground Up ----------------
  'algorithms/2': [
    {
      ref: 'algorithm-1',
      where: 'after',
      fig: 'insertion-invariants',
      caption: 'Drag the step handle to scrub through insertion sort: the shaded prefix A[1..j−1] stays sorted while key A[j] shifts left into position.',
    },
    {
      ref: 'focusbox-1',
      where: 'after',
      fig: 'loop-invariant-stepper',
      caption: 'Step through the three parts of the loop-invariant correctness proof: initialization, maintenance, and termination.',
    },
  ],
  'algorithms/3': [
    {
      ref: 'formalbox-1',
      where: 'after',
      fig: 'asymptotic-race',
      caption: 'Drag the handle to choose the multiplier c in c·n². Once n crosses the threshold n₀, c·n² stays above f(n) forever.',
    },
  ],
  'algorithms/4': [
    {
      ref: 'focusbox-2',
      where: 'after',
      fig: 'merge-recursion-tree',
      caption: 'Compare branching factor a against work-decay b^k across recursion levels to see the three regimes of the Master Theorem.',
    },
  ],
  'algorithms/7': [
    {
      ref: 'algorithm-2',
      where: 'after',
      fig: 'quicksort-partition',
      caption: 'Scrub the Lomuto partition scan index j: elements ≤ pivot collect in A[p..i], elements > pivot in A[i+1..j−1], before the final pivot swap.',
    },
  ],
  'algorithms/11': [
    {
      ref: 'focusbox-1',
      where: 'after',
      fig: 'hash-probing',
      caption: 'Compare linear probing, quadratic probing, and double hashing as keys collide and form clusters in an open-addressed table.',
    },
  ],
  'algorithms/13': [
    {
      ref: 'focusbox-2',
      where: 'after',
      fig: 'red-black-rotations',
      caption: 'Drag the rotation handle between left- and right-rotated configurations: pointer depths change while the in-order sequence α, x, β, y, γ stays fixed.',
    },
  ],
  'algorithms/15': [
    {
      ref: 'algorithm-3',
      where: 'after',
      fig: 'dp-table-scrubber',
      caption: 'Scrub through the bottom-up dynamic programming table to see which earlier subproblems each cell consults and how optimal cuts are reconstructed.',
    },
  ],
  'algorithms/17': [
    {
      ref: 'focusbox-1',
      where: 'after',
      fig: 'amortized-potential',
      caption: 'Table-doubling spikes are paid for in advance by the potential Φ = 2·size − capacity, keeping the amortized cost per push constant.',
    },
  ],

  // ---------------- Graph Algorithms From the Ground Up ----------------
  'graph-algorithms/2': [
    {
      ref: 'algorithm-1',
      where: 'after',
      fig: 'bfs-dfs-frontier',
      caption: 'Compare the expanding layered frontier and FIFO queue of BFS against the deep recursion path of DFS on the same graph.',
    },
  ],
  'graph-algorithms/6': [
    {
      ref: 'theorem-1',
      where: 'after',
      fig: 'mst-cut-kruskal',
      caption: 'Scrub through Kruskal’s sorted edges and inspect the cut property: the lightest edge crossing any cut is always safe for the MST.',
    },
  ],
  'graph-algorithms/7': [
    {
      ref: 'algorithm-1',
      where: 'after',
      fig: 'dijkstra-relaxation',
      caption: 'Scrub through Dijkstra’s greedy extractions and edge relaxations d[v] ← min(d[v], d[u] + w(u, v)) as the settled set S grows.',
    },
  ],
  'graph-algorithms/12': [
    {
      ref: 'definition-3',
      where: 'after',
      fig: 'maxflow-augmenting',
      caption: 'Step through augmenting paths in the residual network until no s→t path remains and the saturated minimum s-t cut equals the maximum flow.',
    },
  ],

  // ---------------- Cryptography From the Ground Up ----------------
  'cryptography/3': [
    {
      ref: 'definition-1',
      where: 'after',
      fig: 'modular-clock-dh',
      caption: 'Powers of a generator g wrap around the prime clock Z/17Z, turning exponentiation into a one-way scramble.',
    },
  ],
  'cryptography/13': [
    {
      ref: 'attackbox-1',
      where: 'after',
      fig: 'ecb-vs-cbc-modes',
      caption: 'Compare ECB mode (identical plaintext blocks produce identical ciphertext blocks, leaking the image silhouette) against CBC and CTR chaining.',
    },
  ],
  'cryptography/18': [
    {
      ref: 'focusbox-1',
      where: 'after',
      fig: 'modular-clock-dh',
      caption: 'Drag around the prime clock to pick secrets a and b: Alice and Bob publish g^a and g^b mod p and arrive at the same shared key g^(ab) mod p.',
    },
  ],
  'cryptography/19': [
    {
      ref: 'focusbox-1',
      where: 'after',
      fig: 'rsa-trapdoor',
      caption: 'Drag the message handle m to trace RSA encryption c = m^e mod n and trapdoor inversion m = c^d mod n via Euler’s totient φ(n).',
    },
  ],
  'cryptography/21': [
    {
      ref: 'focusbox-2',
      where: 'after',
      fig: 'elliptic-curve-add',
      caption: 'Drag points P and Q along the elliptic curve y² = x³ − 2x + 2: the secant line meets the curve at −R, which reflects across the x-axis to P + Q = R.',
    },
  ],

  // ---------------- Signal Processing From the Ground Up ----------------
  'signal-processing/4': [
    {
      ref: 'happeningbox-1',
      where: 'after',
      fig: 'phasor-epicycles',
      caption: 'Drag the phasor tip A·e^(jθ) on the complex plane to see its horizontal shadow trace out A·cos(ωt + φ) in time.',
    },
  ],
  'signal-processing/8': [
    {
      ref: 'intuitionbox-1',
      where: 'after',
      fig: 'fourier-winding',
      caption: 'Drag the winding frequency f_w: when the signal wraps around the origin in step with one of its true frequencies, the centre of mass swings away from zero.',
    },
  ],
  'signal-processing/13': [
    {
      ref: 'whybox-1',
      where: 'after',
      fig: 'convolution-flip-slide',
      caption: 'Drag the shift index n to slide the flipped impulse response h[n − k] past x[k] and accumulate the convolution sum (x * h)[n].',
    },
  ],
  'signal-processing/18': [
    {
      ref: 'theorem-1',
      where: 'after',
      fig: 'nyquist-aliasing',
      caption: 'Drag the signal frequency f₀ past the Nyquist limit f_s / 2: the discrete samples fold onto a slower alias wave.',
    },
  ],
};
