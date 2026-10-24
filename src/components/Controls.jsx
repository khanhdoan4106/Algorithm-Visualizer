import { Play, Pause, SkipBack, SkipForward, RotateCcw } from "lucide-react";

export default function Controls({ player }) {
  const { index, total, playing, speed, setSpeed, play, pause, next, prev, reset, seek } = player;
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button className="btn" onClick={prev} disabled={index === 0} title="Previous step">
          <SkipBack size={16} />
        </button>
        {playing ? (
          <button className="btn btn-primary min-w-[88px]" onClick={pause}>
            <Pause size={16} /> Pause
          </button>
        ) : (
          <button className="btn btn-primary min-w-[88px]" onClick={play}>
            <Play size={16} /> Play
          </button>
        )}
        <button className="btn" onClick={next} disabled={index >= total - 1} title="Next step">
          <SkipForward size={16} />
        </button>
        <button className="btn" onClick={reset} title="Reset">
          <RotateCcw size={16} /> Reset
        </button>
      </div>
      <div>
        <div className="mb-1 text-xs text-slate-500">
          Step {index + 1} / {total}
        </div>
        <input
          type="range"
          className="w-full accent-indigo-600"
          min={0}
          max={Math.max(0, total - 1)}
          value={index}
          onChange={(e) => seek(Number(e.target.value))}
        />
      </div>
      <div>
        <div className="mb-1 flex justify-between text-xs text-slate-500">
          <span>Speed</span>
          <span>{speed} / 10</span>
        </div>
        <input
          type="range"
          className="w-full accent-indigo-600"
          min={1}
          max={10}
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
        />
      </div>
    </div>
  );
}
