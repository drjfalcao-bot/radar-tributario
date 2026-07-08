# Radar Tributario

MVP operacional para diagnostico inicial da Reforma Tributaria em reuniao comercial.

## Rodar localmente

```bash
npm install
npm run dev
```

Crie `.env` a partir de `.env.example` se for usar Supabase:

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Sem Supabase, o app funciona em modo local usando `localStorage`.

## Entregas incluidas

- Tela publica `/` com formulario rapido, score ao vivo e resultado executivo.
- Salvamento e reabertura por URL em `/diagnostico/:id`.
- Link compartilhavel em `/share/:id`.
- Relatorio imprimivel em `/print/:id`.
- Area Pro com `/login`, `/app/leads`, detalhe do lead, documentos, parecer e admin de usuarios.
- Motor em `src/lib/RiskCalculator.ts`, com alias em `src/lib/motor.ts`.
- Premissas versionadas em `src/lib/premissas.ts`.
- Cinco cenarios de teste em `src/lib/mockScenarios.ts`.
- SQL do Supabase em `supabase/schema.sql`.
- Migration inicial do Supabase em `supabase/migrations/20260707000000_initial_schema.sql`.

## Supabase

1. Crie um projeto Supabase.
2. Rode `supabase/schema.sql` no SQL editor para configurar manualmente.
3. Ative Google Auth no painel do Supabase.
4. Insira o primeiro owner na tabela `usuarios_autorizados`.
5. Preencha `.env` com URL e anon key.

Se usar a integracao GitHub do Supabase, mantenha `Working directory` como `.` quando a pasta
`supabase/` estiver na raiz do repositorio. A migration inicial fica em
`supabase/migrations/20260707000000_initial_schema.sql`.

## Observacao

O resultado mostra faixa de exposicao e preco da inacao como estimativa preliminar. Nao e calculo oficial de tributo devido, nao promete economia e nao substitui analise documental.
