-- Blog editorial por site: posts no rascunho + inclusão no snapshot publicado.

create type public.site_post_status as enum ('draft', 'published');

create table public.site_posts (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites (id) on delete cascade,
  slug text not null check (
    slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    and char_length(slug) between 1 and 120
  ),
  title text not null check (char_length(btrim(title)) between 1 and 200),
  excerpt text not null default '' check (char_length(excerpt) <= 1000),
  body_markdown text not null default '' check (char_length(body_markdown) <= 200000),
  cover_image_url text check (
    cover_image_url is null
    or cover_image_url ~ '^https://'
  ),
  status public.site_post_status not null default 'draft',
  published_at timestamptz,
  seo jsonb not null default '{}'::jsonb check (jsonb_typeof(seo) = 'object'),
  position integer not null default 0 check (position >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint site_posts_site_id_slug_key unique (site_id, slug)
);

comment on table public.site_posts is
  'Artigos do blog do site. Só status=published entram no snapshot de publicação.';

create index site_posts_site_id_status_position_idx
  on public.site_posts (site_id, status, position, published_at desc nulls last);

create trigger site_posts_set_updated_at
before update on public.site_posts
for each row execute function private.set_updated_at();

alter table public.site_posts enable row level security;

revoke all on table public.site_posts from anon, authenticated;
grant select, insert, update, delete on table public.site_posts to authenticated;

-- Staff
create policy site_posts_select_staff on public.site_posts
for select to authenticated using ((select private.has_role('editor')));

create policy site_posts_insert_staff on public.site_posts
for insert to authenticated with check ((select private.has_role('editor')));

create policy site_posts_update_staff on public.site_posts
for update to authenticated
using ((select private.has_role('editor')))
with check ((select private.has_role('editor')));

create policy site_posts_delete_staff on public.site_posts
for delete to authenticated using ((select private.has_role('editor')));

-- Owner (portal do profissional)
create policy site_posts_select_owner on public.site_posts
for select to authenticated
using ((select private.owns_site(site_id)));

create policy site_posts_insert_owner on public.site_posts
for insert to authenticated
with check ((select private.owns_site(site_id)));

create policy site_posts_update_owner on public.site_posts
for update to authenticated
using ((select private.owns_site(site_id)))
with check ((select private.owns_site(site_id)));

create policy site_posts_delete_owner on public.site_posts
for delete to authenticated
using ((select private.owns_site(site_id)));

-- Snapshot: inclui blog.settings de sites.seo.blog + posts published.
create or replace function private.build_site_document(p_site_id uuid)
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
    ), '[]'::jsonb),
    'blog', jsonb_build_object(
      'enabled', exists (
        select 1
        from public.site_posts bp
        where bp.site_id = s.id
          and bp.status = 'published'
      ),
      'title', coalesce(
        nullif(btrim(s.seo #>> '{blog,title}'), ''),
        'Blog'
      ),
      'intro', coalesce(
        nullif(btrim(s.seo #>> '{blog,intro}'), ''),
        ''
      ),
      'posts', coalesce((
        select jsonb_agg(
          jsonb_build_object(
            'slug', bp.slug,
            'title', bp.title,
            'excerpt', bp.excerpt,
            'body_markdown', bp.body_markdown,
            'cover_image_url', bp.cover_image_url,
            'published_at', bp.published_at,
            'seo', bp.seo
          )
          order by bp.position, bp.published_at desc nulls last, bp.created_at desc, bp.id
        )
        from public.site_posts bp
        where bp.site_id = s.id
          and bp.status = 'published'
      ), '[]'::jsonb)
    )
  )
  from public.sites s
  join public.professionals p on p.id = s.professional_id
  join public.site_templates t on t.key = s.template_key
  where s.id = p_site_id;
$$;
