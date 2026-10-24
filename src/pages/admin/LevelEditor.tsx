import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { api, errorMessage } from "@/lib";
import { useLoad } from "@/lib/hooks";
import { fmtDate, toLocalInput } from "@/lib/dates";
import { MAX_UPLOAD, shrinkImage } from "@/lib/image";
import type { Level, LevelVersion, Status } from "@/lib/types";
import type { ChoiceQuestion, LevelContent, OrderQuestion, Question } from "@/content/types";
import { VALUES } from "@/content";
import { allArtKeys } from "@/art";
import { AdultShell, Modal, PageTitle, StatusPill } from "@/ui/AdultShell";
import { ArtImg, Icon, Spinner } from "@/ui/kit";
import { LevelPlayer } from "@/game/LevelPlayer";
import { blankChoice, blankOrder, blankPage, checkContent, shuffleShow } from "./blank";

const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));
const ABC = "ABC";

/* ---------- petits champs ---------- */
function T({ label, value, onChange, max, hint, placeholder }: { label: string; value: string; onChange: (v: string) => void; max?: number; hint?: string; placeholder?: string }) {
  return <label className="field"><span>{label}</span><input value={value} onChange={e => onChange(e.target.value)} maxLength={max} placeholder={placeholder} />{hint && <small>{hint}</small>}</label>;
}
function A({ label, value, onChange, soft, hint, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; soft?: number; hint?: string; rows?: number }) {
  const over = soft && value.length > soft;
  return (
    <label className="field"><span>{label}</span>
      <textarea rows={rows} value={value} onChange={e => onChange(e.target.value)} style={{ minHeight: rows * 26 + 20 }} />
      <small style={over ? { color: "#8A2418" } : undefined}>{hint ? hint + " " : ""}{soft ? `${value.length}/${soft} caractères${over ? " : un peu long pour un enfant de 6-8 ans" : ""}` : ""}</small>
    </label>
  );
}

const ART_KEYS = allArtKeys();
function ArtField({ label, art, image, onChange }: { label: string; art: string; image?: string; onChange: (art: string, image?: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const upload = async (f: File | undefined) => {
    if (!f) return;
    setErr(null);
    if (!f.type.startsWith("image/")) { setErr("Choisissez une image (JPG, PNG ou WebP)."); return; }
    setBusy(true);
    try {
      const small = await shrinkImage(f);
      if (small.size > MAX_UPLOAD) throw new Error("Image trop lourde (5 Mo maximum).");
      onChange(art, await api.uploadMedia(small));
    } catch (e) { setErr(errorMessage(e)); } finally { setBusy(false); if (input.current) input.current.value = ""; }
  };
  return (
    <div className="field"><span>{label}</span>
      <div className="art-slot">
        <ArtImg art={art || undefined} image={image} alt="" />
        <div className="stack-a" style={{ gap: 8 }}>
          {image ? <div className="row"><span className="small muted">Image importée</span><button type="button" className="a-btn sm" onClick={() => onChange(art, undefined)}>Revenir à l'illustration</button></div>
            : <select className="input" value={art} onChange={e => onChange(e.target.value, image)} aria-label={`${label} : illustration`}>
                <option value="">Aucune illustration (point d'interrogation)</option>
                {ART_KEYS.map(k => <option key={k} value={k}>{k}</option>)}
              </select>}
          <div className="row">
            <button type="button" className="a-btn sm" disabled={busy} onClick={() => input.current?.click()}><Icon name="upload" size={16} />{busy ? "Envoi…" : "Importer une image"}</button>
            <input ref={input} type="file" accept="image/*" hidden onChange={e => upload(e.target.files?.[0])} />
          </div>
          {err && <span className="err small">{err}</span>}
        </div>
      </div>
    </div>
  );
}

function Item({ title, children, onUp, onDown, onDel }: { title: ReactNode; children: ReactNode; onUp?: () => void; onDown?: () => void; onDel?: () => void }) {
  return (
    <div className="ed-item">
      <div className="ed-item-h"><span>{title}</span><span className="row" style={{ gap: 4 }}>
        {onUp && <button type="button" className="icon-a" aria-label="Monter" onClick={onUp}><Icon name="up" size={16} /></button>}
        {onDown && <button type="button" className="icon-a" aria-label="Descendre" onClick={onDown}><Icon name="down" size={16} /></button>}
        {onDel && <button type="button" className="icon-a" aria-label="Supprimer" onClick={onDel}><Icon name="trash" size={16} /></button>}
      </span></div>
      {children}
    </div>
  );
}
const move = <T,>(a: T[], i: number, d: number) => { const j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; };

/* ---------- éditeur ---------- */
type Draft = Pick<Level, "id" | "world_id" | "position" | "status" | "release_at" | "content">;
const SECTIONS: [string, string][] = [["infos", "Infos"], ["mystere", "Mystère"], ["puzzle", "Puzzle"], ["histoire", "Histoire"], ["lecon", "Leçon"], ["quiz", "Quiz"], ["carte", "Carte"], ["teaser", "Teaser"], ["publication", "Publication"], ["historique", "Historique"]];

export function LevelEditor() {
  const { id } = useParams();
  const q = useLoad(async () => {
    const [level, worlds, versions] = await Promise.all([api.level(id!), api.worlds(), api.levelVersions(id!)]);
    if (!level) throw new Error("Page introuvable.");
    return { level, worlds, versions };
  }, [id]);
  const [d, setD] = useState<Draft | null>(null);
  const [dirty, setDirty] = useState(false);
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const [problems, setProblems] = useState<string[] | null>(null);
  const [preview, setPreview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [restoreFrom, setRestoreFrom] = useState<LevelVersion | null>(null);

  useEffect(() => {
    if (q.data) { const l = q.data.level; setD({ id: l.id, world_id: l.world_id, position: l.position, status: l.status, release_at: l.release_at, content: clone(l.content) }); setDirty(false); }
  }, [q.data]);
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    addEventListener("beforeunload", h); return () => removeEventListener("beforeunload", h);
  }, [dirty]);

  if (q.loading && !q.data) return <AdultShell><Spinner /></AdultShell>;
  if (q.error || !q.data || !d) return <AdultShell><p className="err">{q.error}</p><Link to="/admin/niveaux">Retour aux contenus</Link></AdultShell>;
  const c = d.content;
  const up = (fn: (c: LevelContent) => void) => { setD(x => { const n = clone(x!); fn(n.content); return n; }); setDirty(true); setMsg(null); };
  const upMeta = (patch: Partial<Draft>) => { setD(x => ({ ...x!, ...patch })); setDirty(true); setMsg(null); };

  const save = async (status: Status, defNote: string) => {
    if (status === "published" || status === "review") {
      const p = checkContent(c);
      if (p.length) { setProblems(p); return; }
    }
    setBusy(true); setMsg(null);
    try {
      const saved = await api.saveLevel({ ...d, status }, note.trim() || defNote);
      setD(x => ({ ...x!, status: saved.status })); setDirty(false); setNote("");
      setMsg({ ok: true, t: status === "published" ? "Page publiée." : status === "review" ? "Page envoyée en vérification." : status === "archived" ? "Page archivée : elle n'est plus visible." : "Brouillon enregistré." });
      q.setData({ ...q.data!, level: saved, versions: await api.levelVersions(d.id) });
    } catch (e) { setMsg({ ok: false, t: errorMessage(e) }); } finally { setBusy(false); }
  };

  return (
    <AdultShell>
      <PageTitle title={c.title || "Sans titre"} sub={`Page ${d.position} · identifiant « ${d.id} »`} back={{ to: "/admin/niveaux", label: "Contenus" }}>
        <StatusPill s={d.status} />
        <button type="button" className="a-btn" onClick={() => setPreview(true)}><Icon name="eye" size={18} />Essayer comme un enfant</button>
      </PageTitle>
      <div className="editor">
        <nav className="ed-nav" aria-label="Sections">{SECTIONS.map(([k, l]) => <a key={k} href={`#${k}`} onClick={e => { e.preventDefault(); document.getElementById(k)?.scrollIntoView({ behavior: "smooth" }); }}>{l}</a>)}</nav>
        <div className="stack-a" style={{ gap: 16 }}>

          <section id="infos" className="card form ed-sec">
            <h2 className="a-h3">Infos</h2>
            <div className="form-row">
              <T label="Personnage (nom affiché)" value={c.title} onChange={v => up(x => { x.title = v; })} max={40} />
              <label className="field"><span>Valeur à retenir</span><input list="values" value={c.value} onChange={e => up(x => { x.value = e.target.value; })} maxLength={40} /><datalist id="values">{VALUES.map(v => <option key={v} value={v} />)}</datalist></label>
            </div>
            <div className="form-row">
              <T label="Référence biblique" value={c.source} onChange={v => up(x => { x.source = v; })} max={60} placeholder="Ex. Genèse 6 à 9" />
              <label className="field"><span>Monde</span><select value={d.world_id} onChange={e => upMeta({ world_id: e.target.value })}>{q.data.worlds.map(w => <option key={w.id} value={w.id}>{w.title}</option>)}</select></label>
            </div>
            <div className="form-row">
              <label className="field"><span>Position dans le parcours</span><input type="number" min={1} max={99} value={d.position} onChange={e => upMeta({ position: Math.max(1, Number(e.target.value) || 1) })} /><small>Les enfants débloquent les pages dans cet ordre.</small></label>
              <label className="field"><span>Date de sortie</span><input type="datetime-local" value={toLocalInput(d.release_at)} onChange={e => upMeta({ release_at: e.target.value ? new Date(e.target.value).toISOString() : null })} /><small>Vide : disponible dès la publication. Conseil : une nouvelle page chaque dimanche.</small></label>
            </div>
            <A label="Note de traduction (sous la première page)" value={c.sourceNote} onChange={v => up(x => { x.sourceNote = v; })} rows={2} />
          </section>

          <section id="mystere" className="card form ed-sec">
            <h2 className="a-h3">Mystère</h2>
            <p className="muted small" style={{ margin: 0 }}>L'enfant découvre trois indices, un par un, et peut répondre à tout moment.</p>
            <A label="Introduction (lue par Lumi)" value={c.mystery.intro} onChange={v => up(x => { x.mystery.intro = v; })} soft={180} rows={2} />
            {c.mystery.clues.map((cl, i) => <T key={i} label={`Indice ${i + 1}`} value={cl} onChange={v => up(x => { x.mystery.clues[i] = v; })} max={120} hint={i === 0 ? "Écrit à la première personne : « J'ai construit… »" : undefined} />)}
            <div className="field"><span>Qui se cache ? Trois réponses, cochez la bonne</span>
              {c.mystery.guess.options.map((o, i) => (
                <div key={i} className="stack-a" style={{ gap: 6 }}>
                  <div className="row"><input type="radio" name="guess" checked={c.mystery.guess.correct === i} onChange={() => up(x => { x.mystery.guess.correct = i; })} aria-label={`Réponse ${ABC[i]} correcte`} /><input className="input" style={{ flex: 1 }} value={o} onChange={e => up(x => { x.mystery.guess.options[i] = e.target.value; })} placeholder={`Réponse ${ABC[i]}`} maxLength={30} /></div>
                  {c.mystery.guess.correct !== i && <input className="input small" value={c.mystery.guess.hints[String(i)] || ""} onChange={e => up(x => { x.mystery.guess.hints[String(i)] = e.target.value; })} placeholder="Conseil si l'enfant choisit cette réponse (bienveillant)" maxLength={160} />}
                </div>
              ))}
            </div>
          </section>

          <section id="puzzle" className="card form ed-sec">
            <h2 className="a-h3">Puzzle</h2>
            <ArtField label="Image du puzzle (carrée de préférence)" art={c.puzzle.art} image={c.puzzle.image} onChange={(a, im) => up(x => { x.puzzle.art = a; x.puzzle.image = im; })} />
            <T label="Description de l'image (accessibilité)" value={c.puzzle.alt} onChange={v => up(x => { x.puzzle.alt = v; })} max={200} />
            <A label="Phrase révélée quand le puzzle est fini" value={c.puzzle.reveal} onChange={v => up(x => { x.puzzle.reveal = v; })} soft={120} rows={2} />
          </section>

          <section id="histoire" className="card form ed-sec">
            <h2 className="a-h3">Histoire ({c.story.length} pages)</h2>
            <p className="muted small" style={{ margin: 0 }}>De 4 à 6 pages. Des phrases courtes, au passé simple ou au présent, fidèles au texte biblique.</p>
            {c.story.map((s, i) => (
              <Item key={i} title={`Page ${i + 1}`} onUp={i > 0 ? () => up(x => move(x.story, i, -1)) : undefined} onDown={i < c.story.length - 1 ? () => up(x => move(x.story, i, 1)) : undefined} onDel={c.story.length > 1 ? () => up(x => { x.story.splice(i, 1); }) : undefined}>
                <div className="form-row"><T label="Titre" value={s.title} onChange={v => up(x => { x.story[i].title = v; })} max={60} /><T label="Référence" value={s.ref} onChange={v => up(x => { x.story[i].ref = v; })} max={40} placeholder="Ex. Genèse 6.13-22" /></div>
                <A label="Texte" value={s.text} onChange={v => up(x => { x.story[i].text = v; })} soft={280} rows={4} />
                <ArtField label="Illustration" art={s.art} image={s.image} onChange={(a, im) => up(x => { x.story[i].art = a; x.story[i].image = im; })} />
                <T label="Description de l'image" value={s.alt} onChange={v => up(x => { x.story[i].alt = v; })} max={200} />
              </Item>
            ))}
            {c.story.length < 8 && <div className="row"><button type="button" className="a-btn" onClick={() => up(x => { x.story.push(blankPage(x.story.length + 1)); })}><Icon name="plus" size={18} />Ajouter une page</button></div>}
          </section>

          <section id="lecon" className="card form ed-sec">
            <h2 className="a-h3">Leçon</h2>
            <A label="Ce que Dieu nous apprend" value={c.lesson.text} onChange={v => up(x => { x.lesson.text = v; })} soft={220} rows={3} />
            <T label="Verset ou référence" value={c.lesson.ref} onChange={v => up(x => { x.lesson.ref = v; })} max={60} />
          </section>

          <section id="quiz" className="card form ed-sec">
            <h2 className="a-h3">Quiz ({c.quiz.length} questions)</h2>
            <p className="muted small" style={{ margin: 0 }}>Cinq questions conseillées, dont une à remettre dans l'ordre. Les conseils après une erreur restent toujours encourageants.</p>
            {c.quiz.map((qq, i) => (
              <Item key={qq.id} title={<>Question {i + 1} <span className="muted small">· {qq.type === "choice" ? "choix" : "ordre"}</span></>} onUp={i > 0 ? () => up(x => move(x.quiz, i, -1)) : undefined} onDown={i < c.quiz.length - 1 ? () => up(x => move(x.quiz, i, 1)) : undefined} onDel={c.quiz.length > 1 ? () => up(x => { x.quiz.splice(i, 1); }) : undefined}>
                <QuestionEditor q={qq} onChange={fn => up(x => fn(x.quiz[i]))} />
              </Item>
            ))}
            <div className="row">
              <button type="button" className="a-btn" onClick={() => up(x => { x.quiz.push(blankChoice(x.quiz.length + 1)); })}><Icon name="plus" size={18} />Question à choix</button>
              <button type="button" className="a-btn" onClick={() => up(x => { x.quiz.push(blankOrder(x.quiz.length + 1)); })}><Icon name="plus" size={18} />Question d'ordre</button>
            </div>
          </section>

          <section id="carte" className="card form ed-sec">
            <h2 className="a-h3">Carte à collectionner</h2>
            <ArtField label="Image de la carte" art={c.card.art} image={c.card.image} onChange={(a, im) => up(x => { x.card.art = a; x.card.image = im; })} />
            <A label="Texte de la carte" value={c.card.text} onChange={v => up(x => { x.card.text = v; })} soft={120} rows={2} />
            <T label="Description de l'image" value={c.card.alt} onChange={v => up(x => { x.card.alt = v; })} max={200} />
          </section>

          <section id="teaser" className="card form ed-sec">
            <h2 className="a-h3">Teaser de la prochaine aventure</h2>
            <p className="muted small" style={{ margin: 0 }}>Affiché à la fin de la page <b>précédente</b> pour donner envie de revenir.</p>
            <ArtField label="Silhouette mystère" art={c.teaser.art} image={c.teaser.image} onChange={(a, im) => up(x => { x.teaser.art = a; x.teaser.image = im; })} />
            <A label="Phrase mystère" value={c.teaser.text} onChange={v => up(x => { x.teaser.text = v; })} soft={120} rows={2} />
          </section>

          <section id="publication" className="card form ed-sec">
            <h2 className="a-h3">Publication</h2>
            <div className="row"><span>État actuel :</span><StatusPill s={d.status} />{d.release_at && <span className="muted small">Sortie le {fmtDate(d.release_at, true)}</span>}</div>
            <T label="Note de modification (pour l'historique)" value={note} onChange={setNote} max={140} placeholder="Ex. Correction de la référence de la page 3" />
          </section>

          <section id="historique" className="card ed-sec">
            <h2 className="a-h3">Historique</h2>
            {q.data.versions.length === 0 ? <p className="muted">Aucune version enregistrée.</p> : q.data.versions.map(v => (
              <div key={v.id} className="version">
                <div className="row between"><span><StatusPill s={v.status} /> <b>{fmtDate(v.changed_at, true)}</b></span><button type="button" className="a-btn sm" onClick={() => setRestoreFrom(v)}><Icon name="history" size={16} />Reprendre ce contenu</button></div>
                <span className="muted small">{v.note || "Sans note"}</span>
              </div>
            ))}
          </section>
        </div>
      </div>

      <div className="ed-bar"><div className="row" style={{ maxWidth: 1100, margin: "0 auto" }}>
        {msg ? <span className={msg.ok ? "ok-msg" : "err"} role="status">{msg.t}</span> : dirty ? <span className="muted small">Modifications non enregistrées</span> : <span className="muted small">Tout est enregistré</span>}
        <span style={{ flex: 1 }} />
        <button type="button" className="a-btn" disabled={busy} onClick={() => save(d.status === "published" ? "published" : d.status === "archived" ? "draft" : d.status, "Enregistrement")}>{d.status === "published" ? "Enregistrer (reste publiée)" : "Enregistrer"}</button>
        {d.status !== "review" && d.status !== "published" && <button type="button" className="a-btn" disabled={busy} onClick={() => save("review", "Envoi en vérification")}><Icon name="send" size={16} />Envoyer en vérification</button>}
        {d.status !== "published" && <button type="button" className="a-btn primary" disabled={busy} onClick={() => save("published", "Publication")}><Icon name="check" size={16} />Publier</button>}
        {d.status === "published" && <button type="button" className="a-btn" disabled={busy} onClick={() => save("draft", "Retour en brouillon")}>Dépublier</button>}
        {d.status !== "archived" && <button type="button" className="a-btn ghost-danger" disabled={busy} onClick={() => save("archived", "Archivage")}><Icon name="archive" size={16} />Archiver</button>}
      </div></div>

      {problems && (
        <Modal title="À compléter avant de continuer" onClose={() => setProblems(null)}>
          <p className="muted">Pour qu'un enfant ne tombe jamais sur une case vide, complétez :</p>
          <ul>{problems.slice(0, 14).map(p => <li key={p}>{p}</li>)}</ul>
          {problems.length > 14 && <p className="muted small">… et {problems.length - 14} autre(s).</p>}
          <div className="row"><button type="button" className="a-btn primary" onClick={() => setProblems(null)}>Compris</button></div>
        </Modal>
      )}
      {restoreFrom && (
        <Modal title="Reprendre une ancienne version" onClose={() => setRestoreFrom(null)}>
          <p>Le contenu du {fmtDate(restoreFrom.changed_at, true)} va remplacer celui de l'éditeur. Rien n'est enregistré tant que vous ne cliquez pas sur « Enregistrer ».</p>
          <div className="row"><button type="button" className="a-btn primary" onClick={() => { up(x => Object.assign(x, clone(restoreFrom.content))); setRestoreFrom(null); }}>Reprendre</button><button type="button" className="a-btn" onClick={() => setRestoreFrom(null)}>Annuler</button></div>
        </Modal>
      )}
      {preview && (
        <div className="preview-frame kid">
          <LevelPlayer variant="preview" levelId={d.id} content={c} title="Aperçu" settings={{ sound: true, voice: true, puzzleN: 3 }} next={null} onExit={() => setPreview(false)} />
        </div>
      )}
    </AdultShell>
  );
}

function QuestionEditor({ q, onChange }: { q: Question; onChange: (fn: (q: Question) => void) => void }) {
  const common = (
    <>
      <div className="form-row">
        <T label="Libellé court (bilans adultes)" value={q.short} onChange={v => onChange(x => { x.short = v; })} max={40} placeholder="Ex. La colombe" />
        <T label="Référence" value={q.ref} onChange={v => onChange(x => { x.ref = v; })} max={40} />
      </div>
      <A label="Question" value={q.prompt} onChange={v => onChange(x => { x.prompt = v; })} soft={140} rows={2} />
    </>
  );
  const tail = (
    <>
      <A label="Indice de Lumi (avant de répondre)" value={q.clue} onChange={v => onChange(x => { x.clue = v; })} soft={140} rows={2} />
      <A label="Explication après la bonne réponse" value={q.explain} onChange={v => onChange(x => { x.explain = v; })} soft={200} rows={2} />
    </>
  );
  if (q.type === "choice") {
    const cq = q as ChoiceQuestion;
    return (
      <>
        {common}
        <div className="field"><span>Réponses (cochez la bonne)</span>
          {cq.options.map((o, k) => (
            <div key={k} className="stack-a" style={{ gap: 6 }}>
              <div className="row"><input type="radio" name={`c-${q.id}`} checked={cq.correct === k} onChange={() => onChange(x => { (x as ChoiceQuestion).correct = k; })} aria-label={`Réponse ${ABC[k]} correcte`} /><input className="input" style={{ flex: 1 }} value={o} onChange={e => onChange(x => { (x as ChoiceQuestion).options[k] = e.target.value; })} placeholder={`Réponse ${ABC[k]}`} maxLength={60} /></div>
              {cq.correct !== k && <input className="input small" value={cq.hints[String(k)] || ""} onChange={e => onChange(x => { (x as ChoiceQuestion).hints[String(k)] = e.target.value; })} placeholder="Conseil si l'enfant choisit cette réponse" maxLength={180} />}
            </div>
          ))}
        </div>
        {tail}
      </>
    );
  }
  const oq = q as OrderQuestion;
  return (
    <>
      {common}
      <div className="field"><span>Images, dans le bon ordre</span>
        {oq.items.map((it, k) => (
          <div key={k} className="ed-item" style={{ background: "#fff" }}>
            <div className="ed-item-h"><span>{k + 1}{k === 0 ? " (en premier)" : ""}</span>
              {oq.items.length > 2 && <button type="button" className="icon-a" aria-label="Retirer cette image" onClick={() => onChange(x => { const o = x as OrderQuestion; o.items.splice(k, 1); o.tries.splice(k, 1); o.show = shuffleShow(o.items.length); })}><Icon name="trash" size={16} /></button>}
            </div>
            <T label="Étiquette" value={it.label} onChange={v => onChange(x => { (x as OrderQuestion).items[k].label = v; })} max={40} />
            <ArtField label="Image" art={it.art} image={it.image} onChange={(a, im) => onChange(x => { const t = (x as OrderQuestion).items[k]; t.art = a; t.image = im; })} />
            <T label={k === 0 ? "Conseil si l'enfant ne commence pas par cette image" : "Conseil si l'enfant se trompe à cette étape"} value={oq.tries[k] || ""} onChange={v => onChange(x => { (x as OrderQuestion).tries[k] = v; })} max={160} />
          </div>
        ))}
        <div className="row">
          {oq.items.length < 4 && <button type="button" className="a-btn sm" onClick={() => onChange(x => { const o = x as OrderQuestion; o.items.push({ label: "", art: "" }); o.tries.push(""); o.show = shuffleShow(o.items.length); })}><Icon name="plus" size={16} />Ajouter une image</button>}
          <button type="button" className="a-btn sm" onClick={() => onChange(x => { const o = x as OrderQuestion; o.show = shuffleShow(o.items.length); })}><Icon name="restart" size={16} />Mélanger l'affichage</button>
          <span className="muted small">Affichées à l'enfant dans l'ordre : {oq.show.map(n => n + 1).join(", ")}</span>
        </div>
      </div>
      {tail}
    </>
  );
}
