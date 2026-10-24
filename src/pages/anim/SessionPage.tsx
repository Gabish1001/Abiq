import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, errorMessage } from "@/lib";
import { fmtDate } from "@/lib/dates";
import { useInterval, useLoad } from "@/lib/hooks";
import type { Child, DeviceLink, Level, Progress, Session } from "@/lib/types";
import { AdultShell, PageTitle, StatusPill } from "@/ui/AdultShell";
import { ArtImg, Avatar, Icon, Spinner } from "@/ui/kit";
import { STEP_WORD, fmtDuration, type PlayState, type PlayStats } from "@/game/state";

export function SessionPage() {
  const { id } = useParams();
  const q = useLoad(async () => {
    const s = await api.session(id!);
    if (!s) throw new Error("Séance introuvable.");
    const [groups, levels, kids] = await Promise.all([api.myGroups(), api.levels(), api.groupChildren(s.group_id)]);
    return { s, group: groups.find(g => g.id === s.group_id)!, levels, kids };
  }, [id]);
  if (q.loading && !q.data) return <AdultShell><Spinner /></AdultShell>;
  if (q.error || !q.data) return <AdultShell><p className="err">{q.error}</p></AdultShell>;
  const { s, group, levels, kids } = q.data;
  const setS = (ns: Session) => q.setData({ ...q.data!, s: ns });

  return (
    <AdultShell>
      <PageTitle title={s.title || "Séance"} sub={`${group?.name || ""} · ${s.mode === "screen" ? "un seul écran" : "chacun son appareil"}`} back={{ to: `/animateur/groupe/${s.group_id}`, label: group?.name || "Groupe" }}>
        <StatusPill s={s.status} />
      </PageTitle>
      {s.status === "prepared" && <Prepare s={s} levels={levels} kids={kids} onChange={setS} />}
      {s.status === "live" && s.mode === "devices" && <LiveDevices s={s} levels={levels} kids={kids} onChange={setS} />}
      {s.status === "live" && s.mode === "screen" && <LiveScreen s={s} levels={levels} onChange={setS} />}
      {s.status === "done" && <Results s={s} levels={levels} kids={kids} onChange={setS} />}
    </AdultShell>
  );
}

function Prepare({ s, levels, kids, onChange }: { s: Session; levels: Level[]; kids: Child[]; onChange: (s: Session) => void }) {
  const nav = useNavigate();
  const [title, setTitle] = useState(s.title);
  const [goal, setGoal] = useState(s.goal);
  const [sel, setSel] = useState<string[]>(s.level_ids);
  const [mode, setMode] = useState(s.mode);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const save = async () => api.updateSession(s.id, { title: title.trim(), goal: goal.trim(), level_ids: levels.filter(l => sel.includes(l.id)).map(l => l.id), mode });
  const run = async (f: () => Promise<void>) => { setBusy(true); setErr(null); try { await f(); } catch (e) { setErr(errorMessage(e)); } finally { setBusy(false); } };

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="card form">
        <h2 className="a-h3">1. Le contenu de la séance</h2>
        <label className="field"><span>Titre</span><input value={title} onChange={e => setTitle(e.target.value)} maxLength={80} placeholder="Ex. Noé et l'arche" /><small>Pour vous seulement : les enfants ne le voient pas, le personnage reste un mystère.</small></label>
        <label className="field"><span>Objectif pédagogique</span><textarea value={goal} onChange={e => setGoal(e.target.value)} maxLength={400} placeholder="Ex. Comprendre que Noé a fait confiance à Dieu et lui a obéi." /><small>Visible seulement par vous, pour préparer et faire le bilan.</small></label>
        <div className="field"><span>Pages du Grand Livre à faire</span>
          <div className="lvl-list">
            {levels.map(l => (
              <label key={l.id} className="lvl-row" style={{ cursor: "pointer" }}>
                <ArtImg art={l.content.card.art} image={l.content.card.image} alt="" />
                <div><b>{l.position}. {l.content.title}</b><span className="small">{l.content.source} · {l.content.value}</span></div>
                <input type="checkbox" checked={sel.includes(l.id)} onChange={e => setSel(v => e.target.checked ? [...v, l.id] : v.filter(x => x !== l.id))} aria-label={`Inclure ${l.content.title}`} />
              </label>
            ))}
          </div>
          <small>Conseil : une page par séance de 30 à 45 minutes.</small>
        </div>
      </div>
      <div className="card form">
        <h2 className="a-h3">2. Comment les enfants jouent</h2>
        <div className="grid grid-2">
          <label className={"card"} style={{ cursor: "pointer", borderColor: mode === "screen" ? "var(--a-brand)" : undefined, boxShadow: mode === "screen" ? "inset 0 0 0 2px var(--a-brand)" : undefined }}>
            <div className="row"><input type="radio" name="mode" checked={mode === "screen"} onChange={() => setMode("screen")} /><Icon name="screen" /><b>Un seul écran</b></div>
            <p className="muted small">Vous projetez ou montrez votre téléphone. Les enfants répondent à voix haute ou à main levée, vous touchez la réponse choisie par le groupe.</p>
          </label>
          <label className="card" style={{ cursor: "pointer", borderColor: mode === "devices" ? "var(--a-brand)" : undefined, boxShadow: mode === "devices" ? "inset 0 0 0 2px var(--a-brand)" : undefined }}>
            <div className="row"><input type="radio" name="mode" checked={mode === "devices"} onChange={() => setMode("devices")} /><Icon name="phone" /><b>Chacun son appareil</b></div>
            <p className="muted small">Chaque enfant joue sur un téléphone ou une tablette avec un code de séance. Vous suivez la progression de chacun en direct.</p>
          </label>
        </div>
        {mode === "devices" && kids.length === 0 && <p className="err">Ajoutez d'abord les prénoms des enfants dans le groupe : ils les choisiront sur leur appareil.</p>}
      </div>
      {err && <p className="err">{err}</p>}
      <div className="row">
        <button type="button" className="a-btn primary lg" disabled={busy || !sel.length || (mode === "devices" && !kids.length)} onClick={() => run(async () => { await save(); onChange(await api.startSession(s.id)); })}><Icon name="play" size={18} />Lancer la séance</button>
        <button type="button" className="a-btn lg" disabled={busy} onClick={() => run(async () => { onChange(await save()); })}>Enregistrer pour plus tard</button>
        <button type="button" className="a-btn ghost-danger" disabled={busy} onClick={() => run(async () => { await api.deleteSession(s.id); nav(`/animateur/groupe/${s.group_id}`); })}><Icon name="trash" size={18} />Supprimer</button>
      </div>
    </div>
  );
}

function kidLine(p: Progress | undefined) {
  if (!p) return "Pas encore commencé";
  if (p.completed_at) return "Terminé";
  const st = p.state as PlayState;
  return st?.at ? `En cours : ${STEP_WORD[st.at]}` : "Commencé";
}

function LiveDevices({ s, levels, kids, onChange }: { s: Session; levels: Level[]; kids: Child[]; onChange: (s: Session) => void }) {
  const [links, setLinks] = useState<DeviceLink[]>([]);
  const [prog, setProg] = useState<Progress[]>([]);
  const [copied, setCopied] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const refresh = async () => { try { const [l, p] = await Promise.all([api.sessionLinks(s.id), api.sessionProgress(s.id)]); setLinks(l); setProg(p); } catch { /* nouvel essai au prochain tour */ } };
  useEffect(() => { refresh(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useInterval(refresh, 4000);
  const url = `${location.origin}/rejoindre`;
  const sl = levels.filter(l => s.level_ids.includes(l.id));
  const joined = new Set(links.map(l => l.child_id));
  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="card" style={{ textAlign: "center" }}>
        <p className="muted" style={{ margin: 0 }}>Sur chaque appareil, ouvrez <b>{url.replace(/^https?:\/\//, "")}</b> et tapez le code :</p>
        <div className="code-big" style={{ margin: "12px 0" }}>{s.join_code}</div>
        <div className="row" style={{ justifyContent: "center" }}>
          <button type="button" className="a-btn sm" onClick={async () => { try { await navigator.clipboard.writeText(`${url}/${s.join_code}`); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* copie impossible */ } }}><Icon name="copy" size={16} />{copied ? "Lien copié" : "Copier le lien direct"}</button>
        </div>
      </div>
      <div className="card">
        <div className="row between"><h2 className="a-h3" style={{ margin: 0 }}>Enfants connectés : {joined.size}/{kids.length}</h2><span className="muted small">Mise à jour automatique</span></div>
        <div className="kids-live" style={{ marginTop: 12 }}>
          {kids.map(k => {
            const ps = sl.map(l => prog.find(p => p.child_id === k.id && p.level_id === l.id));
            return (
              <div key={k.id} className={"kid-live" + (joined.has(k.id) ? " on" : "")}>
                <Avatar id={k.avatar} size={40} />
                <div style={{ minWidth: 0 }}><b>{k.pseudonym}</b>
                  {joined.has(k.id) ? sl.map((l, i) => <span key={l.id} className="small" style={{ display: "block" }}>{sl.length > 1 ? `${l.content.title} : ` : ""}{kidLine(ps[i])}</span>) : <span className="small">Pas encore connecté</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="row">
        {!confirm ? <button type="button" className="a-btn primary lg" onClick={() => setConfirm(true)}>Terminer la séance</button>
          : <><span>Les appareils seront déconnectés.</span><button type="button" className="a-btn danger" onClick={async () => onChange(await api.endSession(s.id))}>Terminer maintenant</button><button type="button" className="a-btn" onClick={() => setConfirm(false)}>Continuer la séance</button></>}
      </div>
    </div>
  );
}

function LiveScreen({ s, levels, onChange }: { s: Session; levels: Level[]; onChange: (s: Session) => void }) {
  const sl = levels.filter(l => s.level_ids.includes(l.id));
  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="card stack-a" style={{ textAlign: "center", justifyItems: "center" }}>
        <Icon name="screen" size={40} />
        <p style={{ margin: 0, maxWidth: "52ch" }}>Branchez ce téléphone ou cet ordinateur au vidéoprojecteur, ou tournez l'écran vers les enfants. Ils répondent à voix haute ; vous touchez la réponse choisie par le groupe.</p>
        <Link className="a-btn primary lg" to={`/animateur/seance/${s.id}/ecran`}><Icon name="fullscreen" size={18} />Ouvrir l'écran de projection</Link>
      </div>
      <div className="card">
        <h2 className="a-h3">Avancement du groupe</h2>
        {sl.map(l => { const r = s.screen_results[l.id]; const st = r?.state; return <p key={l.id} style={{ margin: "6px 0" }}><b>{l.content.title}</b> : {r?.completed_at ? "terminé" : st?.at ? `en cours (${STEP_WORD[st.at]})` : "pas commencé"}</p>; })}
      </div>
      <div className="row"><button type="button" className="a-btn" onClick={async () => onChange(await api.endSession(s.id))}>Terminer la séance et voir le bilan</button></div>
    </div>
  );
}

function Results({ s, levels, kids, onChange }: { s: Session; levels: Level[]; kids: Child[]; onChange: (s: Session) => void }) {
  const nav = useNavigate();
  const [prog, setProg] = useState<Progress[] | null>(null);
  useEffect(() => { if (s.mode === "devices") api.sessionProgress(s.id).then(setProg).catch(() => setProg([])); }, [s.id, s.mode]);
  const sl = levels.filter(l => s.level_ids.includes(l.id));
  const nextSession = async () => {
    const lastPos = Math.max(...sl.map(l => l.position), 0);
    const nl = levels.find(l => l.position > lastPos) || sl[0];
    const ns = await api.createSession({ group_id: s.group_id, title: nl?.content.title || "Séance", goal: nl ? `Découvrir l'histoire de ${nl.content.title} et retenir : ${nl.content.value.toLowerCase()}.` : "", level_ids: nl ? [nl.id] : [], mode: s.mode });
    nav(`/animateur/seance/${ns.id}`);
  };
  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="card">
        <p style={{ margin: 0 }}>Séance du {fmtDate(s.started_at, true)}{s.ended_at ? (fmtDate(s.ended_at) === fmtDate(s.started_at) ? `, terminée à ${fmtDate(s.ended_at, true).split(", ")[1]}` : ` au ${fmtDate(s.ended_at, true)}`) : ""}.</p>
        {s.goal && <p className="muted" style={{ marginBottom: 0 }}><b>Objectif :</b> {s.goal}</p>}
      </div>
      {sl.map(l => {
        if (s.mode === "screen") {
          const st = s.screen_results[l.id]?.stats as PlayStats | undefined;
          return (
            <div key={l.id} className="card">
              <h2 className="a-h3">{l.content.title}</h2>
              {!st ? <p className="muted">Cette page n'a pas été jouée.</p> : (<>
                <div className="kpis">
                  <div className="kpi"><b>{st.guessedAt != null ? st.guessedAt : "–"}</b><span>indices avant de deviner</span></div>
                  <div className="kpi"><b>{fmtDuration(st.puzzleMs)}</b><span>pour le puzzle</span></div>
                  <div className="kpi"><b>{st.quizFirstTry}/{st.quizTotal}</b><span>questions du premier coup</span></div>
                </div>
                <div className="tbl-wrap" style={{ marginTop: 12 }}><table className="tbl"><thead><tr><th>Question</th><th className="num">Essais du groupe</th><th>Indice</th></tr></thead>
                  <tbody>{st.quiz.map(x => <tr key={x.id}><td>{x.short}</td><td className="num">{x.done ? x.wrong + 1 : "–"}</td><td>{x.hinted ? "oui" : "non"}</td></tr>)}</tbody></table></div>
              </>)}
            </div>
          );
        }
        const lp = (prog || []).filter(p => p.level_id === l.id);
        const done = lp.filter(p => p.completed_at);
        const qs = l.content.quiz.map((qq, i) => {
          const rows = done.map(p => (p.stats as PlayStats)?.quiz?.[i]).filter(Boolean);
          return { short: qq.short, first: rows.filter(r => r!.wrong === 0 && !r!.hinted).length, n: rows.length };
        });
        return (
          <div key={l.id} className="card">
            <h2 className="a-h3">{l.content.title}</h2>
            {prog === null ? <Spinner /> : (<>
              <div className="kpis">
                <div className="kpi"><b>{done.length}/{kids.length}</b><span>enfants ont terminé</span></div>
                <div className="kpi"><b>{lp.length - done.length}</b><span>en cours</span></div>
              </div>
              {done.length > 0 && <div className="tbl-wrap" style={{ marginTop: 12 }}><table className="tbl"><thead><tr><th>Question</th><th className="num">Réussie du premier coup</th></tr></thead>
                <tbody>{qs.map(x => <tr key={x.short}><td>{x.short}</td><td className="num">{x.first}/{x.n}</td></tr>)}</tbody></table></div>}
              <div className="tbl-wrap" style={{ marginTop: 12 }}><table className="tbl"><thead><tr><th>Enfant</th><th>État</th><th className="num">Quiz</th><th className="num">Aides</th></tr></thead>
                <tbody>{kids.map(k => { const p = lp.find(x => x.child_id === k.id); const st = p?.stats as PlayStats | undefined; return <tr key={k.id}><td>{k.pseudonym}</td><td>{kidLine(p)}</td><td className="num">{st?.quizTotal ? `${st.quizFirstTry}/${st.quizTotal}` : "–"}</td><td className="num">{st ? st.puzzleHints + st.quiz.filter(x => x.hinted).length : "–"}</td></tr>; })}</tbody></table></div>
            </>)}
          </div>
        );
      })}
      <div className="row">
        <button type="button" className="a-btn primary" onClick={nextSession}><Icon name="calendar" size={18} />Préparer la séance suivante</button>
        <button type="button" className="a-btn" onClick={async () => onChange(await api.startSession(s.id))}><Icon name="restart" size={18} />Relancer cette séance</button>
      </div>
    </div>
  );
}
