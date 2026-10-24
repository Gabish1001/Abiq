import { useEffect, useState } from "react";
import { ls } from "@/lib/hooks";
import { Icon } from "./kit";

type BIP = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
let deferred: BIP | null = null;
const subs = new Set<() => void>();
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); deferred = e as BIP; subs.forEach(f => f()); });
  window.addEventListener("appinstalled", () => { deferred = null; subs.forEach(f => f()); });
}

/** Propose l'installation de l'application aux adultes uniquement, jamais pendant le jeu d'un enfant. */
export function InstallPrompt() {
  const [, tick] = useState(0);
  const [hidden, setHidden] = useState(() => ls.get("abiq-install-dismissed", 0) > Date.now());
  useEffect(() => { const f = () => tick(n => n + 1); subs.add(f); return () => { subs.delete(f); }; }, []);
  const standalone = typeof window !== "undefined" && window.matchMedia?.("(display-mode: standalone)").matches;
  if (!deferred || hidden || standalone) return null;
  return (
    <div className="info row between" style={{ marginBottom: 16 }}>
      <span><b>Installer ABIQ sur ce téléphone ?</b> L'application s'ouvrira comme une vraie appli, sans passer par le navigateur.</span>
      <span className="row">
        <button type="button" className="a-btn primary sm" onClick={async () => { await deferred?.prompt(); deferred = null; tick(n => n + 1); }}><Icon name="download" size={18} />Installer</button>
        <button type="button" className="a-btn sm" onClick={() => { ls.set("abiq-install-dismissed", Date.now() + 14 * 864e5); setHidden(true); }}>Plus tard</button>
      </span>
    </div>
  );
}
