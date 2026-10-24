-- =====================================================================
-- ABIQ — schéma de base de données Supabase
-- À exécuter une fois dans Supabase > SQL Editor (projet vide),
-- puis exécuter seed.sql pour charger les mondes et les niveaux.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- Profils adultes (parents, animateurs, administrateurs)
-- Les enfants n'ont pas de compte : ils ont un profil sans e-mail
-- ni mot de passe, rattaché à un parent ou à un groupe.
-- ---------------------------------------------------------------------
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text,
  display_name  text not null default '',
  is_animateur  boolean not null default false,
  is_admin      boolean not null default false,
  created_at    timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if coalesce(new.is_anonymous, false) then
    return new; -- appareil d'enfant en séance : pas de profil adulte
  end if;
  insert into public.profiles (id, email, display_name, is_animateur)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', ''),
    coalesce((new.raw_user_meta_data->>'is_animateur')::boolean, false)
  )
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select p.is_admin from public.profiles p where p.id = auth.uid()), false)
$$;

create or replace function public.is_animateur()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select p.is_animateur from public.profiles p where p.id = auth.uid()), false)
$$;

-- ---------------------------------------------------------------------
-- Contenu : mondes, niveaux, historique des modifications
-- ---------------------------------------------------------------------
create table public.worlds (
  id          text primary key,
  position    int  not null,
  title       text not null,
  subtitle    text not null default '',
  created_at  timestamptz not null default now()
);

create type public.content_status as enum ('draft', 'review', 'published', 'archived');

create table public.levels (
  id            text primary key,                 -- ex. 'noe'
  world_id      text not null references public.worlds(id),
  position      int  not null,
  age_band      text not null default '6-8',
  status        public.content_status not null default 'draft',
  release_at    timestamptz,                      -- date d'ouverture pour les enfants (null = ouvert)
  content       jsonb not null,
  last_note     text not null default '',
  updated_at    timestamptz not null default now(),
  updated_by    uuid references public.profiles(id) on delete set null,
  reviewed_by   uuid references public.profiles(id) on delete set null,
  published_at  timestamptz
);
create index levels_world_pos on public.levels (world_id, position);

create table public.level_versions (
  id          bigint generated always as identity primary key,
  level_id    text not null references public.levels(id) on delete cascade,
  status      public.content_status not null,
  content     jsonb not null,
  note        text not null default '',
  changed_by  uuid references public.profiles(id) on delete set null,
  changed_at  timestamptz not null default now()
);
create index level_versions_level on public.level_versions (level_id, changed_at desc);

create or replace function public.levels_before_write()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  if new.status = 'published' and (tg_op = 'INSERT' or old.status is distinct from 'published') then
    new.published_at := now();
    new.reviewed_by := auth.uid();
  end if;
  return new;
end $$;

create trigger levels_before_write
  before insert or update on public.levels
  for each row execute function public.levels_before_write();

create or replace function public.levels_after_write()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' or new.content is distinct from old.content or new.status is distinct from old.status then
    insert into public.level_versions (level_id, status, content, note, changed_by)
    values (new.id, new.status, new.content, coalesce(new.last_note, ''), auth.uid());
  end if;
  return new;
end $$;

create trigger levels_after_write
  after insert or update on public.levels
  for each row execute function public.levels_after_write();

-- ---------------------------------------------------------------------
-- Groupes, enfants, séances
-- ---------------------------------------------------------------------
create table public.groups (
  id            uuid primary key default gen_random_uuid(),
  animateur_id  uuid not null references public.profiles(id) on delete cascade,
  name          text not null check (char_length(name) between 1 and 60),
  age_band      text not null default '6-8',
  created_at    timestamptz not null default now()
);

create table public.children (
  id          uuid primary key default gen_random_uuid(),
  parent_id   uuid references public.profiles(id) on delete cascade,
  group_id    uuid references public.groups(id) on delete cascade,
  pseudonym   text not null check (char_length(pseudonym) between 1 and 24),
  avatar      text not null default 'lion',
  age_band    text not null default '6-8',
  settings    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  constraint child_has_owner check ((parent_id is not null) <> (group_id is not null))
);
create index children_parent on public.children (parent_id);
create index children_group on public.children (group_id);

create table public.sessions (
  id              uuid primary key default gen_random_uuid(),
  group_id        uuid not null references public.groups(id) on delete cascade,
  animateur_id    uuid not null references public.profiles(id) on delete cascade,
  title           text not null default '',
  goal            text not null default '',
  level_ids       text[] not null default '{}',
  mode            text not null check (mode in ('screen', 'devices')),
  status          text not null default 'prepared' check (status in ('prepared', 'live', 'done')),
  join_code       text unique,
  screen_results  jsonb not null default '{}'::jsonb,
  started_at      timestamptz,
  ended_at        timestamptz,
  created_at      timestamptz not null default now()
);
create index sessions_group on public.sessions (group_id, created_at desc);

-- Lien temporaire entre un appareil anonyme et un enfant du groupe, pendant une séance
create table public.device_links (
  user_id     uuid not null references auth.users(id) on delete cascade,
  child_id    uuid not null references public.children(id) on delete cascade,
  session_id  uuid not null references public.sessions(id) on delete cascade,
  expires_at  timestamptz not null,
  primary key (user_id, child_id)
);

-- ---------------------------------------------------------------------
-- Progression des enfants
-- ---------------------------------------------------------------------
create table public.progress (
  child_id      uuid not null references public.children(id) on delete cascade,
  level_id      text not null references public.levels(id) on delete cascade,
  session_id    uuid references public.sessions(id) on delete set null,
  state         jsonb not null default '{}'::jsonb,   -- partie en cours (étape, puzzle, quiz…)
  stats         jsonb not null default '{}'::jsonb,   -- indices, temps, réponses
  stars         int not null default 0 check (stars between 0 and 3),
  badges        text[] not null default '{}',
  started_at    timestamptz not null default now(),
  completed_at  timestamptz,
  updated_at    timestamptz not null default now(),
  primary key (child_id, level_id)
);
create index progress_session on public.progress (session_id);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end $$;

create trigger progress_touch before update on public.progress
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------
-- Fonctions d'accès (security definer pour éviter les boucles de RLS)
-- ---------------------------------------------------------------------
create or replace function public.owns_group(g uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.groups where id = g and animateur_id = auth.uid())
$$;

create or replace function public.can_access_child(c uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.children ch
    where ch.id = c and (
      ch.parent_id = auth.uid()
      or exists (select 1 from public.groups g where g.id = ch.group_id and g.animateur_id = auth.uid())
      or exists (select 1 from public.device_links d
                 where d.child_id = ch.id and d.user_id = auth.uid() and d.expires_at > now())
    )
  )
$$;

-- ---------------------------------------------------------------------
-- Règles d'accès (Row Level Security)
-- ---------------------------------------------------------------------
alter table public.profiles       enable row level security;
alter table public.worlds         enable row level security;
alter table public.levels         enable row level security;
alter table public.level_versions enable row level security;
alter table public.groups         enable row level security;
alter table public.children       enable row level security;
alter table public.sessions       enable row level security;
alter table public.device_links   enable row level security;
alter table public.progress       enable row level security;

-- profils : chacun voit et modifie le sien ; l'admin voit tout
create policy profiles_select on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin());
create policy profiles_update on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
-- seules ces colonnes sont modifiables par l'utilisateur (pas is_admin)
revoke update on public.profiles from anon, authenticated;
grant update (display_name, is_animateur) on public.profiles to authenticated;
revoke insert, delete on public.profiles from anon, authenticated;

-- contenu : lecture publique de ce qui est publié ; l'admin gère tout
create policy worlds_read on public.worlds for select to anon, authenticated using (true);
create policy worlds_admin on public.worlds for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy levels_read on public.levels for select to anon, authenticated
  using (status = 'published' or public.is_admin());
create policy levels_admin_insert on public.levels for insert to authenticated
  with check (public.is_admin());
create policy levels_admin_update on public.levels for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy levels_admin_delete on public.levels for delete to authenticated
  using (public.is_admin());

create policy versions_admin_read on public.level_versions for select to authenticated
  using (public.is_admin());

-- groupes : l'animateur gère les siens
create policy groups_owner on public.groups for all to authenticated
  using (animateur_id = auth.uid())
  with check (animateur_id = auth.uid() and public.is_animateur());

-- enfants : le parent pour ses enfants, l'animateur pour les enfants de ses groupes,
-- l'appareil lié pendant une séance (lecture seule)
create policy children_read on public.children for select to authenticated
  using (public.can_access_child(id));
create policy children_insert on public.children for insert to authenticated
  with check (
    (parent_id = auth.uid() and group_id is null)
    or (parent_id is null and public.owns_group(group_id))
  );
create policy children_update on public.children for update to authenticated
  using (parent_id = auth.uid() or public.owns_group(group_id))
  with check (
    (parent_id = auth.uid() and group_id is null)
    or (parent_id is null and public.owns_group(group_id))
  );
create policy children_delete on public.children for delete to authenticated
  using (parent_id = auth.uid() or public.owns_group(group_id));

-- séances : l'animateur gère les siennes (les appareils passent par les fonctions plus bas)
create policy sessions_owner on public.sessions for all to authenticated
  using (animateur_id = auth.uid())
  with check (animateur_id = auth.uid() and public.owns_group(group_id));

-- liens d'appareil : visibles par l'appareil concerné et l'animateur, écrits uniquement par claim_child()
create policy device_links_read on public.device_links for select to authenticated
  using (user_id = auth.uid() or exists (
    select 1 from public.sessions s where s.id = session_id and s.animateur_id = auth.uid()));

-- progression : quiconque a accès à l'enfant
create policy progress_read on public.progress for select to authenticated
  using (public.can_access_child(child_id));
create policy progress_insert on public.progress for insert to authenticated
  with check (public.can_access_child(child_id));
create policy progress_update on public.progress for update to authenticated
  using (public.can_access_child(child_id)) with check (public.can_access_child(child_id));
create policy progress_delete on public.progress for delete to authenticated
  using (exists (select 1 from public.children ch where ch.id = child_id
                 and (ch.parent_id = auth.uid() or public.owns_group(ch.group_id))));

-- ---------------------------------------------------------------------
-- Fonctions appelées par l'application
-- ---------------------------------------------------------------------

-- L'animateur lance une séance : génère un code à 6 caractères faciles à lire
create or replace function public.start_session(p_session uuid)
returns public.sessions language plpgsql security definer set search_path = public as $$
declare
  s public.sessions;
  alphabet text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  code text;
  i int;
begin
  select * into s from public.sessions where id = p_session and animateur_id = auth.uid();
  if not found then raise exception 'Séance introuvable'; end if;
  if s.join_code is null then
    loop
      code := '';
      for i in 1..6 loop
        code := code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
      end loop;
      exit when not exists (select 1 from public.sessions where join_code = code);
    end loop;
  else
    code := s.join_code;
  end if;
  update public.sessions
     set status = 'live', join_code = code, started_at = coalesce(started_at, now()), ended_at = null
   where id = p_session
  returning * into s;
  return s;
end $$;

create or replace function public.end_session(p_session uuid)
returns public.sessions language plpgsql security definer set search_path = public as $$
declare s public.sessions;
begin
  update public.sessions set status = 'done', ended_at = now(), join_code = null
   where id = p_session and animateur_id = auth.uid()
  returning * into s;
  if not found then raise exception 'Séance introuvable'; end if;
  update public.device_links set expires_at = now() where session_id = p_session;
  return s;
end $$;

-- Un appareil saisit le code : on renvoie la liste des prénoms du groupe (pseudonymes)
create or replace function public.join_session_info(p_code text)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare s public.sessions; g public.groups;
begin
  select * into s from public.sessions
   where join_code = upper(trim(p_code)) and status = 'live' and mode = 'devices';
  if not found then return null; end if;
  select * into g from public.groups where id = s.group_id;
  return jsonb_build_object(
    'session_id', s.id,
    'group_name', g.name,
    'title', s.title,
    'level_ids', to_jsonb(s.level_ids),
    'kids', coalesce((select jsonb_agg(jsonb_build_object('id', c.id, 'pseudonym', c.pseudonym, 'avatar', c.avatar) order by c.pseudonym)
                      from public.children c where c.group_id = s.group_id), '[]'::jsonb)
  );
end $$;

-- L'enfant choisit son prénom : l'appareil (connexion anonyme) est lié à cet enfant pour 6 heures
create or replace function public.claim_child(p_code text, p_child uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare s public.sessions; c public.children;
begin
  if auth.uid() is null then raise exception 'Connexion requise'; end if;
  select * into s from public.sessions
   where join_code = upper(trim(p_code)) and status = 'live' and mode = 'devices';
  if not found then raise exception 'Code de séance invalide'; end if;
  select * into c from public.children where id = p_child and group_id = s.group_id;
  if not found then raise exception 'Enfant introuvable dans ce groupe'; end if;
  insert into public.device_links (user_id, child_id, session_id, expires_at)
  values (auth.uid(), c.id, s.id, now() + interval '6 hours')
  on conflict (user_id, child_id) do update set session_id = excluded.session_id, expires_at = excluded.expires_at;
  return jsonb_build_object('session_id', s.id, 'level_ids', to_jsonb(s.level_ids), 'child', to_jsonb(c));
end $$;

-- Suppression complète du compte adulte et de toutes les données associées
create or replace function public.delete_my_account()
returns void language plpgsql security definer set search_path = public, auth as $$
begin
  if auth.uid() is null then raise exception 'Connexion requise'; end if;
  delete from auth.users where id = auth.uid();
end $$;

-- Administration : changer les rôles d'un utilisateur
create or replace function public.admin_set_roles(p_user uuid, p_animateur boolean, p_admin boolean)
returns public.profiles language plpgsql security definer set search_path = public as $$
declare p public.profiles;
begin
  if not public.is_admin() then raise exception 'Réservé aux administrateurs'; end if;
  if p_user = auth.uid() and not p_admin then raise exception 'Vous ne pouvez pas retirer vos propres droits'; end if;
  update public.profiles set is_animateur = p_animateur, is_admin = p_admin where id = p_user returning * into p;
  return p;
end $$;

-- Administration : quelques chiffres d'usage, sans données personnelles
create or replace function public.admin_stats()
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Réservé aux administrateurs'; end if;
  return jsonb_build_object(
    'parents', (select count(*) from public.profiles where not is_animateur),
    'animateurs', (select count(*) from public.profiles where is_animateur),
    'children', (select count(*) from public.children where parent_id is not null),
    'group_children', (select count(*) from public.children where group_id is not null),
    'groups', (select count(*) from public.groups),
    'sessions', (select count(*) from public.sessions),
    'levels_started', (select count(*) from public.progress),
    'levels_completed', (select count(*) from public.progress where completed_at is not null),
    'by_level', coalesce((select jsonb_object_agg(level_id, jsonb_build_object('started', n, 'completed', d))
                          from (select level_id, count(*) n, count(completed_at) d from public.progress group by level_id) t), '{}'::jsonb)
  );
end $$;

revoke all on function public.start_session(uuid) from public, anon;
revoke all on function public.end_session(uuid) from public, anon;
revoke all on function public.claim_child(text, uuid) from public, anon;
revoke all on function public.delete_my_account() from public, anon;
revoke all on function public.admin_set_roles(uuid, boolean, boolean) from public, anon;
revoke all on function public.admin_stats() from public, anon;
grant execute on function public.start_session(uuid) to authenticated;
grant execute on function public.end_session(uuid) to authenticated;
grant execute on function public.claim_child(text, uuid) to authenticated;
grant execute on function public.delete_my_account() to authenticated;
grant execute on function public.admin_set_roles(uuid, boolean, boolean) to authenticated;
grant execute on function public.admin_stats() to authenticated;
grant execute on function public.join_session_info(text) to anon, authenticated;

-- ---------------------------------------------------------------------
-- Stockage des images et sons (lecture publique, écriture admin)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy media_admin_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and public.is_admin());
create policy media_admin_update on storage.objects for update to authenticated
  using (bucket_id = 'media' and public.is_admin());
create policy media_admin_delete on storage.objects for delete to authenticated
  using (bucket_id = 'media' and public.is_admin());
create policy media_read on storage.objects for select to anon, authenticated
  using (bucket_id = 'media');
