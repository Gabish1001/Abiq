import type { C } from "./primitives";

export type Painter = (c: C) => void;

/** Illustrations d'un niveau.
 *  puzzle : 1000×1000 · pages : 1000×625 · carte : 600×640.
 *  mystery dessine seulement les silhouettes (le fond parchemin est ajouté par le moteur).
 *  cardFigure sert aussi à la silhouette du teaser. */
export type LevelArt = {
  mysteryHead: [number, number];
  puzzle: Painter;
  mystery: (c: C, sil: string, stage: number) => void;
  card: (this: LevelArt, c: C) => void;
  cardFigure: (c: C, sil: string | null) => void;
  pages: Record<string, Painter>;
};
