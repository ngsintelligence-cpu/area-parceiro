-- ============================================================
-- Área do Parceiro — Power Mais  |  Migration 001
-- Execute este arquivo no SQL Editor do Supabase Dashboard
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- 1. ENUMS
-- ──────────────────────────────────────────────────────────────
create type public.user_role   as enum ('parceiro', 'admin');
create type public.user_status as enum ('pendente', 'aprovado', 'rejeitado');

create type public.project_stage as enum (
  'novo_lead',
  'em_contato',
  'proposta_enviada',
  'em_negociacao',
  'contrato_assinado',
  'perdido'
);

create type public.commission_status as enum ('pendente', 'pago');
create type public.content_type      as enum ('video', 'pdf');
create type public.content_status    as enum ('ativo', 'inativo');
create type public.content_category  as enum ('fundamentos_solar', 'tecnicas_venda', 'financiamento');

-- ──────────────────────────────────────────────────────────────
-- 2. PROFILES  (espelha auth.users)
-- ──────────────────────────────────────────────────────────────
create table public.profiles (
  id               uuid        primary key references auth.users(id) on delete cascade,
  email            text        not null,
  full_name        text        not null default '',
  phone            text,
  cpf              text,
  city             text,
  state            char(2),
  role             public.user_role   not null default 'parceiro',
  status           public.user_status not null default 'pendente',
  approved_by      uuid        references public.profiles(id),
  approved_at      timestamptz,
  rejected_by      uuid        references public.profiles(id),
  rejected_at      timestamptz,
  rejection_reason text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ──────────────────────────────────────────────────────────────
-- 3. PROJECTS
-- ──────────────────────────────────────────────────────────────
create table public.projects (
  id           uuid             primary key default gen_random_uuid(),
  partner_id   uuid             not null references public.profiles(id) on delete cascade,
  client_name  text             not null,
  city         text,
  state        char(2),
  power_kwp    numeric(8,2),
  value        numeric(12,2),
  stage        public.project_stage not null default 'novo_lead',
  notes        text,
  created_at   timestamptz      not null default now(),
  updated_at   timestamptz      not null default now()
);

-- ──────────────────────────────────────────────────────────────
-- 4. COMMISSIONS
-- ──────────────────────────────────────────────────────────────
create table public.commissions (
  id           uuid                    primary key default gen_random_uuid(),
  project_id   uuid                    not null references public.projects(id) on delete cascade,
  partner_id   uuid                    not null references public.profiles(id) on delete cascade,
  amount       numeric(12,2)           not null,
  status       public.commission_status not null default 'pendente',
  paid_at      timestamptz,
  paid_by      uuid                    references public.profiles(id),
  notes        text,
  created_at   timestamptz             not null default now(),
  updated_at   timestamptz             not null default now()
);

-- ──────────────────────────────────────────────────────────────
-- 5. ACADEMY CONTENT
-- ──────────────────────────────────────────────────────────────
create table public.academy_content (
  id           uuid                    primary key default gen_random_uuid(),
  title        text                    not null,
  description  text,
  category     public.content_category not null,
  type         public.content_type     not null,
  url          text,
  thumbnail_url text,
  duration_min integer,
  status       public.content_status   not null default 'ativo',
  created_by   uuid                    references public.profiles(id),
  created_at   timestamptz             not null default now(),
  updated_at   timestamptz             not null default now()
);

-- ──────────────────────────────────────────────────────────────
-- 6. ÍNDICES
-- ──────────────────────────────────────────────────────────────
create index on public.profiles  (status);
create index on public.profiles  (role);
create index on public.projects  (partner_id);
create index on public.projects  (stage);
create index on public.commissions (partner_id);
create index on public.commissions (status);
create index on public.academy_content (category);
create index on public.academy_content (status);

-- ──────────────────────────────────────────────────────────────
-- 7. TRIGGER — updated_at automático
-- ──────────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger trg_projects_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

create trigger trg_commissions_updated_at
  before update on public.commissions
  for each row execute function public.set_updated_at();

create trigger trg_academy_updated_at
  before update on public.academy_content
  for each row execute function public.set_updated_at();

-- ──────────────────────────────────────────────────────────────
-- 8. TRIGGER — criar profile automaticamente ao signup
-- ──────────────────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, phone, cpf, city, state)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'cpf',
    new.raw_user_meta_data->>'city',
    new.raw_user_meta_data->>'state'
  );
  return new;
end;
$$;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ──────────────────────────────────────────────────────────────
-- 9. RLS — habilitar em todas as tabelas
-- ──────────────────────────────────────────────────────────────
alter table public.profiles         enable row level security;
alter table public.projects         enable row level security;
alter table public.commissions      enable row level security;
alter table public.academy_content  enable row level security;

-- Helper: role do usuário logado
create or replace function public.my_role()
returns public.user_role language sql security definer stable as $$
  select role from public.profiles where id = auth.uid();
$$;

-- Helper: status do usuário logado
create or replace function public.my_status()
returns public.user_status language sql security definer stable as $$
  select status from public.profiles where id = auth.uid();
$$;

-- ──────────────────────────────────────────────────────────────
-- 10. POLÍTICAS RLS — profiles
-- ──────────────────────────────────────────────────────────────

-- Parceiro vê só o próprio perfil
create policy "parceiro: ver próprio perfil"
  on public.profiles for select
  using (id = auth.uid());

-- Admin vê todos
create policy "admin: ver todos os perfis"
  on public.profiles for select
  using (public.my_role() = 'admin');

-- Parceiro atualiza campos não-críticos do próprio perfil
create policy "parceiro: atualizar próprio perfil"
  on public.profiles for update
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and role = (select role from public.profiles where id = auth.uid())
    and status = (select status from public.profiles where id = auth.uid())
  );

-- Admin atualiza qualquer perfil (aprovação/rejeição)
create policy "admin: atualizar qualquer perfil"
  on public.profiles for update
  using (public.my_role() = 'admin');

-- Trigger handle_new_user usa security definer — não precisa de policy para INSERT

-- ──────────────────────────────────────────────────────────────
-- 11. POLÍTICAS RLS — projects
-- ──────────────────────────────────────────────────────────────

-- Parceiro vê só os próprios projetos
create policy "parceiro: ver próprios projetos"
  on public.projects for select
  using (partner_id = auth.uid() and public.my_status() = 'aprovado');

-- Parceiro cria projetos
create policy "parceiro: criar projeto"
  on public.projects for insert
  with check (partner_id = auth.uid() and public.my_status() = 'aprovado');

-- Parceiro atualiza campos do próprio projeto (exceto stage)
create policy "parceiro: atualizar próprio projeto"
  on public.projects for update
  using (partner_id = auth.uid() and public.my_status() = 'aprovado')
  with check (
    partner_id = auth.uid()
    and stage = (select stage from public.projects where id = projects.id)
  );

-- Admin vê todos os projetos
create policy "admin: ver todos os projetos"
  on public.projects for select
  using (public.my_role() = 'admin');

-- Admin atualiza qualquer projeto (muda stage)
create policy "admin: atualizar qualquer projeto"
  on public.projects for update
  using (public.my_role() = 'admin');

-- Admin deleta projetos
create policy "admin: deletar projeto"
  on public.projects for delete
  using (public.my_role() = 'admin');

-- ──────────────────────────────────────────────────────────────
-- 12. POLÍTICAS RLS — commissions
-- ──────────────────────────────────────────────────────────────

-- Parceiro vê só as próprias comissões
create policy "parceiro: ver próprias comissões"
  on public.commissions for select
  using (partner_id = auth.uid() and public.my_status() = 'aprovado');

-- Admin vê e gerencia todas
create policy "admin: ver todas as comissões"
  on public.commissions for select
  using (public.my_role() = 'admin');

create policy "admin: criar comissão"
  on public.commissions for insert
  with check (public.my_role() = 'admin');

create policy "admin: atualizar comissão"
  on public.commissions for update
  using (public.my_role() = 'admin');

create policy "admin: deletar comissão"
  on public.commissions for delete
  using (public.my_role() = 'admin');

-- ──────────────────────────────────────────────────────────────
-- 13. POLÍTICAS RLS — academy_content
-- ──────────────────────────────────────────────────────────────

-- Parceiro vê conteúdo ativo
create policy "parceiro: ver conteúdo ativo"
  on public.academy_content for select
  using (status = 'ativo' and public.my_status() = 'aprovado');

-- Admin vê tudo
create policy "admin: ver todo conteúdo"
  on public.academy_content for select
  using (public.my_role() = 'admin');

create policy "admin: criar conteúdo"
  on public.academy_content for insert
  with check (public.my_role() = 'admin');

create policy "admin: atualizar conteúdo"
  on public.academy_content for update
  using (public.my_role() = 'admin');

create policy "admin: deletar conteúdo"
  on public.academy_content for delete
  using (public.my_role() = 'admin');

-- ──────────────────────────────────────────────────────────────
-- 14. STORAGE — bucket para Academia
-- ──────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('academy', 'academy', false)
on conflict do nothing;

-- Admin faz upload
create policy "admin: upload academia"
  on storage.objects for insert
  with check (bucket_id = 'academy' and public.my_role() = 'admin');

-- Admin e parceiro aprovado fazem download
create policy "acesso: download academia"
  on storage.objects for select
  using (
    bucket_id = 'academy'
    and (public.my_role() = 'admin' or public.my_status() = 'aprovado')
  );

-- ──────────────────────────────────────────────────────────────
-- 15. BOOTSTRAP — primeiro admin
-- Execute DEPOIS de criar sua conta normalmente pela tela de cadastro.
-- Substitua pelo e-mail real do administrador.
-- ──────────────────────────────────────────────────────────────
-- update public.profiles
--    set role = 'admin', status = 'aprovado', approved_at = now()
--  where lower(email) = lower('seu-email-admin@powermais.com.br');
