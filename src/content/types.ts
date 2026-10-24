/** Contenu d'un niveau, tel qu'il est stocké dans levels.content (jsonb) et édité dans l'administration. */

export type ChoiceQuestion = {
  id: string;
  type: "choice";
  short: string;              // libellé court pour les bilans adultes
  prompt: string;
  options: string[];          // 3 réponses
  correct: number;
  hints: Record<string, string>; // conseil affiché après une mauvaise réponse (clé = index de l'option)
  clue: string;               // indice demandé avant de répondre
  explain: string;            // explication affichée après la bonne réponse
  ref: string;                // référence biblique
};

export type OrderQuestion = {
  id: string;
  type: "order";
  short: string;
  prompt: string;
  items: { label: string; art: string; image?: string }[]; // dans l'ordre correct
  show: number[];             // ordre d'affichage (indices de items)
  tries: string[];            // conseil selon la position attendue
  clue: string;
  explain: string;
  ref: string;
};

export type Question = ChoiceQuestion | OrderQuestion;

export type StoryPage = {
  title: string;
  ref: string;
  text: string;
  alt: string;
  art: string;                // illustration dessinée par l'application
  image?: string;             // image importée (remplace l'illustration si présente)
};

export type LevelContent = {
  title: string;              // nom affiché du héros
  value: string;              // valeur à retenir (Fidélité, Courage…)
  source: string;             // ex. « Genèse 6 à 9 »
  sourceNote: string;         // note de traduction affichée sous la première page
  mystery: {
    intro: string;
    clues: [string, string, string];
    guess: { options: string[]; correct: number; hints: Record<string, string> };
    art: string;
  };
  puzzle: { art: string; image?: string; alt: string; reveal: string };
  story: StoryPage[];
  lesson: { text: string; ref: string };
  quiz: Question[];
  card: { text: string; art: string; image?: string; alt: string };
  teaser: { text: string; art: string; image?: string };
};

export type WorldDef = { id: string; position: number; title: string; subtitle: string };

export type LevelDef = {
  id: string;
  worldId: string;
  position: number;           // ordre global (1..n)
  content: LevelContent;
};
