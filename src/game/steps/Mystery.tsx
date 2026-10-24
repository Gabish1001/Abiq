import { useEffect, useRef, useState } from "react";
import { drawMystery, mysteryHead } from "@/art";
import { Icon, ListenButton, Lumi, fr } from "@/ui/kit";
import { useCoach } from "../Coach";
import { Sound } from "../sound";
import { Voice } from "../voice";
import type { PlayerEnv } from "../LevelPlayer";

const LINES = {
  one: "Tu as une idée ? Touche « Je sais qui c'est ! » pour répondre, ou regarde un autre indice.",
  three: "Qui suis-je ? Réponds, ou fais le puzzle pour rallumer l'image et le découvrir !",
  ok: "Bien deviné ! Rallume l'image avec le puzzle pour vérifier."
};

export function Mystery({ env }: { env: PlayerEnv }) {
  const { st, set, content, levelId, go } = env;
  const M = content.mystery;
  const coach = useCoach();
  const cv = useRef<HTMLCanvasElement>(null);
  const zone = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [shake, setShake] = useState<number | null>(null);
  const k = st.clues, G = st.guess;

  useEffect(() => { if (cv.current) drawMystery(cv.current, levelId, k); }, [levelId, k]);
  const line = G.right ? LINES.ok : k >= 3 ? LINES.three : k >= 1 ? LINES.one : M.intro;
  const scrollZone = () => setTimeout(() => zone.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);

  const reveal = () => {
    if (k >= 3 || G.right) return;
    coach.close();
    set(s => { s.clues = Math.min(3, s.clues + 1); });
    Sound.play(k + 1 === 3 ? "good" : "place");
    Voice.speak(M.clues[k], { key: "clue" });
    scrollZone();
  };
  const toPuzzle = () => { coach.close(); go("puzzle"); };
  const guess = (j: number) => {
    if (G.right || G.picked.includes(j)) return;
    Voice.stop();
    if (j === M.guess.correct) {
      set(s => { s.guess.right = true; s.guess.at = s.clues; });
      setOpen(false); Sound.play("good");
      coach.show({ kind: "good", title: "Bien deviné !", text: `Tu crois que c'est ${M.guess.options[j]} ? Rallume l'image avec le puzzle pour vérifier.`, acts: [{ label: "Faire le puzzle", onClick: toPuzzle, cls: "btn-gold", icon: "puzzle" }] });
    } else {
      set(s => { s.guess.picked.push(j); });
      Sound.play("soft"); setShake(j); setTimeout(() => setShake(null), 500);
      const more = k < 3;
      coach.show({
        kind: "try", title: "Pas encore !", text: (M.guess.hints[String(j)] || "Ce n'est pas ce personnage.") + (more ? " Regarde un autre indice." : " Fais le puzzle pour le découvrir."),
        acts: more ? [{ label: "Voir un indice", onClick: reveal, cls: "btn-gold", icon: "eye" }, { label: "Réessayer", onClick: coach.close }]
                   : [{ label: "Faire le puzzle", onClick: toPuzzle, cls: "btn-gold", icon: "puzzle" }, { label: "Réessayer", onClick: coach.close }]
      });
    }
  };
  const [hx, hy] = mysteryHead(levelId);

  return (
    <div className="stack screen-in">
      <div className="say say-sm"><Lumi /><div className="bubble"><p>{fr(line)}</p><ListenButton id="mystery" text={line} /></div></div>
      <div className="page mys-frame">
        <div className="mys-box">
          <canvas ref={cv} width={800} height={800} role="img" aria-label="Une page effacée. Des formes sombres apparaissent à chaque indice." />
          <span className="mys-q" style={{ left: hx * 100 + "%", top: hy * 100 + "%" }} aria-hidden="true">?</span>
        </div>
      </div>
      <ol className="clues">
        {M.clues.map((t, i) => {
          if (i < k) return <li key={i} className="clue open"><span className="clue-n">{i + 1}</span><span>{fr(t)}</span></li>;
          if (i === k && !G.right) {
            const hot = k === 0;
            return <li key={i}><button type="button" className={"clue next" + (hot ? " attn" : "")} onClick={reveal}>
              {hot && <span className="poke">Touche ici</span>}<span className="clue-n">{i + 1}</span><span>Voir l'indice {i + 1}</span><Icon name="eye" />
            </button></li>;
          }
          return <li key={i} className="clue locked"><span className="clue-n">{i + 1}</span><span>Indice {i + 1}</span></li>;
        })}
      </ol>
      <div ref={zone}>
        {G.right ? (
          <div className="page guess-q ok">
            <span className="eyebrow">Bien deviné !</span>
            <h3>{fr(G.at === 0 ? "Tu as trouvé sans aucun indice !" : `Tu as trouvé avec ${G.at} indice${G.at > 1 ? "s" : ""} seulement.`)} Rallume l'image pour vérifier.</h3>
            <button type="button" className="btn btn-gold attn" onClick={toPuzzle}><Icon name="puzzle" />Faire le puzzle</button>
          </div>
        ) : open ? (
          <div className="page guess-q">
            <h3>{fr("Qui se cache dans la page ?")}</h3>
            <div className="options" role="group" aria-label="Réponses">
              {M.guess.options.map((o, j) => {
                const w = G.picked.includes(j);
                return <button key={j} type="button" className={"opt" + (w ? " wrong" : "") + (shake === j ? " shake" : "")} aria-disabled={w} onClick={() => guess(j)}>
                  <span className="tag">{"ABC"[j]}</span><span>{fr(o)}</span></button>;
              })}
            </div>
            <ListenButton id="guess" text={"Qui se cache dans la page ? " + M.guess.options.map((o, j) => `${"ABC"[j]} : ${o}.`).join(" ")} />
          </div>
        ) : k >= 3 ? (
          <div className="guess">
            <button type="button" className="btn btn-gold attn" onClick={toPuzzle}><Icon name="puzzle" />Faire le puzzle</button>
            <button type="button" className="btn btn-ghost" onClick={() => { setOpen(true); Sound.play("tap"); scrollZone(); }}><Icon name="question" />Je sais qui c'est !</button>
          </div>
        ) : (
          <div className="guess">
            <button type="button" className={"btn " + (k >= 1 ? "btn-gold attn" : "btn-ghost")} onClick={() => { setOpen(true); Sound.play("tap"); scrollZone(); }}><Icon name="question" />Je sais qui c'est !</button>
            {k >= 1 && <button type="button" className="link-btn" onClick={toPuzzle}>Passer directement au puzzle</button>}
          </div>
        )}
      </div>
    </div>
  );
}
