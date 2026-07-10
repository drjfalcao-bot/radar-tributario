export type CompanySize = "mei" | "me" | "epp" | "demais";
export type CapagClass = "A" | "B" | "C" | "D" | "nao_informada";
export type YesNoUnknown = "sim" | "nao" | "nao_sei";
export type RfbSituation = "inicial" | "primeiro_reparcelamento" | "reparcelamento_anterior" | "nao_sei";
export type SimulatorMode = "automatico" | "capag" | "tis" | "ordinario" | "individual";
export type ResolvedMode = "sem_divida" | "capag" | "tis" | "ordinario" | "individual";
export type DebtNatureKey = "simples" | "previdenciaria" | "tributaria" | "demais";

export type NatureParameters = {
  amount: number;
  reducibleBasePercent: number;
  discountPercent: number;
  entryPercent: number;
  entryInstallments: number;
  totalMonths: number;
};

export type PassivoSimulatorInput = {
  companyName: string;
  cnpj: string;
  companySize: CompanySize;
  capag: CapagClass;
  impediment: YesNoUnknown;
  executionActive: YesNoUnknown;
  seizureIdentified: YesNoUnknown;
  mode: SimulatorMode;
  simulateStrategicReview: boolean;
  advancedOverrides: boolean;
  pgfn: Record<DebtNatureKey, NatureParameters>;
  rfbAmount: number;
  rfbSituation: RfbSituation;
  rfbInstallments: number;
  guaranteeAnnualCostPercent: number;
};

export type NatureCalculation = {
  key: DebtNatureKey;
  label: string;
  original: number;
  reducibleBase: number;
  discountPercent: number;
  reduction: number;
  entryPercent: number;
  entryTotal: number;
  entryInstallments: number;
  entryInstallmentValue: number;
  balance: number;
  balanceMonths: number;
  balanceInstallmentValue: number;
  totalMonths: number;
  totalNegotiated: number;
  minimumInstallment: number;
};

export type ScenarioCalculation = {
  id: "atual" | "atingivel";
  title: string;
  subtitle: string;
  mode: ResolvedMode;
  natureResults: NatureCalculation[];
  original: number;
  reduction: number;
  entryTotal: number;
  entryInstallmentValue: number;
  entryInstallments: number;
  balance: number;
  balanceMonths: number;
  averageBalanceInstallment: number;
  totalNegotiated: number;
  savingsPercent: number;
};

export type RfbCalculation = {
  original: number;
  situation: RfbSituation;
  firstInstallmentPercent: number;
  firstInstallment: number;
  balance: number;
  balanceInstallments: number;
  balanceInstallmentValue: number;
  totalInstallments: number;
  minimumInstallment: number;
  totalNominal: number;
  note: string;
};

export type PassivoSimulatorResult = {
  resolvedMode: ResolvedMode;
  resolvedModeLabel: string;
  availableNow: boolean;
  requiresTwoStepStrategy: boolean;
  smallValueCandidate: boolean;
  pgfnTotal: number;
  currentScenario: ScenarioCalculation;
  attainableScenario: ScenarioCalculation;
  rfb: RfbCalculation;
  potentialSavings: number;
  potentialSavingsPercent: number;
  guarantee: {
    suggestedCoverage: number;
    annualCostPercent: number;
    estimatedAnnualCost: number;
    note: string;
  };
  tis: { valueRangeEligible: boolean; statusLabel: string; note: string };
  alerts: string[];
};

export const PASSIVO_RULES = {
  version: "2026-07-10",
  sources: {
    pgfnCapag: "https://www.gov.br/pgfn/pt-br/servicos/orientacoes-contribuintes/acordo-de-transacao/edital-no-6-2026/transacao-conforme-a-capacidade-de-pagamento-edital-ndeg-06-2026",
    tis: "https://www.gov.br/pgfn/pt-br/servicos/orientacoes-contribuintes/acordo-de-transacao/transacao-individual-simplificada",
    rfb: "https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria/pagamentos-e-parcelamentos/parcelamentos/parcelamento-nao-previdenciario-acesso-via-portal-e-cac",
  },
  pgfn: {
    adhesionLimit: 45_000_000,
    entryPercent: 6,
    entryInstallmentsGeneral: 6,
    entryInstallmentsFavored: 12,
    balanceMonthsGeneral: 114,
    balanceMonthsFavored: 133,
    socialSecurityTotalMonths: 60,
    discountCapGeneral: 65,
    discountCapFavored: 70,
    minimumInstallmentMei: 25,
    minimumInstallmentOther: 100,
  },
  tis: {
    minimumExclusive: 1_000_000,
    maximumExclusive: 10_000_000,
    productDefaultEntryPercent: 6,
    productDefaultEntryInstallments: 12,
    productDefaultTotalMonths: 60,
  },
  rfb: {
    maximumInstallments: 60,
    minimumInstallmentPj: 500,
    initialFirstInstallmentPercent: 0,
    firstReparcelFirstInstallmentPercent: 10,
    subsequentReparcelFirstInstallmentPercent: 20,
  },
  smallValue: { operationalScreeningThreshold: 97_000 },
} as const;

export const DEBT_NATURES: { key: DebtNatureKey; label: string }[] = [
  { key: "simples", label: "Simples Nacional" },
  { key: "previdenciaria", label: "Previdenciário" },
  { key: "tributaria", label: "Tributário" },
  { key: "demais", label: "Demais Débitos" },
];

const safe = (value: number) => (Number.isFinite(value) ? Math.max(0, value) : 0);
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
const favored = (size: CompanySize) => size === "mei" || size === "me" || size === "epp";
const pgfnMinimum = (size: CompanySize) => size === "mei" ? PASSIVO_RULES.pgfn.minimumInstallmentMei : PASSIVO_RULES.pgfn.minimumInstallmentOther;
const discountCap = (size: CompanySize) => favored(size) ? PASSIVO_RULES.pgfn.discountCapFavored : PASSIVO_RULES.pgfn.discountCapGeneral;

export function getProfilePlanDefaults(size: CompanySize, key: DebtNatureKey) {
  const entryInstallments = favored(size) ? PASSIVO_RULES.pgfn.entryInstallmentsFavored : PASSIVO_RULES.pgfn.entryInstallmentsGeneral;
  const balanceMonths = favored(size) ? PASSIVO_RULES.pgfn.balanceMonthsFavored : PASSIVO_RULES.pgfn.balanceMonthsGeneral;
  return {
    entryPercent: PASSIVO_RULES.pgfn.entryPercent,
    entryInstallments,
    totalMonths: key === "previdenciaria" ? PASSIVO_RULES.pgfn.socialSecurityTotalMonths : entryInstallments + balanceMonths,
  };
}

export function createDefaultPassivoInput(): PassivoSimulatorInput {
  const nature = (key: DebtNatureKey): NatureParameters => {
    const plan = getProfilePlanDefaults("demais", key);
    return {
      amount: 0,
      reducibleBasePercent: 60,
      discountPercent: 35,
      entryPercent: plan.entryPercent,
      entryInstallments: plan.entryInstallments,
      totalMonths: plan.totalMonths,
    };
  };
  return {
    companyName: "",
    cnpj: "",
    companySize: "demais",
    capag: "nao_informada",
    impediment: "nao_sei",
    executionActive: "nao",
    seizureIdentified: "nao",
    mode: "automatico",
    simulateStrategicReview: true,
    advancedOverrides: false,
    pgfn: {
      simples: nature("simples"),
      previdenciaria: nature("previdenciaria"),
      tributaria: nature("tributaria"),
      demais: nature("demais"),
    },
    rfbAmount: 0,
    rfbSituation: "inicial",
    rfbInstallments: PASSIVO_RULES.rfb.maximumInstallments,
    guaranteeAnnualCostPercent: 1.8,
  };
}

function fit(amount: number, requested: number, minimum: number) {
  const total = safe(amount);
  if (total <= 0) return { installments: 0, value: 0 };
  const desired = Math.max(1, Math.round(requested || 1));
  const maximum = Math.max(1, Math.floor(total / Math.max(1, minimum)));
  const installments = Math.min(desired, maximum);
  return { installments, value: total / installments };
}

function resolveMode(input: PassivoSimulatorInput, pgfnTotal: number): ResolvedMode {
  if (pgfnTotal <= 0) return "sem_divida";
  if (input.mode !== "automatico") return input.mode;
  if (pgfnTotal > PASSIVO_RULES.tis.minimumExclusive && pgfnTotal < PASSIVO_RULES.tis.maximumExclusive) return "tis";
  if (pgfnTotal <= PASSIVO_RULES.pgfn.adhesionLimit) return "capag";
  return "individual";
}

function modeLabel(mode: ResolvedMode) {
  const labels: Record<ResolvedMode, string> = {
    sem_divida: "Sem dívida PGFN informada",
    capag: "Transação por capacidade de pagamento",
    tis: "Transação Individual Simplificada (TIS)",
    ordinario: "Parcelamento ordinário",
    individual: "Negociação individual / análise manual",
  };
  return labels[mode];
}

function natureCalculation(
  key: DebtNatureKey,
  source: NatureParameters,
  mode: ResolvedMode,
  input: PassivoSimulatorInput,
  scenario: "atual" | "atingivel",
): NatureCalculation {
  const original = safe(source.amount);
  const minimumInstallment = pgfnMinimum(input.companySize);
  let entryPercent = 0;
  let entryInstallments = 0;
  let totalMonths: number = key === "previdenciaria" ? PASSIVO_RULES.pgfn.socialSecurityTotalMonths : 60;
  let discountPercent = 0;
  let reducibleBasePercent = 0;

  if (scenario === "atingivel") {
    if (mode === "capag") {
      const defaults = getProfilePlanDefaults(input.companySize, key);
      entryPercent = input.advancedOverrides ? source.entryPercent : defaults.entryPercent;
      entryInstallments = input.advancedOverrides ? source.entryInstallments : defaults.entryInstallments;
      totalMonths = input.advancedOverrides ? source.totalMonths : defaults.totalMonths;
      const projectedReduction = input.capag === "C" || input.capag === "D" || input.simulateStrategicReview;
      discountPercent = projectedReduction ? source.discountPercent : 0;
      reducibleBasePercent = projectedReduction ? source.reducibleBasePercent : 0;
    } else if (mode === "tis") {
      entryPercent = input.advancedOverrides ? source.entryPercent : PASSIVO_RULES.tis.productDefaultEntryPercent;
      entryInstallments = input.advancedOverrides ? source.entryInstallments : PASSIVO_RULES.tis.productDefaultEntryInstallments;
      totalMonths = input.advancedOverrides ? source.totalMonths : PASSIVO_RULES.tis.productDefaultTotalMonths;
      discountPercent = source.discountPercent;
      reducibleBasePercent = source.reducibleBasePercent;
    } else if (mode === "individual") {
      entryPercent = source.entryPercent;
      entryInstallments = source.entryInstallments;
      totalMonths = source.totalMonths || 120;
      discountPercent = source.discountPercent;
      reducibleBasePercent = source.reducibleBasePercent;
    }
  }

  if (key === "previdenciaria") totalMonths = Math.min(totalMonths, PASSIVO_RULES.pgfn.socialSecurityTotalMonths);
  entryPercent = clamp(entryPercent, 0, 100);
  entryInstallments = entryPercent > 0 ? Math.max(1, Math.round(entryInstallments || 1)) : 0;
  totalMonths = Math.max(entryInstallments + 1, Math.round(totalMonths || 60));
  discountPercent = clamp(discountPercent, 0, discountCap(input.companySize));
  reducibleBasePercent = clamp(reducibleBasePercent, 0, 100);

  const entryTotal = original * (entryPercent / 100);
  const entryPlan = fit(entryTotal, entryInstallments, minimumInstallment);
  const afterEntry = Math.max(0, original - entryTotal);
  const reducibleBase = Math.min(afterEntry, original * (reducibleBasePercent / 100));
  const reduction = Math.min(afterEntry, reducibleBase * (discountPercent / 100));
  const balance = Math.max(0, afterEntry - reduction);
  const balancePlan = fit(balance, Math.max(1, totalMonths - entryPlan.installments), minimumInstallment);

  return {
    key,
    label: DEBT_NATURES.find((item) => item.key === key)?.label ?? key,
    original,
    reducibleBase,
    discountPercent,
    reduction,
    entryPercent,
    entryTotal,
    entryInstallments: entryPlan.installments,
    entryInstallmentValue: entryPlan.value,
    balance,
    balanceMonths: balancePlan.installments,
    balanceInstallmentValue: balancePlan.value,
    totalMonths: entryPlan.installments + balancePlan.installments,
    totalNegotiated: entryTotal + balance,
    minimumInstallment,
  };
}

function aggregate(
  id: "atual" | "atingivel",
  title: string,
  subtitle: string,
  mode: ResolvedMode,
  natureResults: NatureCalculation[],
): ScenarioCalculation {
  const original = natureResults.reduce((sum, item) => sum + item.original, 0);
  const reduction = natureResults.reduce((sum, item) => sum + item.reduction, 0);
  const entryTotal = natureResults.reduce((sum, item) => sum + item.entryTotal, 0);
  const balance = natureResults.reduce((sum, item) => sum + item.balance, 0);
  return {
    id,
    title,
    subtitle,
    mode,
    natureResults,
    original,
    reduction,
    entryTotal,
    entryInstallmentValue: natureResults.reduce((sum, item) => sum + item.entryInstallmentValue, 0),
    entryInstallments: natureResults.some((item) => item.entryInstallments > 0) ? Math.max(...natureResults.map((item) => item.entryInstallments)) : 0,
    balance,
    balanceMonths: natureResults.some((item) => item.balanceMonths > 0) ? Math.max(...natureResults.map((item) => item.balanceMonths)) : 0,
    averageBalanceInstallment: natureResults.reduce((sum, item) => sum + item.balanceInstallmentValue, 0),
    totalNegotiated: natureResults.reduce((sum, item) => sum + item.totalNegotiated, 0),
    savingsPercent: original > 0 ? (reduction / original) * 100 : 0,
  };
}

function rfbCalculation(input: PassivoSimulatorInput): RfbCalculation {
  const original = safe(input.rfbAmount);
  const minimumInstallment = PASSIVO_RULES.rfb.minimumInstallmentPj;
  const requested = Math.min(PASSIVO_RULES.rfb.maximumInstallments, Math.max(1, Math.round(input.rfbInstallments || 60)));
  let firstInstallmentPercent = 0;
  let note = "Parcelamento inicial: a primeira prestação é normal, sem entrada extraordinária.";
  if (input.rfbSituation === "primeiro_reparcelamento") {
    firstInstallmentPercent = PASSIVO_RULES.rfb.firstReparcelFirstInstallmentPercent;
    note = "Primeiro reparcelamento: a primeira prestação corresponde a 10% do total consolidado.";
  } else if (input.rfbSituation === "reparcelamento_anterior") {
    firstInstallmentPercent = PASSIVO_RULES.rfb.subsequentReparcelFirstInstallmentPercent;
    note = "Reparcelamento com histórico anterior: a primeira prestação corresponde a 20% do total consolidado.";
  } else if (input.rfbSituation === "nao_sei") {
    note = "Histórico não informado: confirmar no e-CAC se a primeira prestação será normal, 10% ou 20%.";
  }

  if (original <= 0) {
    return { original: 0, situation: input.rfbSituation, firstInstallmentPercent, firstInstallment: 0, balance: 0, balanceInstallments: 0, balanceInstallmentValue: 0, totalInstallments: 0, minimumInstallment, totalNominal: 0, note };
  }

  if (firstInstallmentPercent === 0) {
    const plan = fit(original, requested, minimumInstallment);
    const firstInstallment = plan.value;
    const balance = Math.max(0, original - firstInstallment);
    return {
      original,
      situation: input.rfbSituation,
      firstInstallmentPercent: 0,
      firstInstallment,
      balance,
      balanceInstallments: Math.max(0, plan.installments - 1),
      balanceInstallmentValue: plan.installments > 1 ? plan.value : 0,
      totalInstallments: plan.installments,
      minimumInstallment,
      totalNominal: original,
      note,
    };
  }

  const firstInstallment = original * (firstInstallmentPercent / 100);
  const balance = Math.max(0, original - firstInstallment);
  const plan = fit(balance, Math.max(1, requested - 1), minimumInstallment);
  return {
    original,
    situation: input.rfbSituation,
    firstInstallmentPercent,
    firstInstallment,
    balance,
    balanceInstallments: plan.installments,
    balanceInstallmentValue: plan.value,
    totalInstallments: 1 + plan.installments,
    minimumInstallment,
    totalNominal: original,
    note,
  };
}

export function calculatePassivoSimulation(input: PassivoSimulatorInput): PassivoSimulatorResult {
  const pgfnTotal = DEBT_NATURES.reduce((sum, nature) => sum + safe(input.pgfn[nature.key].amount), 0);
  const resolvedMode = resolveMode(input, pgfnTotal);
  const currentScenario = aggregate(
    "atual",
    "Cenário atual",
    "Regularização sem redução automática",
    "ordinario",
    DEBT_NATURES.map((nature) => natureCalculation(nature.key, input.pgfn[nature.key], "ordinario", input, "atual")),
  );
  const attainableScenario = aggregate(
    "atingivel",
    "Cenário atingível",
    modeLabel(resolvedMode),
    resolvedMode,
    DEBT_NATURES.map((nature) => natureCalculation(nature.key, input.pgfn[nature.key], resolvedMode, input, "atingivel")),
  );
  const rfb = rfbCalculation(input);
  const potentialSavings = Math.max(0, currentScenario.totalNegotiated - attainableScenario.totalNegotiated);
  const tisEligible = pgfnTotal > PASSIVO_RULES.tis.minimumExclusive && pgfnTotal < PASSIVO_RULES.tis.maximumExclusive;
  const requiresTwoStepStrategy = input.impediment === "sim" || ((input.capag === "A" || input.capag === "B" || input.capag === "nao_informada") && attainableScenario.reduction > 0);
  const guaranteeAnnualCostPercent = clamp(input.guaranteeAnnualCostPercent, 0, 100);
  const alerts: string[] = [];

  if (input.impediment === "sim") alerts.push("Transação indisponível no cenário atual informado. Avaliar regularização possível e estratégia em duas etapas.");
  if (input.executionActive === "sim") alerts.push("Execução fiscal ativa: priorizar regularização, garantia e leitura processual.");
  if (input.seizureIdentified === "sim") alerts.push("Bloqueio ou penhora informado: tratamento interno crítico e revisão imediata das medidas disponíveis.");
  if (input.capag === "A" || input.capag === "B") alerts.push("CAPAG A/B não recebe desconto automático no cenário atual; redução projetada depende de revisão ou nova elegibilidade.");
  if (input.capag === "nao_informada") alerts.push("CAPAG não informada: confirmar no REGULARIZE antes de validar desconto ou modalidade.");
  if (resolvedMode === "individual") alerts.push("Valor acima do limite de adesão automática utilizado no motor. Encaminhar para negociação individual e análise manual.");
  if (pgfnTotal > 0 && pgfnTotal <= PASSIVO_RULES.smallValue.operationalScreeningThreshold) alerts.push("Faixa operacional de pequeno valor identificada. Confirmar perfil, data de inscrição, natureza e edital vigente.");
  if (rfb.original > 0) alerts.push("RFB calculada separadamente; seus valores não compõem a redução da PGFN.");
  alerts.push("Valores nominais antes da atualização pela Selic. Validar no SISPAR, REGULARIZE, e-CAC e documentos do caso.");

  return {
    resolvedMode,
    resolvedModeLabel: modeLabel(resolvedMode),
    availableNow: input.impediment !== "sim" && resolvedMode !== "individual" && resolvedMode !== "sem_divida",
    requiresTwoStepStrategy,
    smallValueCandidate: pgfnTotal > 0 && pgfnTotal <= PASSIVO_RULES.smallValue.operationalScreeningThreshold,
    pgfnTotal,
    currentScenario,
    attainableScenario,
    rfb,
    potentialSavings,
    potentialSavingsPercent: currentScenario.original > 0 ? (potentialSavings / currentScenario.original) * 100 : 0,
    guarantee: {
      suggestedCoverage: attainableScenario.balance,
      annualCostPercent: guaranteeAnnualCostPercent,
      estimatedAnnualCost: attainableScenario.balance * (guaranteeAnnualCostPercent / 100),
      note: "Estimativa comercial separada da redução da dívida; o custo real depende do tipo de garantia e da análise do garantidor.",
    },
    tis: {
      valueRangeEligible: tisEligible,
      statusLabel: tisEligible ? "Faixa de valor atendida" : "Fora da faixa automática de valor",
      note: tisEligible
        ? "A faixa de valor é compatível; capacidade de pagamento, impedimentos, documentos, garantias e aceitação ainda precisam ser validados."
        : "A TIS exige valor consolidado superior a R$ 1 milhão e inferior a R$ 10 milhões, além dos demais critérios.",
    },
    alerts,
  };
}

export function buildPassivoSummary(result: PassivoSimulatorResult) {
  return [
    `Modalidade indicada: ${result.resolvedModeLabel}`,
    `PGFN informada: ${result.pgfnTotal.toFixed(2)}`,
    `Redução potencial estimada: ${result.attainableScenario.reduction.toFixed(2)}`,
    `Entrada projetada: ${result.attainableScenario.entryTotal.toFixed(2)}`,
    `Saldo projetado: ${result.attainableScenario.balance.toFixed(2)}`,
    `Economia potencial: ${result.potentialSavings.toFixed(2)}`,
    `RFB calculada separadamente: ${result.rfb.original.toFixed(2)}`,
    ...result.alerts.map((alert) => `Alerta: ${alert}`),
  ].join("\n");
}
