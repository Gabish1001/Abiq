import { allArtKeys, artURL, drawMystery, artSize } from "../art";
const g = document.getElementById("g")!;
const only = new URLSearchParams(location.search).get("level");
(async () => {
  for (const key of allArtKeys().filter(k => !only || k.startsWith(only + "/"))) {
    const f = document.createElement("figure");
    const img = document.createElement("img"); img.src = await artURL(key);
    const [w, h] = artSize(key); img.style.height = (h > w ? 260 : 240) + "px";
    f.append(img, Object.assign(document.createElement("figcaption"), { textContent: key })); g.append(f);
  }
  const lv = only ? [only] : ["noe", "abraham", "moise", "david", "jesus", "garcon", "zachee", "samaritain"];
  for (const l of lv) for (const st of [0, 3]) {
    const f = document.createElement("figure"); const cv = document.createElement("canvas"); cv.width = 400; cv.height = 400;
    drawMystery(cv, l, st); f.append(cv, Object.assign(document.createElement("figcaption"), { textContent: `${l} mystère ${st}` })); g.append(f);
  }
  document.body.dataset.ready = "1";
})();
