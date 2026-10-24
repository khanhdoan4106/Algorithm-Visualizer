import { useMemo, useState } from "react";
import { Shuffle, Check } from "lucide-react";
import Controls from "../components/Controls.jsx";
import ComplexityPanel from "../components/ComplexityPanel.jsx";
import usePlayer from "../hooks/usePlayer.js";
import { recordSort, SORT_ALGORITHMS } from "../algorithms/sorting.js";
import { ARRAY_CASES, generateArray, parseArray } from "../generators/arrayGenerator.js";
import { SORT_COMPLEXITY } from "../data/complexity.js";

const MAX_SIZE = 60;

const BAR_COLORS = {
  idle: "#93c5fd",
  compare: "#facc15",
  swap: "#f87171",
  write: "#f87171",
  pivot: "#a78bfa",
  sorted: "#4ade80",
};

const LEGEND = [
  ["compare", "Comparing"],
  ["swap", "Swap / write"],
  ["pivot", "Pivot"],
  ["sorted", "Sorted"],
];

export default function SortingPage() {
  const [algo, setAlgo] = useState("bubble");
  const [size, setSize] = useState(20);
  const [kind, setKind] = useState("random");
  const [array, setArray] = useState(() => generateArray(20, "random"));
  const [manual, setManual] = useState("");
  const [error, setError] = useState("");

  const steps = useMemo(() => recordSort(algo, array), [algo, array]);
  const player = usePlayer(steps);
  const step = player.step;

  const sorted = useMemo(() => new Set(step.sorted), [step]);
  const highlighted = useMemo(() => new Set(step.indices), [step]);
  const maxValue = Math.max(...step.array, 1);
  const showValues = step.array.length <= 30;

  const regenerate = (n = size, k = kind) => {
    setArray(generateArray(n, k));
    setError("");
  };

  const applyManual = () => {
    const { array: parsed, error: err } = parseArray(manual, MAX_SIZE);
    if (err) {
      setError(err);
      return;
    }
    setError("");
    setSize(parsed.length);
    setArray(parsed);
  };

  const barColor = (i) => {
    if (highlighted.has(i) && BAR_COLORS[step.type]) return BAR_COLORS[step.type];
    if (sorted.has(i)) return BAR_COLORS.sorted;
    return BAR_COLORS.idle;
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
      <div className="space-y-4">
        <div className="card">
          <div className="mb-3 flex flex-wrap gap-2">
            {Object.entries(SORT_ALGORITHMS).map(([key, { name }]) => (
              <button key={key} className={`btn ${algo === key ? "btn-active" : ""}`} onClick={() => setAlgo(key)}>
                {name}
              </button>
            ))}
          </div>
          <div className="flex h-80 items-end gap-[2px] rounded-lg border border-slate-200 bg-slate-50 px-2 pt-6">
            {step.array.map((v, i) => (
              <div key={i} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end">
                {showValues && <span className="mb-0.5 text-[10px] font-semibold text-slate-600">{v}</span>}
                <div
                  className="w-full rounded-t transition-[height] duration-100"
                  style={{ height: `${(v / maxValue) * 88}%`, background: barColor(i) }}
                />
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-600">
            {LEGEND.map(([k, label]) => (
              <span key={k} className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded-sm" style={{ background: BAR_COLORS[k] }} />
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="text-xs font-semibold uppercase text-slate-500">Step explanation</div>
          <p className="mt-1 min-h-[24px] font-medium text-slate-800">{step.message}</p>
          <div className="mt-2 flex gap-6 text-sm text-slate-600">
            <span>
              Comparisons: <b className="text-slate-800">{step.comparisons}</b>
            </span>
            <span>
              Swaps / writes: <b className="text-slate-800">{step.swaps}</b>
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="card">
          <Controls player={player} />
        </div>

        <ComplexityPanel title={SORT_ALGORITHMS[algo].name} info={SORT_COMPLEXITY[algo]} />

        <div className="card space-y-3">
          <h3 className="text-sm font-semibold text-slate-700">Input array</h3>
          <div>
            <label className="label">
              Size: {size}
            </label>
            <input
              type="range"
              className="w-full accent-indigo-600"
              min={5}
              max={MAX_SIZE}
              value={size}
              onChange={(e) => {
                const n = Number(e.target.value);
                setSize(n);
                regenerate(n, kind);
              }}
            />
          </div>
          <div>
            <label className="label">Case</label>
            <select
              className="input w-full"
              value={kind}
              onChange={(e) => {
                setKind(e.target.value);
                regenerate(size, e.target.value);
              }}
            >
              {Object.entries(ARRAY_CASES).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <button className="btn w-full" onClick={() => regenerate()}>
            <Shuffle size={15} /> Generate new array
          </button>
          <div className="border-t border-slate-100 pt-3">
            <label className="label">Manual input</label>
            <div className="flex gap-2">
              <input
                className="input min-w-0 flex-1"
                placeholder="e.g. 5, 3, 8, 1, 9, 2"
                value={manual}
                onChange={(e) => setManual(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applyManual()}
              />
              <button className="btn" onClick={applyManual}>
                <Check size={15} /> Use
              </button>
            </div>
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
