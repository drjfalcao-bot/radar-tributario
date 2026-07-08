import type { RiskLevel } from "@/lib/RiskCalculator";
import { cn } from "@/lib/utils";

const LEVEL_COLOR: Record<RiskLevel, string> = {
  baixo: "text-emerald-600",
  medio: "text-amber-600",
  alto: "text-orange-600",
  critico: "text-red-600",
};

export function ScoreGauge({ score, nivel }: { score: number; nivel: RiskLevel }) {
  const stroke = 2 * Math.PI * 42;
  const offset = stroke - (score / 100) * stroke;

  return (
    <div className="relative grid h-36 w-36 place-items-center">
      <svg viewBox="0 0 100 100" className="-rotate-90">
        <circle cx="50" cy="50" r="42" fill="none" stroke="#e5e7eb" strokeWidth="10" />
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="10"
          strokeDasharray={stroke}
          strokeDashoffset={offset}
          className={cn("transition-all", LEVEL_COLOR[nivel])}
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-3xl font-semibold text-ink">{score}</div>
        <div className="text-xs uppercase tracking-wide text-neutral-500">RT-Score</div>
      </div>
    </div>
  );
}
