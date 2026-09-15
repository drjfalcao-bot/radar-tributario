import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  Clock3,
  ExternalLink,
  Filter,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import {
  evaluateReformOpportunities,
  getReformOpportunityRulesCount,
  type ReformCertainty,
  type ReformFilterInput,
  type ReformOpportunity,
  type ReformUrgency,
} from "@/lib/reformOpportunityEngine";

const EMPTY_INPUT: ReformFilterInput = {
  nomeEmpresa: "",
  regimeTributario: "nao_sei",
  faturamentoAnual: 0,
  percentualB2B: 0,
  atividade: "outro",
  usaBeneficioFiscalFederal: false,
  possuiBeneficioOnerosoIcms: false,
  debitoRfbDefinitivoDias: 0,
  possuiCdaExecucao: false,
  garantiaExecucao: "nenhuma",
  multaAutoPercentual: 0,
  emiteNfseMeEpp: false,
  sistemaFiscalPreparado: "nao_sei",
};

const DEMO_INPUT: ReformFilterInput = {
  nomeEmpresa: "Transportadora Alfa",
  regimeTributario: "presumido",
  faturamentoAnual: 8_400_000,
  percentualB2B: 90,
  atividade: "transportes",
  usaBeneficioFiscalFederal: true,
  possuiBeneficioOnerosoIcms: false,
  debitoRfbDefinitivoDias: 125,
  possuiCdaExecucao: true,
  garantiaExecucao: "seguro",
  multaAutoPercentual: 0,
  emiteNfseMeEpp: false,
  sistemaFiscalPreparado: "parcial",
};

const URGENCY: Record<ReformUrgency, { label: string; order: number }> = {
  agora: { label: "Agora", order: 1 },
  "90_dias": { label: "Proximos 90 dias", order: 2 },
  "2027": { label: "2027", order: 3 },
  acompanhar: { label: "Acompanhar", order: 4 },
};

const CERTAINTY: Record<ReformCertainty, string> = {
  A: "Texto legal/regra expressa",
  B: "Regra + aplicacao dependente de enquadramento",
  C: "Gatilho de investigacao / ponto interpretativo",
};

const inputClass =
  "min-h-11 w-full rounded-xl border border-[#cfdbd6] bg-white px-3 py-2 text-sm text-[#17302e] outline-none transition focus:border-[#0b6a60] focus:ring-2 focus:ring-[#0b6a60]/10";

export function ReformOpportunityPage() {
  const [input, setInput] = useState<ReformFilterInput>(EMPTY_INPUT);
  const [analyzed, setAnalyzed] = useState(false);

  const opportunities = useMemo(
    () => (analyzed ? evaluateReformOpportunities(input) : []),
    [analyzed, input],
  );

  const critical = opportunities.filter((item) => item.score >= 90).length;
  const now = opportunities.filter((item) => item.urgencia === "agora").length;

  function update<K extends keyof ReformFilterInput>(key: K, value: ReformFilterInput[K]) {
    setInput((current) => ({ ...current, [key]: value }));
  }

  function runAnalysis() {
    setAnalyzed(true);
  }

  function loadDemo() {
    setInput(DEMO_INPUT);
    setAnalyzed(true);
  }

  function clear() {
    setInput(EMPTY_INPUT);
    setAnalyzed(false);
  }

  return (
    <main className="min-h-screen bg-[#f2f5f3] text-[#17302e]">
      <header className="border-b border-white/10 bg-[radial-gradient(circle_at_80%_10%,rgba(35,142,125,.22),transparent_35%),linear-gradient(110deg,#052b2d_0%,#073a38_55%,#052e32_100%)] text-white">
        <div className="mx-auto max-w-[1540px] px-4 py-6 sm:px-6 lg:px-8">
          <Link
            to="/app/inicio"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/65 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Central Estrategica
          </Link>
          <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#d9b56b]">
                <Sparkles className="h-3.5 w-3.5" />
                Inteligencia de oportunidades tributarias
              </div>
              <h1 className="mt-2 font-serif text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
                Filtro da Reforma
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-white/65">
                Informe poucos dados da empresa. O motor cruza o perfil com regras acionaveis em 2026 e mostra o que merece analise, prazo e proxima acao.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge icon={ShieldCheck} label={`${getReformOpportunityRulesCount()} regras ativas`} />
              <Badge icon={Clock3} label="Foco: set-dez/2026" />
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1540px] gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[minmax(0,520px)_minmax(0,1fr)] lg:px-8">
        <section className="space-y-4">
          <div className="rounded-2xl border border-[#d9e2de] bg-white p-5 shadow-[0_12px_36px_rgba(15,45,40,.06)]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8b713f]">Entrada</p>
                <h2 className="mt-1 text-xl font-semibold">Perfil rapido da empresa</h2>
                <p className="mt-1 text-xs leading-5 text-[#6c7c76]">
                  O filtro abre apenas gatilhos que os dados suportam. Resultado e triagem, nao conclusao juridica automatica.
                </p>
              </div>
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#edf5f2] text-[#0b6a60]">
                <Filter className="h-5 w-5" />
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Empresa" full>
                <input
                  value={input.nomeEmpresa}
                  onChange={(event) => update("nomeEmpresa", event.target.value)}
                  className={inputClass}
                  placeholder="Ex.: Transportadora Alfa"
                />
              </Field>

              <Field label="Regime tributario">
                <select
                  value={input.regimeTributario}
                  onChange={(event) =>
                    update("regimeTributario", event.target.value as ReformFilterInput["regimeTributario"])
                  }
                  className={inputClass}
                >
                  <option value="nao_sei">Nao sei</option>
                  <option value="simples">Simples Nacional</option>
                  <option value="presumido">Lucro Presumido</option>
                  <option value="real">Lucro Real</option>
                  <option value="cooperativa">Cooperativa</option>
                  <option value="outro">Outro</option>
                </select>
              </Field>

              <Field label="Faturamento anual estimado (R$)">
                <input
                  type="number"
                  min={0}
                  value={input.faturamentoAnual || ""}
                  onChange={(event) => update("faturamentoAnual", Number(event.target.value) || 0)}
                  className={inputClass}
                  placeholder="8400000"
                />
              </Field>

              <Field label="Vendas B2B (%)">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={input.percentualB2B || ""}
                  onChange={(event) =>
                    update("percentualB2B", Math.max(0, Math.min(100, Number(event.target.value) || 0)))
                  }
                  className={inputClass}
                  placeholder="80"
                />
              </Field>

              <Field label="Atividade predominante">
                <select
                  value={input.atividade}
                  onChange={(event) => update("atividade", event.target.value as ReformFilterInput["atividade"])}
                  className={inputClass}
                >
                  <option value="outro">Outro / nao definido</option>
                  <option value="servicos">Servicos</option>
                  <option value="comercio">Comercio</option>
                  <option value="industria">Industria</option>
                  <option value="transportes">Transportes</option>
                  <option value="construcao">Construcao</option>
                  <option value="agro">Agro</option>
                  <option value="imobiliario">Imobiliario</option>
                </select>
              </Field>

              <Field label="ERP/emissor preparado para IBS/CBS?">
                <select
                  value={input.sistemaFiscalPreparado}
                  onChange={(event) =>
                    update("sistemaFiscalPreparado", event.target.value as ReformFilterInput["sistemaFiscalPreparado"])
                  }
                  className={inputClass}
                >
                  <option value="nao_sei">Nao sei</option>
                  <option value="sim">Sim</option>
                  <option value="parcial">Parcial</option>
                  <option value="nao">Nao</option>
                </select>
              </Field>

              <Field label="Debito definitivo parado na RFB (dias)">
                <input
                  type="number"
                  min={0}
                  value={input.debitoRfbDefinitivoDias || ""}
                  onChange={(event) => update("debitoRfbDefinitivoDias", Number(event.target.value) || 0)}
                  className={inputClass}
                  placeholder="120"
                />
              </Field>

              <Field label="Multa em auto de infracao (%)">
                <input
                  type="number"
                  min={0}
                  value={input.multaAutoPercentual || ""}
                  onChange={(event) => update("multaAutoPercentual", Number(event.target.value) || 0)}
                  className={inputClass}
                  placeholder="150"
                />
              </Field>

              <Field label="Garantia em execucao">
                <select
                  value={input.garantiaExecucao}
                  onChange={(event) =>
                    update("garantiaExecucao", event.target.value as ReformFilterInput["garantiaExecucao"])
                  }
                  className={inputClass}
                >
                  <option value="nenhuma">Nenhuma / nao se aplica</option>
                  <option value="seguro">Seguro-garantia</option>
                  <option value="fianca">Fianca bancaria</option>
                  <option value="outra">Outra</option>
                </select>
              </Field>
            </div>

            <div className="mt-5 grid gap-2">
              <CheckLine
                checked={input.usaBeneficioFiscalFederal}
                onChange={(value) => update("usaBeneficioFiscalFederal", value)}
                label="Usa beneficio ou incentivo fiscal federal"
              />
              <CheckLine
                checked={input.possuiBeneficioOnerosoIcms}
                onChange={(value) => update("possuiBeneficioOnerosoIcms", value)}
                label="Possui beneficio oneroso de ICMS"
              />
              <CheckLine
                checked={input.possuiCdaExecucao}
                onChange={(value) => update("possuiCdaExecucao", value)}
                label="Possui CDA ou execucao fiscal relevante"
              />
              <CheckLine
                checked={input.emiteNfseMeEpp}
                onChange={(value) => update("emiteNfseMeEpp", value)}
                label="ME/EPP prestadora de servicos sujeita a NFS-e"
              />
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={runAnalysis}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#075d55] px-5 text-sm font-semibold text-white transition hover:bg-[#064f49]"
              >
                <Search className="h-4 w-4" />
                Analisar empresa
              </button>
              <button
                type="button"
                onClick={loadDemo}
                className="min-h-11 rounded-xl border border-[#cad8d3] bg-white px-4 text-sm font-semibold text-[#35544f] transition hover:bg-[#f4f8f6]"
              >
                Carregar exemplo
              </button>
              <button
                type="button"
                onClick={clear}
                className="min-h-11 rounded-xl px-3 text-sm font-semibold text-[#7a8984] transition hover:bg-[#f2f5f3]"
              >
                Limpar
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-[#d9e2de] bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#7d6a41]">Escala de certeza</p>
            <div className="mt-3 space-y-2 text-xs leading-5 text-[#667771]">
              {(Object.entries(CERTAINTY) as [ReformCertainty, string][]).map(([key, label]) => (
                <div key={key} className="flex gap-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#edf5f2] font-bold text-[#0b6a60]">{key}</span>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="min-w-0 space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Metric label="Oportunidades" value={String(opportunities.length)} />
            <Metric label="Prioridade alta" value={String(critical)} />
            <Metric label="Acao agora" value={String(now)} />
          </div>

          <div className="rounded-2xl border border-[#d9e2de] bg-white p-5 shadow-[0_12px_36px_rgba(15,45,40,.06)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8b713f]">Mapa</p>
                <h2 className="mt-1 text-xl font-semibold">Oportunidades por janela de acao</h2>
              </div>
              {analyzed && (
                <span className="text-xs text-[#71817b]">
                  {input.nomeEmpresa || "Empresa sem nome"} • {opportunities.length} gatilhos
                </span>
              )}
            </div>

            {!analyzed ? (
              <EmptyState />
            ) : (
              <div className="mt-5 grid gap-3 xl:grid-cols-4">
                {(Object.keys(URGENCY) as ReformUrgency[])
                  .sort((a, b) => URGENCY[a].order - URGENCY[b].order)
                  .map((urgency) => (
                    <OpportunityLane
                      key={urgency}
                      title={URGENCY[urgency].label}
                      items={opportunities.filter((item) => item.urgencia === urgency)}
                    />
                  ))}
              </div>
            )}
          </div>

          {analyzed && (
            <div className="space-y-3">
              {opportunities.length ? (
                opportunities.map((item) => <OpportunityCard key={item.id} opportunity={item} />)
              ) : (
                <div className="rounded-2xl border border-dashed border-[#cbd7d2] bg-white p-8 text-center text-sm text-[#71817b]">
                  Nenhum gatilho foi identificado com os dados informados. Isso nao significa ausencia de oportunidade: pode indicar que faltam dados especificos para acionar as regras atuais.
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function Field({
  label,
  full,
  children,
}: {
  label: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={full ? "sm:col-span-2" : ""}>
      <span className="mb-1.5 block text-xs font-semibold text-[#53655f]">{label}</span>
      {children}
    </label>
  );
}

function CheckLine({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#e1e8e5] bg-[#f9fbfa] px-3 py-2.5 text-sm text-[#405650]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-[#0b6a60]"
      />
      <span>{label}</span>
    </label>
  );
}

function Badge({ icon: Icon, label }: { icon: typeof ShieldCheck; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.07] px-3 py-2 text-xs font-semibold text-white/75">
      <Icon className="h-4 w-4 text-[#d9b56b]" />
      {label}
    </span>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#d9e2de] bg-white p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#81908b]">{label}</p>
      <p className="mt-1 text-3xl font-semibold text-[#17302e]">{value}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-5 grid min-h-[250px] place-items-center rounded-xl border border-dashed border-[#ccd8d3] bg-[#f8faf9] p-8 text-center">
      <div>
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#eaf3f0] text-[#0b6a60]">
          <Target className="h-7 w-7" />
        </span>
        <p className="mt-4 font-semibold">Radar aguardando o filtro</p>
        <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-[#71817b]">
          Preencha o perfil ao lado. O sistema vai mostrar somente oportunidades que tenham um gatilho objetivo nos dados informados.
        </p>
      </div>
    </div>
  );
}

function OpportunityLane({ title, items }: { title: string; items: ReformOpportunity[] }) {
  return (
    <div className="min-h-[190px] rounded-xl border border-[#e0e7e4] bg-[#f7f9f8] p-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-[#63746e]">{title}</h3>
        <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-[#667771]">{items.length}</span>
      </div>
      <div className="mt-3 space-y-2">
        {items.length ? (
          items.map((item) => (
            <div key={item.id} className="rounded-lg border border-[#dce5e1] bg-white p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-semibold leading-5 text-[#29413c]">{item.titulo}</p>
                <span className="text-xs font-bold text-[#0b6a60]">{item.score}</span>
              </div>
              <p className="mt-1 text-[10px] uppercase tracking-[0.08em] text-[#8a9793]">{item.id}</p>
            </div>
          ))
        ) : (
          <p className="rounded-lg border border-dashed border-[#dde5e2] bg-white/60 p-3 text-xs text-[#8a9793]">Nenhum gatilho</p>
        )}
      </div>
    </div>
  );
}

function OpportunityCard({ opportunity }: { opportunity: ReformOpportunity }) {
  const high = opportunity.score >= 90;

  return (
    <article className="overflow-hidden rounded-2xl border border-[#d9e2de] bg-white shadow-[0_8px_26px_rgba(15,45,40,.05)]">
      <div className={`h-1 ${high ? "bg-[#a64a3c]" : "bg-[#0b6a60]"}`} />
      <div className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#edf5f2] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#0b6a60]">
                {opportunity.natureza}
              </span>
              <span className="rounded-full border border-[#e0e7e4] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#6e7f79]">
                certeza {opportunity.certeza}
              </span>
              {opportunity.prazo && (
                <span className="rounded-full border border-[#ecd9ad] bg-[#fff9ec] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#8b6b2f]">
                  prazo {opportunity.prazo}
                </span>
              )}
            </div>
            <h3 className="mt-3 text-lg font-semibold text-[#17302e]">{opportunity.titulo}</h3>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8a9793]">
              {opportunity.id} • {opportunity.norma}
            </p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8a9793]">Prioridade</p>
            <p className={`text-3xl font-semibold ${high ? "text-[#9c493d]" : "text-[#0b6a60]"}`}>
              {opportunity.score}
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          <InfoBox title="Por que apareceu" text={opportunity.porQueDisparou} />
          <InfoBox title="Acao recomendada" text={opportunity.acaoRecomendada} accent />
          <InfoBox title="Ressalva juridica" text={opportunity.ressalva} warning />
        </div>

        <div className="mt-4 flex flex-col gap-2 border-t border-[#edf1ef] pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[#71817b]">Fonte usada para o gatilho: {opportunity.fonteLabel}</p>
          <a
            href={opportunity.fonteUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#0b6a60] hover:underline"
          >
            Abrir fonte oficial
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </article>
  );
}

function InfoBox({
  title,
  text,
  accent,
  warning,
}: {
  title: string;
  text: string;
  accent?: boolean;
  warning?: boolean;
}) {
  const style = warning
    ? "border-[#efd7cf] bg-[#fff7f4]"
    : accent
      ? "border-[#cde0da] bg-[#f0f7f4]"
      : "border-[#e2e8e5] bg-[#fafbfb]";
  const Icon = warning ? AlertTriangle : accent ? Sparkles : ShieldCheck;

  return (
    <div className={`rounded-xl border p-4 ${style}`}>
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${warning ? "text-[#a05545]" : "text-[#0b6a60]"}`} />
        <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#53655f]">{title}</p>
      </div>
      <p className="mt-2 text-sm leading-6 text-[#566862]">{text}</p>
    </div>
  );
}
