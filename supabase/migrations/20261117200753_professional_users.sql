-- Vínculo Auth ↔ professionals (portal do cliente). 1:1 nesta versão.

create table public.professional_users (
  auth_user_id uuid primary key references auth.users (id) on delete cascade,
  professional_id uuid not null unique references public.professionals (id) on delete cascade,
  email text not null unique check (
    email = lower(email)
    and char_length(email) between 3 and 320
    and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  ),
  is_active boolean not null default true,
  invited_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.professional_users is
  'Login do profissional/cliente. Auth user vinculado a um único professional.';

create index professional_users_professional_id_idx
  on public.professional_users (professional_id);

create trigger professional_users_set_updated_at
before update on public.professional_users
for each row execute function private.set_updated_at();

create function private.linked_professional_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select pu.professional_id
  from public.professional_users pu
  where pu.auth_user_id = (select auth.uid())
    and pu.is_active
  limit 1;
$$;

create function private.owns_professional(p_professional_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.professional_users pu
    where pu.auth_user_id = (select auth.uid())
      and pu.professional_id = p_professional_id
      and pu.is_active
  );
$$;

create function private.owns_site(p_site_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.sites s
    join public.professional_users pu on pu.professional_id = s.professional_id
    where s.id = p_site_id
      and pu.auth_user_id = (select auth.uid())
      and pu.is_active
  );
$$;

revoke execute on function private.linked_professional_id() from public, anon, authenticated;
revoke execute on function private.owns_professional(uuid) from public, anon, authenticated;
revoke execute on function private.owns_site(uuid) from public, anon, authenticated;
grant execute on function private.linked_professional_id() to authenticated;
grant execute on function private.owns_professional(uuid) to authenticated;
grant execute on function private.owns_site(uuid) to authenticated;

-- Impede que o dono altere status ou notas internas.
create function private.guard_professional_owner_fields()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if private.has_role('admin') then
    return new;
  end if;

  if private.owns_professional(old.id) then
    if new.status is distinct from old.status
       or new.internal_notes is distinct from old.internal_notes
    then
      raise exception 'Profissional não pode alterar status ou notas internas'
        using errcode = 'insufficient_privilege';
    end if;
  end if;

  return new;
end;
$$;

create trigger professionals_guard_owner_fields
before update on public.professionals
for each row execute function private.guard_professional_owner_fields();

revoke execute on function private.guard_professional_owner_fields() from public, anon, authenticated;

alter table public.professional_users enable row level security;
revoke all on table public.professional_users from anon, authenticated;
grant select on table public.professional_users to authenticated;
grant insert, update, delete on table public.professional_users to authenticated;

create policy professional_users_select_self_or_staff
on public.professional_users for select to authenticated
using (
  auth_user_id = (select auth.uid())
  or (select private.has_role('editor'))
);

create policy professional_users_insert_admin
on public.professional_users for insert to authenticated
with check ((select private.has_role('admin')));

create policy professional_users_update_admin
on public.professional_users for update to authenticated
using ((select private.has_role('admin')))
with check ((select private.has_role('admin')));

create policy professional_users_delete_admin
on public.professional_users for delete to authenticated
using ((select private.has_role('admin')));

-- Profissionais: dono lê e edita o próprio cadastro.
create policy professionals_select_owner
on public.professionals for select to authenticated
using ((select private.owns_professional(id)));

create policy professionals_update_owner
on public.professionals for update to authenticated
using ((select private.owns_professional(id)))
with check ((select private.owns_professional(id)));

-- Sites / páginas / seções do próprio professional.
create policy sites_select_owner
on public.sites for select to authenticated
using ((select private.owns_professional(professional_id)));

create policy sites_update_owner
on public.sites for update to authenticated
using ((select private.owns_professional(professional_id)))
with check ((select private.owns_professional(professional_id)));

create policy site_pages_select_owner
on public.site_pages for select to authenticated
using ((select private.owns_site(site_id)));

create policy site_pages_insert_owner
on public.site_pages for insert to authenticated
with check ((select private.owns_site(site_id)));

create policy site_pages_update_owner
on public.site_pages for update to authenticated
using ((select private.owns_site(site_id)))
with check ((select private.owns_site(site_id)));

create policy site_pages_delete_owner
on public.site_pages for delete to authenticated
using ((select private.owns_site(site_id)));

create policy site_sections_select_owner
on public.site_sections for select to authenticated
using (
  exists (
    select 1
    from public.site_pages p
    where p.id = site_sections.page_id
      and private.owns_site(p.site_id)
  )
);

create policy site_sections_insert_owner
on public.site_sections for insert to authenticated
with check (
  exists (
    select 1
    from public.site_pages p
    where p.id = page_id
      and private.owns_site(p.site_id)
  )
);

create policy site_sections_update_owner
on public.site_sections for update to authenticated
using (
  exists (
    select 1
    from public.site_pages p
    where p.id = site_sections.page_id
      and private.owns_site(p.site_id)
  )
)
with check (
  exists (
    select 1
    from public.site_pages p
    where p.id = page_id
      and private.owns_site(p.site_id)
  )
);

create policy site_sections_delete_owner
on public.site_sections for delete to authenticated
using (
  exists (
    select 1
    from public.site_pages p
    where p.id = site_sections.page_id
      and private.owns_site(p.site_id)
  )
);

create policy site_domains_select_owner
on public.site_domains for select to authenticated
using ((select private.owns_site(site_id)));

create policy site_publications_select_owner
on public.site_publications for select to authenticated
using ((select private.owns_site(site_id)));

create policy site_templates_select_owner
on public.site_templates for select to authenticated
using (
  exists (
    select 1
    from public.sites s
    where s.template_key = site_templates.key
      and private.owns_professional(s.professional_id)
  )
);

-- Prévia também para o dono do site.
create or replace function private.preview_site(p_site_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_document jsonb;
begin
  if not (
    private.has_role('editor')
    or private.owns_site(p_site_id)
  ) then
    raise exception 'Acesso negado' using errcode = 'insufficient_privilege';
  end if;

  v_document := private.build_site_document(p_site_id);
  if v_document is null then
    raise exception 'Site não encontrado' using errcode = 'no_data_found';
  end if;

  return v_document;
end;
$$;

-- Storage: dono sobe/apaga só nos paths do próprio professional/site.
create policy site_media_insert_owner
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'site-media'
  and (
    (
      (storage.foldername(name))[1] = 'professionals'
      and private.owns_professional(((storage.foldername(name))[2])::uuid)
    )
    or (
      (storage.foldername(name))[1] = 'sites'
      and private.owns_site(((storage.foldername(name))[2])::uuid)
    )
  )
);

create policy site_media_update_owner
on storage.objects
for update
to authenticated
using (
  bucket_id = 'site-media'
  and (
    (
      (storage.foldername(name))[1] = 'professionals'
      and private.owns_professional(((storage.foldername(name))[2])::uuid)
    )
    or (
      (storage.foldername(name))[1] = 'sites'
      and private.owns_site(((storage.foldername(name))[2])::uuid)
    )
  )
)
with check (
  bucket_id = 'site-media'
  and (
    (
      (storage.foldername(name))[1] = 'professionals'
      and private.owns_professional(((storage.foldername(name))[2])::uuid)
    )
    or (
      (storage.foldername(name))[1] = 'sites'
      and private.owns_site(((storage.foldername(name))[2])::uuid)
    )
  )
);

create policy site_media_delete_owner
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'site-media'
  and (
    (
      (storage.foldername(name))[1] = 'professionals'
      and private.owns_professional(((storage.foldername(name))[2])::uuid)
    )
    or (
      (storage.foldername(name))[1] = 'sites'
      and private.owns_site(((storage.foldername(name))[2])::uuid)
    )
  )
);
