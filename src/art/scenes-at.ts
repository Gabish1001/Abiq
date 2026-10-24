import {
  type C, type PersonOpts, sky, sun, moon, cloud, rainbow, peak, hill, ground, sea, tree, palm, rain, stars, glow, circ, ell, poly, line, rr,
  person, elephant, giraffe, sheep, lion, dove, camel, fish, ark, tent, town, column, pyramid, reeds, mosesBasket, bushFire, waterWall,
  stones, stream, crowd, shade
} from "./primitives";
import type { LevelArt } from "./types";

/* Personnages récurrents */
export const P = {
  noe: { beard: true } as PersonOpts,
  abraham: { beard: true, beardCol: "#CFC8BE", robe: "#B5523B", cloth: "#EADBB8", band: "#5E9437" } as PersonOpts,
  sara: { woman: true, robe: "#5DA9A0", cloth: "#E8D6B0", skin: "#9B6844" } as PersonOpts,
  moise: { beard: true, beardCol: "#8A7563", robe: "#4F7FC0", cloth: "#F3EFE6", band: "#F2C14E", skin: "#7A4E33" } as PersonOpts,
  pharaon: { nemes: true, robe: "#F3EFE6", robeShade: "#DCD3C0", band: "#F2C14E", skin: "#A36F4B", staff: true, staffCol: "#F2C14E" } as PersonOpts,
  david: { hair: "#2B1A10", robe: "#6DAA5C", band: "#C9873B", skin: "#9B6844" } as PersonOpts,
  goliath: { helmet: true, armor: true, robe: "#7A2E2E", beard: true, beardCol: "#2B1A10", spear: true } as PersonOpts,
  saul: { crown: true, beard: true, beardCol: "#2B1A10", robe: "#7B4FA0", cloth: "#F3EFE6", band: "#F2C14E" } as PersonOpts,
  samuel: { beard: true, robe: "#5E6FB0", cloth: "#F3EFE6", band: "#F2C14E" } as PersonOpts
};
const portrait = (c: C, o: PersonOpts, x = 262) => person(c, x, 830, 680, o);

/* ======================= NOÉ ======================= */
export const noeArt: LevelArt = {
  mysteryHead: [.262, .44],
  puzzle(c) {
    const W = 1000, H = 1000;
    sky(c, W, H, "day"); sun(c, 160, 160, 66);
    cloud(c, 300, 260, .85); cloud(c, 800, 110, .62, "rgba(255,255,255,.9)");
    rainbow(c, 640, 700, 470, 24, .9);
    peak(c, 840, 700, 340, 430, "#8E7DB5", true); peak(c, 650, 700, 200, 300, "#A495C6");
    sea(c, W, H, 690, ["#6BBBE8", "#55ADE3"]);
    ark(c, 500, 640, .95, { giraffe: true });
    elephant(c, 748, 612, .9, { raise: true });
    person(c, 262, 612, 210, { ...P.noe, wave: true });
    dove(c, 850, 262, 1.3, { flip: true, leaf: true });
    sea(c, W, H, 792, ["#3D8FD0", "#2C73B6", "#215C9C"], 40);
    fish(c, 880, 905, 1.1);
    ([[90, 880, 10], [120, 925, 7], [66, 950, 12], [150, 965, 6]] as const).forEach(([a, b, r]) => circ(c, a, b, r, "rgba(255,255,255,.55)"));
  },
  mystery(c, S, stage) {
    if (stage >= 1) {
      c.save(); c.strokeStyle = "rgba(58,46,94,.3)"; c.lineWidth = 5; c.lineCap = "round";
      [800, 850, 900].forEach((yy, i) => { c.beginPath(); for (let x = 40 + i * 30; x < 960; x += 120) { c.moveTo(x, yy); c.quadraticCurveTo(x + 30, yy - 14, x + 60, yy); } c.stroke(); });
      c.restore();
      ark(c, 500, 640, .95, { sil: S, giraffe: stage >= 2 });
    }
    if (stage >= 2) elephant(c, 748, 612, .9, { raise: true, sil: S });
    if (stage >= 3) dove(c, 850, 262, 1.3, { flip: true, leaf: true, sil: S });
    person(c, 262, 612, 210, { sil: S, wave: true });
  },
  card(c) {
    sky(c, 600, 640, "soft"); rainbow(c, 300, 700, 440, 24, .85);
    cloud(c, 20, 560, .8); cloud(c, 470, 600, .7);
    this.cardFigure(c, null);
  },
  cardFigure(c, S) {
    portrait(c, { ...P.noe, wave: true, sil: S });
    dove(c, 490, 142, 1.15, { flip: true, leaf: true, sil: S });
  },
  pages: {
    s1(c) {
      const W = 1000, H = 625; sky(c, W, H, "soft");
      c.save(); c.globalAlpha = .3;
      ([[-.42, -.3], [-.16, -.04], [.08, .2], [.32, .44]] as const).forEach(([a, b]) => poly(c, [560, -30, 560 + a * 1500, H, 560 + b * 1500, H], "#FFF6D0"));
      c.restore();
      cloud(c, 90, 150, .75); cloud(c, 780, 120, .6);
      hill(c, 230, 470, 430, 130, "#A5D57F"); hill(c, 840, 490, 360, 150, "#8CC96B");
      ground(c, W, H, 515, "#7EBE5F");
      c.fillStyle = "#EBD6A4"; c.beginPath(); c.moveTo(330, H); c.quadraticCurveTo(470, 560, 640, 515); c.lineTo(690, 517); c.quadraticCurveTo(560, 575, 540, H); c.closePath(); c.fill();
      tree(c, 110, 525, 1.15); tree(c, 905, 520, .95);
      sheep(c, 700, 585, 1); sheep(c, 790, 565, .85, { flip: true }); sheep(c, 620, 610, .9);
      person(c, 455, 590, 250, { ...P.noe, staff: true });
    },
    s2(c) {
      const W = 1000, H = 625; sky(c, W, H, "day"); sun(c, 890, 105, 50); cloud(c, 120, 130, .8); cloud(c, 520, 80, .55);
      hill(c, 180, 520, 380, 80, "#A5D57F"); hill(c, 720, 530, 420, 70, "#9BD077");
      ground(c, W, H, 520, "#86C266");
      c.fillStyle = "#6E3E22"; [490, 600, 720, 830].forEach(px => { rr(c, px - 14, 510, 28, 24, 4); c.fill(); });
      ark(c, 660, 400, .68, { ribs: true });
      ["#C07A45", "#A8653A", "#C98A52", "#B06D3E"].forEach((col, i) => { c.fillStyle = col; rr(c, 30 + i * 8, 590 - i * 17, 220, 16, 6); c.fill(); });
      person(c, 290, 600, 225, { ...P.noe, hammer: true });
      person(c, 450, 612, 205, { beard: true, beardCol: "#3A2618", robe: "#7FA7C9", cloth: "#EADBB8", band: "#2E9E68", plank: true });
    },
    s3(c) {
      const W = 1000, H = 625; sky(c, W, H, "soft");
      cloud(c, 70, 120, .95, "#DDE3EE"); cloud(c, 400, 80, .8, "#CED6E6"); cloud(c, 760, 120, 1, "#D6DDEA");
      hill(c, 880, 520, 300, 90, "#9BD077"); ground(c, W, H, 505, "#8BC56A");
      ark(c, 730, 388, .6, { hullDoor: true });
      poly(c, [652, 452, 704, 452, 600, 585, 520, 585], "#8A4E2A");
      for (let i = 1; i < 6; i++) { const t = i / 6; line(c, [652 + (520 - 652) * t, 452 + 133 * t, 704 + (600 - 704) * t, 452 + 133 * t], "rgba(58,28,10,.4)", 4); }
      person(c, 680, 454, 80, { ...P.noe, wave: true });
      giraffe(c, 95, 560, .72, { seed: 3 }); giraffe(c, 175, 568, .78, { seed: 8 });
      elephant(c, 300, 575, .58); elephant(c, 395, 580, .62);
      lion(c, 250, 612, .78, { female: true }); lion(c, 345, 616, .82);
      sheep(c, 470, 606, .8); sheep(c, 540, 598, .74);
    },
    s4(c) {
      const W = 1000, H = 625; sky(c, W, H, "storm");
      cloud(c, 40, 110, 1.15, "#56658C"); cloud(c, 360, 70, 1.25, "#4E5D84"); cloud(c, 700, 110, 1.1, "#56658C");
      rain(c, W, H, 11, .45); sea(c, W, H, 410, ["#41709F", "#365F8F"]);
      ark(c, 500, 322, .62, { lit: true });
      sea(c, W, H, 445, ["#2C5A8C", "#244D7C", "#1C3F69"], 70); rain(c, W, H * .8, 4, .3);
    },
    s5(c) {
      const W = 1000, H = 625; sky(c, W, H, "day"); sun(c, 130, 110, 46); cloud(c, 470, 95, .7);
      peak(c, 820, 470, 250, 380, "#8E7DB5", true); peak(c, 965, 470, 160, 260, "#A495C6");
      sea(c, W, H, 455, ["#62B5E6", "#4C9FDB"]);
      ark(c, 410, 372, .6);
      person(c, 262, 355, 118, { ...P.noe, reach: true });
      dove(c, 700, 200, 1.25, { flip: true, leaf: true });
      sea(c, W, H, 478, ["#3F8FD2", "#3079BD", "#2563A2"], 30);
    },
    s6(c) {
      const W = 1000, H = 625; sky(c, W, H, "day"); rainbow(c, 470, 600, 440, 22, .9); cloud(c, 60, 130, .7);
      peak(c, 800, 520, 330, 460, "#8E7DB5", true); peak(c, 640, 520, 180, 300, "#A495C6");
      ark(c, 800, 330, .26);
      hill(c, 250, 560, 520, 80, "#93CD70"); ground(c, W, H, 560, "#86C266");
      person(c, 150, 606, 150, { beard: true, beardCol: "#3A2618", robe: "#7FA7C9", cloth: "#EADBB8", band: "#2E9E68" });
      person(c, 230, 598, 165, { ...P.noe, wave: true });
      person(c, 310, 604, 148, { woman: true, robe: "#C9B7E0", cloth: "#F0685A" });
      giraffe(c, 455, 598, .62, { seed: 5 }); elephant(c, 575, 604, .62, { raise: true });
      sheep(c, 860, 612, .75); sheep(c, 930, 604, .68, { flip: true });
    }
  }
};

/* ======================= ABRAHAM ======================= */
function campfire(c: C, x: number, y: number, s: number) {
  glow(c, x, y - 30 * s, 120 * s, "255,170,80", .55);
  line(c, [x - 34 * s, y, x + 30 * s, y - 12 * s], "#6B3F20", 10 * s); line(c, [x - 30 * s, y - 12 * s, x + 34 * s, y], "#7A4A26", 10 * s);
  poly(c, [x - 22 * s, y - 6 * s, x, y - 70 * s, x + 22 * s, y - 6 * s], "#F69B3D"); poly(c, [x - 10 * s, y - 6 * s, x + 2 * s, y - 44 * s, x + 12 * s, y - 6 * s], "#FFD45C");
}
export const abrahamArt: LevelArt = {
  mysteryHead: [.5, .573],
  puzzle(c) {
    const W = 1000, H = 1000;
    sky(c, W, H, "dusk"); stars(c, W, 560, 31, 230); moon(c, 170, 150, 46);
    hill(c, 260, 700, 560, 120, "#5B4B6B"); hill(c, 820, 710, 420, 140, "#4A3F5E");
    ground(c, W, H, 700, "#B98B5E"); hill(c, 820, 790, 420, 60, "#C99A68");
    tent(c, 190, 770, 1.15, { lit: true });
    camel(c, 760, 800, 1.35, { saddle: true });
    person(c, 420, 815, 300, { ...P.abraham, staff: true, wave: true });
    person(c, 570, 822, 250, { ...P.sara, hold: "baby" });
    campfire(c, 660, 900, 1);
    sheep(c, 110, 905, 1.1); sheep(c, 225, 935, 1, { flip: true }); sheep(c, 890, 940, 1);
    hill(c, 500, 1010, 760, 60, "#A97E52");
  },
  mystery(c, S, stage) {
    if (stage >= 2) { [[160, 160, 34], [300, 90, 22], [420, 210, 28], [620, 120, 30], [770, 220, 24], [880, 110, 32]].forEach(([x, y, r]) => { c.save(); c.translate(x, y); poly(c, [0, -r, r * .3, -r * .3, r, 0, r * .3, r * .3, 0, r, -r * .3, r * .3, -r, 0, -r * .3, -r * .3], S); c.restore(); }); }
    if (stage >= 1) { camel(c, 790, 860, 1.15, { sil: S }); tent(c, 170, 860, .9, { sil: S }); }
    if (stage >= 3) { person(c, 330, 880, 230, { ...P.sara, sil: S, hold: "baby" }); }
    person(c, 500, 830, 330, { ...P.abraham, staff: true, wave: true, sil: S });
  },
  card(c) {
    sky(c, 600, 640, "night"); stars(c, 600, 420, 12, 140); moon(c, 500, 90, 30);
    glow(c, 470, 180, 120, "255,236,170", .35);
    this.cardFigure(c, null);
  },
  cardFigure(c, S) { portrait(c, { ...P.abraham, wave: true, sil: S }, 250); },
  pages: {
    s1(c) {
      const W = 1000, H = 625; sky(c, W, H, "desert"); sun(c, 880, 100, 44); cloud(c, 420, 110, .6);
      hill(c, 700, 520, 520, 70, "#E2C27F"); town(c, 0, 330, 520, 5); palm(c, 370, 525, 1);
      ground(c, W, H, 515, "#D9B97E");
      c.fillStyle = "#EBD6A4"; c.beginPath(); c.moveTo(300, H); c.quadraticCurveTo(520, 560, 1000, 540); c.lineTo(1000, 580); c.quadraticCurveTo(600, 600, 520, H); c.closePath(); c.fill();
      person(c, 470, 600, 205, { ...P.sara });
      person(c, 590, 592, 232, { ...P.abraham, staff: true, reach: true, flip: false });
      sheep(c, 760, 590, .9); sheep(c, 840, 600, .8, { flip: true });
    },
    s2(c) {
      const W = 1000, H = 625; sky(c, W, H, "desert"); sun(c, 140, 110, 52);
      hill(c, 250, 520, 480, 90, "#E2B87A"); hill(c, 820, 540, 460, 110, "#D4A868"); ground(c, W, H, 545, "#E8C48C");
      camel(c, 250, 580, .85, { saddle: true }); person(c, 380, 585, 165, { robe: "#A4785A", cloth: "#F2E6CB", beard: true, beardCol: "#3A2618", staff: true });
      camel(c, 520, 592, .92, { saddle: true });
      sheep(c, 650, 600, .75); sheep(c, 700, 610, .7); sheep(c, 610, 615, .7, { flip: true });
      person(c, 820, 605, 210, { ...P.abraham, staff: true });
      person(c, 730, 598, 185, { ...P.sara });
    },
    s3(c) {
      const W = 1000, H = 625; sky(c, W, H, "night"); stars(c, W, 470, 5, 320); moon(c, 120, 90, 34);
      hill(c, 300, 520, 520, 70, "#2B2850"); ground(c, W, H, 520, "#4A3B4C");
      tent(c, 770, 565, 1, { lit: true });
      glow(c, 470, 120, 200, "255,236,170", .25);
      person(c, 380, 600, 265, { ...P.abraham, staff: true, wave: true });
    },
    s4(c) {
      const W = 1000, H = 625; sky(c, W, H, "desert"); sun(c, 900, 90, 40);
      ground(c, W, H, 500, "#D9B97E");
      tree(c, 250, 520, 2.3);
      tent(c, 800, 565, 1.1);
      person(c, 776, 562, 150, { ...P.sara, flip: true });
      poly(c, [800, 565 - 112 * 1.1, 800 + 37 * 1.1, 565, 800 + 6, 565], "#C9A16B");
      [120, 220, 320].forEach((x, i) => person(c, x, 590 + (i % 2) * 6, 190, { robe: "#F3EFE6", robeShade: "#DCD3C0", cloth: "#FFFFFF", band: "#B9B2D6", beard: true, beardCol: "#5A4632", skin: ["#8A5A3C", "#7A4E33", "#9B6844"][i] }));
      person(c, 520, 600, 215, { ...P.abraham, hold: "jar", flip: true });
    },
    s5(c) {
      const W = 1000, H = 625; sky(c, W, H, "dawn"); sun(c, 820, 470, 70);
      hill(c, 300, 520, 520, 70, "#C9A06E"); ground(c, W, H, 520, "#D9B97E");
      tent(c, 180, 560, 1);
      person(c, 470, 600, 225, { ...P.sara, hold: "baby" });
      person(c, 600, 604, 240, { ...P.abraham, staff: true, mouth: "open" });
      sheep(c, 760, 605, .85); sheep(c, 860, 600, .8, { flip: true });
    }
  }
};

/* ======================= MOÏSE ======================= */
function seaCrossing(c: C, W: number, H: number, horizon: number, wall: number) {
  ground(c, W, H, horizon, "#E2C27F");
  waterWall(c, 0, H, wall, H - horizon + 260, 1); waterWall(c, W, H, wall, H - horizon + 260, -1);
  poly(c, [wall, H, W - wall, H, W / 2 + 26, horizon, W / 2 - 26, horizon], "#E9D2A0");
  for (let i = 0; i < 14; i++) ell(c, wall + 30 + ((i * 97) % (W - 2 * wall - 60)), horizon + 40 + ((i * 53) % (H - horizon - 60)), 10, 5, 0, "rgba(160,120,70,.35)");
  fish(c, wall * .45, H - (H - horizon) * .55, .9, "#F0685A", .2); fish(c, W - wall * .5, H - (H - horizon) * .35, .8, "#F2C14E", 2.9);
}
export const moiseArt: LevelArt = {
  mysteryHead: [.5, .59],
  puzzle(c) {
    const W = 1000, H = 1000;
    sky(c, W, H, "day"); cloud(c, 120, 140, .8); cloud(c, 700, 90, .7); sun(c, 880, 150, 52);
    seaCrossing(c, W, H, 420, 330);
    crowd(c, 380, 620, 470, 3, 11, .55);
    person(c, 500, 960, 330, { ...P.moise, staffUp: true });
    ell(c, 500, 975, 120, 18, 0, "rgba(120,90,50,.25)");
  },
  mystery(c, S, stage) {
    if (stage >= 3) { waterWall(c, 0, 960, 170, 620, 1, S); waterWall(c, 1000, 960, 170, 620, -1, S); }
    if (stage >= 1) { reeds(c, 60, 360, 960, 4, S); mosesBasket(c, 230, 905, 1.3, S); }
    if (stage >= 2) bushFire(c, 790, 380, 1.15, S);
    person(c, 500, 840, 320, { ...P.moise, staffUp: true, sil: S });
  },
  card(c) {
    const g = c.createLinearGradient(0, 0, 0, 640); g.addColorStop(0, "#9CD3F2"); g.addColorStop(1, "#E9D2A0"); c.fillStyle = g; c.fillRect(0, 0, 600, 640);
    waterWall(c, 0, 640, 150, 600, 1); waterWall(c, 600, 640, 150, 600, -1);
    this.cardFigure(c, null);
  },
  cardFigure(c, S) { portrait(c, { ...P.moise, staffUp: true, sil: S }, 270); },
  pages: {
    s1(c) {
      const W = 1000, H = 625; sky(c, W, H, "desert"); sun(c, 880, 90, 40);
      pyramid(c, 160, 330, 1); pyramid(c, 360, 330, .7);
      ground(c, W, H, 320, "#9ED07A");
      c.fillStyle = "#4C9FDB"; c.fillRect(0, 380, W, H - 380);
      sea(c, W, H, 395, ["#5AB0E4", "#4C9FDB"]);
      reeds(c, 0, 280, 560, 3); reeds(c, 640, 1000, 560, 7);
      mosesBasket(c, 450, 470, 1.6);
      reeds(c, 300, 380, 520, 9);
      person(c, 860, 376, 230, { woman: true, robe: "#F3EFE6", robeShade: "#DCD3C0", cloth: "#F3EFE6", skin: "#A36F4B", reach: true, flip: true });
    },
    s2(c) {
      const W = 1000, H = 625; sky(c, W, H, "desert");
      peak(c, 700, 560, 380, 620, "#B48A6A"); peak(c, 920, 560, 240, 400, "#9C7458");
      ground(c, W, H, 540, "#C9A16B");
      bushFire(c, 700, 520, 1.3);
      sheep(c, 110, 580, .9); sheep(c, 200, 600, .85, { flip: true }); sheep(c, 520, 600, .8);
      person(c, 340, 605, 245, { ...P.moise, robe: "#A4785A", band: "#5E9437", staff: true, mouth: "open" });
    },
    s3(c) {
      const W = 1000, H = 625; sky(c, W, H, "indoor");
      column(c, 90, 560, 520); column(c, 910, 560, 520); column(c, 270, 560, 520); column(c, 730, 560, 520);
      ground(c, W, H, 560, "#C9A464");
      rr(c, 560, 300, 150, 230, 16); c.fillStyle = "#E0B43A"; c.fill(); rr(c, 580, 420, 110, 40, 8); c.fillStyle = "#3F5CA8"; c.fill();
      person(c, 640, 600, 250, { ...P.pharaon, flip: true, mouth: "flat" });
      person(c, 340, 605, 240, { ...P.moise, staff: true, right: "point", mouth: "open" });
    },
    s4(c) {
      const W = 1000, H = 625;
      sky(c, W, H, "day"); cloud(c, 380, 80, .6);
      seaCrossing(c, W, H, 260, 300);
      crowd(c, 380, 640, 330, 3, 21, .5);
      person(c, 760, 610, 230, { ...P.moise, staffUp: true, flip: true });
    },
    s5(c) {
      const W = 1000, H = 625; sky(c, W, H, "day"); sun(c, 120, 100, 44);
      sea(c, W, H, 300, ["#62B5E6", "#4C9FDB", "#3F8FD2"]); ground(c, W, H, 430, "#E2C27F");
      person(c, 150, 590, 200, { woman: true, robe: "#E07A5F", cloth: "#F2E6CB", holdUp: "tambourine" });
      person(c, 280, 600, 205, { woman: true, robe: "#5DA9A0", cloth: "#F2C14E", holdUp: "tambourine", flip: true });
      person(c, 410, 592, 215, { robe: "#C9873B", cloth: "#F3EFE6", beard: true, beardCol: "#3A2618", wave: true });
      person(c, 540, 600, 200, { woman: true, robe: "#8E6BB5", cloth: "#F3EFE6", holdUp: "tambourine" });
      person(c, 820, 604, 240, { ...P.moise, staff: true, wave: true, flip: true });
    }
  }
};

/* ======================= DAVID ======================= */
export const davidArt: LevelArt = {
  mysteryHead: [.42, .6],
  puzzle(c) {
    const W = 1000, H = 1000;
    sky(c, W, H, "day"); cloud(c, 380, 150, .8); cloud(c, 760, 90, .6);
    hill(c, 150, 600, 430, 160, "#8CC96B"); hill(c, 860, 600, 430, 180, "#7FB95F");
    tent(c, 90, 470, .35, { col: "#C98A52" }); tent(c, 930, 445, .35, { col: "#B5523B" });
    crowd(c, 30, 280, 520, 1, 4, .35); crowd(c, 740, 990, 500, 1, 6, .35, null, true);
    ground(c, W, H, 640, "#9ED07A");
    stream(c, 0, 1000, 880, 56); stones(c, 110, 912, 5, 1.3);
    person(c, 760, 860, 520, { ...P.goliath, flip: true, mouth: "open" });
    person(c, 300, 860, 250, { ...P.david, sling: true });
    sheep(c, 110, 820, 1.05);
  },
  mystery(c, S, stage) {
    if (stage >= 2) person(c, 790, 860, 620, { ...P.goliath, flip: true, sil: S });
    if (stage >= 1) { sheep(c, 150, 880, 1.4, { sil: S }); sheep(c, 250, 930, 1.2, { sil: S, flip: true }); }
    if (stage >= 3) stones(c, 330, 960, 5, 2, S);
    person(c, 420, 830, 300, { ...P.david, sling: true, sil: S });
  },
  card(c) {
    sky(c, 600, 640, "day"); hill(c, 100, 560, 360, 140, "#8CC96B"); hill(c, 520, 600, 320, 150, "#7FB95F");
    sheep(c, 500, 640, 1.6, { flip: true });
    this.cardFigure(c, null);
  },
  cardFigure(c, S) { portrait(c, { ...P.david, sling: true, sil: S }, 240); },
  pages: {
    s1(c) {
      const W = 1000, H = 625; sky(c, W, H, "day"); sun(c, 880, 90, 42);
      town(c, 0, 1000, 470, 12, null, .9); ground(c, W, H, 470, "#C9B98A");
      [[90, "#B5523B"], [190, "#4F7FC0"], [290, "#8E6BB5"]].forEach(([x, col], i) => person(c, x as number, 600 + (i % 2) * 4, 235, { robe: col as string, cloth: "#F2E6CB", beard: true, beardCol: "#2B1A10", band: "#F2C14E", skin: "#9B6844" }));
      person(c, 520, 610, 185, { ...P.david, eyesClosed: true });
      person(c, 650, 600, 240, { ...P.samuel, right: "up", flip: true });
      poly(c, [575, 352, 600, 330, 612, 342, 586, 362], "#C9A464");
      [[566, 392], [558, 410], [572, 420]].forEach(([x, y]) => ell(c, x, y, 4, 6, 0, "#F2C14E"));
    },
    s2(c) {
      const W = 1000, H = 625; sky(c, W, H, "day"); cloud(c, 200, 90, .7);
      hill(c, 820, 470, 360, 130, "#7FB95F"); hill(c, 160, 500, 340, 110, "#8CC96B");
      ground(c, W, H, 520, "#9ED07A");
      crowd(c, 20, 330, 470, 2, 8, .55);
      person(c, 760, 470, 360, { ...P.goliath, flip: true, mouth: "open" });
    },
    s3(c) {
      const W = 1000, H = 625; sky(c, W, H, "day");
      tent(c, 500, 520, 2.2, { col: "#C25B4A" });
      ground(c, W, H, 520, "#B9A06E");
      person(c, 640, 605, 255, { ...P.saul, flip: true });
      person(c, 380, 610, 200, { ...P.david, right: "point", mouth: "open" });
      sheep(c, 160, 600, .8);
    },
    s4(c) {
      const W = 1000, H = 625; sky(c, W, H, "soft");
      hill(c, 500, 430, 600, 90, "#8CC96B"); ground(c, W, H, 430, "#9ED07A");
      stream(c, 0, 1000, 520, 70); stones(c, 380, 560, 6, 1.4);
      person(c, 520, 545, 220, { ...P.david, right: "low", left: "down" });
      line(c, [590, 418, 600, 470], "#7A4A26", 5);
    },
    s5(c) {
      const W = 1000, H = 625; sky(c, W, H, "day"); cloud(c, 600, 90, .7);
      hill(c, 500, 470, 620, 90, "#8CC96B"); ground(c, W, H, 470, "#9ED07A");
      ell(c, 760, 600, 170, 26, 0, "rgba(180,150,100,.4)");
      c.save(); c.translate(690, 610); c.rotate(.55); person(c, 0, 0, 330, { ...P.goliath, eyesClosed: true, flip: true }); c.restore();
      person(c, 260, 605, 230, { ...P.david, sling: true });
    }
  }
};

void shade; void ell;
