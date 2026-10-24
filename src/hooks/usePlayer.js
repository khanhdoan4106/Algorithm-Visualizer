import { useEffect, useState } from "react";

// Step-through controller shared by every visualizer.
export default function usePlayer(steps) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(5); // 1 (slow) .. 10 (fast)
  const last = Math.max(0, steps.length - 1);

  useEffect(() => {
    setIndex(0);
    setPlaying(false);
  }, [steps]);

  useEffect(() => {
    if (!playing) return;
    if (index >= last) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setIndex((i) => Math.min(i + 1, last)), 1100 - speed * 100);
    return () => clearTimeout(t);
  }, [playing, index, speed, last]);

  return {
    index: Math.min(index, last),
    step: steps[Math.min(index, last)],
    total: steps.length,
    playing,
    speed,
    setSpeed,
    play: () => {
      if (index >= last) setIndex(0);
      setPlaying(true);
    },
    pause: () => setPlaying(false),
    next: () => setIndex((i) => Math.min(i + 1, last)),
    prev: () => setIndex((i) => Math.max(i - 1, 0)),
    reset: () => {
      setPlaying(false);
      setIndex(0);
    },
    seek: (i) => setIndex(Math.max(0, Math.min(i, last))),
  };
}
