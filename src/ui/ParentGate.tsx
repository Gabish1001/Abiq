import { useRef } from "react";
import { Icon } from "./kit";

/** Bouton à maintenir appuyé 1,5 s : évite qu'un jeune enfant quitte son espace par accident. */
export function ParentGate({ onOpen, label = "Espace adulte", hint = "Maintiens appuyé pour ouvrir" }: { onOpen: () => void; label?: string; hint?: string }) {
  const ref = useRef<HTMLButtonElement>(null);
  const raf = useRef(0), t0 = useRef(0);
  const stop = () => { cancelAnimationFrame(raf.current); raf.current = 0; ref.current?.style.setProperty("--p", "0"); };
  const tick = () => {
    const p = Math.min(1, (performance.now() - t0.current) / 1500);
    ref.current?.style.setProperty("--p", String(p));
    if (p >= 1) { stop(); onOpen(); } else raf.current = requestAnimationFrame(tick);
  };
  const start = () => { if (raf.current) return; t0.current = performance.now(); raf.current = requestAnimationFrame(tick); };
  return (
    <button ref={ref} type="button" className="gate" aria-label={`${label} : ${hint.toLowerCase()}`}
      onPointerDown={e => { e.preventDefault(); start(); }} onPointerUp={stop} onPointerLeave={stop} onPointerCancel={stop}
      onKeyDown={e => { if ((e.key === "Enter" || e.key === " ") && !e.repeat) { e.preventDefault(); start(); } }}
      onKeyUp={e => { if (e.key === "Enter" || e.key === " ") stop(); }} onContextMenu={e => e.preventDefault()}>
      <span className="ring"><span><Icon name="adult" size={16} /></span></span>
      <span><b>{label}</b>{hint}</span>
    </button>
  );
}
