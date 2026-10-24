// Fast, non-visual BFS/DFS on large graphs (adjacency lists of integer ids).

export function bfsStats(adj, start = 0) {
  const t0 = performance.now();
  const depth = new Int32Array(adj.length).fill(-1);
  const queue = new Int32Array(adj.length);
  let head = 0;
  let tail = 0;
  let edgesExamined = 0;
  let maxFrontier = 1;
  let maxDepth = 0;
  depth[start] = 0;
  queue[tail++] = start;
  while (head < tail) {
    const u = queue[head++];
    for (const v of adj[u]) {
      edgesExamined++;
      if (depth[v] === -1) {
        depth[v] = depth[u] + 1;
        if (depth[v] > maxDepth) maxDepth = depth[v];
        queue[tail++] = v;
      }
    }
    if (tail - head > maxFrontier) maxFrontier = tail - head;
  }
  return { visited: tail, edgesExamined, maxFrontier, maxDepth, time: performance.now() - t0 };
}

export function dfsStats(adj, start = 0) {
  const t0 = performance.now();
  const visited = new Uint8Array(adj.length);
  const stack = [[start, 0]];
  let count = 0;
  let edgesExamined = 0;
  let maxFrontier = 1;
  let maxDepth = 0;
  while (stack.length) {
    const [u, d] = stack.pop();
    if (visited[u]) continue;
    visited[u] = 1;
    count++;
    if (d > maxDepth) maxDepth = d;
    for (const v of adj[u]) {
      edgesExamined++;
      if (!visited[v]) stack.push([v, d + 1]);
    }
    if (stack.length > maxFrontier) maxFrontier = stack.length;
  }
  return { visited: count, edgesExamined, maxFrontier, maxDepth, time: performance.now() - t0 };
}
