/** Prochain dimanche à 6 h (heure locale), décalé de `weeks` semaines (1 = le prochain dimanche). */
export function nextReleaseDate(weeks = 1, from = new Date()) {
  const d = new Date(from);
  d.setHours(6, 0, 0, 0);
  const add = (7 - d.getDay()) % 7 || 7;
  d.setDate(d.getDate() + add + (weeks - 1) * 7);
  return d;
}

export const isReleased = (release_at: string | null | undefined, at = Date.now()) => !release_at || new Date(release_at).getTime() <= at;

const DAYS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
const MONTHS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];

/** « dimanche », « dimanche 8 nov. » ou « aujourd'hui » selon l'écart. */
export function releaseLabel(release_at: string) {
  const d = new Date(release_at), now = new Date();
  const days = Math.round((new Date(d).setHours(0, 0, 0, 0) - new Date(now).setHours(0, 0, 0, 0)) / 864e5);
  if (days <= 0) return "aujourd'hui";
  if (days === 1) return "demain";
  if (days < 7) return DAYS[d.getDay()];
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function fmtDate(iso: string | null | undefined, withTime = false) {
  if (!iso) return "–";
  const d = new Date(iso);
  const s = `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  return withTime ? `${s}, ${String(d.getHours()).padStart(2, "0")} h ${String(d.getMinutes()).padStart(2, "0")}` : s;
}

export function ago(iso: string | null | undefined) {
  if (!iso) return "jamais";
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "à l'instant";
  if (m < 60) return `il y a ${m} min`;
  const h = Math.round(m / 60); if (h < 24) return `il y a ${h} h`;
  const d = Math.round(h / 24); if (d < 8) return `il y a ${d} jour${d > 1 ? "s" : ""}`;
  return `le ${fmtDate(iso)}`;
}

/** Valeur pour <input type="datetime-local"> */
export function toLocalInput(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso); const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}
