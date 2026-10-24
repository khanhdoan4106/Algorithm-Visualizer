import { useMemo, useRef, useState } from "react";
import { Move, Plus, Link, Eraser, Shuffle, RotateCcw, Trash2 } from "lucide-react";
import Controls from "../components/Controls.jsx";
import ComplexityPanel from "../components/ComplexityPanel.jsx";
import usePlayer from "../hooks/usePlayer.js";
import { buildGraph, fmt, GRAPH_ALGORITHMS } from "../algorithms/graph.js";
import { GRAPH_COMPLEXITY } from "../data/complexity.js";
import { CANVAS, DEMO_GRAPH, nextLabel, randomGraph } from "../data/demoGraph.js";

const { width: W, height: H, radius: R, maxNodes } = CANVAS;

const NODE_COLORS = {
  idle: { fill: "#ffffff", stroke: "#94a3b8", text: "#334155" },
  pending: { fill: "#e0e7ff", stroke: "#6366f1", text: "#312e81" },
  frontier: { fill: "#fed7aa", stroke: "#f97316", text: "#7c2d12" },
  visited: { fill: "#bfdbfe", stroke: "#3b82f6", text: "#1e3a8a" },
  current: { fill: "#fde047", stroke: "#ca8a04", text: "#713f12" },
  path: { fill: "#86efac", stroke: "#16a34a", text: "#14532d" },
};

const EDGE_COLORS = {
  idle: "#cbd5e1",
  tree: "#60a5fa",
  selected: "#6366f1",
  active: "#f59e0b",
  path: "#16a34a",
};

const MODES = [
  { id: "move", label: "Move / Select", icon: Move, hint: "Drag nodes to move them. Click an edge to edit its weight." },
  { id: "addNode", label: "Add node", icon: Plus, hint: `Click on empty space to add a node (max ${maxNodes}).` },
  { id: "addEdge", label: "Add edge", icon: Link, hint: "Click a node, then another node to connect them." },
  { id: "delete", label: "Delete", icon: Eraser, hint: "Click a node or an edge to delete it." },
];

const LEGEND = [
  ["current", "Current"],
  ["frontier", "In frontier"],
  ["visited", "Visited"],
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
  message: "The graph is empty — add some nodes to start.",
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
    <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
      <div className="space-y-4">
        <div className="card">
          <div className="mb-3 flex flex-wrap gap-2">
            {Object.entries(GRAPH_ALGORITHMS).map(([key, { name }]) => (
              <button key={key} className={`btn ${algo === key ? "btn-active" : ""}`} onClick={() => setAlgo(key)}>
                {name}
              </button>
            ))}
          </div>
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            className="w-full touch-none select-none rounded-lg border border-slate-200 bg-slate-50"
            onPointerMove={onPointerMove}
            onPointerUp={() => (dragId.current = null)}
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
                  <line
                    {...line}
                    stroke={EDGE_COLORS[kind]}
                    strokeWidth={kind === "idle" ? 2 : kind === "tree" ? 3 : 4}
                    markerEnd={directed ? `url(#arrow-${kind})` : undefined}
                  />
                  {weighted && (
                    <g>
                      <rect
                        x={mx - 11}
                        y={my - 10}
                        width={22}
                        height={19}
                        rx={4}
                        fill="#ffffff"
                        stroke={EDGE_COLORS[kind]}
                      />
                      <text x={mx} y={my + 4} textAnchor="middle" fontSize="12" fontWeight="600" fill="#334155">
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
              return (
                <g
                  key={n.id}
                  onPointerDown={(ev) => onNodePointerDown(ev, n.id)}
                  className={mode === "move" ? "cursor-grab" : "cursor-pointer"}
                >
                  {(n.id === start || n.id === target) && (
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r={R + 5}
                      fill="none"
                      stroke={n.id === start ? "#16a34a" : "#dc2626"}
                      strokeWidth={2}
                      strokeDasharray="4 3"
                    />
                  )}
                  <circle cx={n.x} cy={n.y} r={R} fill={c.fill} stroke={c.stroke} strokeWidth={3} />
                  <text x={n.x} y={n.y + 5} textAnchor="middle" fontSize="15" fontWeight="700" fill={c.text}>
                    {n.label}
                  </text>
                  {n.id === start && (
                    <text x={n.x} y={n.y - R - 9} textAnchor="middle" fontSize="10" fontWeight="700" fill="#16a34a">
                      START
                    </text>
                  )}
                  {n.id === target && n.id !== start && (
                    <text x={n.x} y={n.y - R - 9} textAnchor="middle" fontSize="10" fontWeight="700" fill="#dc2626">
                      TARGET
                    </text>
                  )}
                  {step.dist && (
                    <text x={n.x} y={n.y + R + 15} textAnchor="middle" fontSize="12" fontWeight="600" fill="#475569">
                      {d === undefined ? "∞" : fmt(d)}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-600">
            {LEGEND.map(([k, label]) => (
              <span key={k} className="flex items-center gap-1.5">
                <span
                  className="inline-block h-3.5 w-3.5 rounded-full border-2"
                  style={{ background: NODE_COLORS[k].fill, borderColor: NODE_COLORS[k].stroke }}
                />
                {label}
              </span>
            ))}
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-1 w-5 rounded" style={{ background: EDGE_COLORS.tree }} />
              Search tree
            </span>
          </div>
        </div>

        <div className="card">
          <div className="text-xs font-semibold uppercase text-slate-500">Step explanation</div>
          <p className="mt-1 min-h-[24px] font-medium text-slate-800">{step.message}</p>
          {step.frontier.length > 0 && (
            <p className="mt-2 text-sm text-slate-600">
              <span className="font-semibold">{algoInfo.frontier}:</span> [{step.frontier.map(L).join(", ")}]
            </p>
          )}
          <p className="mt-1 text-sm text-slate-600">
            <span className="font-semibold">Visited ({step.visited.length}):</span> {step.visited.map(L).join(", ") || "—"}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="card space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Start</label>
              <select className="input w-full" value={start ?? ""} onChange={(e) => setStartId(Number(e.target.value))}>
                {nodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Target</label>
              <select
                className="input w-full"
                value={target ?? ""}
                onChange={(e) => setTargetId(e.target.value === "" ? null : Number(e.target.value))}
              >
                <option value="">None (full traversal)</option>
                {nodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <Controls player={player} />
        </div>

        <ComplexityPanel title={algoInfo.name} info={GRAPH_COMPLEXITY[algo]} />

        <div className="card space-y-3">
          <h3 className="text-sm font-semibold text-slate-700">
            Graph builder <span className="font-normal text-slate-500">({nodes.length}/{maxNodes} nodes)</span>
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {MODES.map(({ id, label, icon: Icon }) => (
              <button key={id} className={`btn ${mode === id ? "btn-active" : ""}`} onClick={() => changeMode(id)}>
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500">{MODES.find((m) => m.id === mode).hint}</p>

          {mode === "addEdge" && (
            <div className="flex items-center gap-2 text-sm">
              <label className="text-slate-600">Weight of new edges</label>
              <input
                type="number"
                min={0}
                max={99}
                className="input w-20"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
              />
            </div>
          )}

          {editingEdge && (
            <div className="flex items-center gap-2 rounded-lg bg-indigo-50 p-2 text-sm">
              <span className="text-indigo-800">
                Edge {L(editingEdge.from)}
                {directed ? " → " : " — "}
                {L(editingEdge.to)}, weight
              </span>
              <input
                type="number"
                min={0}
                max={99}
                className="input w-16"
                value={editingEdge.weight}
                onChange={(e) =>
                  setEdges((es) =>
                    es.map((x) => (x.id === editingEdge.id ? { ...x, weight: clampWeight(e.target.value) } : x))
                  )
                }
              />
              <button
                className="btn px-2"
                title="Delete edge"
                onClick={() => {
                  setEdges((es) => es.filter((x) => x.id !== editingEdge.id));
                  setSelectedEdge(null);
                }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}

          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={directed} onChange={(e) => setDirected(e.target.checked)} />
              Directed
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={weighted} onChange={(e) => setWeighted(e.target.checked)} />
              Weighted
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
            <input
              type="number"
              min={2}
              max={maxNodes}
              className="input w-16"
              value={randomCount}
              onChange={(e) => setRandomCount(e.target.value)}
              title="Number of nodes"
            />
            <button
              className="btn"
              onClick={() => loadGraph(randomGraph(Math.max(2, Math.min(maxNodes, Number(randomCount) || 8))))}
            >
              <Shuffle size={15} /> Random
            </button>
            <button className="btn" onClick={() => loadGraph(DEMO_GRAPH)}>
              <RotateCcw size={15} /> Demo
            </button>
            <button className="btn" onClick={() => loadGraph({ nodes: [], edges: [] })}>
              <Trash2 size={15} /> Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
