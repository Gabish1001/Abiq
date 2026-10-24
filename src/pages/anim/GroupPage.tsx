import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, errorMessage } from "@/lib";
import { fmtDate } from "@/lib/dates";
import { useLoad } from "@/lib/hooks";
import type { Child } from "@/lib/types";
import { AdultShell, PageTitle, StatusPill } from "@/ui/AdultShell";
import { Avatar, Icon, Spinner } from "@/ui/kit";
import { ChildFormModal } from "@/pages/family/FamilyHome";
import type { PlayState } from "@/game/state";

export function GroupPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const q = useLoad(async () => {
    const groups = await api.myGroups();
    const group = groups.find(g => g.id === id);
    if (!group) throw new Error("Groupe introuvable.");
    const [kids, levels, sessions] = await Promise.all([api.groupChildren(group.id), api.levels(), api.sessions(group.id)]);
    const progress = await api.progressFor(kids.map(k => k.id));
    return { group, kids, levels, sessions, progress };
  }, [id]);
  const [edit, setEdit] = useState<Child | "new" | null>(null);
  const [rename, setRename] = useState<string | null>(null);
  const [confirmDel, setConfirmDel] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (q.loading && !q.data) return <AdultShell><Spinner /></AdultShell>;
  if (q.error || !q.data) return <AdultShell><p className="err">{q.error}</p></AdultShell>;
  const { group, kids, levels, sessions, progress } = q.data;

  const newSession = async () => {
    try {
      const used = new Set(sessions.filter(s => s.status === "done").flatMap(s => s.level_ids));
      const nextLevel = levels.find(l => !used.has(l.id)) || levels[0];
      const s = await api.createSession({ group_id: group.id, title: nextLevel ? nextLevel.content.title : "Séance", goal: nextLevel ? `Découvrir l'histoire de ${nextLevel.content.title} et retenir : ${nextLevel.content.value.toLowerCase()}.` : "", level_ids: nextLevel ? [nextLevel.id] : [], mode: "screen" });
      nav(`/animateur/seance/${s.id}`);
    } catch (e) { setErr(errorMessage(e)); }
  };

  return (
    <AdultShell>
      <PageTitle title={group.name} sub={`${kids.length} enfant${kids.length > 1 ? "s" : ""} · parcours 6-8 ans`} back={{ to: "/animateur", label: "Espace animateur" }}>
        <button type="button" className="a-btn primary" onClick={newSession}><Icon name="calendar" size={18} />Préparer une séance</button>
        <button type="button" className="a-btn" onClick={() => setRename(group.name)}><Icon name="edit" size={18} />Renommer</button>
      </PageTitle>
      {err && <p className="err">{err}</p>}
      {rename !== null && (
        <form className="card row" onSubmit={async e => { e.preventDefault(); try { await api.updateGroup(group.id, { name: rename.trim() }); setRename(null); q.reload(); } catch (er) { setErr(errorMessage(er)); } }}>
          <input className="input" style={{ flex: 1, minWidth: 200 }} value={rename} onChange={e => setRename(e.target.value)} maxLength={60} aria-label="Nom du groupe" autoFocus />
          <button type="submit" className="a-btn primary">Enregistrer</button><button type="button" className="a-btn" onClick={() => setRename(null)}>Annuler</button>
        </form>
      )}

      <h2 className="a-h2">Enfants du groupe</h2>
      <div className="card stack-a">
        <p className="muted small" style={{ margin: 0 }}>Un prénom ou un surnom suffit. Pendant une séance « chacun son appareil », l'enfant choisit son prénom dans cette liste.</p>
        <div className="kids-live">
          {kids.map(k => (
            <div key={k.id} className="kid-live">
              <Avatar id={k.avatar} size={40} />
              <div style={{ flex: 1, minWidth: 0 }}><b>{k.pseudonym}</b><span className="small">{progress.filter(p => p.child_id === k.id && p.completed_at).length} page(s) terminée(s)</span></div>
              <button type="button" className="icon-a" aria-label={`Modifier ${k.pseudonym}`} onClick={() => setEdit(k)}><Icon name="edit" size={18} /></button>
            </div>
          ))}
        </div>
        <div className="row"><button type="button" className="a-btn" onClick={() => setEdit("new")}><Icon name="plus" size={18} />Ajouter un enfant</button></div>
      </div>

      <h2 className="a-h2">Progression du groupe</h2>
      {kids.length === 0 ? <p className="muted">Ajoutez des enfants pour voir leur progression.</p> : (
        <div className="tbl-wrap"><table className="tbl">
          <thead><tr><th>Enfant</th>{levels.map(l => <th key={l.id} title={l.content.title}>{l.position}. {l.content.title.replace(/^Le /, "")}</th>)}</tr></thead>
          <tbody>{kids.map(k => (
            <tr key={k.id}><td><b>{k.pseudonym}</b></td>{levels.map(l => {
              const p = progress.find(x => x.child_id === k.id && x.level_id === l.id);
              return <td key={l.id}>{p?.completed_at ? <span className="pill published">Terminé</span> : p ? <span className="pill review">{(p.state as PlayState).at ? "En cours" : "Commencé"}</span> : <span className="muted">–</span>}</td>;
            })}</tr>
          ))}</tbody>
        </table></div>
      )}
      <p className="muted small">Les séances en mode « un seul écran » sont comptées pour le groupe dans le bilan de chaque séance, pas par enfant.</p>

      <h2 className="a-h2">Séances du groupe</h2>
      {sessions.length === 0 ? <p className="muted">Aucune séance pour l'instant.</p> : (
        <div className="tbl-wrap"><table className="tbl">
          <thead><tr><th>Séance</th><th>Mode</th><th>État</th><th>Date</th></tr></thead>
          <tbody>{sessions.map(s => <tr key={s.id} className="click" onClick={() => nav(`/animateur/seance/${s.id}`)}><td>{s.title || "Séance"}</td><td>{s.mode === "screen" ? "Un seul écran" : "Chacun son appareil"}</td><td><StatusPill s={s.status} /></td><td>{fmtDate(s.started_at || s.created_at)}</td></tr>)}</tbody>
        </table></div>
      )}

      <h2 className="a-h2">Supprimer le groupe</h2>
      <div className="card">
        <p className="muted" style={{ marginTop: 0 }}>Les enfants du groupe, leur progression et les séances seront supprimés.</p>
        {!confirmDel ? <button type="button" className="a-btn ghost-danger" onClick={() => setConfirmDel(true)}><Icon name="trash" size={18} />Supprimer ce groupe</button>
          : <div className="row"><button type="button" className="a-btn danger" onClick={async () => { await api.deleteGroup(group.id); nav("/animateur"); }}>Oui, supprimer</button><button type="button" className="a-btn" onClick={() => setConfirmDel(false)}>Annuler</button></div>}
      </div>

      {edit && <GroupChildModal child={edit === "new" ? undefined : edit} groupId={group.id} onClose={() => setEdit(null)} onDone={() => { setEdit(null); q.reload(); }} />}
    </AdultShell>
  );
}

function GroupChildModal({ child, groupId, onClose, onDone }: { child?: Child; groupId: string; onClose: () => void; onDone: () => void }) {
  const [confirm, setConfirm] = useState(false);
  return (
    <>
      <ChildFormModal child={child} groupId={groupId} onClose={onClose} onSaved={onDone} />
      {child && (
        <div style={{ position: "fixed", left: 0, right: 0, bottom: 16, zIndex: 61, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
          <div className="card row" style={{ pointerEvents: "auto", boxShadow: "0 10px 30px rgba(0,0,0,.2)" }}>
            {!confirm ? <button type="button" className="a-btn ghost-danger sm" onClick={() => setConfirm(true)}><Icon name="trash" size={16} />Retirer {child.pseudonym} du groupe</button>
              : <><span className="small">Sa progression sera supprimée.</span><button type="button" className="a-btn danger sm" onClick={async () => { await api.deleteChild(child.id); onDone(); }}>Confirmer</button><button type="button" className="a-btn sm" onClick={() => setConfirm(false)}>Annuler</button></>}
          </div>
        </div>
      )}
    </>
  );
}
