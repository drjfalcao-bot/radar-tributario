import { z } from "zod";
import { PREMISSAS } from "@/lib/premissas";

export const DiagnosticInputSchema = z.object({
  nomeEmpresa: z.string().min(2, "Informe o nome da empresa ou contato."),
  contato: z.string().optional().default(""),
  cnpj: z
    .string()
    .optional()
    .default("")
    .refine((value) => {
      if (!value) return true;
      const digits = value.replace(/\D/g, "");
      return digits.length === 14;
    }, "CNPJ deve ter 14 digitos."),
  regimeTributario: z.enum(["simples", "presumido", "real", "mei", "nao_sei"]),
  setor: z.enum([
    "comercio",
    "servicos",
    "industria",
    "profissional",
    "saude_educacao_agro",
    "imobiliario",
    "financeiro",
    "seletivo",
    "nao_sei",
  ]),
  porteEmpresa: z
    .enum(["mei", "micro", "pequena", "media", "grande", "nao_sei"])
    .optional()
    .default("nao_sei"),
  numeroFuncionarios: z.coerce.number().min(0).optional().default(0),
  faturamentoMensal: z.coerce.number().positive("Faturamento deve ser maior que zero."),
  percentualB2B: z.coerce.number().min(0).max(100),
  margemPercentual: z.coerce.number().min(1).max(80),
  comprasCreditaveisPercentual: z.coerce.number().min(0).max(100),
  possuiClientePjRelevante: z.enum(["sim", "nao", "nao_sei"]),
  sistemaFiscalPreparado: z.enum(["sim", "parcial", "nao", "nao_sei"]),
  possuiDividaFiscal: z.enum(["sim", "nao", "nao_sei"]),
  valorDividaEstimado: z.coerce.number().min(0).optional().default(0),
  valorDividaUniao: z.coerce.number().min(0).optional().default(0),
  valorDividaEstado: z.coerce.number().min(0).optional().default(0),
  valorDividaMunicipio: z.coerce.number().min(0).optional().default(0),
  valorDividaOutros: z.coerce.number().min(0).optional().default(0),
  possuiCreditoIcms: z.enum(["sim", "nao", "nao_sei"]),
  valorCreditoIcmsEstimado: z.coerce.number().min(0).optional().default(0),
  objetivoCliente: z
    .enum(["caixa", "imposto_alto", "certidao", "divida", "clientes_pj", "nao_sei"])
    .optional()
    .default("nao_sei"),
});

export type DiagnosticInput = z.infer<typeof DiagnosticInputSchema>;

export type RiskLevel = "baixo" | "medio" | "alto" | "critico";

export type DiagnosticResult = {
  score: number;
  nivel: RiskLevel;
  exposicaoMin: number;
  exposicaoMax: number;
  precoInacaoMin: number;
  precoInacaoMax: number;
  pressaoB2B: "baixa" | "media" | "alta";
  proximoPasso: string;
  oportunidades: string[];
  ameacas: string[];
  documentos: string[];
  lacunasInformacao: string[];
  modulosParecer: string[];
  alertasDocumento: string[];
  ativoFiscal?: {
    creditoIcmsInformado: number;
    parcelaTeoricaMensal240: number;
    observacao: string;
  };
  perfilEmpresa: {
    porteEmpresa: NonNullable<DiagnosticInput["porteEmpresa"]>;
    numeroFuncionarios: number;
    faturamentoAnual: number;
    leituraPorte: string;
  };
  dividasDetalhadas: {
    uniao: number;
    estado: number;
    municipio: number;
    outros: number;
    total: number;
  };
  premissas: typeof PREMISSAS;
};

export type DiagnosticPackage = {
  resultadoBasico: DiagnosticResult;
  insumosParecer: {
    respostasOriginais: DiagnosticInput;
    premissasUsadas: typeof PREMISSAS;
    documentosSolicitados: string[];
    modulosAvaliacao: string[];
    lacunasInformacao: string[];
    alertasDependentesDocumento: string[];
  };
};

const COMMON_DOCUMENTS = [
  "XML de notas fiscais de entrada e saida de periodo representativo",
  "Relatorio de faturamento mensal dos ultimos 12 meses",
  "Apuracao do regime atual: PGDAS-D, EFD, ECF, ECD ou resumo contabil",
  "Balancete ou DRE recente",
  "Relatorio de debitos fiscais federais, estaduais e municipais",
];

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function unique(items: string[]): string[] {
  return Array.from(new Set(items));
}

export function getDebtBreakdown(input: DiagnosticInput): DiagnosticResult["dividasDetalhadas"] {
  const uniao = Number(input.valorDividaUniao ?? 0);
  const estado = Number(input.valorDividaEstado ?? 0);
  const municipio = Number(input.valorDividaMunicipio ?? 0);
  const outros = Number(input.valorDividaOutros ?? 0);
  const detailedTotal = uniao + estado + municipio + outros;
  const legacyTotal = Number(input.valorDividaEstimado ?? 0);

  if (detailedTotal === 0 && legacyTotal > 0) {
    return {
      uniao: legacyTotal,
      estado: 0,
      municipio: 0,
      outros: 0,
      total: legacyTotal,
    };
  }

  return {
    uniao,
    estado,
    municipio,
    outros,
    total: Math.max(legacyTotal, detailedTotal),
  };
}

function buildCompanyProfile(input: DiagnosticInput): DiagnosticResult["perfilEmpresa"] {
  const faturamentoAnual = input.faturamentoMensal * 12;
  const leituraPorte =
    input.porteEmpresa && input.porteEmpresa !== "nao_sei"
      ? input.porteEmpresa
      : faturamentoAnual >= 30000000
        ? "grande"
        : faturamentoAnual >= 4800000
          ? "media"
          : faturamentoAnual >= 360000
            ? "pequena"
            : "micro";

  return {
    porteEmpresa: input.porteEmpresa ?? "nao_sei",
    numeroFuncionarios: Number(input.numeroFuncionarios ?? 0),
    faturamentoAnual,
    leituraPorte,
  };
}

function getRiskLevel(score: number): RiskLevel {
  if (score >= 75) return "critico";
  if (score >= 55) return "alto";
  if (score >= 35) return "medio";
  return "baixo";
}

function getNextStep(level: RiskLevel, input: DiagnosticInput): string {
  if (level === "critico") return "Plano de acao urgente com especialista";
  if (input.regimeTributario === "simples" && input.percentualB2B > 40) {
    return "Simular Simples unificado x regime regular IBS/CBS";
  }
  if (input.possuiDividaFiscal === "sim") return "Separar passivo e certidoes para analise";
  if (input.possuiCreditoIcms === "sim") return "Validar ativo fiscal de ICMS";
  if (level === "baixo") return "Checklist de adequacao e monitoramento";
  return "Reuniao tecnica de diagnostico";
}

function calculateScore(input: DiagnosticInput): number {
  let score = 12;

  if (input.regimeTributario === "simples") score += 18;
  if (input.regimeTributario === "nao_sei") score += 14;
  if (input.regimeTributario === "presumido" || input.regimeTributario === "real") score += 8;

  score += clamp(input.percentualB2B * 0.28, 0, 28);

  if (input.possuiClientePjRelevante === "sim") score += 10;
  if (input.possuiClientePjRelevante === "nao_sei") score += 5;

  if (input.sistemaFiscalPreparado === "parcial") score += 8;
  if (input.sistemaFiscalPreparado === "nao") score += 14;
  if (input.sistemaFiscalPreparado === "nao_sei") score += 12;

  if (input.possuiDividaFiscal === "sim") {
    const faturamentoAnual = input.faturamentoMensal * 12;
    const totalDebt = getDebtBreakdown(input).total;
    score += 12;
    score += clamp((totalDebt / Math.max(1, faturamentoAnual)) * 10, 0, 10);
  }
  if (input.possuiDividaFiscal === "nao_sei") score += 6;

  if (input.possuiCreditoIcms === "sim") score += 6;
  if (input.setor === "financeiro" || input.setor === "seletivo") score += 8;
  if (input.margemPercentual < 10) score += 8;

  return Math.round(clamp(score, 0, 100));
}

function calculateExposure(input: DiagnosticInput) {
  const receitaAnual = input.faturamentoMensal * 12;
  const percentualB2B = input.percentualB2B / 100;
  const margem = input.margemPercentual / 100;
  const receitaB2BAnual = receitaAnual * percentualB2B;
  const fatorSetorial = PREMISSAS.fatoresSetoriais[input.setor];
  const ivaReferencia =
    (PREMISSAS.aliquotas.referencia.cbs + PREMISSAS.aliquotas.referencia.ibs) * fatorSetorial;

  const creditoEstimado =
    input.regimeTributario === "simples" ? 0.035 : ivaReferencia * 0.65;
  const gapCredito = Math.max(0, ivaReferencia - creditoEstimado);

  let exposicaoComercial =
    receitaB2BAnual * gapCredito * PREMISSAS.multiplicadoresInacao.b2b;

  if (input.regimeTributario !== "simples" && percentualB2B < 0.4) {
    exposicaoComercial *= 0.5;
  }

  const exposicaoMargem =
    receitaB2BAnual * margem * PREMISSAS.multiplicadoresInacao.margem;

  const operacionalMultiplier =
    input.sistemaFiscalPreparado === "nao"
      ? PREMISSAS.multiplicadoresInacao.operacionalNaoPreparado
      : input.sistemaFiscalPreparado === "parcial" || input.sistemaFiscalPreparado === "nao_sei"
        ? PREMISSAS.multiplicadoresInacao.operacionalParcial
        : 0;

  const exposicaoOperacional = receitaAnual * operacionalMultiplier;

  const exposicaoPassivo =
    input.possuiDividaFiscal === "sim"
      ? Math.min(getDebtBreakdown(input).total, receitaAnual * 2) *
        PREMISSAS.multiplicadoresInacao.passivo
      : 0;

  const base =
    exposicaoComercial + exposicaoMargem + exposicaoOperacional + exposicaoPassivo;

  let precoInacaoBase = base;
  if (input.sistemaFiscalPreparado === "nao" || input.sistemaFiscalPreparado === "nao_sei") {
    precoInacaoBase += receitaAnual * 0.006;
  }
  if (input.regimeTributario === "simples" && percentualB2B > 0.4) {
    precoInacaoBase += receitaB2BAnual * 0.015;
  }
  if (input.possuiDividaFiscal === "sim") {
    precoInacaoBase += Math.min(getDebtBreakdown(input).total, receitaAnual) * 0.02;
  }

  return {
    exposicaoMin: Math.round(base * PREMISSAS.intervaloEstimativa.exposicaoMin),
    exposicaoMax: Math.round(base * PREMISSAS.intervaloEstimativa.exposicaoMax),
    precoInacaoMin: Math.round(precoInacaoBase * PREMISSAS.intervaloEstimativa.inacaoMin),
    precoInacaoMax: Math.round(precoInacaoBase * PREMISSAS.intervaloEstimativa.inacaoMax),
  };
}

function isOmissoesRisk(input: DiagnosticInput): boolean {
  return input.possuiDividaFiscal === "nao_sei" || input.sistemaFiscalPreparado === "nao_sei";
}

function isRecuperacaoCreditosCandidato(input: DiagnosticInput): boolean {
  return (
    input.regimeTributario === "presumido" ||
    input.regimeTributario === "real" ||
    input.regimeTributario === "nao_sei" ||
    input.setor === "industria" ||
    input.setor === "comercio" ||
    input.comprasCreditaveisPercentual >= 50
  );
}

function isCaixaBancosRelevante(input: DiagnosticInput): boolean {
  return (
    input.objetivoCliente === "caixa" ||
    input.objetivoCliente === "certidao" ||
    input.objetivoCliente === "divida" ||
    input.possuiDividaFiscal === "sim"
  );
}

function buildOpportunities(input: DiagnosticInput): string[] {
  const items: string[] = [];

  if (input.regimeTributario === "simples" && input.percentualB2B > 40) {
    items.push("Simular regime unificado x regime regular de IBS/CBS antes da janela de setembro.");
  }
  if (input.sistemaFiscalPreparado !== "sim") {
    items.push("Revisar ERP, emissor, contador, CST, cClassTrib e rotina de notas fiscais.");
  }
  if (input.possuiDividaFiscal === "sim") {
    items.push("Separar debitos RFB, PGFN, Estado e Municipio para plano de regularizacao.");
  }
  if (isOmissoesRisk(input)) {
    items.push("Mapear pendencias em RFB, PGFN, SEFAZ e municipio antes de propor estrategia fiscal.");
  }
  if (isRecuperacaoCreditosCandidato(input)) {
    items.push(
      "Avaliar recuperacao de creditos tributarios e revisao de pagamentos, conforme regime, CNAE, NCM e historico fiscal.",
    );
  }
  if (isCaixaBancosRelevante(input)) {
    items.push(
      "Regularizar passivo e organizar informacoes fiscais pode melhorar acesso a credito, negociacao bancaria e previsibilidade de caixa.",
    );
  }
  if (input.possuiCreditoIcms === "sim") {
    items.push("Levantar creditos de ICMS como ativo fiscal potencial.");
  }
  if (input.setor === "industria") {
    items.push("Revisar creditos, estoque, NCM e cadeia de fornecedores.");
  }
  if (input.setor === "comercio") {
    items.push("Mapear mix de produtos, NCM e estoque.");
  }
  if (input.setor === "servicos") {
    items.push("Revisar contratos de prestacao e politica de precificacao.");
  }
  if (input.setor === "profissional") {
    items.push("Validar se a atividade se enquadra em reducao setorial.");
  }
  if (input.setor === "saude_educacao_agro") {
    items.push("Validar regime diferenciado e documentacao do enquadramento.");
  }

  if (items.length === 0) {
    items.push("Realizar checklist preventivo de documentos fiscais e contratos antes da transicao.");
  }

  return items.slice(0, 5);
}

function buildThreats(input: DiagnosticInput): string[] {
  const items: string[] = [];

  if (input.regimeTributario === "simples") {
    items.push(
      "Empresas do Simples precisam avaliar a opcao de IBS/CBS para 2027; a escolha de setembro/2026 pode afetar o primeiro semestre de 2027.",
    );
  }
  if (input.regimeTributario === "simples" && input.percentualB2B > 40) {
    items.push(
      "Clientes PJ podem comparar fornecedores pela capacidade de gerar credito; o modelo unificado pode reduzir competitividade em cadeias B2B.",
    );
  }
  if (input.sistemaFiscalPreparado !== "sim") {
    items.push("Risco operacional na emissao de documentos com campos IBS/CBS.");
  }
  if (input.possuiDividaFiscal === "sim") {
    items.push("Passivo pode afetar certidao, credito, contratos e capacidade de transicao.");
  }
  if (isOmissoesRisk(input)) {
    items.push(
      "Omissoes, pendencias acessorias ou inconsistencias cadastrais podem bloquear certidoes, parcelamentos e estrategias de regularizacao.",
    );
  }
  if (isRecuperacaoCreditosCandidato(input)) {
    items.push("Sem levantamento documental, a empresa pode deixar ativos fiscais parados ou perder janela de aproveitamento.");
  }
  if (isCaixaBancosRelevante(input)) {
    items.push(
      "Restricoes fiscais e falta de certidao podem aumentar custo financeiro, travar contratos e reduzir poder de negociacao com bancos.",
    );
  }
  if (input.margemPercentual < 10) {
    items.push("Margem baixa reduz capacidade de absorver custos, atrasos de caixa e ajustes de preco.");
  }
  if (input.setor === "comercio") {
    items.push("Margem e repasse ao consumidor podem ficar pressionados.");
  }
  if (input.setor === "servicos") {
    items.push("Menor volume de insumos creditaveis pode pressionar a carga tributaria.");
  }
  if (input.setor === "financeiro") {
    items.push("Regimes especificos e regras de DeRE exigem analise tributaria propria.");
  }
  if (input.setor === "seletivo") {
    items.push("Possivel incidencia de Imposto Seletivo exige analise por produto e NCM.");
  }

  if (items.length === 0) {
    items.push("Risco inicial menor, mas ainda depende de CNAE, documentos fiscais e contratos reais.");
  }

  return items.slice(0, 5);
}

function buildDocuments(input: DiagnosticInput): string[] {
  const docs = [...COMMON_DOCUMENTS];

  if (input.regimeTributario === "simples") {
    docs.push("PGDAS-D dos ultimos 12 meses");
    docs.push("Folha de pagamento dos ultimos 12 meses");
    docs.push("RBT-12 e Fator R");
    docs.push("Percentual de clientes PJ e principais contratos");
  }

  if (input.possuiDividaFiscal === "sim" || input.possuiDividaFiscal === "nao_sei") {
    docs.push("Extrato RFB/e-CAC");
    docs.push("Extrato Regularize/PGFN");
    docs.push("Extrato SEFAZ e Prefeitura, quando aplicavel");
    docs.push("Parcelamentos ativos e em atraso");
    docs.push("Certidoes atuais");
  }

  if (isOmissoesRisk(input)) {
    docs.push("Relatorio de situacao fiscal completa no e-CAC");
    docs.push("Extratos de omissoes e inconsistencias cadastrais");
    docs.push("Relatorio de pendencias no Regularize/PGFN");
  }

  if (input.setor === "industria" || input.setor === "comercio") {
    docs.push("EFD ICMS/IPI");
    docs.push("Controle de estoque");
    docs.push("Relatorio de ICMS-ST");
    docs.push("Principais NCMs");
  }

  if (isRecuperacaoCreditosCandidato(input)) {
    docs.push("EFD Contribuicoes (PIS/Cofins)");
    docs.push("Relatorio de NCM e CFOP das operacoes");
    docs.push("Apuracoes de PIS/Cofins, ICMS, ISS ou Simples dos ultimos periodos, conforme regime");
  }

  if (input.possuiCreditoIcms === "sim" || input.possuiCreditoIcms === "nao_sei") {
    docs.push("Controle de saldo credor de ICMS");
    docs.push("Origem dos creditos de ICMS");
    docs.push("Comunicacoes, fiscalizacoes ou homologacoes relacionadas a creditos");
  }

  if (input.setor === "servicos" || input.setor === "profissional") {
    docs.push("NFS-e emitidas");
    docs.push("Contratos de prestacao de servicos");
    docs.push("CNAE principal e secundarios");
  }

  return unique(docs);
}

function getB2BPressure(input: DiagnosticInput): "baixa" | "media" | "alta" {
  if (input.percentualB2B >= 65 || input.possuiClientePjRelevante === "sim") return "alta";
  if (input.percentualB2B >= 35 || input.possuiClientePjRelevante === "nao_sei") return "media";
  return "baixa";
}

function buildLacunas(input: DiagnosticInput): string[] {
  const items: string[] = [];

  if (input.regimeTributario === "nao_sei") items.push("Regime tributario atual nao confirmado.");
  if (input.setor === "nao_sei") items.push("Setor/CNAE nao informado.");
  if (input.possuiDividaFiscal === "nao_sei") items.push("Situacao de debitos fiscais nao verificada.");
  if (input.possuiCreditoIcms === "nao_sei") items.push("Existencia de saldo credor de ICMS nao confirmada.");
  if (input.sistemaFiscalPreparado === "nao_sei") items.push("Preparacao do ERP/emissor fiscal nao confirmada.");
  if (input.percentualB2B === 0 && input.possuiClientePjRelevante === "nao_sei") {
    items.push("Percentual real de clientes PJ precisa ser validado.");
  }

  return items;
}

function buildModulosParecer(input: DiagnosticInput): string[] {
  const items = ["Diagnostico da Reforma Tributaria", "Risco operacional de emissao fiscal"];

  if (input.regimeTributario === "simples") {
    items.push("Risco de Simples hibrido/unificado");
  }
  if (input.possuiDividaFiscal !== "nao") {
    items.push("Passivo fiscal e certidoes");
  }
  if (isOmissoesRisk(input)) {
    items.push("Omissoes e pendencias");
  }
  if (isRecuperacaoCreditosCandidato(input) || input.possuiCreditoIcms !== "nao") {
    items.push("Recuperacao de creditos e ativos fiscais");
  }
  if (isCaixaBancosRelevante(input)) {
    items.push("Impacto em caixa, bancos e negociacao");
  }

  items.push("Plano de acao recomendado", "Proposta de encaminhamento para assessoria");
  return unique(items);
}

function buildAlertasDocumento(input: DiagnosticInput): string[] {
  const items: string[] = [];

  if (input.regimeTributario === "simples") {
    items.push("Validar PGDAS-D, RBT-12 e Fator R antes de qualquer conclusao sobre Simples.");
  }
  if (input.possuiDividaFiscal !== "nao") {
    items.push("Passivo depende de extratos RFB, PGFN, SEFAZ e municipio.");
  }
  if (input.possuiCreditoIcms !== "nao") {
    items.push("Credito de ICMS depende de origem, escrituracao, homologacao e regras aplicaveis.");
  }
  if (input.setor === "industria" || input.setor === "comercio") {
    items.push("NCM, estoque e ST precisam ser conferidos em SPED/XML.");
  }

  return items;
}

export function calculateDiagnostic(rawInput: unknown): DiagnosticResult {
  const input = DiagnosticInputSchema.parse(rawInput);
  const score = calculateScore(input);
  const nivel = getRiskLevel(score);
  const exposure = calculateExposure(input);
  const dividasDetalhadas = getDebtBreakdown(input);
  const perfilEmpresa = buildCompanyProfile(input);

  const result: DiagnosticResult = {
    score,
    nivel,
    ...exposure,
    pressaoB2B: getB2BPressure(input),
    proximoPasso: getNextStep(nivel, input),
    oportunidades: buildOpportunities(input),
    ameacas: buildThreats(input),
    documentos: buildDocuments(input),
    lacunasInformacao: buildLacunas(input),
    modulosParecer: buildModulosParecer(input),
    alertasDocumento: buildAlertasDocumento(input),
    perfilEmpresa,
    dividasDetalhadas,
    premissas: PREMISSAS,
  };

  if (input.possuiCreditoIcms === "sim" && input.valorCreditoIcmsEstimado > 0) {
    result.ativoFiscal = {
      creditoIcmsInformado: input.valorCreditoIcmsEstimado,
      parcelaTeoricaMensal240: Math.round(input.valorCreditoIcmsEstimado / 240),
      observacao:
        "A recuperabilidade depende de origem, escrituracao, homologacao e regras aplicaveis. Nao e promessa de recuperacao.",
    };
  }

  return result;
}

export function buildDiagnosticPackage(rawInput: unknown): DiagnosticPackage {
  const input = DiagnosticInputSchema.parse(rawInput);
  const resultadoBasico = calculateDiagnostic(input);

  return {
    resultadoBasico,
    insumosParecer: {
      respostasOriginais: input,
      premissasUsadas: PREMISSAS,
      documentosSolicitados: resultadoBasico.documentos,
      modulosAvaliacao: resultadoBasico.modulosParecer,
      lacunasInformacao: resultadoBasico.lacunasInformacao,
      alertasDependentesDocumento: resultadoBasico.alertasDocumento,
    },
  };
}

export function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

export function buildWhatsappSummary(input: DiagnosticInput, result: DiagnosticResult): string {
  const lines = [
    `Radar inicial da Reforma Tributaria - ${input.nomeEmpresa}`,
    "",
    `RT-Score: ${result.score}/100 - risco ${result.nivel}`,
    `Exposicao estimada anual: ${formatCurrency(result.exposicaoMin)} a ${formatCurrency(result.exposicaoMax)}`,
    `Preco da inacao estimado: ${formatCurrency(result.precoInacaoMin)} a ${formatCurrency(result.precoInacaoMax)}`,
    `Pressao B2B por credito: ${result.pressaoB2B}`,
    "",
    "Risco de ficar parado:",
    "Se a empresa nao tomar as redeas da reforma, pode perder margem, caixa, competitividade com clientes PJ e poder de negociacao fiscal.",
    "",
    "3 pontos de atencao:",
    ...result.ameacas.slice(0, 3).map((item) => `- ${item}`),
    "",
    "Para analise avancada, solicitar:",
    ...result.documentos.slice(0, 8).map((item) => `- ${item}`),
    "",
    "Observacao: estimativa preliminar com dados informados verbalmente; nao substitui analise documental.",
  ];

  return lines.join("\n");
}
