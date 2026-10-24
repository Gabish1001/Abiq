import { useEffect, useState, type ReactNode } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { api, leaveDemo } from "@/lib";
import { resetDemo } from "@/lib/api-demo";
import { useAuth } from "@/lib/auth";
import { Icon, Lumi } from "./kit";
import { InstallPrompt } from "./InstallPrompt";

export function Brand({ to = "/" }: { to?: string }) {
  return <Link to={to} className="brand" aria-label="ABIQ, accueil"><Lumi />ABIQ</Link>;
}

export function DemoBand() {
  if (!api.demo) return null;
  return (
    <div className="demo-band" role="note"><div>
      <b>Mode démonstration.</b> Les données restent dans ce navigateur, rien n'est envoyé.
      <button type="button" onClick={() => { resetDemo(); location.reload(); }}>Remettre à zéro</button>
      <button type="button" onClick={leaveDemo}>Quitter la démo</button>
    </div></div>
  );
}

export function AdultShell({ children, narrow }: { children: ReactNode; narrow?: boolean }) {
  const { profile, signOut } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); }, [loc.pathname]);
  return (
    <div className="adult">
      <header className="a-head">
        <div className="a-head-in">
          <Brand to="/famille" />
          <Link className="a-home" to="/" aria-label="Retour à l'accueil du site"><Icon name="home" size={18} /><span>Accueil</span></Link>
          <button type="button" className="a-menu-btn" aria-expanded={open} aria-label="Menu" onClick={() => setOpen(o => !o)}><Icon name={open ? "close" : "menu"} /></button>
          <nav className={"a-nav" + (open ? " open" : "")} aria-label="Navigation principale">
            <NavLink to="/famille" end><Icon name="heart" size={18} />Ma famille</NavLink>
            {profile?.is_animateur && <NavLink to="/animateur"><Icon name="users" size={18} />Animateur</NavLink>}
            {profile?.is_admin && <NavLink to="/admin"><Icon name="settings" size={18} />Administration</NavLink>}
            <NavLink to="/famille/compte"><Icon name="adult" size={18} />Mon compte</NavLink>
            <button type="button" onClick={async () => { await signOut(); nav("/"); }}><Icon name="logout" size={18} />Déconnexion</button>
          </nav>
        </div>
      </header>
      <DemoBand />
      <main className={"a-main" + (narrow ? " narrow" : "")}>
        <InstallPrompt />
        {children}
      </main>
      <footer className="a-foot"><div>
        <span>ABIQ · Aventures bibliques</span>
        <Link to="/confidentialite">Confidentialité</Link>
        <Link to="/conditions">Conditions d'utilisation</Link>
      </div></footer>
    </div>
  );
}

export function PageTitle({ title, sub, back, children }: { title: string; sub?: string; back?: { to: string; label: string }; children?: ReactNode }) {
  return (
    <div className="a-title">
      <div>
        {back && <Link className="crumb" to={back.to}><Icon name="back" size={16} />{back.label}</Link>}
        <h1>{title}</h1>
        {sub && <p>{sub}</p>}
      </div>
      {children && <div className="row">{children}</div>}
    </div>
  );
}

export function Switch({ on, onChange, label, disabled }: { on: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return <button type="button" className="sw" role="switch" aria-checked={on} aria-label={label} disabled={disabled} onClick={() => onChange(!on)}><span /></button>;
}

export function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); }; addEventListener("keydown", k); return () => removeEventListener("keydown", k); }, [onClose]);
  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label={title} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-in">
        <div className="row between"><h2>{title}</h2><button type="button" className="icon-a" aria-label="Fermer" onClick={onClose}><Icon name="close" /></button></div>
        {children}
      </div>
    </div>
  );
}

export function StatusPill({ s }: { s: string }) {
  const L: Record<string, string> = { draft: "Brouillon", review: "En vérification", published: "Publié", archived: "Archivé", live: "En cours", done: "Terminée", prepared: "Préparée" };
  return <span className={"pill " + s}>{s === "live" && <span className="dot-live" />}{L[s] || s}</span>;
}
