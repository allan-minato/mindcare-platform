create table public.site_publications (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites (id) on delete cascade,
  version integer not null check (version > 0),
  document jsonb not null check (jsonb_typeof(document) = 'object'),
  published_at timestamptz not null default now(),
  published_by uuid references public.admin_users (id) on delete set null,
  constraint site_publications_site_id_version_key unique (site_id, version),
  constraint site_publications_site_id_id_key unique (site_id, id)
);

comment on table public.site_publications is
  'Histórico imutável de snapshots publicados. Escrito só por public.publish_site.';

create index site_publications_published_by_idx on public.site_publications (published_by);

alter table public.sites add column live_publication_id uuid;

-- A chave composta garante que o site só aponte para uma publicação dele mesmo.
alter table public.sites
  add constraint sites_live_publication_fkey
  foreign key (id, live_publication_id)
  references public.site_publications (site_id, id);

alter table public.sites
  add constraint sites_archived_not_live
  check (archived_at is null or live_publication_id is null);

comment on column public.sites.live_publication_id is
  'Publicação servida no site público. Nulo quando o site não está no ar.';

create function private.build_site_document(p_site_id uuid)
returns jsonb
language sql
stable
set search_path = ''
as $$
  select jsonb_build_object(
    'schema_version', 1,
    'site', jsonb_build_object(
      'slug', s.slug,
      'template', jsonb_build_object('key', t.key, 'version', t.version),
      'theme', s.theme,
      'seo', s.seo
    ),
    'professional', jsonb_build_object(
      'full_name', p.full_name,
      'professional_name', coalesce(p.professional_name, p.full_name),
      'council', p.council,
      'registration_number', p.registration_number,
      'specialty_registration', p.specialty_registration,
      'specialty', p.specialty,
      'bio', p.bio,
      'education', p.education,
      'phone', p.phone,
      'whatsapp', p.whatsapp,
      'email', p.email,
      'photo_url', p.photo_url,
      'social_links', p.social_links,
      'office_address', p.office_address,
      'attendance_modes', to_jsonb(p.attendance_modes)
    ),
    'pages', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'path', pg.path,
          'title', pg.title,
          'seo', pg.seo,
          'sections', coalesce((
            select jsonb_agg(
              jsonb_build_object(
                'key', sc.section_key,
                'module', sc.module_key,
                'content', sc.content,
                'settings', sc.settings
              )
              order by sc.position, sc.created_at, sc.id
            )
            from public.site_sections sc
            where sc.page_id = pg.id
              and sc.is_visible
          ), '[]'::jsonb)
        )
        order by pg.path
      )
      from public.site_pages pg
      where pg.site_id = s.id
        and pg.is_visible
    ), '[]'::jsonb)
  )
  from public.sites s
  join public.professionals p on p.id = s.professional_id
  join public.site_templates t on t.key = s.template_key
  where s.id = p_site_id;
$$;

create function private.live_site_payload(p_site_id uuid)
returns jsonb
language sql
stable
set search_path = ''
as $$
  select jsonb_build_object(
    'version', pub.version,
    'published_at', pub.published_at,
    'primary_domain', (
      select d.domain
      from public.site_domains d
      where d.site_id = s.id
        and d.is_primary
        and d.verification_status = 'verified'
    ),
    'document', pub.document
  )
  from public.sites s
  join public.site_publications pub on pub.id = s.live_publication_id
  where s.id = p_site_id;
$$;

create function private.preview_site(p_site_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_document jsonb;
begin
  if not private.has_role('editor') then
    raise exception 'Acesso negado' using errcode = 'insufficient_privilege';
  end if;

  v_document := private.build_site_document(p_site_id);
  if v_document is null then
    raise exception 'Site não encontrado' using errcode = 'no_data_found';
  end if;

  return v_document;
end;
$$;

create function private.publish_site(p_site_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_site public.sites%rowtype;
  v_professional public.professionals%rowtype;
  v_version integer;
  v_publication public.site_publications%rowtype;
begin
  if not private.has_role('admin') then
    raise exception 'Somente admin publica sites' using errcode = 'insufficient_privilege';
  end if;

  select * into v_site from public.sites where id = p_site_id for update;
  if not found then
    raise exception 'Site não encontrado' using errcode = 'no_data_found';
  end if;

  if v_site.archived_at is not null then
    raise exception 'Site arquivado não pode ser publicado' using errcode = 'check_violation';
  end if;

  select * into v_professional from public.professionals where id = v_site.professional_id;
  if v_professional.status = 'archived' then
    raise exception 'Profissional arquivado não pode ter site publicado' using errcode = 'check_violation';
  end if;
  if v_professional.registration_number is null then
    raise exception 'Informe o registro profissional (CRP ou CRM) antes de publicar'
      using errcode = 'check_violation';
  end if;

  if not exists (
    select 1
    from public.site_pages pg
    where pg.site_id = p_site_id
      and pg.path = '/'
      and pg.is_visible
  ) then
    raise exception 'O site precisa de uma página inicial visível' using errcode = 'check_violation';
  end if;

  select coalesce(max(pub.version), 0) + 1
    into v_version
    from public.site_publications pub
   where pub.site_id = p_site_id;

  insert into public.site_publications (site_id, version, document, published_by)
  values (p_site_id, v_version, private.build_site_document(p_site_id), (select auth.uid()))
  returning * into v_publication;

  update public.sites
     set live_publication_id = v_publication.id
   where id = p_site_id;

  return jsonb_build_object(
    'publication_id', v_publication.id,
    'version', v_publication.version,
    'published_at', v_publication.published_at
  );
end;
$$;

create function private.unpublish_site(p_site_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.has_role('admin') then
    raise exception 'Somente admin despublica sites' using errcode = 'insufficient_privilege';
  end if;

  update public.sites
     set live_publication_id = null
   where id = p_site_id;

  if not found then
    raise exception 'Site não encontrado' using errcode = 'no_data_found';
  end if;
end;
$$;

create function private.get_published_site_by_domain(p_domain text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select private.live_site_payload(d.site_id)
  from public.site_domains d
  where d.domain = lower(btrim(p_domain))
    and d.verification_status = 'verified';
$$;

create function private.get_published_site_by_slug(p_slug text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select private.live_site_payload(s.id)
  from public.sites s
  where s.slug = lower(btrim(p_slug));
$$;

create function public.preview_site(p_site_id uuid)
returns jsonb
language sql
stable
set search_path = ''
as $$
  select private.preview_site(p_site_id);
$$;

create function public.publish_site(p_site_id uuid)
returns jsonb
language sql
set search_path = ''
as $$
  select private.publish_site(p_site_id);
$$;

create function public.unpublish_site(p_site_id uuid)
returns void
language sql
set search_path = ''
as $$
  select private.unpublish_site(p_site_id);
$$;

create function public.get_published_site_by_domain(p_domain text)
returns jsonb
language sql
stable
set search_path = ''
as $$
  select private.get_published_site_by_domain(p_domain);
$$;

create function public.get_published_site_by_slug(p_slug text)
returns jsonb
language sql
stable
set search_path = ''
as $$
  select private.get_published_site_by_slug(p_slug);
$$;

revoke execute on function
  private.build_site_document(uuid),
  private.live_site_payload(uuid),
  private.preview_site(uuid),
  private.publish_site(uuid),
  private.unpublish_site(uuid),
  private.get_published_site_by_domain(text),
  private.get_published_site_by_slug(text),
  public.preview_site(uuid),
  public.publish_site(uuid),
  public.unpublish_site(uuid),
  public.get_published_site_by_domain(text),
  public.get_published_site_by_slug(text)
from public, anon, authenticated;

grant execute on function
  private.preview_site(uuid),
  private.publish_site(uuid),
  private.unpublish_site(uuid),
  public.preview_site(uuid),
  public.publish_site(uuid),
  public.unpublish_site(uuid)
to authenticated;

grant execute on function
  private.get_published_site_by_domain(text),
  private.get_published_site_by_slug(text),
  public.get_published_site_by_domain(text),
  public.get_published_site_by_slug(text)
to anon, authenticated;

alter table public.site_publications enable row level security;
revoke all on table public.site_publications from anon, authenticated;
grant select on table public.site_publications to authenticated;

create policy site_publications_select_staff on public.site_publications
for select to authenticated using ((select private.has_role('editor')));
