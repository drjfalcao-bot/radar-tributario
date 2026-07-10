import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Calculator, Clipboard, ExternalLink, Landmark, SlidersHorizontal } from "lucide-react";
import { formatCurrency } from "@/lib/RiskCalculator";
import {
  calculateNegotiation,
  type Capag,
  type ContributorProfile,
  type NegotiationInput,
  type NegotiationScenario,
  type NatureResult,
  type ReducibleBaseMode,
  type RfbInstallmentSituation,
  type YesNo,
} from "@/lib/negotiationCalculator";

const PROFILE_OPTIONS: { value: ContributorProfile; label: string }[] = [
  { value: "geral", label: "Pessoa juridica geral" },
  { value: "me_epp", label: "Microempresa / EPP" },
  { value: "mei", label: "MEI" },
  { value: "pf", label: "Pessoa fisica" },
  { value: "cooperativa_ensino_osc", label: "Cooperativa / ensino / OSC" },
  { value: "recuperacao_judicial", label: "Recuperacao judicial" },
  { value: "demais", label: "Outro perfil parametrizavel" },
];

const CAPAG_OPTIONS: { value: Capag; label: string }[] = [
  { value: "A", label: "A" },
  { value: "B", label: "B" },
  { value: "C", label: "C" },
  { value: "D", label: "D" },
  { value: "nao_sei", label: "Nao informada" },
];

const RFB_OPTIONS: { value: RfbInstallmentSituation; label: string }[] = [
  { value: "parcelamento_inicial", label: "Parcelamento inicial" },
  { value: "primeiro_reparcelamento", label: "Primeiro reparcelamento" },
  { value: "novo_reparcelamento", label: "Novo reparcelamento" },
  { value: "manual", label: "Configuracao manual" },
];

const BASE_OPTIONS: { value: ReducibleBaseMode; label: string }[] = [
  { value: "nao_informada", label: "Nao informada" },
  { value: "composicao_detalhada", label: "Composicao detalhada" },
  { value: "estimativa_percentual", label: "Estimativa percentual" },
  { value: "estimativa_valor", label: "Estimativa em valor" },
];

const YES_NO_OPTIONS: { value: YesNo; label: string }[] = [
  { value: "sim", label: "Sim" },
  { value: "nao", label: "Nao" },
];

function buildInitialInput(initialValues?: Partial<NegotiationInput>): NegotiationInput {
  return {
    valorRfb: initialValues?.valorRfb ?? 0,
    valorPgfn: initialValues?.valorPgfn ?? 0,
    valorPgfnPrevidenciario: initialValues?.valorPgfnPrevidenciario ?? 0,
    perfilContribuinte: initialValues?.perfilContribuinte ?? "geral",
    capag: initialValues?.capag ?? "nao_sei",
    temImpedimentoTransacaoRescindida: initialValues?.temImpedimentoTransacaoRescindida ?? "nao",
    pequenoValorElegivel: initialValues?.pequenoValorElegivel ?? "nao",
    selicMensalEstimativa: initialValues?.selicMensalEstimativa ?? 0,
    rfbParcelamentoSituacao: initialValues?.rfbParcelamentoSituacao ?? "parcelamento_inicial",
    rfbEntradaManualPercentual: initialValues?.rfbEntradaManualPercentual ?? 0,
    rfbEntradaParcelas: initialValues?.rfbEntradaParcelas ?? 1,
    rfbSaldoParcelas: initialValues?.rfbSaldoParcelas ?? 60,
    rfbParcelaMinima: initialValues?.rfbParcelaMinima,
    pgfnBaseRedutivelModo: initialValues?.pgfnBaseRedutivelModo ?? "nao_informada",
    pgfnComposicao: {
      principal: initialValues?.pgfnComposicao?.principal ?? 0,
      juros: initialValues?.pgfnComposicao?.juros ?? 0,
      multas: initialValues?.pgfnComposicao?.multas ?? 0,
      encargos: initialValues?.pgfnComposicao?.encargos ?? 0,
      outrosRedutiveis: initialValues?.pgfnComposicao?.outrosRedutiveis ?? 0,
      outrosNaoRedutiveis: initialValues?.pgfnComposicao?.outrosNaoRedutiveis ?? 0,
    },
    pgfnBaseRedutivelPercentualEstimado: initialValues?.pgfnBaseRedutivelPercentualEstimado ?? 0,
    pgfnBaseRedutivelValorEstimado: initialValues?.pgfnBaseRedutivelValorEstimado ?? 0,
    pgfnOrdinarioEntradaPercentual: initialValues?.pgfnOrdinarioEntradaPercentual ?? 0,
    pgfnOrdinarioEntradaParcelas: initialValues?.pgfnOrdinarioEntradaParcelas ?? 1,
    pgfnOrdinarioSaldoParcelas: initialValues?.pgfnOrdinarioSaldoParcelas ?? 60,
    pgfnOrdinarioParcelaMinima: initialValues?.pgfnOrdinarioParcelaMinima,
    transacaoEntradaPercentual: initialValues?.transacaoEntradaPercentual ?? 6,
    transacaoEntradaParcelas: initialValues?.transacaoEntradaParcelas,
    transacaoSaldoParcelas: initialValues?.transacaoSaldoParcelas,
    transacaoDescontoPercentual: initialValues?.transacaoDescontoPercentual ?? 0,
    simplificadaEntradaPercentual: initialValues?.simplificadaEntradaPercentual ?? 10,
    simplificadaEntradaParcelas: initialValues?.simplificadaEntradaParcelas ?? 1,
    simplificadaSaldoParcelas: initialValues?.simplificadaSaldoParcelas ?? 60,
    simplificadaDescontoPercentual: initialValues?.simplificadaDescontoPercentual ?? 0,
    pequenoValorEntradaPercentual: initialValues?.pequenoValorEntradaPercentual ?? 5,
    pequenoValorEntradaParcelas: initialValues?.pequenoValorEntradaParcelas ?? 5,
    estrategiaDuasEtapas: initialValues?.estrategiaDuasEtapas ?? { enabled: false },
  };
}

export function NegotiationCalculator({ initialValues }: { initialValues?: Partial<NegotiationInput> }) {
  const [input, setInput] = useState<NegotiationInput>(() => buildInitialInput(initialValues));
  const result = useMemo(() => calculateNegotiation(input), [input]);
  const enabledScenarios = result.scenarios.filter((scenario) => scenario.enabled);
  const disabledScenarios = result.scenarios.filter((scenario) => !scenario.enabled);
  const summary = buildCopySummary(result.currentScenario, result.potentialScenario, result.mandatoryAlerts);

  function update<K extends keyof NegotiationInput>(key: K, value: NegotiationInput[K]) {
    setInput((current) => ({ ...current, [key]: value }));
  }

  function updateComposition(key: keyof NonNullable<NegotiationInput["pgfnComposicao"]>, value: number) {
    setInput((current) => ({
      ...current,
      pgfnComposicao: { ...current.pgfnComposicao, [key]: value },
    }));
  }

  return (
    <section className="grid gap-5 xl:grid-cols-[410px_1fr]">
      <div className="rounded-lg border border-neutral-200 bg-white p-4">
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-petroleum-700" />
          <h2 className="text-base font-semibold text-ink">Negociacoes de passivo</h2>
        </div>
        <p className="mt-2 text-sm text-neutral-600">
          Simulacao preliminar com reducao limitada a base redutivel informada e validacao posterior no e-CAC/REGULARIZE.
        </p>

        <div className="mt-4 grid gap-4">
          <FormBlock title="Divida original">
            <MoneyField label="Receita Federal" value={input.valorRfb} onChange={(value) => update("valorRfb", value)} />
            <MoneyField label="PGFN tributaria/demais" value={input.valorPgfn} onChange={(value) => update("valorPgfn", value)} />
            <MoneyField
              label="PGFN previdenciaria"
              value={input.valorPgfnPrevidenciario}
              onChange={(value) => update("valorPgfnPrevidenciario", value)}
            />
          </FormBlock>

          <FormBlock title="Dados do cliente">
            <SelectField label="Perfil" value={input.perfilContribuinte} onChange={(value) => update("perfilContribuinte", value)} options={PROFILE_OPTIONS} />
            <SelectField label="CAPAG" value={input.capag} onChange={(value) => update("capag", value)} options={CAPAG_OPTIONS} />
            <SelectField
              label="Impedimento por transacao rescindida"
              value={input.temImpedimentoTransacaoRescindida}
              onChange={(value) => update("temImpedimentoTransacaoRescindida", value)}
              options={YES_NO_OPTIONS}
            />
            <SelectField
              label="Pequeno valor elegivel"
              value={input.pequenoValorElegivel}
              onChange={(value) => update("pequenoValorElegivel", value)}
              options={YES_NO_OPTIONS}
            />
          </FormBlock>

          <FormBlock title="Receita Federal">
            <SelectField label="Situacao RFB" value={input.rfbParcelamentoSituacao ?? "parcelamento_inicial"} onChange={(value) => update("rfbParcelamentoSituacao", value)} options={RFB_OPTIONS} />
            <NumberField label="Entrada manual (%)" value={input.rfbEntradaManualPercentual ?? 0} onChange={(value) => update("rfbEntradaManualPercentual", value)} />
            <NumberField label="Parcelas da entrada" value={input.rfbEntradaParcelas ?? 1} onChange={(value) => update("rfbEntradaParcelas", value)} integer />
            <NumberField label="Parcelas do saldo" value={input.rfbSaldoParcelas ?? 60} onChange={(value) => update("rfbSaldoParcelas", value)} integer />
          </FormBlock>

          <FormBlock title="Base redutivel PGFN">
            <SelectField label="Modo" value={input.pgfnBaseRedutivelModo ?? "nao_informada"} onChange={(value) => update("pgfnBaseRedutivelModo", value)} options={BASE_OPTIONS} />
            {input.pgfnBaseRedutivelModo === "composicao_detalhada" && (
              <>
                <MoneyField label="Principal" value={input.pgfnComposicao?.principal ?? 0} onChange={(value) => updateComposition("principal", value)} />
                <MoneyField label="Juros" value={input.pgfnComposicao?.juros ?? 0} onChange={(value) => updateComposition("juros", value)} />
                <MoneyField label="Multas" value={input.pgfnComposicao?.multas ?? 0} onChange={(value) => updateComposition("multas", value)} />
                <MoneyField label="Encargos" value={input.pgfnComposicao?.encargos ?? 0} onChange={(value) => updateComposition("encargos", value)} />
                <MoneyField label="Outros redutiveis" value={input.pgfnComposicao?.outrosRedutiveis ?? 0} onChange={(value) => updateComposition("outrosRedutiveis", value)} />
              </>
            )}
            {input.pgfnBaseRedutivelModo === "estimativa_percentual" && (
              <NumberField
                label="Base redutivel estimada (%)"
                value={input.pgfnBaseRedutivelPercentualEstimado ?? 0}
                onChange={(value) => update("pgfnBaseRedutivelPercentualEstimado", value)}
              />
            )}
            {input.pgfnBaseRedutivelModo === "estimativa_valor" && (
              <MoneyField
                label="Base redutivel estimada"
                value={input.pgfnBaseRedutivelValorEstimado ?? 0}
                onChange={(value) => update("pgfnBaseRedutivelValorEstimado", value)}
              />
            )}
          </FormBlock>

          <FormBlock title="Entrada e parcelas">
            <NumberField label="Entrada PGFN ordinario (%)" value={input.pgfnOrdinarioEntradaPercentual ?? 0} onChange={(value) => update("pgfnOrdinarioEntradaPercentual", value)} />
            <NumberField label="Saldo PGFN ordinario" value={input.pgfnOrdinarioSaldoParcelas ?? 60} onChange={(value) => update("pgfnOrdinarioSaldoParcelas", value)} integer />
            <NumberField label="Entrada transacao (%)" value={input.transacaoEntradaPercentual ?? 6} onChange={(value) => update("transacaoEntradaPercentual", value)} />
            <NumberField label="Reducao aplicada CAPAG (%)" value={input.transacaoDescontoPercentual ?? 0} onChange={(value) => update("transacaoDescontoPercentual", value)} />
            <NumberField label="Entrada TIS (%)" value={input.simplificadaEntradaPercentual ?? 10} onChange={(value) => update("simplificadaEntradaPercentual", value)} />
            <NumberField label="Reducao aplicada TIS (%)" value={input.simplificadaDescontoPercentual ?? 0} onChange={(value) => update("simplificadaDescontoPercentual", value)} />
            <NumberField label="SELIC mensal estimada (%)" value={input.selicMensalEstimativa ?? 0} onChange={(value) => update("selicMensalEstimativa", value)} />
          </FormBlock>
        </div>

        <AlertList alerts={result.mandatoryAlerts} />

        <button
          type="button"
          onClick={() => navigator.clipboard?.writeText(summary)}
          className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md bg-petroleum-700 px-3 text-sm font-semibold text-white"
        >
          <Clipboard className="h-4 w-4" />
          Copiar resumo
        </button>
      </div>

      <div className="grid gap-4">
        <section className="grid gap-3 md:grid-cols-4">
          <Metric label="Divida original" value={formatCurrency(result.summary.originalDebt)} />
          <Metric label="Reducao" value={formatCurrency(result.summary.estimatedReduction)} />
          <Metric label="Saldo" value={formatCurrency(result.summary.negotiatedBalance)} />
          <Metric label="Potencial de economia" value={formatCurrency(result.summary.potentialSavings)} />
        </section>

        <NatureTable items={result.natureResults} />

        <Comparison current={result.currentScenario} potential={result.potentialScenario} />

        <div className="grid gap-4">
          {enabledScenarios.map((scenario) => (
            <ScenarioCard key={scenario.id} scenario={scenario} />
          ))}
          {disabledScenarios.length > 0 && (
            <section className="rounded-lg border border-neutral-200 bg-white p-4">
              <h3 className="text-sm font-semibold text-neutral-700">Cenarios nao habilitados</h3>
              <div className="mt-3 grid gap-2">
                {disabledScenarios.map((scenario) => (
                  <div key={scenario.id} className="rounded-md bg-neutral-50 p-3 text-sm text-neutral-500">
                    <p className="font-semibold text-neutral-700">{scenario.title}</p>
                    <p className="mt-1">{scenario.alerts[0] ?? scenario.eligibilityReasons[0] ?? "Informe valores/elegibilidade para habilitar."}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <footer className="rounded-lg border border-neutral-200 bg-white p-4 text-sm text-neutral-600">
          <p className="font-semibold text-ink">Fontes oficiais</p>
          <SourceLink href="https://www.gov.br/pgfn/pt-br/servicos/orientacoes-contribuintes/acordo-de-transacao/edital-no-6-2026/transacao-conforme-a-capacidade-de-pagamento-edital-ndeg-06-2026">
            PGFN Edital 06/2026 - Transacao por capacidade
          </SourceLink>
          <SourceLink href="https://www.gov.br/pgfn/pt-br/servicos/orientacoes-contribuintes/acordo-de-transacao/transacao-individual-simplificada">
            PGFN - Transacao individual simplificada
          </SourceLink>
          <SourceLink href="https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria/pagamentos-e-parcelamentos/parcelamentos/parcelamento-nao-previdenciario-acesso-via-portal-e-cac">
            Receita Federal - parcelamento
          </SourceLink>
        </footer>
      </div>
    </section>
  );
}

function NatureTable({ items }: { items: NatureResult[] }) {
  return (
    <section className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
      <div className="border-b border-neutral-200 p-4">
        <h3 className="text-sm font-semibold text-ink">Tabela por Natureza</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-[980px] w-full text-left text-sm">
          <thead className="bg-neutral-50 text-xs uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-3">Natureza</th>
              <th className="px-4 py-3">Original</th>
              <th className="px-4 py-3">Base redutivel</th>
              <th className="px-4 py-3">% aplicado</th>
              <th className="px-4 py-3">Reducao</th>
              <th className="px-4 py-3">Saldo</th>
              <th className="px-4 py-3">Entrada</th>
              <th className="px-4 py-3">Pagamento da entrada</th>
              <th className="px-4 py-3">Parcela saldo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {items.map((item) => (
              <tr key={`${item.label}-${item.originalDebt}`}>
                <td className="px-4 py-3 font-semibold text-ink">{item.label}</td>
                <td className="px-4 py-3">{formatCurrency(item.originalDebt)}</td>
                <td className="px-4 py-3">{formatCurrency(item.reducibleBase)}</td>
                <td className="px-4 py-3">{formatPercent(item.appliedDiscountPercent)}</td>
                <td className="px-4 py-3">{formatCurrency(item.discountValue)}</td>
                <td className="px-4 py-3">{formatCurrency(item.balanceAfterDiscount)}</td>
                <td className="px-4 py-3">{formatCurrency(item.entryTotal)}</td>
                <td className="px-4 py-3">
                  {item.entryInstallments}x de {formatCurrency(item.entryInstallmentValue)}
                </td>
                <td className="px-4 py-3">
                  {item.balanceMonths}x de {formatCurrency(item.balanceInstallment)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Comparison({ current, potential }: { current?: NegotiationScenario; potential?: NegotiationScenario }) {
  if (!current || !potential) return null;
  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-ink">Comparacao Atual x Potencial</h3>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <ComparisonColumn title="Atual" scenario={current} />
        <ComparisonColumn title="Potencial" scenario={potential} />
      </div>
    </section>
  );
}

function ComparisonColumn({ title, scenario }: { title: string; scenario: NegotiationScenario }) {
  return (
    <div className="rounded-md border border-neutral-100 bg-[#f7faf8] p-3">
      <p className="text-xs font-semibold uppercase text-neutral-500">{title}</p>
      <p className="mt-1 font-semibold text-ink">{scenario.title}</p>
      <dl className="mt-3 grid gap-2 text-sm text-neutral-700">
        <div className="flex justify-between gap-3"><dt>Divida consolidada</dt><dd>{formatCurrency(scenario.debt)}</dd></div>
        <div className="flex justify-between gap-3"><dt>Entrada total</dt><dd>{formatCurrency(scenario.entryTotal)}</dd></div>
        <div className="flex justify-between gap-3"><dt>Parcelas entrada</dt><dd>{scenario.entryInstallments}x</dd></div>
        <div className="flex justify-between gap-3"><dt>Reducao</dt><dd>{formatCurrency(scenario.discountValue)}</dd></div>
        <div className="flex justify-between gap-3"><dt>Saldo negociado</dt><dd>{formatCurrency(scenario.negotiatedBalance)}</dd></div>
        <div className="flex justify-between gap-3"><dt>Parcelas saldo</dt><dd>{scenario.balanceMonths}x</dd></div>
        <div className="flex justify-between gap-3"><dt>Total projetado</dt><dd>{formatCurrency(scenario.totalNegotiated)}</dd></div>
      </dl>
    </div>
  );
}

function ScenarioCard({ scenario }: { scenario: NegotiationScenario }) {
  const isBlocked = scenario.alerts.some((alert) => alert.toLowerCase().includes("bloqueado"));
  return (
    <article className={`rounded-lg border bg-white p-4 shadow-sm ${isBlocked ? "border-red-200" : "border-neutral-200"}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Landmark className="h-5 w-5 text-petroleum-700" />
            <h3 className="text-base font-semibold text-ink">{scenario.title}</h3>
          </div>
          <p className="mt-1 text-sm text-neutral-500">{scenario.appliesTo}</p>
        </div>
        <div className="rounded-md bg-petroleum-50 px-3 py-2 text-right">
          <p className="text-xs font-semibold uppercase text-petroleum-700">Potencial de economia</p>
          <p className={`text-lg font-semibold ${scenario.estimatedSavings >= 0 ? "text-petroleum-900" : "text-red-700"}`}>
            {formatCurrency(scenario.estimatedSavings)}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <Metric label="Divida Original" value={formatCurrency(scenario.debt)} />
        <Metric label="Reducao" value={`${formatPercent(scenario.discountPercent)} / ${formatCurrency(scenario.discountValue)}`} />
        <Metric label="Saldo" value={formatCurrency(scenario.negotiatedBalance)} />
        <Metric label="Entrada total" value={formatCurrency(scenario.entryTotal)} />
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <Metric label="Pagamento da entrada" value={`${scenario.entryInstallments}x de ${formatCurrency(scenario.entryInstallmentValue)}`} />
        <Metric label="Saldo parcelado" value={`${scenario.balanceMonths}x de ${formatCurrency(scenario.balanceInstallment)}`} />
        <Metric label="Total projetado" value={formatCurrency(scenario.totalNegotiated)} />
      </div>

      <AlertList alerts={scenario.alerts} compact />
      <ul className="mt-4 grid gap-1 text-sm text-neutral-600">
        {scenario.notes.map((note) => <li key={note}>- {note}</li>)}
      </ul>
    </article>
  );
}

function AlertList({ alerts, compact = false }: { alerts: string[]; compact?: boolean }) {
  if (alerts.length === 0) return null;
  return (
    <div className={`${compact ? "mt-4" : "mt-4"} rounded-lg border border-amber-200 bg-amber-50 p-3`}>
      <div className="flex items-start gap-2">
        <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-700" />
        <div className="text-sm leading-6 text-amber-800">
          {alerts.map((alert) => <p key={alert}>{alert}</p>)}
        </div>
      </div>
    </div>
  );
}

function FormBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-neutral-200 bg-[#f7faf8] p-3">
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-petroleum-700" />
        <p className="text-xs font-semibold uppercase text-neutral-600">{title}</p>
      </div>
      <div className="mt-3 grid gap-3">{children}</div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-neutral-100 bg-[#f7faf8] p-3">
      <p className="text-xs font-semibold uppercase text-neutral-500">{label}</p>
      <p className="mt-1 text-base font-semibold text-ink">{value}</p>
    </div>
  );
}

function MoneyField({ label, value, onChange, placeholder }: { label: string; value: number; onChange: (value: number) => void; placeholder?: string }) {
  const [display, setDisplay] = useState(value > 0 ? formatBrazilianNumber(value, 2) : "");
  useEffect(() => setDisplay(value > 0 ? formatBrazilianNumber(value, 2) : ""), [value]);
  return (
    <label className="block text-xs font-semibold uppercase text-neutral-500">
      {label}
      <input
        type="text"
        inputMode="decimal"
        value={display}
        placeholder={placeholder ?? "0,00"}
        onChange={(event) => {
          setDisplay(event.target.value);
          onChange(parseBrazilianNumber(event.target.value));
        }}
        onBlur={() => setDisplay(value > 0 ? formatBrazilianNumber(value, 2) : "")}
        className="mt-1 min-h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm normal-case text-ink outline-none focus:border-petroleum-500"
      />
    </label>
  );
}

function NumberField({ label, value, onChange, integer = false }: { label: string; value: number; onChange: (value: number) => void; integer?: boolean }) {
  const [display, setDisplay] = useState(value > 0 ? formatBrazilianNumber(value, integer ? 0 : 2) : "");
  useEffect(() => setDisplay(value > 0 ? formatBrazilianNumber(value, integer ? 0 : 2) : ""), [integer, value]);
  return (
    <label className="block text-xs font-semibold uppercase text-neutral-500">
      {label}
      <input
        type="text"
        inputMode={integer ? "numeric" : "decimal"}
        value={display}
        placeholder="0"
        onChange={(event) => {
          setDisplay(event.target.value);
          const parsed = parseBrazilianNumber(event.target.value);
          onChange(integer ? Math.round(parsed) : parsed);
        }}
        onBlur={() => setDisplay(value > 0 ? formatBrazilianNumber(value, integer ? 0 : 2) : "")}
        className="mt-1 min-h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm normal-case text-ink outline-none focus:border-petroleum-500"
      />
    </label>
  );
}

function SelectField<T extends string>({ label, value, onChange, options }: { label: string; value: T; onChange: (value: T) => void; options: { value: T; label: string }[] }) {
  return (
    <label className="block text-xs font-semibold uppercase text-neutral-500">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="mt-1 min-h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm normal-case text-ink outline-none focus:border-petroleum-500"
      >
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}

function SourceLink({ href, children }: { href: string; children: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="mt-2 flex items-center gap-2 text-petroleum-700 hover:underline">
      <ExternalLink className="h-4 w-4" />
      {children}
    </a>
  );
}

function buildCopySummary(current: NegotiationScenario | undefined, potential: NegotiationScenario | undefined, alerts: string[]) {
  return [
    "Simulacao preliminar de negociacao de passivo",
    current ? `Atual: ${current.title} - total ${formatCurrency(current.totalNegotiated)}` : "",
    potential ? `Potencial: ${potential.title} - total ${formatCurrency(potential.totalNegotiated)}` : "",
    "",
    "Alertas:",
    ...alerts.map((alert) => `- ${alert}`),
  ].filter(Boolean).join("\n");
}

function formatPercent(value: number) {
  return `${formatBrazilianNumber(value * 100, 2)}%`;
}

function formatBrazilianNumber(value: number, fractionDigits: number) {
  return Number.isFinite(value)
    ? value.toLocaleString("pt-BR", { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits })
    : "";
}

function parseBrazilianNumber(value: string) {
  const cleaned = value.replace(/[^\d,.-]/g, "").trim();
  if (!cleaned) return 0;
  const normalized = cleaned.includes(",") ? cleaned.replace(/\./g, "").replace(",", ".") : cleaned.replace(/,/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}
