import type { LevelDef } from "./types";

/* Monde 2 — Nouveau Testament. Textes adaptés pour les 6-8 ans à partir de la Bible Louis Segond 1910. */

const note = (src: string, extra = "") =>
  `Histoire racontée pour les 6-8 ans à partir de ${src} (Bible Louis Segond 1910). Les phrases sont simplifiées ; la référence indique où lire le texte.${extra ? " " + extra : ""}`;

export const JESUS: LevelDef = {
  id: "jesus", worldId: "m2", position: 5,
  content: {
    title: "Jésus", value: "L'amour de Dieu", source: "Luc 1 et 2, Matthieu 2", sourceNote: note("Luc 1 et 2 et de Matthieu 2"),
    mystery: {
      intro: "Une page toute neuve s'est effacée : celle d'une naissance très spéciale. Qui se cache dedans ?",
      clues: [
        "Je suis né à Bethléem, une petite ville.",
        "À ma naissance, ma maman m'a couché dans une mangeoire.",
        "Un ange a annoncé ma naissance à des bergers."
      ],
      guess: { options: ["Jésus", "Jean-Baptiste", "Samuel"], correct: 0, hints: {
        "1": "Ce n'est pas Jean-Baptiste. C'est un parent de Jésus, né quelques mois avant lui.",
        "2": "Ce n'est pas Samuel. Lui, il est né bien avant, au temps de l'Ancien Testament." } },
      art: "jesus/mystery"
    },
    puzzle: { art: "jesus/puzzle", alt: "Marie et Joseph près du bébé Jésus couché dans une mangeoire, sous un ciel étoilé. Un berger et un agneau les regardent.",
      reveal: "Jésus est né à Bethléem. Dieu l'a envoyé parce qu'il aime le monde." },
    story: [
      { title: "La visite de l'ange", ref: "Luc 1.26-38", art: "jesus/s1",
        text: "Dieu envoya l'ange Gabriel chez Marie, à Nazareth. « Tu vas avoir un fils, et tu l'appelleras Jésus. » Marie répondit : « Je suis la servante du Seigneur. »",
        alt: "Un ange lumineux parle à Marie dans sa maison." },
      { title: "Pas de place à l'hôtellerie", ref: "Luc 2.1-7", art: "jesus/s2",
        text: "Marie et Joseph durent voyager jusqu'à Bethléem. Il n'y avait pas de place pour eux dans l'hôtellerie. Jésus naquit, et Marie le coucha dans une mangeoire.",
        alt: "Marie et Joseph veillent sur le bébé Jésus couché dans une mangeoire." },
      { title: "Les bergers dans les champs", ref: "Luc 2.8-14", art: "jesus/s3",
        text: "La nuit, des bergers gardaient leurs troupeaux. Un ange leur apparut : « N'ayez pas peur ! Aujourd'hui, un Sauveur vous est né. » Puis une foule d'anges loua Dieu : « Gloire à Dieu ! »",
        alt: "Des bergers et leurs moutons regardent un ange lumineux dans le ciel de nuit." },
      { title: "Les bergers trouvent Jésus", ref: "Luc 2.15-20", art: "jesus/s4",
        text: "Les bergers se dépêchèrent d'aller à Bethléem. Ils trouvèrent Marie, Joseph et le bébé couché dans la mangeoire. Ils repartirent en remerciant Dieu.",
        alt: "Deux bergers et un agneau arrivent près de la mangeoire où dort Jésus." },
      { title: "Les mages et l'étoile", ref: "Matthieu 2.1-11", art: "jesus/s5",
        text: "Des mages venus d'Orient suivirent une étoile. Elle s'arrêta au-dessus de la maison où était l'enfant. Ils lui offrirent de l'or, de l'encens et de la myrrhe.",
        alt: "Trois mages apportent des cadeaux devant une maison, sous une grande étoile." }
    ],
    lesson: { text: "Dieu nous aime tellement qu'il a envoyé Jésus dans le monde.", ref: "Jean 3.16" },
    quiz: [
      { id: "q1", type: "choice", short: "Bethléem", prompt: "Dans quelle ville Jésus est-il né ?",
        options: ["Jérusalem", "Bethléem", "Nazareth"], correct: 1,
        hints: { "0": "Pas Jérusalem. C'était une plus petite ville.", "2": "Marie et Joseph habitaient à Nazareth, mais ils ont dû voyager…" },
        clue: "Marie et Joseph ont dû voyager jusqu'à cette petite ville.",
        explain: "Jésus est né à Bethléem, où Marie et Joseph avaient dû se rendre.", ref: "Luc 2.4-7" },
      { id: "q2", type: "choice", short: "La mangeoire", prompt: "Où Marie a-t-elle couché le bébé Jésus ?",
        options: ["Dans une mangeoire", "Dans un lit doré", "Dans un panier sur l'eau"], correct: 0,
        hints: { "1": "Il n'y avait pas de lit doré. Il n'y avait même pas de place à l'hôtellerie !", "2": "Le panier sur l'eau, c'était Moïse bébé !" },
        clue: "C'est l'endroit où mangent les animaux.",
        explain: "Il n'y avait pas de place à l'hôtellerie : Marie a couché Jésus dans une mangeoire.", ref: "Luc 2.7" },
      { id: "q3", type: "choice", short: "L'ange", prompt: "Qui a annoncé la naissance de Jésus aux bergers ?",
        options: ["Un roi", "Un ange", "Un oiseau"], correct: 1,
        hints: { "0": "Pas un roi. C'était un messager venu du ciel.", "2": "Pas un oiseau ! C'était un messager de Dieu, tout lumineux." },
        clue: "Un messager de Dieu, venu du ciel, au milieu de la nuit.",
        explain: "Un ange est apparu aux bergers : « N'ayez pas peur ! Un Sauveur vous est né. »", ref: "Luc 2.9-11" },
      { id: "q4", type: "order", short: "L'ordre", prompt: "Remets l'histoire dans l'ordre. Touche d'abord ce qui s'est passé en premier.",
        items: [{ label: "L'ange visite Marie", art: "jesus/s1" }, { label: "Jésus est né", art: "jesus/s2" }, { label: "Les mages offrent leurs cadeaux", art: "jesus/s5" }],
        show: [2, 0, 1],
        tries: ["Commence avant la naissance : quelqu'un est venu voir Marie…", "Tu as trouvé le début. Et ensuite, que s'est-il passé à Bethléem ?", "Il ne reste qu'une image !"],
        clue: "Avant la naissance, la naissance, puis des visiteurs venus de loin.",
        explain: "D'abord l'ange visite Marie, puis Jésus naît à Bethléem, et enfin les mages apportent leurs cadeaux.", ref: "Luc 1 et 2, Matthieu 2" },
      { id: "q5", type: "choice", short: "L'étoile", prompt: "Qu'est-ce qui a guidé les mages jusqu'à Jésus ?",
        options: ["Une carte", "Une étoile", "Un berger"], correct: 1,
        hints: { "0": "Pas de carte ! Ils regardaient le ciel.", "2": "Les bergers étaient venus avant. Les mages, eux, regardaient le ciel." },
        clue: "Ils regardaient le ciel et suivaient une lumière.",
        explain: "Les mages ont suivi une étoile qui s'est arrêtée au-dessus de la maison où était Jésus.", ref: "Matthieu 2.9-11" }
    ],
    card: { text: "Dieu a envoyé son Fils Jésus parce qu'il aime le monde.", art: "jesus/card", alt: "Le bébé Jésus endormi dans la mangeoire" },
    teaser: { text: "Je suis né dans une petite ville, et des anges ont loué Dieu pour ma naissance. Qui suis-je ?", art: "jesus/teaser" }
  }
};

export const GARCON: LevelDef = {
  id: "garcon", worldId: "m2", position: 6,
  content: {
    title: "Le garçon aux cinq pains", value: "Générosité", source: "Jean 6.1-13", sourceNote: note("Jean 6.1-13", "La Bible ne donne pas le prénom du garçon."),
    mystery: {
      intro: "Une page s'est effacée au milieu d'une immense foule. Qui se cache dedans ?",
      clues: [
        "J'étais dans une très grande foule venue écouter Jésus.",
        "J'avais apporté un petit repas : cinq pains et deux poissons.",
        "Avec mon repas, Jésus a nourri des milliers de personnes !"
      ],
      guess: { options: ["Zachée", "Pierre", "Le jeune garçon"], correct: 2, hints: {
        "0": "Ce n'est pas Zachée. Lui, il est monté dans un arbre !",
        "1": "Ce n'est pas Pierre, l'ami de Jésus. Cherche plutôt un enfant !" } },
      art: "garcon/mystery"
    },
    puzzle: { art: "garcon/puzzle", alt: "Un jeune garçon tend son panier avec cinq pains et deux poissons à Jésus, sur une colline remplie de monde.",
      reveal: "Le jeune garçon avait cinq pains et deux poissons. Jésus a nourri toute la foule avec !" },
    story: [
      { title: "Une immense foule", ref: "Jean 6.1-5", art: "garcon/s1",
        text: "Une grande foule suivait Jésus, car elle voyait les malades qu'il guérissait. Jésus monta sur une colline et vit tout ce monde arriver.",
        alt: "Une grande foule monte vers Jésus, assis sur une colline." },
      { title: "Où trouver du pain ?", ref: "Jean 6.5-7", art: "garcon/s2",
        text: "Jésus demanda à son disciple Philippe : « Où acheter du pain pour tous ces gens ? » Philippe répondit : « Même avec beaucoup d'argent, il n'y en aurait pas assez ! »",
        alt: "Jésus parle avec Philippe, qui a l'air inquiet devant la foule." },
      { title: "Cinq pains et deux poissons", ref: "Jean 6.8-9", art: "garcon/s3",
        text: "André, un autre disciple, dit : « Il y a ici un jeune garçon qui a cinq pains d'orge et deux poissons. Mais qu'est-ce que cela pour tant de monde ? »",
        alt: "André présente à Jésus un jeune garçon qui tient un panier de pains et de poissons." },
      { title: "Jésus dit merci", ref: "Jean 6.10-11", art: "garcon/s4",
        text: "Jésus fit asseoir les gens dans l'herbe. Il prit les pains, remercia Dieu, et les fit distribuer. Il fit de même avec les poissons.",
        alt: "Jésus lève les pains vers le ciel pour remercier Dieu. Les gens sont assis dans l'herbe." },
      { title: "Douze paniers de restes", ref: "Jean 6.12-13", art: "garcon/s5",
        text: "Tout le monde mangea autant qu'il voulait. Il y avait environ cinq mille hommes ! Avec les morceaux qui restaient, on remplit douze paniers.",
        alt: "Douze paniers remplis de morceaux de pain, et la foule rassasiée." }
    ],
    lesson: { text: "Le jeune garçon avait peu, mais avec Jésus, ce peu a nourri une foule entière.", ref: "Jean 6.9-11" },
    quiz: [
      { id: "q1", type: "choice", short: "Le repas", prompt: "Qu'avait le jeune garçon dans son panier ?",
        options: ["Deux pains et cinq poissons", "Un panier de fruits", "Cinq pains et deux poissons"], correct: 2,
        hints: { "0": "Presque ! Mais c'est l'inverse.", "1": "Pas de fruits ! Il avait du pain et du poisson." },
        clue: "Une main pleine de pains, et deux poissons.",
        explain: "Le garçon avait cinq pains d'orge et deux poissons.", ref: "Jean 6.9" },
      { id: "q2", type: "choice", short: "Le merci", prompt: "Qu'a fait Jésus avant de distribuer le pain ?",
        options: ["Il a compté les gens", "Il a remercié Dieu", "Il a chanté une chanson"], correct: 1,
        hints: { "0": "Il ne les a pas comptés lui-même. Il a d'abord parlé à Dieu…", "2": "Ce n'était pas une chanson. Il a dit merci." },
        clue: "Il a dit merci, comme on le fait avant de manger.",
        explain: "Jésus a pris les pains et a remercié Dieu, puis il les a fait distribuer.", ref: "Jean 6.11" },
      { id: "q3", type: "choice", short: "Les paniers", prompt: "Combien de paniers de restes a-t-on remplis ?",
        options: ["Douze", "Deux", "Cinq"], correct: 0,
        hints: { "1": "Bien plus que deux ! Il en restait beaucoup.", "2": "Plus que cinq ! Autant que les disciples de Jésus." },
        clue: "Autant de paniers que de disciples autour de Jésus.",
        explain: "Avec les morceaux qui restaient, on a rempli douze paniers !", ref: "Jean 6.13" },
      { id: "q4", type: "order", short: "L'ordre", prompt: "Remets l'histoire dans l'ordre. Touche d'abord ce qui s'est passé en premier.",
        items: [{ label: "La foule arrive", art: "garcon/s1" }, { label: "Le garçon a cinq pains", art: "garcon/s3" }, { label: "Douze paniers de restes", art: "garcon/s5" }],
        show: [1, 2, 0],
        tries: ["Commence par le moment où tout le monde arrive.", "Tu as trouvé le début. Et ensuite, qui avait un petit repas ?", "Il ne reste qu'une image !"],
        clue: "Commence par la foule, finis par les restes.",
        explain: "D'abord la foule arrive, puis on trouve le garçon et ses cinq pains, et à la fin il reste douze paniers !", ref: "Jean 6.1-13" },
      { id: "q5", type: "choice", short: "Le petit don", prompt: "Que nous apprend cette histoire ?",
        options: ["Qu'il faut garder son repas pour soi", "Qu'un petit don peut servir à beaucoup", "Qu'il faut toujours avoir faim"], correct: 1,
        hints: { "0": "Au contraire ! Pense à ce que Jésus a fait avec ce repas.", "2": "Ce n'est pas ça. Pense à tous ceux qui ont mangé." },
        clue: "Le repas était petit, mais regarde combien de gens ont mangé !",
        explain: "Le garçon avait peu, mais Jésus a nourri des milliers de personnes avec. Un petit don peut faire beaucoup.", ref: "Jean 6.9-13" }
    ],
    card: { text: "Ses cinq pains et deux poissons ont servi à nourrir une foule.", art: "garcon/card", alt: "Un jeune garçon tient un panier de pains et de poissons" },
    teaser: { text: "J'avais apporté mon petit repas pour aller écouter Jésus. Ce jour-là, il a servi à nourrir une foule entière ! Qui suis-je ?", art: "garcon/teaser" }
  }
};

export const ZACHEE: LevelDef = {
  id: "zachee", worldId: "m2", position: 7,
  content: {
    title: "Zachée", value: "Pardon", source: "Luc 19.1-10", sourceNote: note("Luc 19.1-10"),
    mystery: {
      intro: "Une page s'est effacée dans la ville de Jéricho. Quelqu'un se cache… peut-être en hauteur ?",
      clues: [
        "J'étais le chef des collecteurs d'impôts, et j'étais très riche.",
        "J'étais petit, alors je suis monté dans un arbre pour voir Jésus.",
        "Jésus m'a dit : « Aujourd'hui, je dois aller chez toi ! »"
      ],
      guess: { options: ["David", "Zachée", "Noé"], correct: 1, hints: {
        "0": "Ce n'est pas David. Lui aussi était petit, mais il a affronté un géant !",
        "2": "Ce n'est pas Noé. Lui, il a construit un bateau !" } },
      art: "zachee/mystery"
    },
    puzzle: { art: "zachee/puzzle", alt: "Zachée est assis dans les branches d'un grand arbre. Jésus, en bas, lève les yeux vers lui. La foule regarde.",
      reveal: "Zachée est monté dans un arbre pour voir Jésus, et sa vie a changé." },
    story: [
      { title: "Un homme riche et mal aimé", ref: "Luc 19.1-2", art: "zachee/s1",
        text: "À Jéricho vivait Zachée, le chef des collecteurs d'impôts. Il était très riche. Les gens ne l'aimaient pas, car il leur prenait souvent trop d'argent.",
        alt: "Zachée, assis à sa table, compte des pièces d'or. Des gens mécontents le regardent." },
      { title: "Grimpé dans un arbre", ref: "Luc 19.3-4", art: "zachee/s2",
        text: "Zachée voulait voir Jésus, mais il était petit et la foule était trop grande. Alors il courut en avant et grimpa dans un sycomore.",
        alt: "Zachée grimpe dans un grand arbre, au-dessus de la foule." },
      { title: "Zachée, descends vite !", ref: "Luc 19.5-7", art: "zachee/s3",
        text: "Arrivé sous l'arbre, Jésus leva les yeux : « Zachée, descends vite, aujourd'hui je dois aller chez toi. » Zachée descendit, tout joyeux. Mais les gens murmuraient.",
        alt: "Jésus lève les yeux vers Zachée, assis dans les branches." },
      { title: "Un cœur changé", ref: "Luc 19.8", art: "zachee/s4",
        text: "Zachée dit à Jésus : « Je donne la moitié de mes biens aux pauvres. Et si j'ai pris trop à quelqu'un, je lui rends quatre fois plus. »",
        alt: "Zachée, heureux, donne des pièces à une dame pauvre et à son enfant." },
      { title: "Jésus est venu chercher", ref: "Luc 19.9-10", art: "zachee/s5",
        text: "Jésus dit : « Aujourd'hui, le salut est entré dans cette maison. Je suis venu chercher et sauver ceux qui étaient perdus. »",
        alt: "Jésus et Zachée partagent un repas dans la maison de Zachée." }
    ],
    lesson: { text: "Jésus a accueilli Zachée tel qu'il était. Son amour et son pardon ont changé son cœur.", ref: "Luc 19.10" },
    quiz: [
      { id: "q1", type: "choice", short: "L'arbre", prompt: "Pourquoi Zachée est-il monté dans un arbre ?",
        options: ["Pour cueillir des fruits", "Pour voir Jésus par-dessus la foule", "Pour se cacher des gens"], correct: 1,
        hints: { "0": "Il n'avait pas faim ! Il voulait voir quelqu'un.", "2": "Il ne se cachait pas. Il était petit et voulait voir…" },
        clue: "Il était petit, et la foule était grande.",
        explain: "Zachée était petit : il est monté dans un sycomore pour voir Jésus passer.", ref: "Luc 19.3-4" },
      { id: "q2", type: "choice", short: "L'invitation", prompt: "Qu'a dit Jésus à Zachée ?",
        options: ["« Descends vite, je viens chez toi ! »", "« Reste dans ton arbre ! »", "« Va-t'en, Zachée ! »"], correct: 0,
        hints: { "1": "Non ! Jésus voulait passer du temps avec lui.", "2": "Jésus n'a pas rejeté Zachée. Au contraire !" },
        clue: "Jésus voulait aller dans la maison de Zachée.",
        explain: "Jésus a dit : « Zachée, descends vite, aujourd'hui je dois aller chez toi. »", ref: "Luc 19.5" },
      { id: "q3", type: "choice", short: "Le changement", prompt: "Qu'a décidé Zachée après la visite de Jésus ?",
        options: ["De quitter Jéricho", "De garder tout son argent", "De donner aux pauvres et de rendre ce qu'il avait pris"], correct: 2,
        hints: { "0": "Il n'est pas parti. C'est son cœur qui a changé.", "1": "Au contraire ! Son cœur a changé." },
        clue: "Il a pensé aux pauvres et aux gens à qui il avait fait du tort.",
        explain: "Zachée a donné la moitié de ses biens aux pauvres et a rendu quatre fois plus à ceux qu'il avait trompés.", ref: "Luc 19.8" },
      { id: "q4", type: "order", short: "L'ordre", prompt: "Remets l'histoire dans l'ordre. Touche d'abord ce qui s'est passé en premier.",
        items: [{ label: "Zachée monte dans l'arbre", art: "zachee/s2" }, { label: "Jésus l'appelle", art: "zachee/s3" }, { label: "Zachée donne aux pauvres", art: "zachee/s4" }],
        show: [2, 0, 1],
        tries: ["Commence par le moment où Zachée voulait voir Jésus.", "Tu as trouvé le début. Que s'est-il passé quand Jésus est arrivé sous l'arbre ?", "Il ne reste qu'une image !"],
        clue: "L'arbre, l'appel de Jésus, puis le grand changement.",
        explain: "D'abord Zachée monte dans l'arbre, puis Jésus l'appelle et va chez lui, et enfin Zachée décide de donner et de rendre.", ref: "Luc 19.1-10" },
      { id: "q5", type: "choice", short: "Pourquoi Jésus est venu", prompt: "Pourquoi Jésus est-il venu, d'après ce qu'il a dit ?",
        options: ["Pour devenir riche", "Pour chercher et sauver ceux qui étaient perdus", "Pour punir Zachée"], correct: 1,
        hints: { "0": "Jésus ne cherchait pas l'argent.", "2": "Jésus n'est pas venu punir Zachée, mais l'accueillir." },
        clue: "Relis la dernière page de l'histoire.",
        explain: "Jésus a dit qu'il était venu chercher et sauver ceux qui étaient perdus.", ref: "Luc 19.10" }
    ],
    card: { text: "Jésus l'a accueilli, et son cœur a changé.", art: "zachee/card", alt: "Zachée, souriant, assis dans les branches d'un arbre" },
    teaser: { text: "J'étais tout petit, alors je suis monté dans un arbre pour voir passer Jésus. Qui suis-je ?", art: "zachee/teaser" }
  }
};

export const SAMARITAIN: LevelDef = {
  id: "samaritain", worldId: "m2", position: 8,
  content: {
    title: "Le bon Samaritain", value: "Amour du prochain", source: "Luc 10.25-37",
    sourceNote: note("Luc 10.25-37", "Cette histoire est une parabole : Jésus l'a racontée pour expliquer qui est notre prochain."),
    mystery: {
      intro: "Une page s'est effacée sur une longue route de montagne. Qui se cache dedans ?",
      clues: [
        "Je voyageais sur la route qui descend vers Jéricho.",
        "J'ai vu un homme blessé au bord du chemin, et je me suis arrêté.",
        "Je l'ai soigné, puis je l'ai emmené dans une hôtellerie."
      ],
      guess: { options: ["Le bon Samaritain", "Moïse", "Zachée"], correct: 0, hints: {
        "1": "Ce n'est pas Moïse. Lui, il a traversé la mer avec le peuple de Dieu.",
        "2": "Ce n'est pas Zachée. Lui, il est monté dans un arbre pour voir Jésus." } },
      art: "samaritain/mystery"
    },
    puzzle: { art: "samaritain/puzzle", alt: "Sur une route de montagne, un Samaritain met un pansement à un homme blessé. Sa monture attend près de lui.",
      reveal: "Le bon Samaritain s'est arrêté pour aider l'homme blessé." },
    story: [
      { title: "Qui est mon prochain ?", ref: "Luc 10.25-29", art: "samaritain/s1",
        text: "Un maître de la loi dit à Jésus : « Il faut aimer son prochain. Mais qui est mon prochain ? » Pour lui répondre, Jésus raconta une histoire.",
        alt: "Jésus parle avec un maître de la loi, devant un groupe de gens." },
      { title: "Un homme blessé", ref: "Luc 10.30", art: "samaritain/s2",
        text: "Un homme descendait de Jérusalem à Jéricho. Des brigands l'attaquèrent, prirent ses affaires et le laissèrent blessé au bord du chemin.",
        alt: "Un homme blessé est allongé au bord d'une route, entre les rochers." },
      { title: "Ils passent leur chemin", ref: "Luc 10.31-32", art: "samaritain/s3",
        text: "Un prêtre passa par là. Il vit l'homme, mais il continua sa route. Un autre homme, un Lévite, fit pareil.",
        alt: "Un prêtre passe de l'autre côté de la route sans s'arrêter." },
      { title: "Un Samaritain s'arrête", ref: "Luc 10.33-35", art: "samaritain/s4",
        text: "Puis un Samaritain arriva. À cette époque, Juifs et Samaritains ne s'entendaient pas. Pourtant, il eut pitié : il soigna l'homme, l'emmena dans une hôtellerie et paya pour qu'on s'occupe de lui.",
        alt: "Le Samaritain conduit l'homme blessé, installé sur sa monture, jusqu'à l'hôtellerie." },
      { title: "Va, et fais de même", ref: "Luc 10.36-37", art: "samaritain/s5",
        text: "Jésus demanda : « Lequel a été le prochain de l'homme blessé ? » Le maître de la loi répondit : « Celui qui a eu pitié de lui. » Jésus dit : « Va, et toi, fais de même. »",
        alt: "Jésus sourit et montre le chemin au maître de la loi." }
    ],
    lesson: { text: "Mon prochain, c'est toute personne qui a besoin d'aide, même si elle est différente de moi.", ref: "Luc 10.37" },
    quiz: [
      { id: "q1", type: "choice", short: "Le conteur", prompt: "Qui a raconté l'histoire du bon Samaritain ?",
        options: ["Moïse", "Jésus", "David"], correct: 1,
        hints: { "0": "Moïse a vécu bien avant. Cette histoire est dans le Nouveau Testament.", "2": "Pas David. C'est quelqu'un qui répondait à une question sur le prochain." },
        clue: "Il répondait à la question d'un maître de la loi.",
        explain: "C'est Jésus qui a raconté cette histoire, pour expliquer qui est notre prochain.", ref: "Luc 10.29-30" },
      { id: "q2", type: "choice", short: "Ceux qui passent", prompt: "Qu'ont fait le prêtre et le Lévite en voyant l'homme blessé ?",
        options: ["Ils ont continué leur route", "Ils l'ont soigné", "Ils ont appelé à l'aide"], correct: 0,
        hints: { "1": "Non, ce ne sont pas eux qui l'ont soigné !", "2": "Ils n'ont appelé personne. Ils sont passés…" },
        clue: "Ils l'ont vu… et ils sont passés de l'autre côté.",
        explain: "Le prêtre et le Lévite ont vu l'homme blessé, mais ils ont continué leur chemin.", ref: "Luc 10.31-32" },
      { id: "q3", type: "choice", short: "Le Samaritain", prompt: "Qu'a fait le Samaritain ?",
        options: ["Il a pris les affaires de l'homme", "Il a eu peur et s'est enfui", "Il a soigné l'homme et pris soin de lui"], correct: 2,
        hints: { "0": "Ça, ce sont les brigands qui l'avaient fait !", "1": "Non, il n'a pas fui. Il s'est approché." },
        clue: "Il s'est approché, et il a eu pitié.",
        explain: "Le Samaritain a soigné l'homme, l'a emmené dans une hôtellerie et a payé pour qu'on s'occupe de lui.", ref: "Luc 10.33-35" },
      { id: "q4", type: "order", short: "L'ordre", prompt: "Remets l'histoire dans l'ordre. Touche d'abord ce qui s'est passé en premier.",
        items: [{ label: "L'homme est blessé", art: "samaritain/s2" }, { label: "Le prêtre passe son chemin", art: "samaritain/s3" }, { label: "Le Samaritain l'aide", art: "samaritain/s4" }],
        show: [2, 0, 1],
        tries: ["Commence par ce qui est arrivé à l'homme sur la route.", "Tu as trouvé le début. Qui est passé en premier ?", "Il ne reste qu'une image !"],
        clue: "L'attaque, ceux qui passent, puis celui qui s'arrête.",
        explain: "D'abord l'homme est attaqué, puis le prêtre passe son chemin, et enfin le Samaritain s'arrête pour le soigner.", ref: "Luc 10.30-35" },
      { id: "q5", type: "choice", short: "Le prochain", prompt: "Qui est mon prochain ?",
        options: ["Seulement mes amis", "Toute personne qui a besoin d'aide", "Seulement les gens de mon pays"], correct: 1,
        hints: { "0": "Plus que ça ! Le Samaritain a aidé quelqu'un qu'il ne connaissait pas.", "2": "Le Samaritain a aidé un homme qui n'était pas de son peuple !" },
        clue: "Le Samaritain a aidé un inconnu, différent de lui.",
        explain: "Mon prochain, c'est toute personne qui a besoin d'aide. Jésus a dit : « Va, et toi, fais de même. »", ref: "Luc 10.36-37" }
    ],
    card: { text: "Dans l'histoire racontée par Jésus, il a pris soin d'un inconnu blessé.", art: "samaritain/card", alt: "Le bon Samaritain tient une bande de tissu pour soigner" },
    teaser: { text: "Sur la route, j'ai vu un homme blessé que les autres laissaient. Je me suis arrêté pour l'aider. Qui suis-je ?", art: "samaritain/teaser" }
  }
};
