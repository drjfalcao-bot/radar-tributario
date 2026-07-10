# Radar Tributário — Especificação consolidada V3

Data de consolidação: 10/07/2026

## 1. Regra de interpretação

As imagens aprovadas e o HTML original do simulador são especificações obrigatórias, não referências genéricas.

A implementação deve reproduzir:

- hierarquia visual;
- composição;
- proporções;
- densidade;
- identidade verde-petróleo, azul-petróleo e dourado institucional;
- fluxo operacional;
- campos;
- lógica de uso em reunião;
- separação entre ambiente do cliente e ambiente interno.

Não substituir por dashboard genérico, landing page, CRM genérico ou calculadora técnica desconectada da rotina comercial.

## 2. Produto

O Radar Tributário é um sistema operacional estratégico para atendimento empresarial. O CRM é apenas um dos módulos.

Fluxo principal:

1. Primeiro contato;
2. Cadastro da empresa e contatos;
3. Reunião consultiva;
4. Diagnóstico guiado;
5. Simulação de passivo e/ou Reforma;
6. Parecer;
7. Proposta;
8. Fechamento;
9. Contrato e plano financeiro;
10. Onboarding;
11. Operação;
12. Cobrança e acompanhamento;
13. Histórico permanente no Dossiê Empresarial 360.

Entidade central:

`Empresa -> Contatos -> Oportunidades -> Diagnósticos -> Simulações -> Propostas -> Contratos -> Operações -> Pagamentos`

Não tratar o lead como entidade definitiva. O registro existente pode continuar tecnicamente em `diagnosticos`, mas a interface deve apresentar a empresa como centro permanente.

## 3. Arquitetura de telas

### 3.1 Página 0 — Central Estratégica

Rota:

`/app/inicio`

Objetivo:

- ser a primeira experiência após o login;
- servir como chamariz e diagnóstico rápido;
- permitir uso compartilhando a tela em reunião;
- mostrar impacto sem expor parâmetros internos avançados.

Estrutura visual obrigatória:

1. barra lateral estreita;
2. cabeçalho escuro com marca, título, subtítulo, busca, notificações e usuário;
3. dois painéis escuros equivalentes lado a lado;
4. faixa horizontal clara de diagnóstico completo;
5. seção editorial “Fique ligado nas decisões”.

#### Painel Reforma — campos

- faturamento mensal;
- regime tributário;
- atividade principal;
- vendas B2B (%);
- compras e insumos mensais;
- folha de pagamento mensal;
- tributos pagos atualmente.

Resultado preliminar:

- carga atual estimada;
- carga projetada;
- possível impacto anual;
- créditos estimados;
- pressão sobre margem;
- pontos que exigem preparação.

Não usar “risco de inação” como título principal. Preferir:

- possível aumento de custos;
- impacto sobre a margem;
- necessidade de revisar preços;
- oportunidades de crédito;
- pontos que exigem preparação.

#### Painel Passivo — campos

Identificação e perfil:

- porte da empresa;
- CAPAG: A, B, C, D ou não informada;
- impedimento para transação: sim, não ou não sei.

Dívidas PGFN separadas:

- Simples Nacional;
- Previdenciário;
- Tributário;
- Demais Débitos.

Receita Federal:

- total em aberto;
- parcelamento inicial;
- primeiro reparcelamento;
- já houve reparcelamento anterior;
- não sei.

Risco:

- execução fiscal ativa;
- bloqueio ou penhora.

Resultado preliminar:

- passivo federal informado;
- pressão financeira do cenário atual;
- possível cenário estratégico;
- atenção prioritária.

A Página 0 não mostra configurações avançadas, base redutível, desconto manual, garantia detalhada ou estratégia interna.

### 3.2 Área Pro — CRM interno

Rota:

`/app/pro`

Referência de experiência:

CRM corporativo inspirado em HubSpot, adaptado à rotina tributária e empresarial.

Menu:

- Início;
- Área Pro;
- Empresas;
- Pipeline;
- Tarefas;
- Operações;
- Financeiro;
- Relatórios;
- Configurações.

Cabeçalho:

- Área Pro;
- CRM interno;
- busca por empresa, CNPJ, contato ou oportunidade;
- Nova empresa;
- Nova oportunidade.

KPIs:

- empresas ativas;
- oportunidades abertas;
- valor em negociação;
- diagnósticos pendentes;
- propostas abertas;
- tarefas vencidas.

Pipeline comercial:

1. Novo Lead;
2. Contato realizado;
3. Reunião agendada;
4. Diagnóstico;
5. Estratégia definida;
6. Proposta enviada;
7. Negociação;
8. Contratado;
9. Perdido.

Blocos inferiores:

- atividades e prioridades;
- tarefas de hoje;
- ações atrasadas;
- empresas recentes.

Todo número deve ser real ou estado vazio. Não criar empresas ou valores fictícios apenas para preencher a imagem.

### 3.3 Simulador Estratégico de Passivo

Rota:

`/app/simulador-passivo`

A interface segue a metodologia operacional do HTML original:

- identificação da empresa;
- blocos de entrada simples;
- separação por natureza;
- parâmetros avançados opcionais;
- KPIs;
- tabelas;
- comparação de cenários;
- impressão/PDF;
- resumo copiável.

O HTML é referência de fluxo e usabilidade. As regras matemáticas e jurídicas devem ser corrigidas e centralizadas no motor TypeScript.

Campos:

- empresa;
- CNPJ;
- porte;
- CAPAG;
- impedimento;
- execução fiscal;
- bloqueio/penhora;
- modo automático, CAPAG, TIS, ordinário ou individual;
- PGFN por quatro naturezas;
- RFB separada;
- situação do parcelamento RFB;
- parâmetros avançados por natureza;
- base redutível estimada;
- desconto;
- entrada;
- parcelas da entrada;
- prazo total;
- custo estimado da garantia.

Saídas:

- dívida original;
- redução estimada;
- saldo negociado;
- economia potencial;
- entrada total;
- quantidade e valor das parcelas de entrada;
- saldo;
- prazo e parcela média;
- tabela por natureza;
- RFB separada;
- cenário atual;
- cenário atingível;
- estratégia em duas etapas;
- TIS;
- garantia;
- alertas e premissas.

Regras obrigatórias:

- não aplicar desconto automático a RFB;
- no parcelamento inicial da RFB não existe entrada extraordinária; existe primeira parcela normal;
- primeiro reparcelamento RFB: 10%;
- reparcelamentos posteriores: 20%;
- prazo RFB até 60 parcelas;
- parcela mínima PJ RFB: R$ 500;
- redução PGFN somente sobre base redutível informada/estimada;
- principal não recebe redução automática;
- CAPAG A/B/não informada não recebe desconto automático;
- CAPAG C/D permite simular redução dentro dos limites parametrizados;
- entrada de referência PGFN: 6%;
- entrada até 6 parcelas para perfil geral e 12 para perfis favorecidos;
- saldo até 114 parcelas para perfil geral e 133 para favorecidos;
- previdenciário respeita prazo total máximo aplicável de 60 meses;
- teto de redução: 65% geral e 70% favorecidos, limitado à base redutível;
- parcela mínima de transação: R$ 25 para MEI e R$ 100 para os demais;
- TIS: dívida consolidada estritamente superior a R$ 1 milhão e inferior a R$ 10 milhões;
- TIS usa o mesmo motor, não uma calculadora paralela;
- padrão operacional do produto para TIS: entrada de 6% em 12 parcelas, editável;
- acima de R$ 10 milhões, direcionar para negociação individual/análise manual;
- até aproximadamente R$ 97 mil, apenas sinalizar triagem operacional de pequeno valor; o limite jurídico deve vir de regra versionada e fonte vigente;
- garantia é custo/estratégia separada, nunca tratada como redução da dívida;
- valores nominais devem alertar que atualização por SELIC/encargos precisa ser validada em e-CAC/REGULARIZE.

Impedimento:

Mensagem ao cliente:

`Transação indisponível no cenário atual.`

Não dizer que todo parcelamento está bloqueado.

Alternativas a avaliar:

- modalidade disponível;
- pagamento;
- garantia;
- medida administrativa;
- medida processual;
- recuperação de elegibilidade.

Estratégia em duas etapas:

Etapa 1:

- adesão à regularização disponível;
- início e manutenção dos pagamentos;
- documentação de adimplência e boa-fé;
- preservação do caixa e redução de risco imediato.

Etapa 2:

- revisão administrativa e/ou jurídica de classificação/impedimento;
- recuperação de elegibilidade;
- construção do cenário potencial.

Pagamentos da etapa 1 devem ser abatidos para evitar dupla contagem.

### 3.4 Dossiê Empresarial 360

Rota:

`/app/empresas/:id`

Objetivo:

ser a fonte única de contexto da empresa.

Cabeçalho:

- empresa;
- CNPJ;
- regime;
- atividade;
- status;
- responsável;
- origem;
- última atualização;
- atalhos para simulador, documentos, parecer e edição técnica.

Abas:

1. Visão Geral;
2. Fiscal;
3. Passivo;
4. Reforma;
5. Diagnósticos;
6. Simulações;
7. Documentos;
8. Propostas;
9. Operação;
10. Financeiro;
11. Atividades.

Dados obrigatórios do perfil:

- decisor;
- contato financeiro;
- contexto da empresa;
- objeções;
- status documental;
- notas de relacionamento;
- responsável;
- origem;
- temperatura;
- probabilidade;
- próxima ação e data.

Fiscal:

- canal de entrada;
- data da classificação;
- data-base do débito;
- classificação;
- impedimento;
- execução;
- citação;
- pagamento/parcelamento;
- garantia;
- situações federal, estadual e municipal;
- certidões;
- DCTF/obrigações;
- particularidades;
- fundamento normativo;
- elegibilidade;
- leitura fiscal.

Operação:

- onboarding;
- aguardando documentação;
- documentação recebida;
- análise técnica;
- estratégia definida;
- em execução;
- aguardando cliente;
- aguardando órgão;
- entrega em revisão;
- concluído;
- suspenso;
- cancelado.

`Perdido` é comercial. `Cancelado` é operacional/contratual.

Financeiro:

Separar:

1. condição comercial proposta;
2. plano financeiro contratado;
3. recebíveis efetivos.

Campos:

- entrada contratual;
- entrada parcelada;
- mensalidade;
- quantidade de mensalidades;
- êxito;
- base do êxito;
- evento de exigibilidade;
- garantia;
- parecer;
- defesa;
- item personalizado;
- Pix;
- boleto;
- transferência;
- cartão;
- outra forma;
- primeiro vencimento;
- dia fixo;
- periodicidade;
- carência;
- parcelas diferentes;
- datas personalizadas;
- observações;
- histórico de pagamentos.

A proposta original deve permanecer preservada. Mudanças posteriores alteram o plano contratado e mantêm histórico.

## 4. Área do Cliente

A futura Área do Cliente mostra apenas:

- dados básicos da empresa;
- diagnóstico resumido;
- resultados aprovados;
- documentos solicitados;
- propostas aprovadas;
- andamento geral da operação.

Não mostrar:

- notas internas;
- estratégia interna;
- projeções sensíveis;
- parâmetros avançados;
- margem comercial;
- detalhes de CAPAG/impedimento não validados;
- CRM;
- tarefas internas;
- relatórios de risco internos.

## 5. Domínios separados

### Comercial

Pipeline e relacionamento.

### Operacional

Execução do trabalho após fechamento.

### Financeiro

Cobrança, recebíveis e pagamentos.

### Agenda

Próxima ação, reunião, follow-up, vencimento, cobrança, prazo e tarefa.

### Perfil do cliente

Decisor, contatos, contexto, objeções, documentos e relacionamento.

Não colocar perfil do cliente dentro do financeiro.

## 6. Persistência e segurança

- Supabase é a fonte principal;
- preservar dados existentes;
- manter fallback local apenas quando necessário;
- alterações estruturais exigem migration versionada;
- RLS explícita;
- nunca usar service role no frontend;
- não expor chaves;
- documentos fiscais sensíveis exigem storage e políticas adequadas antes de upload;
- registrar auditoria/histórico em evolução futura.

## 7. Critérios de pronto

Um módulo somente é considerado pronto quando:

- está visualmente fiel à referência aprovada;
- os campos definidos existem;
- os botões essenciais funcionam;
- os cálculos usam um motor centralizado;
- dados reais são carregados quando disponíveis;
- estados vazios existem;
- não há números fictícios de produção;
- dados persistem quando o módulo exige persistência;
- TypeScript passa;
- build passa;
- fluxo principal foi testado;
- a integração com a etapa seguinte está definida.

## 8. Regra para agentes futuros

Antes de alterar Central Estratégica, Área Pro, Simulador ou Dossiê:

1. ler `AGENTS.md`;
2. ler esta especificação;
3. abrir a imagem correspondente;
4. ler o HTML original quando a tarefa envolver o simulador;
5. ler o motor em `lib/passivoSimulator.ts`;
6. não criar motor paralelo;
7. não reintroduzir a calculadora antiga no fluxo principal;
8. não substituir a imagem por interpretação genérica;
9. não alterar autenticação, Supabase, RLS ou workflows sem necessidade expressa;
10. rodar lint e build antes de concluir.
