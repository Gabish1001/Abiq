import { noeArt, abrahamArt, moiseArt, davidArt } from "./scenes-at";
import { jesusArt, garconArt, zacheeArt, samaritainArt } from "./scenes-nt";
import { type C, sky, stars, hill, parchment, glow, rr } from "./primitives";
import type { LevelArt } from "./types";

export type { LevelArt } from "./types";

export const ART: Record<string, LevelArt> = {
  noe: noeArt, abraham: abrahamArt, moise: moiseArt, david: davidArt,
  jesus: jesusArt, garcon: garconArt, zachee: zacheeArt, samaritain: samaritainArt
};

const SIL = "rgba(58,46,94,.86)";
type Kind = "puzzle" | "card" | "teaser" | "page" | "mystery";

export function parseKey(key: string): { level: string; kind: Kind; page?: string } {
  const [level, part = ""] = key.split("/");
  if (part === "puzzle" || part === "card" || part === "teaser" || part === "mystery") return { level, kind: part };
  return { level, kind: "page", page: part };
}
export function artSize(key: string): [number, number] {
  const k = parseKey(key).kind;
  if (k === "page") return [1000, 625];
  if (k === "card" || k === "teaser") return [600, 640];
  return [1000, 1000];
}
/** Toutes les clés d'illustration connues (utile pour l'administration). */
export function allArtKeys(): string[] {
  const out: string[] = [];
  for (const [id, a] of Object.entries(ART)) {
    out.push(`${id}/puzzle`, `${id}/card`, `${id}/teaser`);
    for (const p of Object.keys(a.pages)) out.push(`${id}/${p}`);
  }
  return out;
}

function placeholder(c: C, w: number, h: number) {
  const g = c.createLinearGradient(0, 0, w, h); g.addColorStop(0, "#1B2B74"); g.addColorStop(1, "#13215C");
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  glow(c, w / 2, h / 2, Math.min(w, h) * .45, "246,184,47", .35);
  c.fillStyle = "#F6B82F"; c.font = `800 ${Math.round(h * .32)}px "Baloo 2", sans-serif`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("?", w / 2, h / 2 + h * .03);
}
function teaser(c: C, a: LevelArt) {
  sky(c, 600, 640, "night"); stars(c, 600, 480, 9, 170);
  hill(c, 140, 560, 360, 90, "#111A4C"); hill(c, 520, 580, 300, 70, "#0D1542");
  c.fillStyle = "#0A1033"; c.fillRect(0, 590, 600, 50);
  a.cardFigure(c, "#070C2A");
}

/** Dessine l'illustration demandée dans un contexte déjà dimensionné. */
export function drawArt(c: C, key: string) {
  const { level, kind, page } = parseKey(key);
  const [w, h] = artSize(key);
  const a = ART[level];
  try {
    if (!a) { placeholder(c, w, h); return; }
    if (kind === "puzzle") a.puzzle(c);
    else if (kind === "card") a.card.call(a, c);
    else if (kind === "teaser") teaser(c, a);
    else if (kind === "mystery") { parchment(c, 1000, 1000); a.mystery(c, SIL, 3); }
    else if (page && a.pages[page]) a.pages[page](c);
    else placeholder(c, w, h);
  } catch (e) {
    console.error("Illustration", key, e);
    placeholder(c, w, h);
  }
}

/** Page effacée du mystère : silhouettes révélées une à une (stage = nombre d'indices vus). */
export function drawMystery(canvas: HTMLCanvasElement, level: string, stage: number) {
  const c = canvas.getContext("2d"); if (!c) return;
  const s = canvas.width / 1000;
  c.save(); c.setTransform(s, 0, 0, s, 0, 0);
  parchment(c, 1000, 1000);
  const a = ART[level];
  if (a) a.mystery(c, SIL, stage);
  else { rr(c, 380, 300, 240, 420, 120); c.fillStyle = SIL; c.fill(); }
  c.restore();
}
export function mysteryHead(level: string): [number, number] { return ART[level]?.mysteryHead || [.5, .45]; }

const cache = new Map<string, Promise<string>>();
/** URL (blob) de l'illustration, dessinée une seule fois puis mise en cache. */
export function artURL(key: string): Promise<string> {
  let p = cache.get(key);
  if (!p) {
    p = new Promise<string>(resolve => {
      const [w, h] = artSize(key);
      const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
      const c = cv.getContext("2d");
      if (!c) { resolve(""); return; }
      drawArt(c, key);
      const done = (b: Blob | null) => resolve(b ? URL.createObjectURL(b) : cv.toDataURL("image/png"));
      try { cv.toBlob(done, "image/webp", .9); } catch { resolve(cv.toDataURL("image/png")); }
    });
    cache.set(key, p);
  }
  return p;
}
