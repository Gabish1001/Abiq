import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import type { LevelContent } from "@/content/types";
import { Icon, fr } from "@/ui/kit";
import { CoachProvider, useCoach } from "./Coach";
import { Sound } from "./sound";
import { Voice } from "./voice";
import { STEPS, type PlayState, type Step, newPlayState, sanitizeState } from "./state";
import { Mystery } from "./steps/Mystery";
import { Puzzle } from "./steps/Puzzle";
import { Story } from "./steps/Story";
import { Quiz } from "./steps/Quiz";
import { Reward, type NextInfo } from "./steps/Reward";

export type Variant = "child" | "screen" | "preview";
export type SaveStatus = "idle" | "saving" | "saved" | "offline";

export type PlayerEnv = {
  levelId: string;
  content: LevelContent;
  st: PlayState;
  set: (fn: (s: PlayState) => void) => void;
  go: (step: Step) => void;
  variant: Variant;
  toast: (msg: string) => void;
  viewRef: RefObject<HTMLDivElement | null>;
  next?: NextInfo | null;
  onNext?: () => void;
  onCollection?: () => void;
  onExit: () => void;
};

type Props = {
  levelId: string;
  content: LevelContent;
  initial?: unknown;
  settings: { sound: boolean; voice: boolean; puzzleN: number };
  variant?: Variant;
  next?: NextInfo | null;
  saveStatus?: SaveStatus;
  title?: string;
  onState?: (s: PlayState) => void;
  onComplete?: (s: PlayState) => void;
  onExit: () => void;
  onNext?: () => void;
  onCollection?: () => void;
};

const LABELS: Record<Step, [string, string]> = {
  mystery: ["Mystère", "question"], puzzle: ["Puzzle", "puzzle"], story: ["Histoire", "book"], quiz: ["Quiz", "quiz"], reward: ["Récompense", "star"]
};

export function LevelPlayer(p: Props) {
  const variant = p.variant || "child";
  const [st, setSt] = useState<PlayState>(() => p.initial ? sanitizeState(p.initial, p.content, p.settings.puzzleN) : newPlayState(p.content, p.settings.puzzleN));
  const [coachH, setCoachH] = useState(0);
  const [sound, setSound] = useState(p.settings.sound);
  const [toastMsg, setToast] = useState<string | null>(null);
  const viewRef = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  const onStateRef = useRef(p.onState); onStateRef.current = p.onState;

  useEffect(() => { Sound.setEnabled(sound); }, [sound]);
  useEffect(() => { Voice.enabled = p.settings.voice; return () => { Voice.stop(); }; }, [p.settings.voice]);
  useEffect(() => { if (first.current) { first.current = false; return; } onStateRef.current?.(st); }, [st]);

  const set = useCallback((fn: (s: PlayState) => void) => setSt(prev => { const n = structuredClone(prev); fn(n); return n; }), []);
  const go = useCallback((step: Step) => {
    Voice.stop();
    set(s => { s.at = step; if (step === "reward" && !s.endedAt) s.endedAt = Date.now(); });
    requestAnimationFrame(() => viewRef.current?.scrollTo({ top: 0 }));
  }, [set]);
  const toast = useCallback((m: string) => { setToast(m); }, []);
  useEffect(() => { if (!toastMsg) return; const t = setTimeout(() => setToast(null), 2200); return () => clearTimeout(t); }, [toastMsg]);

  const completedRef = useRef(false);
  useEffect(() => {
    if (st.at === "reward" && !completedRef.current) { completedRef.current = true; p.onComplete?.(st); }
  }, [st, p]);

  const env: PlayerEnv = { levelId: p.levelId, content: p.content, st, set, go, variant, toast, viewRef, next: p.next, onNext: p.onNext, onCollection: p.onCollection, onExit: p.onExit };
  const cur = STEPS.indexOf(st.at);

  return (
    <div className={`player v-${variant}`} style={{ ["--coach-h" as string]: coachH + "px" }} onPointerDown={() => Sound.unlock()}>
      <header className="player-bar">
        <button type="button" className="icon-btn" onClick={() => { Voice.stop(); p.onExit(); }} aria-label={variant === "screen" ? "Revenir à la séance" : variant === "preview" ? "Fermer l'aperçu" : "Faire une pause et revenir à l'accueil"}>
          <Icon name={variant === "preview" ? "close" : "home"} />
        </button>
        <ol className="steps" aria-label="Étapes de la page">
          {STEPS.map((k, i) => (
            <li key={k} className={(i < cur ? "done " : "") + (i === cur ? "cur" : "")} aria-current={i === cur ? "step" : undefined}>
              <Icon name={i < cur ? "check" : LABELS[k][1]} size={16} />
              <span className={i === cur ? "lbl" : "sr"}>{LABELS[k][0]}{i < cur ? " (terminé)" : ""}</span>
            </li>
          ))}
        </ol>
        <div className="bar-r">
          {p.saveStatus === "offline" && <span className="save-dot off" title="Pas de connexion : la progression sera envoyée au retour du réseau"><Icon name="cloudoff" size={20} /></span>}
          {p.saveStatus === "saved" && <span className="save-dot ok" title="Progression enregistrée"><Icon name="cloudok" size={20} /></span>}
          <button type="button" className="icon-btn" aria-pressed={!sound} aria-label={sound ? "Couper les sons" : "Remettre les sons"} onClick={() => setSound(v => !v)}>
            <Icon name={sound ? "sound" : "mute"} />
          </button>
        </div>
      </header>
      {p.title && <div className="player-title">{fr(p.title)}</div>}
      <CoachProvider onHeight={setCoachH}>
        <main className={"player-view" + (coachH ? " has-coach" : "")} ref={viewRef}>
          <StepView env={env} />
        </main>
      </CoachProvider>
      {toastMsg && <div className="toast show" role="status"><span>{fr(toastMsg)}</span></div>}
    </div>
  );
}

function StepView({ env }: { env: PlayerEnv }) {
  const coach = useCoach();
  const at = env.st.at;
  useEffect(() => { coach.close(); }, [at]); // eslint-disable-line react-hooks/exhaustive-deps
  if (at === "mystery") return <Mystery env={env} key="m" />;
  if (at === "puzzle") return <Puzzle env={env} key="p" />;
  if (at === "story") return <Story env={env} key="s" />;
  if (at === "quiz") return <Quiz env={env} key="q" />;
  return <Reward env={env} key="r" />;
}
