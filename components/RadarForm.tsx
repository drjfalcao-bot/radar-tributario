import { useMemo, type ChangeEvent, type ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2,
  Factory,
  Landmark,
  LineChart,
  ShieldAlert,
  Target,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import {
  DiagnosticInputSchema,
  calculateDiagnostic,
  formatCurrency,
  type DiagnosticInput,
  type DiagnosticResult,
} from "@/lib/RiskCalculator";
import { DEFAULT_INPUT } from "@/lib/mockScenarios";
import { cn } from "@/lib/utils";
import { ResultPreview } from "@/components/ResultPreview";
import { MoneyInput } from "@/components/FormControls";

const REGIME_OPTIONS: { value: DiagnosticInput["regimeTributario"]; label: string }[] = [
  { value: "simples", label: "Simples Nacional" },
  { value: "presumido", label: "Lucro Presumido" },
  { value: "real", label: "Lucro Real" },
  { value: "mei", label: "MEI" },
  { value: "nao_sei", label: "Nao sei" },
];

const SETOR_OPTIONS: { value: DiagnosticInput["setor"]; label: string }[] = [
  { value: "comercio", label: "Comercio" },
  { value: "servicos", label: "Servicos" },
  { value: "industria", label: "Industria" },
  { value: "profissional", label: "Profissional liberal" },
  { value: "saude_educacao_agro", label: "Saude / Educacao / Agro" },
  { value: "imobiliario", label: "Imobiliario" },
  { value: "financeiro", label: "Financeiro" },
  { value: "seletivo", label: "Seletivo" },
  { value: "nao_sei", label: "Nao sei" },
];

const PORTE_OPTIONS: {
  value: NonNullable<DiagnosticInput["porteEmpresa"]>;
  label: string;
}[] = [
  { value: "mei", label: "MEI" },
  { value: "micro", label: "Micro" },
  { value: "pequena", label: "Pequena" },
  { value: "media", label: "Media" },
  { value: "grande", label: "Grande" },
  { value: "nao_sei", label: "Nao sei" },
];

const OBJETIVO_OPTIONS: { value: NonNullable<DiagnosticInput["objetivoCliente"]>; label: string }[] = [
  { value: "caixa", label: "Melhorar caixa" },
  { value: "imposto_alto", label: "Imposto alto" },
  { value: "certidao", label: "Regularizar certidao" },
  { value: "divida", label: "Resolver divida" },
  { value: "clientes_pj", label: "Reter clientes PJ" },
  { value: "nao_sei", label: "Explorar" },
];

const SIM_NAO_NAO_SEI: { value: "sim" | "nao" | "nao_sei"; label: string }[] = [
  { value: "sim", label: "Sim" },
  { value: "nao", label: "Nao" },
  { value: "nao_sei", label: "Nao sei" },
];

const SISTEMA_FISCAL_OPTIONS: {
  value: DiagnosticInput["sistemaFiscalPreparado"];
  label: string;
}[] = [
  { value: "sim", label: "Sim" },
  { value: "parcial", label: "Parcial" },
  { value: "nao", label: "Nao" },
  { value: "nao_sei", label: "Nao sei" },
];

const inputClass =
  "min-h-11 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition-colors focus:border-petroleum-700 focus:ring-1 focus:ring-petroleum-700";

function formatCnpj(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 14);
  let out = digits;
  if (digits.length > 2) out = `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length > 5) out = `${out.slice(0, 6)}.${digits.slice(5)}`;
  if (digits.length > 8) out = `${out.slice(0, 10)}/${digits.slice(8)}`;
  if (digits.length > 12) out = `${out.slice(0, 15)}-${digits.slice(12)}`;
  return out;
}

function Block({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description?: string;
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
      <header className="mb-4 flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-petroleum-50 text-petroleum-700">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-petroleum-800">{title}</h3>
          {description && <p className="mt-0.5 text-xs text-neutral-500">{description}</p>}
        </div>
      </header>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({
  label,
  error,
  full,
  children,
}: {
  label: string;
  error?: string;
  full?: boolean;
  children: ReactNode;
}) {
  return (
    <label className={cn("block space-y-1.5", full && "sm:col-span-2")}>
      <span className="text-sm font-medium text-neutral-700">{label}</span>
      {children}
      {error && <span className="block text-xs text-red-600">{error}</span>}
    </label>
  );
}

function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "min-h-10 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
              active
                ? "border-petroleum-700 bg-petroleum-700 text-white"
                : "border-neutral-300 bg-white text-neutral-700 hover:border-petroleum-700/60",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export type RadarFormProps = {
  defaultValues?: Partial<DiagnosticInput>;
  submitLabel?: string;
  onSubmit: (input: DiagnosticInput, result: DiagnosticResult) => void;
};

export function RadarForm({
  defaultValues,
  submitLabel = "Gerar radar empresarial",
  onSubmit,
}: RadarFormProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<DiagnosticInput>({
    resolver: zodResolver(DiagnosticInputSchema),
    defaultValues: { ...DEFAULT_INPUT, ...defaultValues },
    mode: "onBlur",
  });

  const values = watch();
  const possuiDividaFiscal = watch("possuiDividaFiscal");
  const possuiCreditoIcms = watch("possuiCreditoIcms");
  const debtTotal =
    Number(values.valorDividaUniao ?? 0) +
    Number(values.valorDividaEstado ?? 0) +
    Number(values.valorDividaMunicipio ?? 0) +
    Number(values.valorDividaOutros ?? 0);
  const annualRevenue = Number(values.faturamentoMensal || 0) * 12;

  const livePreview = useMemo<DiagnosticResult | null>(() => {
    const parsed = DiagnosticInputSchema.safeParse(values);
    if (!parsed.success) return null;
    return calculateDiagnostic(parsed.data);
  }, [values]);

  const submit = handleSubmit((data) => {
    const result = calculateDiagnostic(data);
    onSubmit(data, result);
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_370px]">
      <form onSubmit={submit} className="space-y-5" noValidate>
        <section className="rounded-lg border border-[#173b37] bg-[#102524] p-5 text-white shadow-panel">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase text-[#c9aa63]">Radar empresarial ao vivo</p>
              <h2 className="mt-1 text-xl font-semibold">Diagnostico de caixa, reforma e passivo fiscal</h2>
            </div>
            <div className="grid grid-cols-3 gap-2 text-right text-xs sm:min-w-[360px]">
              <MiniMetric label="Receita anual" value={formatCurrency(annualRevenue)} />
              <MiniMetric label="B2B" value={`${Number(values.percentualB2B || 0)}%`} />
              <MiniMetric label="Debitos" value={formatCurrency(debtTotal || Number(values.valorDividaEstimado || 0))} />
            </div>
          </div>
        </section>

        <Block title="Perfil empresarial" description="Identificacao, porte e escala operacional." icon={Building2}>
          <Field label="Nome da empresa ou contato" error={errors.nomeEmpresa?.message} full>
            <input {...register("nomeEmpresa")} className={inputClass} placeholder="Ex: Industria Alfa Ltda." />
          </Field>
          <Field label="Contato">
            <input {...register("contato")} className={inputClass} placeholder="Nome / WhatsApp" />
          </Field>
          <Field label="CNPJ" error={errors.cnpj?.message}>
            <Controller
              control={control}
              name="cnpj"
              render={({ field }) => (
                <input
                  value={field.value ?? ""}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => field.onChange(formatCnpj(e.target.value))}
                  onBlur={field.onBlur}
                  className={inputClass}
                  placeholder="00.000.000/0000-00"
                  inputMode="numeric"
                />
              )}
            />
          </Field>
          <Field label="Porte da empresa">
            <Controller
              control={control}
              name="porteEmpresa"
              render={({ field }) => (
                <select
                  value={field.value ?? "nao_sei"}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => field.onChange(e.target.value)}
                  className={inputClass}
                >
                  {PORTE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}
            />
          </Field>
          <Field label="Numero de funcionarios">
            <input
              type="number"
              min={0}
              {...register("numeroFuncionarios", { valueAsNumber: true })}
              className={inputClass}
              placeholder="Ex: 35"
            />
          </Field>
        </Block>

        <Block title="Setor e regime" description="Base para avaliar cadeia, creditamento e pressao competitiva." icon={Factory}>
          <Field label="Regime tributario" error={errors.regimeTributario?.message} full>
            <Controller
              control={control}
              name="regimeTributario"
              render={({ field }) => (
                <SegmentedControl value={field.value} onChange={field.onChange} options={REGIME_OPTIONS} />
              )}
            />
          </Field>
          <Field label="Setor" error={errors.setor?.message} full>
            <Controller
              control={control}
              name="setor"
              render={({ field }) => (
                <select
                  value={field.value}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => field.onChange(e.target.value)}
                  className={inputClass}
                >
                  {SETOR_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}
            />
          </Field>
        </Block>

        <Block title="Receita e operacao" description="Numeros aproximados ja permitem medir exposicao e potencial comercial." icon={LineChart}>
          <Field label="Faturamento mensal (R$)" error={errors.faturamentoMensal?.message}>
            <Controller
              control={control}
              name="faturamentoMensal"
              render={({ field }) => (
                <MoneyInput label="" value={field.value ?? 0} onChange={field.onChange} />
              )}
            />
          </Field>
          <Field label="Margem (%)" error={errors.margemPercentual?.message}>
            <input
              type="number"
              min={1}
              max={80}
              {...register("margemPercentual", { valueAsNumber: true })}
              className={inputClass}
            />
          </Field>
          <Field label="% vendas B2B" error={errors.percentualB2B?.message}>
            <input
              type="number"
              min={0}
              max={100}
              {...register("percentualB2B", { valueAsNumber: true })}
              className={inputClass}
            />
          </Field>
          <Field label="% compras creditaveis" error={errors.comprasCreditaveisPercentual?.message}>
            <input
              type="number"
              min={0}
              max={100}
              {...register("comprasCreditaveisPercentual", { valueAsNumber: true })}
              className={inputClass}
            />
          </Field>
          <Field label="Tem cliente PJ relevante?" full>
            <Controller
              control={control}
              name="possuiClientePjRelevante"
              render={({ field }) => (
                <SegmentedControl value={field.value} onChange={field.onChange} options={SIM_NAO_NAO_SEI} />
              )}
            />
          </Field>
        </Block>

        <Block title="Sistema fiscal" description="Maturidade de emissao, ERP e rotina de apuracao." icon={ShieldAlert}>
          <Field label="ERP/emissor preparado para IBS/CBS?" full>
            <Controller
              control={control}
              name="sistemaFiscalPreparado"
              render={({ field }) => (
                <SegmentedControl value={field.value} onChange={field.onChange} options={SISTEMA_FISCAL_OPTIONS} />
              )}
            />
          </Field>
        </Block>

        <Block title="Debitos por esfera" description="Separe o passivo para direcionar Uniao, Estado, Municipio e outros orgaos." icon={Landmark}>
          <Field label="Possui divida fiscal?" full>
            <Controller
              control={control}
              name="possuiDividaFiscal"
              render={({ field }) => (
                <SegmentedControl value={field.value} onChange={field.onChange} options={SIM_NAO_NAO_SEI} />
              )}
            />
          </Field>
          {possuiDividaFiscal !== "nao" && (
            <>
              <Field label="Uniao / RFB / PGFN" error={errors.valorDividaUniao?.message}>
                <Controller
                  control={control}
                  name="valorDividaUniao"
                  render={({ field }) => <MoneyInput label="" value={field.value ?? 0} onChange={field.onChange} />}
                />
              </Field>
              <Field label="Estado / SEFAZ" error={errors.valorDividaEstado?.message}>
                <Controller
                  control={control}
                  name="valorDividaEstado"
                  render={({ field }) => <MoneyInput label="" value={field.value ?? 0} onChange={field.onChange} />}
                />
              </Field>
              <Field label="Municipio / ISS" error={errors.valorDividaMunicipio?.message}>
                <Controller
                  control={control}
                  name="valorDividaMunicipio"
                  render={({ field }) => <MoneyInput label="" value={field.value ?? 0} onChange={field.onChange} />}
                />
              </Field>
              <Field label="INSS / outros" error={errors.valorDividaOutros?.message}>
                <Controller
                  control={control}
                  name="valorDividaOutros"
                  render={({ field }) => <MoneyInput label="" value={field.value ?? 0} onChange={field.onChange} />}
                />
              </Field>
              <input type="hidden" {...register("valorDividaEstimado", { valueAsNumber: true })} value={debtTotal} readOnly />
              <div className="rounded-md border border-petroleum-100 bg-petroleum-50 p-3 sm:col-span-2">
                <p className="text-xs font-semibold uppercase text-petroleum-700">Passivo fiscal mapeado</p>
                <p className="mt-1 text-2xl font-semibold text-ink">{formatCurrency(debtTotal)}</p>
              </div>
            </>
          )}
        </Block>

        <Block title="Creditos e ativos fiscais" description="Ativos potenciais que podem mudar a leitura de caixa." icon={WalletCards}>
          <Field label="Possui credito de ICMS?" full>
            <Controller
              control={control}
              name="possuiCreditoIcms"
              render={({ field }) => (
                <SegmentedControl value={field.value} onChange={field.onChange} options={SIM_NAO_NAO_SEI} />
              )}
            />
          </Field>
          {possuiCreditoIcms === "sim" && (
            <Field label="Valor estimado do credito de ICMS (R$)" error={errors.valorCreditoIcmsEstimado?.message} full>
              <Controller
                control={control}
                name="valorCreditoIcmsEstimado"
                render={({ field }) => <MoneyInput label="" value={field.value ?? 0} onChange={field.onChange} />}
              />
            </Field>
          )}
        </Block>

        <Block title="Objetivo da conversa" description="Ajuda a direcionar a abordagem comercial e o parecer preliminar." icon={Target}>
          <Field label="Principal objetivo do cliente" full>
            <Controller
              control={control}
              name="objetivoCliente"
              render={({ field }) => (
                <SegmentedControl value={field.value ?? "nao_sei"} onChange={field.onChange} options={OBJETIVO_OPTIONS} />
              )}
            />
          </Field>
        </Block>

        <div className="lg:hidden">
          <ResultPreview result={livePreview} />
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-petroleum-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-petroleum-900 sm:w-auto"
        >
          {submitLabel}
        </button>
      </form>

      <aside className="hidden lg:block">
        <div className="sticky top-6">
          <ResultPreview result={livePreview} />
        </div>
      </aside>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.08] px-3 py-2">
      <p className="text-[11px] font-semibold uppercase text-white/55">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold text-white">{value}</p>
    </div>
  );
}
