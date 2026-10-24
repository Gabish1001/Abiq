import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib";
import { ls, useLoad } from "@/lib/hooks";
import { ArtImg, Avatar, Icon, Lumi, Spinner, Stars, fr } from "@/ui/kit";
import { LevelPlayer } from "@/game/LevelPlayer";
import { levelStatuses, mergePending, useProgressSaver } from "@/game/progress";
import type { PlayState } from "@/game/state";
import type { Child } from "@/lib/types";
import { KidMessage, KidShell } from "./KidShell";

export type DeviceSession = { code: string; session_id: string; level_ids: string[]; group_name: string; title: string; child: Child };
export const DEVICE_KEY = "abiq-device";

/** Un enfant joue sur un appareil du groupe, pendant une séance « chacun son appareil ». */
export function SessionPlay() {
  const nav = useNavigate();
  const dev = ls.get<DeviceSession | null>(DEVICE_KEY, null);
  const [playing, setPlaying] = useState<string | null>(null);
  const q = useLoad(async () => {
    if (!dev) return null;
    const [levels, server] = await Promise.all([api.levels(), api.progressFor([dev.child.id])]);
    const mine = levels.filter(l => dev.level_ids.includes(l.id));
    return { levels: mine, statuses: levelStatuses(mine, mergePending(server, dev.child.id), { ignoreDates: true }) };
  }, [dev?.session_id, dev?.child.id, playing]);
  const saver = useProgressSaver(dev?.child.id, playing || undefined, dev?.session_id || null);

  if (!dev) return <KidShell bar={<span />}><KidMessage title="Pas de séance" text="Demande le code de la séance à ton animateur." action={<button className="btn btn-gold" onClick={() => nav("/rejoindre")}>Entrer un code</button>} /></KidShell>;
  if (q.loading && !q.data) return <div className="kid"><Spinner /></div>;
  if (q.error || !q.data) return <KidShell bar={<span />}><KidMessage title="La séance est peut-être terminée" text={q.error || "Demande à ton animateur."} action={<button className="btn btn-gold" onClick={() => { ls.del(DEVICE_KEY); nav("/rejoindre"); }}>Entrer un autre code</button>} /></KidShell>;

  const cur = q.data.statuses.find(s => s.level.id === playing);
  if (cur) {
    const prog = cur.prog;
    return (
      <div className="kid">
        <LevelPlayer key={cur.level.id} levelId={cur.level.id} content={cur.level.content}
          initial={prog && !prog.completed_at ? (prog.state as PlayState) : null}
          settings={{ sound: true, voice: true, puzzleN: 3 }} saveStatus={saver.status} next={null}
          onState={s => saver.saveState(s, cur.level.content)} onComplete={s => saver.complete(s, cur.level.content)}
          onExit={() => setPlaying(null)} />
      </div>
    );
  }
  return (
    <KidShell bar={<>
      <div className="who"><Avatar id={dev.child.avatar} /><div><div className="hello">{fr(`Salut ${dev.child.pseudonym} !`)}</div><div className="sub">{dev.group_name}</div></div></div>
      <button type="button" className="icon-btn" aria-label="Ce n'est pas moi : changer de prénom" onClick={() => nav(`/rejoindre/${dev.code}`)}><Icon name="users" /></button>
    </>}>
      <div className="stack screen-in">
        <div className="say say-hero"><Lumi /><div className="bubble"><p>{fr("C'est l'heure de la séance ! Touche ta page pour commencer.")}</p></div></div>
        <div className="cgrid">
          {q.data.statuses.map(s => (
            <button key={s.level.id} type="button" className={"ccard " + (s.done ? "have" : "next")} onClick={() => setPlaying(s.level.id)}>
              {s.done ? <ArtImg art={s.level.content.card.art} image={s.level.content.card.image} alt="" /> : <ArtImg art={s.level.content.teaser.art} image={s.level.content.teaser.image} alt="" />}
              <span className="cc-name">{s.done ? fr(s.level.content.title) : "Page mystère"}</span>
              <span className="cc-sub">{s.done ? <Stars n={3} /> : s.started ? "En cours" : "À jouer"}</span>
            </button>
          ))}
        </div>
        <button type="button" className="btn btn-ghost" onClick={() => nav(`/rejoindre/${dev.code}`)}>Ce n'est pas moi</button>
      </div>
    </KidShell>
  );
}
