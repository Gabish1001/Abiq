import type { LevelDef, WorldDef } from "./types";
import { NOE, ABRAHAM, MOISE, DAVID } from "./levels-at";
import { JESUS, GARCON, ZACHEE, SAMARITAIN } from "./levels-nt";

export * from "./types";

/** Contenu de départ : chargé dans Supabase par seed.sql, et utilisé tel quel en mode démo. */
export const WORLDS: WorldDef[] = [
  { id: "m1", position: 1, title: "Les premières promesses", subtitle: "Ancien Testament" },
  { id: "m2", position: 2, title: "La bonne nouvelle", subtitle: "Nouveau Testament" }
];

export const LEVELS: LevelDef[] = [NOE, ABRAHAM, MOISE, DAVID, JESUS, GARCON, ZACHEE, SAMARITAIN];

export const VALUES = ["Fidélité", "Confiance", "Persévérance", "Courage", "L'amour de Dieu", "Générosité", "Pardon", "Amour du prochain", "Sagesse"];
