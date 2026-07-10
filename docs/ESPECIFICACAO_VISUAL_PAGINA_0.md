# Especificação visual oficial — Página 0 / Central Estratégica

## 1. Status

Esta especificação está APROVADA pelo usuário e passa a ser a referência visual oficial da primeira tela operacional após o login.

Nome interno:

`PÁGINA 0 — CENTRAL ESTRATÉGICA`

A imagem aprovada pelo usuário deve ser anexada à execução do Codex e tratada como referência visual obrigatória.

A implementação deve reproduzir a mesma hierarquia, proporção, densidade, identidade cromática e sensação de produto premium.

Não reinterpretar a tela como CRM tradicional.

Não substituir a estrutura por um dashboard genérico.

Não criar uma landing page.

## 2. Objetivo da tela

A Página 0 é a mesa de trabalho inicial do sistema.

Ela deve apresentar primeiro as ferramentas estratégicas e somente depois conteúdo institucional/informativo.

Ordem obrigatória:

1. Cabeçalho institucional;
2. Simulador de Passivo;
3. Simulador da Reforma;
4. Novo Diagnóstico Estratégico;
5. Fique ligado nas decisões.

Não exibir nesta tela:

- Empresas Recentes;
- Diagnósticos em Andamento;
- Prioridades;
- Pipeline;
- cartões operacionais de CRM;
- tabelas comerciais;
- widgets financeiros.

Essas funções permanecem em páginas próprias.

## 3. Hierarquia visual obrigatória

### 3.1 Cabeçalho

Cabeçalho horizontal escuro em verde-petróleo.

Conteúdo:

- marca/monograma do sistema à esquerda;
- título grande: `Central Estratégica`;
- subtítulo: `Pesquise uma empresa ou inicie uma nova análise`;
- campo de busca central ou à direita;
- placeholder: `Buscar empresa, CNPJ ou diagnóstico`;
- sino de notificações;
- avatar do usuário;
- nome do usuário;
- perfil/função.

A busca deve ter destaque suficiente para uso real, porém não pode competir com os simuladores.

### 3.2 Navegação lateral

Barra lateral estreita e discreta.

Pode conter:

- início;
- módulos;
- configurações.

A barra não deve roubar atenção da área principal.

Não usar menu lateral largo com textos permanentes na Página 0.

## 4. Bloco principal — Calculadoras

A área imediatamente abaixo do cabeçalho deve conter dois módulos grandes, lado a lado no desktop.

As duas áreas devem ocupar a maior parte da largura útil da tela.

Devem ter a mesma altura e peso visual equivalente.

### 4.1 Simulador de Passivo

Título:

`Simulador de Passivo`

Texto de apoio:

`Negocie dívidas e descubra o melhor cenário para reduzir seu passivo tributário.`

Elementos visuais:

- fundo em verde-petróleo profundo;
- gradiente sutil;
- textura técnica discreta;
- ícone institucional relacionado a negociação, equilíbrio ou passivo;
- detalhes dourados discretos;
- tipografia branca;
- valores positivos em verde de destaque.

Linhas resumidas:

- Dívida;
- CAPAG;
- RFB / PGFN;
- Cenários;
- Potencial de economia.

A área deve funcionar em dois estados.

#### Estado sem simulação recente

Não exibir números fictícios.

Mostrar:

- `Nova simulação`;
- `Informe os dados para comparar cenários`;
- indicadores vazios com traço ou estado neutro.

#### Estado com simulação recente válida

Pode mostrar:

- dívida consolidada;
- CAPAG;
- status de elegibilidade;
- quantidade de cenários;
- potencial de economia.

Os dados devem vir do sistema, nunca ser hardcodados apenas para imitar a imagem.

Botão principal:

`SIMULAR PASSIVO`

Ação:

abrir a única calculadora oficial de negociação.

Não criar motor paralelo.

### 4.2 Simulador da Reforma

Título:

`Simulador da Reforma`

Texto de apoio:

`Projete os impactos da Reforma Tributária no seu negócio e antecipe decisões.`

Elementos visuais:

- fundo azul-petróleo profundo;
- gradiente sutil;
- gráfico técnico discreto ao fundo;
- ícone de crescimento, impacto ou projeção;
- detalhes dourados discretos;
- valores positivos em verde de destaque.

Linhas resumidas:

- Carga atual;
- Carga projetada;
- Créditos;
- Margem;
- Impacto anual.

#### Estado sem simulação recente

Não exibir números fictícios.

Mostrar:

- `Nova simulação`;
- `Informe as premissas para projetar impactos`;
- indicadores vazios ou neutros.

#### Estado com simulação recente válida

Pode mostrar os resultados reais da última simulação salva.

Botão principal:

`SIMULAR REFORMA`

Ação:

abrir o módulo oficial do simulador da reforma.

## 5. Diagnóstico Estratégico

Abaixo dos dois simuladores deve existir uma faixa horizontal clara, ocupando toda a largura.

Título:

`Novo Diagnóstico Estratégico`

Texto:

`Combina empresa + passivo + reforma + riscos + oportunidades + estratégia`

Ícone:

alvo, radar ou símbolo equivalente.

Botão:

`INICIAR DIAGNÓSTICO COMPLETO`

O bloco deve ser importante, porém visualmente secundário aos dois simuladores.

Não transformar este bloco em um terceiro cartão escuro do mesmo peso das calculadoras.

## 6. Área informativa — Fique ligado nas decisões

Substitui completamente os antigos cartões de CRM da parte inferior.

Título obrigatório:

`Fique ligado nas decisões`

Texto de apoio:

`Atualizações estratégicas publicadas por órgãos públicos para acompanhar impactos e oportunidades.`

A área deve ter aparência editorial, institucional e premium.

Usar fundo claro e cartões brancos com:

- borda sutil;
- sombra leve;
- cantos arredondados;
- ícones lineares em verde-petróleo;
- boa área em branco;
- hierarquia tipográfica clara.

### 6.1 Estrutura de cada notícia

Cada item deve possuir:

- órgão público;
- título;
- resumo curto;
- data;
- tipo do conteúdo;
- link `Ver atualização`;
- URL oficial.

Exemplos de órgãos possíveis:

- Receita Federal;
- PGFN;
- Ministério da Fazenda;
- Comitê Gestor IBS/CBS;
- Portal do Simples Nacional;
- Diário Oficial da União;
- outros órgãos públicos relevantes.

### 6.2 Regra de veracidade

Não publicar notícias fictícias em produção.

Não inventar datas, títulos ou decisões para preencher o layout.

Enquanto não houver integração automática, usar uma fonte tipada de conteúdo curado e validado.

Pode existir estado vazio elegante:

`Nenhuma atualização publicada no momento.`

A futura automação de notícias deve usar fontes oficiais e ser tratada em tarefa separada.

### 6.3 Comportamento visual

Desktop:

- título/introdução da seção à esquerda;
- três ou quatro notícias em sequência horizontal;
- carrossel ou paginação discreta quando necessário.

Tablet:

- duas colunas.

Mobile:

- uma coluna ou carrossel acessível;
- sem corte de texto essencial;
- sem overflow horizontal indevido.

## 7. Identidade visual

A imagem aprovada é a referência primária.

Direção cromática:

- verde-petróleo muito escuro no cabeçalho;
- verde-petróleo nos módulos estratégicos;
- azul-petróleo no simulador da reforma;
- dourado institucional apenas como acento;
- verde luminoso para resultados positivos;
- fundo geral branco ou cinza muito claro;
- cartões inferiores brancos.

Evitar:

- cores neon;
- excesso de gradiente;
- excesso de dourado;
- aparência de banco digital;
- aparência de site de venda;
- aparência de template genérico;
- excesso de ícones;
- excesso de bordas.

## 8. Tipografia

A composição deve reproduzir a sensação da imagem aprovada:

- títulos fortes, elegantes e institucionais;
- textos funcionais limpos e legíveis;
- números grandes e claros;
- contraste alto.

Não adicionar nova biblioteca de fonte sem necessidade.

Preferir usar as fontes já disponíveis no projeto e ajustar peso, escala e espaçamento.

## 9. Espaçamento e proporção

Desktop de referência:

- largura principal quase total;
- margens laterais moderadas;
- cabeçalho de aproximadamente 88 a 104 px;
- cartões dos simuladores dominando a primeira dobra;
- duas colunas equivalentes;
- espaço de 16 a 24 px entre módulos;
- faixa de diagnóstico imediatamente abaixo;
- notícias abaixo da faixa.

A primeira dobra deve mostrar:

- cabeçalho;
- os dois simuladores;
- faixa do diagnóstico;
- início da área de notícias.

## 10. Responsividade

### Desktop

- dois simuladores lado a lado;
- mesma altura;
- notícias em três ou quatro cartões.

### Tablet

- simuladores podem permanecer em duas colunas se houver espaço;
- caso contrário, empilhar;
- notícias em duas colunas.

### Mobile

Ordem:

1. Cabeçalho compacto;
2. Simulador de Passivo;
3. Simulador da Reforma;
4. Diagnóstico Estratégico;
5. Fique ligado nas decisões.

Não ocultar funções essenciais.

Não reduzir textos a ponto de perder legibilidade.

## 11. Regras de implementação

- manter React + TypeScript + Vite + Tailwind;
- reutilizar componentes existentes quando adequado;
- não criar aplicação paralela;
- não criar HTML estático;
- não duplicar calculadoras;
- não alterar Supabase nesta tarefa;
- não criar migrations;
- não alterar autenticação;
- não alterar RLS;
- não instalar biblioteca sem necessidade;
- não alterar workflows;
- não inventar dados de produção.

## 12. Rotas e ações

A Página 0 deve permanecer na rota operacional principal já existente, preferencialmente:

`/app/leads`

A rota pode manter compatibilidade com registros e navegação existentes.

Ações:

- `SIMULAR PASSIVO` → abrir a calculadora oficial de passivo;
- `SIMULAR REFORMA` → abrir o simulador oficial da reforma;
- `INICIAR DIAGNÓSTICO COMPLETO` → `/app/diagnostico/novo`;
- busca → pesquisar empresa, CNPJ ou diagnóstico;
- notícia → abrir URL oficial em nova aba.

## 13. Critérios visuais de aceitação

A implementação somente será considerada aprovada quando:

1. a hierarquia geral estiver reconhecivelmente fiel à imagem;
2. os dois simuladores forem os elementos dominantes;
3. o passivo estiver à esquerda;
4. a reforma estiver à direita;
5. ambos tiverem a mesma altura;
6. o bloco de diagnóstico estiver abaixo e em largura total;
7. a seção `Fique ligado nas decisões` substituir os cartões de CRM;
8. não aparecerem Empresas Recentes, Diagnósticos, Prioridades ou Pipeline na Página 0;
9. o visual for premium e institucional;
10. o fundo geral for claro;
11. o cabeçalho for verde-petróleo;
12. os cartões principais tiverem fundos escuros distintos;
13. os detalhes dourados forem discretos;
14. o mobile funcionar sem overflow;
15. não houver textos sem acentuação;
16. não houver valores fictícios em produção;
17. os botões abrirem as rotas corretas;
18. lint passar;
19. build passar;
20. a aplicação for aberta e comparada visualmente com a imagem de referência.

## 14. Regra de fidelidade

A imagem aprovada não é apenas inspiração.

Ela é referência obrigatória de:

- composição;
- hierarquia;
- proporções;
- paleta;
- densidade;
- ordem dos blocos;
- sensação visual.

É permitido adaptar apenas o necessário para:

- responsividade;
- dados reais;
- acessibilidade;
- compatibilidade com os componentes existentes.

Não alterar a estrutura principal por preferência do implementador.

## 15. Ordem de prioridade em caso de conflito

1. Imagem visual aprovada anexada pelo usuário;
2. Este documento;
3. `AGENTS.md`;
4. arquitetura atual do projeto;
5. preferências estéticas do implementador.
