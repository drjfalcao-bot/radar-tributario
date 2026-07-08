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
  pgfnOrdinarioEntradaPercentual?: number;
  pgfnOrdinarioEntradaParcelas?: number;
  pgfnOrdinarioSaldoParcelas?: number;
  pgfnOrdinarioParcelaMinima?: number;
  transacaoEntradaPercentual?: number;
  transacaoEntradaParcelas?: number;
  transacaoSaldoParcelas?: number;
  transacaoDescontoPercentual?: number;
  simplificadaEntradaPercentual?: number;
  simplificadaEntradaParcelas?: number;
  simplificadaSaldoParcelas?: number;
  simplificadaDescontoPercentual?: number;
  pequenoValorEntradaPercentual?: number;
  pequenoValorEntradaParcelas?: number;
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
  notes: string[];
  alerts: string[];
};

export type NegotiationResult = {
  scenarios: NegotiationScenario[];
  mandatoryAlerts: string[];
  pgfnTotal: number;
  transactionDiscountCap: number;
};

const FAVORED_PROFILES: ContributorProfile[] = [
  "pf",
  "mei",
  "me_epp",
  "cooperativa_ensino_osc",
  "recuperacao_judicial",
];

function money(value: number) {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

function numberOrDefault(value: number | undefined, fallback: number) {
  return Number.isFinite(value) ? Number(value) : fallback;
}

function months(value: number | undefined, fallback: number) {
  const numeric = Number.isFinite(value) ? Number(value) : fallback;
  return Math.max(1, Math.round(numeric > 0 ? numeric : fallback));
}

function percent(value?: number) {
  return Number.isFinite(value) ? Math.max(0, Number(value)) / 100 : 0;
}

function percentWithDefault(value: number | undefined, fallbackPercent: number, maxPercent = 100) {
  const raw = numberOrDefault(value, fallbackPercent);
  return Math.min(Math.max(0, raw), maxPercent) / 100;
}

function pmt(principal: number, monthsCount: number, monthlyRate: number) {
  if (principal <= 0 || monthsCount <= 0) return 0;
  if (monthlyRate <= 0) return principal / monthsCount;
  return (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -monthsCount));
}

function buildScenario({
  id,
  title,
  appliesTo,
  enabled = true,
  debt,
  entryPercent,
  entryInstallments,
  balanceMonths,
  discountPercent,
  minimumInstallment,
  selicMonthly,
  notes = [],
  alerts = [],
}: {
  id: string;
  title: string;
  appliesTo: string;
  enabled?: boolean;
  debt: number;
  entryPercent: number;
  entryInstallments: number;
  balanceMonths: number;
  discountPercent: number;
  minimumInstallment: number;
  selicMonthly: number;
  notes?: string[];
  alerts?: string[];
}): NegotiationScenario {
  const safeDebt = money(debt);
  const safeEntryInstallments = Math.max(1, Math.round(entryInstallments));
  const safeBalanceMonths = Math.max(1, Math.round(balanceMonths));
  const safeEntryPercent = Math.min(Math.max(0, entryPercent), 1);
  const safeDiscountPercent = Math.min(Math.max(0, discountPercent), 1);
  const entryTotal = safeDebt * safeEntryPercent;
  const entryInstallmentValue = entryTotal / safeEntryInstallments;
  const balanceBase = safeDebt - entryTotal;
  const discountValue = Math.min(balanceBase, balanceBase * safeDiscountPercent);
  const negotiatedBalance = Math.max(0, balanceBase - discountValue);
  const calculatedInstallment = pmt(negotiatedBalance, safeBalanceMonths, selicMonthly);
  const balanceInstallment = Math.max(calculatedInstallment, money(minimumInstallment));
  const totalNegotiated = entryTotal + balanceInstallment * safeBalanceMonths;

  return {
    id,
    title,
    appliesTo,
    enabled: enabled && safeDebt > 0,
    debt: safeDebt,
    entryPercent: safeEntryPercent,
    entryTotal,
    entryInstallments: safeEntryInstallments,
    entryInstallmentValue,
    balanceMonths: safeBalanceMonths,
    discountPercent: safeDiscountPercent,
    discountValue,
    negotiatedBalance,
    balanceInstallment,
    minimumInstallment: money(minimumInstallment),
    totalNegotiated,
    estimatedSavings: safeDebt - totalNegotiated,
    notes,
    alerts,
  };
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
  return isFavored(profile) ? 0.7 : 0.65;
}

function selectedTransactionDiscount(input: NegotiationInput, cap: number) {
  const explicit = Number.isFinite(input.transacaoDescontoPercentual)
    ? input.transacaoDescontoPercentual
    : input.descontoManualPercentual;
  return percentWithDefault(explicit, cap * 100, cap * 100);
}

function selectedSimplifiedDiscount(input: NegotiationInput, cap: number) {
  return percentWithDefault(input.simplificadaDescontoPercentual, cap * 100, cap * 100);
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
  const transactionEligible = pgfnTotal > 0 && pgfnTotal <= 45_000_000 && !transactionBlocked;
  const cap = transactionCap(input.perfilContribuinte);

  const defaultEntryMonths = favored ? 12 : 6;
  const defaultBalanceMonths = favored ? 133 : 114;
  const transactionEntryMonths = months(input.transacaoEntradaParcelas, defaultEntryMonths);
  const unrestrictedTransactionBalanceMonths = months(input.transacaoSaldoParcelas, defaultBalanceMonths);
  const transactionBalanceMonths = hasPrevidenciario
    ? Math.max(1, Math.min(unrestrictedTransactionBalanceMonths, 60 - transactionEntryMonths))
    : unrestrictedTransactionBalanceMonths;

  const minimumPgfnTransaction = pgfnTransactionMinimumInstallment(input.perfilContribuinte);
  const ordinaryMinimumFallback = pgfnOrdinaryMinimumInstallment(input.perfilContribuinte);
  const pgfnOrdinaryMinimum = money(
    Number.isFinite(input.pgfnOrdinarioParcelaMinima) && Number(input.pgfnOrdinarioParcelaMinima) > 0
      ? Number(input.pgfnOrdinarioParcelaMinima)
      : ordinaryMinimumFallback,
  );
  const simplifiedInsideBand = pgfnTotal > 1_000_000 && pgfnTotal < 10_000_000;

  const mandatoryAlerts = [
    "Simulacao preliminar; confirmar no e-CAC/REGULARIZE.",
    transactionBlocked
      ? "ALERTA CRITICO: transacao pode estar bloqueada por 2 anos; simular parcelamento ordinario como plano B."
      : "",
    input.capag === "nao_sei" ? "Desconto depende da classificacao no REGULARIZE." : "",
    hasPrevidenciario ? "Prazo previdenciario limitado a 60 meses." : "",
    overAdhesionLimit ? "Avaliar transacao individual, nao adesao automatica." : "",
  ].filter(Boolean);

  const scenarios: NegotiationScenario[] = [
    buildScenario({
      id: "rfb-ordinario",
      title: "RFB - parcelamento administrativo",
      appliesTo: "Debito ainda nao inscrito em divida ativa",
      debt: valorRfb,
      entryPercent: 0,
      entryInstallments: 1,
      balanceMonths: 60,
      discountPercent: 0,
      minimumInstallment: rfbMinimumInstallment(input.perfilContribuinte),
      selicMonthly,
      notes: [
        "Sem desconto.",
        "Alternativa para debito ainda sob administracao da Receita Federal.",
        "Primeira parcela/antecipacao condiciona o andamento.",
      ],
      alerts: [
        "Sem inscricao/transferencia do poder de cobranca para PGFN, a empresa fica presa a negociacao administrativa da RFB e nao deve contar com beneficios de transacao da divida ativa.",
        "Confirmar consolidacao, natureza do debito e regras especificas no e-CAC.",
      ],
    }),
    buildScenario({
      id: "pgfn-ordinario",
      title: "PGFN - parcelamento comum/ordinario",
      appliesTo: "Divida ativa da Uniao",
      debt: pgfnTotal,
      entryPercent: percentWithDefault(input.pgfnOrdinarioEntradaPercentual, 0),
      entryInstallments: months(input.pgfnOrdinarioEntradaParcelas, 1),
      balanceMonths: months(input.pgfnOrdinarioSaldoParcelas, 60),
      discountPercent: 0,
      minimumInstallment: pgfnOrdinaryMinimum,
      selicMonthly,
      notes: [
        "Sem desconto.",
        "Plano B quando nao houver transacao disponivel ou houver impedimento.",
        "Parcela minima deixada parametrizavel porque o REGULARIZE pode variar por natureza do debito, contribuinte e garantia.",
      ],
      alerts: transactionBlocked
        ? ["Transacao pode estar bloqueada por rescissao; parcelamento ordinario deve ser tratado como plano B imediato."]
        : [],
    }),
    buildScenario({
      id: "pgfn-capag",
      title: "PGFN - transacao por capacidade de pagamento",
      appliesTo: "Divida ativa PGFN conforme CAPAG",
      enabled: transactionEligible,
      debt: pgfnTotal,
      entryPercent: percentWithDefault(input.transacaoEntradaPercentual, 6),
      entryInstallments: transactionEntryMonths,
      balanceMonths: transactionBalanceMonths,
      discountPercent: selectedTransactionDiscount(input, cap),
      minimumInstallment: minimumPgfnTransaction,
      selicMonthly,
      notes: [
        "Elegibilidade indicativa: divida PGFN ate R$ 45 milhoes, inscricao ate 03/03/2026 e sem impedimento ativo por transacao rescindida.",
        favored ? "Perfil favorecido: entrada ate 12x, saldo ate 133x e teto potencial de reducao de 70%." : "Demais contribuintes: entrada ate 6x, saldo ate 114x e teto potencial de reducao de 65%.",
        "A simulacao usa o teto potencial de reducao por padrao. Isso serve para comparacao comercial, nao como promessa de deferimento.",
        "Na regra oficial, desconto incide sobre juros, multa e encargo legal, limitado ao teto do valor da divida e ao principal.",
      ],
      alerts: [
        transactionBlocked ? "Cenario bloqueado: ha impedimento informado por transacao rescindida." : "",
        overAdhesionLimit ? "Cenario bloqueado para adesao automatica: valor PGFN acima de R$ 45 milhoes." : "",
        hasPrevidenciario ? "Prazo total limitado a 60 meses por debito previdenciario." : "",
        input.capag === "A" || input.capag === "B"
          ? "CAPAG A/B normalmente permite entrada facilitada sem desconto; o desconto aqui esta lancado como teto potencial para comparacao."
          : "",
        input.capag === "nao_sei" ? "CAPAG nao informada; desconto depende do REGULARIZE." : "",
      ].filter(Boolean),
    }),
    buildScenario({
      id: "pgfn-simplificada",
      title: "PGFN/Uniao - transacao individual simplificada",
      appliesTo: "Proposta simplificada no REGULARIZE",
      enabled: pgfnTotal > 0 && !transactionBlocked,
      debt: pgfnTotal,
      entryPercent: percentWithDefault(input.simplificadaEntradaPercentual, 10),
      entryInstallments: months(input.simplificadaEntradaParcelas, 1),
      balanceMonths: months(input.simplificadaSaldoParcelas, 60),
      discountPercent: selectedSimplifiedDiscount(input, cap),
      minimumInstallment: minimumPgfnTransaction,
      selicMonthly,
      notes: [
        "Cenario comparativo com entrada inicial de 10% e saldo em 60x por padrao.",
        "A transacao individual simplificada e proposta pelo contribuinte e pode envolver analise, documentos, garantias e contraproposta.",
        "A reducao foi lancada no teto potencial para visualizar ganho maximo atingivel; confirmar metodologia e deferimento no REGULARIZE.",
      ],
      alerts: [
        simplifiedInsideBand
          ? "Faixa indicativa da TIS atendida: acima de R$ 1 milhao e abaixo de R$ 10 milhoes."
          : "TIS oficial costuma exigir divida ativa consolidada superior a R$ 1 milhao e inferior a R$ 10 milhoes; usar este cenario como comparativo preliminar.",
        transactionBlocked ? "Cenario bloqueado: ha impedimento informado por transacao rescindida." : "",
      ].filter(Boolean),
    }),
    ...(input.pequenoValorElegivel === "sim"
      ? [
          buildScenario({
            id: "pgfn-pequeno-7",
            title: "PGFN - pequeno valor ate 7 meses",
            appliesTo: "Pequeno valor elegivel",
            debt: pgfnTotal,
            entryPercent: percentWithDefault(input.pequenoValorEntradaPercentual, 5),
            entryInstallments: months(input.pequenoValorEntradaParcelas, 5),
            balanceMonths: 7,
            discountPercent: 0.5,
            minimumInstallment: minimumPgfnTransaction,
            selicMonthly,
            notes: ["Entrada de 5% em ate 5x por padrao.", "Faixa simulada: saldo em ate 7 meses com 50% de desconto."],
            alerts: ["Depende de perfil, valor, data de inscricao e enquadramento no edital."],
          }),
          buildScenario({
            id: "pgfn-pequeno-12",
            title: "PGFN - pequeno valor ate 12 meses",
            appliesTo: "Pequeno valor elegivel",
            debt: pgfnTotal,
            entryPercent: percentWithDefault(input.pequenoValorEntradaPercentual, 5),
            entryInstallments: months(input.pequenoValorEntradaParcelas, 5),
            balanceMonths: 12,
            discountPercent: 0.45,
            minimumInstallment: minimumPgfnTransaction,
            selicMonthly,
            notes: ["Entrada de 5% em ate 5x por padrao.", "Faixa simulada: saldo em ate 12 meses com 45% de desconto."],
            alerts: ["Depende de perfil, valor, data de inscricao e enquadramento no edital."],
          }),
          buildScenario({
            id: "pgfn-pequeno-30",
            title: "PGFN - pequeno valor ate 30 meses",
            appliesTo: "Pequeno valor elegivel",
            debt: pgfnTotal,
            entryPercent: percentWithDefault(input.pequenoValorEntradaPercentual, 5),
            entryInstallments: months(input.pequenoValorEntradaParcelas, 5),
            balanceMonths: 30,
            discountPercent: 0.4,
            minimumInstallment: minimumPgfnTransaction,
            selicMonthly,
            notes: ["Entrada de 5% em ate 5x por padrao.", "Faixa simulada: saldo em ate 30 meses com 40% de desconto."],
            alerts: ["Depende de perfil, valor, data de inscricao e enquadramento no edital."],
          }),
          buildScenario({
            id: "pgfn-pequeno-55",
            title: "PGFN - pequeno valor ate 55 meses",
            appliesTo: "Pequeno valor elegivel",
            debt: pgfnTotal,
            entryPercent: percentWithDefault(input.pequenoValorEntradaPercentual, 5),
            entryInstallments: months(input.pequenoValorEntradaParcelas, 5),
            balanceMonths: 55,
            discountPercent: 0.3,
            minimumInstallment: minimumPgfnTransaction,
            selicMonthly,
            notes: ["Entrada de 5% em ate 5x por padrao.", "Faixa simulada: saldo em ate 55 meses com 30% de desconto."],
            alerts: ["Depende de perfil, valor, data de inscricao e enquadramento no edital."],
          }),
        ]
      : []),
  ];

  return { scenarios, mandatoryAlerts, pgfnTotal, transactionDiscountCap: cap };
}
