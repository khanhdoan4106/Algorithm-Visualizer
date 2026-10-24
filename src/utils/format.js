// Number formatting helpers shared by the visualizers and charts.

export const fmt = (x) => (Number.isInteger(x) ? String(x) : x.toFixed(1));

export const compact = (v) => new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(v);

export const full = (v) => new Intl.NumberFormat("en").format(v);

export const ms = (v) => `${v.toFixed(2)} ms`;
