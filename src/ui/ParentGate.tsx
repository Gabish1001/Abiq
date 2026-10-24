import { useRef, useState } from "react";
import { Icon } from "./kit";

/** Bouton à maintenir appuyé 1,5 s : évite qu'un jeune enfant quitte son espace par accident. */
export function ParentGate({ onOpen, label = "Espace adulte", hint = "Maintiens appuyé pour ouvrir", icon = "adult", compact = false }: { onOpen: () => void; label?: string; hint?: string; icon?: string; compact?: boolean }) {
  const ref = useRef<HTMLButtonElement>(null);
  const raf = useRef(0), t0 = useRef(0), nudgeT = useRef(0);
  const [nudge, setNudge] = useState(false);
  const stop = () => {
    // relâché trop tôt : on rappelle qu'il faut maintenir
    if (raf.current && compact) { setNudge(true); clearTimeout(nudgeT.current); nudgeT.current = window.setTimeout(() => setNudge(false), 2200); }
    cancelAnimationFrame(raf.current); raf.current = 0; ref.current?.style.setProperty("--p", "0");
  };
  const tick = () => {
    const p = Math.min(1, (performance.now() - t0.current) / 1500);
    ref.current?.style.setProperty("--p", String(p));
    if (p >= 1) { cancelAnimationFrame(raf.current); raf.current = 0; ref.current?.style.setProperty("--p", "0"); onOpen(); } else raf.current = requestAnimationFrame(tick);
  };
  const start = () => { if (raf.current) return; t0.current = performance.now(); raf.current = requestAnimationFrame(tick); };
  return (
    <button ref={ref} type="button" className={"gate" + (compact ? " compact" : "")} title={compact ? hint : undefined} aria-label={`${label} : ${hint.toLowerCase()}`}
      onPointerDown={e => { e.preventDefault(); start(); }} onPointerUp={stop} onPointerLeave={stop} onPointerCancel={stop}
      onKeyDown={e => { if ((e.key === "Enter" || e.key === " ") && !e.repeat) { e.preventDefault(); start(); } }}
      onKeyUp={e => { if (e.key === "Enter" || e.key === " ") stop(); }} onContextMenu={e => e.preventDefault()}>
      <span className="ring"><span><Icon name={icon} size={16} /></span></span>
      {compact ? <b>{label}{nudge && <small className="gate-nudge"> · maintiens appuyé</small>}</b> : <span><b>{label}</b>{hint}</span>}
    </button>
  );
}
