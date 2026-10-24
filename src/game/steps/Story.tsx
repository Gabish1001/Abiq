import { useEffect, useRef } from "react";
import { ArtImg, Icon, ListenButton, fr } from "@/ui/kit";
import { Sound } from "../sound";
import { Voice } from "../voice";
import type { PlayerEnv } from "../LevelPlayer";

function Words({ text, id }: { text: string; id: string }) {
  let pos = 0;
  return <p className="story-text" id={id}>{fr(text).split(/( +)/).map((tok, i) => {
    const start = pos; pos += tok.length;
    return tok && !/^ +$/.test(tok) ? <span key={i} className="w" data-s={start}>{tok}</span> : tok;
  })}</p>;
}

export function Story({ env }: { env: PlayerEnv }) {
  const { st, set, content, go, viewRef } = env;
  const i = Math.min(st.story.page, content.story.length - 1);
  const p = content.story[i], last = i === content.story.length - 1;
  const textId = "story-text";
  const sx = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => { if (!st.story.seen.includes(i)) set(s => { s.story.seen.push(i); }); }, [i]); // eslint-disable-line react-hooks/exhaustive-deps

  const clear = () => document.querySelectorAll(`#${textId} .w.on`).forEach(w => w.classList.remove("on"));
  const highlight = (ci: number) => {
    if (ci < 0) return;
    let hit: Element | null = null;
    document.querySelectorAll(`#${textId} .w`).forEach(w => { if (+(w as HTMLElement).dataset.s! <= ci) hit = w; });
    clear(); if (hit) (hit as Element).classList.add("on");
  };
  const page = (d: number) => {
    const np = i + d; if (np < 0 || np >= content.story.length) return;
    Voice.stop(); clear(); Sound.play("tap");
    set(s => { s.story.page = np; });
    viewRef.current?.scrollTo({ top: 0 });
  };
  const offset = p.title.length + 2;

  return (
    <div className="stack screen-in">
      <article className="page story-page"
        onPointerDown={e => { if ((e.target as HTMLElement).closest("button")) return; sx.current = { x: e.clientX, y: e.clientY }; }}
        onPointerUp={e => { const s0 = sx.current; sx.current = null; if (!s0) return; const dx = e.clientX - s0.x, dy = e.clientY - s0.y; if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) page(dx < 0 ? 1 : -1); }}>
        <ArtImg className="story-img" art={p.art} image={p.image} alt={p.alt} />
        <div className="story-body">
          <div className="story-meta"><span className="ref">{p.ref}</span><span>Page {i + 1} sur {content.story.length}</span></div>
          <h2>{fr(p.title)}</h2>
          <Words text={p.text} id={textId} />
          <ListenButton id={"story-" + i} text={`${p.title}. ${p.text}`} onWord={ci => highlight(ci - offset)} onEnd={clear}
            onStart={() => { if (!st.story.heard.includes(i)) set(s => { s.story.heard.push(i); }); }} />
        </div>
      </article>
      {last && (
        <div className="lesson">
          <span className="lesson-ic"><Icon name="star" size={22} fill /></span>
          <div><span className="eyebrow">À retenir · {content.value}</span><p>{fr(content.lesson.text)}</p><span className="ref">{content.lesson.ref}</span></div>
        </div>
      )}
      <nav className="story-nav" aria-label="Pages de l'histoire">
        <button type="button" className="icon-btn big" disabled={i === 0} onClick={() => page(-1)} aria-label="Page précédente"><Icon name="back" /></button>
        <div className="dots" aria-hidden="true">{content.story.map((_, k) => <span key={k} className={k === i ? "on" : k < i ? "past" : ""} />)}</div>
        {last
          ? <button type="button" className="btn btn-gold btn-auto attn" onClick={() => go("quiz")}>Au quiz<Icon name="next" /></button>
          : <button type="button" className="icon-btn big go" onClick={() => page(1)} aria-label="Page suivante"><Icon name="next" /></button>}
      </nav>
      {i === 0 && <p className="note">{fr(content.sourceNote)}</p>}
    </div>
  );
}
