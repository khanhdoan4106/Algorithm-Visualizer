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

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export const nextLabel = (nodes) => {
  const used = new Set(nodes.map((n) => n.label));
  return [...LETTERS].find((l) => !used.has(l)) ?? `N${nodes.length + 1}`;
};

const randInt = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));

// Places nodes on a jittered 4x3 grid and links each to its nearest earlier node (a tree),
// then adds a few extra short edges.
export function randomGraph(count) {
  const { width: W, height: H } = CANVAS;
  const cols = 4;
  const rows = 3;
  const cells = Array.from({ length: cols * rows }, (_, i) => i).sort(() => Math.random() - 0.5);
  const nodes = cells.slice(0, count).map((cell, i) => ({
    id: i + 1,
    label: LETTERS[i],
    x: Math.round(90 + (cell % cols) * ((W - 180) / (cols - 1)) + randInt(-35, 35)),
    y: Math.round(70 + Math.floor(cell / cols) * ((H - 140) / (rows - 1)) + randInt(-30, 30)),
  }));
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const edges = [];
  const has = (u, v) => edges.some((e) => (e.from === u && e.to === v) || (e.from === v && e.to === u));
  const add = (u, v) => edges.push({ id: edges.length + 1, from: u, to: v, weight: randInt(1, 9) });

  for (let i = 1; i < nodes.length; i++) {
    const nearest = nodes.slice(0, i).reduce((best, n) => (dist(n, nodes[i]) < dist(best, nodes[i]) ? n : best));
    add(nearest.id, nodes[i].id);
  }
  for (let k = 0; k < Math.floor(count / 2); k++) {
    const a = nodes[randInt(0, nodes.length - 1)];
    const near = nodes
      .filter((n) => n.id !== a.id)
      .sort((x, y) => dist(x, a) - dist(y, a))
      .slice(0, 3);
    const b = near[randInt(0, near.length - 1)];
    if (b && !has(a.id, b.id)) add(a.id, b.id);
  }
  return { nodes, edges };
}
