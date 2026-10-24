import { useEffect, useState } from "react";

/* Lecture à voix haute avec la synthèse vocale de l'appareil.
   La version finale pourra utiliser des fichiers audio enregistrés (champ audio des pages). */
type Opts = { key?: string; onword?: (charIndex: number) => void; onend?: () => void };

class VoiceCtl {
  ok = typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
  voice: SpeechSynthesisVoice | null = null;
  loaded = false;
  enabled = true;
  key: string | null = null;
  private cur: SpeechSynthesisUtterance | null = null;
  private subs = new Set<() => void>();

  constructor() {
    if (!this.ok) return;
    const upd = () => {
      let vs: SpeechSynthesisVoice[] = [];
      try { vs = speechSynthesis.getVoices() || []; } catch { /* ignore */ }
      if (!vs.length) return;
      this.loaded = true;
      const fr = vs.filter(v => /^fr/i.test(v.lang));
      this.voice = fr.find(v => /fr[-_]FR/i.test(v.lang) && /Google|Amélie|Audrey|Marie|Thomas|Denise|Henri/i.test(v.name)) || fr.find(v => /fr[-_]FR/i.test(v.lang)) || fr[0] || null;
      this.emit();
    };
    upd();
    try { speechSynthesis.addEventListener("voiceschanged", upd); } catch { /* ancien navigateur */ }
    document.addEventListener("visibilitychange", () => { if (document.hidden) this.stop(); });
  }
  hasFrench() { return !this.loaded || !!this.voice; }
  usable() { return this.ok && this.enabled && this.hasFrench(); }
  speak(text: string, o: Opts = {}) {
    if (!this.usable()) return false;
    this.stop();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "fr-FR"; if (this.voice) u.voice = this.voice; u.rate = .92; u.pitch = 1.05;
    const fin = () => { if (this.cur === u) { this.cur = null; this.key = null; this.emit(); o.onend?.(); } };
    u.onend = fin; u.onerror = fin;
    if (o.onword) u.onboundary = e => { if (this.cur === u && (!e.name || e.name === "word")) o.onword!(e.charIndex); };
    this.cur = u; this.key = o.key || null;
    try { speechSynthesis.speak(u); } catch { this.cur = null; this.key = null; return false; }
    this.emit();
    return true;
  }
  stop() {
    if (!this.ok) return;
    const had = this.key !== null || this.cur !== null;
    this.cur = null; this.key = null;
    try { speechSynthesis.cancel(); } catch { /* ignore */ }
    if (had) this.emit();
  }
  subscribe(f: () => void) { this.subs.add(f); return () => { this.subs.delete(f); }; }
  private emit() { this.subs.forEach(f => f()); }
}

export const Voice = new VoiceCtl();

/** Clé de ce qui est en cours de lecture (pour mettre à jour les boutons « Écouter »). */
export function useVoiceKey() {
  const [, set] = useState(0);
  useEffect(() => Voice.subscribe(() => set(n => n + 1)), []);
  return Voice.key;
}
