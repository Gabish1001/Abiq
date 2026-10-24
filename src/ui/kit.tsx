import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { artURL } from "@/art";
import { Voice, useVoiceKey } from "@/game/voice";

/* ---------- Typographie française : espaces insécables ---------- */
export const fr = (t: string) => t.replace(/ ([?!:;»])/g, " $1").replace(/« /g, "« ");

/* ---------- Icônes ---------- */
const P: Record<string, string> = {
  home: '<path d="M3.5 11 12 4l8.5 7"/><path d="M5.5 9.5V20h4.5v-5.5h4V20h4.5V9.5"/>',
  back: '<path d="M15 5l-7 7 7 7"/>', next: '<path d="M9 5l7 7-7 7"/>',
  down: '<path d="M5 9l7 7 7-7"/>', up: '<path d="M5 15l7-7 7 7"/>',
  sound: '<path d="M4 9.5v5h3.5L12 18V6L7.5 9.5z"/><path d="M15.5 9a4.2 4.2 0 0 1 0 6M18 6.5a7.8 7.8 0 0 1 0 11"/>',
  mute: '<path d="M4 9.5v5h3.5L12 18V6L7.5 9.5z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/>',
  play: '<path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/>',
  pause: '<rect x="6.5" y="5.5" width="4" height="13" rx="1.2" fill="currentColor"/><rect x="13.5" y="5.5" width="4" height="13" rx="1.2" fill="currentColor"/>',
  star: '<path d="M12 3.2l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 17l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8z"/>',
  bulb: '<path d="M9.5 18h5M10.5 21h3"/><path d="M12 3.5a5.8 5.8 0 0 0-3.4 10.5c.6.5 1 1.2 1 2V16h4.8v-.1c0-.8.4-1.5 1-2A5.8 5.8 0 0 0 12 3.5z"/>',
  eye: '<path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/>',
  restart: '<path d="M4 5v5h5"/><path d="M5.2 14.5A7.5 7.5 0 1 0 6.6 7L4 10"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  lock: '<rect x="5.5" y="10.5" width="13" height="10" rx="2.5"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>',
  book: '<path d="M3 6c2.6-1.6 6-1.6 9 .6 3-2.2 6.4-2.2 9-.6v13c-2.6-1.6-6-1.6-9 .6-3-2.2-6.4-2.2-9-.6z"/><path d="M12 6.6v13"/>',
  puzzle: '<path d="M4.5 8.5h3.2a2.3 2.3 0 1 1 4.6 0h3.2v3.2a2.3 2.3 0 1 1 0 4.6v3.2h-3.2a2.3 2.3 0 1 0-4.6 0H4.5v-3.2a2.3 2.3 0 1 0 0-4.6z"/>',
  quiz: '<path d="M5 5h14a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 19 17h-8l-4.5 3.5V17H5a1.5 1.5 0 0 1-1.5-1.5v-9A1.5 1.5 0 0 1 5 5z"/><path d="M10.2 9.2a1.9 1.9 0 1 1 2.6 1.8c-.5.2-.8.6-.8 1.1"/><circle cx="12" cy="14.3" r=".4" fill="currentColor"/>',
  question: '<circle cx="12" cy="12" r="8.5"/><path d="M9.7 9.6a2.4 2.4 0 1 1 3.4 2.2c-.6.3-1.1.8-1.1 1.5v.3"/><circle cx="12" cy="16.6" r=".5" fill="currentColor"/>',
  cards: '<rect x="3.5" y="6.5" width="11" height="14" rx="2"/><path d="M8.5 3.5h9a2 2 0 0 1 2 2v12"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  adult: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c.8-3.8 3.6-6 7-6s6.2 2.2 7 6"/>',
  users: '<circle cx="9" cy="8.5" r="3"/><path d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5"/><circle cx="17" cy="9.5" r="2.4"/><path d="M15.5 14.3c2.4.2 4 1.8 4.5 4.7"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8"/>',
  logout: '<path d="M9 4.5H6a1.5 1.5 0 0 0-1.5 1.5v12A1.5 1.5 0 0 0 6 19.5h3"/><path d="M14 8l4 4-4 4M18 12H9"/>',
  plus: '<path d="M12 5v14M5 12h14"/>', trash: '<path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 12.5h9l1-12.5"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M21 20H3"/>',
  calendar: '<rect x="3.5" y="5.5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3.5v4M16 3.5v4"/>',
  screen: '<rect x="3" y="4.5" width="18" height="12" rx="1.5"/><path d="M9 20.5h6M12 16.5v4"/>',
  phone: '<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M11 18h2"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5.5A1.5 1.5 0 0 0 14.5 4h-9A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H8"/>',
  download: '<path d="M12 4v11M7 10.5l5 5 5-5M5 20h14"/>', upload: '<path d="M12 20V9M7 13.5l5-5 5 5M5 4h14"/>',
  history: '<path d="M4 12a8 8 0 1 0 2.4-5.7L4 8.5"/><path d="M4 4v4.5h4.5M12 8v4.5l3 2"/>',
  shield: '<path d="M12 3.5l7 3v5.5c0 4.2-3 7.4-7 8.5-4-1.1-7-4.3-7-8.5V6.5z"/><path d="M8.8 12l2.2 2.2 4.2-4.4"/>',
  image: '<rect x="3.5" y="5" width="17" height="14" rx="2"/><circle cx="9" cy="10" r="1.8"/><path d="M4 17l5-4.5 3.5 3 3-2.5 4.5 4"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>', send: '<path d="M4 12l16-8-6 16-2.5-6.5z"/>',
  fullscreen: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>', archive: '<rect x="3.5" y="4.5" width="17" height="4.5" rx="1"/><path d="M5 9v10.5h14V9M10 13h4"/>',
  heart: '<path d="M12 20s-7.5-4.5-7.5-10A4.2 4.2 0 0 1 12 7.6 4.2 4.2 0 0 1 19.5 10c0 5.5-7.5 10-7.5 10z"/>',
  map: '<path d="M3.5 6.5l5.5-2 6 2 5.5-2v13l-5.5 2-6-2-5.5 2z"/><path d="M9 4.5v13M15 6.5v13"/>',
  wifi: '<path d="M2.5 9a14 14 0 0 1 19 0M5.5 12.5a9.5 9.5 0 0 1 13 0M8.8 16a5 5 0 0 1 6.4 0"/><circle cx="12" cy="19.2" r=".9" fill="currentColor"/>',
  cloudok: '<path d="M7 18.5a4.5 4.5 0 0 1-.6-9A6 6 0 0 1 18 10a4 4 0 0 1-.5 8.5z"/><path d="M9.5 13.5l2 2 3.5-3.5"/>',
  cloudoff: '<path d="M7 18.5a4.5 4.5 0 0 1-.6-9A6 6 0 0 1 18 10a4 4 0 0 1-.5 8.5z"/><path d="M4 4l16 16"/>'
};
export type IconName = keyof typeof P;
export function Icon({ name, size = 22, fill = false, className = "", style }: { name: string; size?: number; fill?: boolean; className?: string; style?: CSSProperties }) {
  return <svg className={"ic " + className} style={style} width={size} height={size} viewBox="0 0 24 24" fill={fill ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: P[name] || "" }} />;
}

/* ---------- Lumi, la petite lampe guide ---------- */
export function Lumi({ className = "", size }: { className?: string; size?: number }) {
  return (
    <svg className={"lumi " + className} viewBox="0 0 130 104" aria-hidden="true" style={size ? { width: size } : undefined}>
      <defs><radialGradient id="lumiGlow"><stop offset="0" stopColor="#FFE3A1" stopOpacity=".95" /><stop offset=".45" stopColor="#F6B82F" stopOpacity=".35" /><stop offset="1" stopColor="#F6B82F" stopOpacity="0" /></radialGradient></defs>
      <circle className="lumi-glow" cx="105" cy="40" r="30" fill="url(#lumiGlow)" />
      <path d="M25 63c-12-3-14 14-1 13" fill="none" stroke="#A44C29" strokeWidth="6" strokeLinecap="round" />
      <path d="M22 68c0-14 18-21 38-19 16 1 28 4 40 1 7-2 11 4 7 8-8 6-14 10-18 16-6 12-21 18-35 18-18 0-32-9-32-24z" fill="#CC6B3F" />
      <path d="M28 79c10 9 38 11 56 1-6 8-17 12-30 12-12 0-21-5-26-13z" fill="#A9512E" opacity=".6" />
      <ellipse cx="53" cy="51" rx="13" ry="3.8" fill="#7A3518" /><ellipse cx="55" cy="93" rx="17" ry="3.6" fill="#8C3F1E" />
      <g className="lumi-flame"><path d="M104 16c7 12 12 22 6 30-4 5-11 3-12-3-1-7 4-14 6-27z" fill="#F6B82F" /><path d="M104 29c3 7 5 12 2 16-2 2-5 1-5-2-1-4 2-8 3-14z" fill="#FFF1C2" /></g>
      <ellipse cx="44" cy="68" rx="3.6" ry="4.6" fill="#2B1A12" /><ellipse cx="64" cy="68" rx="3.6" ry="4.6" fill="#2B1A12" />
      <circle cx="45.3" cy="66.3" r="1.3" fill="#fff" /><circle cx="65.3" cy="66.3" r="1.3" fill="#fff" />
      <path d="M48.5 76q5.5 4.5 11 0" fill="none" stroke="#2B1A12" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="37" cy="75" r="4" fill="#F28C6B" opacity=".75" /><circle cx="71" cy="75" r="4" fill="#F28C6B" opacity=".75" />
    </svg>
  );
}

/* ---------- Avatars des enfants ---------- */
export const AVATARS: { id: string; label: string }[] = [
  { id: "lion", label: "Lion" }, { id: "girafe", label: "Girafe" }, { id: "mouton", label: "Mouton" }, { id: "colombe", label: "Colombe" },
  { id: "elephant", label: "Éléphant" }, { id: "chameau", label: "Chameau" }, { id: "poisson", label: "Poisson" }, { id: "ane", label: "Âne" }
];
const AV: Record<string, ReactNode> = {
  lion: <><circle cx="24" cy="24" r="24" fill="#2E9E68" /><circle cx="24" cy="26" r="17" fill="#C9701F" /><circle cx="13" cy="14" r="5" fill="#E8A945" /><circle cx="35" cy="14" r="5" fill="#E8A945" /><circle cx="24" cy="27" r="12.5" fill="#F2BD55" /><ellipse cx="24" cy="31" rx="6" ry="4.5" fill="#FBE1A6" /><circle cx="19.5" cy="25" r="1.8" fill="#2B2442" /><circle cx="28.5" cy="25" r="1.8" fill="#2B2442" /><ellipse cx="24" cy="29.2" rx="2.4" ry="1.6" fill="#5B2E22" /></>,
  girafe: <><circle cx="24" cy="24" r="24" fill="#4C9CE2" /><path d="M18 10v6M30 10v6" stroke="#B86A2C" strokeWidth="2.6" strokeLinecap="round" /><circle cx="18" cy="9.5" r="2.4" fill="#B86A2C" /><circle cx="30" cy="9.5" r="2.4" fill="#B86A2C" /><ellipse cx="24" cy="26" rx="12" ry="14" fill="#F2B84B" /><ellipse cx="24" cy="34" rx="8" ry="6" fill="#F6D18A" /><circle cx="18" cy="21" r="2.4" fill="#C4732F" /><circle cx="31" cy="27" r="2" fill="#C4732F" /><circle cx="19.5" cy="26" r="1.8" fill="#2B2442" /><circle cx="28.5" cy="26" r="1.8" fill="#2B2442" /></>,
  mouton: <><circle cx="24" cy="24" r="24" fill="#8E6BB5" />{[[14, 18], [24, 13], [34, 18], [14, 30], [34, 30], [24, 35]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="8" fill="#FFFDF5" />)}<ellipse cx="24" cy="26" rx="8" ry="10" fill="#3B3340" /><circle cx="21" cy="24" r="1.6" fill="#fff" /><circle cx="27" cy="24" r="1.6" fill="#fff" /></>,
  colombe: <><circle cx="24" cy="24" r="24" fill="#F0685A" /><circle cx="22" cy="24" r="13" fill="#FFFFFF" /><path d="M33 22l8 3-8 3z" fill="#F2A541" /><circle cx="25" cy="21" r="2" fill="#2B2442" /><path d="M12 30q8 8 18 0" stroke="#D5DEEC" strokeWidth="3" fill="none" /></>,
  elephant: <><circle cx="24" cy="24" r="24" fill="#F6B82F" /><ellipse cx="12" cy="24" rx="8" ry="10" fill="#737C92" /><ellipse cx="36" cy="24" rx="8" ry="10" fill="#737C92" /><circle cx="24" cy="23" r="11" fill="#8E97AB" /><path d="M24 30v9" stroke="#8E97AB" strokeWidth="5" strokeLinecap="round" /><circle cx="20" cy="21" r="1.8" fill="#2B2442" /><circle cx="28" cy="21" r="1.8" fill="#2B2442" /></>,
  chameau: <><circle cx="24" cy="24" r="24" fill="#5DA9A0" /><ellipse cx="24" cy="25" rx="10" ry="13" fill="#D7A665" /><ellipse cx="24" cy="33" rx="8" ry="6" fill="#E9C38F" /><ellipse cx="15" cy="15" rx="2.5" ry="4" fill="#B98A4E" /><ellipse cx="33" cy="15" rx="2.5" ry="4" fill="#B98A4E" /><circle cx="20" cy="22" r="1.8" fill="#2B2442" /><circle cx="28" cy="22" r="1.8" fill="#2B2442" /></>,
  poisson: <><circle cx="24" cy="24" r="24" fill="#3F5CA8" /><path d="M10 24l-4-7v14z" fill="#F0685A" /><ellipse cx="24" cy="24" rx="14" ry="9" fill="#F0685A" /><circle cx="31" cy="22" r="2" fill="#2B2442" /><path d="M20 20q3 4 0 8" stroke="#FFB3A8" strokeWidth="2" fill="none" /></>,
  ane: <><circle cx="24" cy="24" r="24" fill="#E07A5F" /><ellipse cx="17" cy="11" rx="3" ry="8" fill="#7E7468" /><ellipse cx="31" cy="11" rx="3" ry="8" fill="#7E7468" /><ellipse cx="24" cy="25" rx="10" ry="12" fill="#9C9184" /><ellipse cx="24" cy="33" rx="7" ry="5.5" fill="#D9D2C7" /><circle cx="20" cy="22" r="1.8" fill="#2B2442" /><circle cx="28" cy="22" r="1.8" fill="#2B2442" /></>
};
export function Avatar({ id, size = 46, className = "" }: { id: string; size?: number; className?: string }) {
  return <svg className={"avatar " + className} width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">{AV[id] || AV.lion}</svg>;
}

/* ---------- Illustration (image importée ou dessin de l'application) ---------- */
export function useArt(art: string | undefined, image?: string) {
  const [url, setUrl] = useState<string>(image || "");
  useEffect(() => {
    let alive = true;
    if (image) { setUrl(image); return; }
    if (!art) { setUrl(""); return; }
    artURL(art).then(u => { if (alive) setUrl(u); });
    return () => { alive = false; };
  }, [art, image]);
  return url;
}
export function ArtImg({ art, image, alt, className = "", style }: { art?: string; image?: string; alt: string; className?: string; style?: CSSProperties }) {
  // Si l'image importée ne se charge pas (supprimée, réseau), on revient à l'illustration dessinée.
  const [broken, setBroken] = useState<string | null>(null);
  const url = useArt(art, image && image !== broken ? image : undefined);
  return url ? <img className={className} style={style} src={url} alt={alt} draggable={false} onError={() => { if (image && url === image) setBroken(image); }} /> : <span className={className + " art-loading"} style={style} role="img" aria-label={alt} />;
}

/* ---------- Bouton « Écouter » ---------- */
export function ListenButton({ id, text, onStart, onWord, onEnd, light }: { id: string; text: string; onStart?: () => void; onWord?: (i: number) => void; onEnd?: () => void; light?: boolean }) {
  const cur = useVoiceKey();
  if (!Voice.usable()) return null;
  const on = cur === id;
  return (
    <button type="button" className={"listen" + (on ? " on" : "") + (light ? " light" : "")} aria-pressed={on}
      onClick={() => { if (on) { Voice.stop(); onEnd?.(); return; } onStart?.(); Voice.speak(text, { key: id, onword: onWord, onend: onEnd }); }}>
      <Icon name={on ? "pause" : "play"} size={18} /><span>{on ? "Arrêter" : "Écouter"}</span>
    </button>
  );
}

/* ---------- Divers ---------- */
export function Spinner({ label = "Chargement…" }: { label?: string }) {
  return <div className="spinner" role="status"><Lumi size={84} /><span>{label}</span></div>;
}
export function Stars({ n, max = 3, size = 16 }: { n: number; max?: number; size?: number }) {
  return <span className="mini-stars" role="img" aria-label={`${n} étoile${n > 1 ? "s" : ""} sur ${max}`}>{Array.from({ length: max }, (_, i) => <Icon key={i} name="star" size={size} fill style={{ opacity: i < n ? 1 : .25 }} />)}</span>;
}
