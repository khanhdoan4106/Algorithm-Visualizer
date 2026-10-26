import { useMemo, useRef, useState } from "react";
import { Move, Plus, Link, Eraser, Shuffle, RotateCcw, Trash2 } from "lucide-react";
import Controls from "../components/Controls.jsx";
import ComplexityPanel from "../components/ComplexityPanel.jsx";
import FrontierStrip from "../components/FrontierStrip.jsx";
import { INK, GRAPHITE, HIGHLIGHT, REDPEN, MUTED } from "../data/theme.js";
import usePlayer from "../hooks/usePlayer.js";
import { buildGraph, GRAPH_ALGORITHMS } from "../algorithms/graphSearch.js";
import { GRAPH_COMPLEXITY } from "../data/complexity.js";
import { CANVAS, DEMO_GRAPH } from "../data/demoGraph.js";
import { nextLabel, randomGraph } from "../generators/graphGenerator.js";
import { fmt } from "../utils/format.js";

const { width: W, height: H, radius: R, maxNodes } = CANVAS;

// Vertex colours follow CLRS: white = undiscovered, gray = discovered (in the frontier),
// black = finished. Yellow highlighter marks the node being processed, red pen the answer.
const NODE_COLORS = {
  idle: { fill: "#ffffff", stroke: INK, text: INK },
  pending: { fill: HIGHLIGHT, stroke: INK, text: INK },
  frontier: { fill: GRAPHITE, stroke: INK, text: INK },
  visited: { fill: INK, stroke: INK, text: "#ffffff" },
  current: { fill: HIGHLIGHT, stroke: INK, text: INK },
  path: { fill: REDPEN, stroke: REDPEN, text: "#ffffff" },
};

const EDGE_COLORS = {
  idle: "#c3c8cf",
  tree: INK,
  selected: INK,
  active: INK,
  path: REDPEN,
};
const EDGE_WIDTH = { idle: 2, tree: 2.5, selected: 3, active: 3.5, path: 4.5 };

const MODES = [
  { id: "move", label: "Move", icon: Move, hint: "Drag nodes to move them. Click an edge to change its weight." },
  { id: "addNode", label: "Add node", icon: Plus, hint: `Click on empty space to add a node (max ${maxNodes}).` },
  { id: "addEdge", label: "Add edge", icon: Link, hint: "Click a node, then another node to connect them." },
  { id: "delete", label: "Delete", icon: Eraser, hint: "Click a node or an edge to delete it." },
];

const LEGEND = [
  ["idle", "Undiscovered"],
  ["frontier", "In frontier"],
  ["current", "Being processed"],
  ["visited", "Finished"],
  ["path", "Final path"],
];

const EMPTY_STEP = {
  current: null,
  activeEdge: null,
  visited: [],
  frontier: [],
  treeEdges: [],
  path: [],
  pathEdges: [],
  dist: null,
  message: "The graph is empty. Choose Add node and click the paper to start.",
};

const clampWeight = (v) => Math.max(0, Math.min(99, Math.round(Number(v) || 0)));

export default function GraphPage() {
  const [nodes, setNodes] = useState(DEMO_GRAPH.nodes);
  const [edges, setEdges] = useState(DEMO_GRAPH.edges);
  const [directed, setDirected] = useState(false);
  const [weighted, setWeighted] = useState(true);
  const [algo, setAlgo] = useState("bfs");
  const [startId, setStartId] = useState(1);
  const [targetId, setTargetId] = useState(8);
  const [mode, setMode] = useState("move");
  const [pendingFrom, setPendingFrom] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [newWeight, setNewWeight] = useState(1);
  const [randomCount, setRandomCount] = useState(8);
  const svgRef = useRef(null);
  const dragId = useRef(null);
  const nextId = useRef(1000);

  const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);
  const start = byId.has(startId) ? startId : nodes[0]?.id ?? null;
  const target = targetId != null && byId.has(targetId) ? targetId : null;

  const graph = useMemo(() => buildGraph(nodes, edges, { directed, weighted }), [nodes, edges, directed, weighted]);
  const steps = useMemo(
    () => (start == null ? [EMPTY_STEP] : GRAPH_ALGORITHMS[algo].run(graph, start, target)),
    [graph, algo, start, target]
  );
  const player = usePlayer(steps);
  const step = player.step;

  const sets = useMemo(
    () => ({
      visited: new Set(step.visited),
      frontier: new Set(step.frontier),
      path: new Set(step.path),
      tree: new Set(step.treeEdges),
      pathEdges: new Set(step.pathEdges),
    }),
    [step]
  );

  const nodeState = (id) => {
    if (id === pendingFrom) return "pending";
    if (sets.path.has(id)) return "path";
    if (id === step.current) return "current";
    if (sets.frontier.has(id)) return "frontier";
    if (sets.visited.has(id)) return "visited";
    return "idle";
  };

  const edgeState = (id) => {
    if (sets.pathEdges.has(id)) return "path";
    if (id === step.activeEdge) return "active";
    if (id === selectedEdge) return "selected";
    if (sets.tree.has(id)) return "tree";
    return "idle";
  };

  const toSvg = (e) => {
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    return {
      x: Math.round(Math.min(W - R, Math.max(R, p.x))),
      y: Math.round(Math.min(H - R - 14, Math.max(R + 14, p.y))),
    };
  };

  const edgeExists = (u, v) =>
    edges.some((e) => (e.from === u && e.to === v) || (!directed && e.from === v && e.to === u));

  const changeMode = (m) => {
    setMode(m);
    setPendingFrom(null);
    setSelectedEdge(null);
  };

  const onCanvasPointerDown = (e) => {
    setSelectedEdge(null);
    setPendingFrom(null);
    if (mode !== "addNode" || nodes.length >= maxNodes) return;
    const p = toSvg(e);
    const id = nextId.current++;
    setNodes((ns) => [...ns, { id, label: nextLabel(ns), ...p }]);
  };

  const onNodePointerDown = (e, id) => {
    e.stopPropagation();
    if (mode === "move") {
      dragId.current = id;
      svgRef.current.setPointerCapture(e.pointerId);
    } else if (mode === "delete") {
      setNodes((ns) => ns.filter((n) => n.id !== id));
      setEdges((es) => es.filter((x) => x.from !== id && x.to !== id));
    } else if (mode === "addEdge") {
      if (pendingFrom == null) {
        setPendingFrom(id);
        return;
      }
      if (pendingFrom !== id && !edgeExists(pendingFrom, id)) {
        const edge = { id: nextId.current++, from: pendingFrom, to: id, weight: clampWeight(newWeight) };
        setEdges((es) => [...es, edge]);
      }
      setPendingFrom(null);
    }
  };

  const onEdgePointerDown = (e, id) => {
    e.stopPropagation();
    if (mode === "delete") setEdges((es) => es.filter((x) => x.id !== id));
    else if (mode === "move") setSelectedEdge(id);
  };

  const onPointerMove = (e) => {
    const id = dragId.current;
    if (id == null) return;
    const p = toSvg(e);
    setNodes((ns) => ns.map((n) => (n.id === id ? { ...n, ...p } : n)));
  };

  const loadGraph = ({ nodes: ns, edges: es }) => {
    setNodes(ns);
    setEdges(es);
    setStartId(ns[0]?.id ?? null);
    setTargetId(ns.at(-1)?.id ?? null);
    setSelectedEdge(null);
    setPendingFrom(null);
  };

  const editingEdge = edges.find((e) => e.id === selectedEdge);
  const algoInfo = GRAPH_ALGORITHMS[algo];
  const L = graph.label;

  return (
    <div className="grid gap-x-8 gap-y-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0 space-y-5">
        <div className="seg" role="group" aria-label="Algorithm">
          {Object.entries(GRAPH_ALGORITHMS).map(([key, { name }]) => (
            <button key={key} aria-pressed={algo === key} onClick={() => setAlgo(key)}>
              {name}
            </button>
          ))}
        </div>

        <div>
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            className="graph-paper w-full touch-none select-none rounded-md border border-rule"
            onPointerMove={onPointerMove}
            onPointerUp={() => (dragId.current = null)}
            role="img"
            aria-label={`Graph with ${nodes.length} nodes and ${edges.length} edges`}
          >
            <defs>
              {Object.entries(EDGE_COLORS).map(([k, c]) => (
                <marker
                  key={k}
                  id={`arrow-${k}`}
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerUnits="userSpaceOnUse"
                  markerWidth="12"
                  markerHeight="12"
                  orient="auto"
                >
                  <path d="M0,0 L10,5 L0,10 z" fill={c} />
                </marker>
              ))}
            </defs>
            <rect
              width={W}
              height={H}
              fill="transparent"
              onPointerDown={onCanvasPointerDown}
              className={mode === "addNode" ? "cursor-crosshair" : ""}
            />

            {edges.map((e) => {
              const a = byId.get(e.from);
              const b = byId.get(e.to);
              if (!a || !b) return null;
              const dx = b.x - a.x;
              const dy = b.y - a.y;
              const len = Math.hypot(dx, dy) || 1;
              const ux = dx / len;
              const uy = dy / len;
              // Offset the two directions of a bidirectional pair so they don't overlap.
              const off = directed && edges.some((o) => o.from === e.to && o.to === e.from) ? 7 : 0;
              const ox = -uy * off;
              const oy = ux * off;
              const kind = edgeState(e.id);
              const mx = (a.x + b.x) / 2 + ox * 2.2;
              const my = (a.y + b.y) / 2 + oy * 2.2;
              const line = {
                x1: a.x + ux * R + ox,
                y1: a.y + uy * R + oy,
                x2: b.x - ux * (R + 2) + ox,
                y2: b.y - uy * (R + 2) + oy,
              };
              return (
                <g
                  key={e.id}
                  onPointerDown={(ev) => onEdgePointerDown(ev, e.id)}
                  className={mode === "move" || mode === "delete" ? "cursor-pointer" : ""}
                >
                  <line {...line} stroke="transparent" strokeWidth={14} />
                  {kind === "active" && (
                    <line {...line} stroke={HIGHLIGHT} strokeWidth={12} strokeLinecap="round" />
                  )}
                  <line
                    {...line}
                    stroke={EDGE_COLORS[kind]}
                    strokeWidth={EDGE_WIDTH[kind]}
                    strokeDasharray={kind === "selected" ? "6 4" : undefined}
                    markerEnd={directed ? `url(#arrow-${kind})` : undefined}
                  />
                  {weighted && (
                    <g>
                      <rect
                        x={mx - 11}
                        y={my - 10}
                        width={22}
                        height={19}
                        rx={3}
                        fill="#ffffff"
                        stroke={kind === "idle" ? "#c3c8cf" : EDGE_COLORS[kind]}
                      />
                      <text
                        x={mx}
                        y={my + 4}
                        textAnchor="middle"
                        fontSize="12"
                        fontWeight="600"
                        fill={kind === "path" ? REDPEN : INK}
                      >
                        {e.weight}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {nodes.map((n) => {
              const c = NODE_COLORS[nodeState(n.id)];
              const d = step.dist ? step.dist[n.id] : undefined;
              const tag = n.id === start ? "start" : n.id === target ? "target" : null;
              return (
                <g
                  key={n.id}
                  onPointerDown={(ev) => onNodePointerDown(ev, n.id)}
                  className={mode === "move" ? "cursor-grab" : "cursor-pointer"}
                >
                  {tag && (
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r={R + 5}
                      fill="none"
                      stroke={tag === "start" ? INK : REDPEN}
                      strokeWidth={1.5}
                      strokeDasharray="3 3"
                    />
                  )}
                  <circle cx={n.x} cy={n.y} r={R} fill={c.fill} stroke={c.stroke} strokeWidth={2.5} />
                  <text x={n.x} y={n.y + 5} textAnchor="middle" fontSize="15" fontWeight="700" fill={c.text}>
                    {n.label}
                  </text>
                  {tag && (
                    <text
                      x={n.x}
                      y={n.y - R - 10}
                      textAnchor="middle"
                      fontSize="12"
                      fontWeight="600"
                      fill={tag === "start" ? INK : REDPEN}
                      stroke="#ffffff"
                      strokeWidth={4}
                      paintOrder="stroke"
                    >
                      {tag}
                    </text>
                  )}
                  {step.dist && (
                    <text
                      x={n.x}
                      y={n.y + R + 16}
                      textAnchor="middle"
                      fontSize="12.5"
                      fontWeight="600"
                      fill={MUTED}
                      stroke="#ffffff"
                      strokeWidth={4}
                      paintOrder="stroke"
                    >
                      {d === undefined ? "∞" : fmt(d)}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
          <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-muted">
            {LEGEND.map(([k, label]) => (
              <li key={k} className="flex items-center gap-1.5">
                <span
                  className="inline-block h-3.5 w-3.5 rounded-full border-2"
                  style={{ background: NODE_COLORS[k].fill, borderColor: NODE_COLORS[k].stroke }}
                />
                {label}
              </li>
            ))}
            {step.dist && <li>Numbers under nodes: current distance</li>}
          </ul>
        </div>

        <section className="space-y-4" aria-live="polite">
          <p className="text-lg font-medium leading-snug sm:text-xl">{step.message}</p>
          {start != null && (
            <FrontierStrip algo={algo} frontier={step.frontier} label={L} dist={step.dist} fmt={fmt} />
          )}
          <p className="text-sm text-muted">
            <span className="font-semibold text-ink">Finished ({step.visited.length}):</span>{" "}
            {step.visited.map(L).join(", ") || "none yet"}
          </p>
        </section>
      </div>

      <aside className="space-y-6">
        <section className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <label>
              <span className="label">Start</span>
              <select className="input w-full" value={start ?? ""} onChange={(e) => setStartId(Number(e.target.value))}>
                {nodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="label">Target</span>
              <select
                className="input w-full"
                value={target ?? ""}
                onChange={(e) => setTargetId(e.target.value === "" ? null : Number(e.target.value))}
              >
                <option value="">None, visit all</option>
                {nodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <Controls player={player} />
        </section>

        <ComplexityPanel title={algoInfo.name} info={GRAPH_COMPLEXITY[algo]} />

        <section className="panel space-y-3">
          <div className="flex items-baseline justify-between">
            <h2 className="panel-title mb-0">Edit graph</h2>
            <span className="text-[13px] text-muted">
              {nodes.length} of {maxNodes} nodes
            </span>
          </div>
          <div className="seg grid w-full grid-cols-2" role="group" aria-label="Editing tool">
            {MODES.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                aria-pressed={mode === id}
                onClick={() => changeMode(id)}
                className="inline-flex flex-1 items-center justify-center gap-1"
              >
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>
          <p className="text-[13px] leading-relaxed text-muted">{MODES.find((m) => m.id === mode).hint}</p>

          {mode === "addEdge" && (
            <label className="flex items-center gap-2 text-sm">
              <span className="text-muted">Weight of new edges</span>
              <input
                type="number"
                min={0}
                max={99}
                className="input w-20"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
              />
            </label>
          )}

          {editingEdge && (
            <div className="flex items-center gap-2 rounded-md bg-sheet p-2 text-sm">
              <span>
                Edge {L(editingEdge.from)}
                {directed ? " → " : " – "}
                {L(editingEdge.to)}, weight
              </span>
              <input
                type="number"
                min={0}
                max={99}
                className="input w-16"
                value={editingEdge.weight}
                aria-label="Edge weight"
                onChange={(e) =>
                  setEdges((es) =>
                    es.map((x) => (x.id === editingEdge.id ? { ...x, weight: clampWeight(e.target.value) } : x))
                  )
                }
              />
              <button
                className="btn ml-auto w-9 px-0"
                title="Delete edge"
                aria-label="Delete edge"
                onClick={() => {
                  setEdges((es) => es.filter((x) => x.id !== editingEdge.id));
                  setSelectedEdge(null);
                }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}

          <div className="flex flex-wrap gap-5 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="accent-ink" checked={directed} onChange={(e) => setDirected(e.target.checked)} />
              Directed
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="accent-ink" checked={weighted} onChange={(e) => setWeighted(e.target.checked)} />
              Weighted
            </label>
          </div>

          <div className="space-y-2 border-t border-rule pt-3">
            <div className="flex items-center gap-2">
              <button
                className="btn flex-1"
                onClick={() => loadGraph(randomGraph(Math.max(2, Math.min(maxNodes, Number(randomCount) || 8))))}
              >
                <Shuffle size={15} /> Random graph
              </button>
              <label className="flex items-center gap-1.5 text-[13px] text-muted">
                <input
                  type="number"
                  min={2}
                  max={maxNodes}
                  className="input w-14"
                  value={randomCount}
                  onChange={(e) => setRandomCount(e.target.value)}
                />
                nodes
              </label>
            </div>
            <div className="flex gap-2">
              <button className="btn flex-1" onClick={() => loadGraph(DEMO_GRAPH)}>
                <RotateCcw size={15} /> Demo graph
              </button>
              <button className="btn flex-1" onClick={() => loadGraph({ nodes: [], edges: [] })}>
                <Trash2 size={15} /> Clear all
              </button>
            </div>
          </div>
        </section>
      </aside>
    </div>
  );
}
