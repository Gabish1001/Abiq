import type {
  AdminStats, AuthUser, Child, DeviceLink, Group, JoinInfo, Level, LevelVersion, MediaFile, Profile, Progress, ProgressWrite, Session, World
} from "./types";

/** Toutes les opérations de données de l'application.
 *  Deux implémentations : Supabase (production) et démo (stockée dans le navigateur). */
export interface Api {
  readonly demo: boolean;

  currentUser(): Promise<AuthUser | null>;
  onAuth(cb: (u: AuthUser | null) => void): () => void;
  signUp(i: { email: string; password: string; displayName: string; isAnimateur: boolean }): Promise<{ needsConfirm: boolean }>;
  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
  sendReset(email: string): Promise<void>;
  setPassword(password: string): Promise<void>;
  ensureDeviceSession(): Promise<void>;

  myProfile(): Promise<Profile | null>;
  updateProfile(p: Partial<Pick<Profile, "display_name" | "is_animateur">>): Promise<Profile>;
  deleteAccount(): Promise<void>;

  worlds(): Promise<World[]>;
  levels(opts?: { all?: boolean }): Promise<Level[]>;
  level(id: string): Promise<Level | null>;
  saveLevel(l: Partial<Level> & { id: string }, note: string): Promise<Level>;
  levelVersions(id: string): Promise<LevelVersion[]>;
  uploadMedia(file: File): Promise<string>;
  listMedia(): Promise<MediaFile[]>;
  deleteMedia(name: string): Promise<void>;

  myChildren(): Promise<Child[]>;
  child(id: string): Promise<Child | null>;
  createChild(c: { pseudonym: string; avatar: string; group_id?: string }): Promise<Child>;
  updateChild(id: string, patch: Partial<Pick<Child, "pseudonym" | "avatar" | "settings">>): Promise<Child>;
  deleteChild(id: string): Promise<void>;

  progressFor(childIds: string[]): Promise<Progress[]>;
  saveProgress(p: ProgressWrite): Promise<void>;
  deleteProgress(childId: string, levelId: string): Promise<void>;

  myGroups(): Promise<Group[]>;
  createGroup(name: string): Promise<Group>;
  updateGroup(id: string, patch: Partial<Pick<Group, "name">>): Promise<Group>;
  deleteGroup(id: string): Promise<void>;
  groupChildren(groupId: string): Promise<Child[]>;

  sessions(groupId?: string): Promise<Session[]>;
  session(id: string): Promise<Session | null>;
  createSession(s: Pick<Session, "group_id" | "title" | "goal" | "level_ids" | "mode">): Promise<Session>;
  updateSession(id: string, patch: Partial<Pick<Session, "title" | "goal" | "level_ids" | "mode" | "screen_results">>): Promise<Session>;
  deleteSession(id: string): Promise<void>;
  startSession(id: string): Promise<Session>;
  endSession(id: string): Promise<Session>;
  sessionLinks(id: string): Promise<DeviceLink[]>;
  sessionProgress(id: string): Promise<Progress[]>;
  joinInfo(code: string): Promise<JoinInfo | null>;
  claimChild(code: string, childId: string): Promise<{ session_id: string; level_ids: string[]; child: Child }>;

  profiles(): Promise<Profile[]>;
  setRoles(userId: string, animateur: boolean, admin: boolean): Promise<void>;
  adminStats(): Promise<AdminStats>;
}

/** Message d'erreur lisible pour l'utilisateur. */
export function errorMessage(e: unknown): string {
  const m = (e as { message?: string })?.message || String(e || "");
  if (/Invalid login credentials/i.test(m)) return "E-mail ou mot de passe incorrect.";
  if (/Email not confirmed/i.test(m)) return "Confirmez d'abord votre adresse e-mail grâce au lien reçu.";
  if (/User already registered/i.test(m)) return "Un compte existe déjà avec cette adresse. Connectez-vous.";
  if (/Password should be at least/i.test(m)) return "Le mot de passe doit contenir au moins 8 caractères.";
  if (/Anonymous sign-ins are disabled/i.test(m)) return "La connexion des appareils n'est pas activée. L'administrateur doit activer « Anonymous sign-ins » dans Supabase.";
  if (/Failed to fetch|NetworkError|network/i.test(m)) return "Pas de connexion internet. Vérifiez le réseau et réessayez.";
  if (/row-level security|permission denied/i.test(m)) return "Cette action n'est pas autorisée avec ce compte. Reconnectez-vous et réessayez ; si ça continue, prévenez l'organisateur.";
  if (/rate limit/i.test(m)) return "Trop d'essais en peu de temps. Attendez une minute et réessayez.";
  return m || "Une erreur est survenue. Réessayez.";
}
