import { useState } from "react";
import { Play, Loader2 } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { countSort, SORT_ALGORITHMS } from "../algorithms/sorting.js";
import { bfsStats, dfsStats } from "../algorithms/benchmark.js";
import { SORT_COMPLEXITY } from "../data/complexity.js";
import { ARRAY_CASES, generateArray } from "../generators/arrayGenerator.js";
import { randomLargeGraph } from "../generators/graphGenerator.js";
import { compact, full, ms } from "../utils/format.js";

const SORT_COLORS = {
  "Bubble Sort": "#ef4444",
  "Selection Sort": "#f59e0b",
  "Merge Sort": "#10b981",
  "Quick Sort": "#6366f1",
  "Heap Sort": "#ec4899",
};
const GRAPH_COLORS = { BFS: "#0ea5e9", DFS: "#f97316" };

const clamp = (v, lo, hi, dflt) => Math.max(lo, Math.min(hi, Math.round(Number(v) || dflt)));

// Lets React paint the "running" state before a blocking benchmark starts.
const defer = (fn) => setTimeout(fn, 30);

function ChartCard({ title, children }) {
  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <h4 className="mb-2 text-sm font-semibold text-slate-600">{title}</h4>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function SortBenchmark() {
  const [size, setSize] = useState(2000);
  const [kind, setKind] = useState("random");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);

  const run = () => {
    setRunning(true);
    defer(() => {
      const n = clamp(size, 10, 10000, 2000);
      const max = Math.max(100, n);
      const input = generateArray(n, kind, max);
      const rows = Object.entries(SORT_ALGORITHMS).map(([key, { name }]) => ({
        key,
        name,
        ...countSort(key, input),
      }));
      const sizes = [...new Set([0.1, 0.25, 0.5, 0.75, 1].map((f) => Math.max(10, Math.round(n * f))))];
      const growth = sizes.map((s) => {
        const arr = generateArray(s, kind, Math.max(100, s));
        const row = { n: s };
        for (const [key, { name }] of Object.entries(SORT_ALGORITHMS)) row[name] = countSort(key, arr).comparisons;
        return row;
      });
      setSize(n);
      setResult({ rows, growth, n, kind });
      setRunning(false);
    });
  };

  const fastest = result && result.rows.reduce((a, b) => (b.time < a.time ? b : a));

  return (
    <section className="card space-y-4">
      <div>
        <h2 className="text-base font-bold text-slate-800">Sorting algorithms benchmark</h2>
        <p className="text-sm text-slate-500">All five algorithms sort the exact same input array.</p>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="label">Array size (10 – 10,000)</label>
          <input type="number" className="input w-32" value={size} onChange={(e) => setSize(e.target.value)} />
        </div>
        <div>
          <label className="label">Case</label>
          <select className="input" value={kind} onChange={(e) => setKind(e.target.value)}>
            {Object.entries(ARRAY_CASES).map(([k, label]) => (
              <option key={k} value={k}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <button className="btn btn-primary" onClick={run} disabled={running}>
          {running ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
          {running ? "Running…" : "Run benchmark"}
        </button>
      </div>

      {result && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                  <th className="py-2 pr-4">Algorithm</th>
                  <th className="py-2 pr-4 text-right">Comparisons</th>
                  <th className="py-2 pr-4 text-right">Swaps / writes</th>
                  <th className="py-2 pr-4 text-right">Time</th>
                  <th className="py-2 pr-4">Average complexity</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((r) => (
                  <tr key={r.key} className="border-b border-slate-100">
                    <td className="py-2 pr-4 font-medium">
                      <span
                        className="mr-2 inline-block h-2.5 w-2.5 rounded-full"
                        style={{ background: SORT_COLORS[r.name] }}
                      />
                      {r.name}
                      {r === fastest && (
                        <span className="ml-2 rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-bold text-green-700">
                          FASTEST
                        </span>
                      )}
                    </td>
                    <td className="py-2 pr-4 text-right font-mono">{full(r.comparisons)}</td>
                    <td className="py-2 pr-4 text-right font-mono">{full(r.swaps)}</td>
                    <td className="py-2 pr-4 text-right font-mono">{ms(r.time)}</td>
                    <td className="py-2 pr-4 font-mono text-indigo-700">{SORT_COMPLEXITY[r.key].average}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 text-xs text-slate-500">
              n = {full(result.n)}, case: {ARRAY_CASES[result.kind]}. Times are measured in your browser and vary
              between runs; operation counts are exact.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard title="Comparisons">
              <BarChart data={result.rows}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} />
                <YAxis tickFormatter={compact} tick={{ fontSize: 11 }} width={50} />
                <Tooltip formatter={(v) => full(v)} />
                <Bar dataKey="comparisons" name="Comparisons" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartCard>
            <ChartCard title="Running time (ms)">
              <BarChart data={result.rows}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} />
                <YAxis tick={{ fontSize: 11 }} width={50} />
                <Tooltip formatter={(v) => ms(v)} />
                <Bar dataKey="time" name="Time" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartCard>
          </div>
          <ChartCard title="Growth: comparisons as n increases">
            <LineChart data={result.growth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="n" tick={{ fontSize: 11 }} tickFormatter={full} />
              <YAxis tickFormatter={compact} tick={{ fontSize: 11 }} width={50} />
              <Tooltip formatter={(v) => full(v)} labelFormatter={(n) => `n = ${full(n)}`} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {Object.values(SORT_ALGORITHMS).map(({ name }) => (
                <Line key={name} dataKey={name} stroke={SORT_COLORS[name]} strokeWidth={2} dot={{ r: 3 }} />
              ))}
            </LineChart>
          </ChartCard>
        </>
      )}
    </section>
  );
}

const GRAPH_METRICS = [
  ["visited", "Nodes visited"],
  ["edgesExamined", "Edges examined"],
  ["maxFrontier", "Max frontier size"],
  ["maxDepth", "Max depth reached"],
];

function GraphBenchmark() {
  const [nodes, setNodes] = useState(5000);
  const [degree, setDegree] = useState(4);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);

  const run = () => {
    setRunning(true);
    defer(() => {
      const n = clamp(nodes, 10, 20000, 5000);
      const d = clamp(degree, 2, 10, 4);
      const { adj, edgeCount } = randomLargeGraph(n, d);
      const bfs = bfsStats(adj, 0);
      const dfs = dfsStats(adj, 0);
      const chart = GRAPH_METRICS.map(([key, label]) => ({ metric: label, BFS: bfs[key], DFS: dfs[key] }));
      setNodes(n);
      setDegree(d);
      setResult({ n, edgeCount, bfs, dfs, chart });
      setRunning(false);
    });
  };

  return (
    <section className="card space-y-4">
      <div>
        <h2 className="text-base font-bold text-slate-800">BFS vs DFS on a large random graph</h2>
        <p className="text-sm text-slate-500">
          A connected, undirected random graph; both traversals start from node 0.
        </p>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="label">Nodes (10 – 20,000)</label>
          <input type="number" className="input w-32" value={nodes} onChange={(e) => setNodes(e.target.value)} />
        </div>
        <div>
          <label className="label">Average degree (2 – 10)</label>
          <input type="number" className="input w-24" value={degree} onChange={(e) => setDegree(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={run} disabled={running}>
          {running ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
          {running ? "Running…" : "Run benchmark"}
        </button>
      </div>

      {result && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                  <th className="py-2 pr-4">Metric</th>
                  <th className="py-2 pr-4 text-right">BFS</th>
                  <th className="py-2 pr-4 text-right">DFS</th>
                </tr>
              </thead>
              <tbody>
                {GRAPH_METRICS.map(([key, label]) => (
                  <tr key={key} className="border-b border-slate-100">
                    <td className="py-2 pr-4">{label}</td>
                    <td className="py-2 pr-4 text-right font-mono">{full(result.bfs[key])}</td>
                    <td className="py-2 pr-4 text-right font-mono">{full(result.dfs[key])}</td>
                  </tr>
                ))}
                <tr className="border-b border-slate-100">
                  <td className="py-2 pr-4">Time</td>
                  <td className="py-2 pr-4 text-right font-mono">{ms(result.bfs.time)}</td>
                  <td className="py-2 pr-4 text-right font-mono">{ms(result.dfs.time)}</td>
                </tr>
              </tbody>
            </table>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              Graph: {full(result.n)} nodes, {full(result.edgeCount)} edges. Both run in O(V + E) and visit every node.
              BFS stays shallow (depth ≈ log V) while DFS goes very deep; their frontier (queue vs. stack) sizes show
              the different memory behaviour.
            </p>
          </div>
          <ChartCard title="BFS vs DFS">
            <BarChart data={result.chart}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="metric" tick={{ fontSize: 11 }} interval={0} />
              <YAxis tickFormatter={compact} tick={{ fontSize: 11 }} width={50} />
              <Tooltip formatter={(v) => full(v)} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="BFS" fill={GRAPH_COLORS.BFS} radius={[4, 4, 0, 0]} />
              <Bar dataKey="DFS" fill={GRAPH_COLORS.DFS} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartCard>
        </div>
      )}
    </section>
  );
}

export default function ComparisonPage() {
  return (
    <div className="space-y-5">
      <SortBenchmark />
      <GraphBenchmark />
    </div>
  );
}
