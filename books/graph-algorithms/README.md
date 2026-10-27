# Graph Algorithms From the Ground Up
### From Breadth-First Search to Laplacian Solvers

The advanced companion to *Algorithms From the Ground Up*. It starts from the
basics (representations, BFS, DFS, topological sort, SCC) and climbs all the way
to the modern frontier: maximum flow and matching, advanced shortest paths,
global min-cut, tree decompositions and fixed-parameter tractability, link-cut
trees, planarity, spectral graph theory, random walks and PageRank, dynamic and
streaming graph algorithms, and Laplacian solvers / max-flow via electrical
flows. Same conversational voice and visual language as the companion books,
with worked traces, pseudocode, diagrams, correctness arguments, and exercises.

## What it covers

- **Foundations** — graphs and representations, BFS, DFS and structure,
  topological sort, connectivity and strongly connected components.
- **Trees, paths, cuts** — minimum spanning trees, shortest paths and the
  advanced variants (A*, bidirectional, contraction hierarchies), all-pairs and
  Johnson, bridges/articulation/biconnectivity, and global minimum cut
  (Stoer-Wagner, Karger-Stein).
- **Flows and matching** — max-flow (Dinic, push-relabel), min-cost flow,
  bipartite matching (Hopcroft-Karp), weighted matching (Hungarian), general
  matching (Edmonds' blossom), and flow modeling.
- **Decompositions and dynamic structures** — heavy-light and centroid
  decomposition, Euler tour technique, link-cut trees, LCA, tree decompositions
  and treewidth, and fixed-parameter tractability.
- **Structural graph theory** — planar graphs and planarity, separators,
  coloring, independent sets/cliques/covers, and perfect graphs.
- **Spectral and algebraic** — the graph Laplacian, spectral graph theory and
  Cheeger's inequality, spectral clustering, expanders, random walks and
  electrical networks, and PageRank.
- **Hardness, approximation, frontier** — NP-hard graph problems, approximation
  (Christofides, Steiner, sparsest cut), dynamic and streaming graph algorithms,
  and Laplacian solvers / max-flow via electrical flows.

## Build

```bash
./build.sh           # writes dist/graph-algorithms-from-the-ground-up.pdf
```

## License

MIT — see `LICENSE`.
