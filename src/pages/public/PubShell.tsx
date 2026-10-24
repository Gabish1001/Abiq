import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Brand, DemoBand } from "@/ui/AdultShell";

export const CONTACT = (import.meta.env.VITE_CONTACT_EMAIL as string | undefined) || "";

export function PubShell({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const adult = user && !user.anonymous;
  return (
    <div className="pub">
      <header className="pub-head">
        <Brand />
        <nav aria-label="Navigation">
          <Link className="a-btn sm" to="/rejoindre">J'ai un code</Link>
          {adult ? <Link className="a-btn sm primary" to="/famille">Mon espace</Link> : <Link className="a-btn sm primary" to="/connexion">Se connecter</Link>}
        </nav>
      </header>
      <DemoBand />
      {children}
      <footer className="a-foot"><div>
        <span>ABIQ · Aventures bibliques</span>
        <Link to="/confidentialite">Confidentialité</Link>
        <Link to="/conditions">Conditions d'utilisation</Link>
        {CONTACT && <a href={`mailto:${CONTACT}`}>Contact</a>}
      </div></footer>
    </div>
  );
}
