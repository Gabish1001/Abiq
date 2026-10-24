// Génère favicon.svg et les icônes PNG de l'application (PWA, écran d'accueil).
// Usage : npm run icons   (nécessite Playwright, utilisé seulement pour convertir le SVG en PNG)
import { writeFileSync } from "node:fs";

const LUMI = `
  <path d="M25 63c-12-3-14 14-1 13" fill="none" stroke="#A44C29" stroke-width="6" stroke-linecap="round"/>
  <path d="M22 68c0-14 18-21 38-19 16 1 28 4 40 1 7-2 11 4 7 8-8 6-14 10-18 16-6 12-21 18-35 18-18 0-32-9-32-24z" fill="#CC6B3F"/>
  <path d="M28 79c10 9 38 11 56 1-6 8-17 12-30 12-12 0-21-5-26-13z" fill="#A9512E" opacity=".6"/>
  <ellipse cx="53" cy="51" rx="13" ry="3.8" fill="#7A3518"/><ellipse cx="55" cy="93" rx="17" ry="3.6" fill="#8C3F1E"/>
  <path d="M104 16c7 12 12 22 6 30-4 5-11 3-12-3-1-7 4-14 6-27z" fill="#F6B82F"/><path d="M104 29c3 7 5 12 2 16-2 2-5 1-5-2-1-4 2-8 3-14z" fill="#FFF1C2"/>
  <ellipse cx="44" cy="68" rx="3.6" ry="4.6" fill="#2B1A12"/><ellipse cx="64" cy="68" rx="3.6" ry="4.6" fill="#2B1A12"/>
  <circle cx="45.3" cy="66.3" r="1.3" fill="#fff"/><circle cx="65.3" cy="66.3" r="1.3" fill="#fff"/>
  <path d="M48.5 76q5.5 4.5 11 0" fill="none" stroke="#2B1A12" stroke-width="2.6" stroke-linecap="round"/>
  <circle cx="37" cy="75" r="4" fill="#F28C6B" opacity=".75"/><circle cx="71" cy="75" r="4" fill="#F28C6B" opacity=".75"/>`;

/** pad : marge (0..0.5) ; round : rayon des coins (0 = carré plein, pour l'icône « maskable »). */
const icon = (pad = 0.14, round = 0.22) => {
  const s = 512, inner = s * (1 - 2 * pad), k = inner / 130, ox = (s - 130 * k) / 2, oy = (s - 104 * k) / 2 + s * 0.02;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s} ${s}">
  <defs>
    <radialGradient id="bg" cx="50%" cy="25%" r="85%"><stop offset="0" stop-color="#22378F"/><stop offset=".55" stop-color="#13215C"/><stop offset="1" stop-color="#0B1543"/></radialGradient>
    <radialGradient id="gl"><stop offset="0" stop-color="#FFE3A1" stop-opacity=".95"/><stop offset=".45" stop-color="#F6B82F" stop-opacity=".35"/><stop offset="1" stop-color="#F6B82F" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="${s}" height="${s}" rx="${s * round}" fill="url(#bg)"/>
  <g transform="translate(${ox} ${oy}) scale(${k})"><circle cx="105" cy="40" r="34" fill="url(#gl)"/>${LUMI}</g>
</svg>`;
};

writeFileSync("public/favicon.svg", icon(0.08, 0.22));
console.log("public/favicon.svg");

let chromium;
try { ({ chromium } = await import("playwright")); }
catch {
  try { const { createRequire } = await import("node:module"); ({ chromium } = createRequire(import.meta.url)("playwright")); }
  catch { console.log("Playwright absent : PNG non générés."); process.exit(0); }
}
const browser = await chromium.launch();
const page = await browser.newPage();
const out = [["icon-192.png", 192, icon(0.12, 0.22)], ["icon-512.png", 512, icon(0.12, 0.22)], ["icon-maskable-512.png", 512, icon(0.22, 0)], ["apple-touch-icon.png", 180, icon(0.14, 0)]];
for (const [name, size, svg] of out) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<html><body style="margin:0;background:transparent">${svg.replace("<svg ", `<svg width="${size}" height="${size}" `)}</body></html>`);
  await page.screenshot({ path: `public/${name}`, omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } });
  console.log(`public/${name}`);
}
await browser.close();
