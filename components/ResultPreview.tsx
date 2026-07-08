import type { DiagnosticResult, RiskLevel } from "@/lib/RiskCalculator";
import { formatCurrency } from "@/lib/RiskCalculator";
import { cn } from "@/lib/utils";
import { AlertTriangle, ArrowUpRight, Landmark, LineChart } from "lucide-react";
import { ScoreGauge } from "@/components/ScoreGauge";

const LEVEL_STYLES: Record<RiskLevel, { label: string; badge: string }> = {
  baixo: {
    label: "Risco baixo",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  medio: {
    label: "Risco medio",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
  },
  alto: {
    label: "Risco alto",
    badge: "bg-orange-50 text-orange-700 border-orange-200",
  },
  critico: {
    label: "Risco critico",
    badge: "bg-red-50 text-red-700 border-red-200",
  },
};

const PRESSURE_LABEL: Record<DiagnosticResult["pressaoB2B"], string> = {
  baixa: "Pressao B2B baixa",
  media: "Pressao B2B media",
  alta: "Pressao B2B alta",
};

export function ResultPreview({ result }: { result: DiagnosticResult | null }) {
  if (!result) {
    return (
      <div className="rounded-lg border border-dashed border-neutral-300 bg-white p-5 shadow-sm">
        <div className="grid place-items-center rounded-md border border-neutral-100 bg-[#f4f7f5] py-8">
          <div className="relative grid h-36 w-36 place-items-center rounded-full border border-neutral-200">
            <div className="absolute h-24 w-24 rounded-full border border-neutral-200" />
            <div className="absolute h-12 w-12 rounded-full border border-neutral-300" />
            <LineChart className="h-7 w-7 text-petroleum-700" />
          </div>
        </div>
        <p className="mt-4 text-sm font-semibold text-ink">Radar aguardando dados</p>
        <p className="mt-1 text-sm text-neutral-500">Receita, passivo, regime e setor definem a primeira leitura.</p>
      </div>
    );
  }

  const level = LEVEL_STYLES[result.nivel];

  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-panel">
      <div className="bg-[#102524] p-5 text-white">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-semibold uppercase text-[#c9aa63]">Painel executivo</span>
          <span className={cn("rounded-md border px-2.5 py-1 text-xs font-semibold", level.badge)}>
            {level.label}
          </span>
        </div>
        <div className="mt-4 flex items-center justify-center">
          <div className="rounded-full bg-white p-2">
            <ScoreGauge score={result.score} nivel={result.nivel} />
          </div>
        </div>
      </div>

      <div className="p-5">
        <dl className="grid gap-3 text-sm">
          <div className="rounded-md border border-neutral-100 bg-[#f7faf8] p-3">
            <dt className="flex items-center gap-2 text-neutral-500">
              <ArrowUpRight className="h-4 w-4 text-petroleum-700" />
              Exposicao estimada / ano
            </dt>
            <dd className="text-right font-medium text-neutral-900">
              {formatCurrency(result.exposicaoMin)} a {formatCurrency(result.exposicaoMax)}
            </dd>
          </div>
          <div className="rounded-md border border-neutral-100 bg-[#f7faf8] p-3">
            <dt className="flex items-center gap-2 text-neutral-500">
              <Landmark className="h-4 w-4 text-petroleum-700" />
              Preco da inacao
            </dt>
            <dd className="text-right font-medium text-neutral-900">
              {formatCurrency(result.precoInacaoMin)} a {formatCurrency(result.precoInacaoMax)}
            </dd>
          </div>
          <div className="rounded-md border border-neutral-100 bg-[#f7faf8] p-3">
            <dt className="flex items-center gap-2 text-neutral-500">
              <AlertTriangle className="h-4 w-4 text-petroleum-700" />
              {PRESSURE_LABEL[result.pressaoB2B]}
            </dt>
            <dd className="text-right font-medium text-neutral-900">{result.proximoPasso}</dd>
          </div>
        </dl>

        <div className="mt-5">
          <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">Principais atencoes</span>
          <ul className="mt-2 space-y-1.5 text-sm text-neutral-700">
            {result.ameacas.slice(0, 3).map((ameaca) => (
              <li key={ameaca} className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-neutral-400" />
                <span>{ameaca}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-5 border-t border-neutral-100 pt-3 text-xs text-neutral-400">
          Estimativa preliminar com dados informados verbalmente; nao substitui analise documental.
        </p>
      </div>
    </div>
  );
}
