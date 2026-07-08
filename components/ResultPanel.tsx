import {
  AlertTriangle,
  ArrowRight,
  Clipboard,
  FileText,
  Landmark,
  LineChart,
  Printer,
  RotateCcw,
  Save,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import {
  buildWhatsappSummary,
  formatCurrency,
  type DiagnosticInput,
  type DiagnosticResult,
} from "@/lib/RiskCalculator";
import { cn } from "@/lib/utils";
import { ScoreGauge } from "@/components/ScoreGauge";

const LEVEL_BADGE: Record<DiagnosticResult["nivel"], string> = {
  baixo: "border-emerald-200 bg-emerald-50 text-emerald-700",
  medio: "border-amber-200 bg-amber-50 text-amber-700",
  alto: "border-orange-200 bg-orange-50 text-orange-700",
  critico: "border-red-200 bg-red-50 text-red-700",
};

type ActionState = "idle" | "saving" | "saved";

export function ResultPanel({
  input,
  result,
  onSave,
  onPrint,
  onPro,
  onNew,
  actionState = "idle",
  readOnly = false,
}: {
  input: DiagnosticInput;
  result: DiagnosticResult;
  onSave?: () => void;
  onPrint?: () => void;
  onPro?: () => void;
  onNew?: () => void;
  actionState?: ActionState;
  readOnly?: boolean;
}) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");

  async function copyWhatsapp() {
    const text = buildWhatsappSummary(input, result);

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        try {
          textarea.select();
          document.execCommand("copy");
        } finally {
          document.body.removeChild(textarea);
        }
      }
      setCopyState("copied");
    } catch {
      setCopyState("error");
    } finally {
      window.setTimeout(() => setCopyState("idle"), 1800);
    }
  }

  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-panel print:shadow-none">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-petroleum-700">Resultado executivo</p>
          <h2 className="mt-1 text-2xl font-semibold text-ink">{input.nomeEmpresa}</h2>
          <p className="mt-2 max-w-2xl text-sm text-neutral-600">
            Estimativa de exposicao, nao valor tributario definitivo. Use como radar comercial inicial para decidir
            proximos documentos e conversa com especialista.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <ScoreGauge score={result.score} nivel={result.nivel} />
          <div>
            <span className={cn("rounded-full border px-3 py-1 text-sm font-semibold", LEVEL_BADGE[result.nivel])}>
              {result.nivel}
            </span>
            <p className="mt-3 text-sm text-neutral-500">Pressao B2B</p>
            <p className="text-lg font-semibold text-ink">{result.pressaoB2B}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <Metric
          label="Exposicao estimada anual"
          value={`${formatCurrency(result.exposicaoMin)} a ${formatCurrency(result.exposicaoMax)}`}
        />
        <Metric
          label="Preco da inacao"
          value={`${formatCurrency(result.precoInacaoMin)} a ${formatCurrency(result.precoInacaoMax)}`}
        />
        <Metric label="Proximo passo" value={result.proximoPasso} />
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        <CaseAlert
          icon={AlertTriangle}
          tone={result.nivel === "critico" || result.nivel === "alto" ? "red" : "amber"}
          title="Alerta de decisao"
          text={
            result.nivel === "critico" || result.nivel === "alto"
              ? "O caso pede acao rapida: a demora aumenta o risco de caixa, certidoes, proposta comercial e negociacao fiscal."
              : "O caso ainda permite organizacao preventiva, mas os dados precisam ser confirmados antes da transicao."
          }
        />
        <CaseAlert
          icon={LineChart}
          tone={result.pressaoB2B === "alta" ? "amber" : "green"}
          title="Competitividade"
          text={
            result.pressaoB2B === "alta"
              ? "Clientes PJ podem comparar fornecedores pela geracao de credito. Isso pode afetar preco, margem e permanencia na cadeia."
              : "A pressao B2B inicial nao e maxima, mas contratos e clientes relevantes ainda devem ser revisados."
          }
        />
        <CaseAlert
          icon={Landmark}
          tone={input.possuiDividaFiscal === "sim" ? "red" : "blue"}
          title="Caixa e certidoes"
          text={
            input.possuiDividaFiscal === "sim"
              ? "Passivo fiscal pode travar certidoes, bancos, contratos e acesso a negociacao em melhores condicoes."
              : "Sem passivo confirmado, o foco e evitar que a reforma crie perda silenciosa de margem e organizacao fiscal."
          }
        />
      </div>

      {result.ativoFiscal && (
        <div className="mt-5 rounded-lg border border-petroleum-100 bg-petroleum-50 p-4">
          <p className="text-sm font-semibold text-petroleum-900">Ativo fiscal esquecido</p>
          <p className="mt-2 text-sm text-petroleum-900">
            Credito informado: {formatCurrency(result.ativoFiscal.creditoIcmsInformado)}. Parcela teorica em 240 meses:
            {" "}
            {formatCurrency(result.ativoFiscal.parcelaTeoricaMensal240)}/mes.
          </p>
          <p className="mt-1 text-xs text-petroleum-900/70">{result.ativoFiscal.observacao}</p>
        </div>
      )}

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <ListBlock title="Ameacas principais" items={result.ameacas.slice(0, 5)} tone="risk" />
        <ListBlock title="Oportunidades" items={result.oportunidades.slice(0, 5)} tone="good" />
        <ListBlock title="Documentos para analise" items={result.documentos.slice(0, 10)} tone="doc" />
      </div>

      {result.lacunasInformacao.length > 0 && (
        <div className="mt-5 rounded-lg bg-neutral-50 p-4">
          <p className="text-sm font-semibold text-neutral-800">Lacunas que aumentam a margem</p>
          <ul className="mt-2 grid gap-1 text-sm text-neutral-600 sm:grid-cols-2">
            {result.lacunasInformacao.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </div>
      )}

      {!readOnly && (
        <div className="mt-6 flex flex-wrap gap-2 print:hidden">
          <ActionButton icon={<Save size={16} />} onClick={onSave} disabled={!onSave || actionState === "saving"}>
            {actionState === "saving" ? "Salvando..." : actionState === "saved" ? "Lead salvo" : "Salvar lead parcial"}
          </ActionButton>
          <ActionButton icon={<Clipboard size={16} />} onClick={copyWhatsapp}>
            {copyState === "copied"
              ? "Resumo copiado"
              : copyState === "error"
                ? "Nao copiou"
                : "Copiar resumo WhatsApp"}
          </ActionButton>
          <ActionButton icon={<Printer size={16} />} onClick={onPrint}>
            Gerar print/PDF
          </ActionButton>
          <ActionButton icon={<ArrowRight size={16} />} onClick={onPro}>
            Avancar para Area Pro
          </ActionButton>
          <ActionButton icon={<RotateCcw size={16} />} onClick={onNew} variant="ghost">
            Novo diagnostico
          </ActionButton>
        </div>
      )}
    </section>
  );
}

function CaseAlert({
  icon: Icon,
  tone,
  title,
  text,
}: {
  icon: typeof AlertTriangle;
  tone: "red" | "amber" | "green" | "blue";
  title: string;
  text: string;
}) {
  const style = {
    red: "border-red-200 bg-red-50 text-red-800",
    amber: "border-amber-200 bg-amber-50 text-amber-800",
    green: "border-emerald-200 bg-emerald-50 text-emerald-800",
    blue: "border-sky-200 bg-sky-50 text-sky-800",
  }[tone];

  return (
    <div className={`rounded-lg border p-4 ${style}`}>
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-5 w-5" />
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-1 text-sm leading-6 opacity-90">{text}</p>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
      <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</dt>
      <dd className="mt-2 text-lg font-semibold leading-tight text-ink">{value}</dd>
    </div>
  );
}

function ListBlock({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "risk" | "good" | "doc";
}) {
  const dot = tone === "risk" ? "bg-red-500" : tone === "good" ? "bg-emerald-500" : "bg-petroleum-500";
  return (
    <div>
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm text-neutral-700">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className={cn("mt-2 h-1.5 w-1.5 shrink-0 rounded-full", dot)} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ActionButton({
  children,
  icon,
  onClick,
  disabled,
  variant = "solid",
}: {
  children: string;
  icon: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "solid" | "ghost";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        variant === "solid"
          ? "bg-petroleum-700 text-white hover:bg-petroleum-900"
          : "border border-neutral-300 bg-white text-neutral-700 hover:border-petroleum-700",
      )}
    >
      {icon}
      {children}
    </button>
  );
}

export function PrintAction({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-md bg-petroleum-700 px-3 py-2 text-sm font-semibold text-white print:hidden"
    >
      <FileText size={16} />
      Gerar PDF
    </button>
  );
}
