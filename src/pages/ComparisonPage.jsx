import { useState } from "react";
import { Play, Loader2 } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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

import { SORT_COLORS, GRAPH_COLORS, MUTED, RULE } from "../data/theme.js";

const AXIS = { fontSize: 12, fill: MUTED };
const shortName = (name) => name.replace(" Sort", "");

const clamp = (v, lo, hi, dflt) => Math.max(lo, Math.min(hi, Math.round(Number(v) || dflt)));

// Lets React paint the "running" state before a blocking benchmark starts.
const defer = (fn) => setTimeout(fn, 30);

function ChartCard({ title, note, children }) {
  return (
    <figure className="min-w-0">
      <figcaption className="mb-2">
        <span className="text-sm font-semibold">{title}</span>
        {note && <span className="block text-[13px] text-muted">{note}</span>}
      </figcaption>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </figure>
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
        // log axis: a count of 0 cannot be drawn, so plot it as 1
        for (const [key, { name }] of Object.entries(SORT_ALGORITHMS)) row[name] = Math.max(1, countSort(key, arr).comparisons);
        return row;
      });
      setSize(n);
      setResult({ rows, growth, n, kind });
      setRunning(false);
    });
  };

  const fastest = result && result.rows.reduce((a, b) => (b.time < a.time ? b : a));

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Sorting algorithms benchmark</h2>
        <p className="mt-1 text-sm text-muted">All five algorithms sort the same input array.</p>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="label">Array size, 10 to 10,000</label>
          <input type="number" className="input w-32" value={size} onChange={(e) => setSize(e.target.value)} />
        </div>
        <div>
          <label className="label">Starting order</label>
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
          {running ? "Running" : "Run benchmark"}
        </button>
      </div>

      {result && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink text-left text-[13px] font-medium text-muted">
                  <th className="py-2 pr-4 font-medium">Algorithm</th>
                  <th className="py-2 pr-4 text-right font-medium">Comparisons</th>
                  <th className="py-2 pr-4 text-right font-medium">Swaps / writes</th>
                  <th className="py-2 pr-4 text-right font-medium">Time</th>
                  <th className="py-2 pr-4 font-medium">Average complexity</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((r) => (
                  <tr key={r.key} className="border-b border-rule">
                    <td className="py-2 pr-4 font-medium">
                      <span
                        className="mr-2 inline-block h-2.5 w-2.5 rounded-full"
                        style={{ background: SORT_COLORS[r.name] }}
                      />
                      {r.name}
                      {r === fastest && <span className="ml-2 text-[13px] font-normal text-muted">fastest this run</span>}
                    </td>
                    <td className="py-2 pr-4 text-right">{full(r.comparisons)}</td>
                    <td className="py-2 pr-4 text-right">{full(r.swaps)}</td>
                    <td className="py-2 pr-4 text-right">{ms(r.time)}</td>
                    <td className="math py-2 pr-4 text-base">{SORT_COMPLEXITY[r.key].average}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 text-[13px] text-muted">
              n = {full(result.n)}, {ARRAY_CASES[result.kind].toLowerCase()}. Operation counts are exact; times are
              measured in your browser and change between runs.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard title="Comparisons">
              <BarChart data={result.rows}>
                <CartesianGrid stroke={RULE} vertical={false} />
                <XAxis dataKey="name" tickFormatter={shortName} tick={AXIS} interval={0} tickLine={false} />
                <YAxis tickFormatter={compact} tick={AXIS} width={50} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => full(v)} cursor={{ fill: RULE, opacity: 0.5 }} />
                <Bar dataKey="comparisons" name="Comparisons" radius={[3, 3, 0, 0]}>
                  {result.rows.map((r) => (
                    <Cell key={r.key} fill={SORT_COLORS[r.name]} />
                  ))}
                </Bar>
              </BarChart>
            </ChartCard>
            <ChartCard title="Running time, ms">
              <BarChart data={result.rows}>
                <CartesianGrid stroke={RULE} vertical={false} />
                <XAxis dataKey="name" tickFormatter={shortName} tick={AXIS} interval={0} tickLine={false} />
                <YAxis tick={AXIS} width={50} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => ms(v)} cursor={{ fill: RULE, opacity: 0.5 }} />
                <Bar dataKey="time" name="Time" radius={[3, 3, 0, 0]}>
                  {result.rows.map((r) => (
                    <Cell key={r.key} fill={SORT_COLORS[r.name]} />
                  ))}
                </Bar>
              </BarChart>
            </ChartCard>
          </div>
          <ChartCard
            title="Comparisons as n grows"
            note="Log scale, so the O(n log n) algorithms stay visible next to the O(n²) ones."
          >
            <LineChart data={result.growth}>
              <CartesianGrid stroke={RULE} />
              <XAxis dataKey="n" tick={AXIS} tickFormatter={full} tickLine={false} />
              <YAxis scale="log" domain={["auto", "auto"]} tickFormatter={compact} tick={AXIS} width={50} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => full(v)} labelFormatter={(n) => `n = ${full(n)}`} />
              <Legend wrapperStyle={{ fontSize: 13 }} iconType="plainline" />
              {Object.values(SORT_ALGORITHMS).map(({ name }) => (
                <Line key={name} dataKey={name} stroke={SORT_COLORS[name]} strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false} />
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
    <section className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">BFS vs DFS on a large random graph</h2>
        <p className="mt-1 text-sm text-muted">
          Both traversals start from node 0 of the same connected, undirected random graph.
        </p>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="label">Nodes, 10 to 20,000</label>
          <input type="number" className="input w-32" value={nodes} onChange={(e) => setNodes(e.target.value)} />
        </div>
        <div>
          <label className="label">Average degree, 2 to 10</label>
          <input type="number" className="input w-24" value={degree} onChange={(e) => setDegree(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={run} disabled={running}>
          {running ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
          {running ? "Running" : "Run benchmark"}
        </button>
      </div>

      {result && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink text-left text-[13px] font-medium text-muted">
                  <th className="py-2 pr-4 font-medium">Metric</th>
                  <th className="py-2 pr-4 text-right font-medium">BFS</th>
                  <th className="py-2 pr-4 text-right font-medium">DFS</th>
                </tr>
              </thead>
              <tbody>
                {GRAPH_METRICS.map(([key, label]) => (
                  <tr key={key} className="border-b border-rule">
                    <td className="py-2 pr-4">{label}</td>
                    <td className="py-2 pr-4 text-right">{full(result.bfs[key])}</td>
                    <td className="py-2 pr-4 text-right">{full(result.dfs[key])}</td>
                  </tr>
                ))}
                <tr className="border-b border-rule">
                  <td className="py-2 pr-4">Time</td>
                  <td className="py-2 pr-4 text-right">{ms(result.bfs.time)}</td>
                  <td className="py-2 pr-4 text-right">{ms(result.dfs.time)}</td>
                </tr>
              </tbody>
            </table>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">
              Graph: {full(result.n)} nodes, {full(result.edgeCount)} edges. Both run in O(V + E) and visit every node.
              BFS stays shallow (depth ≈ log V) while DFS goes very deep; their frontier (queue vs. stack) sizes show
              the different memory behaviour.
            </p>
          </div>
          <ChartCard title="BFS vs DFS">
            <BarChart data={result.chart}>
              <CartesianGrid stroke={RULE} vertical={false} />
              <XAxis dataKey="metric" tick={AXIS} interval={0} tickLine={false} />
              <YAxis tickFormatter={compact} tick={AXIS} width={50} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => full(v)} cursor={{ fill: RULE, opacity: 0.5 }} />
              <Legend wrapperStyle={{ fontSize: 13 }} />
              <Bar dataKey="BFS" fill={GRAPH_COLORS.BFS} radius={[3, 3, 0, 0]} />
              <Bar dataKey="DFS" fill={GRAPH_COLORS.DFS} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ChartCard>
        </div>
      )}
    </section>
  );
}

export default function ComparisonPage() {
  return (
    <div className="space-y-12">
      <SortBenchmark />
      <div className="border-t border-rule" />
      <GraphBenchmark />
    </div>
  );
}
