import { useState } from "react";
import GraphPage from "./pages/GraphPage.jsx";
import SortingPage from "./pages/SortingPage.jsx";
import ComparisonPage from "./pages/ComparisonPage.jsx";

const TABS = [
  { id: "graph", label: "Graph search", Page: GraphPage },
  { id: "sorting", label: "Sorting", Page: SortingPage },
  { id: "compare", label: "Comparison", Page: ComparisonPage },
];

export default function App() {
  const [tab, setTab] = useState("graph");
  const { Page } = TABS.find((t) => t.id === tab);

  return (
    <div className="min-h-screen">
      <header className="border-b border-rule">
        <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-x-8 gap-y-2 px-4 pt-4 sm:px-6">
          <h1 className="pb-3 text-lg font-bold tracking-tight">Algorithm Visualizer</h1>
          <nav className="-mb-px flex gap-6" aria-label="Pages">
            {TABS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                aria-current={tab === id ? "page" : undefined}
                className={`border-b-2 pb-3 text-[15px] font-medium transition-colors ${
                  tab === id ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink"
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <Page />
      </main>
    </div>
  );
}
