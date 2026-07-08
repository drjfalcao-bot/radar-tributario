create extension if not exists "pgcrypto";

create table if not exists diagnosticos (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  origem text not null default 'hunter_call',
  status text not null default 'lead_parcial'
    check (status in (
      'lead_parcial',
      'diagnostico_basico',
      'aguardando_documentos',
      'em_analise_especialista',
      'parecer_emitido',
      'proposta_enviada',
      'perdido'
    )),
  owner_user_id uuid references auth.users (id) on delete set null,
  anotacoes_internas text,
  parecer jsonb,
  crm_data jsonb,
  nome_empresa text not null,
  contato text,
  cnpj text,
  regime_tributario text not null check (regime_tributario in ('simples', 'presumido', 'real', 'mei', 'nao_sei')),
  setor text not null check (setor in ('comercio', 'servicos', 'industria', 'profissional', 'saude_educacao_agro', 'imobiliario', 'financeiro', 'seletivo', 'nao_sei')),
  faturamento_mensal numeric not null check (faturamento_mensal > 0),
  percentual_b2b numeric not null check (percentual_b2b between 0 and 100),
  margem_percentual numeric not null check (margem_percentual between 1 and 80),
  compras_creditaveis_percentual numeric not null check (compras_creditaveis_percentual between 0 and 100),
  possui_cliente_pj_relevante text not null check (possui_cliente_pj_relevante in ('sim', 'nao', 'nao_sei')),
  sistema_fiscal_preparado text not null check (sistema_fiscal_preparado in ('sim', 'parcial', 'nao', 'nao_sei')),
  possui_divida_fiscal text not null check (possui_divida_fiscal in ('sim', 'nao', 'nao_sei')),
  valor_divida_estimado numeric default 0 check (valor_divida_estimado >= 0),
  possui_credito_icms text not null check (possui_credito_icms in ('sim', 'nao', 'nao_sei')),
  valor_credito_icms_estimado numeric default 0 check (valor_credito_icms_estimado >= 0),
  objetivo_cliente text default 'nao_sei' check (objetivo_cliente in ('caixa', 'imposto_alto', 'certidao', 'divida', 'clientes_pj', 'nao_sei')),
  score_risco integer check (score_risco between 0 and 100),
  nivel_risco text check (nivel_risco in ('baixo', 'medio', 'alto', 'critico')),
  exposicao_min numeric,
  exposicao_max numeric,
  preco_inacao_min numeric,
  preco_inacao_max numeric,
  pressao_b2b text check (pressao_b2b in ('baixa', 'media', 'alta')),
  oportunidades jsonb,
  ameacas jsonb,
  documentos jsonb,
  premissas jsonb,
  resultado jsonb
);

create index if not exists diagnosticos_status_idx on diagnosticos (status);
create index if not exists diagnosticos_created_at_idx on diagnosticos (created_at desc);

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists diagnosticos_set_updated_at on diagnosticos;
create trigger diagnosticos_set_updated_at
  before update on diagnosticos
  for each row execute function set_updated_at();

create table if not exists documentos_lead (
  id uuid primary key default gen_random_uuid(),
  diagnostico_id uuid not null references diagnosticos (id) on delete cascade,
  created_at timestamptz not null default now(),
  nome text not null,
  tipo text not null,
  status text not null default 'pendente' check (status in ('pendente', 'validado', 'nao_aplicavel')),
  observacao text,
  storage_path text
);

create unique index if not exists documentos_lead_diagnostico_nome_idx
  on documentos_lead (diagnostico_id, nome);

create table if not exists usuarios_autorizados (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text unique not null,
  nome text,
  role text not null default 'hunter' check (role in ('owner', 'admin', 'especialista', 'hunter', 'viewer')),
  status text not null default 'ativo' check (status in ('ativo', 'bloqueado')),
  autorizado_por uuid references auth.users (id) on delete set null,
  observacao text
);

create index if not exists usuarios_autorizados_email_idx on usuarios_autorizados (lower(email));

create or replace function is_authorized()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from usuarios_autorizados ua
    where lower(ua.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      and ua.status = 'ativo'
  );
$$;

create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from usuarios_autorizados ua
    where lower(ua.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      and ua.status = 'ativo'
      and ua.role in ('owner', 'admin')
  );
$$;

alter table diagnosticos enable row level security;
alter table documentos_lead enable row level security;
alter table usuarios_autorizados enable row level security;

drop policy if exists diagnosticos_select_authorized on diagnosticos;
create policy diagnosticos_select_authorized
  on diagnosticos for select
  to authenticated
  using (is_authorized());

drop policy if exists diagnosticos_insert_public on diagnosticos;
create policy diagnosticos_insert_public
  on diagnosticos for insert
  to anon, authenticated
  with check (
    status = 'lead_parcial'
    and owner_user_id is null
    and anotacoes_internas is null
    and parecer is null
  );

drop policy if exists diagnosticos_update_authorized on diagnosticos;
create policy diagnosticos_update_authorized
  on diagnosticos for update
  to authenticated
  using (is_authorized())
  with check (is_authorized());

drop policy if exists diagnosticos_delete_admin on diagnosticos;
create policy diagnosticos_delete_admin
  on diagnosticos for delete
  to authenticated
  using (is_admin());

create or replace view diagnosticos_publico as
  select
    id,
    created_at,
    updated_at,
    origem,
    status,
    nome_empresa,
    regime_tributario,
    setor,
    faturamento_mensal,
    percentual_b2b,
    margem_percentual,
    compras_creditaveis_percentual,
    possui_cliente_pj_relevante,
    sistema_fiscal_preparado,
    possui_divida_fiscal,
    valor_divida_estimado,
    possui_credito_icms,
    valor_credito_icms_estimado,
    objetivo_cliente,
    score_risco,
    nivel_risco,
    exposicao_min,
    exposicao_max,
    preco_inacao_min,
    preco_inacao_max,
    pressao_b2b,
    oportunidades,
    ameacas,
    documentos,
    premissas,
    resultado
  from diagnosticos;

drop policy if exists documentos_lead_all_authorized on documentos_lead;
create policy documentos_lead_all_authorized
  on documentos_lead for all
  to authenticated
  using (is_authorized())
  with check (is_authorized());

drop policy if exists usuarios_autorizados_select_self on usuarios_autorizados;
create policy usuarios_autorizados_select_self
  on usuarios_autorizados for select
  to authenticated
  using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

drop policy if exists usuarios_autorizados_all_admin on usuarios_autorizados;
create policy usuarios_autorizados_all_admin
  on usuarios_autorizados for all
  to authenticated
  using (is_admin())
  with check (is_admin());

grant select on diagnosticos_publico to anon, authenticated;
grant insert on diagnosticos to anon, authenticated;
grant select, update, delete on diagnosticos to authenticated;
grant select, insert, update, delete on documentos_lead to authenticated;
grant select, insert, update, delete on usuarios_autorizados to authenticated;

-- Rode uma vez depois de criar o primeiro usuario Google:
-- insert into usuarios_autorizados (email, nome, role, status)
-- values ('voce@suaempresa.com.br', 'Seu Nome', 'owner', 'ativo');
