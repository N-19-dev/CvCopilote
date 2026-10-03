import Image from "next/image";

// Fixed design values: transcendental math may differ in the last decimal
// between JavaScriptCore and V8, producing different SSR style attributes.
const orchestraBarHeights = [
  25, 31.432, 48.182, 68.62, 84.657, 89.945, 82.391, 64.985, 44.616, 29.347,
  25.221, 33.872, 51.874, 72.103, 86.552, 89.502, 79.785, 61.248, 41.227,
  27.647, 25.883, 36.633, 55.643, 75.388, 88.052, 88.624, 76.877, 57.46, 38.059,
  26.353, 26.975, 39.68, 59.437, 78.428,
];

export function ProjectPrint({
  kind,
}: {
  kind: "kale" | "orchestra" | "datapeek";
}) {
  if (kind === "kale")
    return (
      <div className="reference-project project-kale">
        <div className="project-print-heading">
          <span>01 / APPLICATION PERSONNELLE</span>
          <strong>kalé.</strong>
          <p>
            Se retrouver.
            <br />
            Tout simplement.
          </p>
        </div>
        <div className="kale-screens">
          <Image
            src="/images/kale-agenda.png"
            loading="eager"
            alt="Capture de l’agenda de Kalé"
            width={1125}
            height={2436}
          />
          <Image
            src="/images/kale-slots.png"
            loading="eager"
            alt="Capture de la recherche de créneaux dans Kalé"
            width={1125}
            height={2436}
          />
        </div>
        <span className="print-caption">
          SWIFTUI · SUPABASE · UN PROJET QUE JE CONSTRUIS
        </span>
      </div>
    );
  if (kind === "orchestra")
    return (
      <div className="reference-project project-orchestra">
        <div className="project-print-heading">
          <span>02 / ORCHESTRATION D’AGENTS</span>
          <strong>orchestra</strong>
          <p>
            Une idée.
            <br />
            Plusieurs intelligences.
          </p>
        </div>
        <div className="orchestra-score" aria-hidden="true">
          {orchestraBarHeights.map((height, i) => (
            <i key={i} style={{ height: `${height}%` }} />
          ))}
        </div>
        <div className="orchestra-steps">
          <span>01 Planifier</span>
          <span>02 Construire</span>
          <span>03 Transmettre</span>
        </div>
        <span className="print-caption">
          COMPOSITION PROVISOIRE · PROJET EN DÉVELOPPEMENT
        </span>
      </div>
    );
  return (
    <div className="reference-project project-data">
      <div className="project-print-heading">
        <span>03 / VEILLE TECH PERSONNELLE</span>
        <strong>data·peek</strong>
        <p>
          La veille tech,
          <br />
          une habitude au quotidien.
        </p>
      </div>
      <svg viewBox="0 0 500 400" aria-hidden="true">
        {Array.from({ length: 25 }, (_, i) => (
          <path
            key={i}
            d={`M-30 ${160 + i * 5} C180 ${-80 + i * 12} 240 ${500 - i * 9} 530 ${80 + i * 8}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
        ))}
      </svg>
      <span className="print-caption">
        ILLUSTRATION · LECTURES / QUIZ / PROGRESSION
      </span>
    </div>
  );
}
