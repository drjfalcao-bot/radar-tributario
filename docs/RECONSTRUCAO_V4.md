# Radar Tributário — Reconstrução V4

Data de início: 13/07/2026

## Decisão de projeto

A implementação visual e estrutural existente foi reprovada como base de continuidade.

A V4 será reconstruída como produto novo dentro do mesmo repositório, preservando:

- histórico Git;
- autenticação já funcional;
- integração Supabase e regras de segurança;
- dados existentes;
- motores matemáticos e regras tributárias que forem validados;
- configurações de domínio, build e deploy que continuarem necessárias.

Não serão reutilizados automaticamente:

- layout atual;
- componentes de dashboard criados por aproximação;
- estrutura visual baseada em correções sucessivas de CSS;
- cards, tabelas ou fluxos que não correspondam às referências aprovadas;
- dados fictícios usados apenas para preencher telas.

## Regra principal

As imagens de referência, os fluxos definidos nas conversas e a especificação consolidada do produto são requisitos. Não são inspiração genérica.

Antes de implementar cada tela, deve existir uma definição explícita de:

1. objetivo da tela;
2. usuário da tela;
3. hierarquia da informação;
4. campos;
5. ações;
6. estados vazios;
7. regras de negócio;
8. comportamento responsivo;
9. critérios de aceite visual e funcional.

## Ordem de reconstrução

### Fase 1 — Sistema visual e navegação

- identidade institucional;
- paleta e tokens;
- tipografia;
- grid;
- cabeçalho;
- menu lateral;
- padrões de formulário;
- botões;
- cards;
- tabelas;
- estados vazios;
- alertas;
- responsividade.

### Fase 2 — Central Estratégica

Rota: `/app/inicio`

A tela deve funcionar como entrada consultiva e ferramenta de reunião, com dois eixos principais:

- Reforma Tributária;
- Passivo Federal.

A experiência deve ser orientada a diagnóstico, impacto e próximo passo, sem expor parâmetros internos avançados.

### Fase 3 — Área Pro

Rota: `/app/pro`

CRM interno centrado em empresas, oportunidades, tarefas e operação. A empresa é a entidade permanente; lead é somente estágio comercial.

### Fase 4 — Simulador Estratégico de Passivo

Rota: `/app/simulador-passivo`

Reconstrução do simulador com separação clara entre:

- dados da empresa;
- PGFN por natureza;
- Receita Federal;
- risco processual;
- estratégia;
- parâmetros avançados;
- resultados;
- comparação de cenários;
- relatório.

O motor matemático deve permanecer centralizado e testável.

### Fase 5 — Dossiê Empresarial 360

Rota: `/app/empresas/:id`

Fonte única de contexto da empresa, separando comercial, fiscal, operacional, financeiro, documentos, atividades e histórico.

## Não negociáveis

- não criar dashboard genérico;
- não inventar números, empresas ou métricas;
- não usar correções globais de CSS para forçar fidelidade;
- não duplicar regras tributárias em componentes;
- não misturar PGFN e RFB no mesmo cálculo;
- não aplicar desconto automático à RFB;
- não reduzir principal automaticamente;
- não misturar condição comercial, plano contratado e recebível;
- não expor estratégia interna na área do cliente;
- não alterar autenticação, Supabase, RLS ou dados sem necessidade expressa;
- rodar lint e build antes de integrar qualquer etapa.

## Critério de integração

A `main` permanece como versão publicada durante o redesenho.

A reconstrução ocorre em `rebuild/v4-redesign`.

Cada etapa somente será integrada à `main` após validação visual e funcional.

O estado anterior está preservado em `backup/pre-rebuild-2026-07-13`.
