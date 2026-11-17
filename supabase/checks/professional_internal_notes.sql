-- Confirma que a nota interna do profissional não entra no documento público.
-- Roda como postgres. Termina sempre com exceção para desfazer os dados.
-- Resultado esperado: erro "CHECKS_OK ...". Qualquer "FAIL ..." é regressão.
do $check$
declare
  v_professional uuid;
  v_site uuid;
  v_document jsonb;
  v_marker text := 'NOTA-INTERNA-PAYLOAD-' || gen_random_uuid()::text;
begin
  insert into public.professionals (
    full_name,
    professional_name,
    council,
    registration_number,
    whatsapp,
    specialty,
    internal_notes
  )
  values (
    'Profissional Nota Check',
    'Dra. Nota Check',
    'crp',
    '06/00000',
    '5548999887766',
    'Psicologia clínica',
    v_marker
  )
  returning id into v_professional;

  insert into public.sites (professional_id, name, slug, template_key)
  values (v_professional, 'Site nota check', 'site-nota-check', 'acolhedor')
  returning id into v_site;

  insert into public.site_pages (site_id, path, title)
  values (v_site, '/', 'Início');

  v_document := private.build_site_document(v_site);

  if v_document is null then
    raise exception 'FAIL: documento público veio nulo';
  end if;

  if v_document::text like '%' || v_marker || '%' then
    raise exception 'FAIL: nota interna entrou no documento público';
  end if;

  if v_document #>> '{professional,full_name}' is distinct from 'Profissional Nota Check' then
    raise exception 'FAIL: nome público ausente no documento';
  end if;

  if v_document #>> '{professional,professional_name}' is distinct from 'Dra. Nota Check' then
    raise exception 'FAIL: nome profissional ausente no documento';
  end if;

  if v_document #>> '{professional,registration_number}' is distinct from '06/00000' then
    raise exception 'FAIL: registro ausente no documento';
  end if;

  if v_document ? 'internal_notes'
     or (v_document -> 'professional') ? 'internal_notes'
     or (v_document -> 'professional') ? 'status'
     or (v_document -> 'professional') ? 'id'
  then
    raise exception 'FAIL: campos internos vazaram no documento';
  end if;

  raise exception 'CHECKS_OK: nota interna fora do snapshot';
end;
$check$;
