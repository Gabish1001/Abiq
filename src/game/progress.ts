import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib";
import { isReleased, releaseLabel } from "@/lib/dates";
import { ls } from "@/lib/hooks";
import type { Level, Progress, ProgressWrite } from "@/lib/types";
import type { SaveStatus } from "./LevelPlayer";
import type { NextInfo } from "./steps/Reward";
import { badgesFor, computeStats, type PlayState } from "./state";

export type LevelStatus = {
  level: Level; prog?: Progress; done: boolean; started: boolean;
  available: boolean; reason?: "prev" | "date"; when?: string;
};

/** Règle de déblocage : niveau précédent terminé ET date d'ouverture passée. */
export function levelStatuses(levels: Level[], progress: Progress[], opts: { ignoreDates?: boolean } = {}): LevelStatus[] {
  const sorted = [...levels].sort((a, b) => a.position - b.position);
  let prevDone = true;
  return sorted.map(level => {
    const prog = progress.find(p => p.level_id === level.id);
    const done = !!prog?.completed_at;
    const released = opts.ignoreDates || isReleased(level.release_at);
    const available = prevDone && released;
    const st: LevelStatus = {
      level, prog, done, started: !!prog && !done && !!(prog.state as PlayState)?.at,
      available: available || done, reason: !prevDone ? "prev" : !released ? "date" : undefined,
      when: level.release_at && !released ? releaseLabel(level.release_at) : undefined
    };
    prevDone = done;
    return st;
  });
}

export function nextInfoFor(statuses: LevelStatus[], levelId: string, currentDone = true): NextInfo {
  const i = statuses.findIndex(s => s.level.id === levelId);
  const n = statuses[i + 1]; if (!n) return null;
  const released = isReleased(n.level.release_at);
  const t = n.level.content.teaser;
  return { text: t.text, art: t.art, image: t.image, available: currentDone && released, when: n.level.release_at && !released ? releaseLabel(n.level.release_at) : undefined };
}

/* ---------- Sauvegarde de la progression (avec reprise hors connexion) ---------- */
/** Ajoute à la progression lue sur le serveur ce qui attend encore d'être envoyé depuis cet appareil. */
export function mergePending(progress: Progress[], childId: string): Progress[] {
  const pend = Object.values(ls.get<Record<string, ProgressWrite>>("abiq-pending", {})).filter(p => p.child_id === childId);
  if (!pend.length) return progress;
  const out = progress.map(p => ({ ...p }));
  for (const w of pend) {
    const cur = out.find(p => p.level_id === w.level_id && p.child_id === w.child_id);
    if (cur) Object.assign(cur, Object.fromEntries(Object.entries(w).filter(([, v]) => v !== undefined)));
    else out.push({ session_id: null, state: {}, stats: {}, stars: 0, badges: [], started_at: new Date().toISOString(), completed_at: null, updated_at: new Date().toISOString(), ...w } as Progress);
  }
  return out;
}
const PENDING = "abiq-pending";
type Pending = Record<string, ProgressWrite>;
const pkey = (p: ProgressWrite) => `${p.child_id}:${p.level_id}`;
let flushing = false;
async function flushPending(): Promise<boolean> {
  if (flushing) return false;
  flushing = true;
  try {
    const all = ls.get<Pending>(PENDING, {});
    for (const [k, p] of Object.entries(all)) {
      await api.saveProgress(p);
      const now = ls.get<Pending>(PENDING, {}); if (now[k] === p || JSON.stringify(now[k]) === JSON.stringify(p)) { delete now[k]; ls.set(PENDING, now); }
    }
    return true;
  } catch { return false; } finally { flushing = false; }
}
if (typeof window !== "undefined") { window.addEventListener("online", () => { flushPending(); }); setTimeout(flushPending, 1500); }
/** Envoie ce qui attend sur l'appareil (avant d'afficher un suivi, par exemple). */
export const syncPending = () => flushPending().catch(() => false);

export function useProgressSaver(childId: string | undefined, levelId: string | undefined, sessionId: string | null = null) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const timer = useRef<number | undefined>(undefined);
  const latest = useRef<ProgressWrite | null>(null);

  const send = useCallback(async () => {
    const p = latest.current; if (!p) return;
    const all = ls.get<Pending>(PENDING, {}); all[pkey(p)] = p; ls.set(PENDING, all);
    setStatus("saving");
    const ok = await flushPending();
    if (ok && latest.current === p) latest.current = null;
    setStatus(ok ? "saved" : "offline");
  }, []);

  useEffect(() => {
    const retry = setInterval(() => { if (Object.keys(ls.get<Pending>(PENDING, {})).length) flushPending().then(ok => ok && setStatus("saved")); }, 15000);
    return () => { clearInterval(retry); clearTimeout(timer.current); if (latest.current) send(); };
  }, [send]);

  const saveState = useCallback((s: PlayState, content: Level["content"]) => {
    if (!childId || !levelId) return;
    const w: ProgressWrite = { child_id: childId, level_id: levelId, session_id: sessionId, state: s, stats: computeStats(s, content) };
    latest.current = w;
    // Gardé tout de suite sur l'appareil : rien n'est perdu si l'onglet se ferme avant l'envoi.
    const all = ls.get<Pending>(PENDING, {}); const prev = all[pkey(w)];
    if (!prev?.completed_at) { all[pkey(w)] = w; ls.set(PENDING, all); }
    clearTimeout(timer.current); timer.current = window.setTimeout(send, 1200);
  }, [childId, levelId, sessionId, send]);

  const complete = useCallback((s: PlayState, content: Level["content"]) => {
    if (!childId || !levelId) return;
    latest.current = { child_id: childId, level_id: levelId, session_id: sessionId, state: s, stats: computeStats(s, content), stars: 3, badges: badgesFor(s), completed_at: new Date().toISOString() };
    clearTimeout(timer.current); send();
  }, [childId, levelId, sessionId, send]);

  return { status, saveState, complete };
}

/* ---------- Temps de jeu indicatif fixé par le parent ---------- */
export function usePlayTime(childId: string | undefined, limitMin: number | null | undefined, active = true) {
  const key = `abiq-time-${childId}-${new Date().toISOString().slice(0, 10)}`;
  const [used, setUsed] = useState(() => ls.get<number>(key, 0));
  const [extended, setExtended] = useState(0);
  useEffect(() => {
    if (!childId || !active) return;
    const t = setInterval(() => { if (document.hidden) return; const v = ls.get<number>(key, 0) + 15; ls.set(key, v); setUsed(v); }, 15000);
    return () => clearInterval(t);
  }, [childId, key, active]);
  const over = !!limitMin && used >= (limitMin + extended) * 60;
  return { usedMin: Math.floor(used / 60), over, extend: () => setExtended(e => e + 15) };
}
