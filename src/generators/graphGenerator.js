import { CANVAS } from "../data/demoGraph.js";

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

// Large connected random graph as integer adjacency lists, used by the benchmark page.
export function randomLargeGraph(n, avgDegree) {
  const adj = Array.from({ length: n }, () => []);
  // Random spanning tree first, so the graph is connected.
  for (let i = 1; i < n; i++) {
    const j = Math.floor(Math.random() * i);
    adj[i].push(j);
    adj[j].push(i);
  }
  const extra = Math.max(0, Math.floor((n * avgDegree) / 2) - (n - 1));
  for (let k = 0; k < extra; k++) {
    const u = Math.floor(Math.random() * n);
    const v = Math.floor(Math.random() * n);
    if (u !== v) {
      adj[u].push(v);
      adj[v].push(u);
    }
  }
  const edgeCount = adj.reduce((s, l) => s + l.length, 0) / 2;
  return { adj, edgeCount };
}
