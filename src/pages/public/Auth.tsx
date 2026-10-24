import { useEffect, useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { api, errorMessage } from "@/lib";
import { useAuth } from "@/lib/auth";
import { Spinner } from "@/ui/kit";
import { PubShell } from "./PubShell";

const safeNext = (s: string | null) => s && s.startsWith("/") && !s.startsWith("//") ? s : "/famille";

function useBusy() {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const run = async (f: () => Promise<void>) => { setBusy(true); setErr(null); try { await f(); } catch (e) { setErr(errorMessage(e)); } finally { setBusy(false); } };
  return { busy, err, run, setErr };
}

function Pw({ value, onChange, autoComplete, label = "Mot de passe" }: { value: string; onChange: (v: string) => void; autoComplete: string; label?: string }) {
  const [show, setShow] = useState(false);
  return (
    <label className="field"><span>{label}</span>
      <div style={{ position: "relative" }}>
        <input type={show ? "text" : "password"} value={value} onChange={e => onChange(e.target.value)} autoComplete={autoComplete} required minLength={autoComplete === "new-password" ? 8 : undefined} style={{ paddingRight: 92 }} />
        <button type="button" className="a-btn sm" style={{ position: "absolute", right: 4, top: 4, minHeight: 36 }} onClick={() => setShow(s => !s)} aria-pressed={show}>{show ? "Masquer" : "Afficher"}</button>
      </div>
      {autoComplete === "new-password" && <small>8 caractères minimum.</small>}
    </label>
  );
}

export function Login() {
  const { user, profile, loading } = useAuth();
  const [params] = useSearchParams();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const b = useBusy();
  const next = safeNext(params.get("suite"));
  if (!loading && user && !user.anonymous && profile) return <Navigate to={next} replace />;
  const submit = (e: FormEvent) => { e.preventDefault(); b.run(async () => { await api.signIn(email.trim(), pw); nav(next, { replace: true }); }); };
  return (
    <PubShell>
      <form className="auth-box form" onSubmit={submit}>
        <div><h1>Se connecter</h1><p className="muted" style={{ margin: 0 }}>Espace parents et animateurs.</p></div>
        <label className="field"><span>Adresse e-mail</span><input type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required /></label>
        <Pw value={pw} onChange={setPw} autoComplete="current-password" />
        {b.err && <p className="err" role="alert">{b.err}</p>}
        <button type="submit" className="a-btn primary lg block" disabled={b.busy}>{b.busy ? "Connexion…" : "Se connecter"}</button>
        <div className="row between small"><Link to="/mot-de-passe-oublie">Mot de passe oublié ?</Link><Link to="/inscription">Créer un compte</Link></div>
        <p className="muted small" style={{ margin: 0 }}>Un enfant avec un code de séance ? <Link to="/rejoindre">Rejoindre la séance</Link></p>
      </form>
    </PubShell>
  );
}

export function Signup() {
  const { user, profile, loading } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [anim, setAnim] = useState(false);
  const [ok, setOk] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const b = useBusy();
  if (!loading && user && !user.anonymous && profile && !sent) return <Navigate to="/famille" replace />;
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (pw.length < 8) { b.setErr("Le mot de passe doit contenir au moins 8 caractères."); return; }
    b.run(async () => {
      const r = await api.signUp({ email: email.trim(), password: pw, displayName: name.trim(), isAnimateur: anim });
      if (r.needsConfirm) setSent(email.trim()); else nav(anim ? "/animateur" : "/famille", { replace: true });
    });
  };
  if (sent) return (
    <PubShell>
      <div className="auth-box stack-a">
        <h1>Vérifiez vos e-mails</h1>
        <p>Nous avons envoyé un lien de confirmation à <b>{sent}</b>. Ouvrez-le pour activer votre compte, puis revenez vous connecter.</p>
        <p className="muted small">Rien reçu après quelques minutes ? Regardez dans les courriers indésirables (spam).</p>
        <Link className="a-btn primary block" to="/connexion">Aller à la connexion</Link>
      </div>
    </PubShell>
  );
  return (
    <PubShell>
      <form className="auth-box form" onSubmit={submit}>
        <div><h1>Créer un compte</h1><p className="muted" style={{ margin: 0 }}>Gratuit. Réservé aux adultes : parents, animateurs, responsables.</p></div>
        <label className="field"><span>Votre prénom ou nom</span><input value={name} onChange={e => setName(e.target.value)} autoComplete="name" required maxLength={60} /></label>
        <label className="field"><span>Adresse e-mail</span><input type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required /></label>
        <Pw value={pw} onChange={setPw} autoComplete="new-password" />
        <label className="check"><input type="checkbox" checked={anim} onChange={e => setAnim(e.target.checked)} /><span><b>J'anime un groupe d'enfants</b> (école du dimanche, club biblique…). Vous pourrez aussi l'activer plus tard.</span></label>
        <label className="check"><input type="checkbox" checked={ok} onChange={e => setOk(e.target.checked)} required /><span>Je suis majeur(e) et j'accepte les <Link to="/conditions" target="_blank">conditions d'utilisation</Link> et la <Link to="/confidentialite" target="_blank">politique de confidentialité</Link>.</span></label>
        {b.err && <p className="err" role="alert">{b.err}</p>}
        <button type="submit" className="a-btn primary lg block" disabled={b.busy || !ok}>{b.busy ? "Création…" : "Créer mon compte"}</button>
        <p className="small" style={{ margin: 0 }}>Déjà inscrit ? <Link to="/connexion">Se connecter</Link></p>
      </form>
    </PubShell>
  );
}

export function Forgot() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const b = useBusy();
  return (
    <PubShell>
      <form className="auth-box form" onSubmit={e => { e.preventDefault(); b.run(async () => { await api.sendReset(email.trim()); setDone(true); }); }}>
        <div><h1>Mot de passe oublié</h1><p className="muted" style={{ margin: 0 }}>Recevez un lien pour en choisir un nouveau.</p></div>
        {done ? <p className="ok-msg" role="status">Si un compte existe pour <b>{email}</b>, un e-mail vient de partir. Pensez à regarder dans les spams.</p> : (<>
          <label className="field"><span>Adresse e-mail</span><input type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required /></label>
          {b.err && <p className="err" role="alert">{b.err}</p>}
          <button type="submit" className="a-btn primary lg block" disabled={b.busy}>Envoyer le lien</button>
        </>)}
        <Link className="small" to="/connexion">Retour à la connexion</Link>
      </form>
    </PubShell>
  );
}

export function NewPassword() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [pw, setPw] = useState("");
  const [waited, setWaited] = useState(false);
  const [done, setDone] = useState(false);
  const b = useBusy();
  // Le lien reçu par e-mail ouvre une session temporaire : on lui laisse le temps d'arriver.
  useEffect(() => { const t = setTimeout(() => setWaited(true), 2500); return () => clearTimeout(t); }, []);
  const ready = user && !user.anonymous;
  return (
    <PubShell>
      <form className="auth-box form" onSubmit={e => { e.preventDefault(); if (pw.length < 8) { b.setErr("8 caractères minimum."); return; } b.run(async () => { await api.setPassword(pw); setDone(true); setTimeout(() => nav("/famille", { replace: true }), 1200); }); }}>
        <h1>Nouveau mot de passe</h1>
        {done ? <p className="ok-msg" role="status">C'est fait ! Redirection vers votre espace…</p>
          : ready ? (<>
            <Pw value={pw} onChange={setPw} autoComplete="new-password" label="Choisissez un nouveau mot de passe" />
            {b.err && <p className="err" role="alert">{b.err}</p>}
            <button type="submit" className="a-btn primary lg block" disabled={b.busy}>Enregistrer</button>
          </>) : loading || !waited ? <Spinner label="Vérification du lien…" />
          : <><p className="err">Ce lien n'est plus valable ou a déjà servi.</p><Link className="a-btn primary block" to="/mot-de-passe-oublie">Recevoir un nouveau lien</Link></>}
      </form>
    </PubShell>
  );
}
