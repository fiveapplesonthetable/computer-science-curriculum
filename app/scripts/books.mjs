// Books config for the web edition. Paths are relative to the repo root.
// `unit` is the LaTeX command that starts a chapter in the web edition.

export const BOOKS = [
  {
    id: 'algorithms',
    short: 'Algorithms',
    title: 'Algorithms From the Ground Up',
    subtitle: 'A deep, conversational reader before CLRS',
    main: 'src/main.tex',
    root: '.',
    common: ['src/common.tex'],
    unit: 'chapter',
  },
  {
    id: 'graph-algorithms',
    short: 'Graph algorithms',
    title: 'Graph Algorithms From the Ground Up',
    subtitle: 'Networks, flows, and why it works, from walks to spectral theory',
    main: 'books/graph-algorithms/src/main.tex',
    root: 'books/graph-algorithms',
    common: ['books/graph-algorithms/src/common.tex'],
    unit: 'chapter',
  },
  {
    id: 'cryptography',
    short: 'Cryptography',
    title: 'Cryptography From the Ground Up',
    subtitle: 'Secrets, proofs, and real-world protocols, from Caesar to post-quantum',
    main: 'books/cryptography/src/main.tex',
    root: 'books/cryptography',
    common: ['books/cryptography/src/common.tex'],
    unit: 'chapter',
  },
  {
    id: 'signal-processing',
    short: 'Signal processing',
    title: 'Signal Processing From the Ground Up',
    subtitle: 'Waves, filters, and why it works, from sinusoids to sensor fusion',
    main: 'books/signal-processing/src/main.tex',
    root: 'books/signal-processing',
    common: ['books/signal-processing/src/common.tex'],
    unit: 'chapter',
  },
];
