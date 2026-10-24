import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, errorMessage } from "@/lib";
import { fmtDate, isReleased, releaseLabel } from "@/lib/dates";
import { ls, useLoad } from "@/lib/hooks";
import type { Child, ChildSettings, Level, Progress } from "@/lib/types";
import { AdultShell, PageTitle, Switch } from "@/ui/AdultShell";
import { ArtImg, Avatar, Icon, Spinner, Stars } from "@/ui/kit";
import { STEP_WORD, fmtDuration, BADGE_INFO, type PlayStats, type PlayState, type BadgeId } from "@/game/state";
import { levelStatuses, mergePending } from "@/game/progress";
import { ChildFormModal } from "./FamilyHome";

export function ChildPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const q = useLoad(async () => {
    const [child, levels, server] = await Promise.all([api.child(id!), api.levels(), api.progressFor([id!])]);
    if (!child) throw new Error("Ce profil n'existe plus.");
    return { child, levels, progress: mergePending(server, id!) };
  }, [id]);
  const [editing, setEditing] = useState(false);

  if (q.loading && !q.data) return <AdultShell><Spinner /></AdultShell>;
  if (q.error || !q.data) return <AdultShell><p className="err">{q.error}</p></AdultShell>;
  const { child, levels, progress } = q.data;
  const statuses = levelStatuses(levels, progress);
  const done = statuses.filter(s => s.done).length;
  const stars = progress.reduce((a, p) => a + p.stars, 0);
  const badges = progress.flatMap(p => p.badges);
  const todayMin = Math.floor(ls.get<number>(`abiq-time-${child.id}-${new Date().toISOString().slice(0, 10)}`, 0) / 60);
  const review = progress.flatMap(p => {
    const st = p.stats as PlayStats; const l = levels.find(x => x.id === p.level_id);
    return (st?.quiz || []).filter(x => x.done && (x.wrong > 0 || x.hinted)).map(x => ({ level: l?.content.title || p.level_id, short: x.short, wrong: x.wrong, hinted: x.hinted }));
  });

  return (
    <AdultShell>
      <PageTitle title={child.pseudonym} sub="Suivi de la progression et réglages du profil" back={{ to: "/famille", label: "Ma famille" }}>
        <button type="button" className="a-btn gold" onClick={() => nav(`/jouer/${child.id}`)}><Icon name="play" size={18} />Faire jouer</button>
        <button type="button" className="a-btn" onClick={() => setEditing(true)}><Avatar id={child.avatar} size={24} />Modifier le profil</button>
      </PageTitle>

      <div className="kpis">
        <div className="kpi"><b>{done}/{levels.length}</b><span>pages rallumées</span></div>
        <div className="kpi"><b>{stars}</b><span>étoiles</span></div>
        <div className="kpi"><b>{badges.length}</b><span>badges</span></div>
        <div className="kpi"><b>{todayMin} min</b><span>de jeu aujourd'hui sur cet appareil</span></div>
      </div>

      <h2 className="a-h2">Les pages du Grand Livre</h2>
      <div className="lvl-list">
        {statuses.map(s => <LevelRow key={s.level.id} level={s.level} prog={s.prog} available={s.available} childId={child.id} onReset={q.reload} />)}
      </div>

      <h2 className="a-h2">À revoir ensemble</h2>
      <div className="card">
        {review.length === 0 ? <p className="muted" style={{ margin: 0 }}>Rien à signaler pour l'instant : les questions sont réussies du premier coup, sans indice.</p> : (
          <>
            <p className="muted small" style={{ marginTop: 0 }}>Questions où votre enfant s'est trompé ou a demandé l'indice. Une bonne idée de discussion en famille.</p>
            <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7 }}>
              {review.map((r, i) => <li key={i}><b>{r.level}</b> · {r.short} : {r.wrong ? `${r.wrong + 1} essais` : "réussie"}{r.hinted ? ", avec l'indice" : ""}</li>)}
            </ul>
          </>
        )}
      </div>

      <h2 className="a-h2">Badges gagnés</h2>
      <div className="card">
        {badges.length === 0 ? <p className="muted" style={{ margin: 0 }}>Les badges apparaîtront à la fin de chaque page.</p> : (
          <div className="row">{Object.entries(badges.reduce<Record<string, number>>((a, b) => { a[b] = (a[b] || 0) + 1; return a; }, {})).map(([b, n]) => (
            <span key={b} className="pill published" style={{ background: "#EEF1FB", color: "#263770" }}>{BADGE_INFO[b as BadgeId]?.title || b} × {n}</span>
          ))}</div>
        )}
      </div>

      <h2 className="a-h2">Réglages</h2>
      <Settings child={child} onSaved={c => q.setData({ ...q.data!, child: c })} />

      <h2 className="a-h2">Supprimer le profil</h2>
      <DeleteChild child={child} onDeleted={() => nav("/famille")} />

      {editing && <ChildFormModal child={child} onClose={() => setEditing(false)} onSaved={c => { setEditing(false); q.setData({ ...q.data!, child: c }); }} />}
    </AdultShell>
  );
}

function LevelRow({ level, prog, available, childId, onReset }: { level: Level; prog?: Progress; available: boolean; childId: string; onReset: () => void }) {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const c = level.content;
  const st = prog?.stats as PlayStats | undefined;
  const ps = prog?.state as PlayState | undefined;
  const status = prog?.completed_at ? `Terminée le ${fmtDate(prog.completed_at)}` : prog && ps?.at ? `En cours : ${STEP_WORD[ps.at]}` : available ? "Pas encore commencée" : !isReleased(level.release_at) && level.release_at ? `S'ouvre ${releaseLabel(level.release_at)}` : "S'ouvre après la page précédente";
  return (
    <div>
      <div className="lvl-row">
        <ArtImg art={prog ? c.card.art : c.teaser.art} image={prog ? c.card.image : c.teaser.image} alt="" />
        <div><b>{level.position}. {c.title}</b><span className="small">{status}</span></div>
        <div className="row">
          {prog?.completed_at && <Stars n={prog.stars} />}
          {prog && <button type="button" className="a-btn sm" aria-expanded={open} onClick={() => setOpen(o => !o)}>{open ? "Masquer" : "Détails"}</button>}
        </div>
      </div>
      {open && st && (
        <div className="card" style={{ marginTop: 6 }}>
          <div className="grid grid-3 small">
            <div><b>Mystère</b><br />{st.guessedAt != null ? `Deviné avec ${st.guessedAt} indice${st.guessedAt > 1 ? "s" : ""}` : `${st.clues}/3 indices vus`}{st.guessWrong ? ` · ${st.guessWrong} mauvaise${st.guessWrong > 1 ? "s" : ""} réponse${st.guessWrong > 1 ? "s" : ""}` : ""}</div>
            <div><b>Puzzle ({st.puzzlePieces} pièces)</b><br />{st.puzzleMs ? fmtDuration(st.puzzleMs) : "pas terminé"} · {st.puzzleHints} aide{st.puzzleHints > 1 ? "s" : ""} de Lumi</div>
            <div><b>Histoire</b><br />{st.storySeen}/{st.storyPages} pages lues · {st.storyHeard} écoutée{st.storyHeard > 1 ? "s" : ""}</div>
            <div><b>Quiz</b><br />{st.quizFirstTry}/{st.quizTotal} du premier coup</div>
            <div><b>Durée</b><br />{fmtDuration(st.durationMs)}</div>
            <div><b>Badges</b><br />{prog?.badges.length ? prog.badges.map(b => BADGE_INFO[b as BadgeId]?.title.replace("Badge ", "")).join(", ") : "–"}</div>
          </div>
          {st.quiz?.length > 0 && (
            <div className="tbl-wrap" style={{ marginTop: 12 }}><table className="tbl">
              <thead><tr><th>Question</th><th className="num">Essais</th><th>Indice</th></tr></thead>
              <tbody>{st.quiz.map(x => <tr key={x.id}><td>{x.short}</td><td className="num">{x.done ? x.wrong + 1 : "–"}</td><td>{x.hinted ? "oui" : "non"}</td></tr>)}</tbody>
            </table></div>
          )}
          <div className="row" style={{ marginTop: 12 }}>
            {!confirm ? <button type="button" className="a-btn sm ghost-danger" onClick={() => setConfirm(true)}><Icon name="restart" size={16} />Recommencer cette page à zéro</button>
              : <><span className="small">La progression de cette page sera effacée.</span><button type="button" className="a-btn sm danger" onClick={async () => { await api.deleteProgress(childId, level.id); onReset(); }}>Confirmer</button><button type="button" className="a-btn sm" onClick={() => setConfirm(false)}>Annuler</button></>}
          </div>
        </div>
      )}
    </div>
  );
}

function Settings({ child, onSaved }: { child: Child; onSaved: (c: Child) => void }) {
  const [s, setS] = useState<ChildSettings>({ sound: true, voice: true, puzzleN: 3, dailyMinutes: null, ...child.settings });
  const [msg, setMsg] = useState<string | null>(null);
  const save = async (patch: Partial<ChildSettings>) => {
    const next = { ...s, ...patch }; setS(next); setMsg(null);
    try { onSaved(await api.updateChild(child.id, { settings: next })); setMsg("Réglage enregistré."); }
    catch (e) { setMsg(errorMessage(e)); }
  };
  return (
    <div className="card">
      <div className="set-line"><div><b>Sons du jeu</b><div className="hint">Petits sons quand une pièce est bien placée ou qu'une réponse est trouvée.</div></div><Switch on={s.sound !== false} onChange={v => save({ sound: v })} label="Sons du jeu" /></div>
      <div className="set-line"><div><b>Lecture à voix haute</b><div className="hint">Boutons « Écouter » pour les consignes et les histoires (voix de l'appareil).</div></div><Switch on={s.voice !== false} onChange={v => save({ voice: v })} label="Lecture à voix haute" /></div>
      <div className="set-line"><div><b>Taille du puzzle</b><div className="hint">9 pièces conseillées pour les 6-8 ans. S'applique au prochain puzzle.</div></div>
        <div className="seg" role="radiogroup" aria-label="Taille du puzzle">{([2, 3, 4] as const).map(n => <button key={n} type="button" role="radio" aria-checked={(s.puzzleN || 3) === n} onClick={() => save({ puzzleN: n })}>{n * n} pièces</button>)}</div></div>
      <div className="set-line"><div><b>Temps de jeu par jour</b><div className="hint">Au-delà, Lumi propose une pause. Un adulte peut prolonger de 15 minutes.</div></div>
        <select className="input" style={{ width: "auto" }} value={s.dailyMinutes ?? ""} onChange={e => save({ dailyMinutes: e.target.value ? +e.target.value : null })} aria-label="Temps de jeu par jour">
          <option value="">Pas de limite</option>{[15, 20, 30, 45, 60].map(m => <option key={m} value={m}>{m} minutes</option>)}
        </select></div>
      {msg && <p className="small muted" role="status" style={{ margin: "8px 0 0" }}>{msg}</p>}
    </div>
  );
}

function DeleteChild({ child, onDeleted }: { child: Child; onDeleted: () => void }) {
  const [step, setStep] = useState(0);
  const [err, setErr] = useState<string | null>(null);
  return (
    <div className="card">
      <p className="muted" style={{ marginTop: 0 }}>Le profil de {child.pseudonym} et toute sa progression seront supprimés définitivement.</p>
      {step === 0 ? <button type="button" className="a-btn ghost-danger" onClick={() => setStep(1)}><Icon name="trash" size={18} />Supprimer ce profil</button> : (
        <div className="row">
          <span>Confirmer la suppression de {child.pseudonym} ?</span>
          <button type="button" className="a-btn danger" onClick={async () => { try { await api.deleteChild(child.id); onDeleted(); } catch (e) { setErr(errorMessage(e)); } }}>Oui, supprimer</button>
          <button type="button" className="a-btn" onClick={() => setStep(0)}>Annuler</button>
        </div>
      )}
      {err && <p className="err">{err}</p>}
    </div>
  );
}
