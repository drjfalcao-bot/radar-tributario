export type ContributorProfile =
  | "geral"
  | "demais"
  | "pf"
  | "mei"
  | "me_epp"
  | "cooperativa_ensino_osc"
  | "recuperacao_judicial";

export type Capag = "A" | "B" | "C" | "D" | "nao_sei";
export type YesNo = "sim" | "nao";

export type DebtNature = "simples" | "previdenciaria" | "tributaria" | "demais" | "rfb";
export type EligibilityStatus = "elegivel" | "nao_elegivel" | "nao_confirmada";
export type RfbInstallmentSituation =
  | "parcelamento_inicial"
  | "primeiro_reparcelamento"
  | "novo_reparcelamento"
  | "manual";
export type ReducibleBaseMode =
  | "composicao_detalhada"
  | "estimativa_percentual"
  | "estimativa_valor"
  | "nao_informada";

export type DebtComposition = {
  principal?: number;
  juros?: number;
  multas?: number;
  encargos?: number;
  outrosRedutiveis?: number;
  outrosNaoRedutiveis?: number;
};

export type TwoStepStrategyInput = {
  enabled?: boolean;
  currentScenarioId?: string;
  potentialScenarioId?: string;
  valorPagoAteMomento?: number;
  parcelasPagas?: number;
  observacaoEtapa1?: string;
  observacaoEtapa2?: string;
};

export type GuaranteeSimulationInput = {
  enabled?: boolean;
  custoPercentual?: number;
  entradaPercentual?: number;
  mensalidade?: number;
  prazoMeses?: number;
  observacao?: string;
};

export type NegotiationInput = {
  valorRfb: number;
  valorPgfn: number;
  valorPgfnPrevidenciario: number;
  perfilContribuinte: ContributorProfile;
  capag: Capag;
  temImpedimentoTransacaoRescindida: YesNo;
  pequenoValorElegivel: YesNo;
  descontoManualPercentual?: number;
  selicMensalEstimativa?: number;
  rfbParcelamentoSituacao?: RfbInstallmentSituation;
  rfbEntradaManualPercentual?: number;
  rfbEntradaParcelas?: number;
  rfbSaldoParcelas?: number;
  rfbParcelaMinima?: number;
  rfbObservacao?: string;
  pgfnBaseRedutivelModo?: ReducibleBaseMode;
  pgfnComposicao?: DebtComposition;
  pgfnBaseRedutivelPercentualEstimado?: number;
  pgfnBaseRedutivelValorEstimado?: number;
  pgfnOrdinarioEntradaPercentual?: number;
  pgfnOrdinarioEntradaParcelas?: number;
  pgfnOrdinarioSaldoParcelas?: number;
  pgfnOrdinarioParcelaMinima?: number;
  transacaoEntradaPercentual?: number;
  transacaoEntradaParcelas?: number;
  transacaoSaldoParcelas?: number;
  transacaoDescontoPercentual?: number;
  simularRevisaoCapag?: boolean;
  capagProjetada?: Capag;
  reducaoHipoteticaCapagPercentual?: number;
  fundamentoRevisaoCapag?: string;
  simplificadaEntradaPercentual?: number;
  simplificadaEntradaParcelas?: number;
  simplificadaSaldoParcelas?: number;
  simplificadaDescontoPercentual?: number;
  pequenoValorEntradaPercentual?: number;
  pequenoValorEntradaParcelas?: number;
  estrategiaDuasEtapas?: TwoStepStrategyInput;
  garantia?: GuaranteeSimulationInput;
};

export type NatureResult = {
  nature: DebtNature;
  label: string;
  originalDebt: number;
  reducibleBase: number;
  appliedDiscountPercent: number;
  referenceDiscountCap: number;
  discountValue: number;
  balanceAfterDiscount: number;
  entryTotal: number;
  entryInstallments: number;
  entryInstallmentValue: number;
  financedBalance: number;
  balanceMonths: number;
  balanceInstallment: number;
  totalProjected: number;
  eligibility: EligibilityStatus;
  eligibilityReasons: string[];
  alerts: string[];
};

export type NegotiationScenario = {
  id: string;
  title: string;
  appliesTo: string;
  enabled: boolean;
  debt: number;
  entryPercent: number;
  entryTotal: number;
  entryInstallments: number;
  entryInstallmentValue: number;
  balanceMonths: number;
  discountPercent: number;
  discountValue: number;
  negotiatedBalance: number;
  balanceInstallment: number;
  minimumInstallment: number;
  totalNegotiated: number;
  estimatedSavings: number;
  referenceDiscountCap: number;
  reducibleBase: number;
  eligibility: EligibilityStatus;
  eligibilityReasons: string[];
  natureResults: NatureResult[];
  notes: string[];
  alerts: string[];
};

export type TwoStepStrategyResult = {
  enabled: boolean;
  currentScenarioId?: string;
  potentialScenarioId?: string;
  amountAlreadyPaid: number;
  currentProjectedTotal: number;
  potentialProjectedTotalAfterPayments: number;
  potentialSavings: number;
  alerts: string[];
};

export type NegotiationSummary = {
  originalDebt: number;
  estimatedReduction: number;
  negotiatedBalance: number;
  potentialSavings: number;
  potentialSavingsPercent: number;
};

export type NegotiationResult = {
  scenarios: NegotiationScenario[];
  mandatoryAlerts: string[];
  pgfnTotal: number;
  transactionDiscountCap: number;
  natureResults: NatureResult[];
  summary: NegotiationSummary;
  currentScenario?: NegotiationScenario;
  potentialScenario?: NegotiationScenario;
  twoStepStrategy?: TwoStepStrategyResult;
};

const FAVORED_PROFILES: ContributorProfile[] = [
  "pf",
  "mei",
  "me_epp",
  "cooperativa_ensino_osc",
  "recuperacao_judicial",
];

const PROFILE_RULES: Record<ContributorProfile, { label: string; transactionCap: number; favored: boolean }> = {
  geral: { label: "Pessoa juridica geral", transactionCap: 0.65, favored: false },
  demais: { label: "Outro perfil parametrizavel", transactionCap: 0.65, favored: false },
  pf: { label: "Pessoa fisica", transactionCap: 0.7, favored: true },
  mei: { label: "MEI", transactionCap: 0.7, favored: true },
  me_epp: { label: "Microempresa / EPP", transactionCap: 0.7, favored: true },
  cooperativa_ensino_osc: { label: "Cooperativa / ensino / OSC", transactionCap: 0.7, favored: true },
  recuperacao_judicial: { label: "Recuperacao judicial", transactionCap: 0.7, favored: true },
};

function money(value: number | undefined) {
  return Number.isFinite(value) ? Math.max(0, Number(value)) : 0;
}

function months(value: number | undefined, fallback: number) {
  const numeric = Number.isFinite(value) ? Number(value) : fallback;
  return Math.max(1, Math.round(numeric > 0 ? numeric : fallback));
}

function percentWithDefault(value: number | undefined, fallbackPercent: number, maxPercent = 100) {
  const raw = Number.isFinite(value) ? Number(value) : fallbackPercent;
  return Math.min(Math.max(0, raw), maxPercent) / 100;
}

function percent(value?: number) {
  return Number.isFinite(value) ? Math.max(0, Number(value)) / 100 : 0;
}

function pmt(principal: number, monthsCount: number, monthlyRate: number) {
  if (principal <= 0 || monthsCount <= 0) return 0;
  if (monthlyRate <= 0) return principal / monthsCount;
  return (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -monthsCount));
}

function isFavored(profile: ContributorProfile) {
  return FAVORED_PROFILES.includes(profile);
}

function pgfnTransactionMinimumInstallment(profile: ContributorProfile) {
  return profile === "mei" ? 25 : 100;
}

function pgfnOrdinaryMinimumInstallment(profile: ContributorProfile) {
  if (profile === "pf") return 100;
  if (profile === "mei" || profile === "me_epp") return 300;
  return 500;
}

function rfbMinimumInstallment(profile: ContributorProfile) {
  return profile === "pf" ? 200 : 500;
}

function transactionCap(profile: ContributorProfile) {
  return PROFILE_RULES[profile]?.transactionCap ?? 0.65;
}

export function calculateReducibleBase(input: NegotiationInput, totalDebt: number) {
  const mode = input.pgfnBaseRedutivelModo ?? "nao_informada";
  const alerts: string[] = [];
  let base = 0;

  if (mode === "composicao_detalhada") {
    const composition = input.pgfnComposicao ?? {};
    base =
      money(composition.juros) +
      money(composition.multas) +
      money(composition.encargos) +
      money(composition.outrosRedutiveis);
  } else if (mode === "estimativa_percentual") {
    base = totalDebt * percent(input.pgfnBaseRedutivelPercentualEstimado);
  } else if (mode === "estimativa_valor") {
    base = money(input.pgfnBaseRedutivelValorEstimado);
  } else {
    alerts.push(
      "Composicao do debito nao informada. A reducao apresentada depende da base redutivel efetivamente existente.",
    );
  }

  return { base: Math.min(money(totalDebt), money(base)), alerts };
}

function selectedCapagDiscount(input: NegotiationInput, fallback?: number) {
  const cap = transactionCap(input.perfilContribuinte);
  if (input.capag === "A" || input.capag === "B" || input.capag === "nao_sei") return 0;
  const configured = Number.isFinite(input.transacaoDescontoPercentual)
    ? input.transacaoDescontoPercentual
    : input.descontoManualPercentual ?? fallback;
  return percentWithDefault(configured, 0, cap * 100);
}

function selectedSimplifiedDiscount(input: NegotiationInput) {
  const cap = transactionCap(input.perfilContribuinte);
  if (input.capag === "A" || input.capag === "B" || input.capag === "nao_sei") return 0;
  return percentWithDefault(input.simplificadaDescontoPercentual, 0, cap * 100);
}

function buildNatureResult({
  nature,
  label,
  debt,
  reducibleBase,
  entryPercent,
  entryInstallments,
  balanceMonths,
  discountPercent,
  referenceDiscountCap,
  minimumInstallment,
  selicMonthly,
  eligibility,
  eligibilityReasons,
  alerts,
}: {
  nature: DebtNature;
  label: string;
  debt: number;
  reducibleBase: number;
  entryPercent: number;
  entryInstallments: number;
  balanceMonths: number;
  discountPercent: number;
  referenceDiscountCap: number;
  minimumInstallment: number;
  selicMonthly: number;
  eligibility: EligibilityStatus;
  eligibilityReasons: string[];
  alerts: string[];
}): NatureResult {
  const originalDebt = money(debt);
  const safeEntryPercent = Math.min(Math.max(0, entryPercent), 1);
  const safeDiscountPercent = Math.min(Math.max(0, discountPercent), referenceDiscountCap);
  const entryTotal = originalDebt * safeEntryPercent;
  const entryInstallmentCount = Math.max(1, Math.round(entryInstallments));
  const baseAfterEntry = Math.max(0, originalDebt - entryTotal);
  const effectiveReducibleBase = Math.min(baseAfterEntry, money(reducibleBase));
  const discountValue = Math.min(effectiveReducibleBase, effectiveReducibleBase * safeDiscountPercent);
  const balanceAfterDiscount = Math.max(0, baseAfterEntry - discountValue);
  const balanceMonthCount = Math.max(1, Math.round(balanceMonths));
  const calculatedInstallment = pmt(balanceAfterDiscount, balanceMonthCount, selicMonthly);
  const balanceInstallment = Math.max(calculatedInstallment, money(minimumInstallment));
  const totalProjected = entryTotal + balanceInstallment * balanceMonthCount;

  return {
    nature,
    label,
    originalDebt,
    reducibleBase: effectiveReducibleBase,
    appliedDiscountPercent: safeDiscountPercent,
    referenceDiscountCap,
    discountValue,
    balanceAfterDiscount,
    entryTotal,
    entryInstallments: entryInstallmentCount,
    entryInstallmentValue: entryTotal / entryInstallmentCount,
    financedBalance: balanceAfterDiscount,
    balanceMonths: balanceMonthCount,
    balanceInstallment,
    totalProjected,
    eligibility,
    eligibilityReasons,
    alerts,
  };
}

function scenarioFromNature({
  id,
  title,
  appliesTo,
  enabled,
  nature,
  minimumInstallment,
  notes,
}: {
  id: string;
  title: string;
  appliesTo: string;
  enabled?: boolean;
  nature: NatureResult;
  minimumInstallment: number;
  notes: string[];
}): NegotiationScenario {
  return {
    id,
    title,
    appliesTo,
    enabled: Boolean(enabled ?? true) && nature.originalDebt > 0 && nature.eligibility !== "nao_elegivel",
    debt: nature.originalDebt,
    entryPercent: nature.originalDebt > 0 ? nature.entryTotal / nature.originalDebt : 0,
    entryTotal: nature.entryTotal,
    entryInstallments: nature.entryInstallments,
    entryInstallmentValue: nature.entryInstallmentValue,
    balanceMonths: nature.balanceMonths,
    discountPercent: nature.appliedDiscountPercent,
    discountValue: nature.discountValue,
    negotiatedBalance: nature.balanceAfterDiscount,
    balanceInstallment: nature.balanceInstallment,
    minimumInstallment: money(minimumInstallment),
    totalNegotiated: nature.totalProjected,
    estimatedSavings: nature.originalDebt - nature.totalProjected,
    referenceDiscountCap: nature.referenceDiscountCap,
    reducibleBase: nature.reducibleBase,
    eligibility: nature.eligibility,
    eligibilityReasons: nature.eligibilityReasons,
    natureResults: [nature],
    notes,
    alerts: nature.alerts,
  };
}

function rfbParameters(input: NegotiationInput) {
  const situation = input.rfbParcelamentoSituacao ?? "parcelamento_inicial";
  if (situation === "primeiro_reparcelamento") return { entryPercent: 0.1, entryInstallments: 1, balanceMonths: 60 };
  if (situation === "novo_reparcelamento") return { entryPercent: 0.2, entryInstallments: 1, balanceMonths: 60 };
  if (situation === "manual") {
    return {
      entryPercent: percentWithDefault(input.rfbEntradaManualPercentual, 0),
      entryInstallments: months(input.rfbEntradaParcelas, 1),
      balanceMonths: months(input.rfbSaldoParcelas, 60),
    };
  }
  return { entryPercent: 0, entryInstallments: 1, balanceMonths: months(input.rfbSaldoParcelas, 60) };
}

function capagAlerts(input: NegotiationInput) {
  if (input.capag === "nao_sei") return ["CAPAG nao informada: consultar enquadramento antes de estimar reducao."];
  if (input.capag === "A" || input.capag === "B") {
    return ["CAPAG A/B: reducao aplicada por padrao igual a 0%; nao assumir desconto automatico."];
  }
  return [];
}

function calculateTwoStepStrategy(input: NegotiationInput, scenarios: NegotiationScenario[]): TwoStepStrategyResult | undefined {
  const strategy = input.estrategiaDuasEtapas;
  if (!strategy?.enabled) return undefined;
  const current = scenarios.find((scenario) => scenario.id === strategy.currentScenarioId) ?? scenarios[0];
  const potential =
    scenarios.find((scenario) => scenario.id === strategy.potentialScenarioId) ??
    scenarios.find((scenario) => scenario.id !== current?.id && scenario.discountValue > 0);
  const amountAlreadyPaid = money(strategy.valorPagoAteMomento);
  const currentProjectedTotal = current?.totalNegotiated ?? 0;
  const potentialRawTotal = potential?.totalNegotiated ?? currentProjectedTotal;
  const potentialProjectedTotalAfterPayments = Math.max(0, potentialRawTotal - amountAlreadyPaid);
  return {
    enabled: true,
    currentScenarioId: current?.id,
    potentialScenarioId: potential?.id,
    amountAlreadyPaid,
    currentProjectedTotal,
    potentialProjectedTotalAfterPayments,
    potentialSavings: Math.max(0, currentProjectedTotal - amountAlreadyPaid - potentialProjectedTotalAfterPayments),
    alerts: [
      "Estrategia em duas etapas e hipotetica; pagamentos da etapa 1 foram abatidos para evitar dupla contagem.",
      "Boa-fe, adimplencia ou revisao de CAPAG nao removem impedimento automaticamente.",
    ],
  };
}

export function validateNegotiationInput(input: NegotiationInput): string[] {
  const warnings: string[] = [];
  if ((input.valorPgfn > 0 || input.valorPgfnPrevidenciario > 0) && !input.pgfnBaseRedutivelModo) {
    warnings.push("Informe o modo da base redutivel para simular reducao de PGFN.");
  }
  if (input.simularRevisaoCapag && (!input.capagProjetada || !input.reducaoHipoteticaCapagPercentual)) {
    warnings.push("Revisao de CAPAG exige CAPAG projetada e percentual hipotetico.");
  }
  return warnings;
}

export function calculateNegotiation(input: NegotiationInput): NegotiationResult {
  const valorRfb = money(input.valorRfb);
  const valorPgfn = money(input.valorPgfn);
  const valorPgfnPrevidenciario = money(input.valorPgfnPrevidenciario);
  const pgfnTotal = valorPgfn + valorPgfnPrevidenciario;
  const favored = isFavored(input.perfilContribuinte);
  const hasPrevidenciario = valorPgfnPrevidenciario > 0;
  const selicMonthly = percent(input.selicMensalEstimativa);
  const transactionBlocked = input.temImpedimentoTransacaoRescindida === "sim";
  const overAdhesionLimit = pgfnTotal > 45_000_000;
  const cap = transactionCap(input.perfilContribuinte);
  const reducible = calculateReducibleBase(input, pgfnTotal);
  const defaultEntryMonths = favored ? 12 : 6;
  const defaultBalanceMonths = favored ? 133 : 114;
  const transactionEntryMonths = months(input.transacaoEntradaParcelas, defaultEntryMonths);
  const transactionBalanceMonths = hasPrevidenciario
    ? Math.max(1, Math.min(months(input.transacaoSaldoParcelas, defaultBalanceMonths), 60 - transactionEntryMonths))
    : months(input.transacaoSaldoParcelas, defaultBalanceMonths);
  const rfb = rfbParameters(input);

  const mandatoryAlerts = [
    "Simulacao preliminar; confirmar no e-CAC/REGULARIZE.",
    "Reducao limitada a base redutivel informada; principal nao recebe reducao automatica.",
    transactionBlocked
      ? "ALERTA CRITICO: transacao pode estar bloqueada por 2 anos; simular parcelamento ordinario como plano B."
      : "",
    hasPrevidenciario ? "Prazo previdenciario limitado a 60 meses." : "",
    overAdhesionLimit ? "Avaliar transacao individual, nao adesao automatica." : "",
    ...validateNegotiationInput(input),
  ].filter(Boolean);

  const rfbNature = buildNatureResult({
    nature: "rfb",
    label: "Receita Federal",
    debt: valorRfb,
    reducibleBase: 0,
    entryPercent: rfb.entryPercent,
    entryInstallments: rfb.entryInstallments,
    balanceMonths: rfb.balanceMonths,
    discountPercent: 0,
    referenceDiscountCap: 0,
    minimumInstallment: money(input.rfbParcelaMinima) || rfbMinimumInstallment(input.perfilContribuinte),
    selicMonthly,
    eligibility: valorRfb > 0 ? "nao_confirmada" : "nao_elegivel",
    eligibilityReasons: ["Parcelamento RFB depende de consolidacao e regras do e-CAC."],
    alerts: [
      input.rfbParcelamentoSituacao === "parcelamento_inicial" || !input.rfbParcelamentoSituacao
        ? "Parcelamento inicial RFB sem entrada adicional; primeira parcela normal nao e entrada."
        : "",
      input.rfbObservacao ?? "",
      "Nao aplicar desconto automatico a debito RFB.",
    ].filter(Boolean),
  });

  const ordinaryNature = buildNatureResult({
    nature: "demais",
    label: "PGFN ordinario",
    debt: pgfnTotal,
    reducibleBase: 0,
    entryPercent: percentWithDefault(input.pgfnOrdinarioEntradaPercentual, 0),
    entryInstallments: months(input.pgfnOrdinarioEntradaParcelas, 1),
    balanceMonths: months(input.pgfnOrdinarioSaldoParcelas, 60),
    discountPercent: 0,
    referenceDiscountCap: 0,
    minimumInstallment: money(input.pgfnOrdinarioParcelaMinima) || pgfnOrdinaryMinimumInstallment(input.perfilContribuinte),
    selicMonthly,
    eligibility: pgfnTotal > 0 ? "nao_confirmada" : "nao_elegivel",
    eligibilityReasons: ["Plano sem reducao para comparacao e uso quando transacao nao estiver disponivel."],
    alerts: transactionBlocked
      ? ["Transacao pode estar bloqueada por rescissao; parcelamento ordinario deve ser tratado como plano B imediato."]
      : [],
  });

  const capagNature = buildNatureResult({
    nature: "tributaria",
    label: "PGFN CAPAG",
    debt: pgfnTotal,
    reducibleBase: reducible.base,
    entryPercent: percentWithDefault(input.transacaoEntradaPercentual, 6),
    entryInstallments: transactionEntryMonths,
    balanceMonths: transactionBalanceMonths,
    discountPercent: selectedCapagDiscount(input),
    referenceDiscountCap: cap,
    minimumInstallment: pgfnTransactionMinimumInstallment(input.perfilContribuinte),
    selicMonthly,
    eligibility: transactionBlocked || overAdhesionLimit ? "nao_elegivel" : pgfnTotal > 0 ? "nao_confirmada" : "nao_elegivel",
    eligibilityReasons: [
      "Elegibilidade depende de edital, inscricao, CAPAG, impedimentos, valor consolidado e validacao no REGULARIZE.",
    ],
    alerts: [
      ...capagAlerts(input),
      ...reducible.alerts,
      transactionBlocked ? "Cenario bloqueado: ha impedimento informado por transacao rescindida." : "",
      overAdhesionLimit ? "Cenario bloqueado para adesao automatica: valor PGFN acima de R$ 45 milhoes." : "",
      hasPrevidenciario ? "Prazo total limitado a 60 meses por debito previdenciario." : "",
    ].filter(Boolean),
  });

  const simplifiedNature = buildNatureResult({
    nature: "tributaria",
    label: "PGFN TIS",
    debt: pgfnTotal,
    reducibleBase: reducible.base,
    entryPercent: percentWithDefault(input.simplificadaEntradaPercentual, 10),
    entryInstallments: months(input.simplificadaEntradaParcelas, 1),
    balanceMonths: months(input.simplificadaSaldoParcelas, 60),
    discountPercent: selectedSimplifiedDiscount(input),
    referenceDiscountCap: cap,
    minimumInstallment: pgfnTransactionMinimumInstallment(input.perfilContribuinte),
    selicMonthly,
    eligibility:
      pgfnTotal > 1_000_000 && pgfnTotal < 10_000_000 && !transactionBlocked ? "nao_confirmada" : "nao_elegivel",
    eligibilityReasons: [
      pgfnTotal > 1_000_000 && pgfnTotal < 10_000_000
        ? "Faixa de valor indicativa atendida; demais criterios seguem pendentes."
        : "TIS exige validacao por multiplos criterios, nao apenas valor.",
    ],
    alerts: [...capagAlerts(input), ...reducible.alerts],
  });

  const smallValueNature = buildNatureResult({
    nature: "simples",
    label: "PGFN pequeno valor",
    debt: pgfnTotal,
    reducibleBase: reducible.base,
    entryPercent: percentWithDefault(input.pequenoValorEntradaPercentual, 5),
    entryInstallments: months(input.pequenoValorEntradaParcelas, 5),
    balanceMonths: 55,
    discountPercent: input.pequenoValorElegivel === "sim" ? percentWithDefault(30, 30, 50) : 0,
    referenceDiscountCap: 0.5,
    minimumInstallment: pgfnTransactionMinimumInstallment(input.perfilContribuinte),
    selicMonthly,
    eligibility: input.pequenoValorElegivel === "sim" && pgfnTotal > 0 ? "nao_confirmada" : "nao_elegivel",
    eligibilityReasons: [
      input.pequenoValorElegivel === "sim"
        ? "Pequeno valor marcado como elegivel; validar perfil, valor, natureza, data de inscricao e edital."
        : "Pequeno valor nao marcado como elegivel.",
    ],
    alerts: [...reducible.alerts, "Modalidade de pequeno valor depende de criterios do edital aplicavel."],
  });

  const scenarios = [
    scenarioFromNature({
      id: "rfb-ordinario",
      title: "RFB - parcelamento administrativo",
      appliesTo: "Debito ainda nao inscrito em divida ativa",
      nature: rfbNature,
      minimumInstallment: money(input.rfbParcelaMinima) || rfbMinimumInstallment(input.perfilContribuinte),
      notes: ["Sem desconto.", "Primeira parcela normal nao e tratada como entrada no parcelamento inicial."],
    }),
    scenarioFromNature({
      id: "pgfn-ordinario",
      title: "PGFN - parcelamento comum/ordinario",
      appliesTo: "Divida ativa da Uniao",
      nature: ordinaryNature,
      minimumInstallment: money(input.pgfnOrdinarioParcelaMinima) || pgfnOrdinaryMinimumInstallment(input.perfilContribuinte),
      notes: ["Sem desconto.", "Plano B quando nao houver transacao disponivel ou houver impedimento."],
    }),
    scenarioFromNature({
      id: "pgfn-capag",
      title: "PGFN - transacao por capacidade de pagamento",
      appliesTo: "Divida ativa PGFN conforme CAPAG",
      enabled: !transactionBlocked && !overAdhesionLimit,
      nature: capagNature,
      minimumInstallment: pgfnTransactionMinimumInstallment(input.perfilContribuinte),
      notes: [
        "Teto de referencia separado da reducao efetivamente aplicada.",
        "CAPAG A/B e nao informada ficam sem reducao automatica.",
      ],
    }),
    scenarioFromNature({
      id: "pgfn-simplificada",
      title: "PGFN/Uniao - transacao individual simplificada",
      appliesTo: "Proposta simplificada no REGULARIZE",
      enabled: !transactionBlocked,
      nature: simplifiedNature,
      minimumInstallment: pgfnTransactionMinimumInstallment(input.perfilContribuinte),
      notes: ["TIS mantida como cenario parametrizavel com elegibilidade nao confirmada ate validacao completa."],
    }),
    scenarioFromNature({
      id: "pgfn-pequeno-valor",
      title: "PGFN - pequeno valor",
      appliesTo: "Pequeno valor conforme edital aplicavel",
      enabled: input.pequenoValorElegivel === "sim",
      nature: smallValueNature,
      minimumInstallment: pgfnTransactionMinimumInstallment(input.perfilContribuinte),
      notes: ["Cenario parametrizavel mantido separado das demais modalidades e sujeito a validacao de elegibilidade."],
    }),
  ];

  const enabledScenarios = scenarios.filter((scenario) => scenario.enabled);
  const currentScenario = enabledScenarios.find((scenario) => scenario.discountValue === 0) ?? enabledScenarios[0];
  const potentialScenario =
    enabledScenarios
      .filter((scenario) => scenario.id !== currentScenario?.id)
      .sort((a, b) => b.discountValue - a.discountValue)[0] ?? currentScenario;
  const natureResults = potentialScenario?.natureResults ?? [rfbNature, capagNature].filter((item) => item.originalDebt > 0);
  const summary: NegotiationSummary = {
    originalDebt: natureResults.reduce((sum, item) => sum + item.originalDebt, 0),
    estimatedReduction: natureResults.reduce((sum, item) => sum + item.discountValue, 0),
    negotiatedBalance: natureResults.reduce((sum, item) => sum + item.balanceAfterDiscount, 0),
    potentialSavings: currentScenario && potentialScenario ? Math.max(0, currentScenario.totalNegotiated - potentialScenario.totalNegotiated) : 0,
    potentialSavingsPercent:
      currentScenario && potentialScenario && currentScenario.totalNegotiated > 0
        ? Math.max(0, (currentScenario.totalNegotiated - potentialScenario.totalNegotiated) / currentScenario.totalNegotiated)
        : 0,
  };

  return {
    scenarios,
    mandatoryAlerts,
    pgfnTotal,
    transactionDiscountCap: cap,
    natureResults,
    summary,
    currentScenario,
    potentialScenario,
    twoStepStrategy: calculateTwoStepStrategy(input, scenarios),
  };
}
