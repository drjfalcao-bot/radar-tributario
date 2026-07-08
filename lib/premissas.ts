export const PREMISSAS = {
  versao: "2026-07-03",
  fontes: [
    {
      nome: "Receita Federal - Orientacoes Reforma Tributaria 2026",
      url: "https://www.gov.br/receitafederal/pt-br/acesso-a-informacao/acoes-e-programas/programas-e-atividades/reforma-tributaria-do-consumo/orientacoes-2026",
      uso: "Documentos fiscais, ano teste e dispensa de recolhimento em 2026",
    },
    {
      nome: "CGIBS - Campos IBS/CBS a partir de 03/08/2026",
      url: "https://www.cgibs.gov.br/novo-marco-da-reforma-tributaria-inicia-em-03-de-agosto-com-preenchimento-obrigatorio-dos-campos-relativos-ao-ibs-e-a-cbs",
      uso: "Campos IBS/CBS nos documentos fiscais",
    },
    {
      nome: "Ministerio da Fazenda - Resolucao CGSN 186/2026",
      url: "https://www.gov.br/fazenda/pt-br/assuntos/noticias/2026/abril/comite-define-prazos-de-opcao-pelo-simples-nacional-e-pelo-regime-regular-do-ibs-e-da-cbs-para-2027",
      uso: "Janela setembro/2026 para Simples e regime regular IBS/CBS",
    },
  ],
  aliquotas: {
    teste2026: { cbs: 0.009, ibs: 0.001, efeitoCaixa: false },
    referencia: { cbs: 0.088, ibs: 0.177, status: "estimativa_parametrizavel" },
  },
  fatoresSetoriais: {
    comercio: 1.0,
    servicos: 1.0,
    industria: 1.0,
    profissional: 0.7,
    saude_educacao_agro: 0.4,
    imobiliario: 0.5,
    financeiro: 0.65,
    seletivo: 1.2,
    nao_sei: 1.0,
  },
  multiplicadoresInacao: {
    b2b: 0.35,
    margem: 0.12,
    operacionalNaoPreparado: 0.012,
    operacionalParcial: 0.006,
    passivo: 0.03,
  },
  intervaloEstimativa: {
    exposicaoMin: 0.8,
    exposicaoMax: 1.25,
    inacaoMin: 0.75,
    inacaoMax: 1.3,
  },
} as const;
