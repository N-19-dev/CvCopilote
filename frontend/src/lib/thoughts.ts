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
    category: "Retour d’essai",
    status: "Testé sur mon projet",
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
    category: "Hands-on",
    status: "Tested on my project",
    read: "Read the note",
    minutes: "2 min read",
    footer: "No editorial calendar. Just things I feel like sharing.",
    disclosure: "Based on my notes, shaped with help from AI.",
  },
} as const;
// Installation commands verified against https://github.com/latent-spaces/brag.
export const bragInstall = "/plugin marketplace add latent-spaces/brag\n/plugin install brag@brag";
export const brag = {
  fr: {
    slug: "brag-videos-projets",
    title: "J’ai testé Brag : une commande, puis trois vidéos",
    excerpt: "Un /brag sans brief, puis deux demandes toutes simples. Voilà les trois vidéos obtenues à partir de mon projet dans Claude Code.",
    paragraphs: [
      "Quand j’ai publié cette note, Brag était encore dans ma liste des choses à essayer. Depuis, je l’ai installé dans Claude Code et je l’ai testé sur mon projet. Cette fois, j’ai des vidéos à montrer.",
      "Ce qui m’intéressait, c’est qu’il travaille depuis le projet ouvert dans Claude Code. Il peut s’appuyer sur les fichiers et le contexte du dépôt pour comprendre ce que je construis. Je n’ai pas eu à lui réexpliquer tout le projet dans un brief vidéo.",
    ],
    installationTitle: "L’installation dans Claude Code",
    installation: "J’ai ajouté le plugin, puis lancé /brag dans mon projet. Voici les commandes d’installation indiquées par le dépôt Brag :",
    trials: [
      {
        title: "01 — Juste /brag",
        prompt: "/brag",
        description: "Pour le premier essai, j’ai simplement lancé la commande. Aucun prompt supplémentaire, aucun scénario à rédiger : Brag a produit une première vidéo tout seul à partir du contexte du projet.",
        file: "brag-vertical.mp4",
        caption: "La première vidéo, sans brief supplémentaire.",
      },
      {
        title: "02 — Une version cinématique",
        prompt: "Fais cinématique.",
        description: "Ensuite, j’ai demandé une version cinématique. Une consigne très courte pour changer la direction de la vidéo. Voilà le résultat.",
        file: "brag-cinematic-vertical.mp4",
        caption: "La version obtenue après la demande de style cinématique.",
      },
      {
        title: "03 — Une version avec des personnages",
        prompt: "Fais une vidéo avec des personnages interactifs.",
        description: "Pour la troisième, j’ai demandé quelque chose avec des personnages interactifs. Voici la version illustrée obtenue. Ce sont les mots de ma demande : le résultat reste une vidéo à regarder.",
        file: "brag-illustre-vertical.mp4",
        caption: "La version illustrée, après la demande de personnages.",
      },
    ],
    promptNote: "Les deux demandes ci-dessous sont reformulées de mémoire, comme je les ai racontées après le test.",
    conclusionTitle: "Ce que je retiens de ce premier essai",
    conclusion: "Une commande pour partir du projet, puis deux consignes courtes pour explorer d’autres directions : c’est surtout cette simplicité qui m’a marqué. Je me demandais si Brag pouvait m’aider à présenter mes projets. Maintenant, j’ai trois résultats concrets à comparer. Franchement, je suis très surpris par ce qu’il a fait : ça rend vraiment bien, surtout avec aussi peu de consignes.",
    costTitle: "Et côté consommation ?",
    cost: "J’ai fait ce test avec Opus 5.5 : /brag passe alors automatiquement sur /brag-slim, comme l’indique la documentation du plugin. Pour la première vidéo, le coût affiché était d’environ 2 $. Mais avec mon abonnement à 20 $, je préfère parler de la part de quota utilisée : j’ai constaté environ 5 % de consommation pour cette première génération. À mes yeux, c’est vraiment peu pour ce résultat. Les 2 $ correspondent au coût affiché, pas à une somme payée en plus de mon abonnement.",
    download: "Ouvrir la vidéo",
    source: "Le dépôt et les commandes d’installation",
    next: "Une réaction, une piste à partager ?",
    contact: "On en parle sur LinkedIn",
  },
  en: {
    slug: "brag-project-videos",
    title: "I tried Brag: one command, then three videos",
    excerpt: "One /brag without a brief, then two simple requests. Here are the three videos generated from my project in Claude Code.",
    paragraphs: [
      "When I first published this note, Brag was still on my list of things to try. Since then, I’ve installed it in Claude Code and tested it on my project. This time, I have videos to show.",
      "What interested me was that it works from the project open in Claude Code. It can use the repository’s files and context to understand what I’m building. I didn’t have to explain the entire project again in a video brief.",
    ],
    installationTitle: "Installing it in Claude Code",
    installation: "I added the plugin, then ran /brag inside my project. These are the installation commands documented in the Brag repository:",
    trials: [
      {
        title: "01 — Just /brag",
        prompt: "/brag",
        description: "For the first attempt, I simply ran the command. No extra prompt, no script to write: Brag produced a first video on its own, using the project’s context.",
        file: "brag-vertical.mp4",
        caption: "The first video, with no additional brief.",
      },
      {
        title: "02 — A cinematic version",
        prompt: "Make it cinematic.",
        description: "Next, I asked for a cinematic version. A very short instruction to change the video’s direction. Here’s the result.",
        file: "brag-cinematic-vertical.mp4",
        caption: "The result of asking for a cinematic style.",
      },
      {
        title: "03 — A version with characters",
        prompt: "Make a video with interactive characters.",
        description: "For the third one, I asked for something with interactive characters. Here is the illustrated version it produced. That was the wording of my request; the output is still a video to watch.",
        file: "brag-illustre-vertical.mp4",
        caption: "The illustrated version, after asking for characters.",
      },
    ],
    promptNote: "The two requests below are recalled from memory and translated from French, based on my account after the test.",
    conclusionTitle: "What I took away from this first test",
    conclusion: "One command to start from the project, then two short instructions to explore other directions: that simplicity is what stood out to me. I was wondering whether Brag could help me introduce my projects. Now I have three concrete results to compare. Honestly, I’m really surprised by what it made: it looks really good, especially given how little direction I provided.",
    costTitle: "What about usage?",
    cost: "I ran this test with Opus 5.5: /brag automatically switches to /brag-slim, as documented by the plugin. For the first video, the displayed cost was about $2. But with my $20 subscription, I find it more useful to talk about the share of my usage allowance: I observed around 5% usage for that first generation. To me, that’s very little for this result. The $2 was the displayed cost, not an extra payment on top of my subscription.",
    download: "Open video",
    source: "The repository and installation commands",
    next: "A thought or something I should look at?",
    contact: "Let’s talk on LinkedIn",
  },
} as const;
export function thoughtPath(locale: Locale, article = false) {
  return `/${locale}/${journal[locale].section}${article ? `/${brag[locale].slug}` : ""}`;
}
