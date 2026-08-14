interface RatingRingProps {
  voteAverage: number;
  size?: number;
}

export function RatingRing({ voteAverage, size = 48 }: RatingRingProps) {
  const pct = Math.round((voteAverage / 10) * 100);
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  const color =
    pct >= 70 ? "stroke-emerald-400" : pct >= 40 ? "stroke-amber-400" : "stroke-rose-400";

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={3}
          className="fill-none stroke-white/15"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={3}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`fill-none transition-[stroke-dashoffset] duration-700 ease-out ${color}`}
        />
      </svg>
      <span className="absolute text-xs font-semibold text-foreground">
        {pct}
        <span className="align-top text-[8px]">%</span>
      </span>
    </div>
  );
}