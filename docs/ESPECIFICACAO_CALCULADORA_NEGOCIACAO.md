# Especificação funcional — Calculadora de Negociação

## 1. Finalidade

Este documento é a referência permanente para evolução da calculadora de negociação do Radar Tributário.

A calculadora legada em HTML enviada pelo usuário deve ser tratada como **referência de fluxo, organização visual e experiência de uso**, não como fonte normativa das regras tributárias nem como código a ser copiado literalmente.

A implementação oficial deve permanecer em React + TypeScript + Tailwind, reutilizando `lib/negotiationCalculator.ts` e `components/NegotiationCalculator.tsx`.

## 2. Princípio central

Não criar uma segunda calculadora.

A evolução deve ocorrer sobre o motor e os componentes existentes, preservando uma única fonte de verdade para:

- regras;
- tipos;
- elegibilidade;
- cálculos;
- comparações;
- resultados.

A calculadora deve manter a objetividade da referência original:

1. Dívida original;
2. Redução;
3. Saldo;
4. Potencial de economia;
5. Tabela por natureza;
6. Entrada e parcelas;
7. Comparação de cenários.

Evitar transformar o resultado em dezenas de cartões desconectados.

## 3. Estrutura funcional a preservar

### 3.1 Dados do cliente

- Nome / razão social;
- CNPJ;
- Porte / perfil;
- CAPAG;
- Indicador de impedimento;
- Data de eventual rescisão;
- Observações.

### 3.2 Dívida por natureza

A dívida deve ser informada separadamente por natureza:

- Simples Nacional;
- Previdenciária;
- Tributária;
- Demais débitos;
- Receita Federal.

Cada natureza deve ter seus próprios parâmetros e resultados.

Não usar o desconto, a entrada ou o prazo de uma natureza como referência automática para as demais.

### 3.3 Parâmetros por natureza

Cada natureza deve permitir, quando aplicável:

- valor original;
- base redutível;
- percentual de redução aplicado;
- percentual de entrada;
- número de parcelas da entrada;
- prazo total;
- parcela mínima;
- observações;
- alertas.

### 3.4 Resultado principal

Exibir em destaque:

- DÍVIDA ORIGINAL;
- REDUÇÃO ESTIMADA;
- SALDO NEGOCIADO;
- POTENCIAL DE ECONOMIA.

Depois exibir tabela por natureza com:

- natureza;
- valor original;
- base redutível;
- percentual aplicado;
- redução estimada;
- saldo;
- entrada total;
- pagamento da entrada;
- saldo parcelado;
- prazo;
- parcela estimada.

## 4. Perfil / porte do contribuinte

Criar seleção centralizada de perfil:

- Pessoa jurídica geral;
- Microempresa;
- Empresa de pequeno porte;
- MEI;
- Pessoa física;
- Cooperativa;
- Instituição de ensino;
- Organização da sociedade civil;
- Recuperação judicial;
- Outro perfil parametrizável.

As diferenças de regra por perfil devem ficar em uma matriz central, tipada e facilmente atualizável.

Não espalhar condicionais de porte pelos componentes React.

O perfil só deve alterar regras explicitamente configuradas.

## 5. CAPAG

Campo obrigatório de enquadramento:

- A;
- B;
- C;
- D;
- Não informada.

### 5.1 CAPAG A ou B

Por padrão:

- redução aplicada = 0%;
- não assumir desconto automático;
- permitir entrada e prazo;
- apresentar ausência de redução como cenário atual.

Pode existir simulação de revisão apenas quando o operador ativar explicitamente:

`SIMULAR REVISÃO DE CAPAG`

Ao ativar, exigir:

- CAPAG projetada;
- percentual hipotético de redução;
- fundamento / observação;
- indicação visual de que depende de revisão e deferimento.

### 5.2 CAPAG C ou D

Permitir:

- redução configurável;
- entrada;
- parcelas da entrada;
- prazo do saldo.

Não aplicar automaticamente o teto máximo.

Separar sempre:

- teto de referência;
- redução efetivamente aplicada na simulação.

### 5.3 CAPAG não informada

Por padrão:

- redução aplicada = 0%;
- mostrar alerta de necessidade de consulta e enquadramento;
- não assumir 65% ou 70% automaticamente.

## 6. Regras da Receita Federal

Criar campo:

`Situação do parcelamento RFB`

Opções:

1. Parcelamento inicial;
2. Primeiro reparcelamento;
3. Novo reparcelamento após reparcelamento anterior;
4. Configuração manual.

### 6.1 Parcelamento inicial

- sem entrada adicional;
- a primeira parcela é a parcela normal do parcelamento;
- não chamar a primeira parcela normal de entrada.

### 6.2 Primeiro reparcelamento

- entrada padrão de 10% sobre o débito consolidado.

### 6.3 Novo reparcelamento

- entrada padrão de 20% sobre o débito consolidado;
- novos débitos incluídos integram a consolidação.

### 6.4 Configuração manual

Permitir:

- percentual da entrada;
- parcelas da entrada;
- prazo do saldo;
- parcela mínima;
- observação.

### 6.5 Restrições

- não aplicar desconto automático à dívida da RFB;
- não confundir entrada com primeira parcela normal;
- mostrar valor total da entrada e sua divisão em parcelas.

## 7. PGFN e modalidades

A estrutura deve suportar, sem reescrever toda a calculadora:

- parcelamento PGFN ordinário;
- transação por capacidade de pagamento;
- transação individual simplificada;
- pequeno valor;
- modalidade manual;
- garantia.

Cada modalidade deve usar uma configuração central e retornar:

- elegível;
- não elegível;
- elegibilidade não confirmada;
- motivos;
- regras utilizadas;
- dados ainda necessários;
- alertas.

## 8. Linhas de corte e elegibilidade

Criar estrutura tipada e centralizada para as regras de elegibilidade.

Campos possíveis:

- data de inscrição;
- data de corte da modalidade;
- valor consolidado;
- valor mínimo;
- valor máximo;
- natureza do débito;
- existência de débito previdenciário;
- limite de prazo previdenciário;
- existência de impedimento;
- data da rescisão;
- prazo estimado do impedimento;
- perfil permitido;
- porte permitido;
- faixa de valor;
- data de adesão;
- observações.

Não hardcodar essas linhas dentro dos componentes visuais.

A matriz de regras deve poder ser atualizada quando surgir novo edital.

Nenhuma modalidade deve ser declarada elegível apenas porque uma única condição foi atendida.

## 9. TIS

Preservar a ideia de visualização por faixas de parcelas da calculadora de referência.

As faixas devem ser parametrizáveis:

- percentual da primeira faixa;
- quantidade de parcelas;
- percentual da segunda faixa;
- quantidade de parcelas;
- percentual da terceira faixa;
- quantidade de parcelas;
- saldo remanescente;
- prazo total.

Validar, conforme a configuração vigente da modalidade:

- valor mínimo;
- valor máximo;
- data de corte;
- impedimento;
- perfil;
- natureza;
- demais critérios cadastrados.

Não usar apenas `dívida > R$ 1 milhão` como critério único.

Mostrar sempre o motivo da elegibilidade, da inelegibilidade ou da pendência de confirmação.

## 10. Composição do débito e base redutível

A redução não deve incidir automaticamente sobre toda a dívida.

Permitir dois modos:

### 10.1 Composição detalhada

Campos:

- principal;
- juros;
- multas;
- encargos;
- outros valores redutíveis;
- outros valores não redutíveis.

Base redutível:

`juros + multas + encargos + outros valores marcados como redutíveis`

O principal não deve receber redução automática.

### 10.2 Estimativa manual da base redutível

Permitir ao operador informar:

- percentual estimado da base redutível;
- ou valor estimado da base redutível.

Não criar estimativa escondida.

Quando a composição não estiver informada, mostrar:

> Composição do débito não informada. A redução apresentada depende da base redutível efetivamente existente.

A redução deve respeitar:

- base redutível;
- percentual aplicado;
- teto configurado;
- demais limites da modalidade.

## 11. Entrada e parcelamento

Para cada cenário, mostrar claramente:

- entrada percentual;
- entrada total em reais;
- número de parcelas da entrada;
- valor de cada parcela da entrada;
- saldo após entrada;
- número de parcelas do saldo;
- parcela estimada;
- total projetado.

Formato esperado:

`Entrada total: R$ X`

`Pagamento da entrada: Y parcelas de R$ Z`

Não mostrar apenas `Entrada: 6%`.

## 12. Comparação de cenários

A calculadora deve permitir selecionar:

- cenário atual;
- cenário disponível hoje;
- cenário potencial.

O comparador deve mostrar, lado a lado:

- dívida consolidada;
- entrada total;
- parcelas da entrada;
- saldo;
- redução;
- saldo negociado;
- parcelas do saldo;
- parcela estimada;
- total projetado;
- hipótese utilizada;
- limitações;
- alertas.

Destacar:

- POTENCIAL DE ECONOMIA;
- ECONOMIA PERCENTUAL.

Não apresentar teto de referência como resultado garantido.

## 13. Impedimento e estratégia em duas etapas

Quando houver impedimento, CAPAG inadequada ou estratégia de revisão ativada, preparar suporte para:

### Etapa 1

- modalidade disponível hoje;
- entrada;
- parcelas;
- valores pagos;
- parcelas pagas;
- data de início;
- situação da adimplência;
- observações.

Objetivos:

- regularização;
- manutenção da adimplência;
- demonstração de cooperação;
- demonstração de intenção de cumprimento;
- formação de evidências;
- preservação do interesse arrecadatório.

Não afirmar que boa-fé remove impedimento automaticamente.

### Etapa 2

- revisão administrativa e/ou judicial;
- remoção do impedimento;
- revisão de CAPAG;
- nova modalidade potencial;
- redução hipotética;
- prazo;
- observações.

A economia da etapa 2 deve considerar os valores já pagos na etapa 1, evitando dupla contagem.

## 14. Garantia

Preservar suporte à simulação de garantia, porém separar claramente:

- custo da garantia;
- entrada;
- mensalidade;
- prazo;
- custo total;
- observações.

Não misturar custo da garantia com redução do passivo.

## 15. Regras de implementação

- React + TypeScript + Tailwind;
- sem HTML estático paralelo;
- sem copiar JavaScript legado;
- sem duplicar `negotiationCalculator`;
- sem duplicar `NegotiationCalculator`;
- sem regras tributárias dentro da página;
- sem condicionais de elegibilidade espalhadas na UI;
- sem bibliotecas novas sem autorização;
- sem migration nesta fase;
- sem alteração de RLS nesta fase;
- preservar registros antigos;
- preservar localStorage e Supabase atuais.

## 16. Ordem de implementação

### Fase 1 — motor e regras

- tipos;
- matriz de modalidades;
- perfil / porte;
- CAPAG;
- situação RFB;
- base redutível;
- linhas de corte;
- elegibilidade;
- TIS parametrizável;
- estratégia em duas etapas;
- testes de funções puras.

Sem grande reconstrução visual.

### Fase 2 — interface da calculadora

- formulário organizado;
- parâmetros avançados;
- KPIs principais;
- tabela por natureza;
- entrada e parcelas;
- comparador atual x potencial;
- potencial de economia;
- estados de elegibilidade.

A interface deve seguir a estrutura funcional simples da referência HTML.

### Fase 3 — integração ao diagnóstico

- integração com Diagnóstico Guiado;
- persistência no `crm_data`;
- síntese estratégica;
- recuperação dos dados;
- compatibilidade com registros antigos.

## 17. Critérios mínimos de aceitação

1. Uma única calculadora;
2. Dívidas separadas por natureza;
3. Perfil selecionável;
4. CAPAG selecionável;
5. CAPAG A/B sem desconto automático;
6. CAPAG C/D com redução configurável;
7. CAPAG não informada sem desconto automático;
8. RFB inicial sem entrada adicional;
9. Primeiro reparcelamento com 10%;
10. Novo reparcelamento com 20%;
11. Configuração manual RFB;
12. Base redutível detalhada;
13. Base redutível estimada manualmente;
14. Redução limitada à base redutível;
15. Elegibilidade com motivo;
16. TIS com múltiplos critérios;
17. Entrada total e parcelada;
18. Resultado por natureza;
19. Cenário atual x potencial;
20. Potencial de economia;
21. Estratégia em duas etapas;
22. Sem dupla contagem de pagamentos;
23. Garantia separada da redução;
24. Lint aprovado;
25. Build aprovado.

## 18. Regra de interpretação

Em caso de conflito:

1. regras explicitamente aprovadas pelo usuário;
2. este documento;
3. `AGENTS.md`;
4. código atual;
5. HTML legado apenas como referência de experiência.

Nunca copiar uma regra antiga do HTML sem validar se ela permanece compatível com a especificação atual.
