import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, errorMessage } from "@/lib";
import { useLoad } from "@/lib/hooks";
import { fmtDate, nextReleaseDate } from "@/lib/dates";
import { AdultShell, Modal, PageTitle, StatusPill } from "@/ui/AdultShell";
import { ArtImg, Icon, Spinner } from "@/ui/kit";
import { AdminNav } from "./AdminNav";
import { blankContent } from "./blank";

const slug = (t: string) => t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);

export function AdminLevels() {
  const nav = useNavigate();
  const q = useLoad(async () => { const [worlds, levels] = await Promise.all([api.worlds(), api.levels({ all: true })]); return { worlds, levels }; }, []);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [world, setWorld] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const create = async () => {
    if (!q.data || !title.trim()) return;
    const base = slug(title) || "page";
    let id = base, n = 2;
    while (q.data.levels.some(l => l.id === id)) id = `${base}-${n++}`;
    const pos = Math.max(0, ...q.data.levels.map(l => l.position)) + 1;
    try {
      await api.saveLevel({ id, world_id: world || q.data.worlds[q.data.worlds.length - 1]?.id, position: pos, age_band: "6-8", status: "draft", release_at: nextReleaseDate(1).toISOString(), content: blankContent(title.trim()) }, "Création");
      nav(`/admin/niveaux/${id}`);
    } catch (e) { setErr(errorMessage(e)); }
  };

  return (
    <AdultShell>
      <PageTitle title="Contenus" sub="Les pages du Grand Livre, de la rédaction à la publication.">
        <button type="button" className="a-btn primary" onClick={() => setCreating(true)}><Icon name="plus" size={18} />Nouvelle page</button>
      </PageTitle>
      <AdminNav />
      <div className="info" style={{ margin: "14px 0" }}>Circuit de validation : <b>Brouillon</b> → <b>En vérification</b> (relecture biblique et pédagogique) → <b>Publié</b>. Une page publiée n'apparaît aux enfants qu'à sa date de sortie, et seulement après la page précédente.</div>
      {q.loading && !q.data ? <Spinner /> : q.error ? <p className="err">{q.error}</p> : q.data && q.data.worlds.map(w => {
        const ls = q.data!.levels.filter(l => l.world_id === w.id);
        return (
          <section key={w.id}>
            <h2 className="a-h2">{w.title} <span className="muted small">· {w.subtitle}</span></h2>
            {ls.length === 0 ? <p className="muted">Aucune page dans ce monde.</p> : (
              <div className="tbl-wrap"><table className="tbl">
                <thead><tr><th style={{ width: 60 }}></th><th>Page</th><th>État</th><th>Sortie</th><th>Dernière modification</th></tr></thead>
                <tbody>{ls.map(l => (
                  <tr key={l.id} className="click" onClick={() => nav(`/admin/niveaux/${l.id}`)}>
                    <td><ArtImg art={l.content.card.art} image={l.content.card.image} alt="" style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover", display: "block" }} /></td>
                    <td><Link to={`/admin/niveaux/${l.id}`}><b>{l.position}. {l.content.title}</b></Link><div className="muted small">{l.content.source} · {l.content.value}</div></td>
                    <td><StatusPill s={l.status} /></td>
                    <td>{l.release_at ? fmtDate(l.release_at) : "Dès l'ouverture"}</td>
                    <td><span className="small">{fmtDate(l.updated_at, true)}</span>{l.last_note && <div className="muted small">{l.last_note}</div>}</td>
                  </tr>
                ))}</tbody>
              </table></div>
            )}
          </section>
        );
      })}
      {creating && q.data && (
        <Modal title="Nouvelle page" onClose={() => setCreating(false)}>
          <form className="form" onSubmit={e => { e.preventDefault(); create(); }}>
            <label className="field"><span>Personnage ou titre</span><input autoFocus value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex. Daniel" maxLength={40} /></label>
            <label className="field"><span>Monde</span><select value={world || q.data.worlds[q.data.worlds.length - 1]?.id} onChange={e => setWorld(e.target.value)}>{q.data.worlds.map(w => <option key={w.id} value={w.id}>{w.title}</option>)}</select></label>
            <p className="muted small" style={{ margin: 0 }}>La page est créée en brouillon, avec une trame à compléter. Elle restera invisible pour les enfants tant qu'elle n'est pas publiée.</p>
            {err && <p className="err">{err}</p>}
            <div className="row"><button type="submit" className="a-btn primary" disabled={!title.trim()}>Créer et rédiger</button><button type="button" className="a-btn" onClick={() => setCreating(false)}>Annuler</button></div>
          </form>
        </Modal>
      )}
    </AdultShell>
  );
}
