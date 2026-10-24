export const GRAPH_COMPLEXITY = {
  bfs: {
    best: "O(1)",
    average: "O(V + E)",
    worst: "O(V + E)",
    space: "O(V)",
    note: "Explores level by level with a FIFO queue. Finds the path with the fewest edges, but ignores weights.",
  },
  dfs: {
    best: "O(1)",
    average: "O(V + E)",
    worst: "O(V + E)",
    space: "O(V)",
    note: "Goes as deep as possible with a LIFO stack before backtracking. Does not guarantee a shortest path.",
  },
  dijkstra: {
    best: "O(E + V log V)",
    average: "O((V + E) log V)",
    worst: "O((V + E) log V)",
    space: "O(V)",
    note: "Always expands the closest unvisited node. Optimal for non-negative weights. (This demo scans an array instead of a heap: O(V²).)",
  },
  astar: {
    best: "O(d)",
    average: "O((V + E) log V)",
    worst: "O((V + E) log V)",
    space: "O(V)",
    note: "Dijkstra guided by a heuristic h(n) (scaled straight-line distance here). With an admissible h it stays optimal while usually expanding fewer nodes.",
  },
};

export const SORT_COMPLEXITY = {
  bubble: {
    best: "O(n)",
    average: "O(n²)",
    worst: "O(n²)",
    space: "O(1)",
    note: "Repeatedly swaps adjacent out-of-order pairs. Stable. Stops early when a pass makes no swaps.",
  },
  selection: {
    best: "O(n²)",
    average: "O(n²)",
    worst: "O(n²)",
    space: "O(1)",
    note: "Selects the minimum of the unsorted part each pass. At most n−1 swaps, not stable.",
  },
  merge: {
    best: "O(n log n)",
    average: "O(n log n)",
    worst: "O(n log n)",
    space: "O(n)",
    note: "Divide and conquer: split in halves, sort each half, merge. Stable, needs an auxiliary array.",
  },
  quick: {
    best: "O(n log n)",
    average: "O(n log n)",
    worst: "O(n²)",
    space: "O(log n)",
    note: "Partitions around a pivot (last element, Lomuto scheme). Worst case on already-sorted or all-equal input.",
  },
  heap: {
    best: "O(n log n)",
    average: "O(n log n)",
    worst: "O(n log n)",
    space: "O(1)",
    note: "Builds a max-heap, then repeatedly moves the root to the end. In-place, not stable.",
  },
};
