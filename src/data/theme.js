// Colours used inside SVG / inline styles (Tailwind classes cannot reach these).
// Keep in sync with the palette in vite.config.js.

export const INK = "#1b1d22";
export const GRAPHITE = "#b8bec6";
export const MUTED = "#5c636d";
export const RULE = "#e3e6ea";
export const HIGHLIGHT = "#ffd84d";
export const REDPEN = "#c8312b";

// One fixed colour per algorithm, reused by every chart on the Comparison page.
export const SORT_COLORS = {
  "Bubble Sort": "#c8312b",
  "Selection Sort": "#d98a00",
  "Merge Sort": "#2f7d55",
  "Quick Sort": "#2b5fb4",
  "Heap Sort": "#7a4fb0",
};
export const GRAPH_COLORS = { BFS: "#2b5fb4", DFS: "#c8312b" };
