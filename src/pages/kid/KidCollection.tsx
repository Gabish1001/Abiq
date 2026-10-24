import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArtImg, ListenButton, Lumi, Spinner, fr } from "@/ui/kit";
import { HeroCard } from "@/game/steps/Reward";
import { BackBar, KidMessage, KidShell } from "./KidShell";
import { useKid } from "./useKid";

export function KidCollection() {
  const { childId } = useParams();
  const nav = useNavigate();
  const { data, error, loading } = useKid(childId);
  const [zoom, setZoom] = useState<string | null>(null);
  if (loading && !data) return <div className="kid"><Spinner /></div>;
  if (error || !data) return <KidShell bar={<span />}><KidMessage title="Oups !" text={error || ""} /></KidShell>;
  const { statuses, child } = data;
  const have = statuses.filter(s => s.done).length;
  const nextDate = statuses.find(s => !s.done && !s.available && s.reason === "date");
  const line = have ? `Chaque page rallumée t'apporte une nouvelle carte.${nextDate ? ` La prochaine arrive ${nextDate.when} !` : ""}` : "Rallume ta première page pour gagner ta première carte !";
  const z = statuses.find(s => s.level.id === zoom);

  return (
    <KidShell bar={<BackBar title="Ma collection" to={`/jouer/${child.id}`} />}>
      <div className="stack screen-in">
        <div className="coll-head"><h1>Mes héros</h1><p>{have} carte{have > 1 ? "s" : ""} sur {statuses.length}</p></div>
        <div className="say say-sm"><Lumi /><div className="bubble"><p>{fr(line)}</p><ListenButton id="coll" text={line} /></div></div>
        <div className="cgrid">
          {statuses.map(s => {
            const c = s.level.content;
            if (s.done) return (
              <button type="button" key={s.level.id} className="ccard have" onClick={() => setZoom(s.level.id)} aria-label={`Carte de ${c.title}, voir en grand`}>
                <ArtImg art={c.card.art} image={c.card.image} alt="" /><span className="cc-name">{fr(c.title)}</span><span className="cc-sub">{c.value}</span>
              </button>);
            if (s.reason === "date" || (s.available && !s.done)) return (
              <div key={s.level.id} className="ccard next">
                <ArtImg art={c.teaser.art} image={c.teaser.image} alt="Silhouette mystère" /><span className="cc-name">Qui est-ce ?</span>
                <span className="cc-sub">{s.available ? "À découvrir maintenant" : `Arrive ${s.when}`}</span>
              </div>);
            return <div key={s.level.id} className="ccard locked"><span className="cc-q">?</span><span className="cc-name">Page {s.level.position}</span><span className="cc-sub">Bientôt</span></div>;
          })}
        </div>
        <button type="button" className="btn btn-ghost" onClick={() => nav(`/jouer/${child.id}`)}>Retour au Grand Livre</button>
      </div>
      {z && (
        <div className="card-zoom" role="dialog" aria-modal="true" aria-label={`Carte de ${z.level.content.title}`} onClick={() => setZoom(null)}>
          <HeroCard title={z.level.content.title} source={z.level.content.source} text={z.level.content.card.text} value={z.level.content.value} art={z.level.content.card.art} image={z.level.content.card.image} alt={z.level.content.card.alt} />
        </div>
      )}
    </KidShell>
  );
}
