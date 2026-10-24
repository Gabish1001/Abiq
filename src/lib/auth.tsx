import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api } from "./index";
import type { AuthUser, Profile } from "./types";

type AuthState = {
  user: AuthUser | null;
  profile: Profile | null;
  loading: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthState>({ user: null, profile: null, loading: true, refresh: async () => {}, signOut: async () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (u: AuthUser | null) => {
    setUser(u);
    if (u && !u.anonymous) {
      try { setProfile(await api.myProfile()); } catch { setProfile(null); }
    } else setProfile(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    let alive = true;
    api.currentUser().then(u => { if (alive) load(u); });
    const off = api.onAuth(u => { if (alive) load(u); });
    return () => { alive = false; off(); };
  }, [load]);

  const value = useMemo<AuthState>(() => ({
    user, profile, loading,
    refresh: async () => load(await api.currentUser()),
    signOut: async () => { await api.signOut(); await load(null); }
  }), [user, profile, loading, load]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
