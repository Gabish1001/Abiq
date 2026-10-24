import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "@/lib";
import { useLoad } from "@/lib/hooks";
import type { Session } from "@/lib/types";
import { Spinner } from "@/ui/kit";
import { LevelPlayer, type SaveStatus } from "@/game/LevelPlayer";
import { computeStats, type PlayState } from "@/game/state";
import { KidMessage, KidShell } from "@/pages/kid/KidShell";

/** Écran de projection : le niveau est joué par tout le groupe, l'animateur touche les réponses choisies. */
export function ScreenPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const q = useLoad(async () => {
    const s = await api.session(id!);
    if (!s) throw new Error("Séance introuvable.");
    const levels = (await api.levels()).filter(l => s.level_ids.includes(l.id));
    return { s, levels };
  }, [id]);
  const [cur, setCur] = useState<string | null>(null);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const sess = useRef<Session | null>(null);
  const timer = useRef<number | undefined>(undefined);

  if (q.loading && !q.data) return <div className="kid"><Spinner /></div>;
  if (q.error || !q.data) return <KidShell bar={<span />}><KidMessage title="Séance introuvable" text={q.error || ""} /></KidShell>;
  sess.current = sess.current || q.data.s;
  const levels = q.data.levels;
  const level = levels.find(l => l.id === cur) || (levels.length === 1 ? levels[0] : null);
  const back = () => nav(`/animateur/seance/${id}`);

  const persist = (levelId: string, st: PlayState, done: boolean) => {
    const s = sess.current!; const l = levels.find(x => x.id === levelId)!;
    const prev = s.screen_results[levelId] || {};
    s.screen_results = { ...s.screen_results, [levelId]: { state: st, stats: computeStats(st, l.content), completed_at: done ? new Date().toISOString() : prev.completed_at || null } };
    clearTimeout(timer.current);
    timer.current = window.setTimeout(async () => {
      setStatus("saving");
      try { await api.updateSession(s.id, { screen_results: s.screen_results }); setStatus("saved"); } catch { setStatus("offline"); }
    }, done ? 0 : 1500);
  };

  if (!level) return (
    <KidShell bar={<><span /><div className="bar-title">Séance de groupe</div><span /></>}>
      <div className="stack screen-in">
        <div className="cgrid">
          {levels.map(l => <button key={l.id} type="button" className="ccard next" onClick={() => setCur(l.id)}><span className="cc-q">{l.position}</span><span className="cc-name">Page {l.position}</span><span className="cc-sub">{sess.current!.screen_results[l.id]?.completed_at ? "Terminée" : "À jouer"}</span></button>)}
        </div>
        <button type="button" className="btn btn-ghost" onClick={back}>Revenir à la séance</button>
      </div>
    </KidShell>
  );
  const saved = sess.current.screen_results[level.id];
  return (
    <div className="kid">
      <LevelPlayer key={level.id} variant="screen" levelId={level.id} content={level.content}
        initial={saved?.completed_at ? null : saved?.state || null} settings={{ sound: true, voice: true, puzzleN: 3 }} saveStatus={status} next={null}
        onState={st => persist(level.id, st, false)} onComplete={st => persist(level.id, st, true)}
        onExit={() => { if (levels.length > 1) setCur(null); else back(); }} />
    </div>
  );
}
