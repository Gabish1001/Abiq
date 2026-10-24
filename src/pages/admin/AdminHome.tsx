import { Link } from "react-router-dom";
import { api } from "@/lib";
import { useLoad } from "@/lib/hooks";
import { fmtDate } from "@/lib/dates";
import { AdultShell, PageTitle, StatusPill } from "@/ui/AdultShell";
import { Spinner } from "@/ui/kit";
import { AdminNav } from "./AdminNav";

export function AdminHome() {
  const q = useLoad(async () => {
    const [stats, levels] = await Promise.all([api.adminStats(), api.levels({ all: true })]);
    return { stats, levels };
  }, []);
  return (
    <AdultShell>
      <PageTitle title="Administration" sub="Suivez l'utilisation d'ABIQ et gérez les contenus du Grand Livre." />
      <AdminNav />
      {q.loading && !q.data ? <Spinner /> : q.error ? <p className="err">{q.error}</p> : q.data && (() => {
        const { stats: s, levels } = q.data;
        const toCheck = levels.filter(l => l.status === "review");
        return (<>
          <h2 className="a-h2">Utilisation</h2>
          <div className="kpis">
            <div className="kpi"><b>{s.parents}</b><span>comptes parents</span></div>
            <div className="kpi"><b>{s.animateurs}</b><span>comptes animateurs</span></div>
            <div className="kpi"><b>{s.children}</b><span>enfants en famille</span></div>
            <div className="kpi"><b>{s.group_children}</b><span>enfants en groupe</span></div>
            <div className="kpi"><b>{s.groups}</b><span>groupes</span></div>
            <div className="kpi"><b>{s.sessions}</b><span>séances</span></div>
            <div className="kpi"><b>{s.levels_started}</b><span>pages commencées</span></div>
            <div className="kpi"><b>{s.levels_completed}</b><span>pages terminées</span></div>
          </div>

          {toCheck.length > 0 && (<>
            <h2 className="a-h2">À vérifier</h2>
            <div className="info">Ces pages attendent une relecture (exactitude biblique, langage adapté aux 6-8 ans) avant publication.</div>
            <div className="lvl-list" style={{ marginTop: 10 }}>
              {toCheck.map(l => <Link key={l.id} to={`/admin/niveaux/${l.id}`} className="lvl-row" style={{ textDecoration: "none", color: "inherit" }}><span /><div><b>{l.content.title}</b><span className="small">{l.last_note || "Sans note"} · modifiée le {fmtDate(l.updated_at)}</span></div><StatusPill s={l.status} /></Link>)}
            </div>
          </>)}

          <h2 className="a-h2">Par page du Grand Livre</h2>
          <div className="tbl-wrap"><table className="tbl">
            <thead><tr><th>Page</th><th>État</th><th>Sortie</th><th className="num">Commencée</th><th className="num">Terminée</th><th className="num">Taux</th></tr></thead>
            <tbody>{levels.map(l => {
              const b = s.by_level[l.id] || { started: 0, completed: 0 };
              return <tr key={l.id}><td><Link to={`/admin/niveaux/${l.id}`}>{l.position}. {l.content.title}</Link></td><td><StatusPill s={l.status} /></td><td>{l.release_at ? fmtDate(l.release_at) : "Dès l'ouverture"}</td><td className="num">{b.started}</td><td className="num">{b.completed}</td><td className="num">{b.started ? Math.round(100 * b.completed / b.started) + " %" : "–"}</td></tr>;
            })}</tbody>
          </table></div>
          <p className="muted small">Les séances « un seul écran » ne sont pas comptées par enfant. Aucune donnée personnelle n'est affichée ici.</p>
        </>);
      })()}
    </AdultShell>
  );
}
