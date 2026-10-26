// Complexity as a small textbook-style table: case on the left, notation set in math italics.
export default function ComplexityPanel({ title, info }) {
  const rows = [
    ["Best case", info.best],
    ["Average case", info.average],
    ["Worst case", info.worst],
    ["Extra space", info.space],
  ];
  return (
    <section className="panel">
      <h2 className="panel-title">{title} complexity</h2>
      <table className="w-full text-sm">
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label} className="border-b border-rule last:border-0">
              <th scope="row" className="py-1.5 text-left font-normal text-muted">
                {label}
              </th>
              <td className="math py-1.5 text-right text-base">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {info.note && <p className="mt-3 text-sm leading-relaxed text-muted">{info.note}</p>}
    </section>
  );
}
