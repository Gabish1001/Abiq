/* Petits sons générés (aucun fichier à télécharger). */
let ctx: AudioContext | null = null;
let enabled = true;

function ensure() {
  if (!ctx) { try { const A = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext; if (A) ctx = new A(); } catch { /* pas d'audio */ } }
  if (ctx && ctx.state === "suspended") { ctx.resume().catch(() => {}); }
}
function tone(f: number, start: number, dur: number, type: OscillatorType, vol: number) {
  if (!ctx) return;
  const t = ctx.currentTime + start, o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.value = f;
  g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(vol, t + .015); g.gain.exponentialRampToValueAtTime(.0008, t + dur);
  o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + dur + .05);
}

export type SoundName = "tap" | "swap" | "place" | "good" | "soft" | "win";
export const Sound = {
  setEnabled(v: boolean) { enabled = v; },
  unlock: ensure,
  play(name: SoundName) {
    if (!enabled) return;
    ensure(); if (!ctx) return;
    try {
      switch (name) {
        case "tap": tone(660, 0, .09, "triangle", .07); break;
        case "swap": tone(520, 0, .08, "triangle", .06); break;
        case "place": tone(784, 0, .2, "sine", .15); tone(1175, .07, .28, "sine", .11); break;
        case "good": tone(523, 0, .16, "triangle", .13); tone(659, .1, .16, "triangle", .13); tone(784, .2, .34, "triangle", .13); break;
        case "soft": tone(392, 0, .2, "sine", .1); tone(349, .13, .28, "sine", .09); break;
        case "win": [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, i * .11, .34, "triangle", .12)); break;
      }
    } catch { /* ignore */ }
  }
};
