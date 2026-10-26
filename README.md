# Algorithm Visualizer

An interactive visualizer for graph search algorithms (BFS, DFS, Dijkstra, A*)
and sorting algorithms (Bubble, Selection, Merge, Quick, Heap), built with
React + Vite + Tailwind CSS. Fonts (IBM Plex Sans, Source Serif 4) are
self-hosted through Fontsource.

**Live demo:** https://khanhdoan4106.github.io/Algorithm-Visualizer/

## Features

- Step-by-step visualization (Previous / Play / Pause / Next / Reset + speed
  control) for every algorithm
- Graph algorithms: BFS, DFS, Dijkstra, A* — all running on a shared demo
  graph or a graph you draw yourself
- Custom graph builder: add/delete nodes and edges, edit weights,
  directed/undirected, weighted/unweighted, random graph generator
  (max 12 nodes)
- Sorting visualizer: random array generator with special cases (ascending,
  descending, nearly sorted, few unique values, all same), plus manual array
  input
- Algorithm Comparison page: benchmark all sorting algorithms and BFS vs DFS
  on large inputs (up to thousands of elements/nodes), with charts
- Complexity panels (best/average/worst/space) for every algorithm
- Textbook-style colours: white / gray / black vertices as in CLRS, a
  highlighter for the current step and red for the final path; the search
  frontier is drawn as a real queue, stack or priority queue

## Getting started

Requires [Node.js](https://nodejs.org) 18 or newer.

```bash
npm install      # first time only
npm run dev      # open http://localhost:5173
npm run build    # production build into dist/
```

## Project structure

```
.
├── .github/workflows/deploy.yml   # build & deploy to GitHub Pages on every push to main
├── public/                        # static files copied as-is (favicon)
├── src/
│   ├── algorithms/
│   │   ├── graphSearch.js         # BFS, DFS, Dijkstra, A* (step-by-step snapshots)
│   │   ├── sorting.js             # Bubble, Selection, Merge, Quick, Heap
│   │   └── benchmark.js           # fast BFS/DFS statistics for large graphs
│   ├── generators/
│   │   ├── arrayGenerator.js      # random / sorted / reversed / ... input arrays
│   │   └── graphGenerator.js      # random small graphs and large benchmark graphs
│   ├── data/
│   │   ├── complexity.js          # best / average / worst / space tables
│   │   ├── demoGraph.js           # canvas size and the default demo graph
│   │   └── theme.js               # colours used inside SVG and charts
│   ├── components/                # Controls, ComplexityPanel, FrontierStrip (queue / stack view)
│   ├── hooks/usePlayer.js         # playback state shared by all visualizers
│   ├── pages/                     # GraphPage, SortingPage, ComparisonPage
│   ├── utils/format.js            # number formatting helpers
│   ├── App.jsx                    # tab navigation
│   ├── index.html                 # HTML shell
│   └── main.jsx                   # entry point
├── package.json
└── vite.config.js                 # Vite + Tailwind + PostCSS config (single file)
```

## Deployment

Every push to `main` builds the app and publishes it to GitHub Pages via
GitHub Actions. One-time setup: **Settings → Pages → Source: GitHub Actions**.

