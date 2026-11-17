-- Funções auxiliares ficam fora dos schemas expostos pela Data API.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated;

-- A ordem dos valores define a hierarquia: editor < admin < super_admin.
create type public.admin_role as enum ('editor', 'admin', 'super_admin');

create function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create table public.admin_users (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null check (char_length(btrim(full_name)) between 1 and 200),
  role public.admin_role not null default 'editor',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.admin_users is
  'Equipe com acesso ao painel. Uma conta em auth.users sem linha ativa aqui não tem permissão nenhuma.';

create trigger admin_users_set_updated_at
before update on public.admin_users
for each row execute function private.set_updated_at();

create function private.has_role(min_role public.admin_role)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users au
    where au.id = (select auth.uid())
      and au.is_active
      and au.role >= min_role
  );
$$;

create function private.guard_last_super_admin()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.role = 'super_admin'
     and old.is_active
     and (tg_op = 'DELETE' or new.role <> 'super_admin' or not new.is_active)
     and not exists (
       select 1
       from public.admin_users au
       where au.id <> old.id
         and au.role = 'super_admin'
         and au.is_active
     )
  then
    raise exception 'A plataforma precisa de ao menos um super_admin ativo'
      using errcode = 'check_violation';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create trigger admin_users_guard_last_super_admin
before update or delete on public.admin_users
for each row execute function private.guard_last_super_admin();

revoke execute on all functions in schema private from public, anon, authenticated;
grant execute on function private.has_role(public.admin_role) to authenticated;

alter table public.admin_users enable row level security;
revoke all on table public.admin_users from anon, authenticated;
grant select, insert, update, delete on table public.admin_users to authenticated;

create policy admin_users_select_self_or_staff
on public.admin_users for select to authenticated
using (id = (select auth.uid()) or (select private.has_role('editor')));

create policy admin_users_insert_super_admin
on public.admin_users for insert to authenticated
with check ((select private.has_role('super_admin')));

create policy admin_users_update_super_admin
on public.admin_users for update to authenticated
using ((select private.has_role('super_admin')))
with check ((select private.has_role('super_admin')));

create policy admin_users_delete_super_admin
on public.admin_users for delete to authenticated
using ((select private.has_role('super_admin')));
