import { useEffect, useState } from "react";
import { ArtImg, Icon, ListenButton, fr } from "@/ui/kit";
import { useCoach } from "../Coach";
import { Sound } from "../sound";
import { Voice } from "../voice";
import type { PlayerEnv } from "../LevelPlayer";

const PRAISE = ["Bravo !", "C'est ça !", "Exactement !", "Bien joué !", "Super !"];

export function Quiz({ env }: { env: PlayerEnv }) {
  const { st, set, content, go } = env;
  const coach = useCoach();
  const Q = st.quiz, i = Q.i, q = content.quiz[i], done = Q.done[i];
  const [fb, setFb] = useState<{ praise?: string; try?: string; n: number }>({ n: 0 });
  const [shake, setShake] = useState<string | null>(null);
  const [hot, setHot] = useState(false);
  const last = i === content.quiz.length - 1;

  const next = () => {
    coach.close(); Voice.stop(); setFb({ n: 0 }); setHot(false);
    if (!last) { set(s => { s.quiz.i++; s.quiz.seq = []; }); Sound.play("tap"); env.viewRef.current?.scrollTo({ top: 0 }); }
    else go("reward");
  };

  // Retour de Lumi : succès, conseil après une erreur, ou rien
  useEffect(() => {
    if (done) coach.show({ kind: "good", title: fb.praise || PRAISE[(i + Q.wrong[i]) % PRAISE.length], text: q.explain, refText: q.ref,
      acts: [{ label: last ? "Voir ma récompense" : "Question suivante", onClick: next, cls: "btn-green", icon: "next", end: true }] });
    else if (fb.try) coach.show({ kind: "try", title: "Essaie encore !", text: fb.try, acts: [{ label: "J'essaie encore", onClick: () => { setFb(f => ({ ...f, try: undefined })); coach.close(); } }] });
  }, [done, fb.n, i]); // eslint-disable-line react-hooks/exhaustive-deps

  // Après un moment d'hésitation, l'indice se met à briller
  useEffect(() => {
    setHot(false);
    if (done || Q.hinted[i]) return;
    const t = setTimeout(() => setHot(true), 14000);
    return () => clearTimeout(t);
  }, [i, done, Q.hinted[i]]); // eslint-disable-line react-hooks/exhaustive-deps

  const praise = () => PRAISE[(i + Q.wrong[i]) % PRAISE.length];
  const answer = (k: number) => {
    if (q.type !== "choice" || done || Q.picked[i].includes(k)) return;
    Voice.stop();
    if (k === q.correct) { set(s => { s.quiz.done[i] = true; }); setFb(f => ({ praise: praise(), n: f.n + 1 })); Sound.play("good"); }
    else {
      set(s => { s.quiz.picked[i].push(k); s.quiz.wrong[i]++; });
      setFb(f => ({ try: q.hints[String(k)] || "Regarde bien la question et essaie une autre réponse.", n: f.n + 1 }));
      Sound.play("soft"); setShake("o" + k); setTimeout(() => setShake(null), 500);
    }
  };
  const pick = (id: number) => {
    if (q.type !== "order" || done || Q.seq.includes(id)) return;
    Voice.stop();
    const exp = Q.seq.length;
    if (id === exp) {
      const complete = exp + 1 === q.items.length;
      set(s => { s.quiz.seq.push(id); if (complete) s.quiz.done[i] = true; });
      if (complete) { setFb(f => ({ praise: praise(), n: f.n + 1 })); Sound.play("good"); } else { coach.close(); Sound.play("place"); }
    } else {
      set(s => { s.quiz.wrong[i]++; });
      setFb(f => ({ try: q.tries[exp] || "Regarde bien les images.", n: f.n + 1 }));
      Sound.play("soft"); setShake("c" + id); setTimeout(() => setShake(null), 500);
    }
  };
  const askHint = () => {
    if (done) return;
    set(s => { s.quiz.hinted[i] = true; }); setHot(false); Sound.play("tap");
    coach.show({ kind: "tip", title: "L'indice de Lumi", text: q.clue, acts: [{ label: "Merci Lumi !", onClick: coach.close }] });
  };
  const speech = q.type === "choice" ? q.prompt + " " + q.options.map((o, k) => `${"ABC"[k]} : ${o}.`).join(" ") : q.prompt;

  return (
    <div className="stack screen-in" key={i}>
      <div className="quiz-head">
        <span className="eyebrow">Question {i + 1} sur {content.quiz.length}</span>
        <div className="qdots" aria-hidden="true">{content.quiz.map((_, k) => <span key={k} className={(Q.done[k] ? "ok " : "") + (k === i ? "cur" : "")} />)}</div>
      </div>
      <div className="page q-card">
        <h2 className="q-text">{fr(q.prompt)}</h2>
        <div className="q-actions">
          <ListenButton id={"quiz-" + i} text={speech} />
          {!done && <button type="button" className={"hintbtn" + (Q.hinted[i] ? " used" : "") + (hot ? " attn" : "")} onClick={askHint}>
            <Icon name="bulb" size={18} /><span>{Q.hinted[i] ? "Revoir l'indice" : "Indice de Lumi"}</span></button>}
        </div>
      </div>
      {q.type === "choice" ? (
        <div className="options" role="group" aria-label="Réponses">
          {q.options.map((o, k) => {
            const wrong = Q.picked[i].includes(k), right = done && k === q.correct;
            return <button key={k} type="button" className={"opt" + (wrong ? " wrong" : "") + (right ? " right" : "") + (shake === "o" + k ? " shake" : "")} aria-disabled={wrong || done} onClick={() => answer(k)}>
              <span className="tag">{right ? <Icon name="check" size={20} /> : "ABC"[k]}</span><span>{fr(o)}</span></button>;
          })}
        </div>
      ) : (
        <div className="order" role="group" aria-label="Images à remettre dans l'ordre">
          {q.show.map(id => {
            const it = q.items[id], nn = Q.seq.indexOf(id), placed = nn >= 0;
            return <button key={id} type="button" className={"ocard" + (placed ? " picked" : "") + (shake === "c" + id ? " shake" : "")} aria-disabled={placed || done} onClick={() => pick(id)}>
              {placed && <span className="num">{nn + 1}</span>}
              <ArtImg art={it.art} image={it.image} alt="" />
              <span>{fr(it.label)}</span></button>;
          })}
        </div>
      )}
    </div>
  );
}
