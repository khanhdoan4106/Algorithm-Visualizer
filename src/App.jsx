import { useState } from "react";
import { Network, BarChart3, GitCompare } from "lucide-react";
import GraphPage from "./pages/GraphPage.jsx";
import SortingPage from "./pages/SortingPage.jsx";
import ComparisonPage from "./pages/ComparisonPage.jsx";

const TABS = [
  { id: "graph", label: "Graph Search", icon: Network, Page: GraphPage },
  { id: "sorting", label: "Sorting", icon: BarChart3, Page: SortingPage },
  { id: "compare", label: "Comparison", icon: GitCompare, Page: ComparisonPage },
];

export default function App() {
  const [tab, setTab] = useState("graph");
  const { Page } = TABS.find((t) => t.id === tab);

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <h1 className="text-lg font-bold text-indigo-700">Algorithm Visualizer</h1>
          <nav className="flex flex-wrap gap-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`btn ${tab === id ? "btn-active" : "border-transparent"}`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-5">
        <Page />
      </main>
    </div>
  );
}
