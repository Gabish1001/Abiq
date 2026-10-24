import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api, errorMessage } from "@/lib";
import { useAuth } from "@/lib/auth";
import { AdultShell, PageTitle, Switch } from "@/ui/AdultShell";
import { Icon } from "@/ui/kit";

export function Account() {
  const { profile, refresh, signOut } = useAuth();
  const [params] = useSearchParams();
  const nav = useNavigate();
  const [name, setName] = useState(profile?.display_name || "");
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const [pw, setPw] = useState("");
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const [del, setDel] = useState("");
  const [delErr, setDelErr] = useState<string | null>(null);
  if (!profile) return null;

  const saveName = async () => {
    try { await api.updateProfile({ display_name: name.trim() }); await refresh(); setMsg({ ok: true, t: "Nom enregistré." }); } catch (e) { setMsg({ ok: false, t: errorMessage(e) }); }
  };
  const setAnim = async (v: boolean) => {
    try { await api.updateProfile({ is_animateur: v }); await refresh(); setMsg({ ok: true, t: v ? "Espace animateur activé." : "Espace animateur désactivé." }); if (v && params.get("animateur")) nav("/animateur"); }
    catch (e) { setMsg({ ok: false, t: errorMessage(e) }); }
  };
  const exportData = async () => {
    const children = await api.myChildren();
    const progress = await api.progressFor(children.map(c => c.id));
    const groups = profile.is_animateur ? await api.myGroups() : [];
    const blob = new Blob([JSON.stringify({ exporte_le: new Date().toISOString(), compte: profile, enfants: children, progression: progress, groupes: groups }, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "abiq-mes-donnees.json"; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };

  return (
    <AdultShell narrow>
      <PageTitle title="Mon compte" sub={profile.email || undefined} />
      {params.get("animateur") && !profile.is_animateur && <div className="info" style={{ marginBottom: 14 }}>Pour organiser des séances avec un groupe d'enfants, activez l'espace animateur ci-dessous.</div>}
      <div className="card form">
        <label className="field"><span>Votre nom</span><input value={name} onChange={e => setName(e.target.value)} maxLength={60} /></label>
        <div className="row"><button type="button" className="a-btn primary" onClick={saveName}>Enregistrer</button></div>
        <div className="set-line"><div><b>Je suis animateur</b><div className="hint">École du dimanche, club biblique, catéchèse : créez des groupes et lancez des séances.</div></div><Switch on={profile.is_animateur} onChange={setAnim} label="Espace animateur" /></div>
        {msg && <p className={msg.ok ? "ok-msg" : "err"} role="status">{msg.t}</p>}
      </div>

      <h2 className="a-h2">Mot de passe</h2>
      <form className="card form" onSubmit={async e => { e.preventDefault(); if (pw.length < 8) { setPwMsg({ ok: false, t: "8 caractères minimum." }); return; } try { await api.setPassword(pw); setPw(""); setPwMsg({ ok: true, t: "Mot de passe modifié." }); } catch (er) { setPwMsg({ ok: false, t: errorMessage(er) }); } }}>
        <label className="field"><span>Nouveau mot de passe</span><input type="password" autoComplete="new-password" value={pw} onChange={e => setPw(e.target.value)} minLength={8} /></label>
        <div className="row"><button type="submit" className="a-btn">Changer le mot de passe</button></div>
        {pwMsg && <p className={pwMsg.ok ? "ok-msg" : "err"} role="status">{pwMsg.t}</p>}
      </form>

      <h2 className="a-h2">Mes données</h2>
      <div className="card stack-a">
        <p className="muted" style={{ margin: 0 }}>ABIQ ne conserve que le nécessaire : votre e-mail, les prénoms ou surnoms des enfants, leurs avatars et leur progression. <Link to="/confidentialite">Lire la politique de confidentialité</Link>.</p>
        <div className="row"><button type="button" className="a-btn" onClick={exportData}><Icon name="download" size={18} />Télécharger mes données</button>
          <button type="button" className="a-btn" onClick={async () => { await signOut(); nav("/"); }}><Icon name="logout" size={18} />Se déconnecter</button></div>
      </div>

      <h2 className="a-h2">Supprimer mon compte</h2>
      <div className="card form">
        <p className="muted" style={{ margin: 0 }}>Votre compte, les profils de vos enfants, leur progression, vos groupes et vos séances seront supprimés définitivement.</p>
        <label className="field"><span>Pour confirmer, tapez SUPPRIMER</span><input value={del} onChange={e => setDel(e.target.value)} autoComplete="off" /></label>
        <div className="row"><button type="button" className="a-btn danger" disabled={del.trim().toUpperCase() !== "SUPPRIMER"} onClick={async () => { try { await api.deleteAccount(); nav("/"); location.reload(); } catch (e) { setDelErr(errorMessage(e)); } }}>Supprimer définitivement</button></div>
        {delErr && <p className="err">{delErr}</p>}
      </div>
    </AdultShell>
  );
}
