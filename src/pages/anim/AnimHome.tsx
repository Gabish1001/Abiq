import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, errorMessage } from "@/lib";
import { fmtDate } from "@/lib/dates";
import { useLoad } from "@/lib/hooks";
import { AdultShell, PageTitle, StatusPill } from "@/ui/AdultShell";
import { Icon, Lumi, Spinner } from "@/ui/kit";

export function AnimHome() {
  const nav = useNavigate();
  const q = useLoad(async () => {
    const [groups, sessions, levels] = await Promise.all([api.myGroups(), api.sessions(), api.levels()]);
    const kids = await Promise.all(groups.map(g => api.groupChildren(g.id)));
    return { groups, sessions, levels, kids: Object.fromEntries(groups.map((g, i) => [g.id, kids[i].length])) };
  }, []);
  const [name, setName] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const create = async () => {
    if (!name.trim()) return;
    try { const g = await api.createGroup(name.trim()); nav(`/animateur/groupe/${g.id}`); } catch (e) { setErr(errorMessage(e)); }
  };

  return (
    <AdultShell>
      <PageTitle title="Espace animateur" sub="Créez vos groupes d'enfants, préparez une séance et suivez les résultats du groupe." />
      {q.loading && !q.data ? <Spinner /> : q.error ? <p className="err">{q.error}</p> : q.data && (<>
        {q.data.sessions.filter(s => s.status === "live").map(s => (
          <Link key={s.id} to={`/animateur/seance/${s.id}`} className="info row between" style={{ textDecoration: "none", marginBottom: 14 }}>
            <span><StatusPill s="live" /> <b>{s.title || "Séance"}</b> est en cours{s.join_code ? ` · code ${s.join_code}` : ""}</span><span className="a-btn sm primary">Ouvrir</span>
          </Link>
        ))}
        <h2 className="a-h2" style={{ marginTop: 0 }}>Mes groupes</h2>
        <div className="grid grid-3">
          {q.data.groups.map(g => (
            <div key={g.id} className="card stack-a">
              <div><h3 className="a-h3" style={{ marginBottom: 2 }}>{g.name}</h3><span className="muted small">{q.data!.kids[g.id]} enfant{q.data!.kids[g.id] > 1 ? "s" : ""} · {q.data!.sessions.filter(s => s.group_id === g.id).length} séance(s)</span></div>
              <div className="row"><Link className="a-btn primary sm" to={`/animateur/groupe/${g.id}`}>Ouvrir le groupe</Link></div>
            </div>
          ))}
          <form className="card stack-a" onSubmit={e => { e.preventDefault(); create(); }}>
            <label className="field"><span>Nouveau groupe</span><input value={name} onChange={e => setName(e.target.value)} placeholder="Ex. École du dimanche 6-8 ans" maxLength={60} /></label>
            <button type="submit" className="a-btn" disabled={!name.trim()}><Icon name="plus" size={18} />Créer le groupe</button>
            {err && <p className="err">{err}</p>}
          </form>
        </div>
        {q.data.groups.length === 0 && <div className="empty"><Lumi /><p>Créez votre premier groupe, ajoutez les prénoms des enfants, puis préparez une séance.</p></div>}

        <h2 className="a-h2">Séances</h2>
        {q.data.sessions.length === 0 ? <p className="muted">Aucune séance pour l'instant. Ouvrez un groupe pour en préparer une.</p> : (
          <div className="tbl-wrap"><table className="tbl">
            <thead><tr><th>Séance</th><th>Groupe</th><th>Pages</th><th>Mode</th><th>État</th><th>Date</th></tr></thead>
            <tbody>{q.data.sessions.map(s => (
              <tr key={s.id} className="click" onClick={() => nav(`/animateur/seance/${s.id}`)}>
                <td><Link to={`/animateur/seance/${s.id}`}>{s.title || "Séance sans titre"}</Link></td>
                <td>{q.data!.groups.find(g => g.id === s.group_id)?.name}</td>
                <td>{s.level_ids.map(id => q.data!.levels.find(l => l.id === id)?.content.title || id).join(", ") || "–"}</td>
                <td>{s.mode === "screen" ? "Un seul écran" : "Chacun son appareil"}</td>
                <td><StatusPill s={s.status} /></td>
                <td>{fmtDate(s.started_at || s.created_at)}</td>
              </tr>
            ))}</tbody>
          </table></div>
        )}
      </>)}
    </AdultShell>
  );
}
