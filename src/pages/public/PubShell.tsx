import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Icon } from "@/ui/kit";
import { useAuth } from "@/lib/auth";
import { Brand, DemoBand } from "@/ui/AdultShell";

export const CONTACT = (import.meta.env.VITE_CONTACT_EMAIL as string | undefined) || "";

/** Dernière version de l'appli Android, publiée automatiquement par GitHub (workflow « Application Android »). */
export const APK_URL = "https://github.com/Gabish1001/Abiq/releases/latest/download/abiq.apk";

/** Inutile de proposer l'APK dans l'appli elle-même ni sur iPhone/iPad. */
export function canOfferApk() {
  if (typeof window === "undefined") return false;
  const inApp = window.matchMedia?.("(display-mode: standalone)").matches || document.referrer.startsWith("android-app://");
  const ios = /iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  return !inApp && !ios;
}

export function PubShell({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const adult = user && !user.anonymous;
  return (
    <div className="pub">
      <header className="pub-head">
        <Brand />
        <nav aria-label="Navigation">
          {pathname !== "/" && <Link className="a-btn sm" to="/" aria-label="Retour à l'accueil"><Icon name="home" size={16} /><span className="hide-xs">Accueil</span></Link>}
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
