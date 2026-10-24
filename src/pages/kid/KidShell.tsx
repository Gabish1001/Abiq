import { type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Icon, Lumi, fr } from "@/ui/kit";
import { ParentGate } from "@/ui/ParentGate";

/** home : « gate » = bouton Accueil à maintenir appuyé (écrans d'enfant), « free » = simple bouton, « none » = aucun. */
export function KidShell({ bar, children, home = "gate" }: { bar: ReactNode; children: ReactNode; home?: "gate" | "free" | "none" }) {
  const nav = useNavigate();
  return (
    <div className="kid">
      <div className="kid-col">
        {home !== "none" && (
          <div className="kid-top">
            {home === "gate"
              ? <ParentGate compact icon="home" label="Accueil" hint="Maintiens appuyé pour revenir à l'accueil du site" onOpen={() => nav("/")} />
              : <button type="button" className="gate compact" onClick={() => nav("/")}><span className="ring"><span><Icon name="home" size={16} /></span></span><b>Accueil</b></button>}
          </div>
        )}
        <header className="kid-bar">{bar}</header>
        <main className="kid-view">{children}</main>
      </div>
    </div>
  );
}

export function KidMessage({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return <div className="kid-msg"><Lumi size={100} /><h2>{fr(title)}</h2><p>{fr(text)}</p>{action}</div>;
}

/** Écran de pause quand le temps de jeu fixé par le parent est atteint. */
export function PauseOverlay({ onExtend, onHome }: { onExtend: () => void; onHome: () => void }) {
  return (
    <div className="pause" role="dialog" aria-modal="true" aria-label="C'est l'heure de faire une pause">
      <div className="pause-in">
        <Lumi size={120} />
        <h2>C'est l'heure de la pause !</h2>
        <p>{fr("Tu as bien joué aujourd'hui. Lumi va se reposer un peu… Ta progression est gardée : tu reprendras là où tu t'es arrêté.")}</p>
        <button type="button" className="btn btn-gold" onClick={onHome}><Icon name="home" />Retour à l'accueil</button>
        <ParentGate onOpen={onExtend} label="Un adulte peut prolonger" hint="Maintiens appuyé : 15 minutes de plus" />
      </div>
    </div>
  );
}

export function BackBar({ title, to }: { title: string; to: string }) {
  const nav = useNavigate();
  return <>
    <button type="button" className="icon-btn" aria-label="Retour" onClick={() => nav(to)}><Icon name="back" /></button>
    <div className="bar-title">{title}</div>
    <span style={{ width: 48 }} />
  </>;
}
