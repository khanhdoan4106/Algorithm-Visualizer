// Sorting algorithms written against a small "context" object, so the same code can either
// record visual snapshots (recordSort) or just count operations for benchmarks (countSort).

function bubbleSort(c) {
  const n = c.a.length;
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - 1 - i; j++) {
      if (c.compare(j, j + 1) > 0) {
        c.swap(j, j + 1);
        swapped = true;
      }
    }
    c.markSorted(n - 1 - i);
    if (!swapped) break;
  }
  c.markAll();
}

function selectionSort(c) {
  const n = c.a.length;
  for (let i = 0; i < n - 1; i++) {
    let min = i;
    for (let j = i + 1; j < n; j++) {
      if (c.compare(j, min) < 0) min = j;
    }
    if (min !== i) c.swap(i, min);
    c.markSorted(i);
  }
  c.markAll();
}

function mergeSort(c) {
  const a = c.a;
  const aux = new Array(a.length);
  const merge = (lo, mid, hi) => {
    for (let k = lo; k <= hi; k++) aux[k] = a[k];
    let i = lo;
    let j = mid + 1;
    for (let k = lo; k <= hi; k++) {
      if (i > mid) c.write(k, aux[j++]);
      else if (j > hi) c.write(k, aux[i++]);
      else if (c.compareValues(aux[i], aux[j], [i, j]) <= 0) c.write(k, aux[i++]);
      else c.write(k, aux[j++]);
    }
  };
  const sort = (lo, hi) => {
    if (lo >= hi) return;
    const mid = (lo + hi) >> 1;
    sort(lo, mid);
    sort(mid + 1, hi);
    merge(lo, mid, hi);
  };
  sort(0, a.length - 1);
  c.markAll();
}

// Iterative (explicit stack) so large sorted inputs do not overflow the call stack.
function quickSort(c) {
  const stack = [[0, c.a.length - 1]];
  while (stack.length) {
    const [lo, hi] = stack.pop();
    if (lo >= hi) {
      if (lo === hi) c.markSorted(lo);
      continue;
    }
    c.pivot(hi);
    let i = lo;
    for (let j = lo; j < hi; j++) {
      if (c.compare(j, hi) < 0) {
        if (i !== j) c.swap(i, j);
        i++;
      }
    }
    if (i !== hi) c.swap(i, hi);
    c.markSorted(i);
    stack.push([i + 1, hi]);
    stack.push([lo, i - 1]);
  }
  c.markAll();
}

function heapSort(c) {
  const n = c.a.length;
  const siftDown = (i, size) => {
    for (;;) {
      const l = 2 * i + 1;
      const r = l + 1;
      let big = i;
      if (l < size && c.compare(l, big) > 0) big = l;
      if (r < size && c.compare(r, big) > 0) big = r;
      if (big === i) return;
      c.swap(i, big);
      i = big;
    }
  };
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) siftDown(i, n);
  for (let end = n - 1; end > 0; end--) {
    c.swap(0, end);
    c.markSorted(end);
    siftDown(0, end);
  }
  c.markAll();
}

export const SORT_ALGORITHMS = {
  bubble: { name: "Bubble Sort", fn: bubbleSort },
  selection: { name: "Selection Sort", fn: selectionSort },
  merge: { name: "Merge Sort", fn: mergeSort },
  quick: { name: "Quick Sort", fn: quickSort },
  heap: { name: "Heap Sort", fn: heapSort },
};

export function recordSort(key, input) {
  const a = [...input];
  const steps = [];
  const sorted = new Set();
  let comparisons = 0;
  let swaps = 0;
  const snap = (type, indices, message) =>
    steps.push({ array: [...a], type, indices, sorted: [...sorted], comparisons, swaps, message });

  const c = {
    a,
    compare(i, j) {
      comparisons++;
      snap("compare", [i, j], `Compare a[${i}] = ${a[i]} with a[${j}] = ${a[j]}.`);
      return a[i] - a[j];
    },
    compareValues(x, y, indices) {
      comparisons++;
      snap("compare", indices, `Compare ${x} with ${y}.`);
      return x - y;
    },
    swap(i, j) {
      swaps++;
      [a[i], a[j]] = [a[j], a[i]];
      snap("swap", [i, j], `Swap positions ${i} and ${j}.`);
    },
    write(k, v) {
      swaps++;
      a[k] = v;
      snap("write", [k], `Write ${v} into position ${k}.`);
    },
    pivot(p) {
      snap("pivot", [p], `Choose pivot a[${p}] = ${a[p]}.`);
    },
    markSorted(i) {
      sorted.add(i);
    },
    markAll() {
      a.forEach((_, i) => sorted.add(i));
      snap("done", [], `Sorted! ${comparisons} comparisons, ${swaps} swaps/writes.`);
    },
  };

  snap("start", [], "Initial array.");
  SORT_ALGORITHMS[key].fn(c);
  return steps;
}

export function countSort(key, input) {
  const a = [...input];
  let comparisons = 0;
  let swaps = 0;
  const c = {
    a,
    compare(i, j) {
      comparisons++;
      return a[i] - a[j];
    },
    compareValues(x, y) {
      comparisons++;
      return x - y;
    },
    swap(i, j) {
      swaps++;
      const t = a[i];
      a[i] = a[j];
      a[j] = t;
    },
    write(k, v) {
      swaps++;
      a[k] = v;
    },
    pivot() {},
    markSorted() {},
    markAll() {},
  };
  const t0 = performance.now();
  SORT_ALGORITHMS[key].fn(c);
  const time = performance.now() - t0;
  return { comparisons, swaps, time };
}
