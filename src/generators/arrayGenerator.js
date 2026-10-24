export const ARRAY_CASES = {
  random: "Random",
  ascending: "Ascending (already sorted)",
  descending: "Descending (reversed)",
  nearly: "Nearly sorted",
  fewUnique: "Few unique values",
  allSame: "All same",
};

const randInt = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));

export function generateArray(n, kind, max = 100) {
  const ascending = () => Array.from({ length: n }, (_, i) => Math.max(1, Math.round(((i + 1) / n) * max)));
  switch (kind) {
    case "ascending":
      return ascending();
    case "descending":
      return ascending().reverse();
    case "nearly": {
      const a = ascending();
      const swaps = Math.max(1, Math.round(n * 0.05));
      for (let k = 0; k < swaps; k++) {
        const i = randInt(0, n - 1);
        const j = Math.min(n - 1, i + randInt(1, 3));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }
    case "fewUnique": {
      const values = [0.2, 0.45, 0.7, 0.95].map((f) => Math.max(1, Math.round(f * max)));
      return Array.from({ length: n }, () => values[randInt(0, values.length - 1)]);
    }
    case "allSame":
      return new Array(n).fill(Math.round(max / 2));
    default:
      return Array.from({ length: n }, () => randInt(1, max));
  }
}

// Parses "5, 3 8;1" into [5, 3, 8, 1]. Returns { array } or { error }.
export function parseArray(text, maxLength) {
  const parts = text.split(/[\s,;]+/).filter(Boolean);
  if (parts.length < 2) return { error: "Enter at least 2 numbers." };
  if (parts.length > maxLength) return { error: `At most ${maxLength} numbers.` };
  const array = parts.map(Number);
  if (array.some((x) => !Number.isInteger(x) || x < 1 || x > 999)) {
    return { error: "Use whole numbers between 1 and 999." };
  }
  return { array };
}
