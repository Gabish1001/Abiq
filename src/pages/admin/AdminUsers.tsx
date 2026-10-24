import { useState } from "react";
import { api, errorMessage } from "@/lib";
import { useAuth } from "@/lib/auth";
import { useLoad } from "@/lib/hooks";
import { fmtDate } from "@/lib/dates";
import { AdultShell, PageTitle, Switch } from "@/ui/AdultShell";
import { Spinner } from "@/ui/kit";
import { AdminNav } from "./AdminNav";

export function AdminUsers() {
  const { profile: me } = useAuth();
  const q = useLoad(() => api.profiles(), []);
  const [find, setFind] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const setRole = async (id: string, anim: boolean, admin: boolean) => {
    setErr(null);
    try { await api.setRoles(id, anim, admin); q.setData(q.data!.map(p => p.id === id ? { ...p, is_animateur: anim, is_admin: admin } : p)); }
    catch (e) { setErr(errorMessage(e)); }
  };
  const list = (q.data || []).filter(p => !find.trim() || `${p.display_name} ${p.email}`.toLowerCase().includes(find.trim().toLowerCase()));
  return (
    <AdultShell>
      <PageTitle title="Utilisateurs" sub="Comptes adultes uniquement. Les enfants n'ont pas de compte : ils sont rattachés à un parent ou à un groupe." />
      <AdminNav />
      <div className="row" style={{ margin: "14px 0" }}>
        <input className="input" style={{ maxWidth: 360 }} value={find} onChange={e => setFind(e.target.value)} placeholder="Rechercher un nom ou un e-mail" aria-label="Rechercher" />
        {q.data && <span className="muted small">{list.length} compte(s)</span>}
      </div>
      {err && <p className="err">{err}</p>}
      {q.loading && !q.data ? <Spinner /> : q.error ? <p className="err">{q.error}</p> : (
        <div className="tbl-wrap"><table className="tbl">
          <thead><tr><th>Nom</th><th>E-mail</th><th>Inscrit le</th><th>Animateur</th><th>Administrateur</th></tr></thead>
          <tbody>{list.map(p => (
            <tr key={p.id}>
              <td><b>{p.display_name || "–"}</b>{p.id === me?.id && <span className="muted small"> (vous)</span>}</td>
              <td>{p.email}</td>
              <td>{fmtDate(p.created_at)}</td>
              <td><Switch on={p.is_animateur} onChange={v => setRole(p.id, v, p.is_admin)} label={`Animateur : ${p.display_name}`} /></td>
              <td><Switch on={p.is_admin} disabled={p.id === me?.id} onChange={v => setRole(p.id, p.is_animateur, v)} label={`Administrateur : ${p.display_name}`} /></td>
            </tr>
          ))}</tbody>
        </table></div>
      )}
      <p className="muted small">Un administrateur peut modifier et publier tous les contenus. Vous ne pouvez pas retirer vos propres droits d'administrateur.</p>
    </AdultShell>
  );
}
