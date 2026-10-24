import { useEffect, type ReactNode } from "react";
import { ArtImg, Icon, ListenButton, fr } from "@/ui/kit";
import { Sound } from "../sound";
import { BADGE_INFO, badgesFor } from "../state";
import type { PlayerEnv } from "../LevelPlayer";

export type NextInfo = { text: string; art: string; image?: string; available: boolean; when?: string } | null;

export function Medal({ id, size = 62 }: { id: string; size?: number }) {
  const color = BADGE_INFO[id as keyof typeof BADGE_INFO]?.color || "#F6B82F";
  const glyph: Record<string, ReactNode> = {
    perseverance: <><path d="M16 51l11-16 6 7 5-8 10 17z" fill="#fff" /><path d="M38 34V22" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" /><path d="M38 22l8 3-8 3z" fill="#fff" /></>,
    memoire: <><circle cx="31" cy="38" r="10" fill="#fff" /><ellipse cx="24" cy="37" rx="6" ry="8" fill="rgba(255,255,255,.7)" /><path d="M39 39c4 2 5 7 2 11" stroke="#fff" strokeWidth="4.5" fill="none" strokeLinecap="round" /><circle cx="34" cy="35" r="1.8" fill="#2B2442" /></>,
    detective: <><circle cx="29" cy="36" r="8" fill="none" stroke="#fff" strokeWidth="3.5" /><path d="M35 42l8 8" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" /></>
  };
  return <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true"><path d="M19 3h11l4 19H23z" fill="#4C9CE2" /><path d="M34 3h11l-4 19H30z" fill="#F0685A" /><circle cx="32" cy="39" r="22" fill={color} /><circle cx="32" cy="39" r="17" fill="none" stroke="rgba(255,255,255,.55)" strokeWidth="2.5" />{glyph[id]}</svg>;
}

export function HeroCard({ title, source, text, value, art, image, alt }: { title: string; source: string; text: string; value: string; art: string; image?: string; alt: string }) {
  return (
    <div className="hcard">
      <ArtImg art={art} image={image} alt={alt} />
      <div className="hcard-b">
        <span className="hcard-name">{fr(title)}</span>
        <span className="hcard-ref">{source}</span>
        <p>{fr(text)}</p>
        <span className="chip chip-green">{value}</span>
      </div>
    </div>
  );
}

export function Reward({ env }: { env: PlayerEnv }) {
  const { st, set, content, variant, next } = env;
  useEffect(() => {
    if (!st.cheered) { set(s => { s.cheered = true; }); const t = setTimeout(() => Sound.play("win"), 350); return () => clearTimeout(t); }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const badges = badgesFor(st);
  const group = variant === "screen";

  return (
    <div className="stack screen-in">
      <div className="rw-head">
        <span className="eyebrow">{content.source}</span>
        <h1>{group ? "Bravo à tout le groupe !" : "Page rallumée !"}</h1>
        <p>{fr(`La page de ${content.title.replace(/^Le /, "l'histoire du ").replace(/^La /, "l'histoire de la ")} brille à nouveau dans le Grand Livre.`)}</p>
      </div>
      <div className="hero-card">
        <HeroCard title={content.title} source={content.source} text={content.card.text} value={content.value} art={content.card.art} image={content.card.image} alt={content.card.alt} />
      </div>
      {!group && <p className="rw-new">Nouvelle carte dans ta collection</p>}
      <ul className="stars3" aria-label="3 étoiles gagnées">
        {["Puzzle réussi", "Histoire découverte", "Quiz terminé"].map((l, k) => <li key={l} style={{ ["--d" as string]: k }}><Icon name="star" size={42} fill /><span>{l}</span></li>)}
      </ul>
      <div className="badges">
        {badges.map(b => <div className="badge" key={b}><Medal id={b} /><div><p className="badge-t">{BADGE_INFO[b].title}</p><p className="badge-d">{fr(BADGE_INFO[b].text(st))}</p></div></div>)}
      </div>
      {next ? (
        <section className="teaser" aria-label="Page suivante">
          <ArtImg art={next.art} image={next.image} alt="Silhouette mystère du prochain héros" />
          <div className="teaser-b">
            <span className="eyebrow">Page suivante</span>
            <p>{fr(next.text)}</p>
            <span className="chip chip-gold">{next.available ? "Déjà disponible !" : `Nouvelle page ${next.when || "bientôt"}`}</span>
            <ListenButton id="teaser" text={"Page suivante. " + next.text} light />
          </div>
        </section>
      ) : variant !== "preview" && (
        <section className="teaser end"><div className="teaser-b"><span className="eyebrow">Le Grand Livre</span><p>{fr("Bravo ! Tu as rallumé toutes les pages disponibles. De nouvelles aventures arriveront bientôt.")}</p></div></section>
      )}
      <div className="cta">
        {next?.available && env.onNext && <button type="button" className="btn btn-gold attn" onClick={env.onNext}>Page suivante<Icon name="next" /></button>}
        {env.onCollection && <button type="button" className={"btn " + (next?.available ? "btn-ghost" : "btn-gold")} onClick={env.onCollection}><Icon name="cards" />Voir ma collection</button>}
        <button type="button" className="btn btn-ghost" onClick={env.onExit}><Icon name="home" size={20} />{group ? "Revenir à la séance" : variant === "preview" ? "Fermer l'aperçu" : "Retour à l'accueil"}</button>
      </div>
    </div>
  );
}
