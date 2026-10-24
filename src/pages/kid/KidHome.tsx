import { useNavigate, useParams } from "react-router-dom";
import { ArtImg, Avatar, Icon, ListenButton, Lumi, Spinner, Stars, fr } from "@/ui/kit";
import { ParentGate } from "@/ui/ParentGate";
import { usePlayTime, type LevelStatus } from "@/game/progress";
import { STEP_WORD, type PlayState } from "@/game/state";
import { KidMessage, KidShell, PauseOverlay } from "./KidShell";
import { useKid } from "./useKid";
import { useState } from "react";
import { Sound } from "@/game/sound";
import { api } from "@/lib";

export function KidHome() {
  const { childId } = useParams();
  const nav = useNavigate();
  const { data, error, loading, setData } = useKid(childId);
  const time = usePlayTime(childId, data?.child.settings.dailyMinutes ?? null);
  const [sound, setSound] = useState<boolean | null>(null);

  if (loading && !data) return <div className="kid"><Spinner label="Lumi allume sa lampe…" /></div>;
  if (error || !data) return <KidShell bar={<span />}><KidMessage title="Oups !" text={error || "Profil introuvable."} action={<button className="btn btn-gold" onClick={() => nav("/famille")}>Retour</button>} /></KidShell>;

  const { child, worlds, statuses } = data;
  const soundOn = sound ?? child.settings.sound !== false;
  const stars = statuses.reduce((a, s) => a + (s.prog?.stars || 0), 0);
  const done = statuses.filter(s => s.done).length;
  const current = statuses.find(s => s.available && !s.done);
  const waiting = statuses.find(s => !s.available && s.reason === "date");
  const started = statuses.some(s => s.prog);
  const line = !started
    ? "Bonjour, je suis Lumi ! Les pages du Grand Livre se sont effacées. On les rallume ensemble ?"
    : current?.started ? "Ta page t'attend ! On reprend là où on en était ?"
    : current ? "Une nouvelle page t'attend dans le Grand Livre. Qui se cache dedans ?"
    : waiting ? `Bravo, tu as rallumé toutes les pages ouvertes ! La prochaine arrive ${waiting.when}. Tu devines qui se cache dedans ?`
    : "Bravo, tu as rallumé tout le Grand Livre ! Tu peux revoir tes héros dans ta collection.";
  const open = (s: LevelStatus) => {
    if (s.available) { nav(`/jouer/${child.id}/niveau/${s.level.id}`); return; }
    Sound.play("soft");
  };
  const toggleSound = async () => {
    const v = !soundOn; setSound(v); Sound.setEnabled(v); if (v) Sound.play("tap");
    try { const c = await api.updateChild(child.id, { settings: { ...child.settings, sound: v } }); setData({ ...data, child: c }); } catch { /* le réglage reste local */ }
  };

  return (
    <KidShell bar={<>
      <div className="who"><Avatar id={child.avatar} /><div><div className="hello">{fr(`Salut ${child.pseudonym} !`)}</div><div className="sub">Parcours 6-8 ans</div></div></div>
      <div className="bar-r">
        <span className="star-count" role="img" aria-label={`${stars} étoiles`}><Icon name="star" size={20} fill />{stars}</span>
        <button type="button" className="icon-btn" aria-pressed={!soundOn} aria-label={soundOn ? "Couper les sons" : "Remettre les sons"} onClick={toggleSound}><Icon name={soundOn ? "sound" : "mute"} /></button>
      </div>
    </>}>
      <div className="stack screen-in">
        <div className="say say-hero"><Lumi /><div className="bubble"><p>{fr(line)}</p><ListenButton id="home" text={line} /></div></div>
        <div className="book">
          <span className="book-ic"><Icon name="book" size={26} /></span>
          <div className="book-txt"><span className="eyebrow">Le Grand Livre</span><span className="book-title">{done} page{done > 1 ? "s" : ""} rallumée{done > 1 ? "s" : ""} sur {statuses.length}</span></div>
          <div className="pages" role="img" aria-label={`${done} pages rallumées sur ${statuses.length}`}>{statuses.map(s => <span key={s.level.id} className={"pg" + (s.done ? " lit" : "")} />)}</div>
        </div>
        <div className="cta">
          {current
            ? <button type="button" className="btn btn-gold attn" onClick={() => open(current)}>{current.started ? "Continuer l'aventure" : started ? "Découvrir la nouvelle page" : "Commencer l'aventure"}<Icon name="next" /></button>
            : <button type="button" className="btn btn-gold" onClick={() => nav(`/jouer/${child.id}/collection`)}><Icon name="cards" />Ma collection</button>}
          {current && done > 0 && <button type="button" className="btn btn-ghost" onClick={() => nav(`/jouer/${child.id}/collection`)}><Icon name="cards" size={20} />Ma collection</button>}
        </div>
        {worlds.map(w => {
          const ws = statuses.filter(s => s.level.world_id === w.id);
          if (!ws.length) return null;
          return (
            <section key={w.id} aria-label={w.title}>
              <div className="world-h"><h2 className="sec">{w.title}</h2><span className="eyebrow">{w.subtitle}</span></div>
              <ol className="trail">
                {ws.map(s => <li key={s.level.id}><Node s={s} onOpen={() => open(s)} /></li>)}
              </ol>
            </section>
          );
        })}
        <ParentGate onOpen={() => nav("/famille")} />
        <p className="proto">ABIQ · Parcours 6-8 ans</p>
      </div>
      {time.over && <PauseOverlay onExtend={time.extend} onHome={() => nav(`/jouer/${child.id}`)} />}
    </KidShell>
  );
}

function Node({ s, onOpen }: { s: LevelStatus; onOpen: () => void }) {
  const c = s.level.content;
  const known = s.done || (s.prog?.state as PlayState | undefined)?.puzzle?.solved;
  const pos = s.level.position;
  const cls = s.done ? "done" : s.available ? "cur" : "locked";
  const sub = s.done ? "Page rallumée" : s.available ? (s.started ? "En cours : " + STEP_WORD[(s.prog!.state as PlayState).at] : "Prête à jouer")
    : s.reason === "date" ? `Nouvelle page ${s.when}` : "S'ouvre après la page précédente";
  return (
    <button type="button" className={"node " + cls} onClick={onOpen} aria-disabled={!s.available}>
      <span className="thumb">
        {known ? <ArtImg art={c.card.art} image={c.card.image} alt="" />
          : s.available ? <span className="q">?</span>
          : s.reason === "date" ? <ArtImg art={c.teaser.art} image={c.teaser.image} alt="" />
          : <Icon name="lock" size={22} />}
      </span>
      <span className="node-txt">
        <span className="node-k">Page {pos}</span>
        <span className="node-t">{known ? fr(c.title) : s.available ? "Page mystère" : s.reason === "date" ? "Qui est-ce ?" : "Page fermée"}</span>
        <span className="node-s">{fr(sub)}</span>
      </span>
      {s.done && <Stars n={s.prog?.stars || 3} />}
    </button>
  );
}
