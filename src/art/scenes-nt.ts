import {
  type C, type PersonOpts, sky, sun, moon, cloud, peak, hill, ground, sea, palm, stars, bigStar, glow, circ, ell, poly, line, rr,
  person, lyingPerson, baby, sheep, camel, donkey, fish, house, town, manger, shelter, gift, crowd, sycamore, coinsPile, road, rocks,
  table, basket, sparkle
} from "./primitives";
import type { LevelArt } from "./types";

export const Q = {
  jesus: { hair: "#3B2414", longHair: true, beard: true, beardCol: "#3B2414", robe: "#F1ECE2", robeShade: "#D9D1C2", band: "#B5523B", skin: "#9B6844" } as PersonOpts,
  marie: { woman: true, robe: "#4C7CC9", cloth: "#F3EFE6", skin: "#9B6844" } as PersonOpts,
  joseph: { beard: true, beardCol: "#4A3020", robe: "#A4785A", cloth: "#E8D6B0", band: "#5E9437" } as PersonOpts,
  angel: { angel: true, robe: "#FBF8FF", robeShade: "#E3DDF3", band: "#F2C14E", hair: "#E8B84A", skin: "#A36F4B" } as PersonOpts,
  berger: { robe: "#C9873B", cloth: "#F2E6CB", band: "#7A4A26", beard: true, beardCol: "#3A2618", staff: true } as PersonOpts,
  berger2: { robe: "#8E7B5E", cloth: "#E8D6B0", band: "#B5523B", hair: "#2B1A10", staff: true, skin: "#7A4E33" } as PersonOpts,
  boy: { child: true, hair: "#2B1A10", robe: "#E8833A", band: "#5DA9A0", skin: "#9B6844" } as PersonOpts,
  andre: { beard: true, beardCol: "#3A2618", robe: "#5DA9A0", cloth: "#E8D6B0", band: "#C9873B", skin: "#8A5A3C" } as PersonOpts,
  philippe: { beard: true, beardCol: "#2B1A10", robe: "#C9873B", cloth: "#F2E6CB", band: "#4F7FC0", skin: "#7A4E33" } as PersonOpts,
  zachee: { beard: true, beardCol: "#2B1A10", robe: "#7B4FA0", cloth: "#E8D6B0", band: "#F2C14E", skin: "#A36F4B" } as PersonOpts,
  samaritain: { beard: true, beardCol: "#3A2618", robe: "#C9873B", cloth: "#F2E6CB", band: "#B5523B", skin: "#8A5A3C" } as PersonOpts,
  blesse: { robe: "#9AA0AE", robeShade: "#808694", cloth: "#D9D4C7", band: "#6B7280", beard: true, beardCol: "#2B1A10", bandage: true, eyesClosed: true, skin: "#9B6844" } as PersonOpts,
  pretre: { robe: "#F3EFE6", robeShade: "#DCD3C0", turban: "#FFFFFF", band: "#4F7FC0", beard: true, beardCol: "#5A4632", skin: "#A36F4B" } as PersonOpts,
  scribe: { robe: "#3F5CA8", cloth: "#F3EFE6", band: "#F2C14E", beard: true, beardCol: "#7A6A5A", hold: "scroll", skin: "#8A5A3C" } as PersonOpts
};
const portrait = (c: C, o: PersonOpts, x = 262) => person(c, x, 830, 680, o);
function grassBand(c: C, W: number, y: number, col: string) {
  c.fillStyle = col; c.beginPath(); c.moveTo(0, y); for (let x = 0; x <= W; x += 40) c.quadraticCurveTo(x + 20, y - 14, x + 40, y); c.lineTo(W, y + 900); c.lineTo(0, y + 900); c.closePath(); c.fill();
}
function bread5(c: C, x: number, y: number, s: number, sil?: string) {
  [[0, 0], [44, -6], [88, 0], [22, -30], [66, -34]].forEach(([dx, dy]) => ell(c, x + dx * s, y + dy * s, 24 * s, 15 * s, 0, sil || "#D9A15B"));
  fish(c, x + 150 * s, y - 20 * s, .9 * s, "#8FA7C4", 0, sil); fish(c, x + 150 * s, y + 18 * s, .9 * s, "#7F98B8", 0, sil);
}
function cup(c: C, x: number, y: number) { poly(c, [x - 12, y - 30, x + 12, y - 30, x + 8, y - 8, x - 8, y - 8], "#C98A52"); rr(c, x - 10, y - 8, 20, 8, 3); c.fillStyle = "#A86E3E"; c.fill(); }

/* ======================= JÉSUS ======================= */
export const jesusArt: LevelArt = {
  mysteryHead: [.456, .643],
  puzzle(c) {
    const W = 1000, H = 1000;
    sky(c, W, H, "night"); stars(c, W, 470, 44, 240); moon(c, 860, 120, 38);
    hill(c, 250, 560, 520, 90, "#24306E"); town(c, 0, 1000, 560, 3, "#1E2A66", .9);
    ground(c, W, H, 560, "#3D3150");
    shelter(c, 500, 900, 600, 450);
    glow(c, 500, 760, 330, "255,220,140", .55);
    c.strokeStyle = "#E8C25A"; c.lineWidth = 4; for (let i = 0; i < 40; i++) { const x = 150 + (i * 37) % 700, y = 900 + (i * 13) % 60; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 14, y - 10); c.stroke(); }
    person(c, 315, 900, 280, { ...Q.marie, hold: null, right: "forward" });
    manger(c, 500, 880, 1.35);
    person(c, 690, 905, 300, { ...Q.joseph, staff: true, flip: true });
    sheep(c, 860, 945, .95, { flip: true });
    person(c, 925, 965, 250, { ...Q.berger, flip: true });
  },
  mystery(c, S, stage) {
    if (stage >= 1) town(c, 0, 1000, 330, 3, S, .9);
    if (stage >= 3) { person(c, 820, 470, 230, { ...Q.angel, sil: S }); sheep(c, 140, 930, 1.3, { sil: S }); }
    if (stage >= 2) { person(c, 270, 880, 280, { ...Q.marie, sil: S }); person(c, 730, 885, 300, { ...Q.joseph, staff: true, flip: true, sil: S }); }
    manger(c, 500, 820, 1.7, S);
  },
  card(c) {
    sky(c, 600, 640, "night"); stars(c, 600, 380, 18, 160);
    glow(c, 300, 470, 300, "255,220,140", .6);
    c.fillStyle = "#4A3B4C"; c.fillRect(0, 560, 600, 80);
    this.cardFigure(c, null);
  },
  cardFigure(c, S) { manger(c, 300, 600, 2.4, S || undefined); },
  pages: {
    s1(c) {
      const W = 1000, H = 625; sky(c, W, H, "indoor");
      rr(c, 120, 120, 220, 170, 16); c.fillStyle = "#8CCBEE"; c.fill(); line(c, [230, 120, 230, 290], "#B8936A", 10); line(c, [120, 205, 340, 205], "#B8936A", 10);
      ground(c, W, H, 520, "#C9A464");
      rr(c, 760, 380, 160, 140, 10); c.fillStyle = "#A9773E"; c.fill();
      person(c, 360, 600, 240, { ...Q.marie, mouth: "open", left: "carry", right: "carry" });
      person(c, 660, 590, 270, { ...Q.angel, right: "point", flip: true });
    },
    s2(c) {
      const W = 1000, H = 625; sky(c, W, H, "night"); stars(c, W, 300, 9, 160);
      ground(c, W, H, 420, "#3D3150");
      shelter(c, 500, 580, 520, 330); glow(c, 500, 480, 260, "255,220,140", .55);
      person(c, 330, 590, 230, { ...Q.marie, right: "forward" });
      manger(c, 500, 585, 1.05);
      person(c, 680, 595, 245, { ...Q.joseph, staff: true, flip: true });
    },
    s3(c) {
      const W = 1000, H = 625; sky(c, W, H, "night"); stars(c, W, 340, 17, 220);
      for (let i = 0; i < 18; i++) sparkle(c, 200 + (i * 71) % 600, 60 + (i * 37) % 200, 8 + (i % 3) * 3, "#FFF3C4");
      person(c, 500, 330, 230, { ...Q.angel, wave: true });
      hill(c, 250, 540, 520, 100, "#28306A"); hill(c, 800, 560, 420, 90, "#212A5E"); ground(c, W, H, 560, "#2F2A50");
      sheep(c, 140, 580, .8); sheep(c, 230, 600, .75, { flip: true }); sheep(c, 820, 590, .8); sheep(c, 900, 605, .7, { flip: true });
      person(c, 330, 610, 220, { ...Q.berger, mouth: "open" });
      person(c, 640, 612, 210, { ...Q.berger2, flip: true });
    },
    s4(c) {
      const W = 1000, H = 625; sky(c, W, H, "night"); stars(c, W, 280, 23, 140);
      ground(c, W, H, 420, "#3D3150");
      shelter(c, 640, 590, 460, 320); glow(c, 640, 490, 250, "255,220,140", .55);
      person(c, 520, 595, 215, { ...Q.marie, right: "forward" });
      manger(c, 660, 590, 1);
      person(c, 800, 600, 230, { ...Q.joseph, staff: true, flip: true });
      sheep(c, 330, 605, .8);
      person(c, 250, 600, 220, { ...Q.berger });
      person(c, 120, 605, 200, { ...Q.berger2 });
    },
    s5(c) {
      const W = 1000, H = 625; sky(c, W, H, "night"); stars(c, W, 300, 27, 160);
      bigStar(c, 720, 90, 26);
      town(c, 0, 1000, 470, 14, "#1E2A66", .9); ground(c, W, H, 470, "#4A3B4C");
      house(c, 720, 520, 260, 200, { lit: true, col: "#DDBF8E" });
      camel(c, 120, 560, .7, { saddle: true });
      person(c, 300, 600, 225, { robe: "#8E6BB5", cloth: "#F2C14E", crown: true, beard: true, beardCol: "#EDE7DC", hold: "gift", skin: "#7A4E33" });
      person(c, 420, 605, 230, { robe: "#B5523B", turban: "#F2C14E", beard: true, beardCol: "#2B1A10", hold: "jar", skin: "#9B6844" });
      person(c, 540, 600, 220, { robe: "#2E9E68", cloth: "#F3EFE6", crown: true, hold: "gift", skin: "#5E3A24" });
    }
  }
};

/* ======================= LE GARÇON AUX CINQ PAINS ======================= */
export const garconArt: LevelArt = {
  mysteryHead: [.5, .61],
  puzzle(c) {
    const W = 1000, H = 1000;
    sky(c, W, H, "day"); cloud(c, 160, 120, .8); cloud(c, 720, 80, .6); sun(c, 900, 130, 46);
    sea(c, W, H, 360, ["#6BBBE8", "#55ADE3"]);
    hill(c, 300, 560, 620, 190, "#9ED07A"); hill(c, 860, 600, 420, 160, "#8CC96B");
    crowd(c, 20, 980, 470, 3, 31, .55);
    grassBand(c, W, 650, "#8CC96B");
    person(c, 210, 880, 300, { ...Q.andre });
    person(c, 410, 905, 270, { ...Q.boy, hold: "basket" });
    person(c, 660, 880, 340, { ...Q.jesus, left: "forward", right: "forward", flip: true });
    [[80, 960], [520, 970], [880, 950], [300, 985]].forEach(([x, y]) => { circ(c, x, y, 7, "#FFFFFF"); circ(c, x, y, 3, "#F2C14E"); });
  },
  mystery(c, S, stage) {
    if (stage >= 1) crowd(c, 0, 1000, 930, 1, 5, .75, S);
    if (stage >= 2) bread5(c, 90, 220, 1.3, S);
    if (stage >= 3) for (let i = 0; i < 12; i++) basket(c, 560 + (i % 6) * 70, 130 + Math.floor(i / 6) * 70, .85, S, true);
    person(c, 500, 850, 300, { ...Q.boy, hold: "basket", sil: S });
  },
  card(c) {
    sky(c, 600, 640, "day"); sea(c, 600, 640, 300, ["#6BBBE8", "#55ADE3"]); hill(c, 300, 520, 420, 120, "#9ED07A");
    this.cardFigure(c, null);
  },
  cardFigure(c, S) { person(c, 300, 700, 560, { ...Q.boy, hold: "basket", sil: S }); },
  pages: {
    s1(c) {
      const W = 1000, H = 625; sky(c, W, H, "day"); sea(c, W, H, 260, ["#6BBBE8", "#55ADE3"]);
      hill(c, 700, 470, 520, 220, "#9ED07A"); ground(c, W, H, 560, "#8CC96B");
      person(c, 760, 300, 160, { ...Q.jesus, wave: true });
      crowd(c, 40, 600, 470, 3, 41, .65, null, true);
    },
    s2(c) {
      const W = 1000, H = 625; sky(c, W, H, "day"); sea(c, W, H, 260, ["#6BBBE8", "#55ADE3"]);
      hill(c, 500, 430, 700, 110, "#9ED07A"); crowd(c, 30, 970, 400, 2, 51, .5); grassBand(c, W, 470, "#8CC96B");
      person(c, 380, 610, 260, { ...Q.jesus, right: "forward" });
      person(c, 620, 612, 245, { ...Q.philippe, worried: true, flip: true });
    },
    s3(c) {
      const W = 1000, H = 625; sky(c, W, H, "day"); sea(c, W, H, 260, ["#6BBBE8", "#55ADE3"]);
      hill(c, 500, 430, 700, 110, "#9ED07A"); crowd(c, 30, 970, 400, 2, 61, .5); grassBand(c, W, 470, "#8CC96B");
      person(c, 240, 610, 245, { ...Q.andre, right: "point" });
      person(c, 440, 615, 175, { ...Q.boy, hold: "basket" });
      person(c, 700, 608, 260, { ...Q.jesus, flip: true });
    },
    s4(c) {
      const W = 1000, H = 625; sky(c, W, H, "day"); sun(c, 500, 80, 40);
      hill(c, 500, 470, 760, 160, "#9ED07A");
      crowd(c, 20, 980, 470, 3, 71, .6); grassBand(c, W, 545, "#8CC96B");
      person(c, 500, 430, 230, { ...Q.jesus, holdUp: "bread" });
    },
    s5(c) {
      const W = 1000, H = 625; sky(c, W, H, "soft"); sea(c, W, H, 250, ["#6BBBE8", "#55ADE3"]);
      hill(c, 500, 420, 760, 110, "#9ED07A"); crowd(c, 20, 980, 380, 2, 81, .55); grassBand(c, W, 455, "#8CC96B");
      for (let i = 0; i < 12; i++) basket(c, 110 + (i % 6) * 156, 515 + Math.floor(i / 6) * 70, 1.3, undefined, true);
    }
  }
};

/* ======================= ZACHÉE ======================= */
export const zacheeArt: LevelArt = {
  mysteryHead: [.5, .5],
  puzzle(c) {
    const W = 1000, H = 1000;
    sky(c, W, H, "desert"); sun(c, 120, 120, 50); cloud(c, 380, 110, .7);
    town(c, 0, 1000, 560, 19); palm(c, 70, 600, 1.2); palm(c, 260, 590, .9);
    ground(c, W, H, 560, "#E2C79A");
    sycamore(c, 700, 960, 1.2, undefined, "back");
    person(c, 600, 560, 180, { ...Q.zachee, wave: true, mouth: "open" });
    circ(c, 640, 585, 34, "#5BAA52"); circ(c, 580, 595, 26, "#4E9D4A");
    person(c, 330, 900, 320, { ...Q.jesus, wave: true });
    crowd(c, 0, 1000, 990, 1, 92, .9);
  },
  mystery(c, S, stage) {
    if (stage >= 2) sycamore(c, 520, 1000, 1.3, S, "back");
    if (stage >= 1) coinsPile(c, 190, 930, 2.2, S);
    if (stage >= 3) person(c, 810, 940, 320, { ...Q.jesus, wave: true, sil: S });
    person(c, 500, 700, 260, { ...Q.zachee, wave: true, sil: S });
  },
  card(c) {
    sky(c, 600, 640, "desert");
    sycamore(c, 330, 1020, 1.25, undefined, "back");
    this.cardFigure(c, null);
    circ(c, 120, 620, 60, "#5BAA52"); circ(c, 520, 600, 70, "#4E9D4A");
  },
  cardFigure(c, S) { person(c, 300, 760, 520, { ...Q.zachee, wave: true, mouth: "open", sil: S }); },
  pages: {
    s1(c) {
      const W = 1000, H = 625; sky(c, W, H, "desert");
      house(c, 300, 520, 480, 330); ground(c, W, H, 520, "#E2C79A");
      table(c, 360, 600, 260); coinsPile(c, 380, 532, 1.1);
      person(c, 240, 610, 200, { ...Q.zachee, hold: "coins" });
      person(c, 700, 605, 220, { robe: "#5DA9A0", cloth: "#F2E6CB", beard: true, beardCol: "#2B1A10", mouth: "flat", flip: true });
      person(c, 820, 610, 200, { woman: true, robe: "#E07A5F", cloth: "#F3EFE6", mouth: "flat", flip: true });
    },
    s2(c) {
      const W = 1000, H = 625; sky(c, W, H, "desert"); town(c, 0, 1000, 470, 23, null, .85);
      ground(c, W, H, 470, "#E2C79A");
      sycamore(c, 640, 680, .95, undefined, "back");
      c.save(); c.translate(600, 420); c.rotate(-.25); person(c, 0, 0, 160, { ...Q.zachee, left: "up", right: "up" }); c.restore();
      crowd(c, 0, 1000, 600, 1, 33, .75);
    },
    s3(c) {
      const W = 1000, H = 625; sky(c, W, H, "desert");
      ground(c, W, H, 470, "#E2C79A");
      sycamore(c, 700, 700, 1, undefined, "back");
      person(c, 640, 360, 150, { ...Q.zachee, mouth: "open", wave: true });
      person(c, 330, 600, 250, { ...Q.jesus, wave: true });
      crowd(c, 0, 1000, 630, 1, 44, .75);
    },
    s4(c) {
      const W = 1000, H = 625; sky(c, W, H, "desert"); town(c, 0, 1000, 470, 29, null, .9);
      ground(c, W, H, 470, "#E2C79A");
      person(c, 380, 605, 205, { ...Q.zachee, hold: "coins", mouth: "open" });
      person(c, 590, 610, 215, { woman: true, robe: "#9AA0AE", cloth: "#D9D4C7", flip: true, left: "forward" });
      person(c, 690, 612, 130, { child: true, robe: "#B9A88E", hair: "#2B1A10", flip: true });
    },
    s5(c) {
      const W = 1000, H = 625; sky(c, W, H, "indoor");
      rr(c, 780, 140, 120, 110, 10); c.fillStyle = "#F0A06A"; c.fill();
      ground(c, W, H, 500, "#C9A464");
      person(c, 330, 610, 250, { ...Q.jesus, right: "forward" });
      person(c, 680, 615, 205, { ...Q.zachee, flip: true, mouth: "open", left: "forward" });
      table(c, 505, 640, 300); ell(c, 470, 568, 24, 14, 0, "#D9A15B"); ell(c, 520, 566, 22, 13, 0, "#C98A4A"); cup(c, 580, 572); cup(c, 420, 572);
    }
  }
};

/* ======================= LE BON SAMARITAIN ======================= */
export const samaritainArt: LevelArt = {
  mysteryHead: [.5, .59],
  puzzle(c) {
    const W = 1000, H = 1000;
    sky(c, W, H, "desert"); sun(c, 860, 120, 48);
    peak(c, 220, 520, 300, 560, "#B48A6A"); peak(c, 620, 520, 220, 520, "#C49A78"); peak(c, 900, 520, 260, 420, "#9C7458");
    ground(c, W, H, 500, "#D9B98A"); road(c, W, H, 500);
    rocks(c, 120, 640, 1.2, 3); rocks(c, 880, 700, 1.1, 5); rocks(c, 150, 960, 1.4, 9);
    person(c, 520, 560, 95, { ...Q.pretre, flip: true });
    donkey(c, 820, 780, 1.25, { flip: true, saddle: true });
    lyingPerson(c, 840, 935, 300, Q.blesse);
    c.save(); c.translate(380, 940); c.rotate(.24); person(c, 0, 0, 330, { ...Q.samaritain, hold: "bandage" }); c.restore();
  },
  mystery(c, S, stage) {
    if (stage >= 1) { c.save(); c.globalAlpha = .4; road(c, 1000, 1000, 520, S); c.restore(); rocks(c, 120, 720, 1.3, 3, S); }
    if (stage >= 3) { house(c, 820, 430, 220, 170, { sil: S, sign: true }); donkey(c, 820, 920, 1.2, { sil: S, flip: true }); }
    if (stage >= 2) lyingPerson(c, 380, 940, 230, { ...Q.blesse, sil: S });
    person(c, 500, 840, 320, { ...Q.samaritain, hold: "bandage", sil: S });
  },
  card(c) {
    sky(c, 600, 640, "desert"); peak(c, 150, 520, 260, 500, "#B48A6A"); peak(c, 520, 540, 220, 420, "#C49A78");
    this.cardFigure(c, null);
  },
  cardFigure(c, S) { donkey(c, 480, 660, 2.2, { flip: true, saddle: true, sil: S }); portrait(c, { ...Q.samaritain, hold: "bandage", sil: S }, 250); },
  pages: {
    s1(c) {
      const W = 1000, H = 625; sky(c, W, H, "soft");
      town(c, 0, 1000, 470, 51, null, .85); ground(c, W, H, 470, "#D9C49A");
      crowd(c, 520, 1000, 520, 1, 13, .7, null, true);
      person(c, 300, 610, 250, { ...Q.jesus, right: "forward" });
      person(c, 560, 612, 240, { ...Q.scribe, flip: true, mouth: "open" });
    },
    s2(c) {
      const W = 1000, H = 625; sky(c, W, H, "desert");
      peak(c, 200, 400, 220, 520, "#B48A6A"); peak(c, 720, 400, 260, 620, "#C49A78");
      ground(c, W, H, 390, "#D9B98A"); road(c, W, H, 390);
      rocks(c, 180, 520, 1.3, 11); rocks(c, 820, 560, 1.2, 17);
      lyingPerson(c, 640, 560, 220, Q.blesse);
    },
    s3(c) {
      const W = 1000, H = 625; sky(c, W, H, "desert");
      peak(c, 260, 400, 220, 560, "#B48A6A"); peak(c, 780, 400, 240, 560, "#C49A78");
      ground(c, W, H, 390, "#D9B98A"); road(c, W, H, 390);
      rocks(c, 120, 600, 1.2, 21);
      lyingPerson(c, 380, 575, 200, Q.blesse);
      person(c, 760, 540, 220, { ...Q.pretre, flip: false });
    },
    s4(c) {
      const W = 1000, H = 625; sky(c, W, H, "dawn");
      peak(c, 300, 420, 200, 600, "#C49A78"); ground(c, W, H, 420, "#D9B98A");
      house(c, 820, 560, 280, 220, { sign: true, lit: true });
      person(c, 410, 520, 150, { ...Q.blesse, eyesClosed: false });
      donkey(c, 420, 600, 1.35, { saddle: true });
      person(c, 590, 605, 230, { ...Q.samaritain, reach: true, flip: true });
    },
    s5(c) {
      const W = 1000, H = 625; sky(c, W, H, "dusk");
      hill(c, 500, 470, 700, 100, "#8C6A54"); ground(c, W, H, 480, "#C9A16B"); road(c, W, H, 480, "#E2C79A");
      person(c, 330, 610, 250, { ...Q.jesus, right: "point" });
      person(c, 620, 612, 240, { ...Q.scribe, flip: true });
    }
  }
};

void palm; void baby; void gift; void table;
