import { useMemo, useState } from "react";
import { Shuffle, Check } from "lucide-react";
import Controls from "../components/Controls.jsx";
import ComplexityPanel from "../components/ComplexityPanel.jsx";
import usePlayer from "../hooks/usePlayer.js";
import { recordSort, SORT_ALGORITHMS } from "../algorithms/sorting.js";
import { ARRAY_CASES, generateArray, parseArray } from "../generators/arrayGenerator.js";
import { SORT_COMPLEXITY } from "../data/complexity.js";
import { INK, GRAPHITE, HIGHLIGHT, REDPEN } from "../data/theme.js";

const MAX_SIZE = 60;

// Same logic as the graph page: gray = not yet placed, black = finished,
// yellow highlighter = being compared, red pen = being moved.
const BAR_STYLES = {
  idle: { background: GRAPHITE },
  compare: { background: HIGHLIGHT, boxShadow: `inset 0 0 0 2px ${INK}` },
  swap: { background: REDPEN },
  write: { background: REDPEN },
  pivot: { background: "#ffffff", boxShadow: `inset 0 0 0 2px ${INK}` },
  sorted: { background: INK },
};

const LEGEND = [
  ["idle", "Unsorted"],
  ["compare", "Comparing"],
  ["swap", "Swap or write"],
  ["pivot", "Pivot"],
  ["sorted", "In final place"],
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

  const barStyle = (i) => {
    if (highlighted.has(i) && BAR_STYLES[step.type]) return BAR_STYLES[step.type];
    if (sorted.has(i)) return BAR_STYLES.sorted;
    return BAR_STYLES.idle;
  };

  return (
    <div className="grid gap-x-8 gap-y-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0 space-y-5">
        <div className="seg" role="group" aria-label="Algorithm">
          {Object.entries(SORT_ALGORITHMS).map(([key, { name }]) => (
            <button key={key} aria-pressed={algo === key} onClick={() => setAlgo(key)}>
              {name.replace(" Sort", "")}
            </button>
          ))}
        </div>

        <div>
          <div
            className="graph-paper flex h-72 items-end gap-[2px] rounded-md border border-rule px-2 pt-6 sm:h-80"
            role="img"
            aria-label={`Array of ${step.array.length} values`}
          >
            {step.array.map((v, i) => (
              <div key={i} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end">
                {showValues && <span className="mb-0.5 text-[11px] font-semibold text-ink/80">{v}</span>}
                <div
                  className="w-full rounded-t-sm transition-[height] duration-100"
                  style={{ height: `${(v / maxValue) * 88}%`, ...barStyle(i) }}
                />
              </div>
            ))}
          </div>
          <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-muted">
            {LEGEND.map(([k, label]) => (
              <li key={k} className="flex items-center gap-1.5">
                <span className="inline-block h-3.5 w-3.5 rounded-sm" style={BAR_STYLES[k]} />
                {label}
              </li>
            ))}
          </ul>
        </div>

        <section className="space-y-2" aria-live="polite">
          <p className="text-lg font-medium leading-snug sm:text-xl">{step.message}</p>
          <p className="text-sm text-muted">
            <span className="font-semibold text-ink">{step.comparisons}</span> comparisons and{" "}
            <span className="font-semibold text-ink">{step.swaps}</span> swaps or writes so far
          </p>
        </section>
      </div>

      <aside className="space-y-6">
        <Controls player={player} />

        <ComplexityPanel title={SORT_ALGORITHMS[algo].name} info={SORT_COMPLEXITY[algo]} />

        <section className="panel space-y-4">
          <h2 className="panel-title mb-0">Input array</h2>
          <label className="block">
            <span className="label flex justify-between">
              <span>Size</span>
              <span className="text-ink">{size} values</span>
            </span>
            <input
              type="range"
              className="w-full"
              min={5}
              max={MAX_SIZE}
              value={size}
              onChange={(e) => {
                const n = Number(e.target.value);
                setSize(n);
                regenerate(n, kind);
              }}
            />
          </label>
          <label className="block">
            <span className="label">Starting order</span>
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
          </label>
          <button className="btn w-full" onClick={() => regenerate()}>
            <Shuffle size={15} /> New array
          </button>
          <div className="border-t border-rule pt-4">
            <label className="label" htmlFor="manual-array">
              Or type your own values
            </label>
            <div className="flex gap-2">
              <input
                id="manual-array"
                className="input min-w-0 flex-1"
                placeholder="5, 3, 8, 1, 9, 2"
                value={manual}
                onChange={(e) => setManual(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applyManual()}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "manual-error" : undefined}
              />
              <button className="btn" onClick={applyManual}>
                <Check size={15} /> Use these
              </button>
            </div>
            {error && (
              <p id="manual-error" className="mt-1.5 text-[13px] text-redpen">
                {error}
              </p>
            )}
          </div>
        </section>
      </aside>
    </div>
  );
}
