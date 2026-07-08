import { getDebtBreakdown, type DiagnosticInput, type DiagnosticResult } from "@/lib/RiskCalculator";

export type PipelineStage =
  | "novo"
  | "qualificado"
  | "diagnostico"
  | "documentos"
  | "proposta"
  | "cliente"
  | "perdido";

export type LeadTemperature = "frio" | "morno" | "quente" | "urgente";

export type RevenueEntry = {
  id: string;
  label: string;
  amount: number;
  period: "mensal" | "anual";
  type: "receita_bruta" | "b2b" | "b2c" | "recorrente" | "avulsa";
  marginPercent: number;
  notes?: string;
};

export type DebtEntry = {
  id: string;
  creditor: "RFB" | "PGFN" | "SEFAZ" | "Municipio" | "INSS" | "Outros";
  label: string;
  principal: number;
  finesAndInterest: number;
  status: "em_aberto" | "parcelado" | "inscrito" | "discutido" | "suspenso";
  dueDate?: string;
  notes?: string;
};

export type IntakeChannel = "site" | "ads" | "reuniao" | "whatsapp" | "indicacao" | "outro";

export type DataExposureMode = "resumido" | "completo";

export type FiscalProfile = {
  intakeChannel: IntakeChannel;
  classificationDate: string;
  debtSnapshotDate: string;
  debtClassification: string;
  transactionImpedimentActive: boolean;
  judicialExecutionActive: boolean;
  citationServed: boolean;
  paymentOrInstallmentPresented: boolean;
  judicialGuaranteePresented: boolean;
  judicialRiskNotes: string;
  federalSituation: string;
  stateSituation: string;
  municipalSituation: string;
  certificateStatus: string;
  dctfStatus: string;
  installmentStatus: string;
  exemptionNotes: string;
  legalFramework: string;
  eligibilityNotes: string;
  negotiationSimulation: string;
  fiscalReadout: string;
  clientSituation: string;
  dataExposureMode: DataExposureMode;
};

export type ProposalStrategy =
  | "regularizacao"
  | "reforma"
  | "recuperacao_creditos"
  | "blindagem"
  | "mista";

export type CommercialProposal = {
  strategy: ProposalStrategy;
  title: string;
  setupFee: number;
  monthlyFee: number;
  successFeePercent: number;
  successFeeBase: number;
  estimatedSavings: number;
  scope: string;
  assumptions: string;
  paymentTerms: string;
  validityDate: string;
  generatedProposal: string;
  whatsappMessage: string;
  proposalUpdatedAt: string;
  items: ProposalItem[];
};

export type DealStatus = "lead" | "proposta" | "ganho" | "perdido";

export type PaymentStatus = "nao_iniciado" | "aguardando" | "pago" | "atrasado" | "cancelado";

export type WorkAct =
  | "extratos_rfb_pgfn"
  | "certidoes"
  | "execucoes_fiscais"
  | "negociacao_regularize"
  | "simulacao_passivo"
  | "analise_reforma"
  | "parecer_tecnico"
  | "proposta_comercial"
  | "reuniao_fechamento"
  | "acompanhamento_pagamento";

export type RuleLevel =
  | "hard_block"
  | "soft_warning"
  | "internal_only"
  | "client_safe"
  | "commercial_assumption";

export type CommunicationTone = "conservador" | "tecnico" | "comercial" | "agressivo_comercial";

export type RuleLayeredMessage = {
  id: string;
  level: RuleLevel;
  technicalRule: string;
  commercialPositioning: string;
  clientFacingText: string;
};

export type ReportSettings = {
  communicationTone: CommunicationTone;
  showDetailedTechnicalBasis: boolean;
};

export type SimulationType =
  | "manual"
  | "capacidade_pagamento"
  | "pequeno_valor"
  | "ordinaria"
  | "receita_ecac";

export type SimulationScenario = {
  id: string;
  type: SimulationType;
  title: string;
  enabled: boolean;
  includeInPdf: boolean;
  recommended: boolean;
  debtAmount: number;
  entryPercent: number;
  installmentCount: number;
  discountPercent: number;
  notes: string;
};

export type JudicialDefenseStrategy = {
  include: boolean;
  includeGuarantee: boolean;
  guaranteeCommercialCostPercent: number;
  guaranteeCommercialCostValue: number;
  guaranteeInstallments: number;
  guaranteeNominalValue: number;
  notes: string;
};

export type NegotiationStrategy = {
  include: boolean;
  preferPgfn: boolean;
  rfbNeedsTechnicalMeasure: boolean;
  internalTechnicalPath: string;
  clientSafeText: string;
};

export type CommercialStrategies = {
  judicialDefense: JudicialDefenseStrategy;
  negotiation: NegotiationStrategy;
};

export type ProposalItemType =
  | "assessoria"
  | "garantia"
  | "defesa_judicial"
  | "negociacao"
  | "parecer_tecnico"
  | "acompanhamento_pagamento"
  | "personalizado";

export type ProposalItem = {
  id: string;
  type: ProposalItemType;
  label: string;
  enabled: boolean;
  amount: number;
  installments: number;
  notes: string;
  internalJustification: string;
};

export type ReceivableType =
  | "setup"
  | "assessoria_mensal"
  | "garantia"
  | "exito"
  | "parecer"
  | "defesa_judicial"
  | "negociacao"
  | "personalizado";

export type ReceivableStatus = "aberto" | "vence_hoje" | "vence_3_dias" | "pago" | "atrasado" | "cancelado";

export type Receivable = {
  id: string;
  type: ReceivableType;
  label: string;
  amount: number;
  dueDate: string;
  status: ReceivableStatus;
  paidAt: string;
  method: string;
  installmentNumber: number;
  totalInstallments: number;
  notes: string;
};

export type PaymentHistoryEntry = {
  id: string;
  receivableId: string;
  amount: number;
  paidAt: string;
  method: string;
  notes: string;
};

export type ClosedDeal = {
  active: boolean;
  closedAt: string;
  totalContracted: number;
  totalReceived: number;
  totalOpen: number;
};

export type CustomOptions = {
  workActs: string[];
  leadOrigins: string[];
  lostReasons: string[];
  documents: string[];
  pendingItems: string[];
  nextSteps: string[];
  risks: string[];
  debtTypes: string[];
  guaranteeTypes: string[];
  collectionTypes: string[];
};

export type ClientProfile = {
  decisionMaker: string;
  financialContact: string;
  businessContext: string;
  objections: string;
  documentsStatus: string;
  relationshipNotes: string;
};

export type FinancialControl = {
  dealStatus: DealStatus;
  potentialSetupFee: number;
  potentialMonthlyFee: number;
  potentialSuccessFee: number;
  expectedCloseDate: string;
  proposalSentAt: string;
  proposalFollowUpDate: string;
  lastClientResponseAt: string;
  lostReason: string;
  lostNotes: string;
  paymentStatus: PaymentStatus;
  paymentDueDate: string;
  paymentAmount: number;
  paymentPaidAt: string;
  workProgress: string;
  workProgressUpdatedAt: string;
  requiredWorkActs: string[];
  executionSheetUrl: string;
  closedDeal: ClosedDeal;
  receivables: Receivable[];
  paymentHistory: PaymentHistoryEntry[];
};

export type LeadCrmData = {
  stage: PipelineStage;
  temperature: LeadTemperature;
  owner: string;
  source: string;
  probability: number;
  nextAction: string;
  nextActionDate: string;
  executiveSummary: string;
  technicalNotes: string;
  marketStrategy: string;
  legalStrategy: string;
  internalReport: string;
  clientReport: string;
  reportUpdatedAt: string;
  reportSettings: ReportSettings;
  fiscalProfile: FiscalProfile;
  proposal: CommercialProposal;
  financial: FinancialControl;
  clientProfile: ClientProfile;
  ruleMessages: RuleLayeredMessage[];
  simulations: SimulationScenario[];
  commercialStrategies: CommercialStrategies;
  customOptions: CustomOptions;
  revenues: RevenueEntry[];
  debts: DebtEntry[];
};

export type LeadCrmInsights = {
  annualRevenue: number;
  monthlyRevenue: number;
  b2bRevenue: number;
  totalDebt: number;
  debtPrincipal: number;
  debtRatio: number;
  estimatedInstallmentMin: number;
  estimatedInstallmentMax: number;
  priorityScore: number;
  headline: string;
  recommendedAction: string;
};

export type AssistedReports = {
  marketStrategy: string;
  legalStrategy: string;
  internalReport: string;
  clientReport: string;
  reportUpdatedAt: string;
};

export type ProposalPackage = Pick<
  CommercialProposal,
  "generatedProposal" | "whatsappMessage" | "proposalUpdatedAt" | "title" | "scope" | "assumptions"
>;

export type InternalAlert = {
  level: "critico" | "alto" | "medio";
  title: string;
  detail: string;
};

const REGIME_LABELS: Record<DiagnosticInput["regimeTributario"], string> = {
  simples: "Simples Nacional",
  presumido: "Lucro Presumido",
  real: "Lucro Real",
  mei: "MEI",
  nao_sei: "regime nao confirmado",
};

const SETOR_LABELS: Record<DiagnosticInput["setor"], string> = {
  comercio: "comercio",
  servicos: "servicos",
  industria: "industria",
  profissional: "atividade profissional",
  saude_educacao_agro: "saude, educacao ou agro",
  imobiliario: "imobiliario",
  financeiro: "financeiro",
  seletivo: "produto sujeito a analise de seletivo",
  nao_sei: "setor nao confirmado",
};

const PROPOSAL_STRATEGY_LABELS: Record<ProposalStrategy, string> = {
  regularizacao: "Regularizacao e negociacao fiscal",
  reforma: "Radar da Reforma Tributaria",
  recuperacao_creditos: "Recuperacao de creditos e ativos fiscais",
  blindagem: "Organizacao fiscal preventiva",
  mista: "Estrategia fiscal integrada",
};

function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(16).slice(2)}-${Date.now()}`;
}

function todayPlus(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function createProposalItem(partial: Partial<ProposalItem> = {}): ProposalItem {
  return {
    id: partial.id ?? makeId("item-proposta"),
    type: partial.type ?? "personalizado",
    label: partial.label ?? "Item personalizado",
    enabled: partial.enabled ?? true,
    amount: partial.amount ?? 0,
    installments: partial.installments ?? 1,
    notes: partial.notes ?? "",
    internalJustification: partial.internalJustification ?? "",
  };
}

export function createReceivable(partial: Partial<Receivable> = {}): Receivable {
  return {
    id: partial.id ?? makeId("recebivel"),
    type: partial.type ?? "personalizado",
    label: partial.label ?? "Recebivel",
    amount: partial.amount ?? 0,
    dueDate: partial.dueDate ?? todayPlus(7),
    status: partial.status ?? "aberto",
    paidAt: partial.paidAt ?? "",
    method: partial.method ?? "",
    installmentNumber: partial.installmentNumber ?? 1,
    totalInstallments: partial.totalInstallments ?? 1,
    notes: partial.notes ?? "",
  };
}

export function buildReceivablesFromProposal(proposal: CommercialProposal, startDate = todayPlus(0)): Receivable[] {
  const receivables: Receivable[] = [];
  const enabledItems = proposal.items.filter((item) => item.enabled && item.amount > 0);

  enabledItems.forEach((item) => {
    const totalInstallments = Math.max(1, Math.round(item.installments || 1));
    const installmentAmount = item.amount / totalInstallments;

    for (let index = 0; index < totalInstallments; index += 1) {
      const due = new Date(`${startDate}T00:00:00`);
      due.setMonth(due.getMonth() + index);
      receivables.push(
        createReceivable({
          type: proposalItemToReceivableType(item.type),
          label: item.label,
          amount: installmentAmount,
          dueDate: due.toISOString().slice(0, 10),
          installmentNumber: index + 1,
          totalInstallments,
          notes: item.notes,
        }),
      );
    }
  });

  if (proposal.setupFee > 0 && !enabledItems.some((item) => item.type === "negociacao")) {
    receivables.push(
      createReceivable({
        type: "setup",
        label: "Setup tecnico",
        amount: proposal.setupFee,
        dueDate: startDate,
      }),
    );
  }

  if (proposal.successFeePercent > 0 && proposal.successFeeBase > 0) {
    receivables.push(
      createReceivable({
        type: "exito",
        label: "Exito estimado",
        amount: proposal.successFeeBase * (proposal.successFeePercent / 100),
        dueDate: todayPlus(30),
        notes: "Exito estimado sujeito a revisao quando o beneficio for validado.",
      }),
    );
  }

  return receivables;
}

function proposalItemToReceivableType(type: ProposalItemType): ReceivableType {
  const map: Record<ProposalItemType, ReceivableType> = {
    assessoria: "assessoria_mensal",
    garantia: "garantia",
    defesa_judicial: "defesa_judicial",
    negociacao: "negociacao",
    parecer_tecnico: "parecer",
    acompanhamento_pagamento: "personalizado",
    personalizado: "personalizado",
  };
  return map[type];
}

function buildDefaultReportSettings(): ReportSettings {
  return {
    communicationTone: "comercial",
    showDetailedTechnicalBasis: false,
  };
}

function buildDefaultRuleMessages(): RuleLayeredMessage[] {
  return [
    {
      id: "rfb-pgfn-strategy",
      level: "internal_only",
      technicalRule:
        "Divida RFB ainda nao inscrita pode depender de remessa/inscricao ou medida tecnica para ampliar negociacao perante PGFN.",
      commercialPositioning:
        "Estrategia de negociacao via Uniao/PGFN para ampliar alternativas de regularizacao conforme analise da situacao de cobranca.",
      clientFacingText:
        "Estrategia de negociacao via Uniao/PGFN, mediante analise da situacao de cobranca e medidas tecnicas cabiveis para ampliar alternativas de regularizacao.",
    },
    {
      id: "discount-cap",
      level: "commercial_assumption",
      technicalRule:
        "Desconto no teto da modalidade depende de classificacao, composicao da divida, edital aplicavel e validacao no REGULARIZE.",
      commercialPositioning:
        "Cenario de potencial maximo para demonstrar economia, previsibilidade e reducao de pressao de caixa.",
      clientFacingText:
        "Cenario potencial estimado, parametrizado pelo teto da modalidade, sujeito a validacao nos canais oficiais.",
    },
    {
      id: "capag-unknown",
      level: "soft_warning",
      technicalRule: "CAPAG desconhecida nao impede simulacao, mas impede conclusao tecnica sobre desconto aplicavel.",
      commercialPositioning:
        "Simular potencial de regularizacao agora e confirmar classificacao no REGULARIZE antes da decisao final.",
      clientFacingText:
        "A classificacao oficial sera validada para confirmar a modalidade e o potencial final de economia.",
    },
  ];
}

function buildDefaultSimulations(debtAmount: number): SimulationScenario[] {
  return [
    {
      id: makeId("sim"),
      type: "manual",
      title: "Negociacao manual",
      enabled: true,
      includeInPdf: false,
      recommended: false,
      debtAmount,
      entryPercent: 10,
      installmentCount: 60,
      discountPercent: 0,
      notes: "Cenario livre para testar composicoes comerciais.",
    },
    {
      id: makeId("sim"),
      type: "capacidade_pagamento",
      title: "Capacidade de pagamento",
      enabled: true,
      includeInPdf: true,
      recommended: true,
      debtAmount,
      entryPercent: 6,
      installmentCount: 114,
      discountPercent: 65,
      notes: "Potencial estimado sujeito a CAPAG e REGULARIZE.",
    },
    {
      id: makeId("sim"),
      type: "pequeno_valor",
      title: "Pequeno valor",
      enabled: false,
      includeInPdf: false,
      recommended: false,
      debtAmount,
      entryPercent: 5,
      installmentCount: 55,
      discountPercent: 30,
      notes: "Habilitar quando o caso se enquadrar no edital.",
    },
    {
      id: makeId("sim"),
      type: "ordinaria",
      title: "Convencional / ordinaria",
      enabled: true,
      includeInPdf: false,
      recommended: false,
      debtAmount,
      entryPercent: 0,
      installmentCount: 60,
      discountPercent: 0,
      notes: "Plano B sem desconto para comparar pressao de caixa.",
    },
    {
      id: makeId("sim"),
      type: "receita_ecac",
      title: "Receita Federal / e-CAC",
      enabled: true,
      includeInPdf: false,
      recommended: false,
      debtAmount,
      entryPercent: 0,
      installmentCount: 60,
      discountPercent: 0,
      notes: "Cenario administrativo quando o debito ainda esta na Receita Federal.",
    },
  ];
}

function buildDefaultCommercialStrategies(debtAmount: number): CommercialStrategies {
  const guaranteeCost = debtAmount * 0.2;
  return {
    judicialDefense: {
      include: false,
      includeGuarantee: false,
      guaranteeCommercialCostPercent: 20,
      guaranteeCommercialCostValue: guaranteeCost,
      guaranteeInstallments: 12,
      guaranteeNominalValue: debtAmount,
      notes:
        "Separar custo comercial de estruturacao da garantia do valor nominal exigido em juizo. Nao afirmar que 20% garante a execucao.",
    },
    negotiation: {
      include: true,
      preferPgfn: true,
      rfbNeedsTechnicalMeasure: false,
      internalTechnicalPath:
        "Quando a divida estiver na Receita, avaliar internamente medida tecnica/judicial para ampliar alternativas perante Uniao/PGFN.",
      clientSafeText:
        "Estrategia de negociacao via Uniao/PGFN, conforme analise da situacao de cobranca e medidas tecnicas cabiveis.",
    },
  };
}

function buildDefaultCustomOptions(): CustomOptions {
  return {
    workActs: [
      "Extratos RFB/PGFN",
      "Certidoes",
      "Execucoes fiscais",
      "Negociacao REGULARIZE",
      "Simulacao de passivo",
      "Analise da reforma",
      "Parecer tecnico",
      "Proposta comercial",
      "Reuniao de fechamento",
      "Acompanhamento de pagamento",
    ],
    leadOrigins: ["Radar publico", "Google Ads", "Indicacao", "WhatsApp", "Reuniao", "Outro"],
    lostReasons: ["Preco", "Timing", "Concorrente", "Sem urgencia", "Sem documentos", "Outro"],
    documents: ["Extrato e-CAC", "Extrato REGULARIZE", "Certidoes", "DCTF", "Contratos", "Processos"],
    pendingItems: ["Enviar documentos", "Validar debito", "Confirmar decisor", "Agendar reuniao"],
    nextSteps: ["Follow-up", "Reuniao tecnica", "Enviar proposta", "Validar pagamento"],
    risks: ["Execucao fiscal", "Bloqueio", "Certidao", "Perda de prazo", "Pressao de caixa"],
    debtTypes: ["RFB", "PGFN", "SEFAZ", "Municipio", "INSS", "Outros"],
    guaranteeTypes: ["Seguro garantia", "Carta fianca", "Deposito", "Bem a penhora", "Outro"],
    collectionTypes: ["Administrativa", "Divida ativa", "Execucao fiscal", "Parcelada", "Suspensa"],
  };
}

export function createRevenueEntry(partial: Partial<RevenueEntry> = {}): RevenueEntry {
  return {
    id: partial.id ?? makeId("receita"),
    label: partial.label ?? "Receita informada",
    amount: partial.amount ?? 0,
    period: partial.period ?? "mensal",
    type: partial.type ?? "receita_bruta",
    marginPercent: partial.marginPercent ?? 15,
    notes: partial.notes ?? "",
  };
}

export function createDebtEntry(partial: Partial<DebtEntry> = {}): DebtEntry {
  return {
    id: partial.id ?? makeId("debito"),
    creditor: partial.creditor ?? "PGFN",
    label: partial.label ?? "Debito fiscal",
    principal: partial.principal ?? 0,
    finesAndInterest: partial.finesAndInterest ?? 0,
    status: partial.status ?? "em_aberto",
    dueDate: partial.dueDate ?? "",
    notes: partial.notes ?? "",
  };
}

function buildDefaultFiscalProfile(input: DiagnosticInput): FiscalProfile {
  return {
    intakeChannel: "site",
    classificationDate: "",
    debtSnapshotDate: "",
    debtClassification:
      input.possuiDividaFiscal === "sim"
        ? "Passivo informado pelo cliente; pendente de validacao em extratos oficiais."
        : "Passivo nao confirmado no radar inicial.",
    transactionImpedimentActive: false,
    judicialExecutionActive: false,
    citationServed: false,
    paymentOrInstallmentPresented: false,
    judicialGuaranteePresented: false,
    judicialRiskNotes: "",
    federalSituation: "",
    stateSituation: "",
    municipalSituation: "",
    certificateStatus: "",
    dctfStatus: "",
    installmentStatus: "",
    exemptionNotes: "",
    legalFramework:
      "Enquadramento juridico/fiscal a validar pelo responsavel tecnico conforme documentos, extratos oficiais e legislacao vigente na data da analise.",
    eligibilityNotes: "",
    negotiationSimulation: "",
    fiscalReadout: "",
    clientSituation: "",
    dataExposureMode: "resumido",
  };
}

function buildDefaultProposal(input: DiagnosticInput): CommercialProposal {
  const baseDebt = getDebtBreakdown(input).total;
  const setupFee = Math.max(3500, Math.round(input.faturamentoMensal * 0.018));
  const monthlyFee = Math.max(1500, Math.round(input.faturamentoMensal * 0.006));
  return {
    strategy: input.possuiDividaFiscal === "sim" ? "regularizacao" : "reforma",
    title: input.possuiDividaFiscal === "sim" ? "Plano de regularizacao fiscal" : "Radar da Reforma Tributaria",
    setupFee,
    monthlyFee,
    successFeePercent: baseDebt > 0 ? 20 : 0,
    successFeeBase: baseDebt,
    estimatedSavings: 0,
    scope: "",
    assumptions: "",
    paymentTerms: "Entrada na contratacao e saldo conforme proposta aprovada.",
    validityDate: todayPlus(7),
    generatedProposal: "",
    whatsappMessage: "",
    proposalUpdatedAt: "",
    items: [
      createProposalItem({
        type: "assessoria",
        label: "Assessoria",
        enabled: true,
        amount: Math.max(1620, monthlyFee),
        installments: 12,
        notes: "Assessoria minima operacional em 12 meses.",
      }),
      createProposalItem({
        type: "negociacao",
        label: "Negociacao",
        enabled: input.possuiDividaFiscal === "sim",
        amount: setupFee,
        installments: 1,
        notes: "Estruturacao da estrategia de regularizacao.",
      }),
      createProposalItem({
        type: "parecer_tecnico",
        label: "Parecer tecnico",
        enabled: false,
        amount: 0,
        installments: 1,
      }),
    ],
  };
}

function buildDefaultClientProfile(): ClientProfile {
  return {
    decisionMaker: "",
    financialContact: "",
    businessContext: "",
    objections: "",
    documentsStatus: "",
    relationshipNotes: "",
  };
}

function buildDefaultFinancialControl(proposal: CommercialProposal): FinancialControl {
  return {
    dealStatus: "lead",
    potentialSetupFee: proposal.setupFee,
    potentialMonthlyFee: proposal.monthlyFee,
    potentialSuccessFee: proposal.successFeeBase * (proposal.successFeePercent / 100),
    expectedCloseDate: todayPlus(7),
    proposalSentAt: "",
    proposalFollowUpDate: "",
    lastClientResponseAt: "",
    lostReason: "",
    lostNotes: "",
    paymentStatus: "nao_iniciado",
    paymentDueDate: "",
    paymentAmount: proposal.setupFee,
    paymentPaidAt: "",
    workProgress: "",
    workProgressUpdatedAt: "",
    requiredWorkActs: [],
    executionSheetUrl: "",
    closedDeal: {
      active: false,
      closedAt: "",
      totalContracted: 0,
      totalReceived: 0,
      totalOpen: 0,
    },
    receivables: [],
    paymentHistory: [],
  };
}

export function buildDefaultCrmData(input: DiagnosticInput): LeadCrmData {
  const annualRevenue = input.faturamentoMensal * 12;
  const b2bRevenue = annualRevenue * (input.percentualB2B / 100);
  const proposal = buildDefaultProposal(input);

  const revenues = [
    createRevenueEntry({
      label: "Faturamento mensal declarado",
      amount: input.faturamentoMensal,
      period: "mensal",
      type: "receita_bruta",
      marginPercent: input.margemPercentual,
    }),
  ];

  if (b2bRevenue > 0) {
    revenues.push(
      createRevenueEntry({
        label: "Receita anual B2B estimada",
        amount: b2bRevenue,
        period: "anual",
        type: "b2b",
        marginPercent: input.margemPercentual,
      }),
    );
  }

  const debt = getDebtBreakdown(input);
  const detailedDebts = [
    debt.uniao > 0
      ? createDebtEntry({
          creditor: "PGFN",
          label: "Debito federal / Uniao",
          principal: debt.uniao,
          status: "em_aberto",
        })
      : null,
    debt.estado > 0
      ? createDebtEntry({
          creditor: "SEFAZ",
          label: "Debito estadual",
          principal: debt.estado,
          status: "em_aberto",
        })
      : null,
    debt.municipio > 0
      ? createDebtEntry({
          creditor: "Municipio",
          label: "Debito municipal",
          principal: debt.municipio,
          status: "em_aberto",
        })
      : null,
    debt.outros > 0
      ? createDebtEntry({
          creditor: "Outros",
          label: "Outros debitos fiscais",
          principal: debt.outros,
          status: "em_aberto",
        })
      : null,
  ].filter(Boolean) as DebtEntry[];

  const debts =
    input.possuiDividaFiscal === "sim" && debt.total > 0
      ? detailedDebts.length > 0
        ? detailedDebts
        : [
            createDebtEntry({
              creditor: "PGFN",
              label: "Divida fiscal estimada no diagnostico",
              principal: debt.total,
              status: "em_aberto",
            }),
          ]
      : [];

  return {
    stage: "diagnostico",
    temperature: input.possuiDividaFiscal === "sim" ? "urgente" : "morno",
    owner: "",
    source: "Radar publico",
    probability: input.possuiDividaFiscal === "sim" ? 65 : 35,
    nextAction: "Agendar conversa consultiva e confirmar dados fiscais.",
    nextActionDate: todayPlus(2),
    executiveSummary:
      "Lead criado a partir do radar. Validar receitas, passivos, certidoes e documentos antes de proposta.",
    technicalNotes: "",
    marketStrategy: "",
    legalStrategy: "",
    internalReport: "",
    clientReport: "",
    reportUpdatedAt: "",
    reportSettings: buildDefaultReportSettings(),
    fiscalProfile: buildDefaultFiscalProfile(input),
    proposal,
    financial: buildDefaultFinancialControl(proposal),
    clientProfile: buildDefaultClientProfile(),
    ruleMessages: buildDefaultRuleMessages(),
    simulations: buildDefaultSimulations(debt.total),
    commercialStrategies: buildDefaultCommercialStrategies(debt.total),
    customOptions: buildDefaultCustomOptions(),
    revenues,
    debts,
  };
}

export function normalizeCrmData(input: DiagnosticInput, crm?: Partial<LeadCrmData> | null): LeadCrmData {
  const defaults = buildDefaultCrmData(input);
  if (!crm) return defaults;

  return {
    ...defaults,
    ...crm,
    probability: Number.isFinite(crm.probability) ? Number(crm.probability) : defaults.probability,
    technicalNotes: crm.technicalNotes ?? defaults.technicalNotes,
    marketStrategy: crm.marketStrategy ?? defaults.marketStrategy,
    legalStrategy: crm.legalStrategy ?? defaults.legalStrategy,
    internalReport: crm.internalReport ?? defaults.internalReport,
    clientReport: crm.clientReport ?? defaults.clientReport,
    reportUpdatedAt: crm.reportUpdatedAt ?? defaults.reportUpdatedAt,
    reportSettings: normalizeReportSettings(defaults.reportSettings, crm.reportSettings),
    fiscalProfile: normalizeFiscalProfile(defaults.fiscalProfile, crm.fiscalProfile),
    proposal: normalizeCommercialProposal(defaults.proposal, crm.proposal),
    financial: normalizeFinancialControl(defaults.financial, crm.financial),
    clientProfile: normalizeClientProfile(defaults.clientProfile, crm.clientProfile),
    ruleMessages: (crm.ruleMessages?.length ? crm.ruleMessages : defaults.ruleMessages).map((item) => ({
      ...item,
      level: item.level ?? "internal_only",
    })),
    simulations: normalizeSimulations(defaults.simulations, crm.simulations),
    commercialStrategies: normalizeCommercialStrategies(defaults.commercialStrategies, crm.commercialStrategies),
    customOptions: normalizeCustomOptions(defaults.customOptions, crm.customOptions),
    revenues: (crm.revenues?.length ? crm.revenues : defaults.revenues).map((item) =>
      createRevenueEntry(item),
    ),
    debts: (crm.debts ?? defaults.debts).map((item) => createDebtEntry(item)),
  };
}

function normalizeReportSettings(defaults: ReportSettings, value?: Partial<ReportSettings>): ReportSettings {
  return {
    ...defaults,
    ...value,
    communicationTone: value?.communicationTone ?? defaults.communicationTone,
    showDetailedTechnicalBasis: value?.showDetailedTechnicalBasis ?? defaults.showDetailedTechnicalBasis,
  };
}

function normalizeClientProfile(defaults: ClientProfile, value?: Partial<ClientProfile>): ClientProfile {
  return {
    ...defaults,
    ...value,
  };
}

function normalizeFinancialControl(defaults: FinancialControl, value?: Partial<FinancialControl>): FinancialControl {
  const receivables = (value?.receivables ?? defaults.receivables).map((item) => createReceivable(item));
  const totalReceived = receivables
    .filter((item) => item.status === "pago")
    .reduce((sum, item) => sum + item.amount, 0);
  const totalContracted = receivables.reduce((sum, item) => sum + item.amount, 0);

  return {
    ...defaults,
    ...value,
    potentialSetupFee: Number.isFinite(value?.potentialSetupFee)
      ? Number(value?.potentialSetupFee)
      : defaults.potentialSetupFee,
    potentialMonthlyFee: Number.isFinite(value?.potentialMonthlyFee)
      ? Number(value?.potentialMonthlyFee)
      : defaults.potentialMonthlyFee,
    potentialSuccessFee: Number.isFinite(value?.potentialSuccessFee)
      ? Number(value?.potentialSuccessFee)
      : defaults.potentialSuccessFee,
    paymentAmount: Number.isFinite(value?.paymentAmount) ? Number(value?.paymentAmount) : defaults.paymentAmount,
    requiredWorkActs: value?.requiredWorkActs ?? defaults.requiredWorkActs,
    closedDeal: {
      ...defaults.closedDeal,
      ...value?.closedDeal,
      totalContracted: totalContracted || value?.closedDeal?.totalContracted || defaults.closedDeal.totalContracted,
      totalReceived: totalReceived || value?.closedDeal?.totalReceived || defaults.closedDeal.totalReceived,
      totalOpen:
        totalContracted || totalReceived
          ? Math.max(0, totalContracted - totalReceived)
          : value?.closedDeal?.totalOpen || defaults.closedDeal.totalOpen,
    },
    receivables,
    paymentHistory: value?.paymentHistory ?? defaults.paymentHistory,
  };
}

function normalizeFiscalProfile(defaults: FiscalProfile, value?: Partial<FiscalProfile>): FiscalProfile {
  return {
    ...defaults,
    ...value,
    intakeChannel: value?.intakeChannel ?? defaults.intakeChannel,
    transactionImpedimentActive: value?.transactionImpedimentActive ?? defaults.transactionImpedimentActive,
    dataExposureMode: value?.dataExposureMode ?? defaults.dataExposureMode,
  };
}

function normalizeCommercialProposal(
  defaults: CommercialProposal,
  value?: Partial<CommercialProposal>,
): CommercialProposal {
  const savedSuccessFee = Number.isFinite(value?.successFeePercent)
    ? Number(value?.successFeePercent)
    : defaults.successFeePercent;
  const successFeePercent =
    savedSuccessFee === 8 && !value?.proposalUpdatedAt ? defaults.successFeePercent : savedSuccessFee;

  return {
    ...defaults,
    ...value,
    strategy: value?.strategy ?? defaults.strategy,
    setupFee: Number.isFinite(value?.setupFee) ? Number(value?.setupFee) : defaults.setupFee,
    monthlyFee: Number.isFinite(value?.monthlyFee) ? Number(value?.monthlyFee) : defaults.monthlyFee,
    successFeePercent,
    successFeeBase: Number.isFinite(value?.successFeeBase)
      ? Number(value?.successFeeBase)
      : defaults.successFeeBase,
    estimatedSavings: Number.isFinite(value?.estimatedSavings)
      ? Number(value?.estimatedSavings)
      : defaults.estimatedSavings,
    items: (value?.items?.length ? value.items : defaults.items).map((item) => createProposalItem(item)),
  };
}

function normalizeSimulations(
  defaults: SimulationScenario[],
  value?: Partial<SimulationScenario>[],
): SimulationScenario[] {
  const source = value?.length ? value : defaults;
  return source.map((item) => ({
    id: item.id ?? makeId("sim"),
    type: item.type ?? "manual",
    title: item.title ?? "Simulacao",
    enabled: item.enabled ?? true,
    includeInPdf: item.includeInPdf ?? false,
    recommended: item.recommended ?? false,
    debtAmount: Number.isFinite(item.debtAmount) ? Number(item.debtAmount) : 0,
    entryPercent: Number.isFinite(item.entryPercent) ? Number(item.entryPercent) : 0,
    installmentCount: Number.isFinite(item.installmentCount) ? Number(item.installmentCount) : 1,
    discountPercent: Number.isFinite(item.discountPercent) ? Number(item.discountPercent) : 0,
    notes: item.notes ?? "",
  }));
}

function normalizeCommercialStrategies(
  defaults: CommercialStrategies,
  value?: Partial<CommercialStrategies>,
): CommercialStrategies {
  return {
    judicialDefense: {
      ...defaults.judicialDefense,
      ...value?.judicialDefense,
    },
    negotiation: {
      ...defaults.negotiation,
      ...value?.negotiation,
    },
  };
}

function normalizeCustomOptions(defaults: CustomOptions, value?: Partial<CustomOptions>): CustomOptions {
  return {
    workActs: value?.workActs?.length ? value.workActs : defaults.workActs,
    leadOrigins: value?.leadOrigins?.length ? value.leadOrigins : defaults.leadOrigins,
    lostReasons: value?.lostReasons?.length ? value.lostReasons : defaults.lostReasons,
    documents: value?.documents?.length ? value.documents : defaults.documents,
    pendingItems: value?.pendingItems?.length ? value.pendingItems : defaults.pendingItems,
    nextSteps: value?.nextSteps?.length ? value.nextSteps : defaults.nextSteps,
    risks: value?.risks?.length ? value.risks : defaults.risks,
    debtTypes: value?.debtTypes?.length ? value.debtTypes : defaults.debtTypes,
    guaranteeTypes: value?.guaranteeTypes?.length ? value.guaranteeTypes : defaults.guaranteeTypes,
    collectionTypes: value?.collectionTypes?.length ? value.collectionTypes : defaults.collectionTypes,
  };
}

export function calculateCrmInsights(crm: LeadCrmData): LeadCrmInsights {
  const annualRevenue = crm.revenues.reduce((sum, item) => {
    const annualized = item.period === "mensal" ? item.amount * 12 : item.amount;
    return sum + annualized;
  }, 0);
  const monthlyRevenue = annualRevenue / 12;
  const b2bRevenue = crm.revenues
    .filter((item) => item.type === "b2b")
    .reduce((sum, item) => sum + (item.period === "mensal" ? item.amount * 12 : item.amount), 0);

  const debtPrincipal = crm.debts.reduce((sum, item) => sum + item.principal, 0);
  const totalDebt = crm.debts.reduce((sum, item) => sum + item.principal + item.finesAndInterest, 0);
  const debtRatio = annualRevenue > 0 ? totalDebt / annualRevenue : 0;
  const estimatedInstallmentMin = totalDebt > 0 ? totalDebt / 145 : 0;
  const estimatedInstallmentMax = totalDebt > 0 ? totalDebt / 60 : 0;

  const urgency =
    crm.temperature === "urgente" ? 34 : crm.temperature === "quente" ? 26 : crm.temperature === "morno" ? 16 : 8;
  const debtWeight = Math.min(34, debtRatio * 100);
  const commercialWeight = Math.min(32, crm.probability * 0.32);
  const priorityScore = Math.round(Math.min(100, urgency + debtWeight + commercialWeight));

  const headline =
    totalDebt > 0
      ? `Passivo mapeado de ${formatNumber(totalDebt)} com peso de ${(debtRatio * 100).toFixed(1)}% da receita anual.`
      : "Lead sem passivo confirmado; foco em reforma tributaria, receita e oportunidade comercial.";

  const recommendedAction =
    totalDebt > 0
      ? "Priorizar extratos RFB/PGFN, certidoes, parcelamentos e desenho de regularizacao."
      : "Validar faturamento, regime e exposicao IBS/CBS antes de proposta.";

  return {
    annualRevenue,
    monthlyRevenue,
    b2bRevenue,
    totalDebt,
    debtPrincipal,
    debtRatio,
    estimatedInstallmentMin,
    estimatedInstallmentMax,
    priorityScore,
    headline,
    recommendedAction,
  };
}

export function buildInternalAlerts(crm: LeadCrmData): InternalAlert[] {
  const alerts: InternalAlert[] = [];
  const financial = crm.financial;
  const today = new Date();

  if (financial.dealStatus === "proposta") {
    const followUpDate = parseDate(financial.proposalFollowUpDate);
    const sentDate = parseDate(financial.proposalSentAt);
    const hasResponse = Boolean(financial.lastClientResponseAt);
    const overdueByFollowUp = followUpDate ? followUpDate < startOfDay(today) : false;
    const overdueBySentDate = sentDate ? daysBetween(sentDate, today) >= 3 : false;

    if (!hasResponse && (overdueByFollowUp || overdueBySentDate)) {
      alerts.push({
        level: "alto",
        title: "Proposta sem resposta",
        detail: "Lead esta em proposta e nao ha resposta registrada. Fazer follow-up e registrar retorno do cliente.",
      });
    }
  }

  const dueDate = parseDate(financial.paymentDueDate);
  if (
    financial.paymentStatus !== "pago" &&
    financial.paymentStatus !== "cancelado" &&
    dueDate &&
    dueDate < startOfDay(today)
  ) {
    alerts.push({
      level: "critico",
      title: "Pagamento atrasado",
      detail: `Pagamento previsto para ${financial.paymentDueDate} esta em aberto. Atualizar cobranca, status e proximo passo.`,
    });
  }

  if (financial.paymentStatus === "atrasado") {
    alerts.push({
      level: "critico",
      title: "Pagamento marcado como atrasado",
      detail: "Status financeiro esta como atrasado. Registrar acao de cobranca ou renegociacao.",
    });
  }

  if (financial.dealStatus === "ganho" && financial.receivables.length === 0) {
    alerts.push({
      level: "critico",
      title: "Negocio ganho sem parcelas criadas",
      detail: "Gerar recebiveis a partir da proposta para controlar vencimentos, pagamentos e inadimplencia.",
    });
  }

  const openReceivables = financial.receivables.filter(
    (item) => item.status !== "pago" && item.status !== "cancelado",
  );
  openReceivables.forEach((receivable) => {
    const receivableDue = parseDate(receivable.dueDate);
    if (!receivableDue) return;
    const diff = daysBetween(today, receivableDue);

    if (diff < 0 || receivable.status === "atrasado") {
      alerts.push({
        level: "critico",
        title: "Recebivel atrasado",
        detail: `${receivable.label} venceu em ${receivable.dueDate}. Valor: ${formatNumber(receivable.amount)}.`,
      });
    } else if (diff === 0) {
      alerts.push({
        level: "alto",
        title: "Pagamento vence hoje",
        detail: `${receivable.label} vence hoje. Valor: ${formatNumber(receivable.amount)}.`,
      });
    } else if (diff <= 3) {
      alerts.push({
        level: "medio",
        title: "Pagamento vence em ate 3 dias",
        detail: `${receivable.label} vence em ${receivable.dueDate}. Valor: ${formatNumber(receivable.amount)}.`,
      });
    }
  });

  const hasCurrentMonthPayment = financial.receivables.some((item) => {
    const paidAt = parseDate(item.paidAt);
    return item.status === "pago" && paidAt && paidAt.getMonth() === today.getMonth() && paidAt.getFullYear() === today.getFullYear();
  });
  if (financial.closedDeal.active && !hasCurrentMonthPayment) {
    alerts.push({
      level: "medio",
      title: "Contrato ativo sem pagamento no mes",
      detail: "Nao ha recebimento registrado neste mes. Validar cobranca, vencimento ou baixa manual.",
    });
  }

  const estimatedSuccess = financial.receivables.some(
    (item) => item.type === "exito" && item.status !== "pago" && item.notes.toLowerCase().includes("estimado"),
  );
  if (estimatedSuccess) {
    alerts.push({
      level: "medio",
      title: "Exito estimado sem revisao",
      detail: "Existe recebivel de exito estimado. Revisar base antes de cobrar ou registrar ganho.",
    });
  }

  if (financial.dealStatus === "ganho" || crm.stage === "cliente") {
    const progressDate = parseDate(financial.workProgressUpdatedAt);
    const staleProgress = !progressDate || daysBetween(progressDate, today) >= 7;
    if (!financial.workProgress.trim() || staleProgress) {
      alerts.push({
        level: "medio",
        title: "Atualizar andamento do trabalho",
        detail: "Caso ativo sem andamento recente. Atualize o campo de andamento para controle interno.",
      });
    }
  }

  return alerts;
}

export function buildAssistedReports(
  input: DiagnosticInput,
  result: DiagnosticResult,
  crm: LeadCrmData,
  insights: LeadCrmInsights,
): AssistedReports {
  const generatedAt = new Date().toLocaleString("pt-BR");
  const marketStrategy = buildMarketStrategy(input, result, crm, insights);
  const legalStrategy = buildLegalStrategy(input, result, insights);
  const manualNotes = crm.technicalNotes.trim() || "Sem insumos manuais/documentais adicionais nesta versao.";
  const judicialRisk = buildJudicialRisk(crm);
  const transactionImpedimentRisk = buildTransactionImpedimentRisk(crm);
  const reformLoss = buildReformInactionLoss(input, result);
  const toneLead = buildToneLead(crm.reportSettings.communicationTone);
  const clientStrategies = buildClientSafeStrategies(crm);
  const internalRules = buildInternalRuleNotes(crm);
  const debtLine =
    insights.totalDebt > 0
      ? `passivo mapeado de ${formatNumber(insights.totalDebt)}`
      : "passivo fiscal ainda nao confirmado";

  const internalReport = [
    `RELATORIO INTERNO - ${input.nomeEmpresa}`,
    "",
    `Gerado em: ${generatedAt}`,
    `Score fiscal: ${result.score}/100 (${result.nivel})`,
    `Prioridade CRM: ${insights.priorityScore}/100 (${crm.temperature})`,
    `Regime/setor: ${REGIME_LABELS[input.regimeTributario]} / ${SETOR_LABELS[input.setor]}`,
    `Receita anual mapeada: ${formatNumber(insights.annualRevenue)}`,
    `Situacao de debitos: ${debtLine}`,
    `Pressao B2B: ${result.pressaoB2B}`,
    "",
    "Leitura comercial:",
    crm.executiveSummary,
    "",
    "Estrategia de mercado:",
    marketStrategy,
    "",
    "Estrategia tecnica e normativa:",
    legalStrategy,
    "",
    "Regras tecnicas internas:",
    internalRules,
    "",
    "Alerta judicial:",
    judicialRisk,
    "",
    "Alerta de impedimento de transacao:",
    transactionImpedimentRisk,
    "",
    "Risco comercial da inacao na reforma:",
    reformLoss,
    "",
    "Insumos manuais/documentais lancados na base:",
    manualNotes,
    "",
    "Riscos relevantes:",
    ...bullets(result.ameacas.slice(0, 5)),
    "",
    "Oportunidades de abordagem:",
    ...bullets(result.oportunidades.slice(0, 5)),
    "",
    "Documentos prioritarios:",
    ...bullets(result.documentos.slice(0, 8)),
    "",
    "Proxima acao:",
    `${crm.nextAction || "Definir proxima acao"} (${crm.nextActionDate || "sem data"})`,
  ].join("\n");

  const clientReport = [
    `PARECER PRELIMINAR - ${input.nomeEmpresa}`,
    "",
    "1. Sintese objetiva",
    toneLead,
    `Com base nas informacoes inicialmente prestadas, o radar atribuiu score ${result.score}/100, classificado como risco ${result.nivel}. A empresa foi enquadrada como ${REGIME_LABELS[input.regimeTributario]} no setor de ${SETOR_LABELS[input.setor]}, com receita anual mapeada de ${formatNumber(insights.annualRevenue)}.`,
    "",
    "2. Pontos de atencao",
    ...bullets(result.ameacas.slice(0, 4)),
    "",
    "3. Oportunidades identificadas",
    ...bullets(result.oportunidades.slice(0, 4)),
    "",
    "4. Direcionamento recomendado",
    insights.recommendedAction,
    "",
    clientStrategies,
    crm.reportSettings.showDetailedTechnicalBasis ? legalStrategy : "",
    "",
    "5. Risco de inacao",
    reformLoss,
    "",
    "6. Alerta judicial, se aplicavel",
    judicialRisk,
    "",
    "7. Alerta de impedimento de transacao, se aplicavel",
    transactionImpedimentRisk,
    "",
    "8. Documentos para evoluir a analise",
    ...bullets(result.documentos.slice(0, 7)),
    "",
    "Notas tecnicas finais:",
    "Simulacao preliminar baseada em informacoes declaradas. A estrategia final depende de extratos, documentos, e-CAC/REGULARIZE e validacao tecnica.",
  ].join("\n");

  return {
    marketStrategy,
    legalStrategy,
    internalReport,
    clientReport,
    reportUpdatedAt: generatedAt,
  };
}

export function buildProposalPackage(
  input: DiagnosticInput,
  result: DiagnosticResult,
  crm: LeadCrmData,
  insights: LeadCrmInsights,
): ProposalPackage {
  const generatedAt = new Date().toLocaleString("pt-BR");
  const proposal = crm.proposal;
  const fiscal = crm.fiscalProfile;
  const strategyLabel = PROPOSAL_STRATEGY_LABELS[proposal.strategy];
  const judicialRisk = buildJudicialRisk(crm);
  const transactionImpedimentRisk = buildTransactionImpedimentRisk(crm);
  const reformLoss = buildReformInactionLoss(input, result);
  const clientStrategies = buildClientSafeStrategies(crm);
  const toneLead = buildToneLead(crm.reportSettings.communicationTone);
  const title = proposal.title.trim() || strategyLabel;
  const scope = proposal.scope.trim() || buildDefaultScope(proposal.strategy, insights);
  const assumptions = proposal.assumptions.trim() || buildDefaultAssumptions(fiscal);
  const debtDisclosure =
    fiscal.dataExposureMode === "completo"
      ? [
          `Passivo fiscal total mapeado: ${formatNumber(insights.totalDebt)}.`,
          `Base para exito/economia: ${formatNumber(proposal.successFeeBase || insights.totalDebt)}.`,
        ].join("\n")
      : "Passivo fiscal relevante mapeado. Valores detalhados devem ser tratados em canal reservado com o cliente.";
  const successLine =
    proposal.successFeePercent > 0
      ? `${proposal.successFeePercent}% sobre economia, reducao, beneficio ou base de exito validada.`
      : "Sem percentual de exito definido nesta versao.";
  const estimatedGain =
    proposal.estimatedSavings > 0
      ? `Economia/beneficio estimado para discussao: ${formatNumber(proposal.estimatedSavings)}.`
      : "Economia/beneficio estimado pendente de validacao documental.";
  const proposalItemLines = proposal.items
    .filter((item) => item.enabled)
    .map((item) => `- ${item.label}: ${formatNumber(item.amount)} em ${item.installments}x${item.notes ? ` (${item.notes})` : ""}`);

  const generatedProposal = [
    `PROPOSTA COMERCIAL - ${input.nomeEmpresa}`,
    "",
    title,
    "",
    "1. Contexto identificado",
    toneLead,
    `O radar inicial apontou score ${result.score}/100 (${result.nivel}) e prioridade comercial ${insights.priorityScore}/100. A empresa possui receita anual mapeada de ${formatNumber(insights.annualRevenue)} e atua em ${SETOR_LABELS[input.setor]}, sob ${REGIME_LABELS[input.regimeTributario]}.`,
    debtDisclosure,
    "",
    "2. Estrategia recomendada",
    strategyLabel,
    clientStrategies,
    crm.reportSettings.showDetailedTechnicalBasis
      ? fiscal.legalFramework || "Enquadramento fiscal a validar conforme documentos e legislacao vigente na data da analise."
      : "",
    crm.reportSettings.showDetailedTechnicalBasis
      ? fiscal.eligibilityNotes || "Elegibilidade e modalidade dependem de extratos oficiais, status dos debitos, certidoes e documentos fiscais."
      : "",
    transactionImpedimentRisk,
    judicialRisk,
    "",
    "3. Escopo sugerido",
    scope,
    "",
    "4. Honorarios e condicoes",
    "Blocos comerciais:",
    ...(proposalItemLines.length ? proposalItemLines : ["- Sem blocos comerciais selecionados."]),
    "",
    `Setup tecnico: ${formatNumber(proposal.setupFee)}`,
    `Mensalidade/acompanhamamento: ${formatNumber(proposal.monthlyFee)}`,
    `Exito: ${successLine}`,
    estimatedGain,
    `Condicoes: ${proposal.paymentTerms || "A definir."}`,
    `Validade: ${proposal.validityDate || "a definir"}`,
    "",
    "5. Premissas e ressalvas",
    assumptions,
    "",
    "6. Consequencia de inacao",
    reformLoss,
    "",
    "Observacao: proposta preliminar sujeita a validacao documental, aprovacao do responsavel tecnico e confirmacao da estrategia escolhida.",
  ].join("\n");

  const whatsappMessage = [
    `Resumo do radar - ${input.nomeEmpresa}`,
    "",
    `Score: ${result.score}/100 (${result.nivel})`,
    `Receita anual mapeada: ${formatNumber(insights.annualRevenue)}`,
    `Estrategia sugerida: ${strategyLabel}`,
    fiscal.dataExposureMode === "completo"
      ? `Passivo mapeado: ${formatNumber(insights.totalDebt)}`
      : "Passivo: mapeado em relatorio reservado",
    "",
    `Proposta: setup de ${formatNumber(proposal.setupFee)} + mensalidade de ${formatNumber(proposal.monthlyFee)}.`,
    proposal.successFeePercent > 0 ? `Exito: ${successLine}` : "",
    "",
    reformLoss,
    "",
    "Proximo passo: validar documentos, confirmar enquadramento e fechar o plano de acao.",
  ]
    .filter(Boolean)
    .join("\n");

  return {
    title,
    scope,
    assumptions,
    generatedProposal,
    whatsappMessage,
    proposalUpdatedAt: generatedAt,
  };
}

function buildMarketStrategy(
  input: DiagnosticInput,
  result: DiagnosticResult,
  crm: LeadCrmData,
  insights: LeadCrmInsights,
) {
  const items: string[] = [];

  if (result.score >= 70 || insights.priorityScore >= 70) {
    items.push("Tratar como lead de alta urgencia: abordagem consultiva direta, com foco em risco concreto, caixa e calendario de decisao.");
  } else if (result.score >= 45) {
    items.push("Conduzir como oportunidade de educacao e diagnostico: mostrar perdas potenciais, riscos de inacao e necessidade de conferencia documental.");
  } else {
    items.push("Manter abordagem preventiva: vender organizacao fiscal, monitoramento e preparacao gradual para a transicao.");
  }

  if (input.percentualB2B >= 40 || result.pressaoB2B !== "baixa") {
    items.push("Explorar argumento competitivo: clientes PJ podem comparar fornecedores pela capacidade de gerar credito e pela previsibilidade fiscal.");
  }

  if (insights.totalDebt > 0) {
    items.push("Abrir conversa por regularizacao: debito, certidao, bancos, contratos e previsibilidade de caixa tendem a ter apelo comercial imediato.");
  }

  if (input.margemPercentual < 12) {
    items.push("Destacar sensibilidade de margem: pequenas variacoes tributarias podem exigir revisao de preco, contrato e mix de clientes.");
  }

  items.push(`Probabilidade comercial atual: ${crm.probability}%. Proxima acao recomendada: ${crm.nextAction || "definir contato consultivo"}.`);

  return bullets(items).join("\n");
}

function buildToneLead(tone: CommunicationTone) {
  const leads: Record<CommunicationTone, string> = {
    conservador:
      "A leitura abaixo organiza riscos e oportunidades com linguagem prudente, preservando validacao tecnica antes de qualquer decisao.",
    tecnico:
      "A analise combina dados declarados, criterios fiscais e premissas tecnicas para estruturar proximos passos de regularizacao e planejamento.",
    comercial:
      "A leitura aponta oportunidades concretas de regularizacao, protecao de caixa e ganho de previsibilidade para a empresa agir antes que o custo da inercia aumente.",
    agressivo_comercial:
      "A empresa precisa tomar as redeas do tema fiscal: inercia pode significar perda de caixa, certidao, credito, margem, poder de negociacao e competitividade.",
  };
  return leads[tone];
}

function buildClientSafeStrategies(crm: LeadCrmData) {
  const items: string[] = [];

  if (crm.commercialStrategies.negotiation.include) {
    items.push(crm.commercialStrategies.negotiation.clientSafeText);
  }

  if (crm.commercialStrategies.judicialDefense.include) {
    items.push(
      "Defesa judicial estrategica para organizar riscos, prazos e medidas de protecao, com custos e providencias definidos em proposta especifica.",
    );
  }

  crm.ruleMessages
    .filter((item) => item.level === "client_safe" || item.level === "commercial_assumption")
    .forEach((item) => items.push(item.clientFacingText));

  return bullets(Array.from(new Set(items))).join("\n");
}

function buildInternalRuleNotes(crm: LeadCrmData) {
  const ruleLines = crm.ruleMessages.map((item) =>
    [
      `[${item.level}] ${item.id}`,
      `Regra tecnica: ${item.technicalRule}`,
      `Posicionamento comercial: ${item.commercialPositioning}`,
      `Texto cliente: ${item.clientFacingText}`,
    ].join("\n"),
  );

  if (crm.commercialStrategies.negotiation.rfbNeedsTechnicalMeasure) {
    ruleLines.push(`Medida tecnica interna para RFB: ${crm.commercialStrategies.negotiation.internalTechnicalPath}`);
  }

  return ruleLines.join("\n\n") || "Sem regras tecnicas adicionais cadastradas.";
}

function buildLegalStrategy(
  input: DiagnosticInput,
  result: DiagnosticResult,
  insights: LeadCrmInsights,
) {
  const items: string[] = [];

  items.push("Usar como base de trabalho a Reforma Tributaria do consumo, com atencao a IBS/CBS, creditamento, transicao operacional e reflexos em precificacao.");

  if (input.regimeTributario === "simples") {
    items.push("Validar impactos do Simples Nacional na cadeia B2B, especialmente capacidade de gerar creditos, opcao operacional e efeito comercial perante clientes PJ.");
  }

  if (insights.totalDebt > 0 || input.possuiDividaFiscal !== "nao") {
    items.push("Separar passivos por origem: RFB, PGFN, SEFAZ, Municipio e INSS. A estrategia depende de extratos oficiais, status de inscricao, parcelamentos e exigibilidade.");
  }

  if (input.possuiCreditoIcms !== "nao") {
    items.push("Checar existencia, origem e aproveitamento de creditos, especialmente ICMS, PIS/Cofins, estoque, NCM, CFOP e escrituracao.");
  }

  if (result.lacunasInformacao.length > 0) {
    items.push(`Antes de conclusao definitiva, sanar lacunas: ${result.lacunasInformacao.join("; ")}.`);
  }

  items.push("Nao emitir conclusao final sem documentos fiscais, certidoes, apuracoes, contratos relevantes e validacao do responsavel tecnico.");

  return bullets(items).join("\n");
}

export function hasTransactionImpediment(crm: LeadCrmData) {
  return crm.fiscalProfile.transactionImpedimentActive;
}

export function buildTransactionImpedimentRisk(crm: LeadCrmData) {
  if (!hasTransactionImpediment(crm)) {
    return "Nao ha impedimento por transacao rescindida marcado na ficha. Confirmar no REGULARIZE antes de fechar a estrategia.";
  }

  return [
    "ALERTA CRITICO: ha impedimento por transacao rescindida/ativa marcado na ficha.",
    "A nova transacao pode estar bloqueada por 2 anos ou depender de revisao especifica no REGULARIZE. Tratar parcelamento ordinario e outras medidas administrativas como plano B imediato.",
    "Nao prometer desconto, alongamento ou transacao sem validar a situacao no sistema oficial.",
  ].join("\n");
}

export function hasCriticalJudicialRisk(crm: LeadCrmData) {
  const fiscal = crm.fiscalProfile;
  return (
    fiscal.judicialExecutionActive &&
    fiscal.citationServed &&
    !fiscal.paymentOrInstallmentPresented &&
    !fiscal.judicialGuaranteePresented
  );
}

export function buildJudicialRisk(crm: LeadCrmData) {
  const fiscal = crm.fiscalProfile;

  if (!fiscal.judicialExecutionActive) {
    return "Nao ha execucao fiscal ativa marcada na ficha. Se houver processo, atualizar este campo antes de enviar relatorio.";
  }

  if (!fiscal.citationServed) {
    return "Existe execucao fiscal ativa marcada, mas a citacao ainda nao foi confirmada. A prioridade e verificar processo, data de citacao e atos pendentes.";
  }

  if (hasCriticalJudicialRisk(crm)) {
    return [
      "ALERTA CRITICO: ha execucao fiscal ativa com citacao confirmada e sem registro de pagamento, parcelamento ou garantia judicial.",
      "Pela Lei de Execucoes Fiscais, o executado e citado para, no prazo de 5 dias, pagar a divida ou garantir a execucao. Sem providencia, o risco pratico envolve constricao patrimonial, bloqueios, penhora e perda de poder de negociacao.",
      fiscal.judicialRiskNotes || "Sem observacao judicial complementar lancada na ficha.",
    ].join("\n");
  }

  return [
    "Execucao fiscal ativa com citacao marcada, mas ja existe providencia registrada na ficha.",
    fiscal.paymentOrInstallmentPresented ? "- Pagamento/parcelamento marcado como apresentado." : "",
    fiscal.judicialGuaranteePresented ? "- Garantia judicial marcada como apresentada." : "",
    fiscal.judicialRiskNotes || "",
  ]
    .filter(Boolean)
    .join("\n");
}

function buildReformInactionLoss(input: DiagnosticInput, result: DiagnosticResult) {
  const lines = [
    `A inacao na Reforma Tributaria pode custar de ${formatNumber(result.precoInacaoMin)} a ${formatNumber(result.precoInacaoMax)} no horizonte estimado pelo radar.`,
    "O prejuizo nao e apenas tributario: pode aparecer em caixa, margem, precificacao, competitividade com clientes PJ, certidoes, bancos e capacidade de negociar com fornecedores.",
  ];

  if (input.regimeTributario === "simples" || input.percentualB2B >= 40) {
    lines.push(
      "Se a empresa vende para PJ, a falta de preparacao pode fazer o cliente comparar fornecedores pela geracao de credito e pela previsibilidade fiscal.",
    );
  }

  lines.push(
    "A mensagem comercial e direta: se a empresa nao tomar as redeas agora, ela pode chegar atrasada na transicao, com menos margem, menos caixa e menos poder de decisao.",
  );

  return lines.join(" ");
}

function buildDefaultScope(strategy: ProposalStrategy, insights: LeadCrmInsights) {
  const common = [
    "- Organizacao da base de informacoes fiscais e comerciais.",
    "- Revisao dos dados do radar, receitas, passivos e documentos prioritarios.",
    "- Emissao de roteiro de providencias e estrategia de abordagem.",
  ];

  if (strategy === "regularizacao" || strategy === "mista") {
    common.push(
      "- Levantamento de debitos por esfera, certidoes, parcelamentos e exigibilidade.",
      "- Simulacao de caminhos de regularizacao conforme enquadramento informado.",
    );
  }

  if (strategy === "reforma" || strategy === "mista") {
    common.push(
      "- Leitura de impacto da Reforma Tributaria na receita, B2B, creditamento e precificacao.",
    );
  }

  if (strategy === "recuperacao_creditos") {
    common.push(
      "- Levantamento preliminar de creditos, documentos fiscais e hipoteses de recuperacao.",
    );
  }

  if (strategy === "blindagem") {
    common.push("- Rotina preventiva para certidoes, documentos fiscais e reducao de risco operacional.");
  }

  if (insights.totalDebt > 0) {
    common.push(`- Passivo de referencia para trabalho: ${formatNumber(insights.totalDebt)}.`);
  }

  return common.join("\n");
}

function buildDefaultAssumptions(fiscal: FiscalProfile) {
  return [
    "- Valores e conclusoes dependem de extratos oficiais e documentos atualizados.",
    "- A modalidade final depende de enquadramento tecnico, regras vigentes e elegibilidade do contribuinte.",
    fiscal.dataExposureMode === "completo"
      ? "- Relatorio autorizado com exposicao completa dos valores mapeados."
      : "- Relatorio comercial em modo resumido, sem detalhamento integral de dados sensiveis.",
    "- Este material nao substitui parecer juridico final sem revisao do responsavel tecnico.",
  ].join("\n");
}

function bullets(items: string[]) {
  return items.map((item) => `- ${item}`);
}

function formatNumber(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

function parseDate(value: string) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function daysBetween(start: Date, end: Date) {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((startOfDay(end).getTime() - startOfDay(start).getTime()) / msPerDay);
}
