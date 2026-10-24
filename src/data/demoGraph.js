export const CANVAS = { width: 720, height: 440, radius: 20, maxNodes: 12 };

const nodes = [
  { id: 1, label: "A", x: 80, y: 220 },
  { id: 2, label: "B", x: 220, y: 90 },
  { id: 3, label: "C", x: 220, y: 350 },
  { id: 4, label: "D", x: 380, y: 210 },
  { id: 5, label: "E", x: 390, y: 380 },
  { id: 6, label: "F", x: 530, y: 80 },
  { id: 7, label: "G", x: 545, y: 300 },
  { id: 8, label: "H", x: 660, y: 190 },
];

const pairs = [
  [1, 2, 4], [1, 3, 2], [2, 3, 1], [2, 4, 5], [3, 4, 8], [3, 5, 10],
  [4, 5, 2], [4, 6, 6], [4, 7, 4], [5, 7, 3], [6, 8, 3], [7, 8, 1],
];

export const DEMO_GRAPH = {
  nodes,
  edges: pairs.map(([from, to, weight], i) => ({ id: i + 1, from, to, weight })),
};
