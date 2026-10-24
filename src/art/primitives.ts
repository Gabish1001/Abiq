/* Primitives de dessin des illustrations ABIQ (style à plat, dessiné en code).
   Coordonnées : chaque personnage a les pieds à y = 0 et la tête vers y = -200. */

export type C = CanvasRenderingContext2D;
type Sil = string | null | undefined;
const TAU = Math.PI * 2;

export function rng(seed: number) {
  let s = seed >>> 0;
  return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
}
export function shade(hex: string, k: number) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.max(0, Math.min(255, Math.round(v * k)));
  const r = f(n >> 16), g = f((n >> 8) & 255), b = f(n & 255);
  return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}
export function rr(c: C, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}
export function ell(c: C, x: number, y: number, rx: number, ry: number, rot: number, fill: string) {
  c.beginPath(); c.ellipse(x, y, Math.abs(rx), Math.abs(ry), rot || 0, 0, TAU); c.fillStyle = fill; c.fill();
}
export function circ(c: C, x: number, y: number, r: number, fill: string) {
  c.beginPath(); c.arc(x, y, Math.abs(r), 0, TAU); c.fillStyle = fill; c.fill();
}
export function poly(c: C, pts: number[], fill: string) {
  c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.closePath(); c.fillStyle = fill; c.fill();
}
export function line(c: C, pts: number[], col: string, w: number) {
  c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]);
  c.strokeStyle = col; c.lineWidth = w; c.lineCap = "round"; c.lineJoin = "round"; c.stroke();
}

/* ---------- décors ---------- */
const SKIES: Record<string, string[]> = {
  day: ["#6FBDEB", "#BCE4F6", "#FFE4B0"], soft: ["#8CCBEE", "#CFEBF6", "#FCEBC4"], storm: ["#334473", "#56668F", "#8C98B5"],
  night: ["#081039", "#16236A", "#2B3B8A"], dusk: ["#152560", "#4A4A93", "#F0A06A"], desert: ["#7CC4EC", "#CFE9F2", "#FBE3B2"],
  dawn: ["#9CC9EE", "#F6D9C2", "#FFC98F"], indoor: ["#E9D3AC", "#E2C79A", "#D4B482"]
};
export function sky(c: C, w: number, h: number, mode: string) {
  const m = SKIES[mode] || SKIES.day;
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, m[0]); g.addColorStop(.55, m[1]); g.addColorStop(1, m[2]);
  c.fillStyle = g; c.fillRect(0, 0, w, h);
}
export function glow(c: C, x: number, y: number, r: number, col = "255,226,120", a = .55) {
  const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(1, `rgba(${col},0)`);
  c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
}
export function sun(c: C, x: number, y: number, r: number) {
  glow(c, x, y, r * 2.7);
  c.save(); c.translate(x, y); c.fillStyle = "#FFD45C";
  for (let i = 0; i < 12; i++) { c.rotate(Math.PI / 6); rr(c, r * 1.2, -6, r * .42, 12, 6); c.fill(); }
  c.restore();
  circ(c, x, y, r, "#FFD45C"); circ(c, x - r * .22, y - r * .22, r * .5, "rgba(255,240,170,.7)");
}
export function moon(c: C, x: number, y: number, r: number) {
  glow(c, x, y, r * 2.4, "255,244,200", .35);
  c.beginPath(); c.arc(x, y, r, 0, TAU);                       // croissant : disque moins un disque décalé
  c.arc(x + r * .45, y - r * .25, r * .85, 0, TAU, true);
  c.fillStyle = "#FFF3C4"; c.fill("evenodd");
}
export function cloud(c: C, x: number, y: number, s: number, col = "#FFFFFF") {
  c.fillStyle = col;
  ([[0, 0, 38], [42, -22, 48], [92, -6, 40], [128, 8, 30]] as const).forEach(([dx, dy, r]) => { c.beginPath(); c.arc(x + dx * s, y + dy * s, r * s, 0, TAU); c.fill(); });
  rr(c, x - 20 * s, y, 170 * s, 38 * s, 19 * s); c.fill();
}
export function rainbow(c: C, cx: number, cy: number, r: number, b: number, alpha = .9) {
  const cols = ["#EE5B4F", "#F69B3D", "#F6D04A", "#6CC05B", "#4C9CE2", "#8B6CD4"];
  c.save(); c.globalAlpha = alpha;
  cols.forEach((col, i) => { c.beginPath(); c.arc(cx, cy, r - i * b, Math.PI, TAU); c.strokeStyle = col; c.lineWidth = b + 1.5; c.stroke(); });
  c.restore();
}
export function peak(c: C, x: number, base: number, hgt: number, wid: number, col: string, snow = false) {
  c.fillStyle = col; c.beginPath(); c.moveTo(x - wid / 2, base);
  c.bezierCurveTo(x - wid * .25, base - hgt * .35, x - wid * .12, base - hgt, x, base - hgt);
  c.bezierCurveTo(x + wid * .12, base - hgt, x + wid * .25, base - hgt * .35, x + wid / 2, base);
  c.closePath(); c.fill();
  if (snow) {
    c.save(); c.clip(); c.fillStyle = "#F6F3FF"; c.beginPath();
    const sy = base - hgt * .72; c.moveTo(x - wid * .4, sy);
    for (let i = 0; i <= 6; i++) c.lineTo(x - wid * .4 + i * wid * .8 / 6, sy + (i % 2 ? 18 : 0));
    c.lineTo(x + wid * .4, base - hgt - 10); c.lineTo(x - wid * .4, base - hgt - 10); c.closePath(); c.fill(); c.restore();
  }
}
export function hill(c: C, x: number, y: number, rx: number, ry: number, col: string) {
  c.fillStyle = col; c.beginPath(); c.ellipse(x, y, rx, ry, 0, Math.PI, TAU); c.lineTo(x + rx, y + 900); c.lineTo(x - rx, y + 900); c.closePath(); c.fill();
}
export function ground(c: C, w: number, h: number, y: number, col: string) { c.fillStyle = col; c.fillRect(0, y, w, h - y); }
export function sea(c: C, w: number, h: number, y: number, cols: string[], off = 0) {
  cols.forEach((col, i) => {
    const yy = y + i * 52, L = 150, A = 13, x0 = -((i * 53 + off) % L);
    const wave = () => { c.beginPath(); c.moveTo(x0, yy); for (let x = x0; x < w + L; x += L) { c.quadraticCurveTo(x + L / 4, yy - A, x + L / 2, yy); c.quadraticCurveTo(x + 3 * L / 4, yy + A, x + L, yy); } };
    wave(); c.lineTo(w + L, h); c.lineTo(x0, h); c.closePath(); c.fillStyle = col; c.fill();
    wave(); c.strokeStyle = "rgba(255,255,255,.28)"; c.lineWidth = 4; c.stroke();
  });
}
export function tree(c: C, x: number, y: number, s: number, sil?: Sil) {
  c.fillStyle = sil || "#7A4A26"; rr(c, x - 8 * s, y - 70 * s, 16 * s, 70 * s, 6 * s); c.fill();
  ([[0, -100, 42], [-30, -80, 32], [30, -82, 34], [0, -130, 30]] as const).forEach(([dx, dy, r]) => circ(c, x + dx * s, y + dy * s, r * s, sil || "#4E9D4A"));
  if (!sil) circ(c, x - 10 * s, y - 112 * s, 14 * s, "#69B65E");
}
export function palm(c: C, x: number, y: number, s: number, sil?: Sil) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.strokeStyle = sil || "#8A5A34"; c.lineWidth = 14; c.lineCap = "round";
  c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(10, -90, -6, -180); c.stroke();
  const leaf = (a: number) => { c.save(); c.translate(-6, -180); c.rotate(a); c.fillStyle = sil || "#4E9D4A"; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(40, -26, 90, 6); c.quadraticCurveTo(40, -6, 0, 0); c.fill(); c.restore(); };
  [-2.6, -2.0, -1.2, -.5, .1, .6].forEach(leaf);
  c.restore();
}
export function rain(c: C, w: number, h: number, seed: number, alpha: number) {
  const R = rng(seed); c.save(); c.strokeStyle = `rgba(225,236,255,${alpha})`; c.lineWidth = 3; c.lineCap = "round";
  for (let i = 0; i < 160; i++) { const x = R() * w * 1.1, y = R() * h; c.beginPath(); c.moveTo(x, y); c.lineTo(x - 10, y + 34); c.stroke(); }
  c.restore();
}
export function sparkle(c: C, x: number, y: number, r: number, col: string) {
  c.fillStyle = col; c.beginPath(); c.moveTo(x, y - r); c.quadraticCurveTo(x, y, x + r, y); c.quadraticCurveTo(x, y, x, y + r);
  c.quadraticCurveTo(x, y, x - r, y); c.quadraticCurveTo(x, y, x, y - r); c.closePath(); c.fill();
}
export function stars(c: C, w: number, h: number, seed: number, n: number, x0 = 0, y0 = 0) {
  const R = rng(seed);
  for (let i = 0; i < n; i++) circ(c, x0 + R() * w, y0 + R() * h, R() * 1.8 + .6, `rgba(255,248,220,${(.4 + R() * .6).toFixed(2)})`);
  for (let i = 0; i < Math.max(4, n / 14); i++) sparkle(c, x0 + R() * w, y0 + R() * h * .9, 6 + R() * 8, "#FFE3A1");
}
export function bigStar(c: C, x: number, y: number, r: number, sil?: Sil) {
  if (!sil) { glow(c, x, y, r * 3.2, "255,236,170", .6); c.save(); c.globalAlpha = .35; poly(c, [x - 6, y, x + 6, y, x + 70, y + r * 6, x - 70, y + r * 6], "#FFF3C4"); c.restore(); }
  sparkle(c, x, y, r * 1.6, sil || "#FFE9A6"); sparkle(c, x, y, r * .8, sil || "#FFFFFF");
  c.save(); c.translate(x, y); c.rotate(Math.PI / 4); sparkle(c, 0, 0, r * .9, sil || "#FFE9A6"); c.restore();
}
export function parchment(c: C, w: number, h: number) {
  c.fillStyle = "#F5E8C8"; c.fillRect(0, 0, w, h);
  const R = rng(21); for (let i = 0; i < 700; i++) circ(c, R() * w, R() * h, R() * 2.4 + .4, `rgba(140,100,40,${(R() * .09).toFixed(3)})`);
  const g = c.createRadialGradient(w / 2, h / 2, w * .3, w / 2, h / 2, w * .72); g.addColorStop(0, "rgba(170,120,50,0)"); g.addColorStop(1, "rgba(170,120,50,.28)");
  c.fillStyle = g; c.fillRect(0, 0, w, h);
}

/* ---------- personnages ---------- */
export type Arm = "down" | "up" | "forward" | "staff" | "carry" | "point" | "hip" | "low";
export type PersonOpts = {
  flip?: boolean; sil?: Sil;
  robe?: string; robeShade?: string; cloth?: string; band?: string; skin?: string;
  beard?: boolean; beardCol?: string; woman?: boolean; hair?: string; longHair?: boolean; child?: boolean;
  crown?: boolean; nemes?: boolean; helmet?: boolean; armor?: boolean; angel?: boolean; bandage?: boolean; turban?: string;
  staff?: boolean; staffCol?: string; spear?: boolean; staffUp?: boolean;
  left?: Arm; right?: Arm; wave?: boolean; reach?: boolean; hammer?: boolean; plank?: boolean; sling?: boolean;
  hold?: "basket" | "gift" | "baby" | "bandage" | "jar" | "scroll" | "coins" | null;
  holdUp?: "bread" | "tambourine" | null;
  eyesClosed?: boolean; mouth?: "smile" | "open" | "flat"; worried?: boolean;
};
const ARMS: Record<Arm, [number, number, number, number]> = {
  down: [-46, -96, -45, -66], up: [-52, -140, -60, -188], forward: [-60, -122, -82, -144], staff: [-46, -118, -57, -104],
  carry: [-46, -104, -22, -86], point: [-62, -132, -92, -160], hip: [-56, -100, -34, -84], low: [-56, -90, -64, -52]
};

export function person(c: C, x: number, y: number, h: number, o: PersonOpts = {}) {
  const s = h / 200, sil = o.sil, F = (k: string) => sil || k;
  c.save(); c.translate(x, y); c.scale(o.flip ? -s : s, s); c.lineCap = "round"; c.lineJoin = "round";
  const robe = F(o.robe || "#D8A257"), robeSh = F(o.robeShade || shade(o.robe || "#D8A257", .85)), cloth = F(o.cloth || "#F2E6CB"),
    band = F(o.band || "#3F5CA8"), skin = F(o.skin || "#8A5A3C"), hair = F(o.hair || "#2B1A10");
  const hands: [number, number][] = [];
  if (o.angel) {
    if (!sil) glow(c, 0, -120, 170, "255,246,210", .6);
    c.fillStyle = F("#FFFFFF");
    [-1, 1].forEach(d => { c.beginPath(); c.moveTo(d * 10, -120); c.quadraticCurveTo(d * 110, -210, d * 120, -90); c.quadraticCurveTo(d * 70, -80, d * 10, -60); c.closePath(); c.fill(); });
    if (!sil) { c.strokeStyle = "#E3E0F2"; c.lineWidth = 3; [-1, 1].forEach(d => { c.beginPath(); c.moveTo(d * 30, -100); c.quadraticCurveTo(d * 80, -150, d * 100, -110); c.stroke(); }); }
  }
  if (o.staff || o.spear) {
    c.strokeStyle = F(o.spear ? "#6E5A40" : (o.staffCol || "#7A4A26")); c.lineWidth = o.spear ? 8 : 7;
    c.beginPath(); c.moveTo(-58, 2); c.lineTo(-60, -200); if (!o.spear) c.quadraticCurveTo(-62, -228, -40, -226); c.stroke();
    if (o.spear) poly(c, [-60, -232, -70, -200, -50, -200], F("#B8B8C4"));
  }
  ell(c, -17, -4, 15, 7, 0, F("#4A2C18")); ell(c, 17, -4, 15, 7, 0, F("#4A2C18"));
  // tunique
  c.fillStyle = robe; c.beginPath(); c.moveTo(-30, -132); c.quadraticCurveTo(-46, -60, -50, -6); c.quadraticCurveTo(0, 4, 50, -6);
  c.quadraticCurveTo(46, -60, 30, -132); c.quadraticCurveTo(0, -140, -30, -132); c.closePath(); c.fill();
  if (!sil) {
    c.fillStyle = robeSh; c.beginPath(); c.moveTo(8, -136); c.quadraticCurveTo(16, -70, 14, -2); c.quadraticCurveTo(34, -2, 50, -6); c.quadraticCurveTo(46, -60, 30, -132); c.closePath(); c.fill();
    if (o.armor) {
      c.fillStyle = "#8C8F9C"; rr(c, -34, -134, 68, 70, 14); c.fill();
      c.strokeStyle = "#6E7180"; c.lineWidth = 3; for (let yy = -122; yy < -70; yy += 12) { c.beginPath(); c.moveTo(-30, yy); c.quadraticCurveTo(0, yy + 6, 30, yy); c.stroke(); }
    }
    c.fillStyle = band; rr(c, -42, -84, 84, 11, 5); c.fill();
  }
  if (o.plank) { c.fillStyle = F("#B8743F"); rr(c, -92, -158, 204, 17, 5); c.fill(); }
  // côté gauche (x < 0) et droit (x > 0)
  let L: Arm = o.left || (o.staff || o.spear ? "staff" : "down");
  let Rt: Arm = o.right || "down";
  if (o.wave || o.staffUp) Rt = "up";
  if (o.reach) Rt = "forward";
  if (o.hold) { L = o.left || "carry"; Rt = o.right || "carry"; }
  if (o.holdUp) { L = "up"; Rt = "up"; }
  if (o.plank) { L = "up"; Rt = "up"; }
  const drawArm = (a: Arm, side: -1 | 1) => {
    const [cx, cy, x1, y1] = ARMS[a];
    const X = (v: number) => v * -side; // ARMS est défini pour le côté gauche (x négatif)
    let ex = X(x1), ey = y1;
    if (o.plank) { ex = 46 * side; ey = -152; }
    if (o.hammer && side === 1) { ex = 52; ey = -168; }
    if (o.sling && side === 1) { ex = 40; ey = -196; }
    if (o.sling && side === -1) { ex = -84; ey = -140; }
    c.strokeStyle = robe; c.lineWidth = 19; c.beginPath(); c.moveTo(28 * side, -122);
    c.quadraticCurveTo(X(cx), cy, ex, ey); c.stroke(); hands.push([ex, ey]);
  };
  if (o.hammer) {
    c.strokeStyle = F("#7A4A26"); c.lineWidth = 7; c.beginPath(); c.moveTo(52, -168); c.lineTo(60, -214); c.stroke();
    c.fillStyle = F("#6B7280"); rr(c, 42, -230, 38, 16, 4); c.fill();
  }
  drawArm(L, -1); drawArm(Rt, 1);
  if (o.staffUp) { c.strokeStyle = F(o.staffCol || "#7A4A26"); c.lineWidth = 8; c.beginPath(); c.moveTo(54, -112); c.lineTo(68, -300); c.stroke(); }
  // objets tenus devant le corps
  if (o.hold === "basket") basket(c, 0, -72, .9, sil, true);
  if (o.hold === "gift") { c.fillStyle = F("#E0B43A"); rr(c, -26, -104, 52, 40, 6); c.fill(); if (!sil) { c.fillStyle = "#B5523B"; c.fillRect(-4, -104, 8, 40); c.fillRect(-26, -88, 52, 8); } }
  if (o.hold === "jar") { ell(c, 0, -84, 22, 24, 0, F("#C98A52")); rr(c, -10, -114, 20, 12, 4); c.fillStyle = F("#A86E3E"); c.fill(); }
  if (o.hold === "baby") { baby(c, 0, -86, .8, sil, -.35); }
  if (o.hold === "bandage") { c.fillStyle = F("#FFFFFF"); rr(c, -30, -96, 60, 16, 6); c.fill(); if (!sil) { c.strokeStyle = "#E3DED2"; c.lineWidth = 2; c.beginPath(); c.moveTo(-20, -88); c.lineTo(20, -88); c.stroke(); } }
  if (o.hold === "scroll") { c.fillStyle = F("#F3E5C0"); rr(c, -30, -100, 60, 22, 8); c.fill(); if (!sil) { ell(c, -30, -89, 6, 11, 0, "#D9C38F"); ell(c, 30, -89, 6, 11, 0, "#D9C38F"); } }
  if (o.hold === "coins") { for (let i = 0; i < 4; i++) circ(c, -10 + i * 7, -90 - (i % 2) * 6, 8, F("#F2C14E")); }
  if (o.holdUp === "bread") { ell(c, -60, -204, 20, 12, -.2, F("#D9A15B")); ell(c, 60, -204, 20, 12, .2, F("#D9A15B")); }
  if (o.holdUp === "tambourine") { c.lineWidth = 7; c.strokeStyle = F("#C98A52"); c.beginPath(); c.arc(62, -204, 20, 0, TAU); c.stroke(); circ(c, 62, -204, 16, F("#F3E5C0")); }
  if (o.sling) {
    c.strokeStyle = F("#7A5A3A"); c.lineWidth = 3; c.beginPath(); c.moveTo(40, -196); c.quadraticCurveTo(95, -250, 108, -196); c.stroke();
    circ(c, 108, -196, 8, F("#9AA0AE"));
  }
  hands.forEach(([hx, hy]) => circ(c, hx, hy, 9.5, skin));
  // tête
  c.save();
  if (o.child) { c.translate(0, -130); c.scale(1.16, 1.16); c.translate(0, 130); }
  const covered = !(o.hair || o.helmet || o.nemes || o.angel) || o.woman;
  if (o.nemes) {
    c.fillStyle = F("#3F5CA8"); c.beginPath(); c.moveTo(-40, -102); c.quadraticCurveTo(-46, -196, 0, -198); c.quadraticCurveTo(46, -196, 40, -102); c.quadraticCurveTo(0, -120, -40, -102); c.closePath(); c.fill();
    if (!sil) { c.strokeStyle = "#F2C14E"; c.lineWidth = 5; for (let i = -1; i <= 1; i += 2) for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(i * 26, -170 + k * 18); c.lineTo(i * 40, -166 + k * 18); c.stroke(); } }
  } else if (o.longHair && !o.woman) {
    c.fillStyle = hair; c.beginPath(); c.moveTo(-28, -118); c.quadraticCurveTo(-34, -188, 0, -186); c.quadraticCurveTo(34, -188, 28, -118); c.quadraticCurveTo(0, -128, -28, -118); c.fill();
  } else if (covered) {
    c.fillStyle = cloth; c.beginPath();
    if (o.woman) { c.moveTo(-38, -104); c.quadraticCurveTo(-48, -196, 0, -202); c.quadraticCurveTo(48, -196, 38, -104); c.quadraticCurveTo(0, -118, -38, -104); }
    else { c.moveTo(-34, -110); c.quadraticCurveTo(-44, -190, 0, -198); c.quadraticCurveTo(44, -190, 34, -110); c.quadraticCurveTo(0, -122, -34, -110); }
    c.closePath(); c.fill();
  }
  ell(c, 0, -156, 22, 25, 0, skin);
  if (o.angel) { c.fillStyle = F(o.hair || "#E8B84A"); c.beginPath(); c.ellipse(0, -172, 25, 17, 0, Math.PI, TAU); c.fill(); }
  else if (o.helmet) {
    c.fillStyle = F("#B8863B"); c.beginPath(); c.ellipse(0, -170, 27, 22, 0, Math.PI, TAU); c.fill();
    c.fillRect(-3, -172, 6, 22); poly(c, [-6, -194, 6, -194, 0, -214], F("#B5523B"));
  } else if (o.nemes) {
    c.fillStyle = F("#3F5CA8"); c.beginPath(); c.ellipse(0, -172, 27, 18, 0, Math.PI, TAU); c.fill();
    if (!sil) { c.fillStyle = "#F2C14E"; rr(c, -27, -178, 54, 8, 4); c.fill(); }
  } else if (o.hair && !o.woman) {
    c.fillStyle = hair; c.beginPath(); c.ellipse(0, -170, 24, 18, 0, Math.PI, TAU); c.fill(); ell(c, -20, -160, 6, 12, .2, hair); ell(c, 20, -160, 6, 12, -.2, hair);
  } else {
    c.fillStyle = cloth; c.beginPath(); c.ellipse(0, -174, 27, 18, 0, Math.PI, TAU); c.fill();
  }
  if (o.turban) { ell(c, 0, -186, 30, 22, 0, F(o.turban)); if (!sil) { c.strokeStyle = shade(o.turban, .85); c.lineWidth = 3; c.beginPath(); c.moveTo(-26, -186); c.quadraticCurveTo(0, -172, 26, -186); c.stroke(); } }
  if (o.crown) { poly(c, [-22, -186, -22, -204, -12, -194, 0, -210, 12, -194, 22, -204, 22, -186], F("#F2C14E")); }
  if (!sil) {
    if (covered && !o.woman && !o.turban && !o.crown) { c.fillStyle = band; rr(c, -27, -181, 54, 9, 4.5); c.fill(); }
    if (o.eyesClosed) {
      c.strokeStyle = "#2A1A12"; c.lineWidth = 2.4; c.beginPath(); c.arc(-8, -158, 3.6, .15 * Math.PI, .85 * Math.PI); c.moveTo(11.6, -158); c.arc(8, -158, 3.6, .15 * Math.PI, .85 * Math.PI); c.stroke();
    } else {
      const er = o.child ? 3.3 : 2.8;
      ell(c, -8, -158, er, er + .6, 0, "#2A1A12"); ell(c, 8, -158, er, er + .6, 0, "#2A1A12"); circ(c, -7.1, -159.3, 1, "#fff"); circ(c, 8.9, -159.3, 1, "#fff");
    }
    c.strokeStyle = (o.beard && !o.beardCol) ? "#EDE7DC" : "#3A2618"; c.lineWidth = 2.6; c.beginPath();
    if (o.worried) { c.moveTo(-13, -165); c.lineTo(-4, -168.5); c.moveTo(4, -168.5); c.lineTo(13, -165); }
    else { c.moveTo(-13, -166); c.lineTo(-4, -167.5); c.moveTo(4, -167.5); c.lineTo(13, -166); }
    c.stroke();
    circ(c, -13, -147, 4.2, "rgba(232,112,92,.35)"); circ(c, 13, -147, 4.2, "rgba(232,112,92,.35)");
    c.strokeStyle = shade(o.skin || "#8A5A3C", .75); c.lineWidth = 2.4; c.beginPath(); c.moveTo(-1, -154); c.quadraticCurveTo(3.5, -148, -2, -146); c.stroke();
    if (o.beard) {
      c.fillStyle = o.beardCol || "#F1ECE3";
      c.beginPath(); c.moveTo(-22, -150); c.quadraticCurveTo(-27, -104, 0, -94); c.quadraticCurveTo(27, -104, 22, -150); c.quadraticCurveTo(13, -132, 0, -134); c.quadraticCurveTo(-13, -132, -22, -150); c.closePath(); c.fill();
      c.beginPath(); c.ellipse(-6, -138, 8, 3.6, .25, 0, TAU); c.fill(); c.beginPath(); c.ellipse(6, -138, 8, 3.6, -.25, 0, TAU); c.fill();
    }
    const my = o.beard ? -131 : -140;
    c.strokeStyle = "#5B2E22"; c.lineWidth = 2.4; c.beginPath();
    if (o.mouth === "open") { c.fillStyle = "#5B2E22"; ell(c, 0, my + 1, 4.5, 4, 0, "#5B2E22"); }
    else if (o.mouth === "flat" || o.worried) { c.moveTo(-5, my + 1); c.lineTo(5, my + 1); c.stroke(); }
    else { c.moveTo(-5, my); c.quadraticCurveTo(0, my + 4, 5, my); c.stroke(); }
    if (o.bandage) { c.save(); c.strokeStyle = "#FFFFFF"; c.lineWidth = 7; c.beginPath(); c.moveTo(-24, -172); c.lineTo(24, -164); c.stroke(); circ(c, 10, -167, 3, "#E26D5A"); c.restore(); }
  }
  c.restore();
  c.restore();
}
export function lyingPerson(c: C, x: number, y: number, h: number, o: PersonOpts = {}) {
  c.save(); c.translate(x, y); c.rotate(-Math.PI / 2); person(c, 0, 0, h, o); c.restore();
}
export function baby(c: C, x: number, y: number, s: number, sil?: Sil, rot = 0) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  ell(c, 8, 0, 34, 18, 0, sil || "#F4ECDD");
  if (!sil) { c.strokeStyle = "#DCCFB8"; c.lineWidth = 3; [-4, 10, 24].forEach(xx => { c.beginPath(); c.moveTo(xx, -15); c.quadraticCurveTo(xx + 6, 0, xx, 15); c.stroke(); }); }
  circ(c, -26, -2, 15, sil || "#9B6844");
  if (!sil) {
    ell(c, -28, -12, 14, 7, 0, "#3B2414");
    c.strokeStyle = "#2A1A12"; c.lineWidth = 2; c.beginPath(); c.arc(-31, -1, 3, .15 * Math.PI, .85 * Math.PI); c.moveTo(-18, -1); c.arc(-21, -1, 3, .15 * Math.PI, .85 * Math.PI); c.stroke();
    circ(c, -26, 6, 2, "#5B2E22");
  }
  c.restore();
}

/* ---------- animaux ---------- */
type AOpts = { flip?: boolean; sil?: Sil; raise?: boolean; seed?: number; neckOnly?: boolean; female?: boolean; leaf?: boolean; small?: boolean; saddle?: boolean };
export function elephant(c: C, x: number, y: number, s: number, o: AOpts = {}) {
  const g = o.sil || "#8E97AB", d = o.sil || "#737C92";
  c.save(); c.translate(x, y); c.scale(o.flip ? -s : s, s); c.lineCap = "round";
  c.fillStyle = d; [-48, -22, 18, 42].forEach(lx => { rr(c, lx - 11, -50, 22, 50, 8); c.fill(); });
  ell(c, 0, -70, 62, 44, 0, g);
  c.strokeStyle = d; c.lineWidth = 5; c.beginPath(); c.moveTo(-60, -78); c.quadraticCurveTo(-74, -60, -70, -46); c.stroke();
  circ(c, 58, -92, 34, g); ell(c, 40, -88, 22, 30, -.2, d);
  c.strokeStyle = g; c.lineWidth = 18; c.beginPath(); c.moveTo(84, -84);
  if (o.raise) c.quadraticCurveTo(114, -98, 110, -140); else c.quadraticCurveTo(100, -50, 92, -22);
  c.stroke();
  if (!o.sil) { circ(c, 70, -100, 4, "#2A2340"); circ(c, 71, -101, 1.3, "#fff"); c.strokeStyle = "#FFF8EA"; c.lineWidth = 6; c.beginPath(); c.moveTo(76, -74); c.quadraticCurveTo(88, -66, 95, -72); c.stroke(); }
  c.restore();
}
export function giraffe(c: C, x: number, y: number, s: number, o: AOpts = {}) {
  const b = o.sil || "#F2B84B", sp = o.sil || "#C4732F";
  c.save(); c.translate(x, y); c.scale(o.flip ? -s : s, s); c.lineCap = "round";
  if (!o.neckOnly) {
    c.fillStyle = b; [-34, -18, 18, 34].forEach(lx => { rr(c, lx - 6, -120, 12, 120, 6); c.fill(); });
    ell(c, 0, -128, 48, 28, 0, b);
    c.strokeStyle = b; c.lineWidth = 5; c.beginPath(); c.moveTo(-46, -132); c.lineTo(-56, -100); c.stroke();
  }
  const [bx, by, hx, hy] = o.neckOnly ? [0, 0, 22, -150] : [30, -136, 58, -236];
  c.strokeStyle = b; c.lineWidth = 24; c.beginPath(); c.moveTo(bx, by); c.lineTo(hx, hy); c.stroke();
  ell(c, hx + 14, hy - 4, 24, 14, .25, b); ell(c, hx + 32, hy + 3, 11, 9, .25, o.sil || "#E6A23C");
  c.strokeStyle = sp; c.lineWidth = 5; c.beginPath(); c.moveTo(hx + 4, hy - 14); c.lineTo(hx, hy - 32); c.moveTo(hx + 15, hy - 15); c.lineTo(hx + 15, hy - 34); c.stroke();
  circ(c, hx, hy - 33, 5, sp); circ(c, hx + 15, hy - 35, 5, sp); ell(c, hx - 8, hy - 8, 11, 5, -.5, b);
  if (!o.sil) {
    circ(c, hx + 17, hy - 8, 3.5, "#2A2340");
    const R = rng(o.seed || 7); c.fillStyle = sp;
    for (let i = 0; i < 7; i++) { const t = .08 + R() * .8; ell(c, bx + (hx - bx) * t + (R() - .5) * 8, by + (hy - by) * t, 5 + R() * 3, 4 + R() * 2, R() * 3, sp); }
    if (!o.neckOnly) { c.save(); c.beginPath(); c.ellipse(0, -128, 48, 28, 0, 0, TAU); c.clip(); for (let i = 0; i < 10; i++) ell(c, -38 + R() * 76, -150 + R() * 44, 7 + R() * 4, 5 + R() * 3, R() * 3, sp); c.restore(); }
  }
  c.restore();
}
export function sheep(c: C, x: number, y: number, s: number, o: AOpts = {}) {
  const w = o.sil || "#FFFDF5", k = o.sil || "#3B3340";
  c.save(); c.translate(x, y); c.scale(o.flip ? -s : s, s);
  c.fillStyle = k; [-20, -8, 10, 22].forEach(lx => { rr(c, lx - 4, -26, 8, 26, 4); c.fill(); });
  ([[-22, -40, 18], [0, -48, 20], [22, -40, 18], [-12, -30, 16], [12, -30, 16], [0, -34, 18]] as const).forEach(([a, b, r]) => circ(c, a, b, r, w));
  ell(c, 36, -48, 12, 15, .3, k); ell(c, 26, -57, 7, 4, -.6, k);
  if (!o.sil) circ(c, 40, -52, 2.2, "#fff");
  c.restore();
}
export function lion(c: C, x: number, y: number, s: number, o: AOpts = {}) {
  const body = o.sil || "#E6A846", dk = o.sil || "#C98A2E", mane = o.sil || "#B4602A";
  c.save(); c.translate(x, y); c.scale(o.flip ? -s : s, s); c.lineCap = "round";
  c.fillStyle = dk; [-34, -18, 16, 32].forEach(lx => { rr(c, lx - 6, -34, 13, 34, 6); c.fill(); });
  ell(c, 0, -40, 46, 22, 0, body);
  c.strokeStyle = body; c.lineWidth = 6; c.beginPath(); c.moveTo(-44, -44); c.quadraticCurveTo(-68, -58, -62, -76); c.stroke(); circ(c, -62, -78, 7, mane);
  if (!o.female) circ(c, 44, -58, 30, mane);
  circ(c, 34, -72, 6, dk); circ(c, 58, -72, 6, dk); circ(c, 46, -56, o.female ? 18 : 20, body);
  if (!o.sil) { ell(c, 48, -47, 8, 6, 0, "#F4D08A"); ell(c, 48, -52, 5, 3.4, 0, "#5B2E22"); circ(c, 40, -61, 2.6, "#2A2340"); circ(c, 53, -61, 2.6, "#2A2340"); }
  c.restore();
}
export function dove(c: C, x: number, y: number, s: number, o: AOpts = {}) {
  const w = o.sil || "#FFFFFF", sh = o.sil || "#D5DEEC";
  c.save(); c.translate(x, y); c.scale(o.flip ? -s : s, s);
  poly(c, [-30, 0, -66, -10, -62, 14], sh);
  c.fillStyle = sh; c.beginPath(); c.moveTo(-8, -6); c.quadraticCurveTo(-20, -62, -52, -74); c.quadraticCurveTo(-24, -30, 18, -8); c.closePath(); c.fill();
  ell(c, 0, 0, 36, 18, -.08, w);
  c.fillStyle = w; c.beginPath(); c.moveTo(-2, -8); c.quadraticCurveTo(-4, -58, -30, -80); c.quadraticCurveTo(-6, -36, 22, -6); c.closePath(); c.fill();
  circ(c, 32, -10, 13, w); poly(c, [43, -13, 57, -8, 43, -4], o.sil || "#F2A541");
  if (!o.sil) circ(c, 35, -13, 2.6, "#2A2340");
  if (o.leaf) {
    c.strokeStyle = o.sil || "#5C7D2E"; c.lineWidth = 3; c.beginPath(); c.moveTo(52, -8); c.lineTo(72, 2); c.stroke();
    ell(c, 66, -6, 12, 4.6, -.45, o.sil || "#6FA640"); ell(c, 71, 7, 11, 4.2, .5, o.sil || "#5E9437");
  }
  c.restore();
}
export function camel(c: C, x: number, y: number, s: number, o: AOpts = {}) {
  const b = o.sil || "#D7A665", d = o.sil || "#B98A4E";
  c.save(); c.translate(x, y); c.scale(o.flip ? -s : s, s); c.lineCap = "round";
  c.strokeStyle = d; c.lineWidth = 11; [-40, -24, 22, 38].forEach(lx => { c.beginPath(); c.moveTo(lx, -96); c.lineTo(lx + (lx > 0 ? 3 : -3), -2); c.stroke(); });
  ell(c, 0, -112, 58, 28, 0, b); ell(c, -6, -140, 30, 26, 0, b);
  if (o.saddle && !o.sil) { rr(c, -30, -150, 50, 22, 8); c.fillStyle = "#B5523B"; c.fill(); c.fillStyle = "#F2C14E"; c.fillRect(-30, -134, 50, 5); }
  c.strokeStyle = b; c.lineWidth = 20; c.beginPath(); c.moveTo(44, -118); c.quadraticCurveTo(74, -118, 74, -166); c.stroke();
  ell(c, 88, -172, 22, 12, .15, b); ell(c, 70, -184, 5, 9, -.4, d);
  c.strokeStyle = d; c.lineWidth = 5; c.beginPath(); c.moveTo(-56, -116); c.quadraticCurveTo(-66, -96, -62, -82); c.stroke();
  if (!o.sil) circ(c, 86, -176, 3, "#2A2340");
  c.restore();
}
export function donkey(c: C, x: number, y: number, s: number, o: AOpts = {}) {
  const b = o.sil || "#9C9184", d = o.sil || "#7E7468", m = o.sil || "#D9D2C7";
  c.save(); c.translate(x, y); c.scale(o.flip ? -s : s, s); c.lineCap = "round";
  c.strokeStyle = d; c.lineWidth = 10; [-32, -18, 18, 32].forEach(lx => { c.beginPath(); c.moveTo(lx, -50); c.lineTo(lx, -2); c.stroke(); });
  ell(c, 0, -64, 46, 24, 0, b);
  if (o.saddle && !o.sil) { rr(c, -24, -90, 46, 30, 8); c.fillStyle = "#B5523B"; c.fill(); }
  c.strokeStyle = b; c.lineWidth = 18; c.beginPath(); c.moveTo(34, -72); c.lineTo(50, -104); c.stroke();
  ell(c, 62, -104, 22, 13, .45, b); ell(c, 74, -96, 10, 8, .45, m);
  ell(c, 46, -128, 5, 15, -.25, d); ell(c, 56, -128, 5, 15, .15, d);
  c.strokeStyle = d; c.lineWidth = 4; c.beginPath(); c.moveTo(-44, -68); c.quadraticCurveTo(-56, -50, -52, -36); c.stroke();
  if (!o.sil) circ(c, 60, -110, 3, "#2A2340");
  c.restore();
}
export function fish(c: C, x: number, y: number, s: number, col = "#F0685A", rot = -.5, sil?: Sil) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
  poly(c, [-24, 0, -50, -17, -47, 17], sil || col);
  ell(c, 0, 0, 30, 16, 0, sil || col);
  if (!sil) { ell(c, 4, 4, 18, 7, 0, "rgba(255,255,255,.25)"); circ(c, 16, -4, 3.6, "#2A2340"); }
  c.restore();
}

/* ---------- objets et lieux ---------- */
export function ark(c: C, x: number, y: number, s: number, o: { sil?: Sil; giraffe?: boolean; ribs?: boolean; lit?: boolean; hullDoor?: boolean } = {}) {
  const sil = o.sil, F = (k: string) => sil || k;
  c.save(); c.translate(x, y); c.scale(s, s); c.lineCap = "round"; c.lineJoin = "round";
  const hull = () => { c.beginPath(); c.moveTo(-345, -40); c.quadraticCurveTo(-332, 62, -252, 150); c.quadraticCurveTo(-222, 182, -170, 184); c.lineTo(170, 184); c.quadraticCurveTo(222, 182, 252, 150); c.quadraticCurveTo(332, 62, 345, -40); c.quadraticCurveTo(0, -5, -345, -40); c.closePath(); };
  if (o.giraffe) giraffe(c, 150, -120, 1, { neckOnly: true, sil });
  if (!o.ribs) {
    c.fillStyle = F("#B8743F"); rr(c, -175, -176, 350, 172, 10); c.fill();
    if (!sil) { c.strokeStyle = "rgba(92,48,20,.3)"; c.lineWidth = 4; for (let px = -131; px < 175; px += 44) { c.beginPath(); c.moveTo(px, -168); c.lineTo(px, -10); c.stroke(); } }
    c.fillStyle = F("#7A3F22"); c.beginPath(); c.moveTo(-208, -162); c.lineTo(0, -256); c.lineTo(208, -162); c.quadraticCurveTo(0, -148, -208, -162); c.closePath(); c.fill();
    if (!sil) {
      c.strokeStyle = "#5E2F18"; c.lineWidth = 6; c.beginPath(); c.moveTo(-208, -162); c.lineTo(0, -256); c.lineTo(208, -162); c.stroke();
      c.fillStyle = "#5A2E16"; rr(c, -128, -138, 92, 64, 10); c.fill(); c.fillStyle = o.lit ? "#FFD36A" : "#2C1810"; rr(c, -120, -130, 76, 48, 7); c.fill();
      c.strokeStyle = "#5A2E16"; c.lineWidth = 6; c.beginPath(); c.moveTo(-82, -130); c.lineTo(-82, -82); c.stroke();
      c.fillStyle = "#5A2E16"; rr(c, 36, -134, 78, 128, 12); c.fill(); c.fillStyle = "#8A4A25"; rr(c, 44, -126, 62, 116, 9); c.fill(); circ(c, 95, -66, 5, "#F2C14E");
    }
  }
  if (o.ribs) {
    c.save(); hull(); c.clip();
    c.fillStyle = "#9A5A31"; c.fillRect(-360, 96, 720, 100);
    c.strokeStyle = "#9A5A31"; c.lineWidth = 18; for (let px = -300; px <= 300; px += 75) { c.beginPath(); c.moveTo(px, -60); c.lineTo(px * .92, 200); c.stroke(); }
    c.strokeStyle = "rgba(60,30,12,.4)"; c.lineWidth = 5; c.beginPath(); c.moveTo(-360, 140); c.quadraticCurveTo(0, 165, 360, 140); c.stroke();
    c.restore(); hull(); c.strokeStyle = "#7C4524"; c.lineWidth = 12; c.stroke();
  } else {
    hull(); c.fillStyle = F("#9A5A31"); c.fill();
    if (!sil) {
      c.save(); hull(); c.clip(); c.fillStyle = "#7E4626"; c.fillRect(-360, 118, 720, 90);
      c.strokeStyle = "rgba(58,28,10,.45)"; c.lineWidth = 5; [18, 64, 110, 150].forEach(yy => { c.beginPath(); c.moveTo(-360, yy); c.quadraticCurveTo(0, yy + 24, 360, yy); c.stroke(); });
      c.restore();
      for (let px = -210; px <= 210; px += 105) { if (o.hullDoor && px === -105) continue; circ(c, px, 52, 16, "#5E321A"); circ(c, px, 52, 10, o.lit ? "#FFD36A" : "#3A2014"); }
      if (o.hullDoor) { c.fillStyle = "#5E321A"; rr(c, -138, -8, 94, 116, 12); c.fill(); c.fillStyle = "#2A160C"; rr(c, -130, 0, 78, 104, 9); c.fill(); }
    }
    c.strokeStyle = F("#5E321A"); c.lineWidth = 16; c.beginPath(); c.moveTo(-345, -40); c.quadraticCurveTo(0, -5, 345, -40); c.stroke();
  }
  c.restore();
}
export function tent(c: C, x: number, y: number, s: number, o: { sil?: Sil; col?: string; lit?: boolean } = {}) {
  const col = o.sil || o.col || "#C9A16B", st = o.sil || shade(o.col || "#C9A16B", .78);
  c.save(); c.translate(x, y); c.scale(s, s);
  line(c, [-150, 0, -110, -150], o.sil || "#7A5A3A", 4); line(c, [150, 0, 110, -150], o.sil || "#7A5A3A", 4);
  poly(c, [-130, 0, -100, -150, 0, -176, 100, -150, 130, 0], col);
  if (!o.sil) { c.strokeStyle = st; c.lineWidth = 9; [-70, -24, 24, 70].forEach(px => { c.beginPath(); c.moveTo(px * .78, -158 + Math.abs(px) * .1); c.lineTo(px * 1.08, 0); c.stroke(); }); }
  poly(c, [-34, 0, 0, -112, 34, 0], o.sil ? o.sil : (o.lit ? "#FFC55A" : "#4A3020"));
  if (o.lit && !o.sil) glow(c, 0, -30, 90, "255,200,100", .45);
  c.restore();
}
export function house(c: C, x: number, y: number, w: number, h: number, o: { sil?: Sil; col?: string; lit?: boolean; door?: boolean; sign?: boolean } = {}) {
  const col = o.sil || o.col || "#E8D2A6", dk = o.sil || shade(o.col || "#E8D2A6", .86);
  c.save(); c.translate(x, y);
  c.fillStyle = col; c.fillRect(-w / 2, -h, w, h);
  c.fillStyle = dk; c.fillRect(-w / 2 - 6, -h - 12, w + 12, 14); c.fillRect(w / 2 - w * .18, -h, w * .18, h);
  if (!o.sil) {
    if (o.door !== false) { c.fillStyle = "#7A4A26"; c.beginPath(); c.moveTo(-w * .12, 0); c.lineTo(-w * .12, -h * .45); c.arc(0, -h * .45, w * .12, Math.PI, TAU); c.lineTo(w * .12, 0); c.fill(); }
    c.fillStyle = o.lit ? "#FFD36A" : "#6B4A2E"; rr(c, -w * .38, -h * .78, w * .16, h * .2, 4); c.fill(); rr(c, w * .14, -h * .78, w * .14, h * .2, 4); c.fill();
    if (o.sign) { c.fillStyle = "#8A5A34"; c.fillRect(w * .2, -h * .42, 6, 30); rr(c, w * .2 - 10, -h * .42 + 26, 66, 30, 4); c.fill(); c.fillStyle = "#F2C14E"; ell(c, w * .2 + 23, -h * .42 + 41, 10, 7, 0, "#F2C14E"); }
  }
  c.restore();
}
export function town(c: C, x0: number, x1: number, y: number, seed: number, sil?: Sil, scale = 1) {
  const R = rng(seed); let x = x0;
  while (x < x1) { const w = (70 + R() * 70) * scale, h = (60 + R() * 90) * scale; house(c, x + w / 2, y, w, h, { sil: sil || undefined, col: ["#E8D2A6", "#DDBF8E", "#EFDDB8", "#D9B98A"][Math.floor(R() * 4)], door: R() > .4 }); x += w + 4 * scale; }
}
export function column(c: C, x: number, y: number, h: number, sil?: Sil) {
  c.fillStyle = sil || "#E8D9B5"; c.fillRect(x - 22, y - h, 44, h);
  if (!sil) { c.fillStyle = "#3F5CA8"; c.fillRect(x - 22, y - h + 24, 44, 8); c.fillStyle = "#B5523B"; c.fillRect(x - 22, y - 40, 44, 8); }
  poly(c, [x - 36, y - h, x + 36, y - h, x + 26, y - h + 18, x - 26, y - h + 18], sil || "#D9C48F");
}
export function pyramid(c: C, x: number, y: number, s: number, sil?: Sil) {
  poly(c, [x - 160 * s, y, x, y - 150 * s, x + 160 * s, y], sil || "#E2C27F");
  if (!sil) poly(c, [x, y - 150 * s, x + 160 * s, y, x + 40 * s, y], "#C9A464");
}
export function reeds(c: C, x0: number, x1: number, y: number, seed: number, sil?: Sil) {
  const R = rng(seed);
  for (let x = x0; x < x1; x += 9 + R() * 8) {
    const h = 60 + R() * 70, lean = (R() - .5) * 20;
    line(c, [x, y, x + lean, y - h], sil || (R() > .5 ? "#5E9437" : "#4E8A30"), 4);
    if (R() > .55) ell(c, x + lean, y - h - 6, 4, 11, 0, sil || "#8A5A34");
  }
}
export function basket(c: C, x: number, y: number, s: number, sil?: Sil, bread = false) {
  c.save(); c.translate(x, y); c.scale(s, s);
  if (bread) { ell(c, -14, -16, 16, 10, -.2, sil || "#D9A15B"); ell(c, 12, -18, 16, 10, .2, sil || "#C98A4A"); fish(c, 4, -26, .38, "#8FA7C4", -.4, sil); }
  ell(c, 0, 0, 34, 18, 0, sil || "#B07A3E");
  c.beginPath(); c.moveTo(-34, 0); c.quadraticCurveTo(-30, 26, 0, 28); c.quadraticCurveTo(30, 26, 34, 0); c.closePath(); c.fillStyle = sil || "#C9904F"; c.fill();
  if (!sil) { c.strokeStyle = "#9A6634"; c.lineWidth = 2.5; [-20, -6, 8, 22].forEach(xx => { c.beginPath(); c.moveTo(xx, 2); c.lineTo(xx * .9, 25); c.stroke(); }); c.beginPath(); c.moveTo(-30, 12); c.quadraticCurveTo(0, 22, 30, 12); c.stroke(); }
  c.restore();
}
export function mosesBasket(c: C, x: number, y: number, s: number, sil?: Sil) {
  c.save(); c.translate(x, y); c.scale(s, s);
  ell(c, 0, 0, 80, 26, 0, sil || "#A9773E");
  if (!sil) { ell(c, 0, -6, 70, 18, 0, "#F4ECDD"); }
  baby(c, -6, -14, .8, sil);
  c.beginPath(); c.moveTo(-80, 0); c.quadraticCurveTo(-74, 34, 0, 36); c.quadraticCurveTo(74, 34, 80, 0); c.closePath(); c.fillStyle = sil || "#C9904F"; c.fill();
  if (!sil) { c.strokeStyle = "#9A6634"; c.lineWidth = 3; for (let xx = -60; xx <= 60; xx += 20) { c.beginPath(); c.moveTo(xx, 4); c.lineTo(xx * .9, 32); c.stroke(); } }
  c.restore();
}
export function bushFire(c: C, x: number, y: number, s: number, sil?: Sil) {
  c.save(); c.translate(x, y); c.scale(s, s);
  if (!sil) glow(c, 0, -60, 170, "255,170,60", .6);
  ([[-40, -30, 34], [0, -44, 40], [40, -30, 34], [-20, -60, 30], [22, -62, 30]] as const).forEach(([a, b, r]) => circ(c, a, b, r, sil || "#3E7D3A"));
  const flame = (fx: number, fy: number, k: number, col: string) => { c.fillStyle = col; c.beginPath(); c.moveTo(fx, fy - 70 * k); c.quadraticCurveTo(fx + 30 * k, fy - 20 * k, fx + 18 * k, fy); c.quadraticCurveTo(fx, fy + 10 * k, fx - 18 * k, fy); c.quadraticCurveTo(fx - 30 * k, fy - 20 * k, fx, fy - 70 * k); c.fill(); };
  flame(-30, -50, 1.1, sil || "#F0685A"); flame(10, -64, 1.4, sil || "#F69B3D"); flame(38, -46, 1, sil || "#F0685A");
  if (!sil) { flame(10, -60, .8, "#FFD45C"); flame(-28, -48, .6, "#FFD45C"); }
  c.restore();
}
export function waterWall(c: C, x: number, y: number, w: number, h: number, side: -1 | 1, sil?: Sil) {
  c.save(); c.translate(x, y);
  const g = c.createLinearGradient(0, -h, 0, 0); g.addColorStop(0, "#5AB0E4"); g.addColorStop(1, "#1F5C9A");
  c.fillStyle = sil || g; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -h);
  for (let i = 0; i <= 8; i++) { const yy = -h + i * h / 8; c.quadraticCurveTo(side * (w + (i % 2 ? 18 : -10)), yy - h / 16, side * w, yy); }
  c.lineTo(side * w, 0); c.closePath(); c.fill();
  if (!sil) {
    c.strokeStyle = "rgba(255,255,255,.45)"; c.lineWidth = 5;
    for (let i = 1; i < 8; i++) { const yy = -h + i * h / 8; c.beginPath(); c.moveTo(side * (w - 6), yy); c.quadraticCurveTo(side * (w - 40), yy + 20, side * (w - 70), yy + 10); c.stroke(); }
  }
  c.restore();
}
export function stones(c: C, x: number, y: number, n: number, s: number, sil?: Sil) {
  for (let i = 0; i < n; i++) ell(c, x + i * 26 * s, y + (i % 2) * 6 * s, 11 * s, 8 * s, (i % 3) * .3, sil || ["#B8BCC8", "#9AA0AE", "#C9CCD6"][i % 3]);
}
export function stream(c: C, x0: number, x1: number, y: number, h: number) {
  c.fillStyle = "#5AB0E4"; c.beginPath(); c.moveTo(x0, y); c.quadraticCurveTo((x0 + x1) / 2, y - 20, x1, y); c.lineTo(x1, y + h); c.quadraticCurveTo((x0 + x1) / 2, y + h + 20, x0, y + h); c.closePath(); c.fill();
  c.strokeStyle = "rgba(255,255,255,.5)"; c.lineWidth = 4; for (let x = x0 + 30; x < x1 - 30; x += 90) { c.beginPath(); c.moveTo(x, y + h / 2); c.quadraticCurveTo(x + 20, y + h / 2 - 8, x + 40, y + h / 2); c.stroke(); }
}
export function manger(c: C, x: number, y: number, s: number, sil?: Sil, withBaby = true) {
  c.save(); c.translate(x, y); c.scale(s, s);
  line(c, [-70, 0, -40, -70], sil || "#7A4A26", 10); line(c, [70, 0, 40, -70], sil || "#7A4A26", 10);
  line(c, [-40, 0, -70, -70], sil || "#6B3F20", 10); line(c, [40, 0, 70, -70], sil || "#6B3F20", 10);
  if (!sil) { c.strokeStyle = "#E8C25A"; c.lineWidth = 4; for (let i = 0; i < 16; i++) { const xx = -66 + i * 8.8; c.beginPath(); c.moveTo(xx, -92); c.lineTo(xx + (i % 2 ? 10 : -10), -112); c.stroke(); } }
  if (withBaby) baby(c, 0, -104, .95, sil);
  poly(c, [-80, -100, 80, -100, 64, -60, -64, -60], sil || "#9A5A31");
  if (!sil) { c.strokeStyle = "#7E4626"; c.lineWidth = 3; c.beginPath(); c.moveTo(-74, -86); c.lineTo(74, -86); c.stroke(); }
  c.restore();
}
export function shelter(c: C, x: number, y: number, w: number, h: number) {
  line(c, [x - w / 2, y, x - w / 2, y - h], "#6B3F20", 14); line(c, [x + w / 2, y, x + w / 2, y - h], "#6B3F20", 14);
  poly(c, [x - w / 2 - 50, y - h + 10, x, y - h - 70, x + w / 2 + 50, y - h + 10, x + w / 2 + 50, y - h + 30, x, y - h - 48, x - w / 2 - 50, y - h + 30], "#C9A16B");
  c.strokeStyle = "#A9814B"; c.lineWidth = 4; for (let i = -4; i <= 4; i++) { c.beginPath(); c.moveTo(x + i * w / 9, y - h - 60 + Math.abs(i) * 14); c.lineTo(x + i * w / 7.5, y - h + 26); c.stroke(); }
}
export function gift(c: C, x: number, y: number, s: number, col = "#E0B43A", sil?: Sil) {
  c.save(); c.translate(x, y); c.scale(s, s);
  rr(c, -20, -32, 40, 32, 5); c.fillStyle = sil || col; c.fill();
  if (!sil) { c.fillStyle = "#B5523B"; c.fillRect(-3, -32, 6, 32); c.fillRect(-20, -18, 40, 6); }
  c.restore();
}
export function crowd(c: C, x0: number, x1: number, y: number, rows: number, seed: number, scale = 1, sil?: Sil, flip = false) {
  const R = rng(seed);
  const robes = ["#D8A257", "#B5523B", "#5DA9A0", "#4F7FC0", "#8E6BB5", "#C9873B", "#7FA7C9", "#E07A5F", "#6DAA5C", "#A4785A"];
  const cloths = ["#F2E6CB", "#E8D6B0", "#F3EFE6", "#E07A5F", "#5DA9A0", "#F2C14E"];
  const skins = ["#8A5A3C", "#9B6844", "#7A4E33", "#A36F4B"];
  for (let r = 0; r < rows; r++) {
    const k = (.7 + r * .15) * scale, yy = y + r * 34 * scale;
    for (let x = x0 + (r % 2) * 28 * scale; x < x1; x += (46 + R() * 22) * k) {
      const w = R() > .5;
      person(c, x, yy, 150 * k, { sil, flip: flip ? R() > .3 : R() > .7, robe: robes[Math.floor(R() * robes.length)], cloth: cloths[Math.floor(R() * cloths.length)], skin: skins[Math.floor(R() * skins.length)], woman: w, beard: !w && R() > .5, beardCol: R() > .5 ? "#3A2618" : undefined, band: robes[Math.floor(R() * robes.length)] });
    }
  }
}
export function sycamore(c: C, x: number, y: number, s: number, sil?: Sil, part: "all" | "back" | "front" = "all") {
  c.save(); c.translate(x, y); c.scale(s, s);
  if (part !== "front") {
    c.fillStyle = sil || "#7A4A26"; c.beginPath(); c.moveTo(-34, 0); c.quadraticCurveTo(-24, -120, -40, -220); c.lineTo(40, -220); c.quadraticCurveTo(24, -120, 34, 0); c.closePath(); c.fill();
    line(c, [-30, -200, -170, -300], sil || "#7A4A26", 26); line(c, [30, -210, 170, -290], sil || "#7A4A26", 24); line(c, [0, -220, 10, -360], sil || "#7A4A26", 22);
    ([[-200, -340, 90], [-90, -380, 100], [40, -410, 105], [170, -340, 95], [-140, -280, 70], [120, -290, 70]] as const).forEach(([a, b, r]) => circ(c, a, b, r, sil || "#4E9D4A"));
  }
  if (part !== "back" && !sil) {
    ([[-230, -290, 50], [230, -300, 48], [-60, -320, 48], [80, -330, 44]] as const).forEach(([a, b, r]) => circ(c, a, b, r, "#5BAA52"));
    ([[-170, -360, 22], [60, -430, 26], [190, -360, 20]] as const).forEach(([a, b, r]) => circ(c, a, b, r, "#7FC46E"));
  }
  c.restore();
}
export function coinsPile(c: C, x: number, y: number, s: number, sil?: Sil) {
  for (let i = 0; i < 5; i++) ell(c, x, y - i * 6 * s, 18 * s, 7 * s, 0, sil || (i % 2 ? "#E0B43A" : "#F2C14E"));
  for (let i = 0; i < 3; i++) ell(c, x + 34 * s, y - i * 6 * s, 18 * s, 7 * s, 0, sil || (i % 2 ? "#E0B43A" : "#F2C14E"));
  if (!sil) { rr(c, x - 70 * s, y - 40 * s, 40 * s, 40 * s, 12 * s); c.fillStyle = "#A9773E"; c.fill(); circ(c, x - 50 * s, y - 42 * s, 6 * s, "#7A4A26"); }
}
export function road(c: C, w: number, h: number, y0: number, col = "#E2C79A") {
  c.fillStyle = col; c.beginPath(); c.moveTo(w * .44, y0); c.bezierCurveTo(w * .62, y0 + (h - y0) * .3, w * .08, y0 + (h - y0) * .6, w * .2, h);
  c.lineTo(w * .62, h); c.bezierCurveTo(w * .48, y0 + (h - y0) * .6, w * .9, y0 + (h - y0) * .3, w * .5, y0); c.closePath(); c.fill();
}
export function rocks(c: C, x: number, y: number, s: number, seed: number, sil?: Sil) {
  const R = rng(seed);
  for (let i = 0; i < 4; i++) { const rx = (30 + R() * 30) * s, ry = (20 + R() * 20) * s; ell(c, x + (R() - .5) * 120 * s, y - ry * .5, rx, ry, R(), sil || ["#B9A88E", "#A8957A", "#C9BBA2"][i % 3]); }
}
export function table(c: C, x: number, y: number, w: number) {
  c.fillStyle = "#8A5A34"; c.fillRect(x - w / 2, y - 70, w, 14); c.fillRect(x - w / 2 + 10, y - 60, 12, 60); c.fillRect(x + w / 2 - 22, y - 60, 12, 60);
}
