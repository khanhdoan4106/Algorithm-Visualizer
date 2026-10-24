// Graph search algorithms. Each one returns a list of snapshot steps for the visualizer.

export function buildGraph(nodes, edges, { directed, weighted }) {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const adj = new Map(nodes.map((n) => [n.id, []]));
  const label = (id) => byId.get(id)?.label ?? "?";

  for (const e of edges) {
    if (!adj.has(e.from) || !adj.has(e.to)) continue;
    const w = weighted ? e.weight : 1;
    adj.get(e.from).push({ to: e.to, w, edgeId: e.id });
    if (!directed) adj.get(e.to).push({ to: e.from, w, edgeId: e.id });
  }
  for (const list of adj.values()) list.sort((a, b) => label(a.to).localeCompare(label(b.to)));

  // A* heuristic: straight-line distance scaled by the smallest weight/length ratio of any
  // edge, so it never overestimates the real cost (admissible and consistent).
  let ratio = Infinity;
  for (const e of edges) {
    const a = byId.get(e.from);
    const b = byId.get(e.to);
    if (!a || !b) continue;
    const len = Math.hypot(a.x - b.x, a.y - b.y);
    if (len > 0) ratio = Math.min(ratio, (weighted ? e.weight : 1) / len);
  }
  if (!Number.isFinite(ratio)) ratio = 0;
  const h = (id, target) => {
    const a = byId.get(id);
    const b = byId.get(target);
    return Math.hypot(a.x - b.x, a.y - b.y) * ratio;
  };

  return { adj, label, h };
}

export const fmt = (x) => (Number.isInteger(x) ? String(x) : x.toFixed(1));

function makeRecorder() {
  const steps = [];
  const record = (state) =>
    steps.push({
      current: null,
      activeEdge: null,
      visited: [],
      frontier: [],
      treeEdges: [],
      path: [],
      pathEdges: [],
      dist: null,
      message: "",
      ...state,
    });
  return { steps, record };
}

const treeOf = (parent) => [...parent.values()].map((p) => p.edgeId);

function tracePath(parent, start, target) {
  const path = [target];
  const pathEdges = [];
  let cur = target;
  while (cur !== start) {
    const p = parent.get(cur);
    if (!p) return null;
    pathEdges.push(p.edgeId);
    cur = p.node;
    path.push(cur);
  }
  return { path: path.reverse(), pathEdges };
}

function finish({ record, steps, parent, start, target, state, L, cost }) {
  if (target == null) {
    record({ ...state, message: `Traversal complete — visited ${state.visited.length} node(s).` });
    return steps;
  }
  const found = tracePath(parent, start, target);
  if (!found) {
    record({ ...state, message: `No path from ${L(start)} to ${L(target)}.` });
    return steps;
  }
  record({
    ...state,
    ...found,
    message: `Path found: ${found.path.map(L).join(" → ")} (${cost(found)}).`,
  });
  return steps;
}

export function bfs(graph, start, target) {
  const { adj, label: L } = graph;
  const { steps, record } = makeRecorder();
  const discovered = new Set([start]);
  const done = new Set();
  const parent = new Map();
  const queue = [start];
  const base = () => ({ visited: [...done], frontier: [...queue], treeEdges: treeOf(parent) });

  record({ ...base(), message: `Enqueue the start node ${L(start)}.` });
  while (queue.length) {
    const u = queue.shift();
    record({ ...base(), current: u, message: `Dequeue ${L(u)} and look at its neighbors.` });
    if (u === target) {
      done.add(u);
      break;
    }
    for (const { to, edgeId } of adj.get(u)) {
      if (discovered.has(to)) {
        record({ ...base(), current: u, activeEdge: edgeId, message: `${L(to)} was already discovered — skip.` });
        continue;
      }
      discovered.add(to);
      parent.set(to, { node: u, edgeId });
      queue.push(to);
      record({
        ...base(),
        current: u,
        activeEdge: edgeId,
        message: `Discover ${L(to)} from ${L(u)} → enqueue. Queue: [${queue.map(L).join(", ")}]`,
      });
    }
    done.add(u);
  }
  return finish({
    record,
    steps,
    parent,
    start,
    target,
    L,
    state: { visited: [...done], treeEdges: treeOf(parent) },
    cost: (p) => `${p.pathEdges.length} edge(s)`,
  });
}

export function dfs(graph, start, target) {
  const { adj, label: L } = graph;
  const { steps, record } = makeRecorder();
  const done = new Set();
  const parent = new Map();
  const stack = [{ node: start, from: null, edgeId: null }];
  const base = () => ({
    visited: [...done],
    frontier: [...new Set(stack.map((s) => s.node))].filter((n) => !done.has(n)),
    treeEdges: treeOf(parent),
  });

  record({ ...base(), message: `Push the start node ${L(start)} onto the stack.` });
  while (stack.length) {
    const { node: u, from, edgeId } = stack.pop();
    if (done.has(u)) {
      record({ ...base(), activeEdge: edgeId, message: `Pop ${L(u)} — already visited, skip.` });
      continue;
    }
    done.add(u);
    if (from !== null) parent.set(u, { node: from, edgeId });
    record({ ...base(), current: u, activeEdge: edgeId, message: `Pop ${L(u)} and mark it visited.` });
    if (u === target) break;

    const next = adj.get(u).filter((n) => !done.has(n.to));
    // Push in reverse so the alphabetically first neighbor is explored first.
    for (let i = next.length - 1; i >= 0; i--) {
      stack.push({ node: next[i].to, from: u, edgeId: next[i].edgeId });
    }
    if (next.length) {
      record({
        ...base(),
        current: u,
        message: `Push unvisited neighbors of ${L(u)}: ${next.map((n) => L(n.to)).join(", ")}.`,
      });
    }
  }
  return finish({
    record,
    steps,
    parent,
    start,
    target,
    L,
    state: { visited: [...done], treeEdges: treeOf(parent) },
    cost: (p) => `${p.pathEdges.length} edge(s)`,
  });
}

// Dijkstra (useHeuristic = false) and A* (useHeuristic = true) share the same loop.
function bestFirst(graph, start, target, useHeuristic) {
  const { adj, label: L, h } = graph;
  const { steps, record } = makeRecorder();
  const H = (id) => (useHeuristic && target != null ? h(id, target) : 0);
  const g = new Map([[start, 0]]);
  const parent = new Map();
  const done = new Set();
  const open = new Set([start]);
  const base = () => ({
    visited: [...done],
    frontier: [...open],
    treeEdges: treeOf(parent),
    dist: Object.fromEntries(g),
  });

  record({ ...base(), message: `Set dist(${L(start)}) = 0, all other distances = ∞.` });
  while (open.size) {
    let u = null;
    for (const id of open) {
      if (u === null || g.get(id) + H(id) < g.get(u) + H(u)) u = id;
    }
    open.delete(u);
    done.add(u);
    record({
      ...base(),
      current: u,
      message: useHeuristic
        ? `Pick ${L(u)} with the smallest f = g + h = ${fmt(g.get(u))} + ${fmt(H(u))} = ${fmt(g.get(u) + H(u))}.`
        : `Pick ${L(u)} with the smallest distance ${fmt(g.get(u))}.`,
    });
    if (u === target) break;

    for (const { to, w, edgeId } of adj.get(u)) {
      if (done.has(to)) continue;
      const nd = g.get(u) + w;
      if (!g.has(to) || nd < g.get(to)) {
        const old = g.has(to) ? fmt(g.get(to)) : "∞";
        g.set(to, nd);
        parent.set(to, { node: u, edgeId });
        open.add(to);
        record({
          ...base(),
          current: u,
          activeEdge: edgeId,
          message: `Relax ${L(u)} → ${L(to)}: dist(${L(to)}) ${old} → ${fmt(nd)}.`,
        });
      } else {
        record({
          ...base(),
          current: u,
          activeEdge: edgeId,
          message: `${L(u)} → ${L(to)}: ${fmt(nd)} ≥ ${fmt(g.get(to))}, no improvement.`,
        });
      }
    }
  }
  return finish({
    record,
    steps,
    parent,
    start,
    target,
    L,
    state: { visited: [...done], treeEdges: treeOf(parent), dist: Object.fromEntries(g) },
    cost: () => `total cost ${fmt(g.get(target))}`,
  });
}

export const dijkstra = (graph, start, target) => bestFirst(graph, start, target, false);
export const astar = (graph, start, target) => bestFirst(graph, start, target, true);

export const GRAPH_ALGORITHMS = {
  bfs: { name: "BFS", run: bfs, frontier: "Queue" },
  dfs: { name: "DFS", run: dfs, frontier: "Stack" },
  dijkstra: { name: "Dijkstra", run: dijkstra, frontier: "Priority queue" },
  astar: { name: "A*", run: astar, frontier: "Open set" },
};
