-- Verificação de RLS e publicação contra o banco já migrado.
-- Roda como postgres (SQL Editor ou MCP execute_sql). Cria dados de teste e
-- termina sempre com uma exceção: tudo é desfeito, inclusive no sucesso.
-- Resultado esperado: erro "CHECKS_OK ...". Qualquer "FAIL ..." é regressão.
do $check$
declare
  v_super uuid := gen_random_uuid();
  v_admin uuid := gen_random_uuid();
  v_editor uuid := gen_random_uuid();
  v_stranger uuid := gen_random_uuid();
  v_professional uuid;
  v_site uuid;
  v_home uuid;
  v_hero uuid;
  v_count integer;
  v_document jsonb;
  v_result jsonb;
  v_log text[] := '{}';
begin
  insert into auth.users (id, email) values
    (v_super, 'check-super@mindcare.invalid'),
    (v_admin, 'check-admin@mindcare.invalid'),
    (v_editor, 'check-editor@mindcare.invalid'),
    (v_stranger, 'check-stranger@mindcare.invalid');

  insert into public.admin_users (id, full_name, role) values
    (v_super, 'Check Super', 'super_admin'),
    (v_admin, 'Check Admin', 'admin'),
    (v_editor, 'Check Editor', 'editor');

  insert into public.professionals (full_name, council, registration_number, whatsapp, internal_notes)
  values ('Profissional Check', 'crp', '12/00000', '5548999999999', 'NOTA-INTERNA-CHECK')
  returning id into v_professional;

  insert into public.sites (professional_id, name, slug, template_key)
  values (v_professional, 'Site check', 'site-check', 'acolhedor')
  returning id into v_site;

  insert into public.site_pages (site_id, path, title)
  values (v_site, '/', 'Início')
  returning id into v_home;

  insert into public.site_sections (page_id, module_key, section_key, position, content)
  values (v_home, 'hero', 'inicio', 0, '{"title": "v1"}')
  returning id into v_hero;

  insert into public.site_sections (page_id, module_key, section_key, position, is_visible)
  values (v_home, 'faq', 'faq', 1, false);

  insert into public.site_domains (site_id, domain, is_primary, verification_status, verified_at)
  values (v_site, 'site-check.mindcare.invalid', true, 'verified', now());

  -- Conta autenticada sem linha em admin_users.
  perform set_config('request.jwt.claims', json_build_object('sub', v_stranger, 'role', 'authenticated')::text, true);
  set local role authenticated;
  select count(*) into v_count from public.professionals;
  if v_count <> 0 then raise exception 'FAIL: conta sem perfil leu professionals'; end if;
  select count(*) into v_count from public.admin_users;
  if v_count <> 0 then raise exception 'FAIL: conta sem perfil leu admin_users'; end if;
  begin
    perform public.preview_site(v_site);
    raise exception 'FAIL: conta sem perfil abriu a prévia';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.professionals (full_name) values ('Intruso');
    raise exception 'FAIL: conta sem perfil criou profissional';
  exception when insufficient_privilege then null;
  end;
  reset role;
  v_log := array_append(v_log, 'conta sem perfil bloqueada');

  -- Admin publica a versão 1.
  perform set_config('request.jwt.claims', json_build_object('sub', v_admin, 'role', 'authenticated')::text, true);
  set local role authenticated;
  v_result := public.publish_site(v_site);
  if (v_result ->> 'version')::integer <> 1 then raise exception 'FAIL: primeira publicação não é a versão 1'; end if;
  begin
    insert into public.site_publications (site_id, version, document) values (v_site, 99, '{}');
    raise exception 'FAIL: admin gravou publicação fora da função';
  exception when insufficient_privilege then null;
  end;
  begin
    update public.sites set live_publication_id = null where id = v_site;
    raise exception 'FAIL: admin trocou o ponteiro de publicação direto';
  exception when insufficient_privilege then null;
  end;
  begin
    update public.sites set archived_at = now() where id = v_site;
    raise exception 'FAIL: site arquivado continuou no ar';
  exception when check_violation then null;
  end;
  reset role;
  v_log := array_append(v_log, 'admin publica v1 só pela função');

  -- Editor altera o rascunho, sem poder publicar nem mexer em campos de admin.
  perform set_config('request.jwt.claims', json_build_object('sub', v_editor, 'role', 'authenticated')::text, true);
  set local role authenticated;
  select count(*) into v_count from public.admin_users;
  if v_count <> 3 then raise exception 'FAIL: editor não vê a equipe'; end if;
  update public.site_sections set content = '{"title": "rascunho"}' where id = v_hero;
  get diagnostics v_count = row_count;
  if v_count <> 1 then raise exception 'FAIL: editor não editou a seção'; end if;
  update public.sites set theme = '{"accent": "#8a6f5a"}' where id = v_site;
  get diagnostics v_count = row_count;
  if v_count <> 1 then raise exception 'FAIL: editor não editou o tema'; end if;
  begin
    update public.sites set slug = 'outro-slug' where id = v_site;
    raise exception 'FAIL: editor alterou o slug';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.publish_site(v_site);
    raise exception 'FAIL: editor publicou';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.professionals (full_name) values ('Pelo editor');
    raise exception 'FAIL: editor criou profissional';
  exception when insufficient_privilege then null;
  end;
  v_document := public.preview_site(v_site);
  if v_document #>> '{pages,0,sections,0,content,title}' <> 'rascunho' then
    raise exception 'FAIL: prévia não mostra o rascunho';
  end if;
  reset role;
  v_log := array_append(v_log, 'editor edita rascunho e vê prévia');

  -- Visitante anônimo só enxerga o snapshot publicado.
  perform set_config('request.jwt.claims', '', true);
  set local role anon;
  begin
    perform count(*) from public.sites;
    raise exception 'FAIL: anon leu sites';
  exception when insufficient_privilege then null;
  end;
  begin
    perform count(*) from public.site_publications;
    raise exception 'FAIL: anon leu site_publications';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.preview_site(v_site);
    raise exception 'FAIL: anon abriu a prévia';
  exception when insufficient_privilege then null;
  end;
  v_result := public.get_published_site_by_domain('Site-Check.Mindcare.invalid');
  if v_result #>> '{document,pages,0,sections,0,content,title}' <> 'v1' then
    raise exception 'FAIL: site público não serve a versão publicada';
  end if;
  if jsonb_array_length(v_result #> '{document,pages,0,sections}') <> 1 then
    raise exception 'FAIL: seção oculta entrou no snapshot';
  end if;
  if v_result::text like '%NOTA-INTERNA-CHECK%' then
    raise exception 'FAIL: nota interna vazou no snapshot';
  end if;
  if v_result ->> 'primary_domain' <> 'site-check.mindcare.invalid' then
    raise exception 'FAIL: domínio principal ausente';
  end if;
  if public.get_published_site_by_slug('site-check') is null then
    raise exception 'FAIL: slug publicado não resolve';
  end if;
  reset role;
  v_log := array_append(v_log, 'anon lê só o snapshot v1');

  -- Despublicar tira o site do ar e preserva o histórico.
  perform set_config('request.jwt.claims', json_build_object('sub', v_admin, 'role', 'authenticated')::text, true);
  set local role authenticated;
  perform public.unpublish_site(v_site);
  select count(*) into v_count from public.site_publications where site_id = v_site;
  if v_count <> 1 then raise exception 'FAIL: histórico perdido ao despublicar'; end if;
  v_result := public.publish_site(v_site);
  if (v_result ->> 'version')::integer <> 2 then raise exception 'FAIL: republicação não gerou a versão 2'; end if;
  perform public.unpublish_site(v_site);
  reset role;
  perform set_config('request.jwt.claims', '', true);
  set local role anon;
  if public.get_published_site_by_domain('site-check.mindcare.invalid') is not null then
    raise exception 'FAIL: site despublicado continua visível';
  end if;
  reset role;
  v_log := array_append(v_log, 'despublicar preserva histórico');

  -- Equipe e templates.
  perform set_config('request.jwt.claims', json_build_object('sub', v_super, 'role', 'authenticated')::text, true);
  set local role authenticated;
  begin
    update public.admin_users set role = 'admin' where id = v_super;
    raise exception 'FAIL: último super_admin rebaixado';
  exception when check_violation then null;
  end;
  update public.site_templates set is_active = false where key = 'premium';
  reset role;

  perform set_config('request.jwt.claims', json_build_object('sub', v_admin, 'role', 'authenticated')::text, true);
  set local role authenticated;
  begin
    update public.admin_users set role = 'super_admin' where id = v_admin;
    get diagnostics v_count = row_count;
    if v_count <> 0 then raise exception 'FAIL: admin se promoveu'; end if;
  end;
  begin
    insert into public.sites (professional_id, name, slug, template_key)
    values (v_professional, 'Inativo', 'template-inativo', 'premium');
    raise exception 'FAIL: site criado com template inativo';
  exception when check_violation then null;
  end;
  reset role;
  v_log := array_append(v_log, 'papéis e templates protegidos');

  -- Integridade das exclusões, com o site no ar.
  perform set_config('request.jwt.claims', json_build_object('sub', v_admin, 'role', 'authenticated')::text, true);
  set local role authenticated;
  perform public.publish_site(v_site);
  reset role;
  begin
    delete from public.professionals where id = v_professional;
    raise exception 'FAIL: profissional com site foi excluído';
  exception when foreign_key_violation then null;
  end;
  delete from public.sites where id = v_site;
  select count(*) into v_count from public.site_sections where page_id = v_home;
  if v_count <> 0 then raise exception 'FAIL: exclusão do site não removeu seções'; end if;
  v_log := array_append(v_log, 'exclusões respeitam as FKs');

  raise exception 'CHECKS_OK: %', array_to_string(v_log, ' | ');
end;
$check$;
