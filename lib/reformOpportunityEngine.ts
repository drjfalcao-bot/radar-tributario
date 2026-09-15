export type ReformUrgency = "agora" | "90_dias" | "2027" | "acompanhar";

export type ReformOpportunityNature =
  | "planejamento"
  | "carga"
  | "recuperacao"
  | "regularizacao"
  | "contencioso"
  | "garantias"
  | "compliance";

export type ReformCertainty = "A" | "B" | "C";

export type ReformFilterInput = {
  nomeEmpresa: string;
  regimeTributario: "simples" | "presumido" | "real" | "cooperativa" | "outro" | "nao_sei";
  faturamentoAnual: number;
  percentualB2B: number;
  atividade:
    | "servicos"
    | "comercio"
    | "industria"
    | "transportes"
    | "construcao"
    | "agro"
    | "imobiliario"
    | "outro";
  usaBeneficioFiscalFederal: boolean;
  possuiBeneficioOnerosoIcms: boolean;
  debitoRfbDefinitivoDias: number;
  possuiCdaExecucao: boolean;
  garantiaExecucao: "nenhuma" | "seguro" | "fianca" | "outra";
  multaAutoPercentual: number;
  emiteNfseMeEpp: boolean;
  sistemaFiscalPreparado: "sim" | "parcial" | "nao" | "nao_sei";
};

export type ReformOpportunity = {
  id: string;
  titulo: string;
  natureza: ReformOpportunityNature;
  urgencia: ReformUrgency;
  score: number;
  certeza: ReformCertainty;
  norma: string;
  prazo?: string;
  porQueDisparou: string;
  acaoRecomendada: string;
  ressalva: string;
  fonteLabel: string;
  fonteUrl: string;
};

type Rule = {
  id: string;
  test: (input: ReformFilterInput) => boolean;
  build: (input: ReformFilterInput) => ReformOpportunity;
};

const SOURCE = {
  simples2027:
    "https://www.gov.br/receitafederal/pt-br/assuntos/noticias/2026/setembro/receita-federal-alerta-comeca-hoje-o-prazo-para-opcao-pelo-simples-nacional-e-para-a-escolha-do-modelo-de-recolhimento-do-ibs-e-da-cbs-em-2027/",
  lc224:
    "https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/perguntas-e-respostas/beneficios-fiscais/perguntas-e-respostas-reducao-dos-incentivos-e-beneficios-tributarios-v5-final.pdf/view",
  orientacoes2026:
    "https://www.gov.br/receitafederal/pt-br/acesso-a-informacao/acoes-e-programas/programas-e-atividades/reforma-tributaria-do-consumo/orientacoes-2026",
  lc236: "https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp236.htm",
  nfse:
    "https://www.gov.br/receitafederal/pt-br/assuntos/noticias/2026/agosto/simples-nacional-nfs-e-nacional-sera-obrigatoria-para-me-e-epp-a-partir-de-1o-de-novembro-de-2026",
  cooperativas:
    "https://www.gov.br/receitafederal/pt-br/assuntos/noticias/2026/setembro/receita-federal-disponibiliza-opcao-pelo-regime-especifico-do-ibs-e-da-cbs-das-sociedades-cooperativas",
} as const;

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

const RULES: Rule[] = [
  {
    id: "RT-SN-001",
    test: (input) => input.regimeTributario === "simples",
    build: (input) => ({
      id: "RT-SN-001",
      titulo: "Decidir o modelo de recolhimento de IBS/CBS no Simples para 2027",
      natureza: "planejamento",
      urgencia: "agora",
      score: input.percentualB2B >= 30 ? 98 : 94,
      certeza: "A",
      norma: "LC 214/2025, LC 227/2026 e regulamentacao do Simples",
      prazo: "30/09/2026",
      porQueDisparou:
        input.percentualB2B >= 30
          ? `Empresa no Simples com ${input.percentualB2B}% de vendas B2B. O perfil torna a escolha do modelo de IBS/CBS especialmente sensivel a credito e competitividade.`
          : "Empresa enquadrada no Simples Nacional. A escolha do modelo de recolhimento do IBS/CBS para 2027 esta em janela operacional em setembro de 2026.",
      acaoRecomendada:
        "Simular Simples integral x permanencia no Simples com IBS/CBS no regime regular, considerando creditos de entrada, credito transferido ao cliente, margem e composicao B2B/B2C.",
      ressalva:
        "Nao existe resposta universal de que o regime regular seja melhor para B2B. A decisao depende da cadeia de compras, margem e perfil dos clientes.",
      fonteLabel: "Receita Federal — opcao do Simples e modelo IBS/CBS 2027",
      fonteUrl: SOURCE.simples2027,
    }),
  },
  {
    id: "RT-224-001",
    test: (input) => input.regimeTributario === "presumido" && input.faturamentoAnual > 5_000_000,
    build: (input) => ({
      id: "RT-224-001",
      titulo: "Recalcular Lucro Presumido apos a LC 224",
      natureza: "carga",
      urgencia: "agora",
      score: 95,
      certeza: "A",
      norma: "LC 224/2025 e orientacao RFB 2026",
      porQueDisparou: `Faturamento anual estimado de ${formatCurrency(input.faturamentoAnual)} no Lucro Presumido, acima do limite anual de referencia de R$ 5 milhoes para aplicacao do acrescimo nos coeficientes de presuncao sobre a parcela excedente.`,
      acaoRecomendada:
        "Recalcular IRPJ/CSLL de 2026 por trimestre e comparar Lucro Presumido x Lucro Real para 2027, separando receitas sujeitas aos coeficientes das receitas financeiras e ganhos de capital.",
      ressalva:
        "O acrescimo e no coeficiente de presuncao e nao uma elevacao linear de 10% do imposto. Em 2026, IRPJ e CSLL tambem exigem leitura temporal propria.",
      fonteLabel: "RFB — Perguntas e Respostas sobre a LC 224, versao 5",
      fonteUrl: SOURCE.lc224,
    }),
  },
  {
    id: "RT-224-002",
    test: (input) => input.usaBeneficioFiscalFederal,
    build: () => ({
      id: "RT-224-002",
      titulo: "Revisar beneficio fiscal federal atingido pela reducao da LC 224",
      natureza: "carga",
      urgencia: "agora",
      score: 91,
      certeza: "B",
      norma: "LC 224/2025, alteracoes posteriores e regulamentacao aplicavel",
      porQueDisparou:
        "Foi informado uso de beneficio ou incentivo fiscal federal. A LC 224 aplica mecanismos distintos de reducao conforme a modalidade do beneficio e contem excecoes relevantes.",
      acaoRecomendada:
        "Identificar o beneficio exato, base legal, modalidade e formula de reducao; depois testar se a empresa esta em excecao ou se houve alteracao posterior que preserve o tratamento.",
      ressalva:
        "Nao tratar a LC 224 como simples 'corte de 10%'. Aliquota zero, aliquota reduzida, base reduzida, credito presumido e outros beneficios seguem mecanismos diferentes.",
      fonteLabel: "RFB — Perguntas e Respostas sobre beneficios fiscais",
      fonteUrl: SOURCE.lc224,
    }),
  },
  {
    id: "RT-ICMS-001",
    test: (input) => input.possuiBeneficioOnerosoIcms,
    build: () => ({
      id: "RT-ICMS-001",
      titulo: "Preparar habilitacao de beneficio oneroso de ICMS",
      natureza: "recuperacao",
      urgencia: "agora",
      score: 94,
      certeza: "B",
      norma: "LC 214/2025, art. 384, e regulamentacao de 2026",
      porQueDisparou:
        "Foi informado beneficio oneroso de ICMS. Desde janeiro de 2026 existem procedimentos para habilitacao a futuros direitos de compensacao decorrentes da transicao.",
      acaoRecomendada:
        "Levantar ato concessivo, programa, contrapartidas, prazo, valores usufruidos e documentacao de cumprimento para analisar a habilitacao no SISEN.",
      ressalva:
        "Nem todo incentivo de ICMS e beneficio oneroso elegivel. A natureza do programa e as contrapartidas precisam ser comprovadas.",
      fonteLabel: "RFB — Orientacoes da Reforma Tributaria para 2026",
      fonteUrl: SOURCE.orientacoes2026,
    }),
  },
  {
    id: "RT-236-001",
    test: (input) => input.debitoRfbDefinitivoDias >= 90,
    build: (input) => ({
      id: "RT-236-001",
      titulo: "Revisar debito definitivamente constituido parado na RFB",
      natureza: "regularizacao",
      urgencia: "agora",
      score: 93,
      certeza: "C",
      norma: "LC 236/2026 — CTN art. 201, § 3º",
      porQueDisparou: `Debito informado como definitivamente constituido e parado na RFB ha aproximadamente ${input.debitoRfbDefinitivoDias} dias.`,
      acaoRecomendada:
        "Montar linha do tempo da exigibilidade e avaliar provocacao administrativa para encaminhamento a divida ativa quando a migracao for estrategicamente util para negociacao.",
      ressalva:
        "O novo art. 201 traz prazo geral e modulacoes, mas creditos cuja exigibilidade antecede 04/09/2026 exigem analise de direito intertemporal. O disparo e de investigacao, nao de mora automatica da Administracao.",
      fonteLabel: "LC 236/2026 — texto legal",
      fonteUrl: SOURCE.lc236,
    }),
  },
  {
    id: "RT-236-002",
    test: (input) => input.possuiCdaExecucao,
    build: () => ({
      id: "RT-236-002",
      titulo: "Auditar CDA antes de pagar ou transacionar",
      natureza: "contencioso",
      urgencia: "agora",
      score: 90,
      certeza: "A",
      norma: "LC 236/2026 — CTN art. 201, § 2º",
      porQueDisparou:
        "Foi informada CDA ou execucao fiscal relevante. O CTN passou a explicitar o controle de certeza, liquidez e exigibilidade como direito do contribuinte e dever da Fazenda.",
      acaoRecomendada:
        "Auditar sujeito passivo, corresponsabilidade, pagamentos, parcelamentos, duplicidade, suspensao, decadencia, prescricao, precedentes e erros materiais antes de definir a negociacao.",
      ressalva:
        "A regra reforca o direito ao controle de legalidade, mas nao torna a CDA nula automaticamente.",
      fonteLabel: "LC 236/2026 — texto legal",
      fonteUrl: SOURCE.lc236,
    }),
  },
  {
    id: "RT-236-003",
    test: (input) =>
      input.possuiCdaExecucao && (input.garantiaExecucao === "seguro" || input.garantiaExecucao === "fianca"),
    build: () => ({
      id: "RT-236-003",
      titulo: "Testar suspensao da exigibilidade pela garantia aceita",
      natureza: "garantias",
      urgencia: "agora",
      score: 87,
      certeza: "A",
      norma: "LC 236/2026 — CTN art. 151, X",
      porQueDisparou:
        "Ha execucao/CDA relevante com seguro-garantia ou fianca bancaria informada.",
      acaoRecomendada:
        "Confirmar se a garantia foi aceita pelo credor e se permanece regular para avaliar a suspensao da exigibilidade prevista no CTN.",
      ressalva:
        "Oferecimento nao e sinonimo de aceitacao. A aplicacao depende da conformidade da garantia e da regulamentacao do orgao de cobranca.",
      fonteLabel: "LC 236/2026 — texto legal",
      fonteUrl: SOURCE.lc236,
    }),
  },
  {
    id: "RT-236-004",
    test: (input) => input.multaAutoPercentual > 75,
    build: (input) => ({
      id: "RT-236-004",
      titulo: "Revisar teto, agravantes e dosimetria da multa",
      natureza: "contencioso",
      urgencia: "agora",
      score: 92,
      certeza: "B",
      norma: "LC 236/2026 — CTN arts. 113-A e 142",
      porQueDisparou: `Auto de infracao informado com multa de ${input.multaAutoPercentual}%.`,
      acaoRecomendada:
        "Revisar natureza da penalidade, dolo, fraude, reincidencia, individualizacao da conduta e circunstancias atenuantes antes de aceitar o percentual aplicado.",
      ressalva:
        "Multas isoladas desvinculadas de valor de tributo ou credito tem tratamento proprio. Os limites nao podem ser aplicados mecanicamente sem classificar a penalidade.",
      fonteLabel: "LC 236/2026 — texto legal",
      fonteUrl: SOURCE.lc236,
    }),
  },
  {
    id: "RT-SN-002",
    test: (input) => input.emiteNfseMeEpp,
    build: () => ({
      id: "RT-SN-002",
      titulo: "Adequar emissao para a NFS-e Nacional",
      natureza: "compliance",
      urgencia: "90_dias",
      score: 84,
      certeza: "A",
      norma: "Resolucao CGSN 191/2026",
      prazo: "01/11/2026",
      porQueDisparou:
        "Foi informado que a empresa e ME/EPP prestadora de servicos sujeita a emissao de NFS-e.",
      acaoRecomendada:
        "Validar emissor, ERP, integracao por API e cadastros tributarios para migrar ao padrao nacional antes da obrigatoriedade.",
      ressalva:
        "A obrigatoriedade da NFS-e em novembro nao antecipa a aplicacao de IBS/CBS no Simples, cujos efeitos para os optantes comecam em janeiro de 2027.",
      fonteLabel: "Receita Federal — NFS-e Nacional para ME/EPP",
      fonteUrl: SOURCE.nfse,
    }),
  },
  {
    id: "RT-COOP-001",
    test: (input) => input.regimeTributario === "cooperativa",
    build: () => ({
      id: "RT-COOP-001",
      titulo: "Avaliar opcao pelo regime especifico de IBS/CBS da cooperativa",
      natureza: "planejamento",
      urgencia: "90_dias",
      score: 96,
      certeza: "A",
      norma: "LC 214/2025 e regulamentacao de 2026",
      prazo: "31/10/2026",
      porQueDisparou: "Sociedade cooperativa identificada no filtro.",
      acaoRecomendada:
        "Simular o regime especifico e formalizar a opcao no Portal Tributacao sobre Consumo se o enquadramento e o efeito economico forem favoraveis.",
      ressalva:
        "Confirmar quais operacoes da cooperativa estao efetivamente abrangidas pelas reducoes e condicoes do regime especifico.",
      fonteLabel: "Receita Federal — opcao das cooperativas para 2027",
      fonteUrl: SOURCE.cooperativas,
    }),
  },
  {
    id: "RT-2026-001",
    test: (input) => input.sistemaFiscalPreparado !== "sim",
    build: (input) => ({
      id: "RT-2026-001",
      titulo: "Corrigir preparo de ERP e documentos fiscais para IBS/CBS",
      natureza: "compliance",
      urgencia: "agora",
      score: input.sistemaFiscalPreparado === "nao" ? 89 : 82,
      certeza: "A",
      norma: "LC 214/2025 e atos tecnicos RFB/CGIBS aplicaveis em 2026",
      porQueDisparou:
        input.sistemaFiscalPreparado === "nao"
          ? "A empresa informou que ERP/emissor ainda nao esta preparado para IBS/CBS."
          : "O preparo do ERP/emissor foi informado como parcial ou desconhecido.",
      acaoRecomendada:
        "Revisar leiautes, campos IBS/CBS, cClassTrib, cadastro de produtos/servicos e rotina de emissao com o ERP e a contabilidade.",
      ressalva:
        "2026 e ano de teste e ha hipoteses de dispensa de recolhimento ligadas ao cumprimento das obrigacoes documentais; isso aumenta a importancia de emitir corretamente.",
      fonteLabel: "Receita Federal — Orientacoes da Reforma Tributaria para 2026",
      fonteUrl: SOURCE.orientacoes2026,
    }),
  },
];

export function evaluateReformOpportunities(input: ReformFilterInput): ReformOpportunity[] {
  return RULES.filter((rule) => rule.test(input))
    .map((rule) => rule.build(input))
    .sort((a, b) => b.score - a.score);
}

export function getReformOpportunityRulesCount(): number {
  return RULES.length;
}
