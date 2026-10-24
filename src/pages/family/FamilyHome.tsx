import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, errorMessage } from "@/lib";
import { useAuth } from "@/lib/auth";
import { ago } from "@/lib/dates";
import { useLoad } from "@/lib/hooks";
import type { Child, Level, Progress } from "@/lib/types";
import { AdultShell, Modal, PageTitle } from "@/ui/AdultShell";
import { mergePending, syncPending } from "@/game/progress";
import { AVATARS, Avatar, Icon, Lumi, Spinner, fr } from "@/ui/kit";

export function FamilyHome() {
  const { profile } = useAuth();
  const nav = useNavigate();
  const q = useLoad(async () => {
    const children = await api.myChildren();
    await syncPending();
    const [levels, server] = await Promise.all([api.levels(), api.progressFor(children.map(c => c.id))]);
    return { children, levels, progress: children.reduce((acc, c) => mergePending(acc, c.id), server) };
  }, []);
  const [adding, setAdding] = useState(false);

  return (
    <AdultShell>
      <PageTitle title={fr(`Bonjour ${profile?.display_name || ""} !`.replace("  ", " "))} sub="Créez un profil par enfant, puis laissez-le jouer. Vous suivez ici ce qu'il découvre.">
        <button type="button" className="a-btn primary" onClick={() => setAdding(true)}><Icon name="plus" size={18} />Ajouter un enfant</button>
      </PageTitle>
      {q.loading && !q.data ? <Spinner /> : q.error ? <p className="err">{q.error}</p> : q.data && (
        q.data.children.length === 0 ? (
          <div className="card empty">
            <Lumi />
            <h2 className="a-h3">Commencez par créer le profil de votre enfant</h2>
            <p>Un prénom ou un surnom suffit : aucune autre information n'est demandée.</p>
            <button type="button" className="a-btn primary lg" onClick={() => setAdding(true)}><Icon name="plus" size={18} />Créer un profil</button>
          </div>
        ) : (
          <div className="grid grid-2">
            {q.data.children.map(c => <ChildCard key={c.id} child={c} levels={q.data!.levels} progress={q.data!.progress.filter(p => p.child_id === c.id)} onPlay={() => nav(`/jouer/${c.id}`)} />)}
          </div>
        )
      )}
      <div className="card" style={{ marginTop: 20 }}>
        <h2 className="a-h3">Comment ça marche ?</h2>
        <ol className="muted" style={{ margin: 0, paddingLeft: 20, lineHeight: 1.7 }}>
          <li>Touchez « Faire jouer » : l'écran passe dans l'espace enfant.</li>
          <li>Votre enfant découvre une page du Grand Livre : mystère, puzzle, histoire, quiz.</li>
          <li>Pour revenir ici, maintenez le bouton « Espace adulte » en bas de son écran.</li>
          <li>Une nouvelle page s'ouvre chaque dimanche : c'est le rendez-vous de la semaine.</li>
        </ol>
      </div>
      {adding && <ChildFormModal onClose={() => setAdding(false)} onSaved={() => { setAdding(false); q.reload(); }} />}
    </AdultShell>
  );
}

function ChildCard({ child, levels, progress, onPlay }: { child: Child; levels: Level[]; progress: Progress[]; onPlay: () => void }) {
  const done = progress.filter(p => p.completed_at).length;
  const stars = progress.reduce((a, p) => a + p.stars, 0);
  const last = progress.map(p => p.updated_at).sort().pop();
  const inProgress = progress.find(p => !p.completed_at);
  const lvl = inProgress && levels.find(l => l.id === inProgress.level_id);
  return (
    <div className="card child-card">
      <div className="child-top">
        <Avatar id={child.avatar} size={56} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3>{child.pseudonym}</h3>
          <span className="muted small">Dernière partie : {ago(last)}</span>
        </div>
        <span className="pill published"><Icon name="star" size={14} fill />{stars}</span>
      </div>
      <div>
        <div className="row between small"><span>{done} page{done > 1 ? "s" : ""} rallumée{done > 1 ? "s" : ""} sur {levels.length}</span>{lvl && <span className="muted">En cours : {lvl.content.title}</span>}</div>
        <div className="bar" style={{ marginTop: 6 }}><i style={{ width: `${levels.length ? done / levels.length * 100 : 0}%` }} /></div>
      </div>
      <div className="row">
        <button type="button" className="a-btn gold" onClick={onPlay}><Icon name="play" size={18} />Faire jouer</button>
        <Link className="a-btn" to={`/famille/enfant/${child.id}`}><Icon name="chart" size={18} />Suivi et réglages</Link>
      </div>
    </div>
  );
}

export function ChildFormModal({ child, groupId, onClose, onSaved }: { child?: Child; groupId?: string; onClose: () => void; onSaved: (c: Child) => void }) {
  const [name, setName] = useState(child?.pseudonym || "");
  const [avatar, setAvatar] = useState(child?.avatar || "lion");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    const n = name.trim();
    if (!n) { setErr("Indiquez un prénom ou un surnom."); return; }
    if (n.length > 24) { setErr("24 caractères maximum."); return; }
    setBusy(true); setErr(null);
    try { onSaved(child ? await api.updateChild(child.id, { pseudonym: n, avatar }) : await api.createChild({ pseudonym: n, avatar, group_id: groupId })); }
    catch (e) { setErr(errorMessage(e)); } finally { setBusy(false); }
  };
  return (
    <Modal title={child ? "Modifier le profil" : groupId ? "Ajouter un enfant au groupe" : "Nouveau profil enfant"} onClose={onClose}>
      <form className="form" onSubmit={e => { e.preventDefault(); submit(); }}>
        <label className="field"><span>Prénom ou surnom</span>
          <input value={name} onChange={e => setName(e.target.value)} maxLength={24} autoFocus placeholder="Ex. Ama" />
          <small>Inutile de donner le nom de famille. Un surnom convient très bien.</small>
        </label>
        <div className="field"><span>Avatar</span>
          <div className="avatar-pick" role="radiogroup" aria-label="Avatar">
            {AVATARS.map(a => <button key={a.id} type="button" role="radio" aria-checked={avatar === a.id} aria-label={a.label} onClick={() => setAvatar(a.id)}><Avatar id={a.id} size={48} /></button>)}
          </div>
        </div>
        <div className="info small">Parcours : 6-8 ans. Les autres tranches d'âge arriveront plus tard.</div>
        {err && <p className="err">{err}</p>}
        <div className="row"><button type="submit" className="a-btn primary" disabled={busy}>{busy ? "Enregistrement…" : child ? "Enregistrer" : "Créer le profil"}</button><button type="button" className="a-btn" onClick={onClose}>Annuler</button></div>
      </form>
    </Modal>
  );
}
