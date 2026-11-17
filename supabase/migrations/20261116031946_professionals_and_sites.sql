create type public.professional_status as enum ('active', 'inactive', 'archived');
create type public.professional_council as enum ('crp', 'crm');
create type public.attendance_mode as enum ('in_person', 'online');
create type public.domain_verification_status as enum ('pending', 'verified', 'failed');
create type public.domain_configuration_status as enum ('pending', 'configured', 'misconfigured');

create table public.professionals (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(btrim(full_name)) between 1 and 200),
  professional_name text check (char_length(btrim(professional_name)) between 1 and 200),
  council public.professional_council,
  registration_number text check (char_length(btrim(registration_number)) between 1 and 40),
  specialty_registration text check (char_length(btrim(specialty_registration)) between 1 and 40),
  specialty text check (char_length(specialty) <= 200),
  bio text check (char_length(bio) <= 10000),
  education jsonb not null default '[]'::jsonb check (jsonb_typeof(education) = 'array'),
  phone text check (phone ~ '^[0-9]{10,15}$'),
  whatsapp text check (whatsapp ~ '^[0-9]{10,15}$'),
  email text check (email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  photo_url text check (photo_url ~ '^https://'),
  social_links jsonb not null default '{}'::jsonb check (jsonb_typeof(social_links) = 'object'),
  office_address jsonb not null default '{}'::jsonb check (jsonb_typeof(office_address) = 'object'),
  attendance_modes public.attendance_mode[] not null default '{}',
  status public.professional_status not null default 'active',
  internal_notes text check (char_length(internal_notes) <= 10000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint professionals_registration_pair
    check ((council is null) = (registration_number is null))
);

comment on column public.professionals.specialty_registration is 'RQE, para médicos que divulgam especialidade.';
comment on column public.professionals.phone is 'Somente dígitos, com DDI e DDD.';
comment on column public.professionals.whatsapp is 'Somente dígitos, com DDI e DDD.';
comment on column public.professionals.internal_notes is 'Uso interno da equipe. Nunca entra no documento publicado.';

create table public.site_templates (
  key text primary key check (key ~ '^[a-z][a-z0-9_]{0,49}$'),
  name text not null check (char_length(btrim(name)) between 1 and 100),
  description text check (char_length(description) <= 1000),
  version integer not null default 1 check (version > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.site_templates is
  'Catálogo dos templates implementados no código Next.js. A chave precisa existir no registry da aplicação.';

insert into public.site_templates (key, name, description) values
  ('acolhedor', 'Acolhedor', 'Estética elegante e humanizada, tons neutros e quentes, tipografia editorial.'),
  ('minimalista', 'Minimalista', 'Layout limpo, hierarquia objetiva e tipografia moderna.'),
  ('premium', 'Premium', 'Identidade sofisticada, composição exclusiva e tipografia refinada.');

create table public.sites (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professionals (id) on delete restrict,
  name text not null check (char_length(btrim(name)) between 1 and 200),
  slug text not null unique check (
    slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    and char_length(slug) <= 63
    and slug not in ('www', 'app', 'admin', 'api', 'preview')
  ),
  template_key text not null references public.site_templates (key) on update cascade on delete restrict,
  theme jsonb not null default '{}'::jsonb check (jsonb_typeof(theme) = 'object'),
  seo jsonb not null default '{}'::jsonb check (jsonb_typeof(seo) = 'object'),
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index sites_professional_id_idx on public.sites (professional_id);
create index sites_template_key_idx on public.sites (template_key);

create table public.site_domains (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites (id) on delete cascade,
  domain text not null unique check (
    domain = lower(domain)
    and char_length(domain) <= 253
    and domain ~ '^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$'
  ),
  is_primary boolean not null default false,
  verification_status public.domain_verification_status not null default 'pending',
  configuration_status public.domain_configuration_status not null default 'pending',
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index site_domains_site_id_idx on public.site_domains (site_id);
create unique index site_domains_one_primary_per_site on public.site_domains (site_id) where is_primary;

create table public.site_pages (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites (id) on delete cascade,
  path text not null check (
    path = '/'
    or (path ~ '^(/[a-z0-9]+(-[a-z0-9]+)*)+$' and char_length(path) <= 200)
  ),
  title text not null check (char_length(btrim(title)) between 1 and 200),
  seo jsonb not null default '{}'::jsonb check (jsonb_typeof(seo) = 'object'),
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint site_pages_site_id_path_key unique (site_id, path)
);

comment on column public.site_pages.path is 'Caminho da página no site. A página inicial é "/".';

create table public.site_sections (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.site_pages (id) on delete cascade,
  module_key text not null check (module_key ~ '^[a-z][a-z0-9_]{0,49}$'),
  section_key text not null check (section_key ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(section_key) <= 60),
  position integer not null check (position >= 0),
  content jsonb not null default '{}'::jsonb check (jsonb_typeof(content) = 'object'),
  settings jsonb not null default '{}'::jsonb check (jsonb_typeof(settings) = 'object'),
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint site_sections_page_id_section_key_key unique (page_id, section_key)
);

comment on column public.site_sections.module_key is 'Tipo do módulo no registry da aplicação (hero, about, faq...).';
comment on column public.site_sections.section_key is 'Identificador da seção na página, usado como âncora.';

create index site_sections_page_id_position_idx on public.site_sections (page_id, position);

create trigger professionals_set_updated_at before update on public.professionals
for each row execute function private.set_updated_at();
create trigger site_templates_set_updated_at before update on public.site_templates
for each row execute function private.set_updated_at();
create trigger sites_set_updated_at before update on public.sites
for each row execute function private.set_updated_at();
create trigger site_domains_set_updated_at before update on public.site_domains
for each row execute function private.set_updated_at();
create trigger site_pages_set_updated_at before update on public.site_pages
for each row execute function private.set_updated_at();
create trigger site_sections_set_updated_at before update on public.site_sections
for each row execute function private.set_updated_at();

create function private.ensure_active_template()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' then
    if new.template_key is not distinct from old.template_key then
      return new;
    end if;
  end if;

  if not exists (
    select 1
    from public.site_templates t
    where t.key = new.template_key
      and t.is_active
  ) then
    raise exception 'O template "%" não está disponível para novos sites', new.template_key
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

create trigger sites_ensure_active_template
before insert or update on public.sites
for each row execute function private.ensure_active_template();

-- Só restringe chamadas da Data API; funções security definer rodam como owner.
create function private.guard_site_admin_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user = 'authenticated'
     and (new.professional_id, new.slug, new.template_key, new.archived_at)
         is distinct from (old.professional_id, old.slug, old.template_key, old.archived_at)
     and not private.has_role('admin')
  then
    raise exception 'Somente admin altera profissional, slug, template ou arquivamento do site'
      using errcode = 'insufficient_privilege';
  end if;

  return new;
end;
$$;

create trigger sites_guard_admin_fields
before update on public.sites
for each row execute function private.guard_site_admin_fields();

revoke execute on function
  private.ensure_active_template(),
  private.guard_site_admin_fields()
from public, anon, authenticated;

alter table public.professionals enable row level security;
alter table public.site_templates enable row level security;
alter table public.sites enable row level security;
alter table public.site_domains enable row level security;
alter table public.site_pages enable row level security;
alter table public.site_sections enable row level security;

revoke all on table
  public.professionals,
  public.site_templates,
  public.sites,
  public.site_domains,
  public.site_pages,
  public.site_sections
from anon, authenticated;

grant select, insert, update, delete on table
  public.professionals,
  public.site_templates,
  public.site_domains,
  public.site_pages,
  public.site_sections
to authenticated;

grant select, delete on table public.sites to authenticated;
grant insert (professional_id, name, slug, template_key, theme, seo) on table public.sites to authenticated;
grant update (professional_id, name, slug, template_key, theme, seo, archived_at) on table public.sites to authenticated;

create policy professionals_select_staff on public.professionals
for select to authenticated using ((select private.has_role('editor')));
create policy professionals_insert_admin on public.professionals
for insert to authenticated with check ((select private.has_role('admin')));
create policy professionals_update_admin on public.professionals
for update to authenticated
using ((select private.has_role('admin')))
with check ((select private.has_role('admin')));
create policy professionals_delete_super_admin on public.professionals
for delete to authenticated using ((select private.has_role('super_admin')));

create policy site_templates_select_staff on public.site_templates
for select to authenticated using ((select private.has_role('editor')));
create policy site_templates_insert_super_admin on public.site_templates
for insert to authenticated with check ((select private.has_role('super_admin')));
create policy site_templates_update_super_admin on public.site_templates
for update to authenticated
using ((select private.has_role('super_admin')))
with check ((select private.has_role('super_admin')));
create policy site_templates_delete_super_admin on public.site_templates
for delete to authenticated using ((select private.has_role('super_admin')));

create policy sites_select_staff on public.sites
for select to authenticated using ((select private.has_role('editor')));
create policy sites_insert_admin on public.sites
for insert to authenticated with check ((select private.has_role('admin')));
create policy sites_update_staff on public.sites
for update to authenticated
using ((select private.has_role('editor')))
with check ((select private.has_role('editor')));
create policy sites_delete_super_admin on public.sites
for delete to authenticated using ((select private.has_role('super_admin')));

create policy site_domains_select_staff on public.site_domains
for select to authenticated using ((select private.has_role('editor')));
create policy site_domains_insert_admin on public.site_domains
for insert to authenticated with check ((select private.has_role('admin')));
create policy site_domains_update_admin on public.site_domains
for update to authenticated
using ((select private.has_role('admin')))
with check ((select private.has_role('admin')));
create policy site_domains_delete_admin on public.site_domains
for delete to authenticated using ((select private.has_role('admin')));

create policy site_pages_select_staff on public.site_pages
for select to authenticated using ((select private.has_role('editor')));
create policy site_pages_insert_staff on public.site_pages
for insert to authenticated with check ((select private.has_role('editor')));
create policy site_pages_update_staff on public.site_pages
for update to authenticated
using ((select private.has_role('editor')))
with check ((select private.has_role('editor')));
create policy site_pages_delete_staff on public.site_pages
for delete to authenticated using ((select private.has_role('editor')));

create policy site_sections_select_staff on public.site_sections
for select to authenticated using ((select private.has_role('editor')));
create policy site_sections_insert_staff on public.site_sections
for insert to authenticated with check ((select private.has_role('editor')));
create policy site_sections_update_staff on public.site_sections
for update to authenticated
using ((select private.has_role('editor')))
with check ((select private.has_role('editor')));
create policy site_sections_delete_staff on public.site_sections
for delete to authenticated using ((select private.has_role('editor')));
