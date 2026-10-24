export default function ComplexityPanel({ title, info }) {
  const rows = [
    ["Best", info.best],
    ["Average", info.average],
    ["Worst", info.worst],
    ["Space", info.space],
  ];
  return (
    <div className="card">
      <h3 className="mb-3 text-sm font-semibold text-slate-700">{title} — Complexity</h3>
      <div className="grid grid-cols-2 gap-2">
        {rows.map(([label, value]) => (
          <div key={label} className="rounded-lg bg-slate-50 px-3 py-2">
            <div className="text-[11px] font-semibold uppercase text-slate-500">{label}</div>
            <div className="font-mono text-sm text-indigo-700">{value}</div>
          </div>
        ))}
      </div>
      {info.note && <p className="mt-3 text-xs leading-relaxed text-slate-500">{info.note}</p>}
    </div>
  );
}
