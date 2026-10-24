import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent as RPE } from "react";
import { Icon, ListenButton, Lumi, fr, useArt } from "@/ui/kit";
import { useCoach } from "../Coach";
import { Sound } from "../sound";
import type { PlayerEnv } from "../LevelPlayer";
import type { PlayState } from "../state";

export function derange(m: number) {
  let a: number[];
  do { a = [...Array(m).keys()]; for (let i = m - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } }
  while (a.some((v, i) => v === i));
  return a;
}
export const itsName = (title: string) => /^(Le|La|Les|L')\s?/.test(title) ? title.charAt(0).toLowerCase() + title.slice(1) : title;
const INSTR = "Remets les pièces à leur place. Touche une pièce, puis une autre pour les échanger. Tu peux aussi les faire glisser.";

type Drag = { id: number; el: HTMLButtonElement; pos: number; x0: number; y0: number; moved: boolean; pid: number; rect: DOMRect };

export function Puzzle({ env }: { env: PlayerEnv }) {
  const { st, set, content, go, toast } = env;
  const P = st.puzzle, n = P.n;
  const img = useArt(content.puzzle.art, content.puzzle.image);
  const coach = useCoach();
  const stRef = useRef<PlayState>(st); stRef.current = st;
  const tiles = useRef<(HTMLButtonElement | null)[]>([]);
  const drag = useRef<Drag | null>(null);
  const miss = useRef(0), nudged = useRef(false), nudgeT = useRef<number | undefined>(undefined);
  const [sel, setSel] = useState<number | null>(null);
  const [flash, setFlash] = useState<Record<number, number>>({});
  const [peek, setPeek] = useState(false);
  const [solving, setSolving] = useState(false);
  const [hot, setHot] = useState(false);

  useEffect(() => {
    if (!P.order || P.order.length !== n * n) set(s => { s.puzzle.order = derange(s.puzzle.n * s.puzzle.n); s.puzzle.t0 = s.puzzle.t0 || Date.now(); });
    else if (!P.t0) set(s => { s.puzzle.t0 = Date.now(); });
    arm();
    return () => clearTimeout(nudgeT.current);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const order = P.order && P.order.length === n * n ? P.order : [];
  const ok = order.filter((id, i) => id === i).length;

  function arm() { clearTimeout(nudgeT.current); nudgeT.current = window.setTimeout(nudge, 25000); }
  function nudge() {
    if (stRef.current.puzzle.solved || drag.current) return;
    setHot(true);
    coach.show({ kind: "tip", title: "Besoin d'aide ?", text: "Touche « Aide de Lumi » : je place une pièce pour toi. Tu peux aussi regarder l'image en entier.",
      acts: [{ label: "Aide de Lumi", onClick: hint, cls: "btn-gold", icon: "bulb" }, { label: "Je continue", onClick: coach.close }] });
  }
  function doFlash(ids: number[]) { setFlash(f => { const g = { ...f }; ids.forEach(id => { g[id] = (g[id] || 0) + 1; }); return g; }); }
  function finishIfSolved(o: number[]) {
    if (!o.every((id, i) => id === i)) return;
    clearTimeout(nudgeT.current); coach.close(); setSel(null);
    set(s => { s.puzzle.solved = true; s.puzzle.t1 = Date.now(); });
    setSolving(true); setTimeout(() => Sound.play("win"), 250); setTimeout(() => setSolving(false), 1400);
  }
  function swap(a: number, b: number) {
    const o = [...stRef.current.puzzle.order!]; [o[a], o[b]] = [o[b], o[a]];
    set(s => { s.puzzle.order = o; });
    Sound.play("swap");
    const placed = [a, b].filter(p => o[p] === p);
    if (placed.length) { miss.current = 0; setTimeout(() => Sound.play("place"), 140); doFlash(placed.map(p => o[p])); }
    else { miss.current++; if (miss.current >= 6 && !nudged.current) { nudged.current = true; nudge(); } }
    finishIfSolved(o);
  }
  function hint() {
    const s0 = stRef.current; if (s0.puzzle.solved) return;
    coach.close(); setHot(false); arm(); miss.current = 0;
    const o = [...s0.puzzle.order!]; const wrong = o.map((id, i) => id !== i ? i : -1).filter(i => i >= 0); if (!wrong.length) return;
    const p = wrong[Math.floor(Math.random() * wrong.length)], q = o.indexOf(p);
    [o[p], o[q]] = [o[q], o[p]];
    set(s => { s.puzzle.order = o; s.puzzle.hints++; });
    setSel(null); doFlash(o[q] === q ? [p, q] : [p]); Sound.play("place"); toast("Lumi a placé une pièce pour toi");
    finishIfSolved(o);
  }
  function showPeek() { set(s => { s.puzzle.peeks++; }); setPeek(true); setTimeout(() => setPeek(false), 2200); }
  function shuffle() { if (P.solved) return; setSel(null); set(s => { s.puzzle.order = derange(n * n); }); Sound.play("swap"); }
  function tap(pos: number) {
    if (sel === null) { setSel(pos); Sound.play("tap"); }
    else if (sel === pos) setSel(null);
    else { const a = sel; setSel(null); swap(a, pos); }
  }

  const onDown = (e: RPE<HTMLDivElement>) => {
    if (P.solved || solving || (e.button && e.button > 0)) return;
    const el = (e.target as HTMLElement).closest(".tile") as HTMLButtonElement | null; if (!el) return;
    const id = +el.dataset.id!, pos = order.indexOf(id); if (id === pos) return;
    arm();
    drag.current = { id, el, pos, x0: e.clientX, y0: e.clientY, moved: false, pid: e.pointerId, rect: e.currentTarget.getBoundingClientRect() };
    try { el.setPointerCapture(e.pointerId); } catch { /* ignore */ }
  };
  const onMove = (e: RPE<HTMLDivElement>) => {
    const d = drag.current; if (!d || e.pointerId !== d.pid) return;
    const dx = e.clientX - d.x0, dy = e.clientY - d.y0;
    if (!d.moved && Math.hypot(dx, dy) > 9) { d.moved = true; d.el.classList.add("dragging"); setSel(null); }
    if (d.moved) { d.el.style.setProperty("--dx", String(dx)); d.el.style.setProperty("--dy", String(dy)); }
  };
  const endDrag = (d: Drag) => {
    d.el.classList.remove("dragging"); d.el.classList.add("landing");
    d.el.style.setProperty("--dx", "0"); d.el.style.setProperty("--dy", "0");
    setTimeout(() => d.el.classList.remove("landing"), 320);
  };
  const onUp = (e: RPE<HTMLDivElement>) => {
    const d = drag.current; if (!d || e.pointerId !== d.pid) return; drag.current = null;
    if (d.moved) {
      endDrag(d);
      const cell = d.rect.width / n, c = Math.floor((e.clientX - d.rect.left) / cell), r = Math.floor((e.clientY - d.rect.top) / cell);
      const tgt = c >= 0 && c < n && r >= 0 && r < n ? r * n + c : -1;
      if (tgt >= 0 && tgt !== d.pos && order[tgt] !== tgt) swap(d.pos, tgt);
    } else tap(d.pos);
  };
  const onCancel = () => { const d = drag.current; if (d) { drag.current = null; endDrag(d); } };
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const el = (e.target as HTMLElement).closest(".tile") as HTMLButtonElement | null; if (!el) return;
    const id = +el.dataset.id!, pos = order.indexOf(id);
    const mv: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -n, ArrowDown: n };
    if (e.key in mv) {
      e.preventDefault();
      if ((e.key === "ArrowLeft" && pos % n === 0) || (e.key === "ArrowRight" && pos % n === n - 1)) return;
      const np = pos + mv[e.key]; if (np < 0 || np >= n * n) return;
      tiles.current[order[np]]?.focus(); return;
    }
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (id !== pos && !P.solved) tap(pos); }
  };

  const showReveal = P.solved && !solving;
  return (
    <div className="stack screen-in">
      {!P.solved && <div className="say say-sm"><Lumi /><div className="bubble"><p>{fr(INSTR)}</p><ListenButton id="puzzle" text={INSTR} /></div></div>}
      <div className="pz-count">
        <span aria-live="polite">Pièces à leur place : <b>{ok}</b> sur {n * n}</span>
        <span className="pz-bar"><i style={{ width: (ok / (n * n) * 100) + "%" }} /></span>
      </div>
      <div className="board-wrap">
        <div className={"board" + (P.solved ? " solved" : "")} style={{ ["--n" as string]: n }} role="group" aria-label={`Puzzle de ${n * n} pièces`}
          onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onCancel} onKeyDown={onKey}>
          {img && order.length > 0 && Array.from({ length: n * n }, (_, id) => {
            const pos = order.indexOf(id), r = Math.floor(pos / n), c = pos % n, good = id === pos;
            const tr = Math.floor(id / n), tc = id % n;
            return (
              <button key={id} type="button" data-id={id} ref={el => { tiles.current[id] = el; }} tabIndex={P.solved ? -1 : 0}
                className={"tile" + (good ? " locked" : "") + (sel === pos ? " sel" : "") + (flash[id] ? ` flash f${flash[id] % 2}` : "")}
                style={{ ["--x" as string]: c, ["--y" as string]: r }}
                aria-pressed={sel === pos} aria-label={`${good ? "Pièce bien placée" : "Pièce à déplacer"}, ligne ${r + 1}, colonne ${c + 1}`}>
                <span className="tile-img" style={{ backgroundImage: `url("${img}")`, backgroundSize: `${n * 100}% ${n * 100}%`, backgroundPosition: `${n > 1 ? tc / (n - 1) * 100 : 0}% ${n > 1 ? tr / (n - 1) * 100 : 0}%` }} />
              </button>
            );
          })}
        </div>
        {img && <div className={"peek" + (peek ? " on" : "")} style={{ backgroundImage: `url("${img}")` }} aria-hidden="true" />}
      </div>
      {showReveal ? (
        <div className="page reveal">
          <span className="eyebrow">Mystère résolu</span>
          <h2 className="reveal-name">{fr(`C'est ${itsName(content.title)} !`)}</h2>
          <p>{fr((st.guess.right ? "Tu avais bien deviné ! " : "Tu as rallumé l'image. ") + content.puzzle.reveal)}</p>
          <ListenButton id="reveal" text={`C'est ${content.title} ! ${content.puzzle.reveal}`} />
          <button type="button" className="btn btn-gold attn" onClick={() => go("story")}><Icon name="book" />Découvrir son histoire</button>
        </div>
      ) : !P.solved && (
        <div className="tools">
          <button type="button" className={"tool hl" + (hot ? " attn" : "")} onClick={hint}><Icon name="bulb" size={24} /><span>Aide de Lumi</span></button>
          <button type="button" className="tool" onClick={showPeek}><Icon name="eye" size={24} /><span>Voir l'image</span></button>
          <button type="button" className="tool" onClick={shuffle}><Icon name="restart" size={24} /><span>Mélanger</span></button>
        </div>
      )}
    </div>
  );
}
