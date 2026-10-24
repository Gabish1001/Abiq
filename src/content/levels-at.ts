import type { LevelDef } from "./types";

/* Monde 1 — Ancien Testament. Textes adaptés pour les 6-8 ans à partir de la Bible Louis Segond 1910. */

const note = (src: string, extra = "") =>
  `Histoire racontée pour les 6-8 ans à partir de ${src} (Bible Louis Segond 1910). Les phrases sont simplifiées ; la référence indique où lire le texte.${extra ? " " + extra : ""}`;

export const NOE: LevelDef = {
  id: "noe", worldId: "m1", position: 1,
  content: {
    title: "Noé", value: "Fidélité", source: "Genèse 6 à 9", sourceNote: note("Genèse 6 à 9"),
    mystery: {
      intro: "Oh ! Une page du Grand Livre s'est effacée. Quelqu'un se cache dedans. Touche les indices pour le découvrir.",
      clues: [
        "J'ai construit un très grand bateau en bois.",
        "Des animaux sont entrés avec moi, deux par deux.",
        "Une colombe m'a rapporté une feuille d'olivier."
      ],
      guess: { options: ["Moïse", "Noé", "David"], correct: 1, hints: {
        "0": "Ce n'est pas Moïse. Lui, il a traversé la mer à pied sec !",
        "2": "Ce n'est pas David. Lui, c'était un jeune berger qui a vaincu un géant." } },
      art: "noe/mystery"
    },
    puzzle: { art: "noe/puzzle", alt: "L'arche de Noé sur l'eau, avec une girafe, un éléphant, une colombe et un arc-en-ciel.",
      reveal: "Noé a construit une arche pour sauver sa famille et les animaux." },
    story: [
      { title: "Un homme qui marchait avec Dieu", ref: "Genèse 6.5-9", art: "noe/s1",
        text: "Il y a très longtemps, les hommes faisaient beaucoup de mal sur la terre, et Dieu en était triste. Mais Noé était juste : il marchait avec Dieu.",
        alt: "Noé marche sur un chemin, un bâton à la main, près de ses moutons." },
      { title: "Un bateau géant", ref: "Genèse 6.13-22", art: "noe/s2",
        text: "Dieu prévint Noé : de grandes eaux allaient recouvrir la terre. « Construis une arche, un très grand bateau en bois. » Noé fit tout ce que Dieu lui avait demandé.",
        alt: "Noé tient un marteau devant la coque de l'arche en construction. Un de ses fils porte une planche." },
      { title: "Deux par deux", ref: "Genèse 7.1-16", art: "noe/s3",
        text: "Noé entra dans l'arche avec sa femme, ses trois fils et leurs femmes. Les animaux entrèrent aussi, deux par deux, un mâle et une femelle. Puis Dieu ferma la porte.",
        alt: "Des couples d'animaux avancent vers la porte de l'arche, où Noé les attend." },
      { title: "Quarante jours de pluie", ref: "Genèse 7.11-24", art: "noe/s4",
        text: "La pluie tomba pendant quarante jours et quarante nuits. L'eau recouvrit toute la terre, même les montagnes. Mais l'arche flottait, et tous ceux qui étaient dedans étaient à l'abri.",
        alt: "L'arche flotte sur les vagues sous une forte pluie. Ses fenêtres sont éclairées." },
      { title: "La colombe revient", ref: "Genèse 8.1-12", art: "noe/s5",
        text: "Dieu n'oublia pas Noé. Peu à peu, l'eau baissa. Noé lâcha une colombe. Elle revint le soir avec une feuille d'olivier dans son bec : la terre commençait à sécher !",
        alt: "Une colombe vole vers Noé avec une feuille d'olivier dans le bec." },
      { title: "La promesse de l'arc-en-ciel", ref: "Genèse 8.15 à 9.17", art: "noe/s6",
        text: "Noé sortit de l'arche avec sa famille et tous les animaux. Dieu promit qu'il n'y aurait plus jamais de déluge pour détruire la terre. Il mit un arc-en-ciel dans les nuages, comme signe de sa promesse.",
        alt: "La famille de Noé et des animaux sous un grand arc-en-ciel. L'arche est posée sur une montagne." }
    ],
    lesson: { text: "Noé a fait tout ce que Dieu lui avait demandé. Et Dieu a tenu sa promesse.", ref: "Genèse 6.22" },
    quiz: [
      { id: "q1", type: "choice", short: "L'arche", prompt: "Qu'est-ce que Dieu a demandé à Noé de construire ?",
        options: ["Une grande tour", "Une maison en pierre", "Une arche, un très grand bateau"], correct: 2,
        hints: { "0": "Une tour ne flotte pas sur l'eau ! Il fallait quelque chose qui flotte.", "1": "Une maison en pierre coulerait. Il fallait quelque chose qui flotte." },
        clue: "Dieu allait envoyer beaucoup d'eau sur la terre. Il fallait quelque chose qui flotte !",
        explain: "Dieu a demandé à Noé de construire une arche, un très grand bateau en bois.", ref: "Genèse 6.14" },
      { id: "q2", type: "choice", short: "Deux par deux", prompt: "Comment les animaux sont-ils entrés dans l'arche ?",
        options: ["Deux par deux", "Un par un", "Tous en même temps"], correct: 0,
        hints: { "1": "Pas tout seuls ! Chaque animal avait quelqu'un avec lui.", "2": "Ils sont entrés en petits groupes. Combien dans chaque groupe ?" },
        clue: "Les animaux n'étaient pas tout seuls : chacun avait un compagnon avec lui.",
        explain: "Les animaux sont entrés deux par deux, un mâle et une femelle.", ref: "Genèse 7.9" },
      { id: "q3", type: "choice", short: "La colombe", prompt: "Quel oiseau est revenu avec une feuille d'olivier dans son bec ?",
        options: ["Le corbeau", "La colombe", "L'aigle"], correct: 1,
        hints: { "0": "Noé a bien lâché un corbeau, mais ce n'est pas lui qui a rapporté la feuille.", "2": "Il n'y a pas d'aigle dans cette histoire. Relis la page 5 si tu veux !" },
        clue: "Relis la page 5 de l'histoire : un oiseau est revenu le soir avec une feuille.",
        explain: "Noé a d'abord lâché un corbeau, puis une colombe. C'est la colombe qui est revenue avec une feuille d'olivier.", ref: "Genèse 8.7-11" },
      { id: "q4", type: "order", short: "L'ordre", prompt: "Remets l'histoire dans l'ordre. Touche d'abord ce qui s'est passé en premier.",
        items: [{ label: "Noé construit l'arche", art: "noe/s2" }, { label: "Il pleut 40 jours", art: "noe/s4" }, { label: "L'arc-en-ciel apparaît", art: "noe/s6" }],
        show: [2, 0, 1],
        tries: ["Qu'est-ce que Noé a dû faire avant la pluie ? Commence par ça.", "Tu as trouvé le début. Qu'est-ce qui arrive juste après ?", "Il ne reste qu'une image !"],
        clue: "Pour être à l'abri de la pluie, Noé devait d'abord avoir… un bateau !",
        explain: "D'abord Noé construit l'arche, puis il pleut pendant quarante jours. À la fin, Dieu met l'arc-en-ciel dans les nuages.", ref: "Genèse 6 à 9" },
      { id: "q5", type: "choice", short: "L'arc-en-ciel", prompt: "Quel signe Dieu a-t-il donné pour montrer sa promesse ?",
        options: ["Un grand soleil", "Une étoile filante", "Un arc-en-ciel"], correct: 2,
        hints: { "0": "Le soleil était déjà là avant. Dieu a mis quelque chose de nouveau dans les nuages.", "1": "Pas une étoile. Ce signe apparaît dans les nuages, avec plein de couleurs." },
        clue: "Ce signe apparaît dans le ciel après la pluie, avec plein de couleurs.",
        explain: "Dieu a mis l'arc-en-ciel dans les nuages. C'est le signe de sa promesse : plus jamais de déluge pour détruire la terre.", ref: "Genèse 9.11-13" }
    ],
    card: { text: "Il a construit l'arche et a fait tout ce que Dieu lui avait demandé.", art: "noe/card", alt: "Noé, une colombe posée sur la main, devant un arc-en-ciel" },
    teaser: { text: "J'ai construit un très grand bateau pour sauver ma famille et les animaux. Qui suis-je ?", art: "noe/teaser" }
  }
};

export const ABRAHAM: LevelDef = {
  id: "abraham", worldId: "m1", position: 2,
  content: {
    title: "Abraham", value: "Confiance", source: "Genèse 12 à 21",
    sourceNote: note("Genèse 12 à 21", "Au début, Abraham et Sara s'appellent Abram et Saraï ; Dieu change leurs noms en Genèse 17."),
    mystery: {
      intro: "Une nouvelle page s'est effacée ! Qui se cache sous le ciel étoilé ? Regarde les indices.",
      clues: [
        "Dieu m'a demandé de quitter mon pays pour un pays inconnu.",
        "Une nuit, Dieu m'a dit de compter les étoiles du ciel.",
        "À cent ans, j'ai eu un fils qui s'appelait Isaac."
      ],
      guess: { options: ["Abraham", "Joseph", "Pierre"], correct: 0, hints: {
        "1": "Ce n'est pas Joseph. Lui, il avait une tunique de plusieurs couleurs !",
        "2": "Ce n'est pas Pierre. Lui, c'était un pêcheur, ami de Jésus." } },
      art: "abraham/mystery"
    },
    puzzle: { art: "abraham/puzzle", alt: "Abraham devant sa tente, la nuit, montre le ciel rempli d'étoiles. Sara, des moutons et un chameau sont près de lui.",
      reveal: "Abraham a fait confiance à Dieu et il est parti vers un pays inconnu." },
    story: [
      { title: "Pars vers un nouveau pays", ref: "Genèse 12.1-5", art: "abraham/s1",
        text: "Dieu dit à Abraham : « Quitte ton pays et va dans le pays que je te montrerai. » Abraham ne savait pas où il allait. Mais il fit confiance à Dieu et il partit, avec Sara, sa femme.",
        alt: "Abraham et Sara quittent leur maison avec un bâton et un baluchon." },
      { title: "Une longue route", ref: "Genèse 12.5-9", art: "abraham/s2",
        text: "Ils voyagèrent longtemps avec leurs tentes, leurs troupeaux et leurs serviteurs, jusqu'au pays de Canaan. Là, Dieu promit : « Je donnerai ce pays à ta famille. »",
        alt: "Une caravane avec des chameaux et des moutons traverse le désert." },
      { title: "Compte les étoiles", ref: "Genèse 15.1-6", art: "abraham/s3",
        text: "Abraham et Sara n'avaient pas d'enfant. Une nuit, Dieu dit à Abraham : « Regarde le ciel et compte les étoiles, si tu peux. Ta famille sera aussi nombreuse ! » Abraham crut Dieu.",
        alt: "Abraham, debout devant sa tente, regarde un ciel rempli d'étoiles." },
      { title: "Trois visiteurs", ref: "Genèse 18.1-14", art: "abraham/s4",
        text: "Un jour, trois visiteurs vinrent près de sa tente. Ils annoncèrent : « L'année prochaine, Sara aura un fils. » Sara se mit à rire, car elle était déjà très âgée. Mais rien n'est impossible pour Dieu.",
        alt: "Trois visiteurs sont assis sous un arbre près de la tente. Sara écoute à l'entrée." },
      { title: "Isaac, l'enfant du rire", ref: "Genèse 21.1-7", art: "abraham/s5",
        text: "Dieu tint sa promesse : Sara eut un fils. Abraham avait cent ans ! Ils l'appelèrent Isaac, et Sara dit : « Dieu m'a donné de quoi rire de joie. »",
        alt: "Sara tient le bébé Isaac dans ses bras. Abraham sourit à côté d'elle." }
    ],
    lesson: { text: "Abraham a fait confiance à Dieu sans savoir où il allait. Et Dieu a tenu sa promesse.", ref: "Genèse 15.6" },
    quiz: [
      { id: "q1", type: "choice", short: "Le départ", prompt: "Qu'est-ce que Dieu a demandé à Abraham ?",
        options: ["De construire un bateau", "De quitter son pays", "De devenir roi"], correct: 1,
        hints: { "0": "Ça, c'était Noé ! Abraham, lui, devait partir en voyage.", "2": "Abraham n'est pas devenu roi. Dieu lui a demandé de partir." },
        clue: "Relis la page 1 : Dieu lui a parlé d'un nouveau pays.",
        explain: "Dieu a demandé à Abraham de quitter son pays pour aller dans le pays qu'il lui montrerait.", ref: "Genèse 12.1" },
      { id: "q2", type: "choice", short: "Les étoiles", prompt: "Qu'est-ce qu'Abraham devait compter dans le ciel ?",
        options: ["Les nuages", "Les étoiles", "Les oiseaux"], correct: 1,
        hints: { "0": "Pas les nuages ! C'était la nuit.", "2": "Pas les oiseaux. Il faisait nuit, et le ciel brillait." },
        clue: "C'était la nuit, et le ciel était plein de petites lumières.",
        explain: "Dieu a dit à Abraham de compter les étoiles : sa famille serait aussi nombreuse.", ref: "Genèse 15.5" },
      { id: "q3", type: "choice", short: "Isaac", prompt: "Comment s'appelait le fils d'Abraham et de Sara ?",
        options: ["Isaac", "David", "Joseph"], correct: 0,
        hints: { "1": "David a vécu bien plus tard. Le nom du fils d'Abraham veut dire « il rit ».", "2": "Joseph est venu plus tard : c'est l'arrière-petit-fils d'Abraham." },
        clue: "Son nom veut dire « il rit ».",
        explain: "Le fils d'Abraham et de Sara s'appelait Isaac. Son nom veut dire « il rit ».", ref: "Genèse 21.3" },
      { id: "q4", type: "order", short: "L'ordre", prompt: "Remets l'histoire dans l'ordre. Touche d'abord ce qui s'est passé en premier.",
        items: [{ label: "Abraham quitte son pays", art: "abraham/s1" }, { label: "Dieu montre les étoiles", art: "abraham/s3" }, { label: "Isaac est né", art: "abraham/s5" }],
        show: [1, 2, 0],
        tries: ["Qu'est-ce qu'Abraham a fait tout au début ? Il est parti…", "Tu as trouvé le début. Et ensuite, une nuit, Dieu lui a montré quelque chose…", "Il ne reste qu'une image !"],
        clue: "D'abord le voyage, puis la promesse, et enfin le bébé.",
        explain: "Abraham part, puis Dieu lui montre les étoiles, et enfin Isaac naît : Dieu a tenu sa promesse.", ref: "Genèse 12 à 21" },
      { id: "q5", type: "choice", short: "Le rire de Sara", prompt: "Pourquoi Sara a-t-elle ri ?",
        options: ["Un chameau faisait le clown", "Elle était très âgée pour avoir un bébé", "Abraham racontait une blague"], correct: 1,
        hints: { "0": "Il n'y a pas de chameau clown dans l'histoire !", "2": "Ce n'est pas une blague d'Abraham. Pense à ce que les visiteurs ont annoncé." },
        clue: "Les visiteurs ont annoncé une nouvelle étonnante pour une dame très âgée.",
        explain: "Sara a ri parce qu'elle était très âgée et qu'on lui annonçait un bébé. Mais rien n'est impossible pour Dieu.", ref: "Genèse 18.12-14" }
    ],
    card: { text: "Il a quitté son pays en faisant confiance à Dieu.", art: "abraham/card", alt: "Abraham montre les étoiles, un bâton à la main" },
    teaser: { text: "Je suis parti de mon pays sans savoir où j'allais. Dieu m'a promis une famille aussi nombreuse que les étoiles du ciel. Qui suis-je ?", art: "abraham/teaser" }
  }
};

export const MOISE: LevelDef = {
  id: "moise", worldId: "m1", position: 3,
  content: {
    title: "Moïse", value: "Persévérance", source: "Exode 2 à 15", sourceNote: note("Exode 2 à 15"),
    mystery: {
      intro: "Une page du Grand Livre s'est effacée près d'un grand fleuve… Qui se cache dedans ?",
      clues: [
        "Quand j'étais bébé, on m'a caché dans un panier sur le fleuve.",
        "Dieu m'a parlé depuis un buisson en feu qui ne se consumait pas.",
        "J'ai levé mon bâton, et la mer s'est ouverte en deux."
      ],
      guess: { options: ["Jonas", "Daniel", "Moïse"], correct: 2, hints: {
        "0": "Ce n'est pas Jonas. Lui, il a été avalé par un grand poisson !",
        "1": "Ce n'est pas Daniel. Lui, il a été protégé dans la fosse aux lions." } },
      art: "moise/mystery"
    },
    puzzle: { art: "moise/puzzle", alt: "Moïse lève son bâton. La mer s'ouvre et forme deux murs d'eau de chaque côté d'un chemin.",
      reveal: "Moïse a conduit le peuple de Dieu hors d'Égypte." },
    story: [
      { title: "Un bébé dans un panier", ref: "Exode 2.1-10", art: "moise/s1",
        text: "Le pharaon, roi d'Égypte, rendait la vie très dure au peuple d'Israël. Pour protéger son bébé, une maman le cacha dans un panier, parmi les roseaux du fleuve. La fille du pharaon le trouva et l'appela Moïse.",
        alt: "Un bébé dort dans un panier au milieu des roseaux, au bord du fleuve." },
      { title: "Le buisson en feu", ref: "Exode 3.1-12", art: "moise/s2",
        text: "Quand Moïse fut grand, il gardait des moutons. Un jour, il vit un buisson en feu qui ne se consumait pas. Dieu lui parla : « Va voir le pharaon et fais sortir mon peuple d'Égypte. »",
        alt: "Moïse, avec ses moutons, regarde un buisson en flammes sur la montagne." },
      { title: "Laisse partir mon peuple", ref: "Exode 5.1 à 12.32", art: "moise/s3",
        text: "Moïse alla voir le pharaon : « Laisse partir mon peuple ! » Le pharaon refusa. Moïse revint encore et encore. Il y eut dix fléaux sur l'Égypte avant que le pharaon dise enfin oui.",
        alt: "Moïse, son bâton à la main, parle au pharaon assis sur son trône." },
      { title: "La mer s'ouvre", ref: "Exode 14.10-22", art: "moise/s4",
        text: "Le peuple partit, mais l'armée du pharaon le poursuivit. Devant la mer, Moïse leva son bâton. Dieu fit souffler un vent fort, et la mer s'ouvrit. Le peuple traversa à pied sec !",
        alt: "Le peuple marche sur un chemin sec entre deux murs d'eau. Moïse lève son bâton." },
      { title: "Un chant de victoire", ref: "Exode 15.1-21", art: "moise/s5",
        text: "De l'autre côté de la mer, Moïse et le peuple chantèrent pour remercier Dieu, au son des tambourins. Dieu avait délivré son peuple !",
        alt: "Le peuple danse et chante avec des tambourins au bord de la mer." }
    ],
    lesson: { text: "Moïse n'a pas abandonné : il est retourné voir le pharaon encore et encore, en comptant sur Dieu.", ref: "Exode 3.12" },
    quiz: [
      { id: "q1", type: "choice", short: "Le panier", prompt: "Où la maman de Moïse l'a-t-elle caché quand il était bébé ?",
        options: ["Dans un panier sur le fleuve", "Dans une grotte", "Dans un grand bateau"], correct: 0,
        hints: { "1": "Pas dans une grotte. Il y avait de l'eau tout près.", "2": "Le grand bateau, c'était l'arche de Noé ! Moïse était tout petit, dans quelque chose de petit." },
        clue: "C'était sur l'eau, au bord du fleuve, parmi les roseaux.",
        explain: "Sa maman l'a caché dans un panier sur le fleuve. La fille du pharaon l'a trouvé.", ref: "Exode 2.3-6" },
      { id: "q2", type: "choice", short: "Le buisson", prompt: "Comment Dieu a-t-il parlé à Moïse la première fois ?",
        options: ["Dans un rêve", "Depuis un buisson en feu", "Par une lettre"], correct: 1,
        hints: { "0": "Ce n'était pas un rêve. Moïse était bien réveillé, avec ses moutons.", "2": "Pas de lettre ! Il y avait du feu…" },
        clue: "Il y avait un feu étonnant : ça brûlait, mais rien ne se consumait.",
        explain: "Dieu a parlé à Moïse depuis un buisson en feu qui ne se consumait pas.", ref: "Exode 3.2-4" },
      { id: "q3", type: "choice", short: "Le pharaon", prompt: "Que demandait Moïse au pharaon ?",
        options: ["De lui donner son palais", "De construire une pyramide", "De laisser partir le peuple de Dieu"], correct: 2,
        hints: { "0": "Moïse ne voulait pas de palais. Il pensait au peuple d'Israël.", "1": "Ce n'est pas ça. Le peuple voulait justement arrêter de travailler dur pour le pharaon !" },
        clue: "Il répétait toujours la même phrase : « Laisse partir… »",
        explain: "Moïse demandait au pharaon : « Laisse partir mon peuple ! » Il est revenu encore et encore.", ref: "Exode 5.1" },
      { id: "q4", type: "order", short: "L'ordre", prompt: "Remets l'histoire dans l'ordre. Touche d'abord ce qui s'est passé en premier.",
        items: [{ label: "Moïse bébé dans le panier", art: "moise/s1" }, { label: "Le buisson en feu", art: "moise/s2" }, { label: "La mer s'ouvre", art: "moise/s4" }],
        show: [2, 0, 1],
        tries: ["Commence par le moment où Moïse était tout petit.", "Tu as trouvé le début. Quand il était grand, qu'a-t-il vu en gardant ses moutons ?", "Il ne reste qu'une image !"],
        clue: "Commence par Moïse bébé, et finis par la grande traversée.",
        explain: "D'abord le bébé dans le panier, puis le buisson en feu, et enfin la mer qui s'ouvre.", ref: "Exode 2 à 14" },
      { id: "q5", type: "choice", short: "La traversée", prompt: "Comment le peuple a-t-il traversé la mer ?",
        options: ["À la nage", "En bateau", "À pied sec, entre deux murs d'eau"], correct: 2,
        hints: { "0": "Pas à la nage ! Dieu a fait quelque chose d'extraordinaire.", "1": "Ils n'avaient pas de bateau. Dieu a ouvert un chemin." },
        clue: "Dieu a fait souffler un grand vent, et un chemin est apparu au milieu de l'eau.",
        explain: "Dieu a ouvert la mer : le peuple a traversé à pied sec, avec l'eau comme un mur à droite et à gauche.", ref: "Exode 14.21-22" }
    ],
    card: { text: "Il n'a pas abandonné et a conduit le peuple hors d'Égypte.", art: "moise/card", alt: "Moïse lève son bâton devant la mer" },
    teaser: { text: "On m'a trouvé bébé dans un panier, au bord d'un grand fleuve. Plus tard, j'ai dit au roi : « Laisse partir mon peuple ! » Qui suis-je ?", art: "moise/teaser" }
  }
};

export const DAVID: LevelDef = {
  id: "david", worldId: "m1", position: 4,
  content: {
    title: "David", value: "Courage", source: "1 Samuel 16 et 17", sourceNote: note("1 Samuel 16 et 17"),
    mystery: {
      intro: "Chut… On entend des moutons. Une page s'est effacée : qui se cache dedans ?",
      clues: [
        "J'étais le plus jeune de mes frères et je gardais les moutons.",
        "J'ai affronté un géant qui faisait peur à toute l'armée.",
        "Je n'avais qu'une fronde et cinq pierres lisses."
      ],
      guess: { options: ["Salomon", "David", "Samson"], correct: 1, hints: {
        "0": "Ce n'est pas Salomon. Lui, il était célèbre pour sa sagesse.",
        "2": "Ce n'est pas Samson. Lui, il était très fort, avec de très longs cheveux." } },
      art: "david/mystery"
    },
    puzzle: { art: "david/puzzle", alt: "Le jeune berger David fait tourner sa fronde face au géant Goliath, dans une vallée.",
      reveal: "David a eu le courage d'affronter le géant Goliath." },
    story: [
      { title: "Le plus jeune des frères", ref: "1 Samuel 16.1-13", art: "david/s1",
        text: "Dieu envoya le prophète Samuel chez Isaï pour choisir un futur roi. Samuel vit les grands frères, mais Dieu lui dit : « Moi, je regarde le cœur. » Il choisit David, le plus jeune, qui gardait les moutons.",
        alt: "Samuel verse de l'huile sur la tête du jeune David, devant ses grands frères." },
      { title: "Un géant nommé Goliath", ref: "1 Samuel 17.1-11", art: "david/s2",
        text: "L'armée d'Israël faisait face aux Philistins. Leur champion, Goliath, était un géant. Chaque jour, il criait : « Envoyez-moi un homme pour se battre contre moi ! » Tous les soldats avaient peur.",
        alt: "Le géant Goliath, en armure, crie devant les soldats d'Israël qui ont peur." },
      { title: "Je n'ai pas peur", ref: "1 Samuel 17.17-37", art: "david/s3",
        text: "David vint apporter à manger à ses frères. Il dit au roi Saül : « Je vais me battre contre lui. Dieu m'a protégé du lion et de l'ours, il me protégera aussi. »",
        alt: "David parle au roi Saül, qui porte une couronne." },
      { title: "Cinq pierres lisses", ref: "1 Samuel 17.38-40", art: "david/s4",
        text: "Saül lui prêta son armure, mais elle était trop lourde. David prit son bâton, sa fronde, et cinq pierres lisses dans le torrent.",
        alt: "David ramasse des pierres lisses dans un ruisseau." },
      { title: "Avec l'aide de Dieu", ref: "1 Samuel 17.45-50", art: "david/s5",
        text: "David dit à Goliath : « Je viens au nom de l'Éternel. » Il lança une pierre avec sa fronde. La pierre frappa Goliath au front, et le géant tomba par terre !",
        alt: "Le géant Goliath tombe en arrière. David tient sa fronde." }
    ],
    lesson: { text: "David a eu du courage parce qu'il comptait sur Dieu, pas sur sa propre force.", ref: "1 Samuel 17.45" },
    quiz: [
      { id: "q1", type: "choice", short: "Le berger", prompt: "Que faisait David avant d'affronter Goliath ?",
        options: ["Il était roi", "Il était berger", "Il était pêcheur"], correct: 1,
        hints: { "0": "Pas encore ! Il deviendra roi plus tard.", "2": "Pêcheur, c'était plutôt Pierre. David s'occupait d'animaux." },
        clue: "Il s'occupait des moutons de son père.",
        explain: "David était berger : il gardait les moutons de son père, Isaï.", ref: "1 Samuel 16.11" },
      { id: "q2", type: "choice", short: "La peur", prompt: "Pourquoi les soldats d'Israël avaient-ils peur ?",
        options: ["À cause d'un orage", "À cause du géant Goliath", "À cause d'un lion"], correct: 1,
        hints: { "0": "Il n'y avait pas d'orage. Quelqu'un criait chaque jour…", "2": "Le lion, c'est David qui l'avait affronté avant, en gardant ses moutons !" },
        clue: "Il était immense et criait chaque jour pour défier l'armée.",
        explain: "Les soldats avaient peur de Goliath, un géant qui les défiait chaque jour.", ref: "1 Samuel 17.4-11" },
      { id: "q3", type: "choice", short: "La fronde", prompt: "Qu'a pris David pour affronter Goliath ?",
        options: ["Une épée et un bouclier", "L'armure du roi", "Une fronde et cinq pierres"], correct: 2,
        hints: { "0": "David n'a pas pris d'épée. Il a pris ses affaires de berger.", "1": "Il l'a essayée, mais elle était trop lourde !" },
        clue: "Il a ramassé quelque chose dans le torrent.",
        explain: "David a laissé l'armure trop lourde. Il a pris sa fronde et cinq pierres lisses.", ref: "1 Samuel 17.39-40" },
      { id: "q4", type: "order", short: "L'ordre", prompt: "Remets l'histoire dans l'ordre. Touche d'abord ce qui s'est passé en premier.",
        items: [{ label: "Samuel choisit David", art: "david/s1" }, { label: "David prend cinq pierres", art: "david/s4" }, { label: "Goliath tombe", art: "david/s5" }],
        show: [1, 2, 0],
        tries: ["Commence par le moment où David était encore un simple berger.", "Tu as trouvé le début. Avant le combat, qu'a ramassé David ?", "Il ne reste qu'une image !"],
        clue: "Commence par le choix du futur roi.",
        explain: "D'abord Samuel choisit David, puis David ramasse cinq pierres, et enfin Goliath tombe.", ref: "1 Samuel 16 et 17" },
      { id: "q5", type: "choice", short: "La confiance", prompt: "Sur qui David comptait-il pour gagner ?",
        options: ["Sur ses grands frères", "Sur sa grande taille", "Sur Dieu"], correct: 2,
        hints: { "0": "Ses frères avaient peur, eux aussi !", "1": "David était tout petit à côté de Goliath !" },
        clue: "Relis la dernière page : David parle au nom de quelqu'un.",
        explain: "David a dit : « Je viens au nom de l'Éternel. » Il comptait sur Dieu.", ref: "1 Samuel 17.45" }
    ],
    card: { text: "Avec une fronde et sa confiance en Dieu, il a affronté le géant Goliath.", art: "david/card", alt: "Le jeune berger David avec sa fronde et un mouton" },
    teaser: { text: "J'étais le plus petit de mes frères et je gardais les moutons. Un jour, j'ai affronté un géant. Qui suis-je ?", art: "david/teaser" }
  }
};
