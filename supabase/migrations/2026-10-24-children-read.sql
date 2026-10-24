-- Correctif du 24 octobre 2026 : un parent ne pouvait pas créer de profil enfant
-- (« new row violates row-level security policy for table children »).
-- La règle de lecture passait par une fonction qui ne voit pas encore la ligne en cours de création.
-- À exécuter une fois dans Supabase > SQL Editor sur une base créée avant ce correctif.
drop policy if exists children_read on public.children;
create policy children_read on public.children for select to authenticated
  using (
    parent_id = auth.uid()
    or public.owns_group(group_id)
    or exists (select 1 from public.device_links d
               where d.child_id = children.id and d.user_id = auth.uid() and d.expires_at > now())
  );
