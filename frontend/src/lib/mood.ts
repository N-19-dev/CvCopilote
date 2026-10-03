// Le "mood" de Mongoose suit l'heure locale du visiteur, pas celle de Nathan
// — c'est le glow et la légende qui vivent, pas une donnée serveur. Une seule
// courbe continue (cosinus, période 24h, pic à 2h) pilote `nightFactor`
// [0..1], consommée à la fois par le CSS (--mood-mix, glow cyan→ambre) et par
// le choix de légende, plutôt que des paliers discrets qui feraient "sauter"
// la couleur au changement d'heure pile.
export function nightFactor(date: Date): number {
  const t = date.getHours() + date.getMinutes() / 60;
  const rad = ((t - 2) / 24) * Math.PI * 2;
  return (Math.cos(rad) + 1) / 2;
}

type MoodBucket = {
  test: (h: number) => boolean;
  tag: string;
  captions: (hhmm: string) => string[];
};

const BUCKETS: MoodBucket[] = [
  {
    test: (h) => h >= 5 && h < 9,
    tag: "RÉVEIL",
    captions: (hhmm) => [
      `Il est ${hhmm}, premier café avalé, prêt à débugger.`,
      `Il est ${hhmm}, encore en train de me réveiller — posez une question facile d'abord.`,
    ],
  },
  {
    test: (h) => h >= 9 && h < 18,
    tag: "FOCUS",
    captions: (hhmm) => [
      `Il est ${hhmm}, en plein sprint — questions bienvenues.`,
      `Il est ${hhmm}, mode journée : réponses rapides et carrées.`,
    ],
  },
  {
    test: (h) => h >= 18 && h < 23,
    tag: "CROISIÈRE",
    captions: (hhmm) => [
      `Il est ${hhmm}, ça tourne encore, mode croisière.`,
      `Il est ${hhmm}, journée finie mais je reste allumé pour vous.`,
    ],
  },
  {
    test: (h) => h >= 23 || h < 2,
    tag: "NUIT",
    captions: (hhmm) => [
      `Il est ${hhmm}, je code en pyjama comme d'habitude.`,
      `Il est ${hhmm}, la maison dort, moi je scrolle encore.`,
    ],
  },
  {
    test: () => true,
    tag: "VEILLE",
    captions: (hhmm) => [
      `Il est ${hhmm}, seuls les vrais sont encore debout à cette heure.`,
      `Il est ${hhmm}, mode veille profonde — mais toujours réactif.`,
    ],
  },
];

export function currentMood(date: Date) {
  const hhmm = `${String(date.getHours()).padStart(2, "0")}h${String(date.getMinutes()).padStart(2, "0")}`;
  const bucket = BUCKETS.find((b) => b.test(date.getHours()))!;
  const options = bucket.captions(hhmm);
  const caption = options[date.getMinutes() % options.length];
  return { tag: bucket.tag, caption, night: nightFactor(date) };
}
