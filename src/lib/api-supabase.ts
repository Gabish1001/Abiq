import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import type { Api } from "./api";
import type { AuthUser, Child, Level, Profile, Session } from "./types";

const toUser = (u: User | null | undefined): AuthUser | null =>
  u ? { id: u.id, email: u.email ?? null, anonymous: !!u.is_anonymous } : null;

function must<T>(r: { data: T | null; error: { message: string } | null }): T {
  if (r.error) throw new Error(r.error.message);
  return r.data as T;
}

export function createSupabaseApi(url: string, key: string): Api {
  const sb: SupabaseClient = createClient(url, key, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: "abiq-auth" }
  });
  const uid = async () => {
    const { data } = await sb.auth.getSession();
    const id = data.session?.user.id;
    if (!id) throw new Error("Connexion requise");
    return id;
  };

  const api: Api = {
    demo: false,

    async currentUser() { const { data } = await sb.auth.getSession(); return toUser(data.session?.user); },
    onAuth(cb) {
      const { data } = sb.auth.onAuthStateChange((_e, session) => cb(toUser(session?.user)));
      return () => data.subscription.unsubscribe();
    },
    async signUp({ email, password, displayName, isAnimateur }) {
      const r = await sb.auth.signUp({
        email, password,
        options: { data: { display_name: displayName, is_animateur: isAnimateur }, emailRedirectTo: location.origin + "/espace" }
      });
      if (r.error) throw new Error(r.error.message);
      return { needsConfirm: !r.data.session };
    },
    async signIn(email, password) { const r = await sb.auth.signInWithPassword({ email, password }); if (r.error) throw new Error(r.error.message); },
    async signOut() { await sb.auth.signOut(); },
    async sendReset(email) {
      const r = await sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin + "/nouveau-mot-de-passe" });
      if (r.error) throw new Error(r.error.message);
    },
    async setPassword(password) { const r = await sb.auth.updateUser({ password }); if (r.error) throw new Error(r.error.message); },
    async ensureDeviceSession() {
      const { data } = await sb.auth.getSession();
      if (data.session) return;
      const r = await sb.auth.signInAnonymously();
      if (r.error) throw new Error(r.error.message);
    },

    async myProfile() {
      const { data } = await sb.auth.getSession();
      const id = data.session?.user.id; if (!id || data.session?.user.is_anonymous) return null;
      const r = await sb.from("profiles").select("*").eq("id", id).maybeSingle();
      return must(r) as Profile | null;
    },
    async updateProfile(p) {
      const id = await uid();
      return must(await sb.from("profiles").update(p).eq("id", id).select().single()) as Profile;
    },
    async deleteAccount() { must(await sb.rpc("delete_my_account")); await sb.auth.signOut(); },

    async worlds() { return must(await sb.from("worlds").select("id,position,title,subtitle").order("position")); },
    async levels(opts) {
      let q = sb.from("levels").select("*").order("position");
      if (!opts?.all) q = q.eq("status", "published");
      return must(await q) as Level[];
    },
    async level(id) { return must(await sb.from("levels").select("*").eq("id", id).maybeSingle()) as Level | null; },
    async saveLevel(l, note) {
      const row = { ...l, last_note: note };
      const up = must(await sb.from("levels").update(row).eq("id", l.id).select()) as Level[];
      if (up.length) return up[0];
      return must(await sb.from("levels").insert(row).select().single()) as Level;
    },
    async levelVersions(id) { return must(await sb.from("level_versions").select("*").eq("level_id", id).order("changed_at", { ascending: false }).limit(60)); },
    async uploadMedia(file) {
      const safe = file.name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9.]+/g, "-");
      const path = `${Date.now().toString(36)}-${safe}`;
      const r = await sb.storage.from("media").upload(path, file, { cacheControl: "31536000", upsert: false, contentType: file.type });
      if (r.error) throw new Error(r.error.message);
      return sb.storage.from("media").getPublicUrl(path).data.publicUrl;
    },
    async listMedia() {
      const r = await sb.storage.from("media").list("", { limit: 500, sortBy: { column: "created_at", order: "desc" } });
      if (r.error) throw new Error(r.error.message);
      return (r.data || []).filter(f => f.name && !f.name.startsWith(".")).map(f => ({
        name: f.name, url: sb.storage.from("media").getPublicUrl(f.name).data.publicUrl,
        size: (f.metadata as { size?: number } | null)?.size, created_at: f.created_at || undefined
      }));
    },
    async deleteMedia(name) { const r = await sb.storage.from("media").remove([name]); if (r.error) throw new Error(r.error.message); },

    async myChildren() {
      const id = await uid();
      return must(await sb.from("children").select("*").eq("parent_id", id).order("created_at")) as Child[];
    },
    async child(id) { return must(await sb.from("children").select("*").eq("id", id).maybeSingle()) as Child | null; },
    async createChild(c) {
      const id = await uid();
      const row: Record<string, string> = c.group_id ? { group_id: c.group_id, pseudonym: c.pseudonym, avatar: c.avatar } : { parent_id: id, pseudonym: c.pseudonym, avatar: c.avatar };
      return must(await sb.from("children").insert(row).select().single()) as Child;
    },
    async updateChild(id, patch) { return must(await sb.from("children").update(patch).eq("id", id).select().single()) as Child; },
    async deleteChild(id) { must(await sb.from("children").delete().eq("id", id)); },

    async progressFor(ids) {
      if (!ids.length) return [];
      return must(await sb.from("progress").select("*").in("child_id", ids));
    },
    async saveProgress(p) { must(await sb.from("progress").upsert(p, { onConflict: "child_id,level_id" })); },
    async deleteProgress(childId, levelId) { must(await sb.from("progress").delete().eq("child_id", childId).eq("level_id", levelId)); },

    async myGroups() {
      const id = await uid();
      return must(await sb.from("groups").select("*").eq("animateur_id", id).order("created_at"));
    },
    async createGroup(name) {
      const id = await uid();
      return must(await sb.from("groups").insert({ name, animateur_id: id }).select().single());
    },
    async updateGroup(id, patch) { return must(await sb.from("groups").update(patch).eq("id", id).select().single()); },
    async deleteGroup(id) { must(await sb.from("groups").delete().eq("id", id)); },
    async groupChildren(groupId) { return must(await sb.from("children").select("*").eq("group_id", groupId).order("pseudonym")) as Child[]; },

    async sessions(groupId) {
      const id = await uid();
      let q = sb.from("sessions").select("*").eq("animateur_id", id).order("created_at", { ascending: false });
      if (groupId) q = q.eq("group_id", groupId);
      return must(await q) as Session[];
    },
    async session(id) { return must(await sb.from("sessions").select("*").eq("id", id).maybeSingle()) as Session | null; },
    async createSession(s) {
      const id = await uid();
      return must(await sb.from("sessions").insert({ ...s, animateur_id: id }).select().single()) as Session;
    },
    async updateSession(id, patch) { return must(await sb.from("sessions").update(patch).eq("id", id).select().single()) as Session; },
    async deleteSession(id) { must(await sb.from("sessions").delete().eq("id", id)); },
    async startSession(id) { return must(await sb.rpc("start_session", { p_session: id })) as Session; },
    async endSession(id) { return must(await sb.rpc("end_session", { p_session: id })) as Session; },
    async sessionLinks(id) { return must(await sb.from("device_links").select("*").eq("session_id", id)); },
    async sessionProgress(id) {
      const s = await api.session(id); if (!s) return [];
      const kids = await api.groupChildren(s.group_id);
      if (!kids.length || !s.level_ids.length) return [];
      return must(await sb.from("progress").select("*").in("child_id", kids.map(k => k.id)).in("level_id", s.level_ids));
    },
    async joinInfo(code) { return must(await sb.rpc("join_session_info", { p_code: code })) as never; },
    async claimChild(code, childId) {
      await api.ensureDeviceSession();
      return must(await sb.rpc("claim_child", { p_code: code, p_child: childId })) as never;
    },

    async profiles() { return must(await sb.from("profiles").select("*").order("created_at", { ascending: false })) as Profile[]; },
    async setRoles(userId, animateur, admin) { must(await sb.rpc("admin_set_roles", { p_user: userId, p_animateur: animateur, p_admin: admin })); },
    async adminStats() { return must(await sb.rpc("admin_stats")) as never; }
  };
  return api;
}
