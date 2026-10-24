import { useNavigate, useParams } from "react-router-dom";
import { Spinner } from "@/ui/kit";
import { LevelPlayer } from "@/game/LevelPlayer";
import { nextInfoFor, usePlayTime, useProgressSaver } from "@/game/progress";
import type { PlayState } from "@/game/state";
import { KidMessage, KidShell, PauseOverlay } from "./KidShell";
import { useKid } from "./useKid";

export function KidPlay() {
  const { childId, levelId } = useParams();
  const nav = useNavigate();
  const { data, error, loading } = useKid(childId, levelId);
  const saver = useProgressSaver(childId, levelId);
  const time = usePlayTime(childId, data?.child.settings.dailyMinutes ?? null);

  if (loading) return <div className="kid"><Spinner label="Lumi ouvre le Grand Livre…" /></div>;
  if (error || !data) return <KidShell bar={<span />}><KidMessage title="Oups !" text={error || ""} action={<button className="btn btn-gold" onClick={() => nav(-1)}>Retour</button>} /></KidShell>;
  const home = `/jouer/${data.child.id}`;
  const s = data.statuses.find(x => x.level.id === levelId);
  if (!s || !s.available) return (
    <KidShell bar={<span />}>
      <KidMessage title="Cette page est encore fermée" text={s?.reason === "date" ? `Elle s'ouvrira ${s.when}. Patience !` : "Rallume d'abord la page précédente !"}
        action={<button className="btn btn-gold" onClick={() => nav(home)}>Retour au Grand Livre</button>} />
    </KidShell>
  );
  const prog = s.prog;
  const resume = prog && !prog.completed_at ? (prog.state as PlayState) : null;
  const st = data.child.settings;
  const i = data.statuses.indexOf(s);
  const nextLevel = data.statuses[i + 1]?.level;

  return (
    <div className="kid">
      <LevelPlayer
        key={levelId}
        levelId={s.level.id}
        content={s.level.content}
        initial={resume}
        settings={{ sound: st.sound !== false, voice: st.voice !== false, puzzleN: st.puzzleN || 3 }}
        saveStatus={saver.status}
        next={nextInfoFor(data.statuses, s.level.id, true)}
        onState={ps => saver.saveState(ps, s.level.content)}
        onComplete={ps => saver.complete(ps, s.level.content)}
        onExit={() => nav(home)}
        onNext={nextLevel ? () => nav(`/jouer/${data.child.id}/niveau/${nextLevel.id}`) : undefined}
        onCollection={() => nav(`/jouer/${data.child.id}/collection`)}
      />
      {time.over && <PauseOverlay onExtend={time.extend} onHome={() => nav(home)} />}
    </div>
  );
}
