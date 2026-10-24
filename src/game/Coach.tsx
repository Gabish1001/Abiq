import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Icon, ListenButton, Lumi, fr } from "@/ui/kit";
import { Voice } from "./voice";

export type CoachAct = { label: string; onClick: () => void; cls?: string; icon?: string; end?: boolean };
export type CoachOpts = { kind: "good" | "try" | "tip"; title: string; text?: string; refText?: string; acts?: CoachAct[] };

type Ctx = { show: (o: CoachOpts) => void; close: () => void; open: boolean };
const CoachCtx = createContext<Ctx>({ show: () => {}, close: () => {}, open: false });
export const useCoach = () => useContext(CoachCtx);

/** Panneau de conseils de Lumi, fixé en bas de l'écran : impossible à rater. */
export function CoachProvider({ children, onHeight }: { children: ReactNode; onHeight: (h: number) => void }) {
  const [opts, setOpts] = useState<CoachOpts | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const show = (o: CoachOpts) => setOpts(o);
  const close = () => { if (Voice.key === "coach") Voice.stop(); setOpts(null); };
  useEffect(() => {
    if (!opts) { onHeight(0); return; }
    const h = ref.current?.offsetHeight || 240; onHeight(h + 24);
  }, [opts, onHeight]);
  return (
    <CoachCtx.Provider value={{ show, close, open: !!opts }}>
      {children}
      {opts && (
        <div className={"coach " + opts.kind} aria-live="polite">
          <div className="coach-in" ref={ref}>
            <Lumi />
            <div className="coach-b">
              <p className="coach-t">{fr(opts.title)}</p>
              {opts.text && <p>{fr(opts.text)}</p>}
              {opts.refText && <span className="ref">{opts.refText}</span>}
              <ListenButton id="coach" text={`${opts.title} ${opts.text || ""}`} />
            </div>
            {!!opts.acts?.length && (
              <div className={"coach-acts" + (opts.acts.length === 2 ? " two" : "")}>
                {opts.acts.map((a, i) => (
                  <button key={i} type="button" className={"btn " + (a.cls || "btn-soft")} onClick={a.onClick}>
                    {a.icon && !a.end && <Icon name={a.icon} />}{fr(a.label)}{a.icon && a.end && <Icon name={a.icon} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </CoachCtx.Provider>
  );
}
