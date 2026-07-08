import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  AlertTriangle,
  Banknote,
  BarChart3,
  CalendarClock,
  Clipboard,
  ExternalLink,
  FileText,
  Landmark,
  LineChart,
  MessageSquareText,
  Plus,
  Save,
  Scale,
  Send,
  Trash2,
  Wand2,
} from "lucide-react";
import { ResultPanel } from "@/components/ResultPanel";
import { NegotiationCalculator } from "@/components/NegotiationCalculator";
import { EditableChecklist, EditableSelect, MoneyInput } from "@/components/FormControls";
import { formatCurrency } from "@/lib/RiskCalculator";
import {
  buildAssistedReports,
  buildReceivablesFromProposal,
  buildInternalAlerts,
  buildJudicialRisk,
  buildTransactionImpedimentRisk,
  buildProposalPackage,
  calculateCrmInsights,
  createDebtEntry,
  createProposalItem,
  createReceivable,
  createRevenueEntry,
  hasTransactionImpediment,
  hasCriticalJudicialRisk,
  type CommunicationTone,
  type DataExposureMode,
  type DebtEntry,
  type IntakeChannel,
  type InternalAlert,
  type LeadCrmData,
  type LeadTemperature,
  type DealStatus,
  type PaymentStatus,
  type PipelineStage,
  type ProposalItem,
  type ProposalItemType,
  type ProposalStrategy,
  type Receivable,
  type ReceivableStatus,
  type RevenueEntry,
} from "@/lib/crm";
import {
  loadDiagnostic,
  updateDiagnosticMeta,
  updateLeadCrm,
  type DiagnosticStatus,
  type SavedDiagnostic,
} from "@/lib/storage";
import { ProShell } from "@/pages/LeadsPage";

const STATUS_OPTIONS: DiagnosticStatus[] = [
  "lead_parcial",
  "diagnostico_basico",
  "aguardando_documentos",
  "em_analise_especialista",
  "parecer_emitido",
  "proposta_enviada",
  "perdido",
];

const STAGE_OPTIONS: PipelineStage[] = [
  "novo",
  "qualificado",
  "diagnostico",
  "documentos",
  "proposta",
  "cliente",
  "perdido",
];

const TEMP_OPTIONS: LeadTemperature[] = ["frio", "morno", "quente", "urgente"];
const INTAKE_OPTIONS: IntakeChannel[] = ["site", "ads", "reuniao", "whatsapp", "indicacao", "outro"];
const EXPOSURE_OPTIONS: DataExposureMode[] = ["resumido", "completo"];
const PROPOSAL_STRATEGY_OPTIONS: ProposalStrategy[] = [
  "regularizacao",
  "reforma",
  "recuperacao_creditos",
  "blindagem",
  "mista",
];
const DEAL_STATUS_OPTIONS: DealStatus[] = ["lead", "proposta", "ganho", "perdido"];
const PAYMENT_STATUS_OPTIONS: PaymentStatus[] = ["nao_iniciado", "aguardando", "pago", "atrasado", "cancelado"];
const COMMUNICATION_TONE_OPTIONS: CommunicationTone[] = ["conservador", "tecnico", "comercial", "agressivo_comercial"];
const PROPOSAL_ITEM_TYPE_OPTIONS: ProposalItemType[] = [
  "assessoria",
  "garantia",
  "defesa_judicial",
  "negociacao",
  "parecer_tecnico",
  "acompanhamento_pagamento",
  "personalizado",
];
const RECEIVABLE_STATUS_OPTIONS: ReceivableStatus[] = ["aberto", "vence_hoje", "vence_3_dias", "pago", "atrasado", "cancelado"];
const TABS = ["visao", "receitas", "debitos", "fiscal", "negociacoes", "simulacoes", "estrategias", "parecer", "proposta", "financeiro", "relatorio"] as const;

type TabId = (typeof TABS)[number];

const TAB_LABELS: Record<TabId, string> = {
  visao: "Visao geral",
  receitas: "Receitas",
  debitos: "Debitos",
  fiscal: "Mapa fiscal",
  negociacoes: "Negociacoes",
  simulacoes: "Simulacoes",
  estrategias: "Estrategias",
  parecer: "Parecer assistido",
  proposta: "Proposta",
  financeiro: "Financeiro",
  relatorio: "Relatorio / Diagnostico",
};

function buildNegotiationInitialValues(crm: LeadCrmData) {
  const totalByCreditor = (creditor: DebtEntry["creditor"]) =>
    crm.debts
      .filter((debt) => debt.creditor === creditor)
      .reduce((sum, debt) => sum + debt.principal + debt.finesAndInterest, 0);

  return {
    valorRfb: totalByCreditor("RFB"),
    valorPgfn: totalByCreditor("PGFN"),
    valorPgfnPrevidenciario: totalByCreditor("INSS"),
    perfilContribuinte: "geral" as const,
    capag: "nao_sei" as const,
    temImpedimentoTransacaoRescindida: crm.fiscalProfile.transactionImpedimentActive ? ("sim" as const) : ("nao" as const),
    pequenoValorElegivel: "nao" as const,
  };
}

function localTodayPlus(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function LeadDetailPage() {
  const { id } = useParams();
  const [record, setRecord] = useState<SavedDiagnostic | null>(null);
  const [status, setStatus] = useState<DiagnosticStatus>("lead_parcial");
  const [notes, setNotes] = useState("");
  const [crm, setCrm] = useState<LeadCrmData | null>(null);
  const [tab, setTab] = useState<TabId>("visao");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadDiagnostic(id, true).then((data) => {
      setRecord(data);
      if (data) {
        setStatus(data.status);
        setNotes(data.anotacoesInternas ?? "");
        setCrm(data.crm!);
      }
    });
  }, [id]);

  const insights = useMemo(() => (crm ? calculateCrmInsights(crm) : null), [crm]);
  const internalAlerts = useMemo(() => (crm ? buildInternalAlerts(crm) : []), [crm]);

  async function saveAll() {
    if (!record || !crm) return;
    await updateDiagnosticMeta(record.id, { status, anotacoesInternas: notes });
    await updateLeadCrm(record, crm);
    const updated = { ...record, status, anotacoesInternas: notes, crm };
    setRecord(updated);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  }

  function generateAssistedReports() {
    if (!record || !crm || !insights) return;
    const reports = buildAssistedReports(record.input, record.result, crm, insights);
    setCrm({ ...crm, ...reports });
    setTab("parecer");
  }

  function generateProposal() {
    if (!record || !crm || !insights) return;
    const proposal = buildProposalPackage(record.input, record.result, crm, insights);
    const proposalSentAt = crm.financial.proposalSentAt || localTodayPlus(0);
    setCrm({
      ...crm,
      stage: "proposta",
      financial: {
        ...crm.financial,
        dealStatus: "proposta",
        potentialSetupFee: crm.proposal.setupFee,
        potentialMonthlyFee: crm.proposal.monthlyFee,
        potentialSuccessFee: (crm.proposal.successFeeBase || insights.totalDebt) * (crm.proposal.successFeePercent / 100),
        proposalSentAt,
        proposalFollowUpDate: crm.financial.proposalFollowUpDate || localTodayPlus(3),
      },
      proposal: { ...crm.proposal, ...proposal },
    });
    setTab("proposta");
  }

  if (!record || !crm || !insights) return <ProShell title="Lead">Carregando lead...</ProShell>;

  return (
    <ProShell
      title={record.input.nomeEmpresa}
      subtitle="Ficha interna para avaliar receita, passivo, urgencia comercial e proposta tributaria."
    >
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <Link to="/app/leads" className="inline-flex min-h-10 items-center gap-2 rounded-md border border-neutral-300 bg-white px-3 text-sm font-semibold text-neutral-700">
          <ArrowLeft className="h-4 w-4" />
          Leads
        </Link>
        <Link to={`/app/leads/${record.id}/documentos`} className="inline-flex min-h-10 items-center gap-2 rounded-md bg-petroleum-700 px-3 text-sm font-semibold text-white">
          <FileText className="h-4 w-4" />
          Documentos
        </Link>
        <Link to={`/print/${record.id}`} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-neutral-300 bg-white px-3 text-sm font-semibold text-neutral-700">
          <FileText className="h-4 w-4" />
          PDF
        </Link>
        <button
          type="button"
          onClick={generateAssistedReports}
          className="inline-flex min-h-10 items-center gap-2 rounded-md border border-petroleum-700 bg-white px-3 text-sm font-semibold text-petroleum-800"
        >
          <Wand2 className="h-4 w-4" />
          Gerar parecer
        </button>
        <button
          type="button"
          onClick={generateProposal}
          className="inline-flex min-h-10 items-center gap-2 rounded-md border border-petroleum-700 bg-white px-3 text-sm font-semibold text-petroleum-800"
        >
          <Send className="h-4 w-4" />
          Gerar proposta
        </button>
        <button
          type="button"
          onClick={saveAll}
          className="inline-flex min-h-10 items-center gap-2 rounded-md bg-[#102524] px-3 text-sm font-semibold text-white"
        >
          <Save className="h-4 w-4" />
          {saved ? "Salvo" : "Salvar ficha"}
        </button>
      </div>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Kpi icon={BarChart3} label="Prioridade" value={`${insights.priorityScore}/100`} detail={crm.temperature} />
        <Kpi icon={LineChart} label="Receita anual" value={formatCurrency(insights.annualRevenue)} detail={`${formatCurrency(insights.monthlyRevenue)} / mes`} />
        <Kpi icon={Landmark} label="Divida fiscal" value={formatCurrency(insights.totalDebt)} detail={`${(insights.debtRatio * 100).toFixed(1)}% da receita`} />
        <Kpi icon={CalendarClock} label="Proxima acao" value={crm.nextActionDate || "sem data"} detail={crm.nextAction || "definir tarefa"} />
      </section>

      {internalAlerts.length > 0 && <InternalAlerts alerts={internalAlerts} />}

      <nav className="mt-6 flex gap-2 overflow-x-auto border-b border-neutral-200">
        {TABS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={`min-h-11 whitespace-nowrap border-b-2 px-3 text-sm font-semibold ${
              tab === item
                ? "border-petroleum-700 text-petroleum-700"
                : "border-transparent text-neutral-500 hover:text-ink"
            }`}
          >
            {TAB_LABELS[item]}
          </button>
        ))}
      </nav>

      <div className="mt-5">
        {tab === "visao" && (
          <OverviewTab
            crm={crm}
            status={status}
            notes={notes}
            onCrmChange={setCrm}
            onStatusChange={setStatus}
            onNotesChange={setNotes}
            insights={insights}
          />
        )}
        {tab === "receitas" && <RevenueTab crm={crm} onChange={setCrm} />}
        {tab === "debitos" && <DebtTab crm={crm} onChange={setCrm} />}
        {tab === "fiscal" && <FiscalMapTab crm={crm} onChange={setCrm} />}
        {tab === "negociacoes" && <NegotiationCalculator initialValues={buildNegotiationInitialValues(crm)} />}
        {tab === "simulacoes" && <SimulationTab crm={crm} insights={insights} onChange={setCrm} />}
        {tab === "estrategias" && <StrategiesTab crm={crm} insights={insights} onChange={setCrm} />}
        {tab === "parecer" && (
          <AssistedReportTab
            record={record}
            crm={crm}
            insights={insights}
            notes={notes}
            onCrmChange={setCrm}
            onNotesChange={setNotes}
            onGenerate={generateAssistedReports}
          />
        )}
        {tab === "proposta" && (
          <ProposalTab
            record={record}
            crm={crm}
            insights={insights}
            onChange={setCrm}
            onGenerate={generateProposal}
          />
        )}
        {tab === "financeiro" && <FinancialTab crm={crm} onChange={setCrm} />}
        {tab === "relatorio" && <ReportTab record={record} crm={crm} insights={insights} onChange={setCrm} />}
      </div>
    </ProShell>
  );
}

function OverviewTab({
  crm,
  status,
  notes,
  insights,
  onCrmChange,
  onStatusChange,
  onNotesChange,
}: {
  crm: LeadCrmData;
  status: DiagnosticStatus;
  notes: string;
  insights: ReturnType<typeof calculateCrmInsights>;
  onCrmChange: (crm: LeadCrmData) => void;
  onStatusChange: (status: DiagnosticStatus) => void;
  onNotesChange: (notes: string) => void;
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
      <section className="rounded-lg border border-neutral-200 bg-white p-4">
        <h2 className="text-base font-semibold text-ink">Controle comercial</h2>
        <div className="mt-4 grid gap-3">
          <SelectField label="Status do diagnostico" value={status} onChange={(value) => onStatusChange(value as DiagnosticStatus)} options={STATUS_OPTIONS} />
          <SelectField label="Etapa do funil" value={crm.stage} onChange={(value) => onCrmChange({ ...crm, stage: value as PipelineStage })} options={STAGE_OPTIONS} />
          <SelectField label="Temperatura" value={crm.temperature} onChange={(value) => onCrmChange({ ...crm, temperature: value as LeadTemperature })} options={TEMP_OPTIONS} />
          <InputField label="Responsavel" value={crm.owner} onChange={(value) => onCrmChange({ ...crm, owner: value })} placeholder="Nome interno" />
          <EditableSelect
            label="Origem"
            value={crm.source}
            onChange={(value) => onCrmChange({ ...crm, source: value })}
            options={crm.customOptions.leadOrigins}
            onAddOption={(value) =>
              onCrmChange({
                ...crm,
                customOptions: { ...crm.customOptions, leadOrigins: [...crm.customOptions.leadOrigins, value] },
              })
            }
          />
          <NumberField label="Probabilidade comercial (%)" value={crm.probability} onChange={(value) => onCrmChange({ ...crm, probability: value })} min={0} max={100} />
          <InputField label="Proxima acao" value={crm.nextAction} onChange={(value) => onCrmChange({ ...crm, nextAction: value })} />
          <InputField label="Data da proxima acao" type="date" value={crm.nextActionDate} onChange={(value) => onCrmChange({ ...crm, nextActionDate: value })} />
          <SelectField
            label="Tom do relatorio"
            value={crm.reportSettings.communicationTone}
            onChange={(value) =>
              onCrmChange({
                ...crm,
                reportSettings: { ...crm.reportSettings, communicationTone: value as CommunicationTone },
              })
            }
            options={COMMUNICATION_TONE_OPTIONS}
          />
          <FlagField
            label="Exibir fundamentacao tecnica detalhada no relatorio do cliente"
            checked={crm.reportSettings.showDetailedTechnicalBasis}
            onChange={(checked) =>
              onCrmChange({
                ...crm,
                reportSettings: { ...crm.reportSettings, showDetailedTechnicalBasis: checked },
              })
            }
          />
        </div>
      </section>

      <section className="rounded-lg border border-neutral-200 bg-white p-4">
        <h2 className="text-base font-semibold text-ink">Resumo executivo</h2>
        <p className="mt-2 text-sm text-neutral-600">{insights.headline}</p>
        <p className="mt-2 text-sm font-semibold text-petroleum-700">{insights.recommendedAction}</p>

        <label className="mt-5 block text-sm font-semibold text-neutral-700">
          Narrativa comercial
          <textarea
            value={crm.executiveSummary}
            onChange={(event) => onCrmChange({ ...crm, executiveSummary: event.target.value })}
            rows={5}
            className="mt-2 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-petroleum-500"
          />
        </label>

        <label className="mt-4 block text-sm font-semibold text-neutral-700">
          Anotacoes internas
          <textarea
            value={notes}
            onChange={(event) => onNotesChange(event.target.value)}
            rows={6}
            className="mt-2 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-petroleum-500"
            placeholder="Reuniao, objecoes, documentos prometidos, decisor, proximo passo..."
          />
        </label>
      </section>
    </div>
  );
}

function AssistedReportTab({
  record,
  crm,
  insights,
  notes,
  onCrmChange,
  onNotesChange,
  onGenerate,
}: {
  record: SavedDiagnostic;
  crm: LeadCrmData;
  insights: ReturnType<typeof calculateCrmInsights>;
  notes: string;
  onCrmChange: (crm: LeadCrmData) => void;
  onNotesChange: (notes: string) => void;
  onGenerate: () => void;
}) {
  const hasReports = Boolean(crm.internalReport || crm.clientReport);

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(360px,0.9fr)_1.1fr]">
      <section className="rounded-lg border border-neutral-200 bg-white p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-petroleum-700" />
              <h2 className="text-base font-semibold text-ink">Base do parecer</h2>
            </div>
            <p className="mt-2 text-sm text-neutral-600">
              Score {record.result.score}/100, prioridade {insights.priorityScore}/100 e dados preenchidos no CRM.
            </p>
          </div>
          <button
            type="button"
            onClick={onGenerate}
            className="inline-flex min-h-10 items-center gap-2 rounded-md bg-petroleum-700 px-3 text-sm font-semibold text-white"
          >
            <Wand2 className="h-4 w-4" />
            Gerar texto
          </button>
        </div>

        <div className="mt-4 grid gap-4">
          <TextAreaField
            label="Observacoes internas"
            value={notes}
            onChange={onNotesChange}
            rows={5}
            placeholder="Conversa, objecoes, decisor, urgencia real, risco de perder o lead..."
          />
          <TextAreaField
            label="Insumos manuais da leitura por chat"
            value={crm.technicalNotes}
            onChange={(value) => onCrmChange({ ...crm, technicalNotes: value })}
            rows={6}
            placeholder="Cole aqui conclusoes tiradas manualmente de documentos, chat externo, e-CAC, Regularize, certidoes ou reuniao."
          />
          <TextAreaField
            label="Estrategia de mercado"
            value={crm.marketStrategy}
            onChange={(value) => onCrmChange({ ...crm, marketStrategy: value })}
            rows={7}
            placeholder="O sistema gera este campo, mas voce pode ajustar a abordagem comercial."
          />
          <TextAreaField
            label="Estrategia tecnica e legislacao"
            value={crm.legalStrategy}
            onChange={(value) => onCrmChange({ ...crm, legalStrategy: value })}
            rows={7}
            placeholder="Base legal, tese, ressalvas e pontos que dependem de documento."
          />
        </div>
      </section>

      <section className="rounded-lg border border-neutral-200 bg-white p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-petroleum-700" />
              <h2 className="text-base font-semibold text-ink">Relatorios editaveis</h2>
            </div>
            <p className="mt-2 text-sm text-neutral-600">
              {hasReports
                ? `Ultima geracao: ${crm.reportUpdatedAt || "sem data registrada"}`
                : "Gere a primeira versao e depois refine manualmente."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <CopyButton text={crm.internalReport} label="Copiar interno" />
            <CopyButton text={crm.clientReport} label="Copiar cliente" />
          </div>
        </div>

        <div className="mt-4 grid gap-4">
          <TextAreaField
            label="Relatorio interno"
            value={crm.internalReport}
            onChange={(value) => onCrmChange({ ...crm, internalReport: value })}
            rows={16}
            placeholder="Texto interno para estrategia, equipe, follow-up e tomada de decisao."
          />
          <TextAreaField
            label="Relatorio para o cliente"
            value={crm.clientReport}
            onChange={(value) => onCrmChange({ ...crm, clientReport: value })}
            rows={16}
            placeholder="Texto limpo, com ressalvas, para enviar ou transformar em parecer preliminar."
          />
        </div>
      </section>
    </div>
  );
}

function RevenueTab({ crm, onChange }: { crm: LeadCrmData; onChange: (crm: LeadCrmData) => void }) {
  function updateItem(id: string, updates: Partial<RevenueEntry>) {
    onChange({
      ...crm,
      revenues: crm.revenues.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    });
  }

  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-ink">Receitas e faturamento</h2>
          <p className="text-sm text-neutral-500">Use para separar receita bruta, B2B, recorrente e outras bases.</p>
        </div>
        <button
          type="button"
          onClick={() => onChange({ ...crm, revenues: [...crm.revenues, createRevenueEntry()] })}
          className="inline-flex min-h-10 items-center gap-2 rounded-md bg-petroleum-700 px-3 text-sm font-semibold text-white"
        >
          <Plus className="h-4 w-4" />
          Receita
        </button>
      </div>

      <div className="mt-4 grid gap-3">
        {crm.revenues.map((item) => (
          <div key={item.id} className="grid gap-3 rounded-lg border border-neutral-200 p-3 lg:grid-cols-[1.2fr_160px_130px_150px_130px_40px]">
            <InputField label="Descricao" value={item.label} onChange={(value) => updateItem(item.id, { label: value })} />
            <MoneyInput label="Valor" value={item.amount} onChange={(value) => updateItem(item.id, { amount: value })} />
            <SelectField label="Periodo" value={item.period} onChange={(value) => updateItem(item.id, { period: value as RevenueEntry["period"] })} options={["mensal", "anual"]} />
            <SelectField label="Tipo" value={item.type} onChange={(value) => updateItem(item.id, { type: value as RevenueEntry["type"] })} options={["receita_bruta", "b2b", "b2c", "recorrente", "avulsa"]} />
            <NumberField label="Margem %" value={item.marginPercent} onChange={(value) => updateItem(item.id, { marginPercent: value })} min={0} max={100} />
            <button
              type="button"
              aria-label="Remover receita"
              onClick={() => onChange({ ...crm, revenues: crm.revenues.filter((entry) => entry.id !== item.id) })}
              className="mt-6 grid h-10 w-10 place-items-center rounded-md border border-neutral-300 text-neutral-500 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function DebtTab({ crm, onChange }: { crm: LeadCrmData; onChange: (crm: LeadCrmData) => void }) {
  function updateItem(id: string, updates: Partial<DebtEntry>) {
    onChange({
      ...crm,
      debts: crm.debts.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    });
  }

  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-ink">Debitos e regularizacao</h2>
          <p className="text-sm text-neutral-500">Separe Uniao, PGFN, Estado, Municipio, parcelamentos e discussoes.</p>
        </div>
        <button
          type="button"
          onClick={() => onChange({ ...crm, debts: [...crm.debts, createDebtEntry()] })}
          className="inline-flex min-h-10 items-center gap-2 rounded-md bg-petroleum-700 px-3 text-sm font-semibold text-white"
        >
          <Plus className="h-4 w-4" />
          Debito
        </button>
      </div>

      <div className="mt-4 grid gap-3">
        {crm.debts.map((item) => (
          <div key={item.id} className="grid gap-3 rounded-lg border border-neutral-200 p-3 xl:grid-cols-[130px_1fr_150px_150px_150px_140px_40px]">
            <SelectField label="Orgao" value={item.creditor} onChange={(value) => updateItem(item.id, { creditor: value as DebtEntry["creditor"] })} options={["RFB", "PGFN", "SEFAZ", "Municipio", "INSS", "Outros"]} />
            <InputField label="Descricao" value={item.label} onChange={(value) => updateItem(item.id, { label: value })} />
            <MoneyInput label="Principal" value={item.principal} onChange={(value) => updateItem(item.id, { principal: value })} />
            <MoneyInput label="Multa/juros" value={item.finesAndInterest} onChange={(value) => updateItem(item.id, { finesAndInterest: value })} />
            <SelectField label="Status" value={item.status} onChange={(value) => updateItem(item.id, { status: value as DebtEntry["status"] })} options={["em_aberto", "parcelado", "inscrito", "discutido", "suspenso"]} />
            <InputField label="Vencimento" type="date" value={item.dueDate ?? ""} onChange={(value) => updateItem(item.id, { dueDate: value })} />
            <button
              type="button"
              aria-label="Remover debito"
              onClick={() => onChange({ ...crm, debts: crm.debts.filter((entry) => entry.id !== item.id) })}
              className="mt-6 grid h-10 w-10 place-items-center rounded-md border border-neutral-300 text-neutral-500 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function FiscalMapTab({ crm, onChange }: { crm: LeadCrmData; onChange: (crm: LeadCrmData) => void }) {
  const fiscal = crm.fiscalProfile;
  const criticalJudicialRisk = hasCriticalJudicialRisk(crm);
  const updateFiscal = (updates: Partial<LeadCrmData["fiscalProfile"]>) =>
    onChange({ ...crm, fiscalProfile: { ...fiscal, ...updates } });

  return (
    <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
      <section className="rounded-lg border border-neutral-200 bg-white p-4">
        <div className="flex items-center gap-2">
          <Landmark className="h-5 w-5 text-petroleum-700" />
          <h2 className="text-base font-semibold text-ink">Entrada e classificacao</h2>
        </div>
        <div className="mt-4 grid gap-3">
          <SelectField
            label="Canal de entrada"
            value={fiscal.intakeChannel}
            onChange={(value) => updateFiscal({ intakeChannel: value as IntakeChannel })}
            options={INTAKE_OPTIONS}
          />
          <InputField
            label="Data da classificacao"
            type="date"
            value={fiscal.classificationDate}
            onChange={(value) => updateFiscal({ classificationDate: value })}
          />
          <InputField
            label="Data do extrato/base"
            type="date"
            value={fiscal.debtSnapshotDate}
            onChange={(value) => updateFiscal({ debtSnapshotDate: value })}
          />
          <SelectField
            label="Exposicao no relatorio"
            value={fiscal.dataExposureMode}
            onChange={(value) => updateFiscal({ dataExposureMode: value as DataExposureMode })}
            options={EXPOSURE_OPTIONS}
          />
          <TextAreaField
            label="Classificacao do debito"
            value={fiscal.debtClassification}
            onChange={(value) => updateFiscal({ debtClassification: value })}
            rows={5}
            placeholder="Ex: inscrito em DAU, em cobranca administrativa, parcelado, suspenso, discutido..."
          />
          <div className={`rounded-lg border p-3 ${fiscal.transactionImpedimentActive ? "border-red-300 bg-red-50" : "border-neutral-200 bg-[#f7faf8]"}`}>
            <div className="flex items-start gap-2">
              <AlertTriangle className={`mt-0.5 h-5 w-5 ${fiscal.transactionImpedimentActive ? "text-red-700" : "text-petroleum-700"}`} />
              <div>
                <p className={`text-sm font-semibold ${fiscal.transactionImpedimentActive ? "text-red-800" : "text-ink"}`}>
                  Impedimento de transacao
                </p>
                <p className={`mt-1 text-xs leading-5 ${fiscal.transactionImpedimentActive ? "text-red-700" : "text-neutral-600"}`}>
                  Marque quando houver transacao rescindida ou bloqueio no REGULARIZE. O relatorio passa a tratar parcelamento ordinario como plano B.
                </p>
              </div>
            </div>
            <div className="mt-3">
              <FlagField
                label="Impedimento por transacao rescindida"
                checked={fiscal.transactionImpedimentActive}
                onChange={(checked) => updateFiscal({ transactionImpedimentActive: checked })}
              />
            </div>
          </div>
          <div className={`rounded-lg border p-3 ${criticalJudicialRisk ? "border-red-300 bg-red-50" : "border-amber-200 bg-amber-50"}`}>
            <div className="flex items-start gap-2">
              <AlertTriangle className={`mt-0.5 h-5 w-5 ${criticalJudicialRisk ? "text-red-700" : "text-amber-700"}`} />
              <div>
                <p className={`text-sm font-semibold ${criticalJudicialRisk ? "text-red-800" : "text-amber-800"}`}>
                  Execucao fiscal
                </p>
                <p className={`mt-1 text-xs leading-5 ${criticalJudicialRisk ? "text-red-700" : "text-amber-700"}`}>
                  Com execucao ativa e citacao confirmada, registre se ja houve pagamento, parcelamento ou garantia judicial.
                </p>
              </div>
            </div>
            <div className="mt-3 grid gap-2">
              <FlagField
                label="Existe execucao ativa"
                checked={fiscal.judicialExecutionActive}
                onChange={(checked) => updateFiscal({ judicialExecutionActive: checked })}
              />
              <FlagField
                label="Citacao ja confirmada"
                checked={fiscal.citationServed}
                onChange={(checked) => updateFiscal({ citationServed: checked })}
              />
              <FlagField
                label="Pagamento ou parcelamento apresentado"
                checked={fiscal.paymentOrInstallmentPresented}
                onChange={(checked) => updateFiscal({ paymentOrInstallmentPresented: checked })}
              />
              <FlagField
                label="Garantia judicial apresentada"
                checked={fiscal.judicialGuaranteePresented}
                onChange={(checked) => updateFiscal({ judicialGuaranteePresented: checked })}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-neutral-200 bg-white p-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-petroleum-700" />
          <h2 className="text-base font-semibold text-ink">Mapa fiscal bruto</h2>
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <TextAreaField
            label="Receita Federal / PGFN / Uniao"
            value={fiscal.federalSituation}
            onChange={(value) => updateFiscal({ federalSituation: value })}
            rows={6}
            placeholder="Extratos, inscricoes, parcelamentos, omissoes, exigibilidade..."
          />
          <TextAreaField
            label="Estado / SEFAZ"
            value={fiscal.stateSituation}
            onChange={(value) => updateFiscal({ stateSituation: value })}
            rows={6}
            placeholder="ICMS, autos, parcelamentos, certidao estadual..."
          />
          <TextAreaField
            label="Municipio / ISS"
            value={fiscal.municipalSituation}
            onChange={(value) => updateFiscal({ municipalSituation: value })}
            rows={6}
            placeholder="ISS, alvara, certidao municipal, pendencias..."
          />
          <TextAreaField
            label="Certidoes, DCTF e obrigacoes"
            value={[fiscal.certificateStatus, fiscal.dctfStatus, fiscal.installmentStatus].filter(Boolean).join("\n")}
            onChange={(value) => {
              const [certificateStatus = "", dctfStatus = "", installmentStatus = ""] = value.split("\n");
              updateFiscal({ certificateStatus, dctfStatus, installmentStatus });
            }}
            rows={6}
            placeholder={"Certidao: ...\nDCTF/obrigacoes: ...\nParcelamentos: ..."}
          />
        </div>

        <div className="mt-4 grid gap-4">
          <TextAreaField
            label="Isencoes, particularidades e dados sensiveis"
            value={fiscal.exemptionNotes}
            onChange={(value) => updateFiscal({ exemptionNotes: value })}
            rows={5}
            placeholder="Beneficios, isencoes, pontos sigilosos, dados que nao devem ir para relatorio resumido..."
          />
          <TextAreaField
            label="Enquadramento e legislacao vigente"
            value={fiscal.legalFramework}
            onChange={(value) => updateFiscal({ legalFramework: value })}
            rows={6}
            placeholder="Base legal/normativa, modalidade possivel, limites, ressalvas e data da analise."
          />
          <TextAreaField
            label="Alerta judicial"
            value={fiscal.judicialRiskNotes}
            onChange={(value) => updateFiscal({ judicialRiskNotes: value })}
            rows={5}
            placeholder="Atos processuais, penhora, bloqueio, prazos, estrategia e observacoes do processo."
          />
          <div className={`rounded-lg border p-4 ${criticalJudicialRisk ? "border-red-300 bg-red-50" : "border-neutral-200 bg-[#f7faf8]"}`}>
            <p className={`text-sm font-semibold ${criticalJudicialRisk ? "text-red-800" : "text-ink"}`}>
              Leitura automatica do risco judicial
            </p>
            <p className={`mt-2 whitespace-pre-line text-sm leading-6 ${criticalJudicialRisk ? "text-red-700" : "text-neutral-700"}`}>
              {buildJudicialRisk(crm)}
            </p>
          </div>
          <TextAreaField
            label="Elegibilidade e simulacao de negociacao"
            value={[fiscal.eligibilityNotes, fiscal.negotiationSimulation].filter(Boolean).join("\n\n")}
            onChange={(value) => {
              const [eligibilityNotes = "", ...rest] = value.split("\n\n");
              updateFiscal({ eligibilityNotes, negotiationSimulation: rest.join("\n\n") });
            }}
            rows={7}
            placeholder="Quem se enquadra, qual caminho parece viavel, simulacao e pontos pendentes."
          />
          <TextAreaField
            label="Leitura final da situacao do cliente"
            value={[fiscal.fiscalReadout, fiscal.clientSituation].filter(Boolean).join("\n\n")}
            onChange={(value) => {
              const [fiscalReadout = "", ...rest] = value.split("\n\n");
              updateFiscal({ fiscalReadout, clientSituation: rest.join("\n\n") });
            }}
            rows={7}
            placeholder="Texto para usar na reuniao: 'olha, tua situacao hoje e esta...'"
          />
        </div>
      </section>
    </div>
  );
}

function SimulationTab({
  crm,
  insights,
  onChange,
}: {
  crm: LeadCrmData;
  insights: ReturnType<typeof calculateCrmInsights>;
  onChange: (crm: LeadCrmData) => void;
}) {
  function updateSimulation(id: string, updates: Partial<LeadCrmData["simulations"][number]>) {
    onChange({
      ...crm,
      simulations: crm.simulations.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    });
  }

  function setRecommended(id: string) {
    onChange({
      ...crm,
      simulations: crm.simulations.map((item) => ({ ...item, recommended: item.id === id, includeInPdf: item.id === id ? true : item.includeInPdf })),
    });
  }

  function duplicateSimulation(id: string) {
    const item = crm.simulations.find((simulation) => simulation.id === id);
    if (!item) return;
    onChange({
      ...crm,
      simulations: [
        ...crm.simulations,
        {
          ...item,
          id: `sim-${Date.now()}`,
          title: `${item.title} - copia`,
          recommended: false,
          includeInPdf: false,
        },
      ],
    });
  }

  return (
    <section className="grid gap-5">
      <div className="rounded-lg border border-neutral-200 bg-white p-4">
        <h2 className="text-base font-semibold text-ink">Selecionar simulacoes para analisar e PDF</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Habilite os cenarios que quer calcular. O relatorio/PDF usa apenas os marcados como incluir no PDF.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {crm.simulations.map((simulation) => (
            <article key={simulation.id} className={`rounded-lg border p-3 ${simulation.enabled ? "border-petroleum-200 bg-petroleum-50" : "border-neutral-200 bg-white"}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-ink">{simulation.title}</p>
                  <p className="mt-1 text-xs text-neutral-500">{simulation.type}</p>
                </div>
                <input
                  type="checkbox"
                  checked={simulation.enabled}
                  onChange={(event) => updateSimulation(simulation.id, { enabled: event.target.checked })}
                  className="mt-1 h-4 w-4 accent-petroleum-700"
                />
              </div>
              <div className="mt-3 grid gap-2">
                <FlagField
                  label="Incluir no PDF"
                  checked={simulation.includeInPdf}
                  onChange={(checked) => updateSimulation(simulation.id, { includeInPdf: checked })}
                />
                <button
                  type="button"
                  onClick={() => setRecommended(simulation.id)}
                  className={`min-h-9 rounded-md border px-3 text-sm font-semibold ${
                    simulation.recommended ? "border-petroleum-700 bg-petroleum-700 text-white" : "border-neutral-300 bg-white text-neutral-700"
                  }`}
                >
                  {simulation.recommended ? "Recomendada" : "Definir como recomendada"}
                </button>
                {simulation.type === "manual" && (
                  <button
                    type="button"
                    onClick={() => duplicateSimulation(simulation.id)}
                    className="min-h-9 rounded-md border border-neutral-300 bg-white px-3 text-sm font-semibold text-neutral-700"
                  >
                    Duplicar cenario
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {crm.simulations
          .filter((simulation) => simulation.enabled)
          .map((simulation) => {
            const entry = simulation.debtAmount * (simulation.entryPercent / 100);
            const base = Math.max(0, simulation.debtAmount - entry);
            const discount = base * (simulation.discountPercent / 100);
            const net = Math.max(0, base - discount);
            const installment = simulation.installmentCount > 0 ? net / simulation.installmentCount : 0;

            return (
              <article key={simulation.id} className="rounded-lg border border-neutral-200 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <InputField
                      label="Titulo"
                      value={simulation.title}
                      onChange={(value) => updateSimulation(simulation.id, { title: value })}
                    />
                  </div>
                  {simulation.recommended && (
                    <span className="rounded-md bg-petroleum-700 px-2 py-1 text-xs font-semibold text-white">
                      Recomendado
                    </span>
                  )}
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <MoneyInput
                    label="Divida"
                    value={simulation.debtAmount}
                    onChange={(value) => updateSimulation(simulation.id, { debtAmount: value })}
                  />
                  <NumberField
                    label="Entrada (%)"
                    value={simulation.entryPercent}
                    onChange={(value) => updateSimulation(simulation.id, { entryPercent: value })}
                    min={0}
                  />
                  <NumberField
                    label="Parcelas"
                    value={simulation.installmentCount}
                    onChange={(value) => updateSimulation(simulation.id, { installmentCount: value })}
                    min={1}
                  />
                  <NumberField
                    label="Reducao potencial (%)"
                    value={simulation.discountPercent}
                    onChange={(value) => updateSimulation(simulation.id, { discountPercent: value })}
                    min={0}
                    max={100}
                  />
                </div>
                <div className="mt-4 grid gap-2 rounded-lg bg-[#f7faf8] p-3">
                  <DataLine label="Entrada" value={formatCurrency(entry)} />
                  <DataLine label="Reducao potencial" value={formatCurrency(discount)} />
                  <DataLine label="Parcela estimada" value={`${formatCurrency(installment)} x ${simulation.installmentCount}`} />
                  <DataLine label="Total estimado" value={formatCurrency(entry + net)} />
                </div>
                <TextAreaField
                  label="Notas"
                  value={simulation.notes}
                  onChange={(value) => updateSimulation(simulation.id, { notes: value })}
                  rows={4}
                />
              </article>
            );
          })}
      </div>
    </section>
  );
}

function StrategiesTab({
  crm,
  insights,
  onChange,
}: {
  crm: LeadCrmData;
  insights: ReturnType<typeof calculateCrmInsights>;
  onChange: (crm: LeadCrmData) => void;
}) {
  const strategies = crm.commercialStrategies;
  const defense = strategies.judicialDefense;
  const negotiation = strategies.negotiation;
  const updateStrategies = (updates: Partial<LeadCrmData["commercialStrategies"]>) =>
    onChange({ ...crm, commercialStrategies: { ...strategies, ...updates } });
  const updateDefense = (updates: Partial<typeof defense>) =>
    updateStrategies({ judicialDefense: { ...defense, ...updates } });
  const updateNegotiation = (updates: Partial<typeof negotiation>) =>
    updateStrategies({ negotiation: { ...negotiation, ...updates } });

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <section className="rounded-lg border border-neutral-200 bg-white p-4">
        <div className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-petroleum-700" />
          <h2 className="text-base font-semibold text-ink">Defesa judicial</h2>
        </div>
        <div className="mt-4 grid gap-3">
          <FlagField label="Incluir defesa judicial" checked={defense.include} onChange={(checked) => updateDefense({ include: checked })} />
          <FlagField label="Incluir garantia" checked={defense.includeGuarantee} onChange={(checked) => updateDefense({ includeGuarantee: checked })} />
          <NumberField
            label="Custo comercial da garantia (%)"
            value={defense.guaranteeCommercialCostPercent}
            onChange={(value) =>
              updateDefense({
                guaranteeCommercialCostPercent: value,
                guaranteeCommercialCostValue: insights.totalDebt * (value / 100),
              })
            }
            min={0}
            max={100}
          />
          <MoneyInput
            label="Custo comercial da garantia"
            value={defense.guaranteeCommercialCostValue}
            onChange={(value) => updateDefense({ guaranteeCommercialCostValue: value })}
          />
          <MoneyInput
            label="Valor nominal exigido em juizo"
            value={defense.guaranteeNominalValue}
            onChange={(value) => updateDefense({ guaranteeNominalValue: value })}
          />
          <NumberField
            label="Parcelas padrao"
            value={defense.guaranteeInstallments}
            onChange={(value) => updateDefense({ guaranteeInstallments: value })}
            min={1}
          />
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            Custo comercial da garantia nao e o mesmo que garantia judicial suficiente. Nao afirmar que 20% garante a execucao.
          </div>
          <TextAreaField label="Notas internas da defesa" value={defense.notes} onChange={(value) => updateDefense({ notes: value })} rows={5} />
        </div>
      </section>

      <section className="rounded-lg border border-neutral-200 bg-white p-4">
        <div className="flex items-center gap-2">
          <Landmark className="h-5 w-5 text-petroleum-700" />
          <h2 className="text-base font-semibold text-ink">Negociacao</h2>
        </div>
        <div className="mt-4 grid gap-3">
          <FlagField label="Incluir negociacao" checked={negotiation.include} onChange={(checked) => updateNegotiation({ include: checked })} />
          <FlagField label="Conduzir para Uniao/PGFN quando viavel" checked={negotiation.preferPgfn} onChange={(checked) => updateNegotiation({ preferPgfn: checked })} />
          <FlagField
            label="RFB exige medida tecnica interna"
            checked={negotiation.rfbNeedsTechnicalMeasure}
            onChange={(checked) => updateNegotiation({ rfbNeedsTechnicalMeasure: checked })}
          />
          <TextAreaField
            label="Caminho tecnico interno"
            value={negotiation.internalTechnicalPath}
            onChange={(value) => updateNegotiation({ internalTechnicalPath: value })}
            rows={6}
            placeholder="Tese, remessa, inscricao, medida tecnica ou judicial. Nao sai automaticamente para o cliente."
          />
          <TextAreaField
            label="Texto seguro para cliente"
            value={negotiation.clientSafeText}
            onChange={(value) => updateNegotiation({ clientSafeText: value })}
            rows={5}
          />
        </div>
      </section>
    </div>
  );
}

function ProposalTab({
  record,
  crm,
  insights,
  onChange,
  onGenerate,
}: {
  record: SavedDiagnostic;
  crm: LeadCrmData;
  insights: ReturnType<typeof calculateCrmInsights>;
  onChange: (crm: LeadCrmData) => void;
  onGenerate: () => void;
}) {
  const proposal = crm.proposal;
  const updateProposal = (updates: Partial<LeadCrmData["proposal"]>) =>
    onChange({ ...crm, proposal: { ...proposal, ...updates } });
  const hasDefense = proposal.items.some((item) => item.enabled && item.type === "defesa_judicial");
  const hasAdvisory = proposal.items.some((item) => item.enabled && item.type === "assessoria");
  const advisoryBelowMinimum = proposal.items.some(
    (item) => item.enabled && item.type === "assessoria" && item.amount < 1620,
  );

  function updateProposalItem(id: string, updates: Partial<ProposalItem>) {
    updateProposal({
      items: proposal.items.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    });
  }

  function addProposalItem(type: ProposalItemType = "personalizado") {
    const labels: Record<ProposalItemType, string> = {
      assessoria: "Assessoria",
      garantia: "Garantia",
      defesa_judicial: "Defesa Judicial",
      negociacao: "Negociacao",
      parecer_tecnico: "Parecer tecnico",
      acompanhamento_pagamento: "Acompanhamento de pagamento",
      personalizado: "Item personalizado",
    };
    updateProposal({
      items: [
        ...proposal.items,
        createProposalItem({
          type,
          label: labels[type],
          amount: type === "assessoria" ? 1620 : 0,
          installments: type === "assessoria" ? 12 : 1,
        }),
      ],
    });
  }

  function removeProposalItem(id: string) {
    updateProposal({ items: proposal.items.filter((item) => item.id !== id) });
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
      <section className="rounded-lg border border-neutral-200 bg-white p-4">
        <div className="flex items-center gap-2">
          <Banknote className="h-5 w-5 text-petroleum-700" />
          <h2 className="text-base font-semibold text-ink">Estrategia comercial</h2>
        </div>

        <div className="mt-4 grid gap-3">
          <SelectField
            label="Estrategia"
            value={proposal.strategy}
            onChange={(value) => updateProposal({ strategy: value as ProposalStrategy })}
            options={PROPOSAL_STRATEGY_OPTIONS}
          />
          <InputField
            label="Titulo da proposta"
            value={proposal.title}
            onChange={(value) => updateProposal({ title: value })}
          />
          <MoneyInput
            label="Setup tecnico"
            value={proposal.setupFee}
            onChange={(value) => updateProposal({ setupFee: value })}
          />
          <MoneyInput
            label="Mensalidade"
            value={proposal.monthlyFee}
            onChange={(value) => updateProposal({ monthlyFee: value })}
          />
          <NumberField
            label="Exito (%)"
            value={proposal.successFeePercent}
            onChange={(value) => updateProposal({ successFeePercent: value })}
            min={0}
            max={100}
          />
          <MoneyInput
            label="Base de exito"
            value={proposal.successFeeBase}
            onChange={(value) => updateProposal({ successFeeBase: value })}
          />
          <MoneyInput
            label="Economia/beneficio estimado"
            value={proposal.estimatedSavings}
            onChange={(value) => updateProposal({ estimatedSavings: value })}
          />
          <InputField
            label="Validade"
            type="date"
            value={proposal.validityDate}
            onChange={(value) => updateProposal({ validityDate: value })}
          />
          <InputField
            label="Condicoes"
            value={proposal.paymentTerms}
            onChange={(value) => updateProposal({ paymentTerms: value })}
          />
        </div>

        <div className="mt-5 grid gap-3 rounded-lg border border-neutral-200 bg-[#f7faf8] p-3">
          <DataLine label="Lead" value={record.input.nomeEmpresa} />
          <DataLine label="Receita anual" value={formatCurrency(insights.annualRevenue)} />
          <DataLine label="Passivo mapeado" value={formatCurrency(insights.totalDebt)} />
          <DataLine label="Exposicao" value={crm.fiscalProfile.dataExposureMode} />
        </div>

        {(hasDefense && !hasAdvisory) || advisoryBelowMinimum ? (
          <div className="mt-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">
            {hasDefense && !hasAdvisory && <p>Defesa Judicial exige Assessoria ativa na proposta.</p>}
            {advisoryBelowMinimum && <p>Assessoria abaixo de R$ 1.620,00 exige justificativa interna forte.</p>}
          </div>
        ) : null}

        <button
          type="button"
          onClick={onGenerate}
          className="mt-5 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md bg-petroleum-700 px-3 text-sm font-semibold text-white"
        >
          <Wand2 className="h-4 w-4" />
          Gerar proposta e WhatsApp
        </button>
      </section>

      <section className="rounded-lg border border-neutral-200 bg-white p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <MessageSquareText className="h-5 w-5 text-petroleum-700" />
              <h2 className="text-base font-semibold text-ink">Saida comercial</h2>
            </div>
            <p className="mt-2 text-sm text-neutral-600">
              {proposal.proposalUpdatedAt
                ? `Ultima proposta gerada: ${proposal.proposalUpdatedAt}`
                : "Escolha a estrategia, ajuste valores e gere o texto."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <CopyButton text={proposal.generatedProposal} label="Copiar proposta" />
            <CopyButton text={proposal.whatsappMessage} label="Copiar WhatsApp" />
          </div>
        </div>

        <section className="mt-5 rounded-lg border border-neutral-200 bg-[#f7faf8] p-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-ink">Blocos da proposta comercial</h3>
              <p className="text-xs text-neutral-500">Use itens padrao ou adicione item personalizado.</p>
            </div>
            <EditableSelect
              label="Adicionar bloco"
              value="personalizado"
              onChange={(value) => addProposalItem(value as ProposalItemType)}
              options={PROPOSAL_ITEM_TYPE_OPTIONS}
            />
          </div>
          <div className="mt-4 grid gap-3">
            {proposal.items.map((item) => (
              <div key={item.id} className="grid gap-3 rounded-lg border border-neutral-200 bg-white p-3 lg:grid-cols-[130px_1fr_150px_110px_40px]">
                <SelectField
                  label="Tipo"
                  value={item.type}
                  onChange={(value) => updateProposalItem(item.id, { type: value as ProposalItemType })}
                  options={PROPOSAL_ITEM_TYPE_OPTIONS}
                />
                <InputField label="Descricao" value={item.label} onChange={(value) => updateProposalItem(item.id, { label: value })} />
                <MoneyInput label="Valor" value={item.amount} onChange={(value) => updateProposalItem(item.id, { amount: value })} />
                <NumberField label="Parcelas" value={item.installments} onChange={(value) => updateProposalItem(item.id, { installments: value })} min={1} />
                <button
                  type="button"
                  aria-label="Remover item"
                  onClick={() => removeProposalItem(item.id)}
                  className="mt-6 grid h-10 w-10 place-items-center rounded-md border border-neutral-300 text-neutral-500 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <FlagField label="Ativo" checked={item.enabled} onChange={(checked) => updateProposalItem(item.id, { enabled: checked })} />
                <TextAreaField
                  label="Justificativa interna"
                  value={item.internalJustification}
                  onChange={(value) => updateProposalItem(item.id, { internalJustification: value })}
                  rows={3}
                />
              </div>
            ))}
          </div>
        </section>

        <div className="mt-4 grid gap-4">
          <TextAreaField
            label="Escopo"
            value={proposal.scope}
            onChange={(value) => updateProposal({ scope: value })}
            rows={7}
            placeholder="O sistema gera um escopo sugerido. Ajuste conforme a estrategia escolhida."
          />
          <TextAreaField
            label="Premissas e ressalvas"
            value={proposal.assumptions}
            onChange={(value) => updateProposal({ assumptions: value })}
            rows={6}
            placeholder="Pontos que dependem de documentos, legislacao, aprovacao interna e enquadramento."
          />
          <TextAreaField
            label="Proposta gerada"
            value={proposal.generatedProposal}
            onChange={(value) => updateProposal({ generatedProposal: value })}
            rows={18}
            placeholder="Texto comercial estruturado para revisar e enviar."
          />
          <TextAreaField
            label="Mensagem WhatsApp"
            value={proposal.whatsappMessage}
            onChange={(value) => updateProposal({ whatsappMessage: value })}
            rows={9}
            placeholder="Resumo curto para enviar depois da reuniao."
          />
        </div>
      </section>
    </div>
  );
}

function FinancialTab({ crm, onChange }: { crm: LeadCrmData; onChange: (crm: LeadCrmData) => void }) {
  const financial = crm.financial;
  const clientProfile = crm.clientProfile;
  const alerts = buildInternalAlerts(crm);

  const updateFinancial = (updates: Partial<LeadCrmData["financial"]>) =>
    onChange({ ...crm, financial: { ...financial, ...updates } });
  const updateClientProfile = (updates: Partial<LeadCrmData["clientProfile"]>) =>
    onChange({ ...crm, clientProfile: { ...clientProfile, ...updates } });

  function updateDealStatus(value: DealStatus) {
    const nextStage: PipelineStage =
      value === "perdido" ? "perdido" : value === "ganho" ? "cliente" : value === "proposta" ? "proposta" : crm.stage;
    const receivables = value === "ganho" && financial.receivables.length === 0
      ? buildReceivablesFromProposal(crm.proposal, localTodayPlus(0))
      : financial.receivables;
    const totalContracted = receivables.reduce((sum, item) => sum + item.amount, 0);
    const totalReceived = receivables.filter((item) => item.status === "pago").reduce((sum, item) => sum + item.amount, 0);
    onChange({
      ...crm,
      stage: nextStage,
      financial: {
        ...financial,
        dealStatus: value,
        receivables,
        closedDeal: {
          active: value === "ganho",
          closedAt: value === "ganho" ? financial.closedDeal.closedAt || localTodayPlus(0) : financial.closedDeal.closedAt,
          totalContracted,
          totalReceived,
          totalOpen: Math.max(0, totalContracted - totalReceived),
        },
      },
    });
  }

  function updateReceivable(id: string, updates: Partial<Receivable>) {
    const receivables = financial.receivables.map((item) => {
      if (item.id !== id) return item;
      const next = { ...item, ...updates };
      return updates.status === "pago" && !next.paidAt ? { ...next, paidAt: localTodayPlus(0) } : next;
    });
    const totalContracted = receivables.reduce((sum, item) => sum + item.amount, 0);
    const totalReceived = receivables.filter((item) => item.status === "pago").reduce((sum, item) => sum + item.amount, 0);
    updateFinancial({
      receivables,
      closedDeal: {
        ...financial.closedDeal,
        totalContracted,
        totalReceived,
        totalOpen: Math.max(0, totalContracted - totalReceived),
      },
    });
  }

  function addReceivable() {
    updateFinancial({ receivables: [...financial.receivables, createReceivable({ dueDate: localTodayPlus(7) })] });
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[390px_1fr]">
      <section className="rounded-lg border border-neutral-200 bg-white p-4">
        <div className="flex items-center gap-2">
          <Banknote className="h-5 w-5 text-petroleum-700" />
          <h2 className="text-base font-semibold text-ink">Controle financeiro</h2>
        </div>

        {alerts.length > 0 && <InternalAlerts alerts={alerts} compact />}

        <div className="mt-4 grid gap-3">
          <SelectField
            label="Status do negocio"
            value={financial.dealStatus}
            onChange={(value) => updateDealStatus(value as DealStatus)}
            options={DEAL_STATUS_OPTIONS}
          />
          <InputField
            label="Previsao de fechamento"
            type="date"
            value={financial.expectedCloseDate}
            onChange={(value) => updateFinancial({ expectedCloseDate: value })}
          />
          <MoneyInput
            label="Potencial de entrada"
            value={financial.potentialSetupFee}
            onChange={(value) => updateFinancial({ potentialSetupFee: value })}
          />
          <MoneyInput
            label="Potencial mensal"
            value={financial.potentialMonthlyFee}
            onChange={(value) => updateFinancial({ potentialMonthlyFee: value })}
          />
          <MoneyInput
            label="Potencial exito"
            value={financial.potentialSuccessFee}
            onChange={(value) => updateFinancial({ potentialSuccessFee: value })}
          />
        </div>

        <div className="mt-5 grid gap-3 rounded-lg border border-neutral-200 bg-[#f7faf8] p-3">
          <DataLine label="Setup proposta" value={formatCurrency(crm.proposal.setupFee)} />
          <DataLine label="Mensalidade proposta" value={formatCurrency(crm.proposal.monthlyFee)} />
          <DataLine label="Exito proposta" value={`${crm.proposal.successFeePercent}%`} />
        </div>

        {financial.dealStatus === "perdido" && (
          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3">
            <EditableSelect
              label="Motivo da perda"
              value={financial.lostReason}
              onChange={(value) => updateFinancial({ lostReason: value })}
              options={crm.customOptions.lostReasons}
              onAddOption={(value) =>
                onChange({
                  ...crm,
                  customOptions: { ...crm.customOptions, lostReasons: [...crm.customOptions.lostReasons, value] },
                  financial: { ...financial, lostReason: value },
                })
              }
            />
            <TextAreaField
              label="Notas sobre negocio perdido"
              value={financial.lostNotes}
              onChange={(value) => updateFinancial({ lostNotes: value })}
              rows={5}
              placeholder="Registre a razao real para calibrar futuras propostas."
            />
          </div>
        )}
      </section>

      <div className="grid gap-5">
        <section className="rounded-lg border border-neutral-200 bg-white p-4">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-petroleum-700" />
            <h2 className="text-base font-semibold text-ink">Proposta, resposta e pagamento</h2>
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-4">
            <InputField
              label="Proposta enviada em"
              type="date"
              value={financial.proposalSentAt}
              onChange={(value) => updateFinancial({ proposalSentAt: value })}
            />
            <InputField
              label="Follow-up em"
              type="date"
              value={financial.proposalFollowUpDate}
              onChange={(value) => updateFinancial({ proposalFollowUpDate: value })}
            />
            <InputField
              label="Ultima resposta"
              type="date"
              value={financial.lastClientResponseAt}
              onChange={(value) => updateFinancial({ lastClientResponseAt: value })}
            />
            <SelectField
              label="Status pagamento"
              value={financial.paymentStatus}
              onChange={(value) => updateFinancial({ paymentStatus: value as PaymentStatus })}
              options={PAYMENT_STATUS_OPTIONS}
            />
            <MoneyInput
              label="Valor a receber"
              value={financial.paymentAmount}
              onChange={(value) => updateFinancial({ paymentAmount: value })}
            />
            <InputField
              label="Vencimento"
              type="date"
              value={financial.paymentDueDate}
              onChange={(value) => updateFinancial({ paymentDueDate: value })}
            />
            <InputField
              label="Pago em"
              type="date"
              value={financial.paymentPaidAt}
              onChange={(value) => updateFinancial({ paymentPaidAt: value })}
            />
            <InputField
              label="Link Sheets execucoes"
              value={financial.executionSheetUrl}
              onChange={(value) => updateFinancial({ executionSheetUrl: value })}
              placeholder="https://docs.google.com/spreadsheets/..."
            />
          </div>
          {financial.executionSheetUrl && (
            <a
              href={financial.executionSheetUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-petroleum-700 hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              Abrir lista de execucoes
            </a>
          )}
        </section>

        <section className="rounded-lg border border-neutral-200 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Banknote className="h-5 w-5 text-petroleum-700" />
              <h2 className="text-base font-semibold text-ink">Recebiveis do negocio fechado</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => updateFinancial({ receivables: buildReceivablesFromProposal(crm.proposal, localTodayPlus(0)) })}
                className="rounded-md border border-petroleum-700 bg-white px-3 py-2 text-sm font-semibold text-petroleum-800"
              >
                Gerar parcelas da proposta
              </button>
              <button
                type="button"
                onClick={addReceivable}
                className="rounded-md bg-petroleum-700 px-3 py-2 text-sm font-semibold text-white"
              >
                Recebivel
              </button>
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <Metric label="Total contratado" value={formatCurrency(financial.closedDeal.totalContracted)} />
            <Metric label="Total recebido" value={formatCurrency(financial.closedDeal.totalReceived)} />
            <Metric label="Total em aberto" value={formatCurrency(financial.closedDeal.totalOpen)} />
          </div>
          <div className="mt-4 grid gap-3">
            {financial.receivables.map((item) => (
              <div key={item.id} className="grid gap-3 rounded-lg border border-neutral-200 p-3 xl:grid-cols-[1fr_150px_130px_130px_110px_120px]">
                <InputField label="Recebivel" value={item.label} onChange={(value) => updateReceivable(item.id, { label: value })} />
                <MoneyInput label="Valor" value={item.amount} onChange={(value) => updateReceivable(item.id, { amount: value })} />
                <InputField label="Vencimento" type="date" value={item.dueDate} onChange={(value) => updateReceivable(item.id, { dueDate: value })} />
                <SelectField
                  label="Status"
                  value={item.status}
                  onChange={(value) => updateReceivable(item.id, { status: value as ReceivableStatus })}
                  options={RECEIVABLE_STATUS_OPTIONS}
                />
                <InputField label="Pago em" type="date" value={item.paidAt} onChange={(value) => updateReceivable(item.id, { paidAt: value })} />
                <InputField label="Metodo" value={item.method} onChange={(value) => updateReceivable(item.id, { method: value })} />
                <InputField label="Obs." value={item.notes} onChange={(value) => updateReceivable(item.id, { notes: value })} />
              </div>
            ))}
            {financial.receivables.length === 0 && (
              <p className="rounded-md bg-neutral-50 p-3 text-sm text-neutral-500">
                Nenhum recebivel criado. Marque o negocio como ganho ou clique em gerar parcelas da proposta.
              </p>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-neutral-200 bg-white p-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-petroleum-700" />
            <h2 className="text-base font-semibold text-ink">Perfil do cliente e andamento</h2>
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <InputField
              label="Decisor"
              value={clientProfile.decisionMaker}
              onChange={(value) => updateClientProfile({ decisionMaker: value })}
              placeholder="Socio, financeiro, contador..."
            />
            <InputField
              label="Contato financeiro"
              value={clientProfile.financialContact}
              onChange={(value) => updateClientProfile({ financialContact: value })}
              placeholder="Quem paga/aprova contrato"
            />
            <TextAreaField
              label="Perfil e contexto do cliente"
              value={clientProfile.businessContext}
              onChange={(value) => updateClientProfile({ businessContext: value })}
              rows={5}
              placeholder="Tamanho, urgencia, cultura, decisores, pressao de caixa..."
            />
            <TextAreaField
              label="Objecoes"
              value={clientProfile.objections}
              onChange={(value) => updateClientProfile({ objections: value })}
              rows={5}
              placeholder="Preco, medo, timing, concorrencia, burocracia..."
            />
            <TextAreaField
              label="Status dos documentos"
              value={clientProfile.documentsStatus}
              onChange={(value) => updateClientProfile({ documentsStatus: value })}
              rows={5}
              placeholder="O que ja veio, o que falta, quem ficou de enviar..."
            />
            <TextAreaField
              label="Notas de relacionamento"
              value={clientProfile.relationshipNotes}
              onChange={(value) => updateClientProfile({ relationshipNotes: value })}
              rows={5}
              placeholder="Historico de conversas, tom de abordagem, canais preferidos..."
            />
          </div>

          <div className="mt-4">
            <TextAreaField
              label="Andamento do trabalho"
              value={financial.workProgress}
              onChange={(value) =>
                updateFinancial({ workProgress: value, workProgressUpdatedAt: localTodayPlus(0) })
              }
              rows={6}
              placeholder="Atualize sempre que o caso estiver ativo: etapa atual, pendencias, proxima entrega e responsavel."
            />
            <p className="mt-1 text-xs text-neutral-500">
              Ultima atualizacao: {financial.workProgressUpdatedAt || "sem registro"}
            </p>
          </div>
        </section>

        <section className="rounded-lg border border-neutral-200 bg-white p-4">
          <div className="flex items-center gap-2">
            <Clipboard className="h-5 w-5 text-petroleum-700" />
            <h2 className="text-base font-semibold text-ink">Atos de trabalho necessarios</h2>
          </div>
          <EditableChecklist
            label="Atos selecionados"
            options={crm.customOptions.workActs}
            values={financial.requiredWorkActs}
            onChange={(values) => updateFinancial({ requiredWorkActs: values })}
            onAddOption={(value) =>
              onChange({
                ...crm,
                customOptions: { ...crm.customOptions, workActs: [...crm.customOptions.workActs, value] },
                financial: { ...financial, requiredWorkActs: Array.from(new Set([...financial.requiredWorkActs, value])) },
              })
            }
          />
        </section>
      </div>
    </div>
  );
}

function ReportTab({
  record,
  crm,
  insights,
  onChange,
}: {
  record: SavedDiagnostic;
  crm: LeadCrmData;
  insights: ReturnType<typeof calculateCrmInsights>;
  onChange: (crm: LeadCrmData) => void;
}) {
  const judicialRisk = buildJudicialRisk(crm);
  const transactionImpedimentRisk = buildTransactionImpedimentRisk(crm);
  const criticalJudicialRisk = hasCriticalJudicialRisk(crm);
  const transactionImpediment = hasTransactionImpediment(crm);
  const internalAlerts = buildInternalAlerts(crm);
  const pdfSimulations = crm.simulations.filter((item) => item.includeInPdf);
  const recommendedSimulation = crm.simulations.find((item) => item.recommended);
  const proposalItems = crm.proposal.items.filter((item) => item.enabled);
  const activeStrategies = [
    crm.commercialStrategies.judicialDefense.include
      ? {
          title: "Defesa judicial",
          detail: crm.commercialStrategies.judicialDefense.includeGuarantee
            ? `Inclui garantia: ${formatCurrency(crm.commercialStrategies.judicialDefense.guaranteeCommercialCostValue)}`
            : "Sem garantia marcada nesta versao",
        }
      : null,
    crm.commercialStrategies.negotiation.include
      ? {
          title: "Negociacao",
          detail: crm.commercialStrategies.negotiation.preferPgfn
            ? "Estrategia cliente: conduzir para Uniao/PGFN quando viavel"
            : "Estrategia de negociacao marcada sem preferencia PGFN",
        }
      : null,
  ].filter(Boolean) as { title: string; detail: string }[];
  const reformLoss =
    `Preco da inacao estimado: ${formatCurrency(record.result.precoInacaoMin)} a ${formatCurrency(record.result.precoInacaoMax)}. ` +
    "Se a empresa nao tomar as redeas da reforma, pode perder margem, caixa, previsibilidade fiscal e competitividade com clientes PJ.";
  const report = [
    `Relatorio interno - ${record.input.nomeEmpresa}`,
    "",
    `Prioridade comercial: ${insights.priorityScore}/100 (${crm.temperature})`,
    `Receita anual mapeada: ${formatCurrency(insights.annualRevenue)}`,
    `Debito fiscal total: ${formatCurrency(insights.totalDebt)}`,
    `Etapa: ${crm.stage}`,
    `Status financeiro: ${crm.financial.dealStatus}`,
    `Potencial entrada: ${formatCurrency(crm.financial.potentialSetupFee)}`,
    `Potencial mensal: ${formatCurrency(crm.financial.potentialMonthlyFee)}`,
    `Potencial exito: ${formatCurrency(crm.financial.potentialSuccessFee)}`,
    `Pagamento: ${crm.financial.paymentStatus} (${crm.financial.paymentDueDate || "sem vencimento"})`,
    `Proxima acao: ${crm.nextAction} (${crm.nextActionDate || "sem data"})`,
    "",
    "Alertas internos:",
    ...(internalAlerts.length ? internalAlerts.map((alert) => `- ${alert.title}: ${alert.detail}`) : ["- Sem alertas internos no momento."]),
    "",
    "Leitura executiva:",
    crm.executiveSummary,
    "",
    "Acao recomendada:",
    insights.recommendedAction,
    "",
    "Alerta judicial:",
    judicialRisk,
    "",
    "Alerta de impedimento de transacao:",
    transactionImpedimentRisk,
    "",
    "Risco de inacao na reforma:",
    reformLoss,
    "",
    "Andamento do trabalho:",
    crm.financial.workProgress || "Sem andamento registrado.",
    "",
    "Atos necessarios:",
    ...(crm.financial.requiredWorkActs.length ? crm.financial.requiredWorkActs.map((item) => `- ${item}`) : ["- Sem atos selecionados."]),
    "",
    "Simulacoes selecionadas para PDF:",
    ...(pdfSimulations.length
      ? pdfSimulations.map((item) => `- ${item.title}: ${formatCurrency(item.debtAmount)}, entrada ${item.entryPercent}%, reducao ${item.discountPercent}%, ${item.installmentCount} parcelas.`)
      : ["- Nenhuma simulacao marcada para PDF."]),
    "",
    "Cenario recomendado:",
    recommendedSimulation ? recommendedSimulation.title : "Sem cenario recomendado.",
    "",
    "Link lista de execucoes:",
    crm.financial.executionSheetUrl || "Sem link informado.",
    "",
    "Principais riscos:",
    ...record.result.ameacas.slice(0, 4).map((item) => `- ${item}`),
    "",
    "Documentos prioritarios:",
    ...record.result.documentos.slice(0, 8).map((item) => `- ${item}`),
  ].join("\n");
  const internalReportText = crm.internalReport || report;
  const clientReportText =
    crm.clientReport || "Gere o parecer para montar a versao do cliente com tom comercial controlado.";

  return (
    <section className="grid gap-5">
      <div className="rounded-lg border border-neutral-200 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-ink">Relatorio / Diagnostico</h2>
            <p className="text-sm text-neutral-500">
              O diagnostico visual vem primeiro para apresentacao em reuniao. Os textos editaveis ficam abaixo.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <CopyButton text={internalReportText} label="Copiar interno" />
            <CopyButton text={clientReportText} label="Copiar cliente" />
          </div>
        </div>
      </div>

      <ResultPanel input={record.input} result={record.result} readOnly />

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Kpi
          icon={BarChart3}
          label="Prioridade CRM"
          value={`${insights.priorityScore}/100`}
          detail={`${crm.temperature} | ${crm.stage}`}
        />
        <Kpi
          icon={LineChart}
          label="Receita anual"
          value={formatCurrency(insights.annualRevenue)}
          detail={`${formatCurrency(insights.monthlyRevenue)} / mes`}
        />
        <Kpi
          icon={Landmark}
          label="Passivo mapeado"
          value={formatCurrency(insights.totalDebt)}
          detail={`${(insights.debtRatio * 100).toFixed(1)}% da receita`}
        />
        <Kpi
          icon={Banknote}
          label="Proposta"
          value={formatCurrency(crm.proposal.setupFee + crm.proposal.monthlyFee)}
          detail={crm.proposal.title || "sem titulo comercial"}
        />
      </section>

      {(criticalJudicialRisk || transactionImpediment || internalAlerts.length > 0) && (
        <div className="grid gap-3">
          {criticalJudicialRisk && (
            <div className="rounded-lg border-2 border-red-500 bg-red-50 p-4 text-red-900">
              <p className="text-sm font-black uppercase tracking-wide">Alerta critico maximo: execucao com citacao</p>
              <p className="mt-2 whitespace-pre-line text-sm leading-6">{judicialRisk}</p>
            </div>
          )}
          {transactionImpediment && (
            <div className="rounded-lg border-2 border-red-500 bg-red-50 p-4 text-red-900">
              <p className="text-sm font-black uppercase tracking-wide">Alerta critico: impedimento de transacao</p>
              <p className="mt-2 whitespace-pre-line text-sm leading-6">{transactionImpedimentRisk}</p>
            </div>
          )}
          {internalAlerts.length > 0 && <InternalAlerts alerts={internalAlerts} compact />}
        </div>
      )}

      <section className="rounded-lg border border-neutral-200 bg-white p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-ink">Previa visual do PDF</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Esta e a leitura executiva: score, risco, simulacoes escolhidas, estrategia e proposta sem virar texto corrido.
            </p>
          </div>
          {recommendedSimulation && (
            <span className="rounded-md bg-petroleum-700 px-3 py-2 text-sm font-semibold text-white">
              Recomendado: {recommendedSimulation.title}
            </span>
          )}
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-4">
            <section className="rounded-lg border border-neutral-200 bg-[#f7faf8] p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-700" />
                <h3 className="text-sm font-semibold text-ink">Risco e urgencia</h3>
              </div>
              <p className="mt-2 text-sm leading-6 text-neutral-700">{reformLoss}</p>
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                <Metric label="Acao recomendada" value={insights.recommendedAction} />
                <Metric label="Proxima acao" value={`${crm.nextAction || "Definir"} ${crm.nextActionDate ? `em ${crm.nextActionDate}` : ""}`} />
              </div>
            </section>

            <section className="rounded-lg border border-neutral-200 bg-white p-4">
              <div className="flex items-center gap-2">
                <Landmark className="h-5 w-5 text-petroleum-700" />
                <h3 className="text-sm font-semibold text-ink">Simulacoes selecionadas para PDF</h3>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {pdfSimulations.map((item) => {
                  const entry = item.debtAmount * (item.entryPercent / 100);
                  const base = Math.max(0, item.debtAmount - entry);
                  const discount = base * (item.discountPercent / 100);
                  const net = Math.max(0, base - discount);
                  const installment = item.installmentCount > 0 ? net / item.installmentCount : 0;

                  return (
                    <div key={item.id} className="rounded-md border border-neutral-200 bg-[#f7faf8] p-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-ink">{item.title}</p>
                        {item.recommended && (
                          <span className="rounded-full bg-petroleum-700 px-2 py-0.5 text-xs font-semibold text-white">
                            Recomendada
                          </span>
                        )}
                      </div>
                      <div className="mt-3 grid gap-1 text-sm text-neutral-700">
                        <DataLine label="Divida" value={formatCurrency(item.debtAmount)} />
                        <DataLine label="Entrada" value={formatCurrency(entry)} />
                        <DataLine label="Reducao potencial" value={formatCurrency(discount)} />
                        <DataLine label="Parcela estimada" value={`${formatCurrency(installment)} x ${item.installmentCount}`} />
                      </div>
                    </div>
                  );
                })}
                {pdfSimulations.length === 0 && (
                  <p className="rounded-md bg-neutral-50 p-3 text-sm text-neutral-500">
                    Nenhuma simulacao marcada para PDF. Marque ao menos uma na aba Simulacoes.
                  </p>
                )}
              </div>
            </section>
          </div>

          <div className="grid gap-4">
            <section className="rounded-lg border border-neutral-200 bg-white p-4">
              <div className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-petroleum-700" />
                <h3 className="text-sm font-semibold text-ink">Estrategias no relatorio</h3>
              </div>
              <div className="mt-3 grid gap-2">
                {activeStrategies.map((item) => (
                  <div key={item.title} className="rounded-md border border-neutral-200 bg-[#f7faf8] p-3">
                    <p className="text-sm font-semibold text-ink">{item.title}</p>
                    <p className="mt-1 text-sm text-neutral-600">{item.detail}</p>
                  </div>
                ))}
                {activeStrategies.length === 0 && (
                  <p className="rounded-md bg-neutral-50 p-3 text-sm text-neutral-500">
                    Nenhuma estrategia marcada para inclusao.
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-lg border border-neutral-200 bg-white p-4">
              <div className="flex items-center gap-2">
                <Banknote className="h-5 w-5 text-petroleum-700" />
                <h3 className="text-sm font-semibold text-ink">Proposta comercial</h3>
              </div>
              <div className="mt-3 grid gap-2">
                {proposalItems.map((item) => (
                  <DataLine
                    key={item.id}
                    label={item.label}
                    value={`${formatCurrency(item.amount)} em ${item.installments}x`}
                  />
                ))}
                {proposalItems.length === 0 && (
                  <p className="rounded-md bg-neutral-50 p-3 text-sm text-neutral-500">
                    Nenhum item comercial ativo.
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-lg border border-neutral-200 bg-white p-4">
              <div className="flex items-center gap-2">
                <Clipboard className="h-5 w-5 text-petroleum-700" />
                <h3 className="text-sm font-semibold text-ink">Atos necessarios</h3>
              </div>
              <ul className="mt-3 grid gap-2 text-sm text-neutral-700">
                {crm.financial.requiredWorkActs.map((item) => (
                  <li key={item} className="rounded-md bg-[#f7faf8] px-3 py-2">
                    {item}
                  </li>
                ))}
                {crm.financial.requiredWorkActs.length === 0 && (
                  <li className="rounded-md bg-neutral-50 px-3 py-2 text-neutral-500">
                    Validar documentos, extratos oficiais e estrategia final.
                  </li>
                )}
              </ul>
            </section>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-ink">Relatorio interno editavel</h3>
            <CopyButton text={internalReportText} label="Copiar interno" />
          </div>
          <div className="mt-3">
            <TextAreaField
              label="Texto interno"
              value={internalReportText}
              onChange={(value) => onChange({ ...crm, internalReport: value })}
              rows={18}
            />
          </div>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-ink">Relatorio do cliente / texto para copiar</h3>
            <CopyButton text={clientReportText} label="Copiar cliente" />
          </div>
          <div className="mt-3">
            <TextAreaField
              label="Texto do cliente"
              value={clientReportText}
              onChange={(value) => onChange({ ...crm, clientReport: value })}
              rows={18}
            />
          </div>
        </div>
      </section>

      <details className="rounded-lg border border-neutral-200 bg-white p-4">
        <summary className="cursor-pointer text-sm font-semibold text-ink">
          Resumo tecnico consolidado para copia bruta
        </summary>
        <pre className="mt-4 whitespace-pre-wrap rounded-lg bg-[#102524] p-4 text-sm leading-6 text-white">{report}</pre>
      </details>
    </section>
  );
}

function CopyButton({ text, label }: { text: string; label: string }) {
  return (
    <button
      type="button"
      disabled={!text}
      onClick={() => navigator.clipboard?.writeText(text)}
      className="inline-flex min-h-10 items-center gap-2 rounded-md border border-neutral-300 bg-white px-3 text-sm font-semibold text-neutral-700 disabled:cursor-not-allowed disabled:opacity-45"
    >
      <Clipboard className="h-4 w-4" />
      {label}
    </button>
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

function Kpi({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof BarChart3;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-neutral-600">{label}</p>
        <Icon className="h-4 w-4 text-petroleum-700" />
      </div>
      <p className="mt-3 text-xl font-semibold text-ink">{value}</p>
      <p className="mt-1 line-clamp-2 text-xs text-neutral-500">{detail}</p>
    </div>
  );
}

function InternalAlerts({ alerts, compact = false }: { alerts: InternalAlert[]; compact?: boolean }) {
  return (
    <section className={`grid gap-3 ${compact ? "mt-4" : "mt-5"}`}>
      {alerts.map((alert) => {
        const tone =
          alert.level === "critico"
            ? "border-red-300 bg-red-50 text-red-900"
            : alert.level === "alto"
              ? "border-amber-300 bg-amber-50 text-amber-900"
              : "border-blue-200 bg-blue-50 text-blue-900";

        return (
          <div key={`${alert.title}-${alert.detail}`} className={`rounded-lg border p-3 ${tone}`}>
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-5 w-5" />
              <div>
                <p className="text-sm font-black uppercase tracking-wide">{alert.title}</p>
                <p className="mt-1 text-sm leading-6">{alert.detail}</p>
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}

function SimulationPanel({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Landmark;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-petroleum-700" />
        <h2 className="font-semibold text-ink">{title}</h2>
      </div>
      <div className="mt-4 grid gap-2">{children}</div>
    </div>
  );
}

function DataLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-neutral-100 py-2 text-sm">
      <span className="text-neutral-500">{label}</span>
      <span className="font-semibold text-ink">{value}</span>
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 5,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <label className="block text-xs font-semibold uppercase text-neutral-500">
      {label}
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm normal-case leading-6 text-ink outline-none focus:border-petroleum-500"
      />
    </label>
  );
}

function FlagField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex min-h-10 cursor-pointer items-center justify-between gap-3 rounded-md border border-white/60 bg-white px-3 py-2 text-sm font-semibold text-neutral-700">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-petroleum-700"
      />
    </label>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block text-xs font-semibold uppercase text-neutral-500">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-1 min-h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm normal-case text-ink outline-none focus:border-petroleum-500"
      />
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <label className="block text-xs font-semibold uppercase text-neutral-500">
      {label}
      <input
        type="number"
        value={Number.isFinite(value) ? value : 0}
        min={min}
        max={max}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-1 min-h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm normal-case text-ink outline-none focus:border-petroleum-500"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="block text-xs font-semibold uppercase text-neutral-500">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 min-h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm normal-case text-ink outline-none focus:border-petroleum-500"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
