import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, errorMessage } from "@/lib";
import { ls } from "@/lib/hooks";
import type { JoinInfo } from "@/lib/types";
import { Avatar, Icon, Lumi, fr } from "@/ui/kit";
import { KidShell } from "@/pages/kid/KidShell";
import { DEVICE_KEY, type DeviceSession } from "@/pages/kid/SessionPlay";

/** Rejoindre une séance avec le code donné par l'animateur, puis choisir son prénom. */
export function Join() {
  const { code: urlCode } = useParams();
  const nav = useNavigate();
  const [code, setCode] = useState((urlCode || "").toUpperCase());
  const [info, setInfo] = useState<JoinInfo | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const lookup = async (c: string) => {
    setErr(null); setBusy(true);
    try {
      const i = await api.joinInfo(c.trim().toUpperCase());
      if (!i) setErr("Ce code ne correspond à aucune séance en cours. Vérifie-le avec ton animateur.");
      setInfo(i);
    } catch (e) { setErr(errorMessage(e)); } finally { setBusy(false); }
  };
  useEffect(() => { if (urlCode && urlCode.length === 6) lookup(urlCode); }, [urlCode]); // eslint-disable-line react-hooks/exhaustive-deps

  const pick = async (kidId: string) => {
    if (!info) return;
    setBusy(true); setErr(null);
    try {
      const r = await api.claimChild(code.trim().toUpperCase(), kidId);
      const d: DeviceSession = { code: code.trim().toUpperCase(), session_id: r.session_id, level_ids: r.level_ids, group_name: info.group_name, title: info.title, child: r.child };
      ls.set(DEVICE_KEY, d);
      nav("/seance/jouer");
    } catch (e) { setErr(errorMessage(e)); } finally { setBusy(false); }
  };

  return (
    <KidShell bar={<>
      <button type="button" className="icon-btn" aria-label="Retour à l'accueil" onClick={() => nav("/")}><Icon name="back" /></button>
      <div className="bar-title">Rejoindre une séance</div><span style={{ width: 48 }} />
    </>}>
      <div className="stack screen-in join-box">
        {!info ? (
          <>
            <div className="say say-hero"><Lumi /><div className="bubble"><p>{fr("Bonjour ! Tape le code de la séance que ton animateur t'a donné.")}</p></div></div>
            <form className="stack" onSubmit={e => { e.preventDefault(); if (code.trim().length >= 6) lookup(code); }}>
              <label className="sr" htmlFor="code">Code de la séance</label>
              <input id="code" className="code-input" value={code} maxLength={6} autoComplete="off" autoCapitalize="characters" inputMode="text" placeholder="ABC123"
                onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))} />
              {err && <p className="note" style={{ color: "#FFB3A8" }} role="alert">{err}</p>}
              <button type="submit" className="btn btn-gold" disabled={busy || code.length < 6}>{busy ? "Recherche…" : "Rejoindre"}<Icon name="next" /></button>
            </form>
          </>
        ) : (
          <>
            <div className="say say-hero"><Lumi /><div className="bubble"><p>{fr(`Séance du groupe « ${info.group_name} ». Touche ton prénom !`)}</p></div></div>
            {err && <p className="note" style={{ color: "#FFB3A8" }} role="alert">{err}</p>}
            {info.kids.length === 0 ? <p className="note">L'animateur n'a pas encore ajouté d'enfants à ce groupe.</p> : (
              <div className="kid-pick">
                {info.kids.map(k => <button key={k.id} type="button" disabled={busy} onClick={() => pick(k.id)}><Avatar id={k.avatar} size={64} />{fr(k.pseudonym)}</button>)}
              </div>
            )}
            <button type="button" className="btn btn-ghost" onClick={() => { setInfo(null); setCode(""); }}>Changer de code</button>
          </>
        )}
      </div>
    </KidShell>
  );
}
