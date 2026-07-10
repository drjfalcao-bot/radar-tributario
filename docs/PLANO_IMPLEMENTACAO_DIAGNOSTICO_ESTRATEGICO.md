# Plano de Implementacao - Diagnostico Estrategico

## Base

- Repositorio: `drjfalcao-bot/radar-tributario`
- Branch: `main`
- Base lida para esta fase: `54c6094826e533d6a063ee9c9ba23a6b249a5bb8`
- Referencia normativa: `docs/ESPECIFICACAO_CALCULADORA_NEGOCIACAO.md`
- Referencia HTML: caminho informado nao ficou acessivel no ambiente local; a implementacao seguiu a ordem de interpretacao da especificacao.

## Fase 1 - motor e regras

Status: concluida.

Itens executados:

- `lib/negotiationCalculator.ts` evoluido como unica fonte de tipos, regras, elegibilidade e calculos.
- CAPAG A/B e nao informada sem reducao automatica.
- CAPAG C/D com reducao configuravel e teto separado da reducao aplicada.
- Situacao RFB tipada com parcelamento inicial, primeiro reparcelamento, novo reparcelamento e configuracao manual.
- Parcelamento inicial RFB sem entrada adicional e sem confundir primeira parcela normal com entrada.
- Base redutivel por composicao detalhada, estimativa percentual, estimativa em valor ou nao informada.
- Reducao limitada a base redutivel; principal nao recebe reducao automatica.
- Estrutura de elegibilidade com status, motivos e alertas por cenario.
- TIS mantida como cenario parametrizavel com elegibilidade nao confirmada ate validacao completa.
- Estrategia em duas etapas preparada sem dupla contagem de valores ja pagos.
- `components/NegotiationCalculator.tsx` ajustado sem criar nova calculadora, preservando a estrutura principal: Divida Original, Reducao, Saldo, Potencial de Economia, Tabela por Natureza, Entrada e Parcelas, Comparacao Atual x Potencial.

## Validacao

- `npm ci`: executado porque o snapshot nao tinha `node_modules`.
- `npm run lint`: aprovado.
- `npm run build`: aprovado.

## Proximas fases

## Pagina 0 - Central Estrategica

Status: concluida.

Arquivos alterados:

- `pages/LeadsPage.tsx`
- `docs/PLANO_IMPLEMENTACAO_DIAGNOSTICO_ESTRATEGICO.md`

Componentes criados no escopo da pagina:

- `StrategicSimulatorCard`
- `PublicUpdateCard`
- `Modal`
- `SideLink`

Comportamento desktop:

- Cabeçalho horizontal verde-petroleo escuro.
- Navegacao lateral estreita e discreta.
- Simulador de Passivo e Simulador da Reforma lado a lado, com mesma altura e peso visual equivalente.
- Faixa clara de Novo Diagnostico Estrategico abaixo dos simuladores.
- Secao editorial Fique ligado nas decisoes com fontes oficiais.

Comportamento mobile:

- Ordem preservada: cabecalho, passivo, reforma, diagnostico, decisoes.
- Cards empilhados sem overflow horizontal.
- Botoes principais permanecem visiveis e acionaveis.

Limitacoes:

- O simulador da reforma permanece como modulo em preparacao; nenhum motor foi implementado nesta tarefa.
- As decisoes usam links institucionais oficiais, sem noticias, datas ou eventos inventados.
- A imagem aprovada nao estava disponivel como arquivo de imagem no ambiente; a implementacao foi comparada contra a especificacao visual e contra as capturas locais em 1680 px, 1440 px e 390 px.

Proximos passos:

- Implementar o modulo oficial da reforma em tarefa propria.
- Integrar futuras atualizacoes oficiais somente com fonte validada.

Fase 2 permanece pendente e nao foi iniciada:

- Reconstrucao visual completa da interface.
- Parametros avancados por natureza.
- Estados visuais finais de elegibilidade.
- Melhorias de UX baseadas no HTML legado quando o arquivo estiver acessivel.

Fase 3 permanece pendente:

- Integracao com Diagnostico Guiado.
- Persistencia ampliada no `crm_data`.
- Sintese estrategica e recuperacao de dados.

## Commit

- Ultimo commit publicado: `54c6094826e533d6a063ee9c9ba23a6b249a5bb8`
- Proximo commit planejado: `feat: implementa pagina inicial da central estrategica`
