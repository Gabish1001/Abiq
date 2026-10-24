import type { ChoiceQuestion, LevelContent, OrderQuestion, StoryPage } from "@/content/types";

export const blankPage = (n: number): StoryPage => ({ title: `Page ${n}`, ref: "", text: "", alt: "", art: "" });

export const blankChoice = (n: number): ChoiceQuestion => ({
  id: `q${n}-${Date.now().toString(36)}`, type: "choice", short: "", prompt: "", options: ["", "", ""], correct: 0,
  hints: {}, clue: "", explain: "", ref: ""
});

export const blankOrder = (n: number): OrderQuestion => ({
  id: `q${n}-${Date.now().toString(36)}`, type: "order", short: "L'ordre", prompt: "Remets l'histoire dans l'ordre. Touche d'abord ce qui s'est passé en premier.",
  items: [{ label: "", art: "" }, { label: "", art: "" }, { label: "", art: "" }], show: [2, 0, 1],
  tries: ["Qu'est-ce qui s'est passé en premier ?", "Tu as trouvé le début. Qu'est-ce qui arrive juste après ?", "Il ne reste qu'une image !"],
  clue: "", explain: "", ref: ""
});

/** Trame d'une nouvelle page, à compléter dans l'éditeur. */
export function blankContent(title: string): LevelContent {
  return {
    title, value: "", source: "", sourceNote: "Histoire racontée pour les 6-8 ans à partir de la Bible Louis Segond 1910. Les phrases sont simplifiées ; la référence indique où lire le texte.",
    mystery: {
      intro: "Oh ! Une page du Grand Livre s'est effacée. Quelqu'un se cache dedans. Touche les indices pour le découvrir.",
      clues: ["", "", ""], guess: { options: [title, "", ""], correct: 0, hints: {} }, art: ""
    },
    puzzle: { art: "", alt: "", reveal: "" },
    story: [blankPage(1), blankPage(2), blankPage(3), blankPage(4), blankPage(5)],
    lesson: { text: "", ref: "" },
    quiz: [blankChoice(1), blankChoice(2), blankChoice(3), blankOrder(4), blankChoice(5)],
    card: { text: "", art: "", alt: "" },
    teaser: { text: "", art: "" }
  };
}

export function shuffleShow(n: number): number[] {
  if (n < 2) return [0];
  let a: number[];
  do { a = [...Array(n).keys()].sort(() => Math.random() - 0.5); } while (a.every((v, i) => v === i));
  return a;
}

/** Liste des problèmes qui empêchent la publication. */
export function checkContent(c: LevelContent): string[] {
  const p: string[] = [];
  const need = (v: string | undefined, what: string) => { if (!v || !v.trim()) p.push(what); };
  need(c.title, "Infos : le nom du personnage");
  need(c.value, "Infos : la valeur à retenir");
  need(c.source, "Infos : la référence biblique");
  need(c.mystery.intro, "Mystère : la phrase d'introduction");
  c.mystery.clues.forEach((x, i) => need(x, `Mystère : l'indice ${i + 1}`));
  c.mystery.guess.options.forEach((x, i) => need(x, `Mystère : la réponse ${"ABC"[i]}`));
  need(c.puzzle.alt, "Puzzle : la description de l'image");
  need(c.puzzle.reveal, "Puzzle : la phrase révélée");
  if (!c.puzzle.art && !c.puzzle.image) p.push("Puzzle : une illustration ou une image");
  if (c.story.length < 1) p.push("Histoire : au moins une page");
  c.story.forEach((s, i) => { need(s.text, `Histoire, page ${i + 1} : le texte`); need(s.ref, `Histoire, page ${i + 1} : la référence`); need(s.alt, `Histoire, page ${i + 1} : la description de l'image`); });
  need(c.lesson.text, "Leçon : le texte");
  if (c.quiz.length < 1) p.push("Quiz : au moins une question");
  c.quiz.forEach((q, i) => {
    const n = `Quiz, question ${i + 1}`;
    need(q.prompt, `${n} : la question`); need(q.short, `${n} : le libellé court`); need(q.clue, `${n} : l'indice`); need(q.explain, `${n} : l'explication`);
    if (q.type === "choice") q.options.forEach((o, k) => need(o, `${n} : la réponse ${"ABC"[k]}`));
    else { q.items.forEach((it, k) => need(it.label, `${n} : l'étiquette de l'image ${k + 1}`)); if (q.show.length !== q.items.length) p.push(`${n} : l'ordre d'affichage`); }
  });
  need(c.card.text, "Carte : le texte");
  need(c.teaser.text, "Teaser : la phrase de la prochaine aventure");
  return p;
}
