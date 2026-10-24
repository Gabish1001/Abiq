import { useRef, useState } from "react";
import { api, errorMessage } from "@/lib";
import { useLoad } from "@/lib/hooks";
import { MAX_UPLOAD, shrinkImage } from "@/lib/image";
import { allArtKeys } from "@/art";
import { AdultShell, PageTitle } from "@/ui/AdultShell";
import { ArtImg, Icon, Spinner } from "@/ui/kit";
import { AdminNav } from "./AdminNav";

const kb = (n?: number) => n == null ? "" : n > 1e6 ? `${(n / 1e6).toFixed(1)} Mo` : `${Math.round(n / 1e3)} Ko`;

export function AdminMedia() {
  const q = useLoad(() => api.listMedia(), []);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [showArt, setShowArt] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true); setErr(null);
    try {
      for (const f of Array.from(files)) {
        if (!f.type.startsWith("image/")) throw new Error(`« ${f.name} » n'est pas une image.`);
        const s = await shrinkImage(f);
        if (s.size > MAX_UPLOAD) throw new Error(`« ${f.name} » est trop lourde (5 Mo maximum).`);
        await api.uploadMedia(s);
      }
      q.reload();
    } catch (e) { setErr(errorMessage(e)); } finally { setBusy(false); if (input.current) input.current.value = ""; }
  };

  return (
    <AdultShell>
      <PageTitle title="Médias" sub="Images importées pour remplacer les illustrations dessinées par l'application.">
        <button type="button" className="a-btn primary" disabled={busy} onClick={() => input.current?.click()}><Icon name="upload" size={18} />{busy ? "Envoi…" : "Importer des images"}</button>
        <input ref={input} type="file" accept="image/*" multiple hidden onChange={e => upload(e.target.files)} />
      </PageTitle>
      <AdminNav />
      <div className="info" style={{ margin: "14px 0" }}>Les images sont réduites automatiquement (1600 px, WebP) pour rester légères sur les connexions mobiles. Utilisez des illustrations dont vous avez les droits, sans photo d'enfant identifiable.</div>
      {err && <p className="err">{err}</p>}
      {q.loading && !q.data ? <Spinner /> : q.error ? <p className="err">{q.error}</p> : q.data!.length === 0 ? <p className="muted">Aucune image importée pour l'instant. Vous pouvez aussi importer une image directement depuis l'éditeur d'une page.</p> : (
        <div className="media-grid">
          {q.data!.map(m => (
            <figure key={m.name}>
              <img src={m.url} alt="" loading="lazy" />
              <figcaption>
                <span>{m.name}</span>
                <span className="muted">{kb(m.size)}</span>
                <span className="row" style={{ gap: 6 }}>
                  <button type="button" className="a-btn sm" onClick={async () => { try { await navigator.clipboard.writeText(m.url); setCopied(m.name); setTimeout(() => setCopied(null), 1500); } catch { /* copie impossible */ } }}><Icon name="copy" size={14} />{copied === m.name ? "Copié" : "Lien"}</button>
                  <button type="button" className="a-btn sm ghost-danger" aria-label={`Supprimer ${m.name}`} onClick={async () => { if (!confirmDelete(m.name)) return; try { await api.deleteMedia(m.name); q.reload(); } catch (e) { setErr(errorMessage(e)); } }}><Icon name="trash" size={14} /></button>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      )}

      <h2 className="a-h2">Illustrations intégrées</h2>
      <p className="muted" style={{ marginTop: 0 }}>Dessinées par l'application, sans téléchargement : elles s'affichent même avec une connexion lente. Le nom sert à les choisir dans l'éditeur.</p>
      {!showArt ? <button type="button" className="a-btn" onClick={() => setShowArt(true)}><Icon name="image" size={18} />Afficher les {allArtKeys().length} illustrations</button> : (
        <div className="media-grid">
          {allArtKeys().map(k => <figure key={k}><ArtImg art={k} alt={k} /><figcaption>{k}</figcaption></figure>)}
        </div>
      )}
    </AdultShell>
  );
}

// Fenêtre de confirmation native : évite une suppression accidentelle d'une image utilisée.
function confirmDelete(name: string) {
  return window.confirm(`Supprimer « ${name} » ? Les pages qui l'utilisent afficheront de nouveau leur illustration dessinée.`);
}
