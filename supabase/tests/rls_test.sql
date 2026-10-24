-- Tests des règles d'accès. Chaque bloc échoue bruyamment si une règle est fausse.
\set ON_ERROR_STOP on
set client_min_messages = warning;

-- Utilisateurs
insert into auth.users (id, email, raw_user_meta_data) values
 ('00000000-0000-0000-0000-00000000000a', 'parent@test', '{"display_name":"Awa"}'),
 ('00000000-0000-0000-0000-00000000000b', 'autre@test', '{"display_name":"Koffi"}'),
 ('00000000-0000-0000-0000-00000000000c', 'anim@test', '{"display_name":"Pasteur Yao","is_animateur":true}'),
 ('00000000-0000-0000-0000-00000000000d', 'admin@test', '{"display_name":"Gab"}');
insert into auth.users (id, is_anonymous) values ('00000000-0000-0000-0000-0000000000e1', true);
update public.profiles set is_admin = true where id = '00000000-0000-0000-0000-00000000000d';

do $$ begin
  assert (select count(*) from public.profiles) = 4, 'un profil par adulte, aucun pour l''appareil anonyme';
  assert (select is_animateur from public.profiles where id = '00000000-0000-0000-0000-00000000000c'), 'animateur déclaré à l''inscription';
end $$;

-- Contenu : l'admin crée un monde et deux niveaux (un publié, un brouillon)
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000000d', false);
insert into public.worlds (id, position, title) values ('m1', 1, 'Au commencement');
insert into public.levels (id, world_id, position, status, content) values
  ('noe', 'm1', 1, 'published', '{"title":"Noé"}'),
  ('abraham', 'm1', 2, 'draft', '{"title":"Abraham"}');
update public.levels set content = '{"title":"Noé v2"}', last_note = 'correction' where id = 'noe';
do $$ begin
  assert (select count(*) from public.level_versions where level_id = 'noe') = 2, 'historique : création + modification';
  assert (select published_at is not null from public.levels where id = 'noe'), 'date de publication';
end $$;
reset role;

-- Visiteur non connecté : ne voit que le publié
set role anon;
select set_config('request.jwt.claim.sub', '', false);
do $$ begin
  assert (select count(*) from public.levels) = 1, 'anon ne voit que les niveaux publiés';
  assert (select count(*) from public.profiles) = 0, 'anon ne voit aucun profil';
end $$;
reset role;

-- Parent A crée un enfant ; ne peut pas se donner les droits admin
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000000a', false);
insert into public.children (parent_id, pseudonym, avatar) values ('00000000-0000-0000-0000-00000000000a', 'Ama', 'lion');
insert into public.progress (child_id, level_id, stars) select id, 'noe', 3 from public.children where pseudonym = 'Ama';
do $$ begin
  assert (select count(*) from public.children) = 1, 'le parent voit son enfant';
  assert (select count(*) from public.levels) = 1, 'le parent ne voit pas les brouillons';
  assert (select count(*) from public.level_versions) = 0, 'historique réservé à l''admin';
end $$;
do $$ begin
  begin
    update public.profiles set is_admin = true where id = auth.uid();
    raise exception 'ÉCHEC : un parent a pu se donner les droits admin';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.levels (id, world_id, position, content) values ('pirate', 'm1', 9, '{}');
    raise exception 'ÉCHEC : un parent a pu créer un niveau';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.groups (animateur_id, name) values (auth.uid(), 'Groupe pirate');
    raise exception 'ÉCHEC : un non-animateur a créé un groupe';
  exception when insufficient_privilege then null;
  end;
end $$;
update public.profiles set display_name = 'Awa K.' where id = auth.uid();
reset role;

-- Parent B ne voit rien de la famille A
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000000b', false);
do $$ begin
  assert (select count(*) from public.children) = 0, 'B ne voit pas les enfants de A';
  assert (select count(*) from public.progress) = 0, 'B ne voit pas la progression de A';
  assert (select count(*) from public.profiles) = 1, 'B ne voit que son profil';
end $$;
do $$ begin
  begin
    insert into public.progress (child_id, level_id) select id, 'noe' from public.children limit 1;
    insert into public.children (parent_id, pseudonym) values ('00000000-0000-0000-0000-00000000000a', 'Intrus');
    raise exception 'ÉCHEC : B a créé un enfant chez A';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;

-- Animateur : groupe, enfants du groupe, séance
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000000c', false);
insert into public.groups (animateur_id, name) values ('00000000-0000-0000-0000-00000000000c', 'École du dimanche 6-8');
insert into public.children (group_id, pseudonym, avatar)
  select id, p, 'lion' from public.groups, unnest(array['Junior','Grâce','Emmanuel']) p;
insert into public.sessions (group_id, animateur_id, title, level_ids, mode)
  select id, '00000000-0000-0000-0000-00000000000c', 'Séance Noé', array['noe'], 'devices' from public.groups;
select public.start_session(id) from public.sessions;
do $$ begin
  assert (select count(*) from public.children) = 3, 'l''animateur voit les enfants de son groupe et pas ceux des familles';
  assert (select length(join_code) from public.sessions) = 6, 'code de séance généré';
end $$;
reset role;

-- Appareil d'enfant (anonyme) : rejoint la séance avec le code
create temp table t_code as select join_code from public.sessions;
grant select on t_code to anon, authenticated;
set role anon;
select set_config('request.jwt.claim.sub', '', false);
do $$ declare info jsonb; begin
  info := public.join_session_info((select lower(join_code) from t_code));
  assert jsonb_array_length(info->'kids') = 3, 'la liste des prénoms du groupe est visible avec le code';
  assert public.join_session_info('ZZZZZZ') is null, 'mauvais code : rien';
end $$;
reset role;

set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000e1', false);
do $$ begin
  assert (select count(*) from public.children) = 0, 'avant le choix du prénom, l''appareil ne voit aucun enfant';
end $$;
create temp table t_kid as select (public.join_session_info((select join_code from t_code))->'kids'->0->>'id')::uuid as id;
select public.claim_child((select join_code from t_code), (select id from t_kid));
insert into public.progress (child_id, level_id, session_id, stars)
  select k.id, 'noe', (select id from public.sessions limit 1), 2 from t_kid k;
do $$ begin
  assert (select count(*) from public.children) = 1, 'l''appareil ne voit que l''enfant choisi';
  assert (select count(*) from public.progress) = 1, 'l''appareil voit sa propre progression';
end $$;
do $$ begin
  begin
    update public.children set pseudonym = 'Pirate';
    if (select count(*) from public.children where pseudonym = 'Pirate') > 0 then
      raise exception 'ÉCHEC : l''appareil a renommé un enfant';
    end if;
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;

-- L'animateur voit la progression de son groupe, pas celle des familles
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000000c', false);
do $$ begin
  assert (select count(*) from public.progress) = 1, 'animateur : progression du groupe seulement';
  assert (select count(*) from public.device_links) = 1, 'animateur : voit les appareils de sa séance';
end $$;
select public.end_session(id) from public.sessions;
reset role;

-- Séance terminée : l'appareil perd l'accès
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000e1', false);
do $$ begin
  assert (select count(*) from public.children) = 0, 'après la séance, l''appareil n''a plus accès';
end $$;
reset role;

-- Admin : rôles et statistiques
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000000d', false);
select public.admin_set_roles('00000000-0000-0000-0000-00000000000b', true, false);
do $$ declare st jsonb; begin
  st := public.admin_stats();
  assert (st->>'children')::int = 1, 'stats : 1 enfant de famille';
  assert (st->>'group_children')::int = 3, 'stats : 3 enfants de groupe';
end $$;
reset role;
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000000a', false);
do $$ begin
  begin
    perform public.admin_stats();
    raise exception 'ÉCHEC : un parent a lu les stats admin';
  exception when raise_exception then
    if sqlerrm like 'ÉCHEC%' then raise; end if;
  end;
end $$;
-- Suppression de compte : tout part en cascade
select public.delete_my_account();
reset role;
do $$ begin
  assert (select count(*) from public.children where pseudonym = 'Ama') = 0, 'enfant supprimé avec le compte';
  assert (select count(*) from public.progress p join public.children c on c.id = p.child_id where c.parent_id is not null) = 0, 'progression supprimée';
  assert (select count(*) from auth.users where email = 'parent@test') = 0, 'compte supprimé';
end $$;

select 'TOUS LES TESTS SONT PASSÉS' as resultat;
