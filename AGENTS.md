# AGENTS.md — Radar Tributário

Este arquivo define as regras permanentes para qualquer agente de código que trabalhe neste repositório.

## 1. Objetivo do produto

O Radar Tributário é uma plataforma interna de diagnóstico empresarial, simulação tributária, CRM comercial, operação, parecer, proposta, agenda e financeiro.

O sistema não é apenas um CRM. O núcleo do produto é o fluxo:

1. Primeiro contato
2. Diagnóstico guiado em reunião
3. Simulação de passivo e reforma tributária
4. Parecer
5. Proposta
6. Fechamento
7. Início operacional
8. Execução do trabalho
9. Financeiro e acompanhamento

## 2. Stack e arquitetura existente

- React
- TypeScript
- Vite
- Tailwind CSS
- Supabase
- GitHub Pages

Estrutura atual relevante:

- `components/`: componentes reutilizáveis de interface
- `pages/`: páginas e composição de telas
- `lib/`: regras de negócio, cálculos, tipos e serviços
- `supabase/`: schema, migrations e integração de dados
- `.github/workflows/`: CI e deploy

Não converter o projeto para HTML estático por página. Implementar telas como páginas e componentes React.

## 3. Regras de execução

Antes de alterar código:

1. Ler este arquivo.
2. Ler os arquivos diretamente relacionados à tarefa.
3. Informar brevemente o plano.
4. Trabalhar somente no módulo solicitado.

Não fazer:

- reescrever o sistema inteiro;
- alterar módulos fora do escopo sem necessidade comprovada;
- criar deploy paralelo;
- criar workflow temporário para editar o código;
- mudar GitHub Pages sem necessidade;
- adicionar bibliotecas sem justificar;
- duplicar componentes, tipos ou regras já existentes;
- colocar lógica tributária complexa diretamente dentro de páginas;
- colocar secrets, tokens ou chaves no repositório;
- apagar tabelas, colunas ou dados sem aprovação explícita;
- alterar schema remoto sem migration versionada.

## 4. Validação obrigatória

Toda tarefa de código deve terminar com:

```bash
npm run lint
npm run build
```

Não concluir a tarefa com erro de lint, TypeScript ou build.

Ao finalizar, informar:

- arquivos alterados;
- motivo de cada alteração;
- testes executados;
- riscos ou pendências restantes.

## 5. Git

- Preferir uma branch por módulo ou tarefa relevante.
- Usar commits claros e objetivos.
- Não misturar correção estrutural, mudança visual e regra de negócio em um único commit quando puderem ser separados.
- Não fazer alteração destrutiva diretamente em `main` sem necessidade.

## 6. Supabase

Toda alteração estrutural deve gerar migration em `supabase/migrations`.

Regras:

- preservar dados existentes;
- usar migrations incrementais;
- manter tipos TypeScript alinhados ao banco;
- aplicar RLS e políticas de acesso de forma explícita;
- não usar service role no frontend;
- não expor secrets em código cliente;
- documentar dependências de variáveis de ambiente;
- preferir operações idempotentes em scripts de migração quando possível.

O Supabase é a fonte principal de dados. Integrações externas, como Google Calendar, não substituem o banco principal.

## 7. Separação obrigatória de domínios

### Perfil do cliente

Deve ser módulo próprio. Pode conter:

- decisor;
- contato financeiro;
- contexto da empresa;
- objeções;
- status documental;
- histórico e notas de relacionamento.

Não colocar Perfil do Cliente dentro do Financeiro.

### Comercial

Pipeline comercial sugerido:

1. Novo contato
2. Contato realizado
3. Reunião agendada
4. Diagnóstico apresentado
5. Proposta enviada
6. Em negociação
7. Aguardando decisão
8. Ganho
9. Perdido

### Operacional

Pipeline operacional separado:

1. Onboarding
2. Aguardando documentação
3. Documentação recebida
4. Análise técnica
5. Estratégia definida
6. Em execução
7. Aguardando cliente
8. Aguardando órgão
9. Entrega em revisão
10. Concluído
11. Suspenso
12. Cancelado

`Perdido` é comercial. `Cancelado` é operacional/contratual. Não tratá-los como sinônimos.

### Financeiro

Deve conter apenas informações financeiras e de cobrança, como:

- status do negócio;
- plano financeiro contratado;
- recebíveis;
- vencimentos;
- pagamentos;
- atrasos;
- formas de pagamento;
- histórico financeiro.

Não colocar perfil do cliente, diagnóstico fiscal ou parecer dentro do Financeiro.

### Agenda interna

Deve ser módulo próprio para:

- próxima ação;
- reuniões;
- follow-ups;
- vencimentos;
- cobranças;
- prazos internos;
- andamento do trabalho;
- atos e tarefas necessários.

## 8. Primeira experiência do usuário

Após login, o ambiente principal deve ser uma central estratégica, não uma simples área administrativa.

Nome de trabalho preferencial:

- `Central Estratégica`

A primeira tela de um novo atendimento deve ser um diagnóstico guiado para preenchimento durante a reunião.

Fluxo sugerido:

1. Perfil
2. Empresa
3. Receita
4. Reforma
5. Passivo
6. Cenários
7. Parecer
8. Proposta

A interface deve apresentar diagnóstico vivo conforme os dados são preenchidos.

## 9. Simulação de passivo

A simulação deve comparar claramente:

- cenário atual;
- cenário potencial;
- potencial de economia.

A comparação deve mostrar, quando aplicável:

- dívida original;
- valor de entrada;
- quantidade de parcelas da entrada;
- valor de cada parcela da entrada;
- saldo;
- prazo do saldo;
- desconto estimado;
- total projetado;
- economia estimada.

No cenário potencial, a entrada deve ser exibida também em parcelas, inclusive `12x` quando o enquadramento parametrizado permitir.

Não fixar regra tributária em texto solto. Regras devem ficar em `lib/`, ser parametrizáveis e ter fonte/versão documentada.

O sistema deve permitir cenário personalizado sem perder o preset original.

## 10. Estratégia em duas etapas

O produto deve suportar estratégia para casos com impedimento ou classificação inadequada:

### Etapa 1

- adesão à modalidade disponível;
- início e manutenção dos pagamentos;
- registro da regularização possível;
- documentação de adimplemento e boa-fé.

### Etapa 2

- medida administrativa e/ou jurídica;
- revisão de classificação ou impedimento;
- recuperação de elegibilidade;
- novo cenário potencial com desconto.

O sistema deve registrar:

- modalidade utilizada na etapa 1;
- valor pago;
- parcelas pagas;
- situação de adimplência;
- comprovantes;
- protocolos;
- processo e medidas adotadas;
- saldo atualizado;
- cenário potencial da etapa 2.

A economia da etapa 2 deve considerar os pagamentos já realizados na etapa 1 para evitar dupla contagem.

## 11. Parecer

O parecer vem depois da simulação.

Ele deve receber automaticamente, de forma estruturada:

- cenário atual;
- cenário potencial;
- economia estimada;
- forma de pagamento da negociação;
- entrada e parcelamento da entrada;
- saldo e prazo;
- alertas e premissas;
- impacto estimado da reforma.

Se não houver débito, o parecer deve priorizar:

- impacto da reforma tributária;
- economia ou aumento projetado;
- créditos potenciais;
- preservação de margem;
- impacto em caixa e precificação;
- riscos e oportunidades.

## 12. Proposta e pagamento do trabalho

Separar claramente:

1. condição comercial proposta;
2. plano financeiro contratado;
3. recebíveis efetivos.

Após o negócio ser ganho e o trabalho iniciar, o operador deve configurar livremente o plano financeiro real.

O editor deve permitir:

- entrada contratual;
- entrada parcelada;
- mensalidade;
- quantidade de mensalidades;
- êxito;
- base de cálculo do êxito;
- evento que torna o êxito exigível;
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
- parcelas com valores diferentes;
- datas personalizadas;
- observações.

A proposta original deve permanecer preservada. Ajustes posteriores devem alterar o plano financeiro contratado e manter histórico de alterações.

## 13. Simulador da reforma tributária

Deve ter apresentação premium, clara e tecnológica, sem excesso visual.

Comparar:

- cenário atual;
- cenário projetado;
- carga estimada;
- créditos estimados;
- impacto no caixa;
- impacto na margem;
- impacto anual;
- economia ou aumento potencial.

Premissas avançadas devem ficar em área expansível.

## 14. Padrão visual

Direção visual:

- premium;
- institucional;
- alta tecnologia;
- verde-petróleo / teal;
- fundo escuro em áreas estratégicas;
- números grandes;
- contraste forte para economia e risco;
- animações discretas;
- sem aparência de landing page de venda;
- sem excesso de gradientes ou efeitos decorativos;
- responsivo.

Priorizar legibilidade, densidade controlada e uso em reunião com compartilhamento de tela.

## 15. Critério de pronto por módulo

Um módulo só está pronto quando:

- regra de negócio está definida;
- interface está implementada;
- dados persistem no Supabase;
- estados vazios e erros foram tratados;
- não existe duplicação evidente;
- lint passa;
- build passa;
- fluxo principal foi testado;
- integração com o módulo seguinte está definida.

## 16. Regra para tarefas futuras

Não implementar vários módulos de uma vez.

Ordem preferencial:

1. Estabilização estrutural
2. Diagnóstico guiado
3. Comparador de passivo
4. Simulador da reforma
5. Parecer
6. Proposta
7. Perfil do cliente
8. Pipeline comercial
9. Operação
10. Financeiro
11. Agenda
12. Integrações externas

Em cada tarefa, implementar apenas o escopo explicitamente solicitado.
