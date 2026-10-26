// Draws the search frontier as the data structure it really is: a row of cells
// with the end that gets removed next marked, instead of a plain "[A, B]" string.

const KINDS = {
  bfs: { name: "Queue", head: "front", tail: "back", note: "Dequeue from the front, enqueue at the back." },
  dfs: { name: "Stack", head: "bottom", tail: "top", note: "Push and pop at the top." },
  dijkstra: { name: "Priority queue", head: "min", tail: "", note: "Ordered by distance; the smallest comes out next." },
  astar: { name: "Open set", head: "", tail: "", note: "The node with the smallest f = g + h is picked next." },
};

export default function FrontierStrip({ algo, frontier, label, dist, fmt }) {
  const kind = KINDS[algo];
  let items = frontier;
  if (algo === "dijkstra" && dist) {
    items = [...frontier].sort((a, b) => (dist[a] ?? Infinity) - (dist[b] ?? Infinity));
  }
  const nextOut = algo === "dfs" ? items.length - 1 : algo === "astar" ? -1 : 0;

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-4">
        <h3 className="text-sm font-semibold">{kind.name}</h3>
        <p className="text-[13px] text-muted">{kind.note}</p>
      </div>
      <div className="flex items-stretch gap-2">
        {kind.head && <span className="w-12 shrink-0 self-center text-right text-xs text-muted">{kind.head}</span>}
        <ol className="flex min-h-[52px] flex-1 flex-wrap items-stretch gap-1.5 rounded-md border border-dashed border-graphite p-1.5">
          {items.length === 0 && <li className="self-center px-2 text-sm text-muted">empty</li>}
          {items.map((id, i) => (
            <li
              key={id}
              className={`flex min-w-[40px] flex-col items-center justify-center rounded border-2 px-2 py-0.5 ${
                i === nextOut ? "border-ink bg-highlight" : "border-ink bg-graphite/40"
              }`}
              title={i === nextOut ? "Removed next" : undefined}
            >
              <span className="text-[15px] font-bold leading-tight">{label(id)}</span>
              {dist && dist[id] !== undefined && (
                <span className="text-[11px] leading-tight text-ink/70">{fmt(dist[id])}</span>
              )}
            </li>
          ))}
        </ol>
        {kind.tail && <span className="w-12 shrink-0 self-center text-xs text-muted">{kind.tail}</span>}
      </div>
    </div>
  );
}
