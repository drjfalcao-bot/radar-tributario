# Plano de Implementacao - Diagnostico Estrategico

## Base

- Repositorio: `drjfalcao-bot/radar-tributario`
- Branch: `main`
- Base lida para esta fase: `028bb1bc1ca0f2a13c733a5c8b56ba2e1b4f98ea`
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

- Mensagem planejada: `refactor: corrige motores de simulacao estrategica`
- SHA: pendente de publicacao