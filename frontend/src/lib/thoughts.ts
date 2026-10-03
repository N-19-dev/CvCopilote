export type Locale = "fr" | "en";
export const journal = {
  fr: {
    section: "pensees",
    title: "Pensées en cours",
    subtitle: "Des idées qui passent. Certaines restent.",
    intro:
      "Des choses que je découvre, des questions que je me pose et des idées encore en chantier. Parfois je me trompe, parfois je change d’avis. Voilà où j’en suis.",
    home: "Le portfolio",
    back: "Toutes les pensées",
    category: "Trouvaille",
    status: "Pas encore testé",
    read: "Lire la note",
    minutes: "2 min de lecture",
    footer: "Pas de calendrier éditorial. Juste l’envie de partager.",
    disclosure: "À partir de mes notes, mis en forme avec l’aide de l’IA.",
  },
  en: {
    section: "thoughts",
    title: "Thoughts in progress",
    subtitle: "Passing ideas. Some stick around.",
    intro:
      "Things I discover, questions I’m asking and ideas I’m still working through. Sometimes I’m wrong. Sometimes I change my mind. This is where I am right now.",
    home: "Portfolio (in French)",
    back: "All thoughts",
    category: "Find",
    status: "Not tested yet",
    read: "Read the note",
    minutes: "2 min read",
    footer: "No editorial calendar. Just things I feel like sharing.",
    disclosure: "Based on my notes, shaped with help from AI.",
  },
} as const;
export const brag = {
  fr: {
    slug: "brag-videos-projets",
    title: "Brag : une piste pour présenter mes projets en vidéo",
    excerpt:
      "Un repo croisé en scrollant, une idée pour Kalé et une question : combien de tokens pour une vidéo qu’on a vraiment envie de partager ?",
    paragraphs: [
      "J’ai vu passer Brag, un outil qui propose de transformer un projet en petite vidéo de lancement. Ça m’a donné envie de regarder ce qu’on pourrait en faire côté marketing.",
      "Je n’ai pas encore pris le temps de le tester, mais je me demande si ça pourrait servir à préparer des petites pubs pour mes projets. Kalé, par exemple, serait un terrain d’essai intéressant.",
      "Ce que j’aimerais voir, c’est s’il arrive à faire comprendre l’intérêt du produit, au-delà d’une vidéo qui bouge bien. Est-ce que le message est juste ? Est-ce que j’aurais envie de partager le résultat tel quel, ou faudrait-il tout reprendre ?",
      "Et puis il y a une question qui m’intéresse tout autant : combien de tokens ça consomme ? Une première génération, c’est une chose. Les retouches jusqu’à obtenir quelque chose d’utilisable, c’en est une autre. J’aimerais mesurer les deux, avec le coût et le temps passé.",
      "Pour l’instant, je le garde dans les choses à essayer. L’idée me plaît ; reste à voir ce que ça donne sur un de mes vrais projets.",
    ],
    source: "Le repo à l’origine de cette note",
    next: "Une réaction, une piste à partager ?",
    contact: "On en parle sur LinkedIn",
  },
  en: {
    slug: "brag-project-videos",
    title: "Brag: a way to introduce my projects on video?",
    excerpt:
      "A repo I came across while scrolling, an idea for Kalé, and a question: how many tokens does it take to make a video I’d actually want to share?",
    paragraphs: [
      "I came across Brag, a tool that aims to turn a project into a short launch video. It got me thinking about what I could do with it from a marketing perspective.",
      "I haven’t had time to try it yet, but I’m wondering whether it could help me put together little ads for my projects. Kalé, for example, could be an interesting test case.",
      "What I’d like to see is whether it can get across why the product matters, beyond making a video with nice motion. Does it get the message right? Would I want to share the result as it is, or would I need to rework the whole thing?",
      "And there’s another question I’m just as curious about: how many tokens does it use? The first generation is one thing. All the revisions it takes to get something usable are another. I’d like to measure both, along with the cost and time spent.",
      "For now, it’s on my list of things to try. I like the idea; I still need to see what it does with one of my actual projects.",
    ],
    source: "The repo behind this note",
    next: "A thought or something I should look at?",
    contact: "Let’s talk on LinkedIn",
  },
} as const;
export function thoughtPath(locale: Locale, article = false) {
  return `/${locale}/${journal[locale].section}${article ? `/${brag[locale].slug}` : ""}`;
}
