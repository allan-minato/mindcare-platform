-- E-mail denormalizado para listagem no painel (sem Admin API no Next).
alter table public.admin_users
  add column email text;

update public.admin_users au
set email = lower(u.email)
from auth.users u
where u.id = au.id
  and u.email is not null;

alter table public.admin_users
  alter column email set not null;

alter table public.admin_users
  add constraint admin_users_email_format
  check (
    email = lower(email)
    and char_length(email) between 3 and 320
    and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  );

alter table public.admin_users
  add constraint admin_users_email_key unique (email);

comment on column public.admin_users.email is
  'E-mail do Auth, espelhado para listagem da equipe no painel.';
