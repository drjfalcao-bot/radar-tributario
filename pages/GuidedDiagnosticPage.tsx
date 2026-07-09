import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowRight, CheckCircle2, Save, ShieldCheck } from "lucide-react";
import { MoneyInput } from "@/components/FormControls";
import { ProShell } from "@/pages/LeadsPage";
import {
  calculateDiagnostic,
  DiagnosticInputSchema,
  formatCurrency,
  type DiagnosticInput,
  type DiagnosticResult,
} from "@/lib/RiskCalculator";
import { saveDiagnostic } from "@/lib/storage";

type FieldErrors = Partial<Record<keyof DiagnosticInput, string>>;

const STEPS = ["Perfil", "Empresa", "Receita", "Reforma", "Passivo", "Cenarios", "Parecer", "Proposta"];

const DEFAULT_INPUT: DiagnosticInput = {
  nomeEmpresa: "",
  contato: "",
  cnpj: "",
  regimeTributario: "nao_sei",
  setor: "nao_sei",
  porteEmpresa: "nao_sei",
  numeroFuncionarios: 0,
  faturamentoMensal: 0,
  percentualB2B: 0,
  margemPercentual: 15,
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

export function GuidedDiagnosticPage() {
  const navigate = useNavigate();
  const [input, setInput] = useState<DiagnosticInput>(DEFAULT_INPUT);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const validation = useMemo(() => DiagnosticInputSchema.safeParse(input), [input]);
  const result = useMemo<DiagnosticResult | null>(() => {
    if (!validation.success) return null;
    return calculateDiagnostic(validation.data);
  }, [validation]);

  const missingInfo = useMemo(() => {
    const schemaIssues = validation.success
      ? []
      : validation.error.issues.map((issue) => issue.message);
    return Array.from(new Set([...schemaIssues, ...(result?.lacunasInformacao ?? [])]));
  }, [result, validation]);

  function update<K extends keyof DiagnosticInput>(key: K, value: DiagnosticInput[K]) {
    setInput((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
    setSaveError(null);
    setSaveSuccess(false);
  }

  async function handleSave() {
    const parsed = DiagnosticInputSchema.safeParse(input);
    if (!parsed.success) {
      const nextErrors: FieldErrors = {};
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof DiagnosticInput | undefined;
        if (field) nextErrors[field] = issue.message;
      });
      setFieldErrors(nextErrors);
      setSaveError("Revise os campos destacados antes de salvar.");
      return;
    }

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      const nextResult = calculateDiagnostic(parsed.data);
      const record = await saveDiagnostic(parsed.data, nextResult);
      setSaveSuccess(true);
      navigate(`/app/leads/${record.id}`);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Nao foi possivel salvar o diagnostico.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ProShell
      title="Diagnostico Empresarial Guiado"
      subtitle="Preencha as informacoes durante a reuniao. O diagnostico sera atualizado em tempo real."
    >
      <StepBar />

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <form className="grid gap-4" onSubmit={(event) => event.preventDefault()}>
          <FormSection title="Identificacao">
            <TextField label="Nome da empresa" value={input.nomeEmpresa} error={fieldErrors.nomeEmpresa} onChange={(value) => update("nomeEmpresa", value)} />
            <TextField label="Contato" value={input.contato} error={fieldErrors.contato} onChange={(value) => update("contato", value)} />
            <TextField label="CNPJ" value={input.cnpj} error={fieldErrors.cnpj} onChange={(value) => update("cnpj", value)} />
          </FormSection>

          <FormSection title="Perfil empresarial">
            <SelectField label="Regime tributario" value={input.regimeTributario} error={fieldErrors.regimeTributario} onChange={(value) => update("regimeTributario", value as DiagnosticInput["regimeTributario"])}>
              <option value="nao_sei">Nao sei</option>
              <option value="simples">Simples Nacional</option>
              <option value="presumido">Lucro Presumido</option>
              <option value="real">Lucro Real</option>
              <option value="mei">MEI</option>
            </SelectField>
            <SelectField label="Setor" value={input.setor} error={fieldErrors.setor} onChange={(value) => update("setor", value as DiagnosticInput["setor"])}>
              <option value="nao_sei">Nao sei</option>
              <option value="comercio">Comercio</option>
              <option value="servicos">Servicos</option>
              <option value="industria">Industria</option>
              <option value="profissional">Profissional</option>
              <option value="saude_educacao_agro">Saude, educacao ou agro</option>
              <option value="imobiliario">Imobiliario</option>
              <option value="financeiro">Financeiro</option>
              <option value="seletivo">Seletivo</option>
            </SelectField>
            <SelectField label="Porte" value={input.porteEmpresa} error={fieldErrors.porteEmpresa} onChange={(value) => update("porteEmpresa", value as DiagnosticInput["porteEmpresa"])}>
              <option value="nao_sei">Nao sei</option>
              <option value="mei">MEI</option>
              <option value="micro">Micro</option>
              <option value="pequena">Pequena</option>
              <option value="media">Media</option>
              <option value="grande">Grande</option>
            </SelectField>
            <NumberField label="Numero de funcionarios" value={input.numeroFuncionarios} error={fieldErrors.numeroFuncionarios} onChange={(value) => update("numeroFuncionarios", value)} />
          </FormSection>

          <FormSection title="Receita e operacao">
            <MoneyInput label="Faturamento mensal" value={input.faturamentoMensal} onChange={(value) => update("faturamentoMensal", value)} />
            <FieldError message={fieldErrors.faturamentoMensal} />
            <NumberField label="Percentual B2B" suffix="%" value={input.percentualB2B} error={fieldErrors.percentualB2B} onChange={(value) => update("percentualB2B", value)} />
            <NumberField label="Margem percentual" suffix="%" value={input.margemPercentual} error={fieldErrors.margemPercentual} onChange={(value) => update("margemPercentual", value)} />
            <NumberField label="Compras creditaveis" suffix="%" value={input.comprasCreditaveisPercentual} error={fieldErrors.comprasCreditaveisPercentual} onChange={(value) => update("comprasCreditaveisPercentual", value)} />
            <SelectField label="Possui cliente PJ relevante" value={input.possuiClientePjRelevante} error={fieldErrors.possuiClientePjRelevante} onChange={(value) => update("possuiClientePjRelevante", value as DiagnosticInput["possuiClientePjRelevante"])}>
              <option value="nao_sei">Nao sei</option>
              <option value="sim">Sim</option>
              <option value="nao">Nao</option>
            </SelectField>
            <SelectField label="Sistema fiscal preparado" value={input.sistemaFiscalPreparado} error={fieldErrors.sistemaFiscalPreparado} onChange={(value) => update("sistemaFiscalPreparado", value as DiagnosticInput["sistemaFiscalPreparado"])}>
              <option value="nao_sei">Nao sei</option>
              <option value="sim">Sim</option>
              <option value="parcial">Parcial</option>
              <option value="nao">Nao</option>
            </SelectField>
          </FormSection>

          <FormSection title="Passivo e ativos">
            <SelectField label="Possui divida fiscal" value={input.possuiDividaFiscal} error={fieldErrors.possuiDividaFiscal} onChange={(value) => update("possuiDividaFiscal", value as DiagnosticInput["possuiDividaFiscal"])}>
              <option value="nao_sei">Nao sei</option>
              <option value="sim">Sim</option>
              <option value="nao">Nao</option>
            </SelectField>
            <MoneyInput label="Divida da Uniao" value={input.valorDividaUniao} onChange={(value) => update("valorDividaUniao", value)} />
            <MoneyInput label="Divida estadual" value={input.valorDividaEstado} onChange={(value) => update("valorDividaEstado", value)} />
            <MoneyInput label="Divida municipal" value={input.valorDividaMunicipio} onChange={(value) => update("valorDividaMunicipio", value)} />
            <MoneyInput label="Outras dividas" value={input.valorDividaOutros} onChange={(value) => update("valorDividaOutros", value)} />
            <SelectField label="Possui credito de ICMS" value={input.possuiCreditoIcms} error={fieldErrors.possuiCreditoIcms} onChange={(value) => update("possuiCreditoIcms", value as DiagnosticInput["possuiCreditoIcms"])}>
              <option value="nao_sei">Nao sei</option>
              <option value="sim">Sim</option>
              <option value="nao">Nao</option>
            </SelectField>
            <MoneyInput label="Credito de ICMS estimado" value={input.valorCreditoIcmsEstimado} onChange={(value) => update("valorCreditoIcmsEstimado", value)} />
          </FormSection>

          <FormSection title="Objetivo">
            <SelectField label="Objetivo principal do cliente" value={input.objetivoCliente} error={fieldErrors.objetivoCliente} onChange={(value) => update("objetivoCliente", value as DiagnosticInput["objetivoCliente"])}>
              <option value="nao_sei">Nao sei</option>
              <option value="caixa">Caixa</option>
              <option value="imposto_alto">Imposto alto</option>
              <option value="certidao">Certidao</option>
              <option value="divida">Divida</option>
              <option value="clientes_pj">Clientes PJ</option>
            </SelectField>
          </FormSection>

          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex min-h-11 items-center gap-2 rounded-md bg-petroleum-700 px-4 text-sm font-semibold text-white hover:bg-petroleum-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving ? "Salvando..." : "Salvar e continuar"}
            </button>
            {saveSuccess && <StatusMessage tone="success" text="Diagnostico salvo. Abrindo ficha do cliente." />}
            {saveError && <StatusMessage tone="error" text={saveError} />}
          </div>
        </form>

        <LiveDiagnostic result={result} missingInfo={missingInfo} />
      </div>
    </ProShell>
  );
}

function StepBar() {
  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white p-3 shadow-sm">
      <div className="grid gap-2 sm:grid-cols-4 xl:grid-cols-8">
        {STEPS.map((step, index) => {
          const active = index <= 2 || step === "Passivo";
          return (
            <div key={step} className={`rounded-md border px-3 py-2 ${active ? "border-petroleum-200 bg-petroleum-50" : "border-neutral-200 bg-neutral-50"}`}>
              <p className={`text-xs font-semibold ${active ? "text-petroleum-800" : "text-neutral-400"}`}>{index + 1}. {step}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LiveDiagnostic({ result, missingInfo }: { result: DiagnosticResult | null; missingInfo: string[] }) {
  return (
    <aside className="h-fit rounded-lg border border-[#173b37] bg-[#102524] p-5 text-white shadow-panel xl:sticky xl:top-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-[#c9aa63]">Diagnostico vivo</p>
          <h2 className="mt-1 text-xl font-semibold">Leitura executiva</h2>
        </div>
        <ShieldCheck className="h-6 w-6 text-[#c9aa63]" />
      </div>

      {result ? (
        <>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <DarkMetric label="Score" value={`${result.score}/100`} />
            <DarkMetric label="Risco" value={result.nivel} />
            <DarkMetric label="Exposicao minima" value={formatCurrency(result.exposicaoMin)} />
            <DarkMetric label="Exposicao maxima" value={formatCurrency(result.exposicaoMax)} />
            <DarkMetric label="Preco da inacao" value={`${formatCurrency(result.precoInacaoMin)} a ${formatCurrency(result.precoInacaoMax)}`} wide />
            <DarkMetric label="Pressao B2B" value={result.pressaoB2B} />
          </div>

          <div className="mt-5 rounded-md border border-white/10 bg-white/[0.06] p-4">
            <p className="text-xs font-semibold uppercase text-white/55">Proximo passo recomendado</p>
            <p className="mt-2 text-sm font-semibold leading-6 text-white">{result.proximoPasso}</p>
          </div>

          <DarkList title="Principais oportunidades" items={result.oportunidades} tone="good" />
          <DarkList title="Principais ameacas" items={result.ameacas} tone="risk" />
        </>
      ) : (
        <div className="mt-5 rounded-md border border-amber-300/30 bg-amber-300/10 p-4 text-sm leading-6 text-amber-50">
          Informe os campos obrigatorios para liberar score, risco e exposicao calculados pelo motor real.
        </div>
      )}

      <DarkList title="Informacoes ainda ausentes" items={missingInfo.length ? missingInfo : ["Sem lacunas obrigatorias no momento."]} tone="neutral" />
    </aside>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold uppercase text-petroleum-800">{title}</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
}

function TextField({ label, value, error, onChange }: { label: string; value: string; error?: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-xs font-semibold uppercase text-neutral-500">
      {label}
      <input value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 min-h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-ink outline-none focus:border-petroleum-500" />
      <FieldError message={error} />
    </label>
  );
}

function NumberField({ label, value, error, suffix, onChange }: { label: string; value: number; error?: string; suffix?: string; onChange: (value: number) => void }) {
  return (
    <label className="block text-xs font-semibold uppercase text-neutral-500">
      {label}
      <div className="mt-1 flex min-h-10 items-center rounded-md border border-neutral-300 bg-white focus-within:border-petroleum-500">
        <input type="number" min={0} value={value} onChange={(event) => onChange(Number(event.target.value))} className="w-full border-0 bg-transparent px-3 text-sm text-ink outline-none" />
        {suffix ? <span className="pr-3 text-sm text-neutral-500">{suffix}</span> : null}
      </div>
      <FieldError message={error} />
    </label>
  );
}

function SelectField({ label, value, error, onChange, children }: { label: string; value: string; error?: string; onChange: (value: string) => void; children: React.ReactNode }) {
  return (
    <label className="block text-xs font-semibold uppercase text-neutral-500">
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 min-h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-ink outline-none focus:border-petroleum-500">
        {children}
      </select>
      <FieldError message={error} />
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  return message ? <span className="mt-1 block text-xs font-semibold normal-case text-red-600">{message}</span> : null;
}

function StatusMessage({ tone, text }: { tone: "success" | "error"; text: string }) {
  const Icon = tone === "success" ? CheckCircle2 : AlertTriangle;
  return (
    <span className={`inline-flex items-center gap-2 text-sm font-semibold ${tone === "success" ? "text-emerald-700" : "text-red-700"}`}>
      <Icon className="h-4 w-4" />
      {text}
    </span>
  );
}

function DarkMetric({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={`rounded-md border border-white/10 bg-white/[0.06] p-3 ${wide ? "col-span-2" : ""}`}>
      <p className="text-xs font-semibold uppercase text-white/50">{label}</p>
      <p className="mt-2 text-xl font-semibold leading-tight text-white">{value}</p>
    </div>
  );
}

function DarkList({ title, items, tone }: { title: string; items: string[]; tone: "good" | "risk" | "neutral" }) {
  const color = tone === "good" ? "bg-emerald-400" : tone === "risk" ? "bg-red-400" : "bg-white/50";
  return (
    <div className="mt-5">
      <p className="text-xs font-semibold uppercase text-white/55">{title}</p>
      <ul className="mt-3 grid gap-2 text-sm leading-6 text-white/82">
        {items.slice(0, 5).map((item) => (
          <li key={item} className="flex gap-2">
            <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${color}`} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
