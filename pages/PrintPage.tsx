import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AssumptionsFooter } from "@/components/AssumptionsFooter";
import { PrintAction } from "@/components/ResultPanel";
import { ResultPanel } from "@/components/ResultPanel";
import { loadDiagnostic, type SavedDiagnostic } from "@/lib/storage";
import { formatCurrency } from "@/lib/RiskCalculator";
import {
  buildInternalAlerts,
  buildJudicialRisk,
  buildTransactionImpedimentRisk,
  calculateCrmInsights,
  hasCriticalJudicialRisk,
  hasTransactionImpediment,
} from "@/lib/crm";
import { formatDate } from "@/lib/utils";

export function PrintPage() {
  const { id } = useParams();
  const [record, setRecord] = useState<SavedDiagnostic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    loadDiagnostic(id, true)
      .then(setRecord)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-8 text-sm text-neutral-600">Carregando relatorio...</div>;
  if (!record) return <div className="p-8 text-sm text-neutral-600">Diagnostico nao encontrado.</div>;

  return (
    <main className="bg-white">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-5 flex items-center justify-between print:hidden">
          <h1 className="text-lg font-semibold text-ink">Relatorio imprimivel</h1>
          <PrintAction onClick={() => window.print()} />
        </div>

        <section className="mb-6 border-b border-neutral-200 pb-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-petroleum-700">Radar inicial da Reforma Tributaria</p>
          <h2 className="mt-2 text-3xl font-semibold text-ink">{record.input.nomeEmpresa}</h2>
          <p className="mt-2 text-sm text-neutral-600">Emitido em {formatDate(new Date())}</p>
          <p className="mt-3 text-sm text-neutral-600">
            Estimativa preliminar com dados informados verbalmente. Este relatorio nao substitui analise documental.
          </p>
        </section>

        <ResultPanel input={record.input} result={record.result} readOnly />

        <ConditionalSections record={record} />
        <ProSections record={record} />
        <AssumptionsFooter />
      </div>
    </main>
  );
}

function ProSections({ record }: { record: SavedDiagnostic }) {
  const crm = record.crm;
  if (!crm) return null;
  const insights = calculateCrmInsights(crm);
  const internalAlerts = buildInternalAlerts(crm);
  const criticalJudicialRisk = hasCriticalJudicialRisk(crm);
  const transactionImpediment = hasTransactionImpediment(crm);
  const pdfSimulations = crm.simulations.filter((item) => item.includeInPdf);
  const recommended = crm.simulations.find((item) => item.recommended);
  const proposalItems = crm.proposal.items.filter((item) => item.enabled);

  return (
    <section className="mt-8 grid gap-5">
      <div className="rounded-lg border border-neutral-200 p-5">
        <h3 className="text-base font-semibold text-ink">Resumo executivo da Area Pro</h3>
        <p className="mt-1 text-sm text-neutral-600">
          Leitura complementar ao RT-Score, com dados comerciais, fiscais e financeiros do caso.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <PrintMetric label="Prioridade CRM" value={`${insights.priorityScore}/100`} detail={`${crm.temperature} | ${crm.stage}`} />
          <PrintMetric label="Receita anual" value={formatCurrency(insights.annualRevenue)} detail="base mapeada" />
          <PrintMetric label="Passivo" value={formatCurrency(insights.totalDebt)} detail="RFB, PGFN e correlatos" />
          <PrintMetric label="Proposta" value={formatCurrency(crm.proposal.setupFee + crm.proposal.monthlyFee)} detail={crm.proposal.title || "sem titulo"} />
        </div>
      </div>

      {(criticalJudicialRisk || transactionImpediment || internalAlerts.length > 0) && (
        <div className="grid gap-3">
          {criticalJudicialRisk && (
            <div className="rounded-lg border-2 border-red-500 bg-red-50 p-4 text-red-900">
              <p className="text-sm font-black uppercase tracking-wide">Alerta critico maximo: execucao com citacao</p>
              <p className="mt-2 whitespace-pre-line text-sm leading-6">{buildJudicialRisk(crm)}</p>
            </div>
          )}
          {transactionImpediment && (
            <div className="rounded-lg border-2 border-red-500 bg-red-50 p-4 text-red-900">
              <p className="text-sm font-black uppercase tracking-wide">Alerta critico: impedimento de transacao</p>
              <p className="mt-2 whitespace-pre-line text-sm leading-6">{buildTransactionImpedimentRisk(crm)}</p>
            </div>
          )}
          {internalAlerts.slice(0, 4).map((alert) => (
            <div
              key={`${alert.title}-${alert.detail}`}
              className={`rounded-lg border p-4 ${
                alert.level === "critico"
                  ? "border-red-300 bg-red-50 text-red-900"
                  : alert.level === "alto"
                    ? "border-amber-300 bg-amber-50 text-amber-900"
                    : "border-blue-200 bg-blue-50 text-blue-900"
              }`}
            >
              <p className="text-sm font-black uppercase tracking-wide">{alert.title}</p>
              <p className="mt-1 text-sm leading-6">{alert.detail}</p>
            </div>
          ))}
        </div>
      )}

      {crm.clientReport && (
        <div className="rounded-lg border border-neutral-200 p-5">
          <h3 className="text-base font-semibold text-ink">Relatorio estrategico ao cliente</h3>
          <ReportText text={crm.clientReport} />
        </div>
      )}

      <div className="rounded-lg border border-neutral-200 p-5">
        <h3 className="text-base font-semibold text-ink">Simulacoes selecionadas</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {pdfSimulations.map((item) => {
            const entry = item.debtAmount * (item.entryPercent / 100);
            const base = Math.max(0, item.debtAmount - entry);
            const discount = base * (item.discountPercent / 100);
            const net = Math.max(0, base - discount);
            return (
              <div key={item.id} className="rounded-md border border-neutral-200 bg-[#f7faf8] p-3">
                <p className="text-sm font-semibold text-ink">{item.title}</p>
                <p className="mt-1 text-xs text-neutral-500">{item.notes}</p>
                <dl className="mt-3 grid gap-1 text-sm text-neutral-700">
                  <div className="flex justify-between gap-3"><dt>Divida</dt><dd>{formatCurrency(item.debtAmount)}</dd></div>
                  <div className="flex justify-between gap-3"><dt>Entrada</dt><dd>{formatCurrency(entry)}</dd></div>
                  <div className="flex justify-between gap-3"><dt>Reducao potencial</dt><dd>{formatCurrency(discount)}</dd></div>
                  <div className="flex justify-between gap-3"><dt>Parcela estimada</dt><dd>{formatCurrency(item.installmentCount ? net / item.installmentCount : 0)}</dd></div>
                </dl>
              </div>
            );
          })}
          {pdfSimulations.length === 0 && <p className="text-sm text-neutral-500">Nenhuma simulacao marcada para PDF.</p>}
        </div>
        {recommended && <p className="mt-3 text-sm font-semibold text-petroleum-700">Cenario recomendado: {recommended.title}</p>}
      </div>

      <div className="rounded-lg border border-neutral-200 p-5">
        <h3 className="text-base font-semibold text-ink">Proposta comercial</h3>
        <div className="mt-3 grid gap-2 text-sm text-neutral-700">
          {proposalItems.map((item) => (
            <div key={item.id} className="flex justify-between gap-3 border-b border-neutral-100 py-2">
              <span>{item.label}</span>
              <strong>{formatCurrency(item.amount)} em {item.installments}x</strong>
            </div>
          ))}
          {proposalItems.length === 0 && <p className="text-sm text-neutral-500">Nenhum item comercial ativo.</p>}
        </div>
      </div>

      <div className="rounded-lg border border-neutral-200 p-5">
        <h3 className="text-base font-semibold text-ink">Atos necessarios e proximos passos</h3>
        <ul className="mt-3 list-disc pl-5 text-sm leading-6 text-neutral-700">
          {crm.financial.requiredWorkActs.map((item) => <li key={item}>{item}</li>)}
          {crm.financial.requiredWorkActs.length === 0 && <li>Validar documentos, extratos oficiais e estrategia final.</li>}
        </ul>
      </div>
    </section>
  );
}

function PrintMetric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-[#f7faf8] p-3">
      <p className="text-xs font-semibold uppercase text-neutral-500">{label}</p>
      <p className="mt-2 text-lg font-semibold leading-tight text-ink">{value}</p>
      <p className="mt-1 text-xs text-neutral-500">{detail}</p>
    </div>
  );
}

function ReportText({ text }: { text: string }) {
  const blocks = text
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <div className="mt-3 grid gap-3 text-sm leading-6 text-neutral-700">
      {blocks.map((block) => (
        <p key={block} className="rounded-md bg-[#f7faf8] p-3 whitespace-pre-line">
          {block}
        </p>
      ))}
    </div>
  );
}

function ConditionalSections({ record }: { record: SavedDiagnostic }) {
  const input = record.input;
  const blocks: { title: string; body: string; tone?: "danger" | "normal" }[] = [
    {
      title: "Prejuizo de inacao na reforma",
      body: `O radar estima preco da inacao entre ${record.result.precoInacaoMin.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })} e ${record.result.precoInacaoMax.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}. Se a empresa nao tomar as redeas agora, pode perder margem, caixa, competitividade com clientes PJ e poder de negociacao fiscal.`,
      tone: "danger",
    },
  ];

  if (input.regimeTributario === "simples") {
    blocks.push({
      title: "Janela de setembro/2026 e regime IBS/CBS",
      body: "Validar a opcao do Simples entre 1 e 30 de setembro de 2026 e simular a competitividade em cadeias B2B antes de qualquer decisao.",
    });
  }
  if (input.setor === "industria" || input.setor === "comercio") {
    blocks.push({
      title: "Estoque, ST e creditos",
      body: "Conferir NCM, estoque, ICMS-ST, XML e SPED para avaliar riscos e oportunidades na transicao.",
    });
  }
  if (input.possuiDividaFiscal === "sim") {
    blocks.push({
      title: "Passivo fiscal e certidoes",
      body: "Separar debitos federais, estaduais e municipais para avaliar regularizacao, certidoes e impacto em contratos.",
    });
  }
  if (record.result.ativoFiscal) {
    blocks.push({
      title: "Ativo fiscal esquecido",
      body: "Credito informado deve ser validado por origem, escrituracao, homologacao e regras aplicaveis. Nao ha promessa de recuperacao.",
    });
  }

  return (
    <section className="mt-6 grid gap-4 md:grid-cols-2">
      {blocks.map((block) => (
        <div
          key={block.title}
          className={`rounded-lg border p-4 ${
            block.tone === "danger" ? "border-red-200 bg-red-50" : "border-neutral-200"
          }`}
        >
          <h3 className={`text-sm font-semibold ${block.tone === "danger" ? "text-red-800" : "text-ink"}`}>
            {block.title}
          </h3>
          <p className={`mt-2 text-sm ${block.tone === "danger" ? "text-red-700" : "text-neutral-600"}`}>
            {block.body}
          </p>
        </div>
      ))}
    </section>
  );
}
