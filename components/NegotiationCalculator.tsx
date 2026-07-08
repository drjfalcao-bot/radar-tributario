import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Calculator, Clipboard, ExternalLink, Landmark, SlidersHorizontal } from "lucide-react";
import { formatCurrency } from "@/lib/RiskCalculator";
import {
  calculateNegotiation,
  type Capag,
  type ContributorProfile,
  type NegotiationInput,
  type NegotiationScenario,
  type YesNo,
} from "@/lib/negotiationCalculator";

const PROFILE_OPTIONS: { value: ContributorProfile; label: string }[] = [
  { value: "geral", label: "Demais / PJ geral" },
  { value: "pf", label: "Pessoa fisica" },
  { value: "mei", label: "MEI" },
  { value: "me_epp", label: "ME/EPP" },
  { value: "cooperativa_ensino_osc", label: "Cooperativa / ensino / OSC" },
  { value: "recuperacao_judicial", label: "Recuperacao judicial" },
];

const CAPAG_OPTIONS: { value: Capag; label: string }[] = [
  { value: "A", label: "A" },
  { value: "B", label: "B" },
  { value: "C", label: "C" },
  { value: "D", label: "D" },
  { value: "nao_sei", label: "Nao sei" },
];

const YES_NO_OPTIONS: { value: YesNo; label: string }[] = [
  { value: "sim", label: "Sim" },
  { value: "nao", label: "Nao" },
];

const FAVORED_PROFILES: ContributorProfile[] = [
  "pf",
  "mei",
  "me_epp",
  "cooperativa_ensino_osc",
  "recuperacao_judicial",
];

function defaultDiscountCap(profile: ContributorProfile) {
  return FAVORED_PROFILES.includes(profile) ? 70 : 65;
}

function buildInitialInput(initialValues?: Partial<NegotiationInput>): NegotiationInput {
  const profile = initialValues?.perfilContribuinte ?? "geral";
  const cap = defaultDiscountCap(profile);

  return {
    valorRfb: initialValues?.valorRfb ?? 0,
    valorPgfn: initialValues?.valorPgfn ?? 0,
    valorPgfnPrevidenciario: initialValues?.valorPgfnPrevidenciario ?? 0,
    perfilContribuinte: profile,
    capag: initialValues?.capag ?? "nao_sei",
    temImpedimentoTransacaoRescindida: initialValues?.temImpedimentoTransacaoRescindida ?? "nao",
    pequenoValorElegivel: initialValues?.pequenoValorElegivel ?? "nao",
    descontoManualPercentual: initialValues?.descontoManualPercentual,
    selicMensalEstimativa: initialValues?.selicMensalEstimativa ?? 0,
    pgfnOrdinarioEntradaPercentual: initialValues?.pgfnOrdinarioEntradaPercentual ?? 0,
    pgfnOrdinarioEntradaParcelas: initialValues?.pgfnOrdinarioEntradaParcelas ?? 1,
    pgfnOrdinarioSaldoParcelas: initialValues?.pgfnOrdinarioSaldoParcelas ?? 60,
    pgfnOrdinarioParcelaMinima: initialValues?.pgfnOrdinarioParcelaMinima,
    transacaoEntradaPercentual: initialValues?.transacaoEntradaPercentual ?? 6,
    transacaoEntradaParcelas: initialValues?.transacaoEntradaParcelas,
    transacaoSaldoParcelas: initialValues?.transacaoSaldoParcelas,
    transacaoDescontoPercentual: initialValues?.transacaoDescontoPercentual ?? cap,
    simplificadaEntradaPercentual: initialValues?.simplificadaEntradaPercentual ?? 10,
    simplificadaEntradaParcelas: initialValues?.simplificadaEntradaParcelas ?? 1,
    simplificadaSaldoParcelas: initialValues?.simplificadaSaldoParcelas ?? 60,
    simplificadaDescontoPercentual: initialValues?.simplificadaDescontoPercentual ?? cap,
    pequenoValorEntradaPercentual: initialValues?.pequenoValorEntradaPercentual ?? 5,
    pequenoValorEntradaParcelas: initialValues?.pequenoValorEntradaParcelas ?? 5,
  };
}

export function NegotiationCalculator({
  initialValues,
}: {
  initialValues?: Partial<NegotiationInput>;
}) {
  const [input, setInput] = useState<NegotiationInput>(() => buildInitialInput(initialValues));

  const result = useMemo(() => calculateNegotiation(input), [input]);
  const enabledScenarios = result.scenarios.filter((scenario) => scenario.enabled);
  const disabledScenarios = result.scenarios.filter((scenario) => !scenario.enabled);

  function update<K extends keyof NegotiationInput>(key: K, value: NegotiationInput[K]) {
    setInput((current) => ({ ...current, [key]: value }));
  }

  function updateProfile(profile: ContributorProfile) {
    setInput((current) => {
      const currentCap = defaultDiscountCap(current.perfilContribuinte);
      const nextCap = defaultDiscountCap(profile);
      const transactionDiscount =
        current.transacaoDescontoPercentual === currentCap ? nextCap : current.transacaoDescontoPercentual;
      const simplifiedDiscount =
        current.simplificadaDescontoPercentual === currentCap ? nextCap : current.simplificadaDescontoPercentual;

      return {
        ...current,
        perfilContribuinte: profile,
        transacaoDescontoPercentual: transactionDiscount,
        simplificadaDescontoPercentual: simplifiedDiscount,
      };
    });
  }

  const summary = buildCopySummary(enabledScenarios, result.mandatoryAlerts);

  return (
    <section className="grid gap-5 xl:grid-cols-[410px_1fr]">
      <div className="rounded-lg border border-neutral-200 bg-white p-4">
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-petroleum-700" />
          <h2 className="text-base font-semibold text-ink">Negociacoes de passivo</h2>
        </div>
        <p className="mt-2 text-sm text-neutral-600">
          Simulacao preliminar, depende do extrato e do REGULARIZE. Os descontos aparecem no teto potencial para comparar cenarios.
        </p>

        <div className="mt-4 grid gap-4">
          <FormBlock title="Valores">
            <MoneyField label="Valor RFB" value={input.valorRfb} onChange={(value) => update("valorRfb", value)} />
            <MoneyField label="Valor PGFN" value={input.valorPgfn} onChange={(value) => update("valorPgfn", value)} />
            <MoneyField
              label="PGFN previdenciario"
              value={input.valorPgfnPrevidenciario}
              onChange={(value) => update("valorPgfnPrevidenciario", value)}
            />
          </FormBlock>

          <FormBlock title="Enquadramento">
            <SelectField
              label="Porte/perfil"
              value={input.perfilContribuinte}
              onChange={(value) => updateProfile(value as ContributorProfile)}
              options={PROFILE_OPTIONS}
            />
            <SelectField
              label="CAPAG"
              value={input.capag}
              onChange={(value) => update("capag", value as Capag)}
              options={CAPAG_OPTIONS}
            />
            <SelectField
              label="Transacao rescindida/impedimento"
              value={input.temImpedimentoTransacaoRescindida}
              onChange={(value) => update("temImpedimentoTransacaoRescindida", value as YesNo)}
              options={YES_NO_OPTIONS}
            />
            <SelectField
              label="Pequeno valor elegivel"
              value={input.pequenoValorElegivel}
              onChange={(value) => update("pequenoValorElegivel", value as YesNo)}
              options={YES_NO_OPTIONS}
            />
          </FormBlock>

          <FormBlock title="PGFN ordinario">
            <NumberField
              label="Entrada (%)"
              value={input.pgfnOrdinarioEntradaPercentual ?? 0}
              onChange={(value) => update("pgfnOrdinarioEntradaPercentual", value)}
            />
            <NumberField
              label="Parcelas da entrada"
              value={input.pgfnOrdinarioEntradaParcelas ?? 1}
              onChange={(value) => update("pgfnOrdinarioEntradaParcelas", value)}
              integer
            />
            <NumberField
              label="Parcelas do saldo"
              value={input.pgfnOrdinarioSaldoParcelas ?? 60}
              onChange={(value) => update("pgfnOrdinarioSaldoParcelas", value)}
              integer
            />
            <MoneyField
              label="Parcela minima"
              value={input.pgfnOrdinarioParcelaMinima ?? 0}
              onChange={(value) => update("pgfnOrdinarioParcelaMinima", value)}
              placeholder="automatico"
            />
          </FormBlock>

          <FormBlock title="Transacao CAPAG">
            <NumberField
              label="Entrada (%)"
              value={input.transacaoEntradaPercentual ?? 6}
              onChange={(value) => update("transacaoEntradaPercentual", value)}
            />
            <NumberField
              label="Parcelas da entrada"
              value={input.transacaoEntradaParcelas ?? 0}
              onChange={(value) => update("transacaoEntradaParcelas", value)}
              integer
              placeholder="auto"
            />
            <NumberField
              label="Parcelas do saldo"
              value={input.transacaoSaldoParcelas ?? 0}
              onChange={(value) => update("transacaoSaldoParcelas", value)}
              integer
              placeholder="auto"
            />
            <NumberField
              label="Desconto teto (%)"
              value={input.transacaoDescontoPercentual ?? result.transactionDiscountCap * 100}
              onChange={(value) => update("transacaoDescontoPercentual", value)}
            />
          </FormBlock>

          <FormBlock title="Transacao simplificada">
            <NumberField
              label="Entrada (%)"
              value={input.simplificadaEntradaPercentual ?? 10}
              onChange={(value) => update("simplificadaEntradaPercentual", value)}
            />
            <NumberField
              label="Parcelas da entrada"
              value={input.simplificadaEntradaParcelas ?? 1}
              onChange={(value) => update("simplificadaEntradaParcelas", value)}
              integer
            />
            <NumberField
              label="Parcelas do saldo"
              value={input.simplificadaSaldoParcelas ?? 60}
              onChange={(value) => update("simplificadaSaldoParcelas", value)}
              integer
            />
            <NumberField
              label="Desconto teto (%)"
              value={input.simplificadaDescontoPercentual ?? result.transactionDiscountCap * 100}
              onChange={(value) => update("simplificadaDescontoPercentual", value)}
            />
          </FormBlock>

          <FormBlock title="Pequeno valor">
            <NumberField
              label="Entrada (%)"
              value={input.pequenoValorEntradaPercentual ?? 5}
              onChange={(value) => update("pequenoValorEntradaPercentual", value)}
            />
            <NumberField
              label="Parcelas da entrada"
              value={input.pequenoValorEntradaParcelas ?? 5}
              onChange={(value) => update("pequenoValorEntradaParcelas", value)}
              integer
            />
            <NumberField
              label="SELIC mensal estimada (%)"
              value={input.selicMensalEstimativa ?? 0}
              onChange={(value) => update("selicMensalEstimativa", value)}
            />
          </FormBlock>
        </div>

        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-700" />
            <div className="text-sm leading-6 text-amber-800">
              {result.mandatoryAlerts.map((alert) => (
                <p key={alert}>{alert}</p>
              ))}
            </div>
          </div>
        </div>

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
        <section className="grid gap-3 md:grid-cols-3">
          <Metric label="RFB" value={formatCurrency(input.valorRfb)} />
          <Metric label="PGFN total" value={formatCurrency(result.pgfnTotal)} />
          <Metric label="Cenarios ativos" value={String(enabledScenarios.length)} />
        </section>

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
                    <p className="mt-1">{scenario.alerts[0] ?? "Informe valores/elegibilidade para habilitar."}</p>
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
          <SourceLink href="https://www.gov.br/pgfn/pt-br/servicos/orientacoes-contribuintes/acordo-de-transacao/edital-no-6-2026/transacao-de-pequeno-valor-edital-ndeg-06-2026">
            PGFN Edital 06/2026 - Pequeno valor
          </SourceLink>
          <SourceLink href="https://www.gov.br/pgfn/pt-br/servicos/orientacoes-contribuintes/acordo-de-transacao/transacao-individual-simplificada">
            PGFN - Transacao individual simplificada
          </SourceLink>
          <SourceLink href="https://www.gov.br/pgfn/pt-br/servicos/perguntas-frequentes/parcelamentos">
            PGFN - Parcelamentos
          </SourceLink>
          <SourceLink href="https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria/pagamentos-e-parcelamentos/parcelamentos/parcelamento-nao-previdenciario-acesso-via-portal-e-cac">
            Receita Federal - parcelamento
          </SourceLink>
        </footer>
      </div>
    </section>
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
          <p className="text-xs font-semibold uppercase text-petroleum-700">Economia estimada</p>
          <p className={`text-lg font-semibold ${scenario.estimatedSavings >= 0 ? "text-petroleum-900" : "text-red-700"}`}>
            {formatCurrency(scenario.estimatedSavings)}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <Metric label="Divida" value={formatCurrency(scenario.debt)} />
        <Metric
          label={`Entrada (${formatPercent(scenario.entryPercent)})`}
          value={`${formatCurrency(scenario.entryTotal)} em ${scenario.entryInstallments}x`}
        />
        <Metric label="Reducao simulada" value={`${formatPercent(scenario.discountPercent)} / ${formatCurrency(scenario.discountValue)}`} />
        <Metric label="Parcela saldo" value={`${formatCurrency(scenario.balanceInstallment)} x ${scenario.balanceMonths}`} />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <Metric label="Saldo negociado" value={formatCurrency(scenario.negotiatedBalance)} />
        <Metric label="Total negociado" value={formatCurrency(scenario.totalNegotiated)} />
        <Metric label="Parcela minima" value={formatCurrency(scenario.minimumInstallment)} />
      </div>

      {scenario.alerts.length > 0 && (
        <div className={`mt-4 rounded-md border p-3 text-sm ${isBlocked ? "border-red-200 bg-red-50 text-red-800" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
          {scenario.alerts.map((alert) => (
            <p key={alert}>{alert}</p>
          ))}
        </div>
      )}

      <ul className="mt-4 grid gap-1 text-sm text-neutral-600">
        {scenario.notes.map((note) => (
          <li key={note}>- {note}</li>
        ))}
      </ul>
    </article>
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

function MoneyField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
}) {
  const [display, setDisplay] = useState(value > 0 ? formatBrazilianNumber(value, 2) : "");

  useEffect(() => {
    setDisplay(value > 0 ? formatBrazilianNumber(value, 2) : "");
  }, [value]);

  return (
    <label className="block text-xs font-semibold uppercase text-neutral-500">
      {label}
      <input
        type="text"
        inputMode="decimal"
        value={display}
        placeholder={placeholder ?? "0,00"}
        onChange={(event) => {
          const next = event.target.value;
          setDisplay(next);
          onChange(parseBrazilianNumber(next));
        }}
        onBlur={() => setDisplay(value > 0 ? formatBrazilianNumber(value, 2) : "")}
        className="mt-1 min-h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm normal-case text-ink outline-none focus:border-petroleum-500"
      />
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
  integer = false,
  placeholder,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  integer?: boolean;
  placeholder?: string;
}) {
  const [display, setDisplay] = useState(value > 0 ? formatBrazilianNumber(value, integer ? 0 : 2) : "");

  useEffect(() => {
    setDisplay(value > 0 ? formatBrazilianNumber(value, integer ? 0 : 2) : "");
  }, [integer, value]);

  return (
    <label className="block text-xs font-semibold uppercase text-neutral-500">
      {label}
      <input
        type="text"
        inputMode={integer ? "numeric" : "decimal"}
        value={display}
        placeholder={placeholder ?? "0"}
        onChange={(event) => {
          const next = event.target.value;
          setDisplay(next);
          const parsed = parseBrazilianNumber(next);
          onChange(integer ? Math.round(parsed) : parsed);
        }}
        onBlur={() => setDisplay(value > 0 ? formatBrazilianNumber(value, integer ? 0 : 2) : "")}
        className="mt-1 min-h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm normal-case text-ink outline-none focus:border-petroleum-500"
      />
    </label>
  );
}

function SelectField<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <label className="block text-xs font-semibold uppercase text-neutral-500">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="mt-1 min-h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm normal-case text-ink outline-none focus:border-petroleum-500"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
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

function buildCopySummary(scenarios: NegotiationScenario[], alerts: string[]) {
  return [
    "Simulacao preliminar de negociacao de passivo",
    "",
    ...scenarios.map((scenario) =>
      [
        scenario.title,
        `Divida: ${formatCurrency(scenario.debt)}`,
        `Entrada: ${formatCurrency(scenario.entryTotal)} em ${scenario.entryInstallments}x`,
        `Reducao simulada: ${formatPercent(scenario.discountPercent)} (${formatCurrency(scenario.discountValue)})`,
        `Parcela saldo: ${formatCurrency(scenario.balanceInstallment)} por ${scenario.balanceMonths} meses`,
        `Total negociado: ${formatCurrency(scenario.totalNegotiated)}`,
        `Economia estimada: ${formatCurrency(scenario.estimatedSavings)}`,
      ].join("\n"),
    ),
    "",
    "Alertas:",
    ...alerts.map((alert) => `- ${alert}`),
  ].join("\n\n");
}

function formatPercent(value: number) {
  return `${formatBrazilianNumber(value * 100, 2)}%`;
}

function formatBrazilianNumber(value: number, fractionDigits: number) {
  return Number.isFinite(value)
    ? value.toLocaleString("pt-BR", {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
      })
    : "";
}

function parseBrazilianNumber(value: string) {
  const cleaned = value.replace(/[^\d,.-]/g, "").trim();
  if (!cleaned) return 0;
  const normalized = cleaned.includes(",")
    ? cleaned.replace(/\./g, "").replace(",", ".")
    : cleaned.replace(/,/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}
