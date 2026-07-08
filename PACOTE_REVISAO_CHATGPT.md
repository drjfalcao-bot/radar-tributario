# Pacote para revisao no ChatGPT - Radar Tributario

Data do pacote: 2026-07-08

Este arquivo resume o que foi construido no projeto Radar Tributario para facilitar uma revisao externa pelo ChatGPT. Ele nao contem chaves de API, senhas, tokens, credenciais Google, chaves Supabase ou dados sensiveis reais.

## Prompt sugerido para enviar ao ChatGPT

Use este texto como contexto de produto e revise o sistema abaixo sob quatro angulos:

1. Produto e fluxo comercial: verificar se a jornada lead -> diagnostico -> proposta -> controle financeiro -> cliente ativo esta coerente.
2. Juridico/tributario: revisar as premissas das simulacoes RFB/PGFN, alertas de execucao fiscal, transacao, parcelamento, CAPAG, pequeno valor e transacao individual simplificada.
3. UX e comunicacao: sugerir melhorias para tela compartilhada em reuniao, relatorio ao cliente, texto comercial e clareza visual.
4. Engenharia: apontar riscos de codigo, estrutura de dados, persistencia Supabase, seguranca, LGPD, RLS, deploy e proximos passos.

Importante: as simulacoes sao preliminares. Nao devem prometer deferimento, desconto oficial ou resultado garantido. Tudo depende de e-CAC, REGULARIZE, extratos oficiais, documentos e validacao tecnica.

## Objetivo do sistema

Construir uma plataforma interna tipo CRM/operacao tributaria para:

- Captar leads via Radar da Reforma/Radar Tributario.
- Coletar dados de faturamento, setor, regime, risco fiscal, dividas e oportunidades.
- Transformar o preenchimento inicial em ficha interna de lead.
- Conduzir reuniao consultiva com o cliente, usando tela visual e relatorio.
- Simular caminhos de negociacao de passivo tributario.
- Gerar parecer preliminar interno e relatorio para cliente.
- Gerar proposta comercial com setup, mensalidade e exito.
- Controlar oportunidades financeiras, follow-up, pagamentos e andamento do caso.
- Registrar atos de trabalho necessarios e link de planilhas externas de execucao.

## Stack tecnica

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Supabase
- React Router
- React Hook Form
- Zod
- Lucide React

Scripts:

```bash
npm run dev
npm run lint
npm run build
```

Validacao realizada:

- `npm run lint` passou.
- `npm run build` passou.
- Servidor local respondeu `200` em `http://127.0.0.1:5173/`.

## Rotas principais

- `/` - Radar publico inicial.
- `/login` - Login.
- `/app/leads` - CRM/lista de leads.
- `/app/leads/:id` - Ficha interna do lead/caso.
- `/app/leads/:id/documentos` - Tela de documentos, com orientacao para envio por e-mail.
- `/app/leads/:id/parecer` - Parecer assistido.
- `/print/:id` - Versao para impressao/PDF.
- `/admin/usuarios` - Admin de usuarios.
- `/diagnostico/:id` - Diagnostico individual.
- `/share/:id` - Compartilhamento read-only.

## Arquivos centrais

- `src/lib/RiskCalculator.ts`
  - Motor original do diagnostico/radar.
  - Calcula score, risco, ameacas, oportunidades, documentos e preco de inacao.

- `src/components/RadarForm.tsx`
  - Formulario publico/inicial do radar.

- `src/components/ResultPanel.tsx`
  - Visualizacao do resultado do radar.

- `src/pages/PublicRadarPage.tsx`
  - Entrada publica, cria diagnostico e redireciona para lead quando aplicavel.

- `src/pages/LeadsPage.tsx`
  - CRM com lista de leads.
  - Inclui visualizacoes: lista simples, pipeline e prioridade.

- `src/pages/LeadDetailPage.tsx`
  - Principal area Pro do lead.
  - Contem abas: visao geral, receitas, debitos, mapa fiscal, negociacoes, simulacoes, parecer, proposta, financeiro, relatorio e diagnostico.

- `src/lib/crm.ts`
  - Tipos e regras do CRM.
  - Normaliza dados antigos.
  - Gera relatorios assistidos, proposta, alertas internos, risco judicial e risco de impedimento de transacao.

- `src/components/NegotiationCalculator.tsx`
  - Tela da calculadora de negociacao de passivo.

- `src/lib/negotiationCalculator.ts`
  - Motor matematico da calculadora de negociacao.

- `src/lib/storage.ts`
  - Camada de persistencia local/Supabase.

- `src/lib/supabase.ts`
  - Cliente Supabase via variaveis de ambiente.

- `supabase/schema.sql`
  - Schema principal.

- `supabase/migrations/20260707000000_initial_schema.sql`
  - Migracao inicial.

- `supabase/migrations/20260707001000_add_crm_data.sql`
  - Adicao de `crm_data jsonb`.

## Supabase

Foi usado Supabase para persistencia.

Tabela central esperada:

- `diagnosticos`

Campo importante adicionado:

- `crm_data jsonb`

SQL usado manualmente:

```sql
alter table diagnosticos
  add column if not exists crm_data jsonb;
```

Variaveis esperadas no front:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Nao incluir chave `service_role` no front.

Ponto para revisao:

- Confirmar RLS.
- Confirmar se usuarios comuns so podem acessar leads permitidos.
- Confirmar se admin consegue aprovar usuarios.
- Confirmar se dados fiscais sensiveis estao protegidos.

## Login Google

Foi configurado login Google via Supabase Auth.

Pontos importantes:

- Client OAuth precisa ser do tipo "Aplicativo da Web", nao "App para computador".
- Redirect URI usado pelo Google deve incluir callback do Supabase:
  - `https://<projeto>.supabase.co/auth/v1/callback`
- Origens JavaScript autorizadas para local:
  - `http://127.0.0.1:5173`
  - `http://localhost:5173`

Ponto para revisao:

- Em deploy, adicionar dominio final nas URLs autorizadas do Google e no Supabase Auth.

## Area Pro / CRM

A ficha do lead tem as seguintes abas:

### Visao geral

Campos:

- Status do diagnostico.
- Etapa do funil.
- Temperatura.
- Responsavel.
- Origem.
- Probabilidade comercial.
- Proxima acao.
- Data da proxima acao.
- Narrativa comercial.
- Anotacoes internas.

Objetivo:

- Dar controle comercial basico e contexto do lead.

### Receitas

Campos por receita:

- Descricao.
- Valor.
- Periodo: mensal ou anual.
- Tipo: receita bruta, B2B, B2C, recorrente, avulsa.
- Margem percentual.

Objetivo:

- Mapear tamanho da empresa, exposicao comercial, base de precificacao e impacto da reforma.

### Debitos

Campos por debito:

- Credor: RFB, PGFN, SEFAZ, Municipio, INSS, Outros.
- Descricao.
- Principal.
- Multa/juros.
- Status: em aberto, parcelado, inscrito, discutido, suspenso.
- Vencimento.

Objetivo:

- Separar passivos por esfera e preparar simulacao de regularizacao.

### Mapa fiscal

Campos:

- Canal de entrada.
- Data da classificacao.
- Data do extrato/base.
- Exposicao no relatorio: resumido ou completo.
- Classificacao do debito.
- Impedimento por transacao rescindida.
- Execucao fiscal ativa.
- Citacao confirmada.
- Pagamento ou parcelamento apresentado.
- Garantia judicial apresentada.
- Situacao Receita Federal / PGFN / Uniao.
- Situacao Estado / SEFAZ.
- Situacao Municipio / ISS.
- Certidoes, DCTF e obrigacoes.
- Isencoes, particularidades e dados sensiveis.
- Enquadramento e legislacao vigente.
- Alerta judicial.
- Elegibilidade e simulacao de negociacao.
- Leitura final da situacao do cliente.

Alertas:

- Se execucao ativa + citacao confirmada + sem pagamento/parcelamento + sem garantia judicial:
  - Mostra alerta critico maximo.
  - Texto menciona prazo de 5 dias da Lei de Execucoes Fiscais para pagar ou garantir a execucao.
  - Riscos: constricao patrimonial, bloqueio, penhora e perda de poder de negociacao.

- Se impedimento por transacao rescindida:
  - Mostra alerta critico.
  - Informa possivel bloqueio de transacao por 2 anos.
  - Recomenda parcelamento ordinario como plano B.

### Negociacoes

Calculadora de negociacao de passivo.

Campos de entrada:

- Valor RFB.
- Valor PGFN.
- Valor PGFN previdenciario.
- Porte/perfil:
  - Demais / PJ geral.
  - Pessoa fisica.
  - MEI.
  - ME/EPP.
  - Cooperativa / ensino / OSC.
  - Recuperacao judicial.
- CAPAG:
  - A, B, C, D, Nao sei.
- Transacao rescindida/impedimento.
- Pequeno valor elegivel.
- SELIC mensal estimada.

Campos de liberdade:

- PGFN ordinario:
  - Entrada percentual.
  - Parcelas da entrada.
  - Parcelas do saldo.
  - Parcela minima.

- Transacao CAPAG:
  - Entrada percentual.
  - Parcelas da entrada.
  - Parcelas do saldo.
  - Desconto teto percentual.

- Transacao simplificada:
  - Entrada percentual.
  - Parcelas da entrada.
  - Parcelas do saldo.
  - Desconto teto percentual.

- Pequeno valor:
  - Entrada percentual.
  - Parcelas da entrada.

Formato de valores:

- Campo aceita formato brasileiro:
  - `1.234,56`
  - `1.234.567,89`

Cenarios calculados:

1. RFB - parcelamento administrativo.
   - 60 parcelas.
   - Sem desconto.
   - PF minimo 200.
   - PJ minimo 500.
   - Alerta: sem inscricao/transferencia para PGFN, empresa fica presa a negociacao administrativa da Receita.

2. PGFN - parcelamento comum/ordinario.
   - Padrao 60 parcelas.
   - Sem desconto.
   - Parcela minima parametrizavel.
   - Plano B quando transacao nao estiver disponivel ou houver impedimento.

3. PGFN - transacao por capacidade de pagamento.
   - Elegibilidade indicativa:
     - divida PGFN ate R$ 45 milhoes.
     - inscricao ate 03/03/2026.
     - sem impedimento ativo por transacao rescindida.
   - Entrada padrao 6%.
   - Entrada ate 6x para geral/demais.
   - Entrada ate 12x para favorecidos.
   - Saldo ate 114x para geral/demais.
   - Saldo ate 133x para favorecidos.
   - Se houver previdenciario, prazo total limitado a 60 meses.
   - Desconto teto:
     - ate 65% geral/demais.
     - ate 70% perfil favorecido.
   - Por decisao comercial, simula teto potencial por padrao.
   - Alerta: teto potencial nao e promessa. REGULARIZE define classificacao, base e deferimento.

4. PGFN/Uniao - transacao individual simplificada.
   - Comparativo com entrada padrao de 10%.
   - Saldo padrao em 60x.
   - Simula desconto teto potencial para comparar com transacao por CAPAG.
   - Alerta: faixa oficial usual exige divida ativa consolidada superior a R$ 1 milhao e inferior a R$ 10 milhoes. Deve ser revisado.

5. PGFN - pequeno valor.
   - So habilita quando marcado como elegivel.
   - Entrada padrao 5% em ate 5x.
   - Faixas:
     - saldo em ate 7 meses: 50%.
     - ate 12 meses: 45%.
     - ate 30 meses: 40%.
     - ate 55 meses: 30%.
   - Alerta: depende de perfil, valor, data de inscricao e edital.

Formula:

```txt
entrada_total = divida * entrada_percentual
entrada_parcela = entrada_total / quantidade_parcelas_entrada
saldo_base = divida - entrada_total
desconto = saldo_base * desconto_percentual
saldo_negociado = saldo_base - desconto
parcela_saldo = PMT(saldo_negociado, meses_saldo, selic_mensal)
se selic_mensal = 0: parcela_saldo = saldo_negociado / meses_saldo
parcela_saldo = max(parcela_saldo, parcela_minima)
total_negociado = entrada_total + parcela_saldo * meses_saldo
economia_estimada = divida - total_negociado
```

Ponto critico para revisao:

- Confirmar metodologia juridica dos descontos.
- Confirmar se o uso do teto potencial como simulacao comercial esta adequado com ressalvas suficientes.
- Confirmar regra de transacao individual simplificada.
- Confirmar regras de parcela minima PGFN ordinaria por perfil.
- Confirmar limites para debito previdenciario.

### Simulacoes

Mostra paineis:

- Regularizacao da Uniao.
- Reforma tributaria.
- Proposta indicativa.

Atualmente a aba ainda e simples. Pode ser evoluida para cenarios comparativos visuais.

### Parecer assistido

Campos:

- Observacoes internas.
- Insumos manuais da leitura por chat.
- Estrategia de mercado.
- Estrategia tecnica e legislacao.
- Relatorio interno.
- Relatorio para o cliente.

Objetivo:

- Permitir que o usuario use ChatGPT externo para ler documentos e cole manualmente conclusoes no CRM.
- O sistema fabrica parecer preliminar conforme score, dados e campos preenchidos.

Ainda nao ha IA integrada dentro do sistema.

### Proposta

Campos:

- Estrategia:
  - regularizacao.
  - reforma.
  - recuperacao de creditos.
  - blindagem.
  - mista.
- Titulo da proposta.
- Setup tecnico.
- Mensalidade.
- Exito percentual.
- Base de exito.
- Economia/beneficio estimado.
- Validade.
- Condicoes.
- Escopo.
- Premissas e ressalvas.
- Proposta gerada.
- Mensagem WhatsApp.

Regra atual:

- Exito inicia em 20%.
- Campo permanece editavel.
- Leads antigos com exito antigo de 8% e sem proposta gerada sao normalizados para 20%.

Ao clicar em "Gerar proposta":

- Status do funil vira proposta.
- Controle financeiro vira proposta.
- Data de envio e follow-up sao preenchidas.
- Potencial de setup, mensalidade e exito sao copiados para area financeira.

### Financeiro

Nova aba criada para controlar oportunidades financeiras e casos ativos.

Campos:

- Status do negocio:
  - lead.
  - proposta.
  - ganho.
  - perdido.

- Previsao de fechamento.
- Potencial de entrada.
- Potencial mensal.
- Potencial exito.
- Proposta enviada em.
- Follow-up em.
- Ultima resposta.
- Status pagamento:
  - nao iniciado.
  - aguardando.
  - pago.
  - atrasado.
  - cancelado.
- Valor a receber.
- Vencimento.
- Pago em.
- Link Sheets execucoes.
- Perfil e contexto do cliente.
- Decisor.
- Contato financeiro.
- Objecoes.
- Status dos documentos.
- Notas de relacionamento.
- Andamento do trabalho.
- Atos de trabalho necessarios.

Atos selecionaveis:

- Extratos RFB/PGFN.
- Certidoes.
- Execucoes fiscais.
- Negociacao REGULARIZE.
- Simulacao de passivo.
- Analise da reforma.
- Parecer tecnico.
- Proposta comercial.
- Reuniao de fechamento.
- Acompanhamento de pagamento.

Alertas internos:

- Proposta sem resposta:
  - quando status e proposta e nao ha resposta registrada.
  - usa data de follow-up vencida ou proposta enviada ha 3+ dias.

- Pagamento atrasado:
  - quando vencimento passou e status nao e pago/cancelado.
  - tambem alerta se status foi marcado como atrasado.

- Atualizar andamento do trabalho:
  - quando negocio foi ganho ou etapa e cliente.
  - alerta se nao ha andamento ou se andamento esta sem atualizacao ha 7+ dias.

Quando status vira:

- `perdido`: funil vai para perdido e aparecem campos de motivo/perda.
- `ganho`: funil vai para cliente.
- `proposta`: funil vai para proposta.

### Relatorio

Relatorio copiavel inclui:

- Prioridade comercial.
- Receita anual.
- Debito fiscal total.
- Etapa.
- Status financeiro.
- Potencial entrada/mensal/exito.
- Status do pagamento.
- Alertas internos.
- Leitura executiva.
- Acao recomendada.
- Alerta judicial.
- Alerta de impedimento de transacao.
- Risco de inacao na reforma.
- Andamento do trabalho.
- Atos necessarios.
- Link de execucoes.
- Principais riscos.
- Documentos prioritarios.

Se houver risco critico:

- Bloco visual vermelho para execucao com citacao.
- Bloco visual vermelho para impedimento de transacao.

## Documentos

Tela de documentos nao faz upload.

Comportamento:

- Orienta que documentos devem ser enviados por e-mail.
- Tem botao de voltar.

Motivo:

- Evitar criar upload de arquivos fiscais sensiveis sem estrutura de seguranca, storage, permissao e LGPD.

## Fontes oficiais usadas no rodape da calculadora

- PGFN Edital 06/2026 - Transacao por capacidade:
  - https://www.gov.br/pgfn/pt-br/servicos/orientacoes-contribuintes/acordo-de-transacao/edital-no-6-2026/transacao-conforme-a-capacidade-de-pagamento-edital-ndeg-06-2026

- PGFN Edital 06/2026 - Pequeno valor:
  - https://www.gov.br/pgfn/pt-br/servicos/orientacoes-contribuintes/acordo-de-transacao/edital-no-6-2026/transacao-de-pequeno-valor-edital-ndeg-06-2026

- PGFN - Transacao individual simplificada:
  - https://www.gov.br/pgfn/pt-br/servicos/orientacoes-contribuintes/acordo-de-transacao/transacao-individual-simplificada

- PGFN - Parcelamentos:
  - https://www.gov.br/pgfn/pt-br/servicos/perguntas-frequentes/parcelamentos

- Receita Federal - Parcelamento:
  - https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria/pagamentos-e-parcelamentos/parcelamentos/parcelamento-nao-previdenciario-acesso-via-portal-e-cac

## Regras de risco judicial

Funcao central:

- `buildJudicialRisk(crm)`

Condicao critica:

```txt
execucao fiscal ativa = sim
citacao confirmada = sim
pagamento/parcelamento apresentado = nao
garantia judicial apresentada = nao
```

Resultado:

- Alerta critico maximo.
- Menciona prazo de 5 dias para pagar ou garantir execucao.
- Menciona risco de bloqueio, penhora, constricao e perda de poder de negociacao.

Ponto para revisao:

- Confirmar redacao juridica com base na Lei de Execucoes Fiscais.
- Confirmar se a mensagem esta comercialmente forte sem ser indevida.

## Regras de impedimento de transacao

Campo:

- `transactionImpedimentActive`

Se marcado:

- Alerta que transacao pode estar bloqueada por 2 anos.
- Recomenda simular parcelamento ordinario como plano B.
- Proibe promessa de desconto/alongamento sem REGULARIZE.

Ponto para revisao:

- Validar regra exata de impedimento por rescindida conforme edital e normas PGFN.
- Ajustar texto conforme regra vigente.

## Areas ainda nao construidas

- IA/chat nativo dentro do sistema.
- Upload seguro de documentos.
- Automacao real de e-mail/WhatsApp.
- Notificacoes externas.
- Agenda integrada.
- Controle multiusuario com permissoes refinadas.
- Dashboard financeiro consolidado de todos os leads.
- Deploy final em dominio publico.
- Logs/auditoria de alteracoes.
- LGPD completa.
- Exportacao PDF sofisticada.

## Pontos fortes atuais

- O sistema ja tem fluxo completo de lead para proposta.
- A ficha do lead concentra dados comerciais, fiscais, financeiros e de andamento.
- Calculadora de negociacao compara RFB, PGFN ordinario, transacao CAPAG, transacao simplificada e pequeno valor.
- Relatorio final ja mistura risco fiscal, reforma, judicial, impedimento e financeiro.
- Campos sao editaveis para permitir analise humana.
- O sistema evita prometer resultado oficial.

## Pontos frageis para revisar

- Metodologia juridica da transacao individual simplificada.
- Premissa comercial de usar desconto no teto potencial por padrao.
- Regras de parcela minima PGFN ordinaria.
- Tratamento de debitos previdenciarios.
- Distincao entre RFB ainda administrativa e PGFN inscrita.
- RLS e permissoes no Supabase.
- Dados sensiveis e LGPD.
- UX das telas densas em reuniao com cliente.
- Responsividade mobile.
- Falta de deploy final.
- Falta de IA/documentos nativa.

## Arquivos externos do usuario para comparar

O usuario mencionou estes arquivos como base/consulta:

- `SIMULADOR.html`
- `PLATAFORMA DE NEGOCIACAO - SIMULACAO.html`

Sugestao ao ChatGPT:

- Comparar a experiencia, linguagem, campos e metodologia desses arquivos com a calculadora atual em `src/components/NegotiationCalculator.tsx` e `src/lib/negotiationCalculator.ts`.

## Pedido objetivo de revisao

Revise se o Radar Tributario esta coerente para uso interno como CRM fiscal/comercial e para demonstracao em reuniao com cliente. Aponte:

1. O que esta juridicamente arriscado ou impreciso.
2. O que deve virar campo obrigatorio.
3. O que deve sair do relatorio do cliente e ficar apenas interno.
4. O que precisa de fonte oficial.
5. O que melhora a conversao comercial.
6. O que deve ser priorizado antes de deploy.
7. O que deve ser modelado no banco em tabelas proprias em vez de `crm_data jsonb`.
8. Como melhorar a calculadora de passivo sem prometer resultado.
9. Como transformar isso em versao publica de captacao por Google Ads.
10. Como estruturar uma futura IA interna com leitura de documentos sem violar seguranca/LGPD.

