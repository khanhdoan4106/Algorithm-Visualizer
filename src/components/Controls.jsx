import { Play, Pause, SkipBack, SkipForward, RotateCcw } from "lucide-react";

export default function Controls({ player }) {
  const { index, total, playing, speed, setSpeed, play, pause, next, prev, reset, seek } = player;
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button className="btn w-9 px-0" onClick={prev} disabled={index === 0} aria-label="Previous step" title="Previous step">
          <SkipBack size={16} />
        </button>
        {playing ? (
          <button className="btn btn-primary flex-1" onClick={pause}>
            <Pause size={16} /> Pause
          </button>
        ) : (
          <button className="btn btn-primary flex-1" onClick={play}>
            <Play size={16} /> {index > 0 && index < total - 1 ? "Resume" : "Play"}
          </button>
        )}
        <button
          className="btn w-9 px-0"
          onClick={next}
          disabled={index >= total - 1}
          aria-label="Next step"
          title="Next step"
        >
          <SkipForward size={16} />
        </button>
        <button className="btn w-9 px-0" onClick={reset} aria-label="Back to first step" title="Back to first step">
          <RotateCcw size={16} />
        </button>
      </div>
      <label className="block">
        <span className="label flex justify-between">
          <span>Step</span>
          <span className="text-ink">
            {index + 1} of {total}
          </span>
        </span>
        <input
          type="range"
          className="w-full"
          min={0}
          max={Math.max(0, total - 1)}
          value={index}
          onChange={(e) => seek(Number(e.target.value))}
        />
      </label>
      <label className="block">
        <span className="label flex justify-between">
          <span>Speed</span>
          <span className="text-ink">{speed <= 3 ? "Slow" : speed >= 8 ? "Fast" : "Normal"}</span>
        </span>
        <input
          type="range"
          className="w-full"
          min={1}
          max={10}
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
        />
      </label>
    </div>
  );
}
