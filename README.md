# Algorithm Visualizer

An interactive visualizer for graph search algorithms (BFS, DFS, Dijkstra, A*)
and sorting algorithms (Bubble, Selection, Merge, Quick, Heap), built with
React + Vite + Tailwind CSS.

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

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL (usually http://localhost:5173).

## Build for production

```bash
npm run build
npm run preview
```

## Project structure

```
src/
  App.jsx       # main visualizer component (all pages/logic)
  main.jsx      # React entry point
  index.css     # Tailwind directives
```
