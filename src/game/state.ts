import type { LevelContent } from "@/content/types";

export type Step = "mystery" | "puzzle" | "story" | "quiz" | "reward";
export const STEPS: Step[] = ["mystery", "puzzle", "story", "quiz", "reward"];

/** Partie en cours d'un niveau (sauvegardée dans progress.state). */
export type PlayState = {
  v: 1;
  at: Step;
  clues: number;
  guess: { picked: number[]; right: boolean; at: number };
  puzzle: { n: number; order: number[] | null; hints: number; peeks: number; solved: boolean; t0: number | null; t1: number | null };
  story: { page: number; seen: number[]; heard: number[] };
  quiz: { i: number; wrong: number[]; picked: number[][]; done: boolean[]; hinted: boolean[]; seq: number[] };
  startedAt: number;
  endedAt: number | null;
  cheered?: boolean;
};

/** Résumé utile aux adultes (sauvegardé dans progress.stats). */
export type PlayStats = {
  clues: number;
  guessedAt: number | null;      // nombre d'indices vus au moment de la bonne réponse, null si pas deviné
  guessWrong: number;
  puzzlePieces: number;
  puzzleMs: number | null;
  puzzleHints: number;
  puzzlePeeks: number;
  storySeen: number;
  storyHeard: number;
  storyPages: number;
  quizFirstTry: number;
  quizTotal: number;
  quiz: { id: string; short: string; wrong: number; hinted: boolean; done: boolean }[];
  durationMs: number | null;
};

export function newPlayState(content: LevelContent, n = 3): PlayState {
  const q = content.quiz.length;
  return {
    v: 1, at: "mystery", clues: 0,
    guess: { picked: [], right: false, at: 0 },
    puzzle: { n, order: null, hints: 0, peeks: 0, solved: false, t0: null, t1: null },
    story: { page: 0, seen: [], heard: [] },
    quiz: { i: 0, wrong: Array(q).fill(0), picked: Array.from({ length: q }, () => []), done: Array(q).fill(false), hinted: Array(q).fill(false), seq: [] },
    startedAt: Date.now(), endedAt: null
  };
}

/** Répare un état enregistré par une version précédente ou pour un contenu modifié depuis. */
export function sanitizeState(s: unknown, content: LevelContent, n = 3): PlayState {
  const base = newPlayState(content, n);
  if (!s || typeof s !== "object" || (s as PlayState).v !== 1) return base;
  const st = s as PlayState;
  const q = content.quiz.length;
  const fix = <T,>(arr: T[] | undefined, fill: () => T) => Array.from({ length: q }, (_, i) => (arr && arr[i] !== undefined ? arr[i] : fill()));
  return {
    ...base, ...st,
    guess: { ...base.guess, ...(st.guess || {}) },
    puzzle: { ...base.puzzle, ...(st.puzzle || {}) },
    story: { ...base.story, ...(st.story || {}), page: Math.min(st.story?.page ?? 0, content.story.length - 1) },
    quiz: {
      i: Math.min(st.quiz?.i ?? 0, q - 1),
      wrong: fix(st.quiz?.wrong, () => 0), picked: fix(st.quiz?.picked, () => []), done: fix(st.quiz?.done, () => false),
      hinted: fix(st.quiz?.hinted, () => false), seq: st.quiz?.seq || []
    }
  };
}

export function computeStats(s: PlayState, content: LevelContent): PlayStats {
  const quiz = content.quiz.map((q, i) => ({ id: q.id, short: q.short, wrong: s.quiz.wrong[i] || 0, hinted: !!s.quiz.hinted[i], done: !!s.quiz.done[i] }));
  return {
    clues: s.clues,
    guessedAt: s.guess.right ? s.guess.at : null,
    guessWrong: s.guess.picked.length,
    puzzlePieces: s.puzzle.n * s.puzzle.n,
    puzzleMs: s.puzzle.solved && s.puzzle.t0 && s.puzzle.t1 ? s.puzzle.t1 - s.puzzle.t0 : null,
    puzzleHints: s.puzzle.hints,
    puzzlePeeks: s.puzzle.peeks,
    storySeen: s.story.seen.length,
    storyHeard: s.story.heard.length,
    storyPages: content.story.length,
    quizFirstTry: quiz.filter(q => q.done && q.wrong === 0 && !q.hinted).length,
    quizTotal: quiz.length,
    quiz,
    durationMs: s.endedAt ? s.endedAt - s.startedAt : null
  };
}

export type BadgeId = "detective" | "perseverance" | "memoire";
export function badgesFor(s: PlayState): BadgeId[] {
  const out: BadgeId[] = [];
  if (s.guess.right && s.guess.at < 3) out.push("detective");
  const errs = s.quiz.wrong.reduce((a, b) => a + b, 0) + s.puzzle.hints + s.quiz.hinted.filter(Boolean).length;
  out.push(errs === 0 ? "memoire" : "perseverance");
  return out;
}

export const BADGE_INFO: Record<BadgeId, { title: string; text: (s?: PlayState) => string; color: string }> = {
  detective: { title: "Badge Détective", color: "#4C9CE2",
    text: s => !s || s.guess.at === 0 ? "Tu as deviné qui se cachait sans aucun indice !" : `Tu as deviné qui se cachait avec ${s.guess.at} indice${s.guess.at > 1 ? "s" : ""} seulement !` },
  perseverance: { title: "Badge Persévérance", color: "#F0685A", text: () => "Tu as réessayé sans abandonner. C'est comme ça qu'on apprend !" },
  memoire: { title: "Badge Mémoire d'éléphant", color: "#2E9E68", text: () => "Tout juste du premier coup, et sans aide !" }
};

export const STEP_WORD: Record<Step, string> = { mystery: "le mystère", puzzle: "le puzzle", story: "l'histoire", quiz: "le quiz", reward: "la récompense" };

export function fmtDuration(ms: number | null | undefined) {
  if (ms == null || isNaN(ms)) return "–";
  const t = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(t / 60), s = t % 60;
  return m ? `${m} min ${String(s).padStart(2, "0")} s` : `${s} s`;
}
