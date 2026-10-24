import type { Api } from "./api";
import type { AuthUser, Child, DeviceLink, Group, Level, LevelVersion, MediaFile, Profile, Progress, Session, World } from "./types";
import { LEVELS, WORLDS } from "@/content";
import { nextReleaseDate } from "./dates";

/* Mode démonstration : tout est stocké dans le navigateur.
   Sert à découvrir l'application sans serveur, et aux tests. */

type DB = {
  v: 1; signedIn: boolean; device: boolean;
  profile: Profile; worlds: World[]; levels: Level[]; versions: LevelVersion[];
  children: Child[]; groups: Group[]; sessions: Session[]; progress: Progress[]; links: DeviceLink[]; media: MediaFile[];
};
const KEY = "abiq-demo-db-v1";
const ME = "demo-user", DEVICE = "demo-device";
const now = () => new Date().toISOString();
const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36));
const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));

function seed(): DB {
  const t = now();
  const levels: Level[] = LEVELS.map(l => ({
    id: l.id, world_id: l.worldId, position: l.position, age_band: "6-8", status: "published",
    release_at: l.position <= 3 ? null : nextReleaseDate(l.position - 3).toISOString(),
    content: clone(l.content), last_note: "Contenu de départ", updated_at: t, published_at: t
  }));
  const groupId = uuid();
  return {
    v: 1, signedIn: false, device: false,
    profile: { id: ME, email: "demo@abiq.app", display_name: "Gab", is_animateur: true, is_admin: true, created_at: t },
    worlds: clone(WORLDS), levels,
    versions: levels.map((l, i) => ({ id: i + 1, level_id: l.id, status: l.status, content: l.content, note: "Contenu de départ", changed_by: ME, changed_at: t })),
    children: [
      { id: uuid(), parent_id: ME, group_id: null, pseudonym: "Ama", avatar: "lion", age_band: "6-8", settings: { sound: true, voice: true, puzzleN: 3, dailyMinutes: 30 }, created_at: t },
      ...["Junior", "Grâce", "Emmanuel", "Divine"].map((p, i) => ({ id: uuid(), parent_id: null, group_id: groupId, pseudonym: p, avatar: ["girafe", "colombe", "mouton", "chameau"][i], age_band: "6-8", settings: {}, created_at: t }))
    ],
    groups: [{ id: groupId, animateur_id: ME, name: "École du dimanche 6-8 ans", age_band: "6-8", created_at: t }],
    sessions: [], progress: [], links: [], media: []
  };
}

export function createDemoApi(): Api {
  let db: DB;
  try { const raw = localStorage.getItem(KEY); db = raw ? JSON.parse(raw) : seed(); if (db.v !== 1) db = seed(); } catch { db = seed(); }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch { /* stockage plein ou bloqué */ } };
  // Démo ouverte dans plusieurs onglets (animateur + « appareil enfant ») : on suit les changements des autres onglets.
  try { addEventListener("storage", e => { if (e.key === KEY && e.newValue) { try { db = JSON.parse(e.newValue); } catch { /* ignore */ } } }); } catch { /* ignore */ }
  try { if (localStorage.getItem("abiq-demo-auto")) { localStorage.removeItem("abiq-demo-auto"); db.signedIn = true; db.device = false; save(); } } catch { /* ignore */ }
  const listeners = new Set<(u: AuthUser | null) => void>();
  const user = (): AuthUser | null => db.signedIn ? { id: ME, email: db.profile.email, anonymous: false } : db.device ? { id: DEVICE, email: null, anonymous: true } : null;
  const emit = () => { const u = user(); listeners.forEach(l => l(u)); };
  const wait = <T,>(v: T) => new Promise<T>(r => setTimeout(() => r(clone(v)), 60));
  const need = () => { if (!db.signedIn) throw new Error("Connexion requise"); };
  const sess = (id: string) => { const s = db.sessions.find(x => x.id === id); if (!s) throw new Error("Séance introuvable"); return s; };

  const api: Api = {
    demo: true,
    async currentUser() { return user(); },
    onAuth(cb) { listeners.add(cb); return () => listeners.delete(cb); },
    async signUp({ displayName, isAnimateur }) { db.signedIn = true; db.profile.display_name = displayName || db.profile.display_name; db.profile.is_animateur = isAnimateur || db.profile.is_animateur; save(); emit(); return { needsConfirm: false }; },
    async signIn() { db.signedIn = true; save(); emit(); },
    async signOut() { db.signedIn = false; db.device = false; save(); emit(); },
    async sendReset() { /* rien à envoyer en démo */ },
    async setPassword() { /* rien à faire en démo */ },
    async ensureDeviceSession() { if (!db.signedIn) { db.device = true; save(); emit(); } },

    async myProfile() { return db.signedIn ? wait(db.profile) : null; },
    async updateProfile(p) { need(); Object.assign(db.profile, p); save(); return wait(db.profile); },
    async deleteAccount() { localStorage.removeItem(KEY); db = seed(); save(); emit(); },

    async worlds() { return wait([...db.worlds].sort((a, b) => a.position - b.position)); },
    async levels(opts) { return wait(db.levels.filter(l => opts?.all ? db.signedIn : l.status === "published").sort((a, b) => a.position - b.position)); },
    async level(id) { return wait(db.levels.find(l => l.id === id) || null); },
    async saveLevel(l, note) {
      need();
      let row = db.levels.find(x => x.id === l.id);
      const before = row ? clone(row) : null;
      if (!row) { row = { id: l.id, world_id: "m1", position: db.levels.length + 1, age_band: "6-8", status: "draft", release_at: null, content: l.content!, last_note: note, updated_at: now(), published_at: null }; db.levels.push(row); }
      Object.assign(row, l, { last_note: note, updated_at: now() });
      if (row.status === "published" && before?.status !== "published") row.published_at = now();
      if (!before || JSON.stringify(before.content) !== JSON.stringify(row.content) || before.status !== row.status)
        db.versions.unshift({ id: db.versions.length + 1, level_id: row.id, status: row.status, content: clone(row.content), note, changed_by: ME, changed_at: now() });
      save(); return wait(row);
    },
    async levelVersions(id) { return wait(db.versions.filter(v => v.level_id === id)); },
    async uploadMedia(file) {
      const url = await new Promise<string>((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.onerror = () => rej(r.error); r.readAsDataURL(file); });
      if (url.length > 1_500_000) throw new Error("En mode démo, les images doivent faire moins de 1 Mo.");
      db.media.unshift({ name: file.name, url, size: file.size, created_at: now() }); save(); return url;
    },
    async listMedia() { return wait(db.media); },
    async deleteMedia(name) { db.media = db.media.filter(m => m.name !== name); save(); },

    async myChildren() { need(); return wait(db.children.filter(c => c.parent_id === ME)); },
    async child(id) { return wait(db.children.find(c => c.id === id) || null); },
    async createChild(c) {
      need();
      const row: Child = { id: uuid(), parent_id: c.group_id ? null : ME, group_id: c.group_id || null, pseudonym: c.pseudonym, avatar: c.avatar, age_band: "6-8", settings: c.group_id ? {} : { sound: true, voice: true, puzzleN: 3, dailyMinutes: null }, created_at: now() };
      db.children.push(row); save(); return wait(row);
    },
    async updateChild(id, patch) { const c = db.children.find(x => x.id === id); if (!c) throw new Error("Enfant introuvable"); Object.assign(c, patch); save(); return wait(c); },
    async deleteChild(id) { db.children = db.children.filter(c => c.id !== id); db.progress = db.progress.filter(p => p.child_id !== id); save(); },

    async progressFor(ids) { return wait(db.progress.filter(p => ids.includes(p.child_id))); },
    async saveProgress(p) {
      let row = db.progress.find(x => x.child_id === p.child_id && x.level_id === p.level_id);
      if (!row) { row = { child_id: p.child_id, level_id: p.level_id, session_id: null, state: {}, stats: {}, stars: 0, badges: [], started_at: now(), completed_at: null, updated_at: now() }; db.progress.push(row); }
      Object.assign(row, p, { updated_at: now() }); save();
    },
    async deleteProgress(childId, levelId) { db.progress = db.progress.filter(p => !(p.child_id === childId && p.level_id === levelId)); save(); },

    async myGroups() { need(); return wait(db.groups); },
    async createGroup(name) { need(); const g: Group = { id: uuid(), animateur_id: ME, name, age_band: "6-8", created_at: now() }; db.groups.push(g); save(); return wait(g); },
    async updateGroup(id, patch) { const g = db.groups.find(x => x.id === id)!; Object.assign(g, patch); save(); return wait(g); },
    async deleteGroup(id) {
      const kids = db.children.filter(c => c.group_id === id).map(c => c.id);
      db.groups = db.groups.filter(g => g.id !== id); db.children = db.children.filter(c => c.group_id !== id);
      db.sessions = db.sessions.filter(s => s.group_id !== id); db.progress = db.progress.filter(p => !kids.includes(p.child_id)); save();
    },
    async groupChildren(groupId) { return wait(db.children.filter(c => c.group_id === groupId).sort((a, b) => a.pseudonym.localeCompare(b.pseudonym))); },

    async sessions(groupId) { need(); return wait(db.sessions.filter(s => !groupId || s.group_id === groupId).sort((a, b) => b.created_at.localeCompare(a.created_at))); },
    async session(id) { return wait(db.sessions.find(s => s.id === id) || null); },
    async createSession(s) { need(); const row: Session = { id: uuid(), animateur_id: ME, status: "prepared", join_code: null, screen_results: {}, started_at: null, ended_at: null, created_at: now(), ...s }; db.sessions.push(row); save(); return wait(row); },
    async updateSession(id, patch) { const s = sess(id); Object.assign(s, patch); save(); return wait(s); },
    async deleteSession(id) { db.sessions = db.sessions.filter(s => s.id !== id); save(); },
    async startSession(id) {
      const s = sess(id); const A = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
      if (!s.join_code) s.join_code = Array.from({ length: 6 }, () => A[Math.floor(Math.random() * A.length)]).join("");
      s.status = "live"; s.started_at = s.started_at || now(); s.ended_at = null; save(); return wait(s);
    },
    async endSession(id) { const s = sess(id); s.status = "done"; s.ended_at = now(); s.join_code = null; db.links = db.links.filter(l => l.session_id !== id); save(); return wait(s); },
    async sessionLinks(id) { return wait(db.links.filter(l => l.session_id === id)); },
    async sessionProgress(id) {
      const s = sess(id); const kids = db.children.filter(c => c.group_id === s.group_id).map(c => c.id);
      return wait(db.progress.filter(p => kids.includes(p.child_id) && s.level_ids.includes(p.level_id)));
    },
    async joinInfo(code) {
      const s = db.sessions.find(x => x.join_code === code.trim().toUpperCase() && x.status === "live" && x.mode === "devices");
      if (!s) return null;
      const g = db.groups.find(x => x.id === s.group_id)!;
      return wait({ session_id: s.id, group_name: g.name, title: s.title, level_ids: s.level_ids, kids: db.children.filter(c => c.group_id === s.group_id).map(c => ({ id: c.id, pseudonym: c.pseudonym, avatar: c.avatar })) });
    },
    async claimChild(code, childId) {
      const info = await api.joinInfo(code); if (!info) throw new Error("Code de séance invalide");
      const child = db.children.find(c => c.id === childId && info.kids.some(k => k.id === childId)); if (!child) throw new Error("Enfant introuvable dans ce groupe");
      await api.ensureDeviceSession();
      db.links = db.links.filter(l => !(l.child_id === childId && l.session_id === info.session_id));
      db.links.push({ user_id: user()?.id || DEVICE, child_id: childId, session_id: info.session_id, expires_at: new Date(Date.now() + 6 * 3600e3).toISOString() }); save();
      return wait({ session_id: info.session_id, level_ids: info.level_ids, child });
    },

    async profiles() { need(); return wait([db.profile]); },
    async setRoles(_id, animateur, admin) { db.profile.is_animateur = animateur; db.profile.is_admin = admin; save(); },
    async adminStats() {
      const by: Record<string, { started: number; completed: number }> = {};
      db.progress.forEach(p => { by[p.level_id] = by[p.level_id] || { started: 0, completed: 0 }; by[p.level_id].started++; if (p.completed_at) by[p.level_id].completed++; });
      return wait({ parents: 1, animateurs: db.profile.is_animateur ? 1 : 0, children: db.children.filter(c => c.parent_id).length, group_children: db.children.filter(c => c.group_id).length, groups: db.groups.length, sessions: db.sessions.length, levels_started: db.progress.length, levels_completed: db.progress.filter(p => p.completed_at).length, by_level: by });
    }
  };
  return api;
}

export function resetDemo() { try { localStorage.removeItem(KEY); } catch { /* ignore */ } }
