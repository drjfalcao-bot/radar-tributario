import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Building2, CheckCircle2, Landmark, LineChart, Save, ShieldCheck } from "lucide-react";
import { MoneyInput } from "@/components/FormControls";
import { ResultPanel } from "@/components/ResultPanel";
import {
  calculateDiagnostic,
  DiagnosticInputSchema,
  formatCurrency,
  type DiagnosticInput,
} from "@/lib/RiskCalculator";
import { saveDiagnostic } from "@/lib/storage";
import { ProShell } from "@/pages/LeadsPage";

type FieldErrors = Record<string, string>;

const INITIAL_INPUT: DiagnosticInput = {
  nomeEmpresa: "",
  contato: "",
  cnpj: "",
  regimeTributario: "nao_sei",
  setor: "nao_sei",
  porteEmpresa: "nao_sei",
  numeroFuncionarios: 0,
  faturamentoMensal: 10000,
  percentualB2B: 0,
  margemPercentual: 10,
  comprasCreditaveisPercentual: 0,
  possuiClientePjRelevante: "nao_sei",
  sistemaFiscalPreparado: "nao_sei",
  possuiDividaFiscal: "nao_sei",
  valorDividaEstimado: 0,
  valorDividaUniao: 0,
  valorDividaEstado: 0,
  valorDividaMunicipio: 0,
  valorDividaOutros: 0,
  possuiCreditoIcms: "nao_sei",
  valorCreditoIcmsEstimado: 0,
  objetivoCliente: "nao_sei",
};

const STEPS = ["Perfil", "Empresa", "Receita", "Reforma", "Passivo", "Cenarios", "Parecer", "Proposta"];

const REGIME_OPTIONS = [
  ["nao_sei", "Nao sei"],
  ["simples", "Simples Nacional"],
  ["lucro_presumido", "Lucro Presumido"],
  ["lucro_real", "Lucro Real"],
];

const SETOR_OPTIONS = [
  ["nao_sei", "Nao sei"],
  ["servicos", "Servicos"],
  ["comercio", "Comercio"],
  ["industria", "Industria"],
  ["misto", "Misto"],
];

const PORTE_OPTIONS = [
  ["nao_sei", "Nao sei"],
  ["mei", "MEI"],
  ["me_epp", "ME/EPP"],
  ["demais", "Demais"],
];

const YES_NO_OPTIONS = [
  ["nao_sei", "Nao sei"],
  ["sim", "Sim"],
  ["nao", "Nao"],
];

const OBJECTIVE_OPTIONS = [
  ["nao_sei", "Ainda nao definido"],
  ["caixa", "Preservar caixa"],
  ["certidao", "Recuperar certidao"],
  ["divida", "Negociar divida"],
  ["reforma", "Entender impacto da reforma"],
  ["preco", "Revisar preco e margem"],
];

export function GuidedDiagnosticPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<DiagnosticInput>(INITIAL_INPUT);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const previewInput = useMemo<DiagnosticInput>(
    () => ({
      ...form,
      nomeEmpresa: form.nomeEmpresa.trim() || "Empresa em analise",
      cnpj: /^\d{14}$/.test(form.cnpj.replace(/\D/g, "")) ? form.cnpj : "",
      faturamentoMensal: Math.max(1, Number(form.faturamentoMensal) || 1),
      margemPercentual: Math.max(0, Number(form.margemPercentual) || 0),
      percentualB2B: Math.max(0, Number(form.percentualB2B) || 0),
      comprasCreditaveisPercentual: Math.max(0, Number(form.comprasCreditaveisPercentual) || 0),
    }),
    [form],
  );

  const liveResult = useMemo(() => calculateDiagnostic(previewInput), [previewInput]);
  const totalDebt =
    Number(form.valorDividaUniao ?? 0) +
    Number(form.valorDividaEstado ?? 0) +
    Number(form.valorDividaMunicipio ?? 0) +
    Number(form.valorDividaOutros ?? 0);

  function update<K extends keyof DiagnosticInput>(key: K, value: DiagnosticInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key as string]) return current;
      const next = { ...current };
      delete next[key as string];
      return next;
    });
  }

  async function handleSave() {
    const parsed = DiagnosticInputSchema.safeParse(form);
    if (!parsed.success) {
      const nextErrors: FieldErrors = {};
      parsed.error.issues.forEach((issue) => {
        const key = String(issue.path[0] ?? "form");
        if (!nextErrors[key]) nextErrors[key] = issue.message;
      });
      setErrors(nextErrors);
      setSaveError("Revise os campos destacados antes de salvar.");
      return;
    }

    setSaving(true);
    setSaveError(null);
    try {
      const result = calculateDiagnostic(parsed.data);
      const record = await saveDiagnostic(parsed.data, result);
      navigate(`/app/leads/${record.id}`);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Nao foi possivel salvar o diagnostico.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ProShell
      title="Diagnostico empresarial guiado"
      subtitle="Preenchimento orientado para reuniao, com score e diagnostico vivo enquanto os dados sao coletados."
    >
      <section className="rounded-lg border border-[#143a36] bg-[#102524] p-5 text-white shadow-panel">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#c9aa63]">Central Estrategica</p>
            <h2 className="mt-2 text-2xl font-semibold md:text-3xl">Radar em tempo real para conversa consultiva</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/70">
              Colete os dados essenciais, acompanhe exposicao, risco e lacunas, e salve o caso direto na central de leads.
            </p>
          </div>
          <div className="grid gap-2 rounded-lg border border-white/10 bg-white/[0.06] p-4 text-sm md:min-w-72">
            <div className="flex items-center justify-between gap-3">
              <span className="text-white/65">Passivo informado</span>
              <strong>{formatCurrency(totalDebt)}</strong>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-white/65">RT-Score vivo</span>
              <strong>{liveResult.score}</strong>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-2 md:grid-cols-4 xl:grid-cols-8">
          {STEPS.map((step, index) => (
            <div
              key={step}
              className={`rounded-md border px-3 py-2 text-sm ${
                index <= 4 ? "border-[#c9aa63]/40 bg-white/[0.08] text-white" : "border-white/10 bg-white/[0.03] text-white/45"
              }`}
            >
              <div className="flex items-center gap-2">
                {index <= 4 ? <CheckCircle2 className="h-4 w-4 text-[#c9aa63]" /> : <span className="h-4 w-4 rounded-full border border-white/25" />}
                <span className="font-semibold">{step}</span>
              </div>
              <p className="mt-1 text-xs text-white/50">{index <= 4 ? "Disponivel" : "Proxima etapa"}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(520px,1.05fr)]">
        <section className="grid gap-4">
          <FormSection icon={Building2} title="Identificacao">
            <TextField label="Nome da empresa" value={form.nomeEmpresa} onChange={(value) => update("nomeEmpresa", value)} error={errors.nomeEmpresa} />
            <TextField label="Contato" value={form.contato ?? ""} onChange={(value) => update("contato", value)} error={errors.contato} />
            <TextField label="CNPJ" value={form.cnpj ?? ""} onChange={(value) => update("cnpj", value)} error={errors.cnpj} placeholder="00.000.000/0000-00" />
          </FormSection>

          <FormSection icon={ShieldCheck} title="Perfil empresarial">
            <SelectField label="Regime tributario" value={form.regimeTributario} options={REGIME_OPTIONS} onChange={(value) => update("regimeTributario", value as DiagnosticInput["regimeTributario"])} />
            <SelectField label="Setor" value={form.setor} options={SETOR_OPTIONS} onChange={(value) => update("setor", value as DiagnosticInput["setor"])} />
            <SelectField label="Porte" value={form.porteEmpresa} options={PORTE_OPTIONS} onChange={(value) => update("porteEmpresa", value as DiagnosticInput["porteEmpresa"])} />
            <NumberField label="Numero de funcionarios" value={form.numeroFuncionarios ?? 0} onChange={(value) => update("numeroFuncionarios", value)} />
          </FormSection>

          <FormSection icon={LineChart} title="Receita e operacao">
            <MoneyInput label="Faturamento mensal" value={form.faturamentoMensal} onChange={(value) => update("faturamentoMensal", value)} />
            <NumberField label="% B2B" value={form.percentualB2B} onChange={(value) => update("percentualB2B", value)} suffix="%" />
            <NumberField label="Margem estimada" value={form.margemPercentual} onChange={(value) => update("margemPercentual", value)} suffix="%" />
            <NumberField label="Compras creditaveis" value={form.comprasCreditaveisPercentual} onChange={(value) => update("comprasCreditaveisPercentual", value)} suffix="%" />
            <SelectField label="Cliente PJ relevante" value={form.possuiClientePjRelevante} options={YES_NO_OPTIONS} onChange={(value) => update("possuiClientePjRelevante", value as DiagnosticInput["possuiClientePjRelevante"])} />
            <SelectField label="Sistema fiscal preparado" value={form.sistemaFiscalPreparado} options={YES_NO_OPTIONS} onChange={(value) => update("sistemaFiscalPreparado", value as DiagnosticInput["sistemaFiscalPreparado"])} />
          </FormSection>

          <FormSection icon={Landmark} title="Passivo e ativos">
            <SelectField label="Possui divida fiscal" value={form.possuiDividaFiscal} options={YES_NO_OPTIONS} onChange={(value) => update("possuiDividaFiscal", value as DiagnosticInput["possuiDividaFiscal"])} />
            <MoneyInput label="Divida Uniao / RFB / PGFN" value={form.valorDividaUniao ?? 0} onChange={(value) => update("valorDividaUniao", value)} />
            <MoneyInput label="Divida Estado" value={form.valorDividaEstado ?? 0} onChange={(value) => update("valorDividaEstado", value)} />
            <MoneyInput label="Divida Municipio" value={form.valorDividaMunicipio ?? 0} onChange={(value) => update("valorDividaMunicipio", value)} />
            <MoneyInput label="Outros debitos" value={form.valorDividaOutros ?? 0} onChange={(value) => update("valorDividaOutros", value)} />
            <SelectField label="Possui credito ICMS" value={form.possuiCreditoIcms} options={YES_NO_OPTIONS} onChange={(value) => update("possuiCreditoIcms", value as DiagnosticInput["possuiCreditoIcms"])} />
            <MoneyInput label="Credito ICMS estimado" value={form.valorCreditoIcmsEstimado ?? 0} onChange={(value) => update("valorCreditoIcmsEstimado", value)} />
          </FormSection>

          <FormSection icon={ArrowRight} title="Objetivo">
            <SelectField label="Objetivo principal do cliente" value={form.objetivoCliente} options={OBJECTIVE_OPTIONS} onChange={(value) => update("objetivoCliente", value as DiagnosticInput["objetivoCliente"])} />
            {saveError && <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{saveError}</p>}
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-petroleum-700 px-4 text-sm font-semibold text-white transition hover:bg-petroleum-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving ? "SALVANDO..." : "SALVAR E CONTINUAR"}
            </button>
          </FormSection>
        </section>

        <aside className="xl:sticky xl:top-6 xl:self-start">
          <ResultPanel input={previewInput} result={liveResult} readOnly />
        </aside>
      </div>
    </ProShell>
  );
}

function FormSection({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Building2;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-md bg-petroleum-50 text-petroleum-800">
          <Icon className="h-4 w-4" />
        </span>
        <h3 className="text-base font-semibold text-ink">{title}</h3>
      </div>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
}

function TextField({
  label,
  value,
  onChange,
  error,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
}) {
  return (
    <label className="block text-xs font-semibold uppercase text-neutral-500">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-1 min-h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm normal-case text-ink outline-none focus:border-petroleum-500"
      />
      {error && <span className="mt-1 block text-xs normal-case text-red-600">{error}</span>}
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
}) {
  return (
    <label className="block text-xs font-semibold uppercase text-neutral-500">
      {label}
      <div className="mt-1 flex min-h-10 items-center rounded-md border border-neutral-300 bg-white px-3 focus-within:border-petroleum-500">
        <input
          type="number"
          min={0}
          value={Number.isFinite(value) ? value : 0}
          onChange={(event) => onChange(Math.max(0, Number(event.target.value) || 0))}
          className="w-full border-0 bg-transparent text-sm text-ink outline-none"
        />
        {suffix && <span className="text-sm font-semibold text-neutral-500">{suffix}</span>}
      </div>
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[][];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-xs font-semibold uppercase text-neutral-500">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 min-h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm normal-case text-ink outline-none focus:border-petroleum-500"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}
